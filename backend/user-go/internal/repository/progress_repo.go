package repository

import (
	"context"
	"fmt"

	"github.com/vocab-practice/user-go/internal/model"
)

type ProgressRepo struct {
	db *DB
}

func (p *ProgressRepo) GetDB() *DB {
	return p.db
}

func NewProgressRepo(db *DB) *ProgressRepo {
	return &ProgressRepo{db: db}
}

func (r *ProgressRepo) GetActivityHeatmap(ctx context.Context, userID int64, year int) ([]model.ActivityDay, error) {
	query := `
		WITH DailyAttempts AS (
			SELECT CAST(AttemptedAt AS DATE) AS date, COUNT(*) AS count
			FROM ExerciseAttempts WHERE UserID = @p1 AND YEAR(AttemptedAt) = @p2
			GROUP BY CAST(AttemptedAt AS DATE)
		),
		DailyXP AS (
			SELECT CAST(CreatedAt AS DATE) AS date, SUM(XPAmount) AS xpEarned
			FROM dbo.UserXPEvents WHERE UserID = @p1 AND YEAR(CreatedAt) = @p2
			GROUP BY CAST(CreatedAt AS DATE)
		)
		SELECT COALESCE(a.date, x.date) AS date,
			ISNULL(a.count, 0) AS activityCount,
			ISNULL(x.xpEarned, 0) AS xpEarned
		FROM DailyAttempts a FULL OUTER JOIN DailyXP x ON x.date = a.date
		ORDER BY date`

	rows, err := r.db.QueryContext(ctx, query, userID, year)
	if err != nil {
		return nil, fmt.Errorf("query activity heatmap: %w", err)
	}
	defer rows.Close()

	var items []model.ActivityDay
	for rows.Next() {
		var item model.ActivityDay
		if err := rows.Scan(&item.Date, &item.ActivityCount, &item.XPEarned); err != nil {
			return nil, fmt.Errorf("scan activity: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *ProgressRepo) GetProgressAnalytics(ctx context.Context, userID int64) ([]model.ActivityDay, []model.VocabularyGrowthPoint, []model.TopicMasteryProgress, *model.RetentionStats, error) {
	// Activity (365 days)
	activityQuery := `
		WITH DateSeries AS (
			SELECT DATEADD(day, -364, CAST(SYSDATETIMEOFFSET() AS DATE)) AS ActivityDate
			UNION ALL SELECT DATEADD(day, 1, ActivityDate)
			FROM DateSeries WHERE ActivityDate < CAST(SYSDATETIMEOFFSET() AS DATE)
		)
		SELECT CONVERT(CHAR(10), d.ActivityDate, 23) AS date,
			ISNULL(a.ActivityCount, 0) AS activityCount,
			ISNULL(r.XPEarned, 0) AS xpEarned
		FROM DateSeries d
		LEFT JOIN (SELECT CAST(AttemptedAt AS DATE) AS ActivityDate, COUNT(*) AS ActivityCount
			FROM ExerciseAttempts WHERE UserID = @p1 AND AttemptedAt >= DATEADD(day, -364, SYSDATETIMEOFFSET())
			GROUP BY CAST(AttemptedAt AS DATE)) a ON a.ActivityDate = d.ActivityDate
		LEFT JOIN (SELECT CAST(CreatedAt AS DATE) AS ActivityDate, SUM(XPAmount) AS XPEarned
			FROM UserXPEvents WHERE UserID = @p1 AND CreatedAt >= DATEADD(day, -364, SYSDATETIMEOFFSET())
			GROUP BY CAST(CreatedAt AS DATE)) r ON r.ActivityDate = d.ActivityDate
		ORDER BY d.ActivityDate OPTION (MAXRECURSION 400)`

	activityRows, err := r.db.QueryContext(ctx, activityQuery, userID)
	if err != nil {
		return nil, nil, nil, nil, fmt.Errorf("query activity: %w", err)
	}
	defer activityRows.Close()

	var activity []model.ActivityDay
	for activityRows.Next() {
		var a model.ActivityDay
		if err := activityRows.Scan(&a.Date, &a.ActivityCount, &a.XPEarned); err != nil {
			return nil, nil, nil, nil, fmt.Errorf("scan activity: %w", err)
		}
		activity = append(activity, a)
	}
	if err := activityRows.Err(); err != nil {
		return nil, nil, nil, nil, err
	}

	// Vocabulary growth (12 months)
	growthQuery := `
		WITH MonthOffsets AS (
			SELECT 11 AS v UNION ALL SELECT 10 UNION ALL SELECT 9 UNION ALL SELECT 8
			UNION ALL SELECT 7 UNION ALL SELECT 6 UNION ALL SELECT 5 UNION ALL SELECT 4
			UNION ALL SELECT 3 UNION ALL SELECT 2 UNION ALL SELECT 1 UNION ALL SELECT 0
		)
		SELECT CONVERT(CHAR(10), DATEADD(month, -v, DATEFROMPARTS(YEAR(SYSDATETIMEOFFSET()), MONTH(SYSDATETIMEOFFSET()), 1)), 23) AS date,
			SUM(CASE WHEN uwp.CreatedAt < DATEADD(month, 1, DATEADD(month, -v, DATEFROMPARTS(YEAR(SYSDATETIMEOFFSET()), MONTH(SYSDATETIMEOFFSET()), 1))) THEN 1 ELSE 0 END) AS learnedWords,
			SUM(CASE WHEN uwp.MasteryLevel >= 7 AND uwp.UpdatedAt < DATEADD(month, 1, DATEADD(month, -v, DATEFROMPARTS(YEAR(SYSDATETIMEOFFSET()), MONTH(SYSDATETIMEOFFSET()), 1))) THEN 1 ELSE 0 END) AS masteredWords
		FROM MonthOffsets mo
		LEFT JOIN UserWordProgress uwp ON uwp.UserID = @p1
		GROUP BY mo.v ORDER BY mo.v`

	growthRows, err := r.db.QueryContext(ctx, growthQuery, userID)
	if err != nil {
		return nil, nil, nil, nil, fmt.Errorf("query growth: %w", err)
	}
	defer growthRows.Close()

	var growth []model.VocabularyGrowthPoint
	for growthRows.Next() {
		var g model.VocabularyGrowthPoint
		if err := growthRows.Scan(&g.Date, &g.LearnedWords, &g.MasteredWords); err != nil {
			return nil, nil, nil, nil, fmt.Errorf("scan growth: %w", err)
		}
		growth = append(growth, g)
	}

	// Topic mastery
	topicQuery := `
		SELECT t.TopicID, t.TopicName,
			COUNT(DISTINCT wt.WordID) AS totalWords,
			COUNT(DISTINCT CASE WHEN uwp.RepetitionCount > 0 THEN wt.WordID END) AS learnedWords,
			COUNT(DISTINCT CASE WHEN uwp.MasteryLevel >= 7 THEN wt.WordID END) AS masteredWords,
			ISNULL(AVG(CAST(ISNULL(uwp.MasteryLevel, 0) AS DECIMAL(10,2))), 0) AS averageMastery
		FROM Topics t
		JOIN WordTopics wt ON wt.TopicID = t.TopicID
		LEFT JOIN UserWordProgress uwp ON uwp.WordID = wt.WordID AND uwp.UserID = @p1
		GROUP BY t.TopicID, t.TopicName
		ORDER BY averageMastery DESC, t.TopicName`

	topicRows, err := r.db.QueryContext(ctx, topicQuery, userID)
	if err != nil {
		return nil, nil, nil, nil, fmt.Errorf("query topics: %w", err)
	}
	defer topicRows.Close()

	var topics []model.TopicMasteryProgress
	for topicRows.Next() {
		var t model.TopicMasteryProgress
		if err := topicRows.Scan(&t.TopicID, &t.TopicName, &t.TotalWords, &t.LearnedWords, &t.MasteredWords, &t.AverageMastery); err != nil {
			return nil, nil, nil, nil, fmt.Errorf("scan topic: %w", err)
		}
		t.CompletionPct = int(t.AverageMastery / 10.0 * 100)
		topics = append(topics, t)
	}

	// Retention stats
	retentionQuery := `
		SELECT
			ISNULL((SELECT COUNT(*) FROM ExerciseAttempts WHERE UserID = @p1), 0) AS totalAnswers,
			ISNULL((SELECT SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) FROM ExerciseAttempts WHERE UserID = @p1), 0) AS correctAnswers,
			ISNULL((SELECT COUNT(*) FROM UserWordProgress WHERE UserID = @p1 AND RepetitionCount > 0), 0) AS learnedWords,
			ISNULL((SELECT COUNT(*) FROM UserWordProgress WHERE UserID = @p1 AND RepetitionCount > 0 AND MemoryStatus = N'Lapsed'), 0) AS forgottenWords,
			ISNULL((SELECT COUNT(*) FROM UserWordProgress WHERE UserID = @p1 AND RepetitionCount > 0 AND (NextReviewDate IS NULL OR NextReviewDate > SYSDATETIMEOFFSET())), 0) AS upToDateWords,
			ISNULL((SELECT COUNT(*) FROM UserWordProgress WHERE UserID = @p1 AND MasteryLevel >= 7), 0) AS masteredWords`

	retention := &model.RetentionStats{}
	err = r.db.QueryRowContext(ctx, retentionQuery, userID).Scan(
		&retention.TotalAnswers, &retention.CorrectAnswers, &retention.LearnedWords,
		&retention.ForgottenWords, &retention.UpToDateWords, &retention.MasteredWords,
	)
	if err != nil {
		return nil, nil, nil, nil, fmt.Errorf("query retention: %w", err)
	}

	return activity, growth, topics, retention, nil
}

func (r *ProgressRepo) GetUserStats(ctx context.Context, userID int64) (int, int, int, int, error) {
	var learned, correct, wrong, streak int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM UserWordProgress WHERE UserID = @p1 AND MasteryLevel >= 3`,
		userID).Scan(&learned)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	err = r.db.QueryRowContext(ctx,
		`SELECT ISNULL(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END), 0) AS correct,
				ISNULL(SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END), 0) AS wrong
		 FROM ExerciseAttempts WHERE UserID = @p1`, userID).Scan(&correct, &wrong)
	return learned, correct, wrong, streak, err
}

func (r *ProgressRepo) GetWeakWords(ctx context.Context, userID int64) ([]model.WeakWord, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT TOP 5 w.Term, w.Meaning
		 FROM UserWordProgress uwp JOIN Words w ON uwp.WordID = w.WordID
		 WHERE uwp.UserID = @p1 AND (uwp.MemoryStatus = 'Lapsed' OR uwp.MasteryLevel < 3)
		 ORDER BY uwp.MasteryLevel ASC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var words []model.WeakWord
	for rows.Next() {
		var w model.WeakWord
		if err := rows.Scan(&w.Word, &w.Meaning); err != nil {
			return nil, err
		}
		words = append(words, w)
	}
	return words, rows.Err()
}

func (r *ProgressRepo) GetRecentAttempts(ctx context.Context, userID int64) ([]model.RecentAttempt, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT TOP 10 ea.SubmittedAnswer, ea.IsCorrect, ea.AttemptedAt, w.Term
		 FROM ExerciseAttempts ea JOIN Words w ON ea.WordID = w.WordID
		 WHERE ea.UserID = @p1 ORDER BY ea.AttemptedAt DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []model.RecentAttempt
	for rows.Next() {
		var a model.RecentAttempt
		if err := rows.Scan(&a.Answer, &a.IsCorrect, &a.Date, &a.Term); err != nil {
			return nil, err
		}
		attempts = append(attempts, a)
	}
	return attempts, rows.Err()
}

func (r *ProgressRepo) GetDailyTrends(ctx context.Context, userID int64) ([]model.DailyTrend, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT CAST(AttemptedAt AS DATE) AS date, COUNT(*) AS count
		 FROM ExerciseAttempts
		 WHERE UserID = @p1 AND AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET())
		 GROUP BY CAST(AttemptedAt AS DATE) ORDER BY date ASC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trends []model.DailyTrend
	for rows.Next() {
		var t model.DailyTrend
		if err := rows.Scan(&t.Day, &t.Count); err != nil {
			return nil, err
		}
		trends = append(trends, t)
	}
	return trends, rows.Err()
}
