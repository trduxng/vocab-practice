package repository

import (
	"context"
	"database/sql"
)

type TimelineResult struct {
	TotalWords       int
	MasteredWords    int
	CompletionPct    float64
	AverageDailyRate float64
}

type AnalyticsRepo struct {
	db *DB
}

func NewAnalyticsRepo(db *DB) *AnalyticsRepo {
	return &AnalyticsRepo{db: db}
}

func (p *ProgressRepo) GetUserStatsForTimeline(ctx context.Context, userID int64) (*TimelineResult, error) {
	result := &TimelineResult{}

	err := p.db.QueryRowContext(ctx, `
		SELECT
			COUNT(*) AS totalWords,
			SUM(CASE WHEN MasteryLevel >= 7 THEN 1 ELSE 0 END) AS masteredWords,
			CAST(SUM(CASE WHEN MasteryLevel >= 7 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS completionPercentage
		FROM UserWordProgress
		WHERE UserID = ?`, userID).Scan(&result.TotalWords, &result.MasteredWords, &result.CompletionPct)

	if err == sql.ErrNoRows {
		return result, nil
	}

	// Calculate average daily learning rate from last 30 days
	p.db.QueryRowContext(ctx, `
		SELECT ISNULL(CAST(COUNT(*) * 1.0 / 30.0 AS DECIMAL(10,2)), 0)
		FROM ExerciseAttempts
		WHERE UserID = ? AND AttemptedAt >= DATEADD(day, -30, SYSDATETIMEOFFSET())`,
		userID).Scan(&result.AverageDailyRate)

	return result, err
}
