/* Ordered TOEIC learning roadmap built on the existing Topics table. */

IF OBJECT_ID(N'dbo.LearningPathLevels', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.LearningPathLevels
    (
        LearningPathLevelID INT IDENTITY(1,1) NOT NULL,
        LevelCode           NVARCHAR(30) NOT NULL,
        LevelName           NVARCHAR(100) NOT NULL,
        TargetScore         INT NOT NULL,
        Description         NVARCHAR(500) NULL,
        DisplayOrder        INT NOT NULL,
        AccentKey           NVARCHAR(30) NOT NULL,
        IsActive            BIT NOT NULL
            CONSTRAINT DF_LearningPathLevels_IsActive DEFAULT (1),
        CreatedAt           DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_LearningPathLevels_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt           DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_LearningPathLevels_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_LearningPathLevels PRIMARY KEY CLUSTERED (LearningPathLevelID),
        CONSTRAINT UQ_LearningPathLevels_LevelCode UNIQUE (LevelCode),
        CONSTRAINT UQ_LearningPathLevels_DisplayOrder UNIQUE (DisplayOrder),
        CONSTRAINT CK_LearningPathLevels_TargetScore CHECK (TargetScore > 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.LearningPathTopics', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.LearningPathTopics
    (
        LearningPathTopicID BIGINT IDENTITY(1,1) NOT NULL,
        LearningPathLevelID INT NOT NULL,
        TopicID             BIGINT NOT NULL,
        DisplayOrder        INT NOT NULL,
        IsRequired          BIT NOT NULL
            CONSTRAINT DF_LearningPathTopics_IsRequired DEFAULT (1),
        CreatedAt           DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_LearningPathTopics_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_LearningPathTopics PRIMARY KEY CLUSTERED (LearningPathTopicID),
        CONSTRAINT FK_LearningPathTopics_LevelID FOREIGN KEY (LearningPathLevelID)
            REFERENCES dbo.LearningPathLevels(LearningPathLevelID)
            ON DELETE CASCADE,
        CONSTRAINT FK_LearningPathTopics_TopicID FOREIGN KEY (TopicID)
            REFERENCES dbo.Topics(TopicID)
            ON DELETE CASCADE,
        CONSTRAINT UQ_LearningPathTopics_TopicID UNIQUE (TopicID)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_LearningPathTopics_LevelID_DisplayOrder'
      AND object_id = OBJECT_ID(N'dbo.LearningPathTopics')
)
BEGIN
    CREATE INDEX IX_LearningPathTopics_LevelID_DisplayOrder
    ON dbo.LearningPathTopics(LearningPathLevelID, DisplayOrder);
END;
GO

MERGE dbo.LearningPathLevels AS target
USING (VALUES
    (N'TOEIC_300', N'TOEIC 300', 300, N'Build a practical foundation with essential everyday TOEIC vocabulary.', 1, N'sky'),
    (N'TOEIC_500', N'TOEIC 500', 500, N'Expand workplace vocabulary and improve response speed.', 2, N'emerald'),
    (N'TOEIC_700', N'TOEIC 700', 700, N'Master higher-frequency business and academic contexts.', 3, N'amber'),
    (N'TOEIC_900', N'TOEIC 900', 900, N'Refine advanced vocabulary for high-score TOEIC performance.', 4, N'violet')
) AS source (LevelCode, LevelName, TargetScore, Description, DisplayOrder, AccentKey)
ON target.LevelCode = source.LevelCode
WHEN MATCHED THEN
    UPDATE SET LevelName = source.LevelName,
               TargetScore = source.TargetScore,
               Description = source.Description,
               DisplayOrder = source.DisplayOrder,
               AccentKey = source.AccentKey,
               IsActive = 1,
               UpdatedAt = SYSDATETIMEOFFSET()
WHEN NOT MATCHED THEN
    INSERT (LevelCode, LevelName, TargetScore, Description, DisplayOrder, AccentKey)
    VALUES (source.LevelCode, source.LevelName, source.TargetScore, source.Description, source.DisplayOrder, source.AccentKey);
GO

WITH RankedTopics AS
(
    SELECT t.TopicID,
           NTILE(4) OVER (ORDER BY t.TopicID) AS LevelBucket
    FROM dbo.Topics t
    WHERE t.ContentStatus = N'Published'
),
TopicsToMap AS
(
    SELECT rt.TopicID,
           rt.LevelBucket,
           ROW_NUMBER() OVER (PARTITION BY rt.LevelBucket ORDER BY rt.TopicID) AS TopicOrder
    FROM RankedTopics rt
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.LearningPathTopics lpt
        WHERE lpt.TopicID = rt.TopicID
    )
)
INSERT dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder)
SELECT l.LearningPathLevelID,
       t.TopicID,
       t.TopicOrder
FROM TopicsToMap t
JOIN dbo.LearningPathLevels l ON l.DisplayOrder = t.LevelBucket;
GO
