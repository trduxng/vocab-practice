/*
  Seed data hoc tu vung cho ToeicVocabularyPlatform
  -------------------------------------------------
  - Tao 12 topic TOEIC.
  - Tao 720 tu/cum tu: 12 topic x 60 khai niem.
  - Tao ExampleSentences, Questions, MiniTests va MiniTestItems.
  - Neu co learner: tao enrollment, progress, attempts, notebook va mini-test history mau.
  - Neu da chay migration_gamification.sql: tao them XP history mau.
  - Neu da chay migration_learning_path.sql: gan 12 topic vao TOEIC 300/500/700/900.
  - Script idempotent: co the chay lai ma khong tao ban ghi trung.

  Huong dan:
  1. Chay schema chinh.
  2. Nen chay migration_gamification.sql va migration_learning_path.sql.
  3. Chay file nay.
  4. Chay repair_seed_vocabulary_learning_curated.sql de thay cac cum sinh may
     bang 600 muc tu TOEIC da duoc bien tap.
  5. Neu khong muon tao lich su hoc mau, doi @SeedLearnerProgress thanh 0.

  Luu y: file nay chi con la bootstrap legacy. Khong chay lai sau khi curated
  vocabulary da duoc cai dat.
*/

USE [ToeicVocabularyPlatform];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;

IF EXISTS (
    SELECT 1
    FROM dbo.Topics t
    JOIN dbo.WordTopics wt ON wt.TopicID = t.TopicID
    JOIN dbo.Words w ON w.WordID = wt.WordID
    WHERE t.TopicCode = N'SEED720-OFFICE'
      AND w.Term = N'agenda'
)
    THROW 50000, N'Curated vocabulary da ton tai. Khong chay lai bootstrap legacy; hay dung repair_seed_vocabulary_learning_curated.sql.', 1;

DECLARE @SeedLearnerProgress BIT = 1;
DECLARE @TargetLearnerEmail NVARCHAR(255) = NULL; -- NULL: tu chon learner active dau tien.
DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();
DECLARE @AuthorID BIGINT;
DECLARE @ReviewerID BIGINT;
DECLARE @LearnerID BIGINT;
DECLARE @NounPartOfSpeechID INT;
DECLARE @TopicCategoryID BIGINT;

SELECT TOP (1) @AuthorID = UserID
FROM dbo.Users
WHERE IsActive = 1
ORDER BY CASE UserRole WHEN N'Admin' THEN 1 WHEN N'ContentCreator' THEN 2 ELSE 3 END, UserID;

SELECT TOP (1) @ReviewerID = UserID
FROM dbo.Users
WHERE IsActive = 1 AND UserRole = N'Admin'
ORDER BY UserID;

SELECT TOP (1) @LearnerID = UserID
FROM dbo.Users
WHERE IsActive = 1
  AND UserRole = N'Learner'
  AND (@TargetLearnerEmail IS NULL OR Email = @TargetLearnerEmail)
ORDER BY UserID;

SELECT TOP (1) @NounPartOfSpeechID = PartOfSpeechID
FROM dbo.PartOfSpeeches
WHERE LOWER(PartOfSpeechCode) IN (N'n', N'noun')
   OR LOWER(PartOfSpeechName) = N'noun'
ORDER BY CASE WHEN LOWER(PartOfSpeechCode) = N'n' THEN 1 ELSE 2 END, PartOfSpeechID;

IF @AuthorID IS NULL
    THROW 50001, N'Can it nhat mot user active de lam CreatedByUserID.', 1;

IF @NounPartOfSpeechID IS NULL
    THROW 50002, N'Khong tim thay PartOfSpeeches cho noun. Hay seed PartOfSpeeches truoc.', 1;

IF @ReviewerID IS NULL
    SET @ReviewerID = @AuthorID;

BEGIN TRY
    BEGIN TRANSACTION;

    MERGE dbo.TopicCategories AS target
    USING (
        SELECT N'SEED720_TOEIC' AS CategoryCode,
               N'TOEIC Demo Learning Path' AS CategoryName,
               N'Du lieu demo TOEIC gom 720 tu va cum tu cho viec hoc, on tap va kiem tra.' AS Description
    ) AS source
    ON target.CategoryCode = source.CategoryCode
    WHEN MATCHED THEN
        UPDATE SET CategoryName = source.CategoryName,
                   Description = source.Description,
                   IsActive = 1,
                   UpdatedAt = @Now
    WHEN NOT MATCHED THEN
        INSERT (CategoryName, CategoryCode, Description, IconUrl, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
        VALUES (source.CategoryName, source.CategoryCode, source.Description, NULL, 20, 1, @AuthorID, @Now, @Now);

    SELECT @TopicCategoryID = TopicCategoryID
    FROM dbo.TopicCategories
    WHERE CategoryCode = N'SEED720_TOEIC';

    CREATE TABLE #SeedTopics
    (
        TopicOrder       INT NOT NULL,
        TopicCode        NVARCHAR(50) NOT NULL,
        TopicName        NVARCHAR(200) NOT NULL,
        Description      NVARCHAR(1000) NOT NULL,
        TermPrefix       NVARCHAR(80) NOT NULL,
        VietnameseLabel  NVARCHAR(200) NOT NULL,
        DifficultyLevel  TINYINT NOT NULL,
        LevelCode        NVARCHAR(30) NOT NULL,
        LevelTopicOrder  INT NOT NULL
    );

    INSERT #SeedTopics
        (TopicOrder, TopicCode, TopicName, Description, TermPrefix, VietnameseLabel, DifficultyLevel, LevelCode, LevelTopicOrder)
    VALUES
        (1,  N'SEED720-OFFICE',       N'Office Communication Essentials', N'Tu vung giao tiep, tai lieu va quy trinh van phong.',                   N'office',          N'van phong',                 1, N'TOEIC_300', 1),
        (2,  N'SEED720-HR',           N'Human Resources & Recruitment',  N'Tu vung tuyen dung, nhan su va dao tao noi bo.',                       N'human resources', N'nhan su',                   1, N'TOEIC_300', 2),
        (3,  N'SEED720-SALES',        N'Sales & Marketing Basics',       N'Tu vung ban hang, marketing va cham soc thi truong.',                  N'sales',           N'ban hang',                  2, N'TOEIC_300', 3),
        (4,  N'SEED720-FINANCE',      N'Finance & Accounting',           N'Tu vung tai chinh, ke toan va thanh toan doanh nghiep.',               N'finance',         N'tai chinh',                 2, N'TOEIC_500', 1),
        (5,  N'SEED720-CUSTOMER',     N'Customer Service Operations',    N'Tu vung ho tro khach hang va xu ly phan hoi.',                         N'customer service',N'dich vu khach hang',         2, N'TOEIC_500', 2),
        (6,  N'SEED720-TRAVEL',       N'Business Travel',                N'Tu vung di cong tac, dat cho va lich trinh.',                          N'travel',          N'du lich cong tac',          2, N'TOEIC_500', 3),
        (7,  N'SEED720-HOSPITALITY',  N'Hospitality & Events',           N'Tu vung khach san, hoi nghi va su kien.',                              N'hospitality',     N'khach san va su kien',       3, N'TOEIC_700', 1),
        (8,  N'SEED720-TECH',         N'Technology & Data',              N'Tu vung cong nghe, du lieu va he thong doanh nghiep.',                 N'technology',      N'cong nghe',                  3, N'TOEIC_700', 2),
        (9,  N'SEED720-LOGISTICS',    N'Logistics & Supply Chain',       N'Tu vung kho van, don hang va chuoi cung ung.',                         N'logistics',       N'logistics va chuoi cung ung',3, N'TOEIC_700', 3),
        (10, N'SEED720-PROJECT',      N'Project Management',             N'Tu vung lap ke hoach, theo doi va giao viec trong du an.',             N'project',         N'quan ly du an',              4, N'TOEIC_900', 1),
        (11, N'SEED720-COMPLIANCE',   N'Legal & Compliance',             N'Tu vung phap ly, kiem soat va tuan thu doanh nghiep.',                 N'compliance',      N'phap ly va tuan thu',        4, N'TOEIC_900', 2),
        (12, N'SEED720-PROFESSIONAL', N'Professional Development',       N'Tu vung phat trien nghe nghiep va hoc tap chuyen mon.',                N'professional',    N'phat trien nghe nghiep',     4, N'TOEIC_900', 3);

    MERGE dbo.Topics AS target
    USING #SeedTopics AS source
    ON target.TopicCode = source.TopicCode
    WHEN MATCHED THEN
        UPDATE SET TopicName = source.TopicName,
                   Description = source.Description,
                   TopicCategoryID = @TopicCategoryID,
                   ContentStatus = N'Published',
                   ReviewedByUserID = @ReviewerID,
                   ReviewedAt = COALESCE(target.ReviewedAt, @Now),
                   PublishedAt = COALESCE(target.PublishedAt, @Now),
                   UpdatedAt = @Now
    WHEN NOT MATCHED THEN
        INSERT (TopicName, TopicCode, Description, CreatedByUserID, CreatedAt, UpdatedAt, TopicCategoryID, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt)
        VALUES (source.TopicName, source.TopicCode, source.Description, @AuthorID, @Now, @Now, @TopicCategoryID, N'Published', @ReviewerID, @Now, @Now);

    CREATE TABLE #SeedConcepts
    (
        ConceptOrder INT NOT NULL,
        Term         NVARCHAR(100) NOT NULL,
        Meaning      NVARCHAR(300) NOT NULL
    );

    INSERT #SeedConcepts (ConceptOrder, Term, Meaning)
    VALUES
        (1,  N'policy',       N'chinh sach'),
        (2,  N'plan',         N'ke hoach'),
        (3,  N'report',       N'bao cao'),
        (4,  N'process',      N'quy trinh'),
        (5,  N'procedure',    N'thu tuc'),
        (6,  N'guideline',    N'huong dan'),
        (7,  N'checklist',    N'danh sach kiem tra'),
        (8,  N'request',      N'yeu cau'),
        (9,  N'approval',     N'su phe duyet'),
        (10, N'update',       N'ban cap nhat'),
        (11, N'review',       N'viec xem xet'),
        (12, N'summary',      N'ban tom tat'),
        (13, N'meeting',      N'cuoc hop'),
        (14, N'schedule',     N'lich trinh'),
        (15, N'deadline',     N'han chot'),
        (16, N'objective',    N'muc tieu'),
        (17, N'strategy',     N'chien luoc'),
        (18, N'budget',       N'ngan sach'),
        (19, N'expense',      N'chi phi'),
        (20, N'revenue',      N'doanh thu'),
        (21, N'invoice',      N'hoa don'),
        (22, N'payment',      N'khoan thanh toan'),
        (23, N'contract',     N'hop dong'),
        (24, N'agreement',    N'thoa thuan'),
        (25, N'record',       N'ho so'),
        (26, N'document',     N'tai lieu'),
        (27, N'form',         N'bieu mau'),
        (28, N'notice',       N'thong bao'),
        (29, N'service',      N'dich vu'),
        (30, N'support',      N'su ho tro'),
        (31, N'feedback',     N'phan hoi'),
        (32, N'complaint',    N'khieu nai'),
        (33, N'quality',      N'chat luong'),
        (34, N'performance',  N'hieu suat'),
        (35, N'risk',         N'rui ro'),
        (36, N'opportunity',  N'co hoi'),
        (37, N'requirement',  N'yeu cau bat buoc'),
        (38, N'resource',     N'nguon luc'),
        (39, N'training',     N'dao tao'),
        (40, N'assessment',   N'danh gia'),
        (41, N'system',       N'he thong'),
        (42, N'platform',     N'nen tang'),
        (43, N'network',      N'mang luoi'),
        (44, N'database',     N'co so du lieu'),
        (45, N'dashboard',    N'bang dieu khien'),
        (46, N'shipment',     N'lo hang'),
        (47, N'order',        N'don hang'),
        (48, N'booking',      N'viec dat cho'),
        (49, N'reservation',  N'cho da dat'),
        (50, N'confirmation', N'xac nhan'),
        (51, N'forecast',     N'du bao'),
        (52, N'analysis',     N'phan tich'),
        (53, N'audit',        N'kiem toan'),
        (54, N'target',       N'chi tieu'),
        (55, N'campaign',     N'chien dich'),
        (56, N'proposal',     N'de xuat'),
        (57, N'presentation', N'bai thuyet trinh'),
        (58, N'survey',       N'khao sat'),
        (59, N'certificate',  N'chung chi'),
        (60, N'workflow',     N'luong cong viec');

    CREATE TABLE #SeedVocabulary
    (
        SeedOrdinal     INT NOT NULL,
        TopicCode       NVARCHAR(50) NOT NULL,
        Term            NVARCHAR(200) NOT NULL,
        Meaning         NVARCHAR(1000) NOT NULL,
        DifficultyLevel TINYINT NOT NULL
    );

    INSERT #SeedVocabulary (SeedOrdinal, TopicCode, Term, Meaning, DifficultyLevel)
    SELECT CONVERT(INT, ROW_NUMBER() OVER (ORDER BY t.TopicOrder, c.ConceptOrder)),
           t.TopicCode,
           CONCAT(t.TermPrefix, N' ', c.Term),
           CONCAT(c.Meaning, N' trong chu de ', t.VietnameseLabel),
           t.DifficultyLevel
    FROM #SeedTopics t
    CROSS JOIN #SeedConcepts c;

    IF (SELECT COUNT(*) FROM #SeedVocabulary) < 600
        THROW 50003, N'Seed vocabulary phai co it nhat 600 tu.', 1;

    IF EXISTS (
        SELECT Term
        FROM #SeedVocabulary
        GROUP BY Term
        HAVING COUNT(*) > 1
    )
        THROW 50004, N'Seed vocabulary co term bi trung.', 1;

    INSERT dbo.Words
        (Term, PartOfSpeechID, Meaning, Phonetic, AudioUrlUK, AudioUrlUS, ImageUrl, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt)
    SELECT v.Term,
           @NounPartOfSpeechID,
           v.Meaning,
           NULL,
           NULL,
           NULL,
           NULL,
           v.DifficultyLevel,
           @AuthorID,
           @Now,
           @Now,
           N'Published',
           @ReviewerID,
           @Now,
           @Now
    FROM #SeedVocabulary v
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.Words w
        WHERE w.Term = v.Term
          AND w.PartOfSpeechID = @NounPartOfSpeechID
    );

    CREATE TABLE #SeedWords
    (
        SeedOrdinal     INT NOT NULL,
        TopicCode       NVARCHAR(50) NOT NULL,
        TopicID         BIGINT NOT NULL,
        WordID          BIGINT NOT NULL,
        Term            NVARCHAR(200) NOT NULL,
        Meaning         NVARCHAR(1000) NOT NULL,
        DifficultyLevel TINYINT NOT NULL
    );

    INSERT #SeedWords (SeedOrdinal, TopicCode, TopicID, WordID, Term, Meaning, DifficultyLevel)
    SELECT v.SeedOrdinal,
           v.TopicCode,
           t.TopicID,
           w.WordID,
           v.Term,
           v.Meaning,
           v.DifficultyLevel
    FROM #SeedVocabulary v
    JOIN dbo.Topics t ON t.TopicCode = v.TopicCode
    JOIN dbo.Words w
      ON w.Term = v.Term
     AND w.PartOfSpeechID = @NounPartOfSpeechID;

    IF (SELECT COUNT(*) FROM #SeedWords) <> (SELECT COUNT(*) FROM #SeedVocabulary)
        THROW 50005, N'Khong map duoc day du seed vocabulary sang Words.', 1;

    INSERT dbo.WordTopics (WordID, TopicID, AssignedAt)
    SELECT sw.WordID, sw.TopicID, @Now
    FROM #SeedWords sw
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.WordTopics wt
        WHERE wt.WordID = sw.WordID
          AND wt.TopicID = sw.TopicID
    );

    INSERT dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, AudioUrl, CreatedAt, UpdatedAt)
    SELECT sw.WordID,
           CONCAT(N'The TOEIC lesson explains the term "', sw.Term, N'" in a practical workplace context.'),
           CONCAT(N'Bai hoc TOEIC giai thich cum tu "', sw.Term, N'" trong ngu canh cong viec thuc te.'),
           NULL,
           @Now,
           @Now
    FROM #SeedWords sw
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.ExampleSentences ex
        WHERE ex.WordID = sw.WordID
    );

    INSERT dbo.Questions
        (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt)
    SELECT sw.WordID,
           N'MCQ',
           CONCAT(N'What is the Vietnamese meaning of "', sw.Term, N'"?'),
           CONCAT(
               N'["',
               STRING_ESCAPE(sw.Meaning, 'json'),
               N'","Khong phu hop voi ngu canh","Mot nghia khac","Can xem lai bai hoc"]'
           ),
           sw.Meaning,
           CONCAT(N'Choose the meaning that matches the TOEIC phrase "', sw.Term, N'".'),
           sw.DifficultyLevel,
           @AuthorID,
           @Now,
           @Now,
           N'Published',
           @ReviewerID,
           @Now,
           @Now
    FROM #SeedWords sw
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.Questions q
        WHERE q.WordID = sw.WordID
          AND q.QuestionType = N'MCQ'
    );

    MERGE dbo.MiniTests AS target
    USING (
        SELECT t.TopicID,
               CONCAT(N'SEED720 - ', st.TopicName, N' Mini Test') AS TestTitle,
               CONCAT(N'Mini test gom 10 cau cho topic ', st.TopicName, N'.') AS Description
        FROM #SeedTopics st
        JOIN dbo.Topics t ON t.TopicCode = st.TopicCode
    ) AS source
    ON target.TestTitle = source.TestTitle
    WHEN MATCHED THEN
        UPDATE SET TopicID = source.TopicID,
                   Description = source.Description,
                   TotalQuestions = 10,
                   IsPublished = 1,
                   ContentStatus = N'Published',
                   ReviewedByUserID = @ReviewerID,
                   ReviewedAt = COALESCE(target.ReviewedAt, @Now),
                   PublishedAt = COALESCE(target.PublishedAt, @Now),
                   UpdatedAt = @Now
    WHEN NOT MATCHED THEN
        INSERT (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt)
        VALUES (source.TopicID, source.TestTitle, source.Description, @AuthorID, 10, 1, @Now, @Now, N'Published', @ReviewerID, @Now, @Now);

    ;WITH RankedQuestions AS
    (
        SELECT mt.MiniTestID,
               q.QuestionID,
               ROW_NUMBER() OVER (PARTITION BY mt.MiniTestID ORDER BY sw.SeedOrdinal) AS DisplayOrder
        FROM #SeedWords sw
        JOIN #SeedTopics st ON st.TopicCode = sw.TopicCode
        JOIN dbo.MiniTests mt ON mt.TestTitle = CONCAT(N'SEED720 - ', st.TopicName, N' Mini Test')
        JOIN dbo.Questions q
          ON q.WordID = sw.WordID
         AND q.QuestionType = N'MCQ'
    )
    INSERT dbo.MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT rq.MiniTestID, rq.QuestionID, rq.DisplayOrder
    FROM RankedQuestions rq
    WHERE rq.DisplayOrder <= 10
      AND NOT EXISTS (
          SELECT 1
          FROM dbo.MiniTestItems mti
          WHERE mti.MiniTestID = rq.MiniTestID
            AND (mti.QuestionID = rq.QuestionID OR mti.DisplayOrder = rq.DisplayOrder)
      );

    IF OBJECT_ID(N'dbo.LearningPathLevels', N'U') IS NOT NULL
       AND OBJECT_ID(N'dbo.LearningPathTopics', N'U') IS NOT NULL
    BEGIN
        EXEC sys.sp_executesql N'
            INSERT dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder)
            SELECT l.LearningPathLevelID,
                   t.TopicID,
                   st.LevelTopicOrder
            FROM #SeedTopics st
            JOIN dbo.Topics t ON t.TopicCode = st.TopicCode
            JOIN dbo.LearningPathLevels l ON l.LevelCode = st.LevelCode
            WHERE NOT EXISTS (
                SELECT 1
                FROM dbo.LearningPathTopics lpt
                WHERE lpt.TopicID = t.TopicID
            );
        ';
    END;

    IF @SeedLearnerProgress = 1 AND @LearnerID IS NOT NULL
    BEGIN
        INSERT dbo.UserTopicEnrollments (UserID, TopicID, EnrolledAt, IsActive)
        SELECT @LearnerID, t.TopicID, @Now, 1
        FROM #SeedTopics st
        JOIN dbo.Topics t ON t.TopicCode = st.TopicCode
        WHERE NOT EXISTS (
            SELECT 1
            FROM dbo.UserTopicEnrollments ute
            WHERE ute.UserID = @LearnerID
              AND ute.TopicID = t.TopicID
        );

        INSERT dbo.UserWordProgress
            (UserID, WordID, MasteryLevel, EaseFactor, RepetitionCount, ConsecutiveCorrect, ConsecutiveWrong, LastReviewedAt, NextReviewDate, LastScore, MemoryStatus, CreatedAt, UpdatedAt)
        SELECT @LearnerID,
               sw.WordID,
               CASE
                   WHEN sw.SeedOrdinal <= 60 THEN 8
                   WHEN sw.SeedOrdinal <= 120 THEN 5
                   WHEN sw.SeedOrdinal <= 160 THEN 2
                   ELSE 0
               END,
               CASE
                   WHEN sw.SeedOrdinal <= 60 THEN 2.90
                   WHEN sw.SeedOrdinal <= 120 THEN 2.70
                   WHEN sw.SeedOrdinal <= 160 THEN 2.50
                   ELSE 2.20
               END,
               CASE
                   WHEN sw.SeedOrdinal <= 60 THEN 8
                   WHEN sw.SeedOrdinal <= 120 THEN 5
                   WHEN sw.SeedOrdinal <= 160 THEN 2
                   ELSE 1
               END,
               CASE WHEN sw.SeedOrdinal <= 160 THEN 2 ELSE 0 END,
               CASE WHEN sw.SeedOrdinal > 160 THEN 1 ELSE 0 END,
               DATEADD(day, -((sw.SeedOrdinal % 21) + 1), @Now),
               CASE
                   WHEN sw.SeedOrdinal <= 60 THEN DATEADD(day, 30, @Now)
                   WHEN sw.SeedOrdinal <= 120 THEN DATEADD(day, 7, @Now)
                   WHEN sw.SeedOrdinal <= 160 THEN DATEADD(day, 1, @Now)
                   ELSE DATEADD(day, -1, @Now)
               END,
               CASE WHEN sw.SeedOrdinal > 160 THEN 0 ELSE 100 END,
               CASE
                   WHEN sw.SeedOrdinal <= 60 THEN N'Mastered'
                   WHEN sw.SeedOrdinal <= 120 THEN N'Reviewing'
                   WHEN sw.SeedOrdinal <= 160 THEN N'Learning'
                   ELSE N'Lapsed'
               END,
               DATEADD(day, -((sw.SeedOrdinal % 120) + 1), @Now),
               @Now
        FROM #SeedWords sw
        WHERE sw.SeedOrdinal <= 180
          AND NOT EXISTS (
              SELECT 1
              FROM dbo.UserWordProgress uwp
              WHERE uwp.UserID = @LearnerID
                AND uwp.WordID = sw.WordID
          );

        INSERT dbo.ExerciseAttempts
            (UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, ScoreAwarded, AttemptedAt, ClientTimeZoneOffset, AttemptMetadataJson)
        SELECT @LearnerID,
               q.QuestionID,
               sw.WordID,
               CASE WHEN sw.SeedOrdinal % 5 = 0 THEN N'wrong answer' ELSE sw.Meaning END,
               CASE WHEN sw.SeedOrdinal % 5 = 0 THEN 0 ELSE 1 END,
               CASE WHEN sw.SeedOrdinal % 5 = 0 THEN 0 ELSE 100 END,
               DATEADD(day, -((sw.SeedOrdinal % 60) + 1), @Now),
               N'+07:00',
               CONCAT(N'{"seed":"SEED720","ordinal":', sw.SeedOrdinal, N'}')
        FROM #SeedWords sw
        JOIN dbo.Questions q
          ON q.WordID = sw.WordID
         AND q.QuestionType = N'MCQ'
        WHERE sw.SeedOrdinal <= 120
          AND NOT EXISTS (
              SELECT 1
              FROM dbo.ExerciseAttempts ea
              WHERE ea.UserID = @LearnerID
                AND JSON_VALUE(ea.AttemptMetadataJson, '$.seed') = N'SEED720'
                AND TRY_CONVERT(INT, JSON_VALUE(ea.AttemptMetadataJson, '$.ordinal')) = sw.SeedOrdinal
          );

        INSERT dbo.UserVocabularyNotebook (UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt)
        SELECT @LearnerID,
               sw.WordID,
               CONCAT(N'Tu can ghi nho trong topic ', sw.TopicCode, N'.'),
               CASE WHEN sw.SeedOrdinal <= 5 THEN 1 ELSE 0 END,
               @Now,
               @Now
        FROM #SeedWords sw
        WHERE sw.SeedOrdinal <= 15
          AND NOT EXISTS (
              SELECT 1
              FROM dbo.UserVocabularyNotebook notebook
              WHERE notebook.UserID = @LearnerID
                AND notebook.WordID = sw.WordID
          );

        ;WITH RankedMiniTests AS
        (
            SELECT mt.MiniTestID,
                   ROW_NUMBER() OVER (ORDER BY st.TopicOrder) AS TestOrder
            FROM #SeedTopics st
            JOIN dbo.MiniTests mt ON mt.TestTitle = CONCAT(N'SEED720 - ', st.TopicName, N' Mini Test')
        )
        INSERT dbo.MiniTestAttempts (MiniTestID, UserID, StartedAt, SubmittedAt, TotalQuestions, CorrectCount, Score)
        SELECT rmt.MiniTestID,
               @LearnerID,
               DATEADD(day, -rmt.TestOrder, @Now),
               DATEADD(day, -rmt.TestOrder, @Now),
               10,
               CASE WHEN rmt.TestOrder = 1 THEN 9 ELSE 8 END,
               CASE WHEN rmt.TestOrder = 1 THEN 90 ELSE 80 END
        FROM RankedMiniTests rmt
        WHERE rmt.TestOrder <= 2
          AND NOT EXISTS (
              SELECT 1
              FROM dbo.MiniTestAttempts mta
              WHERE mta.UserID = @LearnerID
                AND mta.MiniTestID = rmt.MiniTestID
          );

        IF OBJECT_ID(N'dbo.UserXPEvents', N'U') IS NOT NULL
        BEGIN
            EXEC sys.sp_executesql N'
                DECLARE @InsertedXP TABLE (XPAmount INT NOT NULL);

                INSERT dbo.UserXPEvents (UserID, EventType, XPAmount, SourceKey, MetadataJson, CreatedAt)
                OUTPUT inserted.XPAmount INTO @InsertedXP
                SELECT @LearnerID,
                       N''LearnWord'',
                       5,
                       CONCAT(N''seed720-learn-word:'', sw.WordID),
                       CONCAT(N''{"seed":"SEED720","wordId":'', sw.WordID, N''}''),
                       DATEADD(day, -((sw.SeedOrdinal % 30) + 1), @Now)
                FROM #SeedWords sw
                WHERE sw.SeedOrdinal <= 120
                  AND NOT EXISTS (
                      SELECT 1
                      FROM dbo.UserXPEvents x
                      WHERE x.UserID = @LearnerID
                        AND x.EventType = N''LearnWord''
                        AND x.SourceKey = CONCAT(N''seed720-learn-word:'', sw.WordID)
                  );

                INSERT dbo.UserXPEvents (UserID, EventType, XPAmount, SourceKey, MetadataJson, CreatedAt)
                OUTPUT inserted.XPAmount INTO @InsertedXP
                SELECT @LearnerID,
                       N''PracticeComplete'',
                       10,
                       CONCAT(N''seed720-practice:'', t.TopicID),
                       CONCAT(N''{"seed":"SEED720","topicId":'', t.TopicID, N''}''),
                       DATEADD(day, -st.TopicOrder, @Now)
                FROM #SeedTopics st
                JOIN dbo.Topics t ON t.TopicCode = st.TopicCode
                WHERE st.TopicOrder <= 2
                  AND NOT EXISTS (
                      SELECT 1
                      FROM dbo.UserXPEvents x
                      WHERE x.UserID = @LearnerID
                        AND x.EventType = N''PracticeComplete''
                        AND x.SourceKey = CONCAT(N''seed720-practice:'', t.TopicID)
                  );

                INSERT dbo.UserXPEvents (UserID, EventType, XPAmount, SourceKey, MetadataJson, CreatedAt)
                OUTPUT inserted.XPAmount INTO @InsertedXP
                SELECT @LearnerID,
                       N''MiniTestComplete'',
                       20,
                       CONCAT(N''seed720-mini-test:'', mt.MiniTestID),
                       CONCAT(N''{"seed":"SEED720","miniTestId":'', mt.MiniTestID, N''}''),
                       DATEADD(day, -st.TopicOrder, @Now)
                FROM #SeedTopics st
                JOIN dbo.MiniTests mt ON mt.TestTitle = CONCAT(N''SEED720 - '', st.TopicName, N'' Mini Test'')
                WHERE st.TopicOrder <= 2
                  AND NOT EXISTS (
                      SELECT 1
                      FROM dbo.UserXPEvents x
                      WHERE x.UserID = @LearnerID
                        AND x.EventType = N''MiniTestComplete''
                        AND x.SourceKey = CONCAT(N''seed720-mini-test:'', mt.MiniTestID)
                  );

                DECLARE @XPDelta INT = ISNULL((SELECT SUM(XPAmount) FROM @InsertedXP), 0);
                IF @XPDelta > 0
                BEGIN
                    UPDATE dbo.Users
                    SET TotalXP = ISNULL(TotalXP, 0) + @XPDelta,
                        UpdatedAt = @Now
                    WHERE UserID = @LearnerID;

                    DECLARE @TotalXP INT = ISNULL((SELECT TotalXP FROM dbo.Users WHERE UserID = @LearnerID), 0);
                    DECLARE @Level INT = 1;
                    DECLARE @LevelStartXP INT = 0;
                    DECLARE @XPForNextLevel INT = 100;

                    WHILE @TotalXP >= @LevelStartXP + @XPForNextLevel
                    BEGIN
                        SET @LevelStartXP += @XPForNextLevel;
                        SET @Level += 1;
                        SET @XPForNextLevel = @Level * 100;
                    END;

                    UPDATE dbo.Users
                    SET CurrentLevel = @Level
                    WHERE UserID = @LearnerID;
                END;
            ', N'@LearnerID BIGINT, @Now DATETIMEOFFSET(7)', @LearnerID = @LearnerID, @Now = @Now;
        END;
    END;

    COMMIT TRANSACTION;

    PRINT N'Seed completed successfully.';
    PRINT CONCAT(N'Target learner ID: ', COALESCE(CONVERT(NVARCHAR(30), @LearnerID), N'none - skipped learner history'));

    SELECT COUNT(*) AS SeededVocabularyCount
    FROM #SeedWords;

    SELECT t.TopicCode,
           t.TopicName,
           COUNT(wt.WordID) AS VocabularyCount
    FROM #SeedTopics st
    JOIN dbo.Topics t ON t.TopicCode = st.TopicCode
    LEFT JOIN dbo.WordTopics wt ON wt.TopicID = t.TopicID
    GROUP BY t.TopicCode, t.TopicName
    ORDER BY t.TopicCode;

    IF @LearnerID IS NOT NULL
    BEGIN
        SELECT @LearnerID AS LearnerID,
               (SELECT COUNT(*) FROM dbo.UserTopicEnrollments WHERE UserID = @LearnerID) AS EnrolledTopics,
               (SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @LearnerID) AS ProgressWords,
               (SELECT COUNT(*) FROM dbo.ExerciseAttempts WHERE UserID = @LearnerID) AS ExerciseAttempts,
               (SELECT COUNT(*) FROM dbo.UserVocabularyNotebook WHERE UserID = @LearnerID) AS NotebookWords,
               (SELECT COUNT(*) FROM dbo.MiniTestAttempts WHERE UserID = @LearnerID) AS MiniTestAttempts;
    END;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
