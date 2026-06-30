package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	_ "github.com/denisenkom/go-mssqldb"
	"github.com/jmoiron/sqlx"
)

// Store wraps SQL Server access.
type Store struct {
	db *sqlx.DB
}

// NewStore creates a new Store and verifies connectivity.
func NewStore(connString string) (*Store, error) {
	db, err := sqlx.Connect("mssql", connString)
	if err != nil {
		return nil, fmt.Errorf("sqlx.Connect: %w", err)
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("db.Ping: %w", err)
	}

	return &Store{db: db}, nil
}

// Close shuts down the database pool.
func (s *Store) Close() error {
	return s.db.Close()
}

// EnsureSchema creates tables, columns, and indexes if they don't exist.
func (s *Store) EnsureSchema(ctx context.Context) error {
	queries := []string{
		// Users columns
		`IF COL_LENGTH(N'dbo.Users', N'TotalXP') IS NULL
		 BEGIN ALTER TABLE dbo.Users ADD TotalXP INT NOT NULL CONSTRAINT DF_Users_TotalXP_Go DEFAULT (0); END;`,
		`IF COL_LENGTH(N'dbo.Users', N'CurrentLevel') IS NULL
		 BEGIN ALTER TABLE dbo.Users ADD CurrentLevel INT NOT NULL CONSTRAINT DF_Users_CurrentLevel_Go DEFAULT (1); END;`,

		// UserXPEvents table
		`IF OBJECT_ID(N'dbo.UserXPEvents', N'U') IS NULL
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
		 END;`,

		// Unique index on UserID, EventType, SourceKey
		`IF NOT EXISTS (
		   SELECT 1 FROM sys.indexes
		   WHERE name = N'UX_UserXPEvents_User_Event_Source_Go'
		     AND object_id = OBJECT_ID(N'dbo.UserXPEvents')
		 )
		 BEGIN
		   CREATE UNIQUE INDEX UX_UserXPEvents_User_Event_Source_Go
		   ON dbo.UserXPEvents(UserID, EventType, SourceKey)
		   WHERE SourceKey IS NOT NULL;
		 END;`,

		// Index on UserID + CreatedAt
		`IF NOT EXISTS (
		   SELECT 1 FROM sys.indexes
		   WHERE name = N'IX_UserXPEvents_UserID_CreatedAt_Go'
		     AND object_id = OBJECT_ID(N'dbo.UserXPEvents')
		 )
		 BEGIN
		   CREATE INDEX IX_UserXPEvents_UserID_CreatedAt_Go
		   ON dbo.UserXPEvents(UserID, CreatedAt DESC)
		   INCLUDE (EventType, XPAmount);
		 END;`,

		// Achievements table
		`IF OBJECT_ID(N'dbo.Achievements', N'U') IS NULL
		 BEGIN
		   CREATE TABLE dbo.Achievements (
		     AchievementID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Achievements PRIMARY KEY,
		     Code NVARCHAR(80) NOT NULL CONSTRAINT UQ_Achievements_Code UNIQUE,
		     Name NVARCHAR(200) NOT NULL,
		     Description NVARCHAR(500) NOT NULL,
		     Icon NVARCHAR(20) NOT NULL,
		     CriteriaType NVARCHAR(50) NOT NULL,
		     CriteriaValue INT NOT NULL CONSTRAINT CK_Achievements_CriteriaValue CHECK (CriteriaValue > 0),
		     DisplayOrder INT NOT NULL,
		     IsActive BIT NOT NULL CONSTRAINT DF_Achievements_IsActive DEFAULT (1),
		     XPReward INT NOT NULL CONSTRAINT DF_Achievements_XPReward_Go DEFAULT (50),
		     CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Achievements_CreatedAt DEFAULT (SYSDATETIMEOFFSET())
		   );
		 END;`,

		// XPReward column
		`IF COL_LENGTH(N'dbo.Achievements', N'XPReward') IS NULL
		 BEGIN ALTER TABLE dbo.Achievements ADD XPReward INT NOT NULL CONSTRAINT DF_Achievements_XPReward_Go2 DEFAULT (50); END;`,

		// UserAchievements table
		`IF OBJECT_ID(N'dbo.UserAchievements', N'U') IS NULL
		 BEGIN
		   CREATE TABLE dbo.UserAchievements (
		     UserAchievementID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserAchievements PRIMARY KEY,
		     UserID BIGINT NOT NULL CONSTRAINT FK_UserAchievements_UserID REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
		     AchievementID INT NOT NULL CONSTRAINT FK_UserAchievements_AchievementID REFERENCES dbo.Achievements(AchievementID),
		     UnlockedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserAchievements_UnlockedAt DEFAULT (SYSDATETIMEOFFSET()),
		     SeenAt DATETIMEOFFSET(7) NULL,
		     CONSTRAINT UQ_UserAchievements_User_Achievement UNIQUE (UserID, AchievementID)
		   );
		 END;`,

		// MiniTestAttempts unique constraint
		`IF NOT EXISTS (
		   SELECT 1 FROM sys.indexes
		   WHERE name = N'UQ_MiniTestAttempts_User_Test_Go'
		     AND object_id = OBJECT_ID(N'dbo.MiniTestAttempts')
		 )
		 BEGIN
		   BEGIN TRY
		     DELETE t FROM dbo.MiniTestAttempts t
		     WHERE t.MiniTestAttemptID NOT IN (
		       SELECT MIN(MiniTestAttemptID) FROM dbo.MiniTestAttempts GROUP BY UserID, MiniTestID
		     );
		     ALTER TABLE dbo.MiniTestAttempts
		       ADD CONSTRAINT UQ_MiniTestAttempts_User_Test_Go UNIQUE (UserID, MiniTestID);
		   END TRY
		   BEGIN CATCH
		     IF ERROR_NUMBER() NOT IN (208, 207)
		     BEGIN
		       PRINT N'Cannot create MiniTestAttempts UNIQUE constraint: ' + ERROR_MESSAGE();
		     END;
		   END CATCH
		 END;`,
	}

	for _, q := range queries {
		if _, err := s.db.ExecContext(ctx, q); err != nil {
			return fmt.Errorf("schema query: %w", err)
		}
	}

	// Seed achievements
	for _, a := range ACHIEVEMENT_SEED {
		_, err := s.db.ExecContext(ctx, `
			MERGE dbo.Achievements AS target
			USING (SELECT @p1 AS Code) AS source
			ON target.Code = source.Code
			WHEN MATCHED THEN
				UPDATE SET Name = @p2, Description = @p3, Icon = @p4,
				           CriteriaType = @p5, CriteriaValue = @p6,
				           DisplayOrder = @p7, XPReward = @p8, IsActive = 1
			WHEN NOT MATCHED THEN
				INSERT (Code, Name, Description, Icon, CriteriaType, CriteriaValue, DisplayOrder, XPReward)
				VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8);
		`, a.Code, a.Name, a.Description, a.Icon, a.CriteriaType, a.CriteriaValue, a.DisplayOrder, a.XPReward)
		if err != nil {
			return fmt.Errorf("seed achievement %s: %w", a.Code, err)
		}
	}

	return nil
}

// rowScanner is satisfied by both sqlx.Row and sqlx.Rows.
type rowScanner interface {
	Scan(dest ...interface{}) error
}

// ---------------------------------------------------------------------------
// AwardXP
// ---------------------------------------------------------------------------

// awardXPResult holds the query result from awarding XP.
type awardXPResult struct {
	XPEventID sql.NullInt64  `db:"xpEventId"`
	XPGained  sql.NullInt64  `db:"xpGained"`
	TotalXP   sql.NullInt64  `db:"totalXP"`
}

// AwardXP inserts an XP event, updates user TotalXP, and returns the result.
func (s *Store) AwardXP(ctx context.Context, userID int64, eventType string, xpAmount int, sourceKey string, metadataJSON *string) (*awardXPResult, error) {
	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	var result awardXPResult
	err = tx.QueryRowxContext(ctx, `
		DECLARE @Inserted TABLE (XPEventID BIGINT, XPAmount INT);
		IF @p5 IS NULL OR NOT EXISTS (
			SELECT 1 FROM dbo.UserXPEvents
			WHERE UserID = @p1 AND EventType = @p2 AND SourceKey = @p5
		)
		BEGIN
			INSERT dbo.UserXPEvents (UserID, EventType, XPAmount, SourceKey, MetadataJson)
			OUTPUT inserted.XPEventID, inserted.XPAmount INTO @Inserted
			VALUES (@p1, @p2, @p3, @p5, @p6);

			UPDATE dbo.Users
			SET TotalXP = ISNULL(TotalXP, 0) + @p3,
			    UpdatedAt = SYSDATETIMEOFFSET()
			WHERE UserID = @p1;
		END;

		SELECT ISNULL((SELECT TOP 1 XPEventID FROM @Inserted), 0) AS xpEventId,
		       ISNULL((SELECT SUM(XPAmount) FROM @Inserted), 0) AS xpGained,
		       ISNULL((SELECT TotalXP FROM dbo.Users WHERE UserID = @p1), 0) AS totalXP;
	`, userID, eventType, xpAmount, nil, sourceKey, metadataJSON).Scan(&result.XPEventID, &result.XPGained, &result.TotalXP)
	if err != nil {
		return nil, fmt.Errorf("awardXP query: %w", err)
	}

	// Update user level
	level := GetLevelState(int(result.TotalXP.Int64))
	_, err = tx.ExecContext(ctx,
		`UPDATE dbo.Users SET CurrentLevel = @p1 WHERE UserID = @p2`,
		level.CurrentLevel, userID)
	if err != nil {
		return nil, fmt.Errorf("update level: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit tx: %w", err)
	}

	return &result, nil
}

// ---------------------------------------------------------------------------
// GetMetrics
// ---------------------------------------------------------------------------

// MetricsRow is the raw row returned by the metrics query.
type metricsRow struct {
	TotalXP      sql.NullInt64 `db:"totalXP"`
	WordsLearned sql.NullInt64 `db:"wordsLearned"`
	BestTestScore sql.NullInt64 `db:"bestTestScore"`
	Streak       sql.NullInt64 `db:"streak"`
	TodayXP      sql.NullInt64 `db:"todayXP"`
}

// GetMetrics returns aggregated gamification metrics for a user.
func (s *Store) GetMetrics(ctx context.Context, userID int64) (*Metrics, error) {
	var row metricsRow
	err := s.db.QueryRowxContext(ctx, `
		WITH DailyActivity AS (
			SELECT DISTINCT CAST(CreatedAt AS DATE) AS ActivityDate
			FROM dbo.UserXPEvents
			WHERE UserID = @p1
			  AND EventType IN (N'LearnWord', N'PracticeComplete', N'MiniTestComplete', N'DailyLogin')
			UNION
			SELECT DISTINCT CAST(AttemptedAt AS DATE) AS ActivityDate
			FROM dbo.ExerciseAttempts
			WHERE UserID = @p1
		),
		RankedActivity AS (
			SELECT ActivityDate,
			       MAX(ActivityDate) OVER () AS LatestDate,
			       ROW_NUMBER() OVER (ORDER BY ActivityDate DESC) AS rowNumber
			FROM DailyActivity
		)
		SELECT
			ISNULL((SELECT TotalXP FROM dbo.Users WHERE UserID = @p1), 0) AS totalXP,
			ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @p1 AND RepetitionCount > 0), 0) AS wordsLearned,
			ISNULL((SELECT MAX(Score) FROM dbo.MiniTestAttempts WHERE UserID = @p1 AND SubmittedAt IS NOT NULL), 0) AS bestTestScore,
			ISNULL((
				SELECT COUNT(*)
				FROM RankedActivity
				WHERE LatestDate >= DATEADD(day, -1, CAST(SYSDATETIMEOFFSET() AS DATE))
				  AND DATEDIFF(day, ActivityDate, LatestDate) = rowNumber - 1
			), 0) AS streak,
			ISNULL((
				SELECT SUM(XPAmount) FROM dbo.UserXPEvents
				WHERE UserID = @p1
				  AND CAST(CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
			), 0) AS todayXP
	`, userID).Scan(
		&row.TotalXP, &row.WordsLearned, &row.BestTestScore, &row.Streak, &row.TodayXP,
	)
	if err != nil {
		return nil, fmt.Errorf("getMetrics: %w", err)
	}

	m := &Metrics{
		WordsLearned:  int(row.WordsLearned.Int64),
		BestTestScore: int(row.BestTestScore.Int64),
		Streak:        int(row.Streak.Int64),
		TodayXP:       int(row.TodayXP.Int64),
		LevelState:    GetLevelState(int(row.TotalXP.Int64)),
	}
	return m, nil
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

type achievementRow struct {
	ID           int            `db:"id"`
	Code         string         `db:"code"`
	Label        string         `db:"label"`
	Description  string         `db:"description"`
	Icon         string         `db:"icon"`
	CriteriaType string         `db:"criteriaType"`
	Target       int            `db:"target"`
	XPReward     int            `db:"xpReward"`
	Unlocked     bool           `db:"unlocked"`
	UnlockedAt   sql.NullTime   `db:"unlockedAt"`
	Seen         bool           `db:"seen"`
}

// GetAchievements returns all achievements with user progress.
func (s *Store) GetAchievements(ctx context.Context, userID int64, m *Metrics) ([]Achievement, error) {
	rows, err := s.db.QueryxContext(ctx, `
		SELECT a.AchievementID AS id,
		       a.Code AS code,
		       a.Name AS label,
		       a.Description AS description,
		       a.Icon AS icon,
		       a.CriteriaType AS criteriaType,
		       a.CriteriaValue AS target,
		       a.XPReward AS xpReward,
		       CASE WHEN ua.UserAchievementID IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS unlocked,
		       ua.UnlockedAt AS unlockedAt,
		       CASE WHEN ua.SeenAt IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS seen
		FROM dbo.Achievements a
		LEFT JOIN dbo.UserAchievements ua
			ON ua.AchievementID = a.AchievementID AND ua.UserID = @p1
		WHERE a.IsActive = 1
		ORDER BY a.DisplayOrder
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("getAchievements: %w", err)
	}
	defer rows.Close()

	var achievements []Achievement
	for rows.Next() {
		var ar achievementRow
		if err := rows.Scan(&ar.ID, &ar.Code, &ar.Label, &ar.Description, &ar.Icon,
			&ar.CriteriaType, &ar.Target, &ar.XPReward, &ar.Unlocked, &ar.UnlockedAt, &ar.Seen); err != nil {
			return nil, fmt.Errorf("scan achievement: %w", err)
		}
		progress := GetAchievementProgress(ar.CriteriaType, m)
		ach := Achievement{
			ID:                 ar.ID,
			Code:               ar.Code,
			Label:              ar.Label,
			Description:        ar.Description,
			Icon:               ar.Icon,
			CriteriaType:       ar.CriteriaType,
			Target:             ar.Target,
			XPReward:           ar.XPReward,
			Unlocked:           ar.Unlocked,
			Seen:               ar.Seen,
			Progress:           progress,
			ProgressPercentage: percent(progress, ar.Target),
		}
		if ar.UnlockedAt.Valid {
			ach.UnlockedAt = &ar.UnlockedAt.Time
		}
		achievements = append(achievements, ach)
	}
	return achievements, rows.Err()
}

// CheckAchievements checks and unlocks any new achievements for the user.
// Returns the list of newly unlocked achievements.
func (s *Store) CheckAchievements(ctx context.Context, userID int64, m *Metrics) ([]Achievement, error) {
	rows, err := s.db.QueryxContext(ctx, `
		INSERT dbo.UserAchievements (UserID, AchievementID)
		OUTPUT inserted.AchievementID AS id, inserted.UnlockedAt AS unlockedAt
		SELECT @p1, a.AchievementID
		FROM dbo.Achievements a
		WHERE a.IsActive = 1
		  AND NOT EXISTS (
			SELECT 1 FROM dbo.UserAchievements ua
			WHERE ua.UserID = @p1 AND ua.AchievementID = a.AchievementID
		  )
		  AND (
			(a.CriteriaType = N'WORDS_LEARNED' AND @p2 >= a.CriteriaValue)
			OR (a.CriteriaType = N'STREAK_DAYS' AND @p3 >= a.CriteriaValue)
			OR (a.CriteriaType = N'TEST_SCORE' AND @p4 >= a.CriteriaValue)
			OR (a.CriteriaType = N'LEVEL' AND @p5 >= a.CriteriaValue)
		  );
	`, userID, m.WordsLearned, m.Streak, m.BestTestScore, m.CurrentLevel)
	if err != nil {
		return nil, fmt.Errorf("checkAchievements insert: %w", err)
	}
	defer rows.Close()

	type newAchievementRow struct {
		ID         int        `db:"id"`
		UnlockedAt time.Time  `db:"unlockedAt"`
	}
	var newIDs []int
	unlockMap := make(map[int]time.Time)
	for rows.Next() {
		var nar newAchievementRow
		if err := rows.Scan(&nar.ID, &nar.UnlockedAt); err != nil {
			return nil, fmt.Errorf("scan new achievement: %w", err)
		}
		newIDs = append(newIDs, nar.ID)
		unlockMap[nar.ID] = nar.UnlockedAt
	}
	if len(newIDs) == 0 {
		return nil, nil
	}

	// Fetch full details for newly unlocked achievements
	allAchievements, err := s.GetAchievements(ctx, userID, m)
	if err != nil {
		return nil, err
	}

	var newlyUnlocked []Achievement
	for _, ach := range allAchievements {
		if _, ok := unlockMap[ach.ID]; ok {
			ach.Unlocked = true
			if t, ok := unlockMap[ach.ID]; ok {
				ach.UnlockedAt = &t
			}
			newlyUnlocked = append(newlyUnlocked, ach)

			// Award XP for each newly unlocked achievement
			if ach.XPReward > 0 {
				sourceKey := fmt.Sprintf("achievement-unlock:%s", ach.Code)
				meta := map[string]interface{}{
					"achievementCode": ach.Code,
					"achievementName": ach.Label,
				}
				metaJSON, _ := json.Marshal(meta)
				metaStr := string(metaJSON)

				_, err := s.AwardXP(ctx, userID, "AchievementUnlock", ach.XPReward, sourceKey, &metaStr)
				if err != nil {
					// Log but don't fail the whole operation
					fmt.Printf("Error awarding XP for %s: %v\n", ach.Code, err)
				}
			}
		}
	}

	return newlyUnlocked, nil
}

// MarkAchievementsSeen marks achievements as seen.
func (s *Store) MarkAchievementsSeen(ctx context.Context, userID int64, achievementIDs []int) error {
	if len(achievementIDs) == 0 {
		_, err := s.db.ExecContext(ctx,
			`UPDATE dbo.UserAchievements SET SeenAt = COALESCE(SeenAt, SYSDATETIMEOFFSET()) WHERE UserID = @p1`,
			userID)
		return err
	}

	// Use a table-valued parameter approach or build the IN clause safely.
	// For simplicity with go-mssqldb, we iterate in a transaction.
	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	for _, id := range achievementIDs {
		_, err := tx.ExecContext(ctx,
			`UPDATE dbo.UserAchievements SET SeenAt = COALESCE(SeenAt, SYSDATETIMEOFFSET())
			 WHERE UserID = @p1 AND AchievementID = @p2`,
			userID, id)
		if err != nil {
			return fmt.Errorf("mark seen achievement %d: %w", id, err)
		}
	}

	return tx.Commit()
}

// GetProfile fetches full gamification profile.
func (s *Store) GetProfile(ctx context.Context, userID int64) (*Profile, error) {
	m, err := s.GetMetrics(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Check for new achievements
	newAch, err := s.CheckAchievements(ctx, userID, m)
	if err != nil {
		return nil, err
	}

	// Re-fetch metrics if achievements were unlocked (XP may have changed)
	if len(newAch) > 0 {
		m, err = s.GetMetrics(ctx, userID)
		if err != nil {
			return nil, err
		}
	}

	achievements, err := s.GetAchievements(ctx, userID, m)
	if err != nil {
		return nil, err
	}

	var unseen []Achievement
	for _, ach := range achievements {
		if ach.Unlocked && !ach.Seen {
			unseen = append(unseen, ach)
		}
	}

	return &Profile{
		Metrics:            *m,
		Achievements:       achievements,
		UnseenAchievements: unseen,
	}, nil
}
