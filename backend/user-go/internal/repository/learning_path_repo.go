package repository

import (
	"context"
	"fmt"

	"github.com/vocab-practice/user-go/internal/model"
)

type LearningPathRepo struct {
	db *DB
}

func NewLearningPathRepo(db *DB) *LearningPathRepo {
	return &LearningPathRepo{db: db}
}

func (r *LearningPathRepo) EnsureSchema(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		IF OBJECT_ID(N'dbo.LearningPathLevels', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.LearningPathLevels (
				LearningPathLevelID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_LearningPathLevels PRIMARY KEY,
				LevelCode NVARCHAR(30) NOT NULL CONSTRAINT UQ_LearningPathLevels_LevelCode UNIQUE,
				LevelName NVARCHAR(100) NOT NULL,
				TargetScore INT NOT NULL CONSTRAINT CK_LearningPathLevels_TargetScore CHECK (TargetScore > 0),
				Description NVARCHAR(500) NULL,
				DisplayOrder INT NOT NULL CONSTRAINT UQ_LearningPathLevels_DisplayOrder UNIQUE,
				AccentKey NVARCHAR(30) NOT NULL,
				IsActive BIT NOT NULL CONSTRAINT DF_LearningPathLevels_IsActive DEFAULT (1),
				CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_LearningPathLevels_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
				UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_LearningPathLevels_UpdatedAt DEFAULT (SYSDATETIMEOFFSET())
			);
		END;

		IF OBJECT_ID(N'dbo.LearningPathTopics', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.LearningPathTopics (
				LearningPathTopicID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_LearningPathTopics PRIMARY KEY,
				LearningPathLevelID INT NOT NULL CONSTRAINT FK_LearningPathTopics_LevelID REFERENCES dbo.LearningPathLevels(LearningPathLevelID) ON DELETE CASCADE,
				TopicID BIGINT NOT NULL CONSTRAINT FK_LearningPathTopics_TopicID REFERENCES dbo.Topics(TopicID) ON DELETE CASCADE,
				DisplayOrder INT NOT NULL,
				IsRequired BIT NOT NULL CONSTRAINT DF_LearningPathTopics_IsRequired DEFAULT (1),
				CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_LearningPathTopics_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
				CONSTRAINT UQ_LearningPathTopics_TopicID UNIQUE (TopicID)
			);
		END;
	`)
	return err
}

func (r *LearningPathRepo) SeedLevels(ctx context.Context) error {
	type levelSeed struct {
		Code        string
		Name        string
		TargetScore int
		Description string
		DisplayOrder int
		AccentKey   string
	}
	levels := []levelSeed{
		{"TOEIC_300", "TOEIC 300", 300, "Xây dựng nền tảng vững chắc với từ vựng TOEIC thiết yếu hàng ngày.", 1, "sky"},
		{"TOEIC_500", "TOEIC 500", 500, "Mở rộng từ vựng công sở và cải thiện tốc độ phản hồi.", 2, "emerald"},
		{"TOEIC_700", "TOEIC 700", 700, "Làm chủ các ngữ cảnh kinh doanh và học thuật thường gặp.", 3, "amber"},
		{"TOEIC_900", "TOEIC 900", 900, "Trau dồi từ vựng nâng cao để đạt điểm TOEIC cao.", 4, "violet"},
	}

	for _, l := range levels {
		_, err := r.db.ExecContext(ctx,
			`MERGE dbo.LearningPathLevels AS target
			 USING (SELECT ? AS LevelCode) AS source
			 ON target.LevelCode = source.LevelCode
			 WHEN MATCHED THEN
				 UPDATE SET LevelName = ?, TargetScore = ?, Description = ?,
					 DisplayOrder = ?, AccentKey = ?, IsActive = 1, UpdatedAt = SYSDATETIMEOFFSET()
			 WHEN NOT MATCHED THEN
				 INSERT (LevelCode, LevelName, TargetScore, Description, DisplayOrder, AccentKey)
				 VALUES (?, ?, ?, ?, ?, ?);`,
			// Each ? is positional — provide for USING, UPDATE, INSERT clauses
			l.Code, l.Name, l.TargetScore, l.Description, l.DisplayOrder, l.AccentKey,
			l.Code, l.Name, l.TargetScore, l.Description, l.DisplayOrder, l.AccentKey)
		if err != nil {
			return fmt.Errorf("seed level %s: %w", l.Code, err)
		}
	}
	return nil
}

func (r *LearningPathRepo) SyncPublishedTopics(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		WITH RankedTopics AS (
			SELECT t.TopicID,
				   NTILE(4) OVER (ORDER BY t.TopicID) AS LevelBucket
			FROM dbo.Topics t
			WHERE t.ContentStatus = N'Published'
		),
		TopicsToMap AS (
			SELECT rt.TopicID, rt.LevelBucket,
				   ROW_NUMBER() OVER (PARTITION BY rt.LevelBucket ORDER BY rt.TopicID) AS TopicOrder
			FROM RankedTopics rt
			WHERE NOT EXISTS (
				SELECT 1 FROM dbo.LearningPathTopics lpt WHERE lpt.TopicID = rt.TopicID
			)
		)
		INSERT dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder)
		SELECT l.LearningPathLevelID, t.TopicID, t.TopicOrder
		FROM TopicsToMap t
		JOIN dbo.LearningPathLevels l ON l.DisplayOrder = t.LevelBucket;
	`)
	return err
}

func (r *LearningPathRepo) GetRoadmapData(ctx context.Context, userID int64) ([]model.RoadmapLevelRow, []model.RoadmapTopicRow, error) {
	var levels []model.RoadmapLevelRow
	if err := r.db.SelectContext(ctx, &levels, `
		SELECT LearningPathLevelID AS id,
			   LevelCode AS code,
			   LevelName AS title,
			   TargetScore AS targetScore,
			   Description AS description,
			   DisplayOrder AS displayOrder,
			   AccentKey AS accentKey
		FROM dbo.LearningPathLevels
		WHERE IsActive = 1
		ORDER BY DisplayOrder`); err != nil {
		return nil, nil, fmt.Errorf("query levels: %w", err)
	}

	var topics []model.RoadmapTopicRow
	if err := r.db.SelectContext(ctx, &topics, `
		SELECT lpt.LearningPathTopicID AS pathTopicId,
			   lpt.LearningPathLevelID AS levelId,
			   lpt.DisplayOrder AS displayOrder,
			   t.TopicID AS topicId,
			   t.TopicName AS title,
			   t.TopicCode AS code,
			   t.Description AS description,
			   ISNULL(wordStats.totalWords, 0) AS totalWords,
			   ISNULL(wordStats.learnedWords, 0) AS learnedWords,
			   ISNULL(wordStats.masteredWords, 0) AS masteredWords,
			   ISNULL(practiceStats.practiceCompletions, 0) AS practiceCompletions,
			   ISNULL(testStats.miniTestCount, 0) AS miniTestCount,
			   ISNULL(testStats.completedMiniTests, 0) AS completedMiniTests,
			   testStats.firstMiniTestId AS firstMiniTestId
		FROM dbo.LearningPathTopics lpt
		JOIN dbo.Topics t ON t.TopicID = lpt.TopicID
		OUTER APPLY (
			SELECT COUNT(DISTINCT wt.WordID) AS totalWords,
				   COUNT(DISTINCT CASE WHEN uwp.RepetitionCount > 0 THEN wt.WordID END) AS learnedWords,
				   COUNT(DISTINCT CASE WHEN uwp.MasteryLevel >= 7 THEN wt.WordID END) AS masteredWords
			FROM dbo.WordTopics wt
			LEFT JOIN dbo.UserWordProgress uwp
				ON uwp.WordID = wt.WordID AND uwp.UserID = ?
			WHERE wt.TopicID = t.TopicID
		) wordStats
		OUTER APPLY (
			SELECT COUNT(*) AS practiceCompletions
			FROM dbo.UserXPEvents x
			WHERE x.UserID = ?
			  AND x.EventType = N'PracticeComplete'
			  AND TRY_CONVERT(BIGINT, JSON_VALUE(x.MetadataJson, '$.topicId')) = t.TopicID
		) practiceStats
		OUTER APPLY (
			SELECT COUNT(DISTINCT mt.MiniTestID) AS miniTestCount,
				   COUNT(DISTINCT CASE WHEN mta.SubmittedAt IS NOT NULL THEN mt.MiniTestID END) AS completedMiniTests,
				   MIN(mt.MiniTestID) AS firstMiniTestId
			FROM dbo.MiniTests mt
			LEFT JOIN dbo.MiniTestAttempts mta
				ON mta.MiniTestID = mt.MiniTestID AND mta.UserID = ?
			WHERE mt.TopicID = t.TopicID AND mt.IsPublished = 1
		) testStats
		WHERE t.ContentStatus = N'Published'
		ORDER BY lpt.LearningPathLevelID, lpt.DisplayOrder, lpt.LearningPathTopicID`, userID, userID, userID); err != nil {
		return nil, nil, fmt.Errorf("query topics: %w", err)
	}
	return levels, topics, nil
}
