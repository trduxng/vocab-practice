package repository

import (
	"context"

	"github.com/vocab-practice/user-go/internal/model"
)

type GamificationRepo struct {
	db *DB
}

func NewGamificationRepo(db *DB) *GamificationRepo {
	return &GamificationRepo{db: db}
}

func (r *GamificationRepo) EnsureSchema(ctx context.Context) error {
	// Check and create gamification tables if needed
	_, err := r.db.ExecContext(ctx, `
		IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserXPEvents')
		CREATE TABLE dbo.UserXPEvents (
			XPEventID BIGINT IDENTITY(1,1) PRIMARY KEY,
			UserID BIGINT NOT NULL,
			EventType NVARCHAR(50) NOT NULL,
			XPAmount INT NOT NULL,
			SourceKey NVARCHAR(200) NULL,
			Metadata NVARCHAR(MAX) NULL,
			CreatedAt DATETIMEOFFSET(7) DEFAULT SYSDATETIMEOFFSET()
		)`)
	return err
}

func (r *GamificationRepo) GetProfile(ctx context.Context, userID int64) (*model.GamificationProfile, error) {
	profile := &model.GamificationProfile{}

	err := r.db.QueryRowContext(ctx,
		`SELECT COALESCE(TotalXP, 0), COALESCE(CurrentLevel, 1),
				COALESCE(WordsLearned, 0), COALESCE(Streak, 0)
		 FROM Users WHERE UserID = @p1`, userID,
	).Scan(&profile.TotalXP, &profile.CurrentLevel, &profile.WordsLearned, &profile.Streak)
	if err != nil {
		return nil, err
	}

	// Today's XP
	r.db.QueryRowContext(ctx,
		`SELECT ISNULL(SUM(XPAmount), 0) FROM UserXPEvents
		 WHERE UserID = @p1 AND CAST(CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)`,
		userID).Scan(&profile.TodayXP)

	// Level thresholds
	xpForNextLevel := int64(profile.CurrentLevel) * 100
	profile.XpForNextLevel = xpForNextLevel
	profile.XpToNextLevel = xpForNextLevel - profile.TotalXP
	if xpForNextLevel > 0 {
		profile.LevelProgress = float64(profile.TotalXP) / float64(xpForNextLevel) * 100
	}

	return profile, nil
}

func (r *GamificationRepo) AwardXP(ctx context.Context, userID int64, event model.XPEvent) (int64, error) {
	// Check for duplicate
	if event.SourceKey != nil {
		var count int
		r.db.QueryRowContext(ctx,
			`SELECT COUNT(*) FROM UserXPEvents WHERE UserID = @p1 AND SourceKey = @p2`,
			userID, *event.SourceKey).Scan(&count)
		if count > 0 {
			return 0, nil
		}
	}

	result, err := r.db.ExecContext(ctx,
		`INSERT INTO UserXPEvents (UserID, EventType, XPAmount, SourceKey, Metadata, CreatedAt)
		 VALUES (@p1, @p2, @p3, @p4, @p5, SYSDATETIMEOFFSET())`,
		userID, event.EventType, event.XPAmount, event.SourceKey, event.Metadata)
	if err != nil {
		return 0, err
	}

	id, _ := result.LastInsertId()

	// Update user totals
	r.db.ExecContext(ctx,
		`UPDATE Users SET TotalXP = COALESCE(TotalXP, 0) + @p1,
			CurrentLevel = FLOOR((COALESCE(TotalXP, 0) + @p1) / 100) + 1,
			UpdatedAt = SYSDATETIMEOFFSET()
		 WHERE UserID = @p2`, event.XPAmount, userID)

	return id, nil
}

func (r *GamificationRepo) GetMetrics(ctx context.Context, userID int64) (totalXP int64, streak int, currentLevel int, err error) {
	err = r.db.QueryRowContext(ctx,
		`SELECT COALESCE(TotalXP, 0), COALESCE(Streak, 0), COALESCE(CurrentLevel, 1)
		 FROM Users WHERE UserID = @p1`, userID,
	).Scan(&totalXP, &streak, &currentLevel)
	return
}
