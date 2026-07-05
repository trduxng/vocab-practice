-- ============================================================
-- Tạo Mini Test MỚI với đa dạng QuestionTypes
-- Mỗi topic: 2 tests, mỗi test: 8 câu (2 MCQ + 2 FillBlank + 2 Dictation + 2 DragDrop)
-- Không trùng lặp với MiniTest đã có
-- ============================================================
-- Cách chạy:
-- docker cp backend/Database/seed_new_minitests.sql sqlserver_2022:/tmp/seed_minitests.sql
-- docker exec sqlserver_2022 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Hoangphuc@040505' -C -d ToeicVocabularyPlatform -i /tmp/seed_minitests.sql
-- ============================================================

PRINT '=== BẮT ĐẦU TẠO MINI TEST MỚI ===';
PRINT '';

-- ============================================================
-- 1. Lấy danh sách topics đã published
-- ============================================================
IF OBJECT_ID('tempdb..#TopicList') IS NOT NULL DROP TABLE #TopicList;
SELECT 
    TopicID, 
    TopicName,
    ROW_NUMBER() OVER (ORDER BY TopicID) AS rn
INTO #TopicList
FROM Topics 
WHERE ContentStatus = 'Published'
ORDER BY TopicID;

DECLARE @TopicCount INT = (SELECT COUNT(*) FROM #TopicList);
PRINT 'Số topics: ' + CAST(@TopicCount AS VARCHAR);
PRINT '';

-- ============================================================
-- 2. Duyệt từng topic, tạo 2 tests
-- ============================================================
DECLARE @i INT = 1;
DECLARE @TopicID BIGINT, @TopicName NVARCHAR(200);

DECLARE @TestID BIGINT;
DECLARE @TestSuffix NVARCHAR(50);
DECLARE @TestTitle NVARCHAR(255);
DECLARE @TestDescription NVARCHAR(1000);
DECLARE @DisplayOrder INT;

WHILE @i <= @TopicCount
BEGIN
    SELECT @TopicID = TopicID, @TopicName = TopicName FROM #TopicList WHERE rn = @i;

    -- ==================== TEST A (đa dạng) ====================
    SET @TestSuffix = 'A - Tổng hợp';
    SET @TestTitle = N'Bài kiểm tra: ' + @TopicName + N' (' + @TestSuffix + N')';
    SET @TestDescription = N'Bài kiểm tra tổng hợp gồm trắc nghiệm, điền từ, nghe chép chính tả và sắp xếp câu cho chủ đề "' + @TopicName + N'".';

    INSERT INTO MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (@TopicID, @TestTitle, @TestDescription, 1, 8, 1, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

    SET @TestID = SCOPE_IDENTITY();
    SET @DisplayOrder = 1;

    -- 2 MCQ questions
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @TestID, q.QuestionID, @DisplayOrder + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM (
        SELECT TOP 2 q.QuestionID
        FROM WordTopics wt
        JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
        JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published' AND q.QuestionType = 'MCQ'
        WHERE wt.TopicID = @TopicID
        ORDER BY NEWID()
    ) q;
    SET @DisplayOrder = @DisplayOrder + 2;

    -- 2 FillBlank questions
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @TestID, q.QuestionID, @DisplayOrder + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM (
        SELECT TOP 2 q.QuestionID
        FROM WordTopics wt
        JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
        JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published' AND q.QuestionType = 'FillBlank'
        WHERE wt.TopicID = @TopicID
        ORDER BY NEWID()
    ) q;
    SET @DisplayOrder = @DisplayOrder + 2;

    -- 2 Dictation questions
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @TestID, q.QuestionID, @DisplayOrder + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM (
        SELECT TOP 2 q.QuestionID
        FROM WordTopics wt
        JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
        JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published' AND q.QuestionType = 'Dictation'
        WHERE wt.TopicID = @TopicID
        ORDER BY NEWID()
    ) q;
    SET @DisplayOrder = @DisplayOrder + 2;

    -- 2 DragDrop questions
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @TestID, q.QuestionID, @DisplayOrder + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM (
        SELECT TOP 2 q.QuestionID
        FROM WordTopics wt
        JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
        JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published' AND q.QuestionType = 'DragDrop'
        WHERE wt.TopicID = @TopicID
        ORDER BY NEWID()
    ) q;

    PRINT N'  + Đã tạo: "' + @TestTitle + N'" (8 câu)';

    -- ==================== TEST B (đa dạng) ====================
    SET @TestSuffix = 'B - Nâng cao';
    SET @TestTitle = N'Bài kiểm tra: ' + @TopicName + N' (' + @TestSuffix + N')';
    SET @TestDescription = N'Bài kiểm tra nâng cao gồm trắc nghiệm, điền từ, nghe chép chính tả và sắp xếp câu cho chủ đề "' + @TopicName + N'".';

    INSERT INTO MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (@TopicID, @TestTitle, @TestDescription, 1, 8, 1, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

    SET @TestID = SCOPE_IDENTITY();
    SET @DisplayOrder = 1;

    -- 2 MCQ questions
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @TestID, q.QuestionID, @DisplayOrder + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM (
        SELECT TOP 2 q.QuestionID
        FROM WordTopics wt
        JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
        JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published' AND q.QuestionType = 'MCQ'
        WHERE wt.TopicID = @TopicID
        ORDER BY NEWID()
    ) q;
    SET @DisplayOrder = @DisplayOrder + 2;

    -- 2 FillBlank questions
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @TestID, q.QuestionID, @DisplayOrder + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM (
        SELECT TOP 2 q.QuestionID
        FROM WordTopics wt
        JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
        JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published' AND q.QuestionType = 'FillBlank'
        WHERE wt.TopicID = @TopicID
        ORDER BY NEWID()
    ) q;
    SET @DisplayOrder = @DisplayOrder + 2;

    -- 2 Dictation questions
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @TestID, q.QuestionID, @DisplayOrder + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM (
        SELECT TOP 2 q.QuestionID
        FROM WordTopics wt
        JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
        JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published' AND q.QuestionType = 'Dictation'
        WHERE wt.TopicID = @TopicID
        ORDER BY NEWID()
    ) q;
    SET @DisplayOrder = @DisplayOrder + 2;

    -- 2 DragDrop questions
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT @TestID, q.QuestionID, @DisplayOrder + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM (
        SELECT TOP 2 q.QuestionID
        FROM WordTopics wt
        JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
        JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published' AND q.QuestionType = 'DragDrop'
        WHERE wt.TopicID = @TopicID
        ORDER BY NEWID()
    ) q;

    PRINT N'  + Đã tạo: "' + @TestTitle + N'" (8 câu)';

    SET @i = @i + 1;
END;

PRINT '';
PRINT N'=== HOÀN THÀNH TẠO MINI TEST ===';
PRINT '';

-- ============================================================
-- 3. VERIFY kết quả
-- ============================================================
PRINT '=== DANH SÁCH MINI TEST MỚI ===';
SELECT 
    mt.MiniTestID, 
    mt.TestTitle, 
    t.TopicName, 
    mt.TotalQuestions, 
    mt.IsPublished,
    mt.CreatedAt
FROM MiniTests mt
LEFT JOIN Topics t ON mt.TopicID = t.TopicID
WHERE mt.MiniTestID > 37
ORDER BY mt.MiniTestID;

PRINT '';
PRINT '=== PHÂN BỐ QUESTION TYPES TRONG CÁC TEST MỚI ===';
SELECT 
    mti.MiniTestID,
    mt.TestTitle,
    q.QuestionType,
    COUNT(*) AS SoLuong
FROM MiniTestItems mti
JOIN Questions q ON mti.QuestionID = q.QuestionID
JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID
WHERE mt.MiniTestID > 37
GROUP BY mti.MiniTestID, mt.TestTitle, q.QuestionType
ORDER BY mti.MiniTestID, q.QuestionType;

PRINT '';
DECLARE @TotalTests INT, @TotalItems INT;
SELECT @TotalTests = COUNT(*) FROM MiniTests;
SELECT @TotalItems = COUNT(*) FROM MiniTestItems;
PRINT '=== TỔNG KẾT ===';
PRINT 'Tổng số MiniTest: ' + CAST(@TotalTests AS VARCHAR);
PRINT 'Tổng số MiniTestItems: ' + CAST(@TotalItems AS VARCHAR);
PRINT '=== HOÀN THÀNH ===';
GO
