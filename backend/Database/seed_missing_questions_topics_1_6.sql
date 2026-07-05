-- ============================================================
-- SEED: Bổ sung câu hỏi còn thiếu cho các topic cũ (1-6)
-- ============================================================
-- Mục tiêu: Mỗi word trong topics 1-6 cần có đủ 4 loại câu hỏi
-- (MCQ, FillBlank, Dictation, DragDrop)
-- ============================================================
-- Cách chạy:
--   docker cp backend/Database/seed_missing_questions_topics_1_6.sql sqlserver_2022:/tmp/seed_missing.sql
--   docker exec sqlserver_2022 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Hoangphuc@040505' -C -d ToeicVocabularyPlatform -i /tmp/seed_missing.sql
-- ============================================================

PRINT '============================================================';
PRINT '  BẮT ĐẦU: BỔ SUNG CÂU HỎI CHO TOPICS 1-6';
PRINT '============================================================';
PRINT '';

DECLARE @AdminUserID BIGINT = 1;
DECLARE @Now DATETIMEOFFSET = SYSDATETIMEOFFSET();
DECLARE @Count INT = 0;
DECLARE @WordID BIGINT;
DECLARE @Term NVARCHAR(200);
DECLARE @Meaning NVARCHAR(1000);
DECLARE @TopicID INT;
DECLARE @Sentence NVARCHAR(2000);
DECLARE @SentenceTrans NVARCHAR(2000);
DECLARE @FillBlankSentence NVARCHAR(2000);
DECLARE @OptionsJson NVARCHAR(MAX);
DECLARE @CorrectMeaning NVARCHAR(1000);
DECLARE @EscapedCorrect NVARCHAR(1000);
DECLARE @NewQuestionID BIGINT;

-- ============================================================
-- PHẦN 0: THÊM CÂU VÍ DỤ CHO CÁC WORD THIẾU
-- ============================================================
PRINT '=== PHẦN 0: THÊM EXAMPLE SENTENCES CHO WORDS THIẾU ===';
PRINT '';

-- Maintain (WordID 11) - Topic 1
IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE WordID = 11)
BEGIN
    INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
    VALUES (11, N'We must maintain the equipment regularly.', N'Chúng tôi phải bảo trì thiết bị thường xuyên.', @Now, @Now);
    PRINT '  + Added sentence: Maintain';
END
ELSE PRINT '  ~ Maintain sentence already exists';

-- Objective (WordID 12) - Topic 1
IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE WordID = 12)
BEGIN
    INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
    VALUES (12, N'The main objective is to increase sales.', N'Mục tiêu chính là tăng doanh số.', @Now, @Now);
    PRINT '  + Added sentence: Objective';
END
ELSE PRINT '  ~ Objective sentence already exists';

-- eat (WordID 22) - Topic 1
IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE WordID = 22)
BEGIN
    INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
    VALUES (22, N'I eat lunch at the office cafeteria.', N'Tôi ăn trưa tại căng tin văn phòng.', @Now, @Now);
    PRINT '  + Added sentence: eat';
END
ELSE PRINT '  ~ eat sentence already exists';

PRINT '';

-- ============================================================
-- PHẦN 1: THÊM MCQ CÒN THIẾU
-- ============================================================
PRINT '=== PHẦN 1: THÊM MCQ QUESTIONS ===';
PRINT '';

-- Chỉ "eat" (WordID 22) thiếu MCQ
IF NOT EXISTS (SELECT 1 FROM Questions WHERE WordID = 22 AND QuestionType = 'MCQ' AND ContentStatus = 'Published')
BEGIN
    -- Lấy nghĩa đúng
    SET @Meaning = N'ăn';
    -- Lấy 3 distractors từ words khác trong cùng topic 1
    DECLARE @Distractors TABLE (meaning NVARCHAR(1000));

    DELETE FROM @Distractors;
    INSERT INTO @Distractors
    SELECT TOP 3 w.Meaning
    FROM Words w
    JOIN WordTopics wt ON w.WordID = wt.WordID
    WHERE wt.TopicID = 1
      AND w.WordID != 22
      AND w.ContentStatus = 'Published'
    ORDER BY NEWID();

    -- Build JSON array with shuffle
    WITH all_options AS (
        SELECT REPLACE(REPLACE(@Meaning, '\', '\\'), '"', '\"') AS opt, NEWID() AS ord
        UNION ALL
        SELECT REPLACE(REPLACE(meaning, '\', '\\'), '"', '\"'), NEWID() FROM @Distractors
    )
    SELECT @OptionsJson = '[' + STRING_AGG('"' + opt + '"', ',') WITHIN GROUP (ORDER BY ord) + ']'
    FROM all_options;

    INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (22, 'MCQ', N'Chọn nghĩa đúng của từ "eat"', @OptionsJson, @Meaning, 1, @AdminUserID, 'Published', @Now, @Now, @Now);

    SET @NewQuestionID = SCOPE_IDENTITY();
    PRINT '  + Added MCQ for: eat (QuestionID ' + CAST(@NewQuestionID AS VARCHAR) + ')';
END
ELSE PRINT '  ~ MCQ for eat already exists';

PRINT '';

-- ============================================================
-- PHẦN 2: THÊM FILLBLANK CÒN THIẾU
-- ============================================================
PRINT '=== PHẦN 2: THÊM FILLBLANK QUESTIONS ===';
PRINT '';

-- Topic 1: Efficient, Negotiate, Promote, Approve, Purchase
-- Topic 3: Breakfast, Commute, Grocery, Exercise, Relax, Leisure, Household, Laundry, Socialize
-- Topic 4: Luggage, Reservation, Delay, Customs, Itinerary, Terminal, Arrival
-- Topic 5: Database, Network, Backup, Configuration
-- Topic 6: Assignment, Scholarship, Enroll, Graduate, Curriculum, Tuition, Reference

-- Dùng cursor để xử lý từng word
DECLARE fillblank_cursor CURSOR FOR
    SELECT w.WordID, w.Term, w.Meaning, wt.TopicID, e.SentenceText, e.SentenceTranslation
    FROM Words w
    JOIN WordTopics wt ON w.WordID = wt.WordID
    JOIN ExampleSentences e ON w.WordID = e.WordID
    WHERE wt.TopicID IN (1, 3, 4, 5, 6)
      AND w.ContentStatus = 'Published'
      AND e.SentenceText IS NOT NULL
      AND e.SentenceText != ''
      AND NOT EXISTS (SELECT 1 FROM Questions q WHERE q.WordID = w.WordID AND q.QuestionType = 'FillBlank' AND q.ContentStatus = 'Published')
    ORDER BY wt.TopicID, w.WordID;

OPEN fillblank_cursor;
FETCH NEXT FROM fillblank_cursor INTO @WordID, @Term, @Meaning, @TopicID, @Sentence, @SentenceTrans;
SET @Count = 0;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Tạo FillBlank sentence: thay term bằng _____
    SET @FillBlankSentence = REPLACE(@Sentence, @Term, '_____');
    -- Thử với lower case
    IF @FillBlankSentence = @Sentence
        SET @FillBlankSentence = REPLACE(@Sentence, LOWER(@Term), '_____');
    -- Thử với Upper case
    IF @FillBlankSentence = @Sentence
        SET @FillBlankSentence = REPLACE(@Sentence, UPPER(@Term), '_____');

    INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (@WordID, 'FillBlank', N'Điền từ thích hợp vào chỗ trống: ' + @FillBlankSentence, '[]', @Term, 2, @AdminUserID, 'Published', @Now, @Now, @Now);

    SET @Count = @Count + 1;
    FETCH NEXT FROM fillblank_cursor INTO @WordID, @Term, @Meaning, @TopicID, @Sentence, @SentenceTrans;
END;

CLOSE fillblank_cursor;
DEALLOCATE fillblank_cursor;

PRINT '  + Added ' + CAST(@Count AS VARCHAR) + ' FillBlank questions';
PRINT '';

-- ============================================================
-- PHẦN 3: THÊM DRAGDROP CÒN THIẾU
-- ============================================================
PRINT '=== PHẦN 3: THÊM DRAGDROP QUESTIONS ===';
PRINT '';

-- Thiếu: Maintain(11), Objective(12), eat(22) - vừa thêm sentences ở Phần 0
-- Dùng cursor
DECLARE dragdrop_cursor CURSOR FOR
    SELECT w.WordID, w.Term, w.Meaning, e.SentenceText
    FROM Words w
    JOIN WordTopics wt ON w.WordID = wt.WordID
    JOIN ExampleSentences e ON w.WordID = e.WordID
    WHERE wt.TopicID IN (1, 3, 4, 5, 6)
      AND w.ContentStatus = 'Published'
      AND e.SentenceText IS NOT NULL
      AND e.SentenceText != ''
      AND NOT EXISTS (SELECT 1 FROM Questions q WHERE q.WordID = w.WordID AND q.QuestionType = 'DragDrop' AND q.ContentStatus = 'Published')
    ORDER BY wt.TopicID, w.WordID;

OPEN dragdrop_cursor;
FETCH NEXT FROM dragdrop_cursor INTO @WordID, @Term, @Meaning, @Sentence;
SET @Count = 0;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Build DragDrop JSON: {"items":["word1","word2",...]}
    DECLARE @DragDropJson NVARCHAR(MAX) = '{"items":[';
    DECLARE @First BIT = 1;
    DECLARE @Word NVARCHAR(200);

    -- Split sentence by spaces
    DECLARE split_cursor CURSOR FOR
        SELECT value FROM STRING_SPLIT(@Sentence, ' ') WHERE value != '';

    OPEN split_cursor;
    FETCH NEXT FROM split_cursor INTO @Word;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @First = 1
            SET @DragDropJson = @DragDropJson + '"' + @Word + '"';
        ELSE
            SET @DragDropJson = @DragDropJson + ',"' + @Word + '"';
        SET @First = 0;
        FETCH NEXT FROM split_cursor INTO @Word;
    END;

    CLOSE split_cursor;
    DEALLOCATE split_cursor;

    SET @DragDropJson = @DragDropJson + ']}';

    INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (@WordID, 'DragDrop', N'Sắp xếp các từ để tạo thành câu hoàn chỉnh', @DragDropJson, @Sentence, 2, @AdminUserID, 'Published', @Now, @Now, @Now);

    SET @Count = @Count + 1;
    FETCH NEXT FROM dragdrop_cursor INTO @WordID, @Term, @Meaning, @Sentence;
END;

CLOSE dragdrop_cursor;
DEALLOCATE dragdrop_cursor;

PRINT '  + Added ' + CAST(@Count AS VARCHAR) + ' DragDrop questions';
PRINT '';

-- ============================================================
-- VERIFY
-- ============================================================
PRINT '============================================================';
PRINT '  VERIFY KẾT QUẢ';
PRINT '============================================================';
PRINT '';

PRINT '--- Số lượng câu hỏi theo Topic và QuestionType ---';
PRINT '';

SELECT t.TopicID, t.TopicName, q.QuestionType, COUNT(*) AS Count
FROM Topics t
JOIN WordTopics wt ON t.TopicID = wt.TopicID
JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published'
WHERE t.TopicID IN (1,2,3,4,5,6)
GROUP BY t.TopicID, t.TopicName, q.QuestionType
ORDER BY t.TopicID, q.QuestionType;

PRINT '';
PRINT '--- Words missing questions (should be empty) ---';
PRINT '';

SELECT w.Term, t.TopicName,
       MAX(CASE WHEN q.QuestionType = 'MCQ' THEN 1 ELSE 0 END) AS hasMCQ,
       MAX(CASE WHEN q.QuestionType = 'FillBlank' THEN 1 ELSE 0 END) AS hasFillBlank,
       MAX(CASE WHEN q.QuestionType = 'Dictation' THEN 1 ELSE 0 END) AS hasDictation,
       MAX(CASE WHEN q.QuestionType = 'DragDrop' THEN 1 ELSE 0 END) AS hasDragDrop
FROM Words w
JOIN WordTopics wt ON w.WordID = wt.WordID
JOIN Topics t ON wt.TopicID = t.TopicID
LEFT JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published'
WHERE t.TopicID IN (1,2,3,4,5,6) AND w.ContentStatus = 'Published'
GROUP BY w.Term, t.TopicName
HAVING MAX(CASE WHEN q.QuestionType = 'MCQ' THEN 1 ELSE 0 END) = 0
    OR MAX(CASE WHEN q.QuestionType = 'FillBlank' THEN 1 ELSE 0 END) = 0
    OR MAX(CASE WHEN q.QuestionType = 'Dictation' THEN 1 ELSE 0 END) = 0
    OR MAX(CASE WHEN q.QuestionType = 'DragDrop' THEN 1 ELSE 0 END) = 0
ORDER BY t.TopicName, w.Term;

PRINT '';
PRINT '--- Tổng quan database ---';
SELECT 'Published Topics: ' + CAST(COUNT(*) AS VARCHAR) FROM Topics WHERE ContentStatus = 'Published';
SELECT 'Published Words: ' + CAST(COUNT(*) AS VARCHAR) FROM Words WHERE ContentStatus = 'Published';
SELECT 'Published Questions: ' + CAST(COUNT(*) AS VARCHAR) FROM Questions WHERE ContentStatus = 'Published';
SELECT '  MCQ: ' + CAST(SUM(CASE WHEN QuestionType='MCQ' THEN 1 ELSE 0 END) AS VARCHAR) FROM Questions WHERE ContentStatus = 'Published';
SELECT '  FillBlank: ' + CAST(SUM(CASE WHEN QuestionType='FillBlank' THEN 1 ELSE 0 END) AS VARCHAR) FROM Questions WHERE ContentStatus = 'Published';
SELECT '  Dictation: ' + CAST(SUM(CASE WHEN QuestionType='Dictation' THEN 1 ELSE 0 END) AS VARCHAR) FROM Questions WHERE ContentStatus = 'Published';
SELECT '  DragDrop: ' + CAST(SUM(CASE WHEN QuestionType='DragDrop' THEN 1 ELSE 0 END) AS VARCHAR) FROM Questions WHERE ContentStatus = 'Published';
SELECT 'ExampleSentences: ' + CAST(COUNT(*) AS VARCHAR) FROM ExampleSentences;

PRINT '';
PRINT '============================================================';
PRINT '  HOÀN THÀNH!';
PRINT '============================================================';
GO
