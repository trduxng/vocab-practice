-- ============================================================
-- Seed new QuestionTypes: Dictation + DragDrop
-- Không trùng với QuestionTypes đã có (MCQ, FillBlank)
-- ============================================================
-- Cách chạy:
-- docker cp backend/Database/seed_new_question_types.sql sqlserver_2022:/tmp/seed.sql
-- docker exec -i sqlserver_2022 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Hoangphuc@040505' -C -d ToeicVocabularyPlatform -i /tmp/seed.sql
-- ============================================================

-- ============================================================
-- 1. DICTATION questions (Nghe và nhập từ tiếng Anh)
--    Dành cho TẤT CẢ published words chưa có Dictation
-- ============================================================
PRINT '=== 1. DICTATION QUESTIONS ===';

INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
SELECT 
    w.WordID,
    'Dictation',
    N'Nghe và nhập từ tiếng Anh tương ứng',
    '{}',
    w.Term,
    1,
    1,
    'Published',
    SYSDATETIMEOFFSET(),
    SYSDATETIMEOFFSET(),
    SYSDATETIMEOFFSET()
FROM Words w
WHERE w.ContentStatus = 'Published'
  AND NOT EXISTS (
    SELECT 1 FROM Questions q 
    WHERE q.WordID = w.WordID AND q.QuestionType = 'Dictation'
  );

PRINT '=> Created ' + CAST(@@ROWCOUNT AS VARCHAR) + ' Dictation questions';
GO

-- ============================================================
-- 2. DRAGDROP questions (Sắp xếp từ thành câu)
--    Dành cho published words CÓ example sentence
--    Mỗi word nhận 1 DragDrop question từ câu example đầu tiên
-- ============================================================
PRINT '=== 2. DRAGDROP QUESTIONS ===';

-- Xóa bảng tạm nếu tồn tại
IF OBJECT_ID('tempdb..#WordsWithExamples') IS NOT NULL DROP TABLE #WordsWithExamples;

-- Lấy words có example sentences (1 sentence / word)
SELECT 
    es.WordID,
    w.Term,
    MIN(es.SentenceText) AS SentenceText
INTO #WordsWithExamples
FROM ExampleSentences es
JOIN Words w ON es.WordID = w.WordID AND w.ContentStatus = 'Published'
WHERE es.SentenceText IS NOT NULL AND LEN(es.SentenceText) > 0
GROUP BY es.WordID, w.Term;

-- Dùng cursor để xây dựng OptionsJson cho mỗi câu
DECLARE @WordID BIGINT, @Term NVARCHAR(200), @Sentence NVARCHAR(2000);
DECLARE @WordPos INT, @WordLen INT, @Word NVARCHAR(200);
DECLARE @WordsJson NVARCHAR(MAX), @First BIT;

DECLARE word_cursor CURSOR FOR 
    SELECT WordID, Term, SentenceText FROM #WordsWithExamples
    WHERE NOT EXISTS (
        SELECT 1 FROM Questions q 
        WHERE q.WordID = #WordsWithExamples.WordID AND q.QuestionType = 'DragDrop'
    );

OPEN word_cursor;
FETCH NEXT FROM word_cursor INTO @WordID, @Term, @Sentence;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Xây dựng JSON items: tách câu thành các từ
    SET @WordsJson = '{"items":[';
    SET @First = 1;

    -- Dùng STRING_SPLIT để tách từ (SQL Server 2016+)
    DECLARE word_split_cursor CURSOR FOR
        SELECT value FROM STRING_SPLIT(@Sentence, ' ') WHERE value != '';

    OPEN word_split_cursor;
    FETCH NEXT FROM word_split_cursor INTO @Word;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @First = 1
            SET @WordsJson = @WordsJson + '"' + @Word + '"';
        ELSE
            SET @WordsJson = @WordsJson + ',"' + @Word + '"';
        SET @First = 0;
        FETCH NEXT FROM word_split_cursor INTO @Word;
    END;

    CLOSE word_split_cursor;
    DEALLOCATE word_split_cursor;

    SET @WordsJson = @WordsJson + ']}';

    -- Insert DragDrop question
    INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (
        @WordID,
        'DragDrop',
        N'Sắp xếp các từ để tạo thành câu hoàn chỉnh',
        @WordsJson,
        @Sentence,
        2,
        1,
        'Published',
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET()
    );

    FETCH NEXT FROM word_cursor INTO @WordID, @Term, @Sentence;
END;

CLOSE word_cursor;
DEALLOCATE word_cursor;

PRINT '=> Created ' + CAST(@@ROWCOUNT AS VARCHAR) + ' DragDrop questions';
GO

-- ============================================================
-- 3. VERIFY kết quả
-- ============================================================
PRINT '';
PRINT '=== KẾT QUẢ ===';
SELECT QuestionType, COUNT(*) AS SoLuong FROM Questions GROUP BY QuestionType ORDER BY QuestionType;

PRINT '';
PRINT '=== MẪU DICTATION (5 câu mới nhất) ===';
SELECT TOP 5 q.QuestionID, w.Term, q.QuestionType, q.QuestionText, q.ContentStatus
FROM Questions q JOIN Words w ON q.WordID = w.WordID
WHERE q.QuestionType = 'Dictation'
ORDER BY q.QuestionID DESC;

PRINT '';
PRINT '=== MẪU DRAGDROP (5 câu mới nhất) ===';
SELECT TOP 5 q.QuestionID, w.Term, q.QuestionType, LEFT(q.OptionsJson, 100) AS Options, LEFT(q.CorrectAnswer, 60) AS Answer
FROM Questions q JOIN Words w ON q.WordID = w.WordID
WHERE q.QuestionType = 'DragDrop'
ORDER BY q.QuestionID DESC;

PRINT '';
PRINT '=== HOÀN THÀNH ===';
GO
