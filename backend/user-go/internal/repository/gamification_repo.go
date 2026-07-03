package repository

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/vocab-practice/user-go/internal/model"
)

// ---------- private helpers ----------

func (r *GamificationRepo) getStreak(ctx context.Context, userID int64) (int, error) {
	var streak int
	err := r.db.QueryRowContext(ctx, `
		WITH DailyActivity AS (
			SELECT DISTINCT CAST(CreatedAt AS DATE) AS ActivityDate
			FROM dbo.UserXPEvents
			WHERE UserID = ?
			  AND EventType IN (N'LearnWord', N'PracticeComplete', N'MiniTestComplete', N'DailyLogin')
			UNION
			SELECT DISTINCT CAST(AttemptedAt AS DATE) AS ActivityDate
			FROM dbo.ExerciseAttempts
			WHERE UserID = ?
		),
		RankedActivity AS (
			SELECT ActivityDate,
				   MAX(ActivityDate) OVER () AS LatestDate,
				   ROW_NUMBER() OVER (ORDER BY ActivityDate DESC) AS rowNumber
			FROM DailyActivity
		)
		SELECT ISNULL(COUNT(*), 0)
		FROM RankedActivity
		WHERE LatestDate >= DATEADD(day, -1, CAST(SYSDATETIMEOFFSET() AS DATE))
		  AND DATEDIFF(day, ActivityDate, LatestDate) = rowNumber - 1`,
		userID, userID).Scan(&streak)
	return streak, err
}

func (r *GamificationRepo) getWordsLearned(ctx context.Context, userID int64) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT ISNULL(COUNT(*), 0) FROM UserWordProgress WHERE UserID = ? AND RepetitionCount > 0`,
		userID).Scan(&count)
	return count, err
}

func (r *GamificationRepo) getBestTestScore(ctx context.Context, userID int64) (int, error) {
	var score int
	err := r.db.QueryRowContext(ctx,
		`SELECT ISNULL(MAX(Score), 0) FROM dbo.MiniTestAttempts WHERE UserID = ? AND SubmittedAt IS NOT NULL`,
		userID).Scan(&score)
	return score, err
}

// CheckAndAwardAchievements unlocks any achievements the user has earned
// but not yet received. Returns the newly unlocked achievements.
func (r *GamificationRepo) CheckAndAwardAchievements(ctx context.Context, userID int64) ([]model.Achievement, error) {
	wordsLearned, _ := r.getWordsLearned(ctx, userID)
	streak, _ := r.getStreak(ctx, userID)
	bestTestScore, _ := r.getBestTestScore(ctx, userID)

	var currentLevel int
	r.db.QueryRowContext(ctx,
		`SELECT COALESCE(CurrentLevel, 1) FROM Users WHERE UserID = ?`, userID,
	).Scan(&currentLevel)

	var toUnlock []model.Achievement
	err := r.db.SelectContext(ctx, &toUnlock, `
		SELECT a.AchievementID AS id, a.Code AS code, a.Name AS label,
			a.Description AS description, a.Icon AS icon, a.XPReward
		FROM dbo.Achievements a
		WHERE a.IsActive = 1
		  AND NOT EXISTS (
			SELECT 1 FROM dbo.UserAchievements ua
			WHERE ua.UserID = ? AND ua.AchievementID = a.AchievementID
		  )
		  AND (
			(a.CriteriaType = N'WORDS_LEARNED' AND ? >= a.CriteriaValue)
			OR (a.CriteriaType = N'STREAK_DAYS' AND ? >= a.CriteriaValue)
			OR (a.CriteriaType = N'TEST_SCORE' AND ? >= a.CriteriaValue)
			OR (a.CriteriaType = N'LEVEL' AND ? >= a.CriteriaValue)
		  )`,
		userID, wordsLearned, streak, bestTestScore, currentLevel)
	if err != nil {
		return nil, err
	}
	if len(toUnlock) == 0 {
		return nil, nil
	}

	for _, a := range toUnlock {
		r.db.ExecContext(ctx,
			`INSERT INTO dbo.UserAchievements (UserID, AchievementID) VALUES (?, ?)`,
			userID, a.ID)
	}

	for i := range toUnlock {
		toUnlock[i].Unlocked = true
		toUnlock[i].Seen = false
		now := time.Now().UTC().Format("2006-01-02T15:04:05Z")
		toUnlock[i].UnlockedAt = &now
	}
	return toUnlock, nil
}

type GamificationRepo struct {
	db *DB
}

func NewGamificationRepo(db *DB) *GamificationRepo {
	return &GamificationRepo{db: db}
}

func (r *GamificationRepo) EnsureSchema(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		IF COL_LENGTH(N'dbo.Users', N'TotalXP') IS NULL
		BEGIN
			ALTER TABLE dbo.Users
				ADD TotalXP INT NOT NULL CONSTRAINT DF_Users_TotalXP DEFAULT (0);
		END;

		IF COL_LENGTH(N'dbo.Users', N'CurrentLevel') IS NULL
		BEGIN
			ALTER TABLE dbo.Users
				ADD CurrentLevel INT NOT NULL CONSTRAINT DF_Users_CurrentLevel DEFAULT (1);
		END;

		IF OBJECT_ID(N'dbo.UserXPEvents', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.UserXPEvents (
				XPEventID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserXPEvents PRIMARY KEY,
				UserID BIGINT NOT NULL CONSTRAINT FK_UserXPEvents_UserID REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
				EventType NVARCHAR(50) NOT NULL,
				XPAmount INT NOT NULL CONSTRAINT CK_UserXPEvents_XPAmount CHECK (XPAmount > 0),
				SourceKey NVARCHAR(200) NULL,
				MetadataJson NVARCHAR(MAX) NULL,
				CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserXPEvents_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
				CONSTRAINT CK_UserXPEvents_MetadataJson CHECK (MetadataJson IS NULL OR ISJSON(MetadataJson) = 1)
			);
		END;

		IF NOT EXISTS (
			SELECT 1 FROM sys.indexes
			WHERE name = N'UX_UserXPEvents_User_Event_Source'
			  AND object_id = OBJECT_ID(N'dbo.UserXPEvents')
		)
		BEGIN
			CREATE UNIQUE INDEX UX_UserXPEvents_User_Event_Source
			ON dbo.UserXPEvents(UserID, EventType, SourceKey)
			WHERE SourceKey IS NOT NULL;
		END;

		IF NOT EXISTS (
			SELECT 1 FROM sys.indexes
			WHERE name = N'IX_UserXPEvents_UserID_CreatedAt'
			  AND object_id = OBJECT_ID(N'dbo.UserXPEvents')
		)
		BEGIN
			CREATE INDEX IX_UserXPEvents_UserID_CreatedAt
			ON dbo.UserXPEvents(UserID, CreatedAt DESC)
			INCLUDE (EventType, XPAmount);
		END;

		IF OBJECT_ID(N'dbo.Achievements', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.Achievements (
				AchievementID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Achievements PRIMARY KEY,
				Code NVARCHAR(80) NOT NULL CONSTRAINT UQ_Achievements_Code UNIQUE,
				Name NVARCHAR(200) NOT NULL,
				Description NVARCHAR(500) NOT NULL,
				Icon NVARCHAR(20) NOT NULL,
				CriteriaType NVARCHAR(50) NOT NULL,
				CriteriaValue INT NOT NULL,
				DisplayOrder INT NOT NULL,
				XPReward INT NOT NULL,
				IsActive BIT NOT NULL CONSTRAINT DF_Achievements_IsActive DEFAULT (1),
				CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Achievements_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
				UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Achievements_UpdatedAt DEFAULT (SYSDATETIMEOFFSET())
			);
		END;

		IF OBJECT_ID(N'dbo.UserAchievements', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.UserAchievements (
				UserAchievementID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserAchievements PRIMARY KEY,
				UserID BIGINT NOT NULL CONSTRAINT FK_UserAchievements_UserID REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
				AchievementID INT NOT NULL CONSTRAINT FK_UserAchievements_AchievementID REFERENCES dbo.Achievements(AchievementID),
				AchievedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserAchievements_AchievedAt DEFAULT (SYSDATETIMEOFFSET()),
				SeenAt DATETIMEOFFSET(7) NULL,
				CONSTRAINT UQ_UserAchievements_User_Achievement UNIQUE (UserID, AchievementID)
			);
		END
		ELSE
		BEGIN
			IF COL_LENGTH('dbo.UserAchievements', 'SeenAt') IS NULL
				ALTER TABLE dbo.UserAchievements ADD SeenAt DATETIMEOFFSET(7) NULL;
			IF COL_LENGTH('dbo.UserAchievements', 'AchievedAt') IS NULL
				ALTER TABLE dbo.UserAchievements ADD AchievedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserAchievements_AchievedAt DEFAULT (SYSDATETIMEOFFSET());
		END;
	`)
	return err
}

func (r *GamificationRepo) GetProfile(ctx context.Context, userID int64) (*model.GamificationProfile, error) {
	profile := &model.GamificationProfile{}

	err := r.db.QueryRowContext(ctx,
		`SELECT COALESCE(TotalXP, 0), COALESCE(CurrentLevel, 1)
		 FROM Users WHERE UserID = ?`, userID,
	).Scan(&profile.TotalXP, &profile.CurrentLevel)
	if err != nil {
		return nil, err
	}
	if wl, err := r.getWordsLearned(ctx, userID); err == nil {
		profile.WordsLearned = wl
	}
	if s, err := r.getStreak(ctx, userID); err == nil {
		profile.Streak = s
	}

	// Today's XP
	if err := r.db.QueryRowContext(ctx,
		`SELECT ISNULL(SUM(XPAmount), 0) FROM UserXPEvents
		 WHERE UserID = ? AND CAST(CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)`,
		userID).Scan(&profile.TodayXP); err != nil {
		profile.TodayXP = 0
	}

	// Level thresholds
	xpForNextLevel := int64(profile.CurrentLevel) * 100
	profile.XpForNextLevel = xpForNextLevel
	profile.XpToNextLevel = xpForNextLevel - profile.TotalXP
	if profile.XpToNextLevel < 0 {
		profile.XpToNextLevel = 0
	}
	if xpForNextLevel > 0 {
		profile.LevelProgress = float64(profile.TotalXP) / float64(xpForNextLevel) * 100
	}
	profile.NextLevelTotalXP = xpForNextLevel
	profile.CurrentLevelXP = profile.TotalXP - int64(profile.CurrentLevel-1)*100

	// Load achievements
	var achievements []model.Achievement
	selErr := r.db.SelectContext(ctx, &achievements, `
		SELECT a.AchievementID AS id, a.Code AS code, a.Name AS label,
			a.Description AS description, a.Icon AS icon, a.XPReward AS xpReward,
			CASE WHEN ua.UserAchievementID IS NOT NULL THEN 1 ELSE 0 END AS unlocked,
			LEFT(CONVERT(NVARCHAR(30), ua.AchievedAt, 126), 19) + 'Z' AS unlockedAt,
			CASE WHEN ua.SeenAt IS NOT NULL THEN 1 ELSE 0 END AS seen
		FROM dbo.Achievements a
		LEFT JOIN dbo.UserAchievements ua ON a.AchievementID = ua.AchievementID AND ua.UserID = ?
		WHERE a.IsActive = 1
		ORDER BY a.AchievementID`, userID)
	if selErr != nil {
		log.Printf("load achievements: %v", selErr)
	}
	profile.Achievements = achievements
	unseen := []model.Achievement{}
	for _, a := range achievements {
		if a.Unlocked && !a.Seen {
			unseen = append(unseen, a)
		}
	}
	profile.UnseenAchievements = unseen

	return profile, nil
}

func (r *GamificationRepo) AwardXP(ctx context.Context, userID int64, event model.XPEvent) (int64, error) {
	// Check for duplicate
	if event.SourceKey != nil {
		var count int
		if err := r.db.QueryRowContext(ctx,
			`SELECT COUNT(*) FROM UserXPEvents WHERE UserID = ? AND SourceKey = ?`,
			userID, *event.SourceKey).Scan(&count); err != nil {
			count = 0
		}
		if count > 0 {
			return 0, nil
		}
	}

	var id int64
	err := r.db.QueryRowContext(ctx,
		`INSERT INTO UserXPEvents (UserID, EventType, XPAmount, SourceKey, MetadataJson, CreatedAt)
		 OUTPUT INSERTED.XPEventID
		 VALUES (?, ?, ?, ?, ?, SYSDATETIMEOFFSET())`,
		userID, event.EventType, event.XPAmount, event.SourceKey, event.Metadata).Scan(&id)
	if err != nil {
		return 0, err
	}

	// Update user totals
	if _, err := r.db.ExecContext(ctx,
		`UPDATE Users SET TotalXP = COALESCE(TotalXP, 0) + ?,
			CurrentLevel = FLOOR((COALESCE(TotalXP, 0) + ?) / 100) + 1,
			UpdatedAt = SYSDATETIMEOFFSET()
		 WHERE UserID = ?`, event.XPAmount, event.XPAmount, userID); err != nil {
		return 0, err
	}

	return id, nil
}

func (r *GamificationRepo) MarkAchievementsSeen(ctx context.Context, userID int64, achievementIDs []int64) error {
	if len(achievementIDs) == 0 {
		_, err := r.db.ExecContext(ctx,
			`UPDATE dbo.UserAchievements SET SeenAt = COALESCE(SeenAt, SYSDATETIMEOFFSET()) WHERE UserID = ?`,
			userID)
		return err
	}

	idsJSON, _ := json.Marshal(achievementIDs)
	_, err := r.db.ExecContext(ctx,
		`UPDATE ua SET SeenAt = COALESCE(SeenAt, SYSDATETIMEOFFSET())
		 FROM dbo.UserAchievements ua
		 JOIN OPENJSON(?) WITH (id BIGINT '$') AS ids ON ids.id = ua.AchievementID
		 WHERE ua.UserID = ?`,
		userID, string(idsJSON))
	return err
}

func (r *GamificationRepo) GetMetrics(ctx context.Context, userID int64) (totalXP int64, streak int, currentLevel int, err error) {
	err = r.db.QueryRowContext(ctx,
		`SELECT COALESCE(TotalXP, 0), COALESCE(CurrentLevel, 1)
		 FROM Users WHERE UserID = ?`, userID,
	).Scan(&totalXP, &currentLevel)
	if s, e := r.getStreak(ctx, userID); e == nil {
		streak = s
	}
	return
}
