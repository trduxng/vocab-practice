/*
 ============================================================
 DATABASE SCHEMA: TOEIC Vocabulary Learning Platform New
 Target RDBMS      : Microsoft SQL Server
 Naming convention : PascalCase for tables
 Author role       : Database Architect
 Notes:
 - Use DATETIMEOFFSET for all important timestamps.
 - Questions.OptionsJson uses ISJSON() for flexible exercise metadata.
 - UserWordProgress is the core table for spaced repetition.
 ============================================================
 */
SET
    ANSI_NULLS ON;

SET
    QUOTED_IDENTIFIER ON;

GO
    /* ============================================================
     1. CREATE DATABASE
     ============================================================ */
    IF DB_ID(N'ToeicVocabularyPlatform') IS NULL BEGIN CREATE DATABASE ToeicVocabularyPlatform_new;

END
GO
    USE ToeicVocabularyPlatform_new;

GO
    /* ============================================================
     2. DROP OBJECTS IF EXISTS (safe re-run script)
     ============================================================ */
    IF OBJECT_ID(N'dbo.usp_SubmitQuestionAttempt', N'P') IS NOT NULL DROP PROCEDURE dbo.usp_SubmitQuestionAttempt;

IF OBJECT_ID(N'dbo.ExerciseAttempts', N'U') IS NOT NULL DROP TABLE dbo.ExerciseAttempts;

IF OBJECT_ID(N'dbo.MiniTestItems', N'U') IS NOT NULL DROP TABLE dbo.MiniTestItems;

IF OBJECT_ID(N'dbo.MiniTests', N'U') IS NOT NULL DROP TABLE dbo.MiniTests;

IF OBJECT_ID(N'dbo.UserWordProgress', N'U') IS NOT NULL DROP TABLE dbo.UserWordProgress;

IF OBJECT_ID(N'dbo.Questions', N'U') IS NOT NULL DROP TABLE dbo.Questions;

IF OBJECT_ID(N'dbo.WordTopics', N'U') IS NOT NULL DROP TABLE dbo.WordTopics;

IF OBJECT_ID(N'dbo.ExampleSentences', N'U') IS NOT NULL DROP TABLE dbo.ExampleSentences;

IF OBJECT_ID(N'dbo.Words', N'U') IS NOT NULL DROP TABLE dbo.Words;

IF OBJECT_ID(N'dbo.Topics', N'U') IS NOT NULL DROP TABLE dbo.Topics;

IF OBJECT_ID(N'dbo.PartOfSpeeches', N'U') IS NOT NULL DROP TABLE dbo.PartOfSpeeches;

IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;

GO
    /* ============================================================
     3. MASTER TABLES
     ============================================================ */
    /* ----------------------------
     3.1 Users
     - 3 roles: Learner, ContentCreator, Admin
     ---------------------------- */
    CREATE TABLE dbo.Users (
        UserID BIGINT IDENTITY(1, 1) NOT NULL,
        FullName NVARCHAR(200) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        PasswordHash NVARCHAR(500) NOT NULL,
        UserRole NVARCHAR(30) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserID),
        CONSTRAINT UQ_Users_Email UNIQUE (Email),
        CONSTRAINT CK_Users_UserRole CHECK (
            UserRole IN (N'Learner', N'ContentCreator', N'Admin')
        )
    );

GO
    /* ----------------------------
     3.2 PartOfSpeeches
     ---------------------------- */
    CREATE TABLE dbo.PartOfSpeeches (
        PartOfSpeechID INT IDENTITY(1, 1) NOT NULL,
        PartOfSpeechCode NVARCHAR(20) NOT NULL,
        PartOfSpeechName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(255) NULL,
        CONSTRAINT PK_PartOfSpeeches PRIMARY KEY CLUSTERED (PartOfSpeechID),
        CONSTRAINT UQ_PartOfSpeeches_Code UNIQUE (PartOfSpeechCode),
        CONSTRAINT UQ_PartOfSpeeches_Name UNIQUE (PartOfSpeechName)
    );

GO
    /* ----------------------------
     3.3 Topics
     - One word can belong to many topics
     ---------------------------- */
    CREATE TABLE dbo.Topics (
        TopicID BIGINT IDENTITY(1, 1) NOT NULL,
        TopicName NVARCHAR(200) NOT NULL,
        TopicCode NVARCHAR(50) NOT NULL,
        Description NVARCHAR(1000) NULL,
        CreatedByUserID BIGINT NOT NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Topics_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Topics_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_Topics PRIMARY KEY CLUSTERED (TopicID),
        CONSTRAINT UQ_Topics_TopicName UNIQUE (TopicName),
        CONSTRAINT UQ_Topics_TopicCode UNIQUE (TopicCode),
        CONSTRAINT FK_Topics_CreatedByUserID FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

GO
    /* ============================================================
     4. VOCABULARY CONTENT TABLES
     ============================================================ */
    /* ----------------------------
     4.1 Words
     - Multimedia vocabulary content
     ---------------------------- */
    CREATE TABLE dbo.Words (
        WordID BIGINT IDENTITY(1, 1) NOT NULL,
        Term NVARCHAR(200) NOT NULL,
        PartOfSpeechID INT NOT NULL,
        Meaning NVARCHAR(1000) NOT NULL,
        Phonetic NVARCHAR(255) NULL,
        AudioUrlUK NVARCHAR(1000) NULL,
        AudioUrlUS NVARCHAR(1000) NULL,
        ImageUrl NVARCHAR(1000) NULL,
        DifficultyLevel TINYINT NOT NULL CONSTRAINT DF_Words_DifficultyLevel DEFAULT (1),
        CreatedByUserID BIGINT NOT NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Words_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Words_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_Words PRIMARY KEY CLUSTERED (WordID),
        CONSTRAINT FK_Words_PartOfSpeechID FOREIGN KEY (PartOfSpeechID) REFERENCES dbo.PartOfSpeeches(PartOfSpeechID) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT FK_Words_CreatedByUserID FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT UQ_Words_Term_PartOfSpeech UNIQUE (Term, PartOfSpeechID),
        CONSTRAINT CK_Words_DifficultyLevel CHECK (
            DifficultyLevel BETWEEN 1
            AND 5
        )
    );

GO
    /* ----------------------------
     4.2 ExampleSentences
     - One word has many example sentences (1:N)
     ---------------------------- */
    CREATE TABLE dbo.ExampleSentences (
        ExampleSentenceID BIGINT IDENTITY(1, 1) NOT NULL,
        WordID BIGINT NOT NULL,
        SentenceText NVARCHAR(2000) NOT NULL,
        SentenceTranslation NVARCHAR(2000) NULL,
        AudioUrl NVARCHAR(1000) NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ExampleSentences_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ExampleSentences_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_ExampleSentences PRIMARY KEY CLUSTERED (ExampleSentenceID),
        CONSTRAINT FK_ExampleSentences_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID) ON DELETE CASCADE ON UPDATE NO ACTION
    );

GO
    /* ----------------------------
     4.3 WordTopics
     - Many-to-many: Words <-> Topics
     ---------------------------- */
    CREATE TABLE dbo.WordTopics (
        WordID BIGINT NOT NULL,
        TopicID BIGINT NOT NULL,
        AssignedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_WordTopics_AssignedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_WordTopics PRIMARY KEY CLUSTERED (WordID, TopicID),
        CONSTRAINT FK_WordTopics_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT FK_WordTopics_TopicID FOREIGN KEY (TopicID) REFERENCES dbo.Topics(TopicID) ON DELETE CASCADE ON UPDATE NO ACTION
    );

GO
    /* ============================================================
     5. QUESTION / EXERCISE TABLES
     ============================================================ */
    /* ----------------------------
     5.1 Questions
     - One word has many questions (1:N)
     - OptionsJson stores MCQ options, fill-in-blank metadata, etc.
     - Enforced by ISJSON()
     ---------------------------- */
    CREATE TABLE dbo.Questions (
        QuestionID BIGINT IDENTITY(1, 1) NOT NULL,
        WordID BIGINT NOT NULL,
        QuestionType NVARCHAR(30) NOT NULL,
        QuestionText NVARCHAR(2000) NOT NULL,
        OptionsJson NVARCHAR(MAX) NOT NULL,
        CorrectAnswer NVARCHAR(500) NOT NULL,
        Explanation NVARCHAR(2000) NULL,
        DifficultyLevel TINYINT NOT NULL CONSTRAINT DF_Questions_DifficultyLevel DEFAULT (1),
        CreatedByUserID BIGINT NOT NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Questions_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Questions_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_Questions PRIMARY KEY CLUSTERED (QuestionID),
        CONSTRAINT FK_Questions_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT FK_Questions_CreatedByUserID FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT CK_Questions_QuestionType CHECK (
            QuestionType IN (
                N'MCQ',
                N'FillBlank',
                N'DragDrop',
                N'Dictation',
                N'FlashcardCheck'
            )
        ),
        CONSTRAINT CK_Questions_DifficultyLevel CHECK (
            DifficultyLevel BETWEEN 1
            AND 5
        ),
        CONSTRAINT CK_Questions_OptionsJson_IsJson CHECK (ISJSON(OptionsJson) = 1)
    );

GO
    /* ============================================================
     6. LEARNING PROGRESS TABLES
     ============================================================ */
    /* ----------------------------
     6.1 UserWordProgress
     - Most critical learning table
     - One learner has one progress row per word
     - UNIQUE(UserID, WordID) required
     - Supports spaced repetition scheduling
     ---------------------------- */
    CREATE TABLE dbo.UserWordProgress (
        UserWordProgressID BIGINT IDENTITY(1, 1) NOT NULL,
        UserID BIGINT NOT NULL,
        WordID BIGINT NOT NULL,
        MasteryLevel TINYINT NOT NULL CONSTRAINT DF_UserWordProgress_MasteryLevel DEFAULT (0),
        EaseFactor DECIMAL(4, 2) NOT NULL CONSTRAINT DF_UserWordProgress_EaseFactor DEFAULT (2.50),
        RepetitionCount INT NOT NULL CONSTRAINT DF_UserWordProgress_RepetitionCount DEFAULT (0),
        ConsecutiveCorrect INT NOT NULL CONSTRAINT DF_UserWordProgress_ConsecutiveCorrect DEFAULT (0),
        ConsecutiveWrong INT NOT NULL CONSTRAINT DF_UserWordProgress_ConsecutiveWrong DEFAULT (0),
        LastReviewedAt DATETIMEOFFSET(7) NULL,
        NextReviewDate DATETIMEOFFSET(7) NULL,
        LastScore DECIMAL(5, 2) NULL,
        MemoryStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_UserWordProgress_MemoryStatus DEFAULT (N 'New'),
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserWordProgress_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserWordProgress_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_UserWordProgress PRIMARY KEY CLUSTERED (UserWordProgressID),
        CONSTRAINT FK_UserWordProgress_UserID FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT FK_UserWordProgress_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT UQ_UserWordProgress_UserID_WordID UNIQUE (UserID, WordID),
        CONSTRAINT CK_UserWordProgress_MasteryLevel CHECK (
            MasteryLevel BETWEEN 0
            AND 10
        ),
        CONSTRAINT CK_UserWordProgress_EaseFactor CHECK (
            EaseFactor BETWEEN 1.30
            AND 3.50
        ),
        CONSTRAINT CK_UserWordProgress_RepetitionCount CHECK (RepetitionCount >= 0),
        CONSTRAINT CK_UserWordProgress_ConsecutiveCorrect CHECK (ConsecutiveCorrect >= 0),
        CONSTRAINT CK_UserWordProgress_ConsecutiveWrong CHECK (ConsecutiveWrong >= 0),
        CONSTRAINT CK_UserWordProgress_LastScore CHECK (
            LastScore IS NULL
            OR (
                LastScore BETWEEN 0
                AND 100
            )
        ),
        CONSTRAINT CK_UserWordProgress_MemoryStatus CHECK (
            MemoryStatus IN (
                N 'New',
                N'Learning',
                N'Reviewing',
                N'Mastered',
                N'Lapsed'
            )
        )
    );

GO
    /* ----------------------------
     6.2 ExerciseAttempts
     - Attempt history log for each submitted exercise
     ---------------------------- */
    CREATE TABLE dbo.ExerciseAttempts (
        ExerciseAttemptID BIGINT IDENTITY(1, 1) NOT NULL,
        UserID BIGINT NOT NULL,
        QuestionID BIGINT NOT NULL,
        WordID BIGINT NOT NULL,
        SubmittedAnswer NVARCHAR(1000) NOT NULL,
        IsCorrect BIT NOT NULL,
        ScoreAwarded DECIMAL(5, 2) NOT NULL,
        AttemptedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ExerciseAttempts_AttemptedAt DEFAULT (SYSDATETIMEOFFSET()),
        ClientTimeZoneOffset NVARCHAR(10) NULL,
        AttemptMetadataJson NVARCHAR(MAX) NULL,
        CONSTRAINT PK_ExerciseAttempts PRIMARY KEY CLUSTERED (ExerciseAttemptID),
        CONSTRAINT FK_ExerciseAttempts_UserID FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT FK_ExerciseAttempts_QuestionID FOREIGN KEY (QuestionID) REFERENCES dbo.Questions(QuestionID) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT FK_ExerciseAttempts_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT CK_ExerciseAttempts_ScoreAwarded CHECK (
            ScoreAwarded BETWEEN 0
            AND 100
        ),
        CONSTRAINT CK_ExerciseAttempts_AttemptMetadataJson_IsJson CHECK (
            AttemptMetadataJson IS NULL
            OR ISJSON(AttemptMetadataJson) = 1
        )
    );

GO
    /* ============================================================
     7. MINI TEST TABLES
     ============================================================ */
    /* ----------------------------
     7.1 MiniTests
     ---------------------------- */
    CREATE TABLE dbo.MiniTests (
        MiniTestID BIGINT IDENTITY(1, 1) NOT NULL,
        TopicID BIGINT NULL,
        TestTitle NVARCHAR(255) NOT NULL,
        Description NVARCHAR(1000) NULL,
        CreatedByUserID BIGINT NOT NULL,
        TotalQuestions INT NOT NULL CONSTRAINT DF_MiniTests_TotalQuestions DEFAULT (0),
        IsPublished BIT NOT NULL CONSTRAINT DF_MiniTests_IsPublished DEFAULT (0),
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_MiniTests_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_MiniTests_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_MiniTests PRIMARY KEY CLUSTERED (MiniTestID),
        CONSTRAINT FK_MiniTests_TopicID FOREIGN KEY (TopicID) REFERENCES dbo.Topics(TopicID) ON DELETE
        SET
            NULL ON UPDATE NO ACTION,
            CONSTRAINT FK_MiniTests_CreatedByUserID FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID) ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT CK_MiniTests_TotalQuestions CHECK (TotalQuestions >= 0)
    );

GO
    /* ----------------------------
     7.2 MiniTestItems
     - Bridge table MiniTest <-> Questions
     ---------------------------- */
    CREATE TABLE dbo.MiniTestItems (
        MiniTestID BIGINT NOT NULL,
        QuestionID BIGINT NOT NULL,
        DisplayOrder INT NOT NULL,
        CONSTRAINT PK_MiniTestItems PRIMARY KEY CLUSTERED (MiniTestID, QuestionID),
        CONSTRAINT FK_MiniTestItems_MiniTestID FOREIGN KEY (MiniTestID) REFERENCES dbo.MiniTests(MiniTestID) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT FK_MiniTestItems_QuestionID FOREIGN KEY (QuestionID) REFERENCES dbo.Questions(QuestionID) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT UQ_MiniTestItems_MiniTestID_DisplayOrder UNIQUE (MiniTestID, DisplayOrder),
        CONSTRAINT CK_MiniTestItems_DisplayOrder CHECK (DisplayOrder > 0)
    );

GO
    /* ============================================================
     8. INDEXES FOR PERFORMANCE
     ============================================================ */
    /* UserWordProgress indexes */
    CREATE NONCLUSTERED INDEX IX_UserWordProgress_UserID ON dbo.UserWordProgress (UserID);

GO
    CREATE NONCLUSTERED INDEX IX_UserWordProgress_WordID ON dbo.UserWordProgress (WordID);

GO
    CREATE NONCLUSTERED INDEX IX_UserWordProgress_UserID_NextReviewDate ON dbo.UserWordProgress (UserID, NextReviewDate) INCLUDE (
        WordID,
        MasteryLevel,
        MemoryStatus,
        RepetitionCount,
        EaseFactor
    );

GO
    CREATE NONCLUSTERED INDEX IX_UserWordProgress_NextReviewDate ON dbo.UserWordProgress (NextReviewDate) INCLUDE (UserID, WordID, MemoryStatus);

GO
    /* Questions indexes */
    CREATE NONCLUSTERED INDEX IX_Questions_WordID ON dbo.Questions (WordID);

GO
    CREATE NONCLUSTERED INDEX IX_Questions_CreatedByUserID ON dbo.Questions (CreatedByUserID);

GO
    /* WordTopics indexes */
    CREATE NONCLUSTERED INDEX IX_WordTopics_TopicID ON dbo.WordTopics (TopicID);

GO
    /* ExerciseAttempts indexes */
    CREATE NONCLUSTERED INDEX IX_ExerciseAttempts_UserID_AttemptedAt ON dbo.ExerciseAttempts (UserID, AttemptedAt DESC) INCLUDE (QuestionID, WordID, IsCorrect, ScoreAwarded);

GO
    CREATE NONCLUSTERED INDEX IX_ExerciseAttempts_WordID ON dbo.ExerciseAttempts (WordID);

GO
    CREATE NONCLUSTERED INDEX IX_ExerciseAttempts_QuestionID ON dbo.ExerciseAttempts (QuestionID);

GO
    /* ExampleSentences indexes */
    CREATE NONCLUSTERED INDEX IX_ExampleSentences_WordID ON dbo.ExampleSentences (WordID);

GO
    /* Words indexes */
    CREATE NONCLUSTERED INDEX IX_Words_PartOfSpeechID ON dbo.Words (PartOfSpeechID);

GO
    CREATE NONCLUSTERED INDEX IX_Words_CreatedByUserID ON dbo.Words (CreatedByUserID);

GO
    /* MiniTests / MiniTestItems indexes */
    CREATE NONCLUSTERED INDEX IX_MiniTests_TopicID ON dbo.MiniTests (TopicID);

GO
    CREATE NONCLUSTERED INDEX IX_MiniTestItems_QuestionID ON dbo.MiniTestItems (QuestionID);

GO
    /* ============================================================
     9. STORED PROCEDURE: usp_SubmitQuestionAttempt
     - ACID-compliant question submission
     - Logs attempt to ExerciseAttempts
     - Updates UserWordProgress with SRS algorithm
     - Backend tự tính IsCorrect và ScoreAwarded
     ============================================================ */
    CREATE PROCEDURE dbo.usp_SubmitQuestionAttempt (
        @UserID BIGINT,
        @QuestionID BIGINT,
        @WordID BIGINT,
        @SubmittedAnswer NVARCHAR(1000),
        @IsCorrect BIT,
        @ScoreAwarded DECIMAL(5, 2),
        @ClientTimeZoneOffset NVARCHAR(10) = NULL,
        @AttemptMetadataJson NVARCHAR(MAX) = NULL
    ) AS BEGIN
SET
    NOCOUNT ON;

SET
    XACT_ABORT ON;

DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

DECLARE @UserWordProgressID BIGINT,
@MasteryLevel TINYINT,
@EaseFactor DECIMAL(4, 2),
@RepetitionCount INT,
@ConsecutiveCorrect INT,
@ConsecutiveWrong INT,
@MemoryStatus NVARCHAR(30),
@NextReviewDate DATETIMEOFFSET(7),
@IntervalDays INT;

BEGIN TRY BEGIN TRAN;

-- Validate user
IF NOT EXISTS (
    SELECT
        1
    FROM
        dbo.Users
    WHERE
        UserID = @UserID
        AND IsActive = 1
) BEGIN THROW 50003,
N'UserID không hợp lệ hoặc đã bị vô hiệu hóa.',
1;

END -- Validate question
IF NOT EXISTS (
    SELECT
        1
    FROM
        dbo.Questions
    WHERE
        QuestionID = @QuestionID
        AND WordID = @WordID
) BEGIN THROW 50002,
N'QuestionID không tồn tại hoặc không khớp với WordID.',
1;

END -- 1) Log attempt history
INSERT INTO
    dbo.ExerciseAttempts (
        UserID,
        QuestionID,
        WordID,
        SubmittedAnswer,
        IsCorrect,
        ScoreAwarded,
        AttemptedAt,
        ClientTimeZoneOffset,
        AttemptMetadataJson
    )
VALUES
    (
        @UserID,
        @QuestionID,
        @WordID,
        @SubmittedAnswer,
        @IsCorrect,
        @ScoreAwarded,
        @Now,
        @ClientTimeZoneOffset,
        @AttemptMetadataJson
    );

-- 2) Get or create UserWordProgress
SELECT
    @UserWordProgressID = UserWordProgressID,
    @MasteryLevel = MasteryLevel,
    @EaseFactor = EaseFactor,
    @RepetitionCount = RepetitionCount,
    @ConsecutiveCorrect = ConsecutiveCorrect,
    @ConsecutiveWrong = ConsecutiveWrong,
    @MemoryStatus = MemoryStatus
FROM
    dbo.UserWordProgress WITH (UPDLOCK, HOLDLOCK)
WHERE
    UserID = @UserID
    AND WordID = @WordID;

IF @UserWordProgressID IS NULL BEGIN
INSERT INTO
    dbo.UserWordProgress (
        UserID,
        WordID,
        MasteryLevel,
        EaseFactor,
        RepetitionCount,
        ConsecutiveCorrect,
        ConsecutiveWrong,
        LastReviewedAt,
        NextReviewDate,
        LastScore,
        MemoryStatus
    )
VALUES
    (
        @UserID,
        @WordID,
        0,
        2.50,
        0,
        0,
        0,
        NULL,
        NULL,
        NULL,
        N 'New'
    );

SET
    @UserWordProgressID = SCOPE_IDENTITY();

SET
    @MasteryLevel = 0;

SET
    @EaseFactor = 2.50;

SET
    @RepetitionCount = 0;

SET
    @ConsecutiveCorrect = 0;

SET
    @ConsecutiveWrong = 0;

SET
    @MemoryStatus = N 'New';

END -- 3) Calculate SRS metrics
IF @IsCorrect = 1 BEGIN
SET
    @RepetitionCount = @RepetitionCount + 1;

SET
    @ConsecutiveCorrect = @ConsecutiveCorrect + 1;

SET
    @ConsecutiveWrong = 0;

SET
    @MasteryLevel = CASE
        WHEN @MasteryLevel < 10 THEN @MasteryLevel + 1
        ELSE 10
    END;

SET
    @EaseFactor = CASE
        WHEN @EaseFactor + 0.10 > 3.50 THEN 3.50
        ELSE @EaseFactor + 0.10
    END;

SET
    @IntervalDays = CASE
        WHEN @RepetitionCount = 1 THEN 1
        WHEN @RepetitionCount = 2 THEN 3
        WHEN @RepetitionCount = 3 THEN 7
        WHEN @RepetitionCount = 4 THEN 14
        WHEN @RepetitionCount = 5 THEN 30
        ELSE CAST(
            ROUND((@RepetitionCount * @EaseFactor * 10.0), 0) AS INT
        )
    END;

SET
    @NextReviewDate = DATEADD(DAY, @IntervalDays, @Now);

SET
    @MemoryStatus = CASE
        WHEN @MasteryLevel >= 8 THEN N'Mastered'
        WHEN @MasteryLevel >= 5 THEN N'Reviewing'
        ELSE N'Learning'
    END;

END
ELSE BEGIN
SET
    @RepetitionCount = 0;

SET
    @ConsecutiveCorrect = 0;

SET
    @ConsecutiveWrong = @ConsecutiveWrong + 1;

SET
    @MasteryLevel = CASE
        WHEN @MasteryLevel > 0 THEN @MasteryLevel - 1
        ELSE 0
    END;

SET
    @EaseFactor = CASE
        WHEN @EaseFactor - 0.20 < 1.30 THEN 1.30
        ELSE @EaseFactor - 0.20
    END;

SET
    @NextReviewDate = DATEADD(MINUTE, 30, @Now);

SET
    @MemoryStatus = N'Lapsed';

END -- 4) Update progress
UPDATE
    dbo.UserWordProgress
SET
    MasteryLevel = @MasteryLevel,
    EaseFactor = @EaseFactor,
    RepetitionCount = @RepetitionCount,
    ConsecutiveCorrect = @ConsecutiveCorrect,
    ConsecutiveWrong = @ConsecutiveWrong,
    LastReviewedAt = @Now,
    NextReviewDate = @NextReviewDate,
    LastScore = @ScoreAwarded,
    MemoryStatus = @MemoryStatus,
    UpdatedAt = @Now
WHERE
    UserWordProgressID = @UserWordProgressID;

COMMIT TRAN;

-- Return result for application layer
SELECT
    @UserID AS UserID,
    @QuestionID AS QuestionID,
    @WordID AS WordID,
    @IsCorrect AS IsCorrect,
    @ScoreAwarded AS ScoreAwarded,
    @MasteryLevel AS MasteryLevel,
    @EaseFactor AS EaseFactor,
    @RepetitionCount AS RepetitionCount,
    @MemoryStatus AS MemoryStatus,
    @NextReviewDate AS NextReviewDate,
    @Now AS ProcessedAt;

END TRY BEGIN CATCH IF @ @TRANCOUNT > 0 ROLLBACK TRAN;

DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();

DECLARE @ErrorNumber INT = ERROR_NUMBER();

DECLARE @ErrorLine INT = ERROR_LINE();

THROW 51000,
@ErrorMessage,
1;

END CATCH
END
GO
    /* ============================================================
     SCRIPT COMPLETE
     ============================================================ */
    PRINT N'Database ToeicVocabularyPlatform_new created successfully!';

GO
