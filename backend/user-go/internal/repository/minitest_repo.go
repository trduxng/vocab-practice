package repository

import (
	"context"
	"fmt"

	"github.com/vocab-practice/user-go/internal/model"
)

type MiniTestRepo struct {
	db *DB
}

func NewMiniTestRepo(db *DB) *MiniTestRepo {
	return &MiniTestRepo{db: db}
}

func (r *MiniTestRepo) GetMiniTests(ctx context.Context, page, pageSize int) (*model.PaginatedResponse[model.MiniTest], error) {
	offset := (page - 1) * pageSize

	var total int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM MiniTests WHERE IsPublished = 1`).Scan(&total)
	if err != nil {
		return nil, err
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT mt.MiniTestID, mt.TestTitle, mt.Description,
			t.TopicName, t.TopicCode, mt.TotalQuestions
		FROM MiniTests mt
		LEFT JOIN Topics t ON mt.TopicID = t.TopicID
		WHERE mt.IsPublished = 1
		ORDER BY mt.CreatedAt DESC
		OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY`, offset, pageSize)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tests []model.MiniTest
	for rows.Next() {
		var t model.MiniTest
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.TopicName, &t.TopicCode, &t.TotalQuestions); err != nil {
			return nil, fmt.Errorf("scan minitest: %w", err)
		}
		tests = append(tests, t)
	}

	totalPages := (total + pageSize - 1) / pageSize
	return &model.PaginatedResponse[model.MiniTest]{
		Data: tests, Total: total, Page: page,
		PageSize: pageSize, TotalPages: totalPages,
	}, nil
}

func (r *MiniTestRepo) GetMiniTestDetails(ctx context.Context, testID int64) ([]model.MiniTestQuestion, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT q.QuestionID, q.QuestionType, q.QuestionText, q.OptionsJson,
			q.CorrectAnswer, w.Term
		FROM MiniTests mt
		JOIN MiniTestItems mti ON mti.MiniTestID = mt.MiniTestID
		JOIN Questions q ON mti.QuestionID = q.QuestionID AND q.ContentStatus = N'Published'
		JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = N'Published'
		WHERE mt.MiniTestID = @p1 AND mt.IsPublished = 1
		ORDER BY mti.DisplayOrder`, testID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []model.MiniTestQuestion
	for rows.Next() {
		var q model.MiniTestQuestion
		if err := rows.Scan(&q.QuestionID, &q.QuestionType, &q.QuestionText, &q.OptionsJson, &q.CorrectAnswer, &q.Term); err != nil {
			return nil, fmt.Errorf("scan question: %w", err)
		}
		questions = append(questions, q)
	}
	return questions, rows.Err()
}

func (r *MiniTestRepo) GetTestHistory(ctx context.Context, userID int64, page, pageSize int) (*model.PaginatedResponse[model.TestHistoryItem], error) {
	offset := (page - 1) * pageSize

	var total int
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(DISTINCT CAST(ea.AttemptedAt AS DATE) + CAST(mt.MiniTestID AS NVARCHAR))
		FROM ExerciseAttempts ea
		JOIN Questions q ON ea.QuestionID = q.QuestionID
		JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
		JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID
		WHERE ea.UserID = @p1`, userID).Scan(&total)
	if err != nil {
		return nil, err
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT CAST(ea.AttemptedAt AS DATE) AS date, mt.MiniTestID, mt.TestTitle,
			COUNT(*) AS totalQuestions,
			SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) AS correctAnswers
		FROM ExerciseAttempts ea
		JOIN Questions q ON ea.QuestionID = q.QuestionID
		JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
		JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID
		WHERE ea.UserID = @p1
		GROUP BY CAST(ea.AttemptedAt AS DATE), mt.TestTitle, mt.MiniTestID
		ORDER BY date DESC
		OFFSET @p2 ROWS FETCH NEXT @p3 ROWS ONLY`, userID, offset, pageSize)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []model.TestHistoryItem
	for rows.Next() {
		var h model.TestHistoryItem
		if err := rows.Scan(&h.Date, &h.TestID, &h.TestTitle, &h.TotalQuestions, &h.CorrectAnswers); err != nil {
			return nil, fmt.Errorf("scan history: %w", err)
		}
		history = append(history, h)
	}

	totalPages := (total + pageSize - 1) / pageSize
	return &model.PaginatedResponse[model.TestHistoryItem]{
		Data: history, Total: total, Page: page,
		PageSize: pageSize, TotalPages: totalPages,
	}, nil
}

func (r *MiniTestRepo) GetSessionDetails(ctx context.Context, userID, testID int64, date string) ([]model.TestSessionDetail, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT q.QuestionText, q.QuestionType, q.OptionsJson, q.CorrectAnswer,
			ea.SubmittedAnswer, ea.IsCorrect, w.Term, w.Meaning
		FROM ExerciseAttempts ea
		JOIN Questions q ON ea.QuestionID = q.QuestionID
		JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
		JOIN Words w ON q.WordID = w.WordID
		WHERE ea.UserID = @p1 AND mti.MiniTestID = @p2 AND CAST(ea.AttemptedAt AS DATE) = @p3`,
		userID, testID, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var details []model.TestSessionDetail
	for rows.Next() {
		var d model.TestSessionDetail
		if err := rows.Scan(&d.QuestionText, &d.QuestionType, &d.OptionsJson,
			&d.CorrectAnswer, &d.SubmittedAnswer, &d.IsCorrect, &d.Term, &d.Meaning); err != nil {
			return nil, fmt.Errorf("scan detail: %w", err)
		}
		details = append(details, d)
	}
	return details, rows.Err()
}

func (r *MiniTestRepo) CheckTestPublished(ctx context.Context, testID int64) (bool, error) {
	var published bool
	err := r.db.QueryRowContext(ctx,
		`SELECT IsPublished FROM MiniTests WHERE MiniTestID = @p1`, testID).Scan(&published)
	return published, err
}

func (r *MiniTestRepo) GetTestQuestions(ctx context.Context, testID int64) ([]QuestionWithWord, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT q.QuestionID, q.WordID, q.CorrectAnswer
		FROM MiniTestItems mti
		JOIN Questions q ON q.QuestionID = mti.QuestionID AND q.ContentStatus = N'Published'
		WHERE mti.MiniTestID = @p1`, testID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []QuestionWithWord
	for rows.Next() {
		var q QuestionWithWord
		if err := rows.Scan(&q.QuestionID, &q.WordID, &q.CorrectAnswer); err != nil {
			return nil, err
		}
		questions = append(questions, q)
	}
	return questions, rows.Err()
}

type QuestionWithWord struct {
	QuestionID   int64
	WordID       *int64
	CorrectAnswer string
}

func (r *MiniTestRepo) CheckDuplicateAttempt(ctx context.Context, userID, testID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM MiniTestAttempts
		 WHERE MiniTestID = @p1 AND UserID = @p2 AND SubmittedAt IS NOT NULL`,
		testID, userID).Scan(&count)
	return count > 0, err
}

func (r *MiniTestRepo) InsertMiniTestAttempt(ctx context.Context, userID, testID int64, total, correct int, score float64) (int64, error) {
	var id int64
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO MiniTestAttempts (MiniTestID, UserID, StartedAt, SubmittedAt, TotalQuestions, CorrectCount, Score)
		OUTPUT inserted.MiniTestAttemptID
		VALUES (@p1, @p2, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), @p3, @p4, @p5)`,
		testID, userID, total, correct, score).Scan(&id)
	return id, err
}
