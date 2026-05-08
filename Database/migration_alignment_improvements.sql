/*
    Alignment improvements for VocaBoost TOEIC platform.
    Run after prototype_database.sql and migration_dynamic_permissions.sql.
*/

USE ToeicVocabularyPlatform;
GO

/* TOEIC examples */
IF COL_LENGTH('dbo.ExampleSentences', 'ExampleSource') IS NULL
BEGIN
    ALTER TABLE dbo.ExampleSentences
    ADD ExampleSource NVARCHAR(50) NOT NULL
        CONSTRAINT DF_ExampleSentences_ExampleSource DEFAULT (N'General');
END
GO

IF COL_LENGTH('dbo.ExampleSentences', 'PartNumber') IS NULL
BEGIN
    ALTER TABLE dbo.ExampleSentences
    ADD PartNumber INT NULL;
END
GO

IF OBJECT_ID(N'dbo.CK_ExampleSentences_ExampleSource', N'C') IS NULL
BEGIN
    ALTER TABLE dbo.ExampleSentences
    ADD CONSTRAINT CK_ExampleSentences_ExampleSource
        CHECK (ExampleSource IN (N'TOEIC', N'General', N'Daily'));
END
GO

IF OBJECT_ID(N'dbo.CK_ExampleSentences_PartNumber', N'C') IS NULL
BEGIN
    ALTER TABLE dbo.ExampleSentences
    ADD CONSTRAINT CK_ExampleSentences_PartNumber
        CHECK (PartNumber IS NULL OR PartNumber BETWEEN 1 AND 7);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ExampleSentences_SourcePart' AND object_id = OBJECT_ID('dbo.ExampleSentences'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_ExampleSentences_SourcePart
    ON dbo.ExampleSentences (ExampleSource, PartNumber)
    INCLUDE (WordID);
END
GO

/* Part 1-7 classification */
IF OBJECT_ID(N'dbo.PartsClassification', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PartsClassification
    (
        PartID INT IDENTITY(1,1) NOT NULL,
        PartNumber INT NOT NULL,
        PartName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        VocabularyCount INT NOT NULL CONSTRAINT DF_PartsClassification_VocabularyCount DEFAULT (0),
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_PartsClassification_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_PartsClassification PRIMARY KEY CLUSTERED (PartID),
        CONSTRAINT UQ_PartsClassification_PartNumber UNIQUE (PartNumber),
        CONSTRAINT CK_PartsClassification_PartNumber CHECK (PartNumber BETWEEN 1 AND 7)
    );
END
GO

MERGE dbo.PartsClassification AS target
USING
(
    VALUES
    (1, N'Photographs', N'Describe people, objects, and scenes'),
    (2, N'Question-Response', N'Short questions and responses'),
    (3, N'Conversations', N'Business and workplace conversations'),
    (4, N'Talks', N'Short announcements, talks, and messages'),
    (5, N'Incomplete Sentences', N'Vocabulary and grammar in short sentences'),
    (6, N'Text Completion', N'Choose words or phrases to complete passages'),
    (7, N'Reading Comprehension', N'Single and multiple reading passages')
) AS source (PartNumber, PartName, Description)
ON target.PartNumber = source.PartNumber
WHEN MATCHED THEN
    UPDATE SET PartName = source.PartName, Description = source.Description
WHEN NOT MATCHED THEN
    INSERT (PartNumber, PartName, Description)
    VALUES (source.PartNumber, source.PartName, source.Description);
GO

IF OBJECT_ID(N'dbo.WordPartsAssignment', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WordPartsAssignment
    (
        WordID BIGINT NOT NULL,
        PartID INT NOT NULL,
        RelevancyScore INT NOT NULL CONSTRAINT DF_WordPartsAssignment_RelevancyScore DEFAULT (1),
        AssignedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_WordPartsAssignment_AssignedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_WordPartsAssignment PRIMARY KEY CLUSTERED (WordID, PartID),
        CONSTRAINT FK_WordPartsAssignment_WordID FOREIGN KEY (WordID)
            REFERENCES dbo.Words(WordID) ON DELETE CASCADE,
        CONSTRAINT FK_WordPartsAssignment_PartID FOREIGN KEY (PartID)
            REFERENCES dbo.PartsClassification(PartID) ON DELETE CASCADE,
        CONSTRAINT CK_WordPartsAssignment_RelevancyScore CHECK (RelevancyScore BETWEEN 1 AND 5)
    );
END
GO

/* Question type expansion */
IF OBJECT_ID(N'dbo.CK_Questions_QuestionType', N'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Questions DROP CONSTRAINT CK_Questions_QuestionType;
END
GO

ALTER TABLE dbo.Questions
ADD CONSTRAINT CK_Questions_QuestionType CHECK
(
    QuestionType IN
    (
        N'MCQ',
        N'FillBlank',
        N'DragDrop',
        N'Dictation',
        N'FlashcardCheck',
        N'AudioRecognition'
    )
);
GO

/* Notifications */
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications
    (
        NotificationID BIGINT IDENTITY(1,1) NOT NULL,
        UserID BIGINT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message NVARCHAR(2000) NOT NULL,
        Type NVARCHAR(30) NOT NULL,
        IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
        DeliveryChannel NVARCHAR(20) NOT NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        ReadAt DATETIMEOFFSET(7) NULL,
        ActionUrl NVARCHAR(500) NULL,

        CONSTRAINT PK_Notifications PRIMARY KEY CLUSTERED (NotificationID),
        CONSTRAINT FK_Notifications_UserID FOREIGN KEY (UserID)
            REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
        CONSTRAINT CK_Notifications_Type CHECK (Type IN (N'DailyReminder', N'Achievement', N'WeakWords', N'CourseComplete', N'Announcement')),
        CONSTRAINT CK_Notifications_DeliveryChannel CHECK (DeliveryChannel IN (N'Email', N'PushNotification', N'InApp'))
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Notifications_UserID_CreatedAt' AND object_id = OBJECT_ID('dbo.Notifications'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Notifications_UserID_CreatedAt
    ON dbo.Notifications (UserID, CreatedAt DESC);
END
GO

/* Time-to-mastery projection */
CREATE OR ALTER VIEW dbo.vw_MasteryTimelineProjection
AS
SELECT
    u.UserID,
    COUNT(DISTINCT uwp.WordID) AS TotalWords,
    SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) AS MasteredWords,
    CAST(
        SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) * 100.0 /
        NULLIF(COUNT(DISTINCT uwp.WordID), 0)
        AS DECIMAL(5,2)
    ) AS CompletionPercentage,
    CASE
        WHEN COUNT(DISTINCT uwp.WordID) = 0 THEN NULL
        WHEN SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) = 0 THEN NULL
        WHEN DATEDIFF(DAY, MIN(uwp.CreatedAt), SYSDATETIMEOFFSET()) <= 0 THEN NULL
        ELSE CAST(
            ((COUNT(DISTINCT uwp.WordID) - SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END)) * 1.0) /
            NULLIF(SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) * 1.0 /
            NULLIF(DATEDIFF(DAY, MIN(uwp.CreatedAt), SYSDATETIMEOFFSET()), 0), 0)
            AS INT
        )
    END AS EstimatedDaysToMastery,
    CASE
        WHEN COUNT(DISTINCT uwp.WordID) = 0 THEN NULL
        WHEN SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) = 0 THEN DATEADD(DAY, 365, SYSDATETIMEOFFSET())
        WHEN DATEDIFF(DAY, MIN(uwp.CreatedAt), SYSDATETIMEOFFSET()) <= 0 THEN DATEADD(DAY, 30, SYSDATETIMEOFFSET())
        ELSE DATEADD(DAY,
            CAST(
                ((COUNT(DISTINCT uwp.WordID) - SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END)) * 1.0) /
                NULLIF(SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) * 1.0 /
                NULLIF(DATEDIFF(DAY, MIN(uwp.CreatedAt), SYSDATETIMEOFFSET()), 0), 0)
                AS INT
            ),
            SYSDATETIMEOFFSET()
        )
    END AS ProjectedCompletionDate
FROM dbo.Users AS u
LEFT JOIN dbo.UserWordProgress AS uwp
    ON u.UserID = uwp.UserID
GROUP BY u.UserID;
GO

/* Multi-language and multi-certification foundation */
IF OBJECT_ID(N'dbo.Certifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Certifications
    (
        CertificationID INT IDENTITY(1,1) NOT NULL,
        CertificationCode NVARCHAR(20) NOT NULL,
        CertificationName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,

        CONSTRAINT PK_Certifications PRIMARY KEY CLUSTERED (CertificationID),
        CONSTRAINT UQ_Certifications_Code UNIQUE (CertificationCode)
    );
END
GO

IF OBJECT_ID(N'dbo.Languages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Languages
    (
        LanguageID INT IDENTITY(1,1) NOT NULL,
        LanguageCode NVARCHAR(5) NOT NULL,
        LanguageName NVARCHAR(100) NOT NULL,

        CONSTRAINT PK_Languages PRIMARY KEY CLUSTERED (LanguageID),
        CONSTRAINT UQ_Languages_Code UNIQUE (LanguageCode)
    );
END
GO

MERGE dbo.Certifications AS target
USING (VALUES (N'TOEIC', N'TOEIC', N'Test of English for International Communication')) AS source (CertificationCode, CertificationName, Description)
ON target.CertificationCode = source.CertificationCode
WHEN NOT MATCHED THEN
    INSERT (CertificationCode, CertificationName, Description)
    VALUES (source.CertificationCode, source.CertificationName, source.Description);
GO

MERGE dbo.Languages AS target
USING (VALUES (N'en', N'English'), (N'vi', N'Vietnamese')) AS source (LanguageCode, LanguageName)
ON target.LanguageCode = source.LanguageCode
WHEN NOT MATCHED THEN
    INSERT (LanguageCode, LanguageName)
    VALUES (source.LanguageCode, source.LanguageName);
GO

IF OBJECT_ID(N'dbo.WordCertifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WordCertifications
    (
        WordID BIGINT NOT NULL,
        CertificationID INT NOT NULL,

        CONSTRAINT PK_WordCertifications PRIMARY KEY CLUSTERED (WordID, CertificationID),
        CONSTRAINT FK_WordCertifications_WordID FOREIGN KEY (WordID)
            REFERENCES dbo.Words(WordID) ON DELETE CASCADE,
        CONSTRAINT FK_WordCertifications_CertificationID FOREIGN KEY (CertificationID)
            REFERENCES dbo.Certifications(CertificationID) ON DELETE CASCADE
    );
END
GO

IF COL_LENGTH('dbo.Users', 'PreferredLanguageID') IS NULL
BEGIN
    ALTER TABLE dbo.Users ADD PreferredLanguageID INT NULL;
    ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_PreferredLanguageID
        FOREIGN KEY (PreferredLanguageID) REFERENCES dbo.Languages(LanguageID);
END
GO

IF COL_LENGTH('dbo.Topics', 'LanguageID') IS NULL
BEGIN
    DECLARE @EnglishID INT = (SELECT TOP 1 LanguageID FROM dbo.Languages WHERE LanguageCode = N'en');
    ALTER TABLE dbo.Topics ADD LanguageID INT NULL;
    EXEC sp_executesql N'UPDATE dbo.Topics SET LanguageID = @EnglishID WHERE LanguageID IS NULL', N'@EnglishID INT', @EnglishID;
    ALTER TABLE dbo.Topics ALTER COLUMN LanguageID INT NOT NULL;
    ALTER TABLE dbo.Topics ADD CONSTRAINT FK_Topics_LanguageID
        FOREIGN KEY (LanguageID) REFERENCES dbo.Languages(LanguageID);
END
GO

/* Optional permission for notification management */
IF OBJECT_ID(N'dbo.Permissions', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.Permissions WHERE PermissionCode = 'MANAGE_NOTIFICATIONS')
BEGIN
    INSERT INTO dbo.Permissions (PermissionCode, PermissionName)
    VALUES ('MANAGE_NOTIFICATIONS', N'Quản lý thông báo');
END
GO

IF OBJECT_ID(N'dbo.RolePermissions', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.Roles', N'U') IS NOT NULL
BEGIN
    DECLARE @AdminRoleID INT = (SELECT TOP 1 RoleID FROM dbo.Roles WHERE RoleName = 'Admin');
    DECLARE @PermissionID INT = (SELECT TOP 1 PermissionID FROM dbo.Permissions WHERE PermissionCode = 'MANAGE_NOTIFICATIONS');

    IF @AdminRoleID IS NOT NULL AND @PermissionID IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.RolePermissions WHERE RoleID = @AdminRoleID AND PermissionID = @PermissionID)
    BEGIN
        INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
        VALUES (@AdminRoleID, @PermissionID);
    END
END
GO
