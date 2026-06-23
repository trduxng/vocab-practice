-- ============================================================
-- SEED MORE DATA FOR PAGINATION TESTING
-- ============================================================
-- 1. Add 20 more notebook entries for UserID=10 (phuc2011@gmail.com)
--    Skip WordIDs already in notebook: 23,24,27,29,32,47,50,51,76,77,78,159,161,180
-- 2. Add 12 more mini-tests with 5 questions each (using unused questions)
-- ============================================================

DECLARE @UserID BIGINT = 10;
DECLARE @Now DATETIMEOFFSET = SYSDATETIMEOFFSET();

-- ============================================================
-- PART 1: NOTEBOOK ENTRIES
-- ============================================================
PRINT 'Adding notebook entries...';

INSERT INTO dbo.UserVocabularyNotebook (UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt)
SELECT @UserID, WordID, NULL, 0, @Now, @Now FROM (VALUES
    (11), (12), (22), (25), (26), (28), (30), (31), (33), (34),
    (35), (36), (37), (38), (39), (40), (41), (42), (43), (44)
) AS w(WordID)
WHERE WordID NOT IN (
    SELECT WordID FROM dbo.UserVocabularyNotebook WHERE UserID = @UserID
);

PRINT 'Notebook entries added.';

-- ============================================================
-- PART 2: MINI-TESTS
-- ============================================================
PRINT 'Creating mini-tests...';

DECLARE @TestNum INT = 1;
DECLARE @MaxNewTests INT = 12;
DECLARE @MiniTestID BIGINT;
DECLARE @TestTitle NVARCHAR(200);

-- Unused published questions
DECLARE @UnusedQuestions TABLE (rn INT, QuestionID INT);
INSERT INTO @UnusedQuestions
SELECT ROW_NUMBER() OVER (ORDER BY QuestionID), QuestionID
FROM dbo.Questions
WHERE ContentStatus = 'Published'
  AND QuestionID NOT IN (SELECT QuestionID FROM dbo.MiniTestItems)
ORDER BY QuestionID;

-- Test titles (12 new ones)
DECLARE @Titles TABLE (rn INT, title NVARCHAR(200));
INSERT INTO @Titles VALUES
(1,  N'Kiểm tra: Business English Essentials'),
(2,  N'Kiểm tra: Workplace Communication'),
(3,  N'Kiểm tra: Technology & Innovation'),
(4,  N'Kiểm tra: Customer Service'),
(5,  N'Kiểm tra: Finance & Banking'),
(6,  N'Kiểm tra: Marketing & Sales'),
(7,  N'Kiểm tra: Human Resources'),
(8,  N'Kiểm tra: Project Management'),
(9,  N'Kiểm tra: International Trade'),
(10, N'Kiểm tra: Healthcare & Medicine'),
(11, N'Kiểm tra: Education & Training'),
(12, N'Kiểm tra: Legal & Compliance');

WHILE @TestNum <= @MaxNewTests
BEGIN
    SELECT @TestTitle = title FROM @Titles WHERE rn = @TestNum;

    -- Insert MiniTest (now includes required columns)
    INSERT INTO dbo.MiniTests (TestTitle, Description, TopicID, TotalQuestions, IsPublished, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (
        @TestTitle,
        N'Bài kiểm tra ngắn 5 câu giúp ôn tập từ vựng chuyên ngành.',
        NULL,
        5,
        1,
        1,           -- CreatedByUserID = 1 (admin)
        N'Published',
        @Now,
        @Now
    );

    SET @MiniTestID = SCOPE_IDENTITY();

    -- Insert 5 MiniTestItems
    INSERT INTO dbo.MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @MiniTestID, QuestionID, DisplayOrder
    FROM (
        SELECT uq.QuestionID, uq.rn,
               (uq.rn - (@TestNum - 1) * 5) AS DisplayOrder
        FROM @UnusedQuestions uq
    ) AS batch
    WHERE batch.rn BETWEEN (@TestNum - 1) * 5 + 1 AND @TestNum * 5
    ORDER BY batch.rn;

    SET @TestNum = @TestNum + 1;
END;

PRINT 'Mini-tests created successfully.';

-- ============================================================
-- Verify
-- ============================================================
PRINT '';
PRINT '=== VERIFICATION ===';
PRINT '';

DECLARE @NotebookCount INT;
SELECT @NotebookCount = COUNT(*) FROM dbo.UserVocabularyNotebook WHERE UserID = @UserID;
PRINT 'Notebook entries for UserID 10: ' + CAST(@NotebookCount AS NVARCHAR);

DECLARE @MiniTestCount INT;
SELECT @MiniTestCount = COUNT(*) FROM dbo.MiniTests WHERE IsPublished = 1;
PRINT 'Total published mini-tests: ' + CAST(@MiniTestCount AS NVARCHAR);

PRINT '';
PRINT 'Done!';
GO
