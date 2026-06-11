/* Central learner gamification ledger and persisted achievements. */

IF COL_LENGTH(N'dbo.Users', N'TotalXP') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD TotalXP INT NOT NULL CONSTRAINT DF_Users_TotalXP DEFAULT (0);
END;
GO

IF COL_LENGTH(N'dbo.Users', N'CurrentLevel') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD CurrentLevel INT NOT NULL CONSTRAINT DF_Users_CurrentLevel DEFAULT (1);
END;
GO

IF OBJECT_ID(N'dbo.UserXPEvents', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserXPEvents
    (
        XPEventID     BIGINT IDENTITY(1,1) NOT NULL,
        UserID        BIGINT NOT NULL,
        EventType     NVARCHAR(50) NOT NULL,
        XPAmount      INT NOT NULL,
        SourceKey     NVARCHAR(200) NULL,
        MetadataJson  NVARCHAR(MAX) NULL,
        CreatedAt     DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_UserXPEvents_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_UserXPEvents PRIMARY KEY CLUSTERED (XPEventID),
        CONSTRAINT FK_UserXPEvents_UserID FOREIGN KEY (UserID)
            REFERENCES dbo.Users(UserID)
            ON DELETE CASCADE,
        CONSTRAINT CK_UserXPEvents_XPAmount CHECK (XPAmount > 0),
        CONSTRAINT CK_UserXPEvents_MetadataJson CHECK
            (MetadataJson IS NULL OR ISJSON(MetadataJson) = 1)
    );
END;
GO

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
GO

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
GO

IF OBJECT_ID(N'dbo.Achievements', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Achievements
    (
        AchievementID  INT IDENTITY(1,1) NOT NULL,
        Code           NVARCHAR(80) NOT NULL,
        Name           NVARCHAR(200) NOT NULL,
        Description    NVARCHAR(500) NOT NULL,
        Icon           NVARCHAR(20) NOT NULL,
        CriteriaType   NVARCHAR(50) NOT NULL,
        CriteriaValue  INT NOT NULL,
        DisplayOrder   INT NOT NULL,
        IsActive       BIT NOT NULL CONSTRAINT DF_Achievements_IsActive DEFAULT (1),
        CreatedAt      DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_Achievements_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_Achievements PRIMARY KEY CLUSTERED (AchievementID),
        CONSTRAINT UQ_Achievements_Code UNIQUE (Code),
        CONSTRAINT CK_Achievements_CriteriaValue CHECK (CriteriaValue > 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.UserAchievements', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserAchievements
    (
        UserAchievementID  BIGINT IDENTITY(1,1) NOT NULL,
        UserID             BIGINT NOT NULL,
        AchievementID      INT NOT NULL,
        UnlockedAt         DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_UserAchievements_UnlockedAt DEFAULT (SYSDATETIMEOFFSET()),
        SeenAt             DATETIMEOFFSET(7) NULL,

        CONSTRAINT PK_UserAchievements PRIMARY KEY CLUSTERED (UserAchievementID),
        CONSTRAINT FK_UserAchievements_UserID FOREIGN KEY (UserID)
            REFERENCES dbo.Users(UserID)
            ON DELETE CASCADE,
        CONSTRAINT FK_UserAchievements_AchievementID FOREIGN KEY (AchievementID)
            REFERENCES dbo.Achievements(AchievementID),
        CONSTRAINT UQ_UserAchievements_User_Achievement UNIQUE (UserID, AchievementID)
    );
END;
GO

MERGE dbo.Achievements AS target
USING (VALUES
    (N'FIRST_WORD',       N'First Word',        N'Learn your first vocabulary word.',        N'🌱', N'WORDS_LEARNED',  1,  1),
    (N'WORDS_100',        N'First 100 Words',   N'Learn 100 vocabulary words.',              N'📚', N'WORDS_LEARNED',  100, 2),
    (N'STREAK_7',         N'7 Day Streak',      N'Learn for 7 consecutive days.',            N'🔥', N'STREAK_DAYS',    7,  3),
    (N'STREAK_30',        N'30 Day Streak',     N'Learn for 30 consecutive days.',           N'⚡', N'STREAK_DAYS',    30, 4),
    (N'TEST_SCORE_90',    N'Test Ace',          N'Score at least 90 percent on a mini test.', N'🎯', N'TEST_SCORE',     90, 5),
    (N'LEVEL_5',          N'Level Five',        N'Reach learner level 5.',                   N'🏆', N'LEVEL',          5,  6)
) AS source (Code, Name, Description, Icon, CriteriaType, CriteriaValue, DisplayOrder)
ON target.Code = source.Code
WHEN MATCHED THEN
    UPDATE SET Name = source.Name,
               Description = source.Description,
               Icon = source.Icon,
               CriteriaType = source.CriteriaType,
               CriteriaValue = source.CriteriaValue,
               DisplayOrder = source.DisplayOrder,
               IsActive = 1
WHEN NOT MATCHED THEN
    INSERT (Code, Name, Description, Icon, CriteriaType, CriteriaValue, DisplayOrder)
    VALUES (source.Code, source.Name, source.Description, source.Icon,
            source.CriteriaType, source.CriteriaValue, source.DisplayOrder);
GO
