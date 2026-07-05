-- ============================================================
-- FIX: Bổ sung OptionsJson cho 84 câu hỏi MCQ bị thiếu
--       Sửa 84 câu FillBlank từ '{}' → '[]'
-- ============================================================
-- Cách chạy:
--   docker cp backend/Database/fix_mcq_options.sql sqlserver_2022:/tmp/fix_mcq.sql
--   docker exec sqlserver_2022 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Hoangphuc@040505' -C -d ToeicVocabularyPlatform -i /tmp/fix_mcq.sql
-- ============================================================

PRINT '============================================================';
PRINT '  BẮT ĐẦU SỬA OPTIONSJSON CHO CÂU HỎI';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- PHẦN 1: FIX MCQ — Tạo OptionsJson với 3 distractors từ cùng chủ đề
-- ============================================================
PRINT '=== PHẦN 1: SỬA MCQ QUESTIONS ===';
PRINT '';

DECLARE @QuestionID BIGINT;
DECLARE @WordID BIGINT;
DECLARE @TopicID BIGINT;
DECLARE @CorrectMeaning NVARCHAR(1000);
DECLARE @OptionsJson NVARCHAR(MAX);
DECLARE @Count INT = 0;

DECLARE fix_mcq_cursor CURSOR FOR
    SELECT q.QuestionID, w.WordID, wt.TopicID, w.Meaning
    FROM Questions q
    JOIN Words w ON q.WordID = w.WordID
    JOIN WordTopics wt ON w.WordID = wt.WordID
    WHERE q.QuestionType = 'MCQ'
      AND (q.OptionsJson IS NULL OR q.OptionsJson = '{}' OR q.OptionsJson = '')
      AND q.ContentStatus = 'Published'
    ORDER BY wt.TopicID, w.WordID;

OPEN fix_mcq_cursor;
FETCH NEXT FROM fix_mcq_cursor INTO @QuestionID, @WordID, @TopicID, @CorrectMeaning;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Escape special JSON characters in meanings
    DECLARE @EscapedCorrect NVARCHAR(1000);
    SET @EscapedCorrect = REPLACE(REPLACE(@CorrectMeaning, '\', '\\'), '"', '\"');

    -- Lấy 3 nghĩa khác từ cùng chủ đề (random)
    -- Dùng CTE + STRING_AGG để tạo JSON array một cách an toàn
    WITH distractors AS (
        SELECT TOP 3 w2.Meaning
        FROM Words w2
        JOIN WordTopics wt2 ON w2.WordID = wt2.WordID
        WHERE wt2.TopicID = @TopicID
          AND w2.WordID != @WordID
          AND w2.ContentStatus = 'Published'
        ORDER BY NEWID()
    ),
    all_options AS (
        SELECT @EscapedCorrect AS opt, NEWID() AS ord
        UNION ALL
        SELECT REPLACE(REPLACE(Meaning, '\', '\\'), '"', '\"'), NEWID()
        FROM distractors
    )
    SELECT @OptionsJson =
        '[' + STRING_AGG('"' + opt + '"', ',') WITHIN GROUP (ORDER BY ord) + ']'
    FROM all_options;

    -- Cập nhật
    UPDATE Questions
    SET OptionsJson = @OptionsJson,
        UpdatedAt = SYSDATETIMEOFFSET()
    WHERE QuestionID = @QuestionID;

    SET @Count = @Count + 1;
    IF @Count <= 5 OR @Count % 10 = 0
        PRINT '  + Fixed MCQ QuestionID ' + CAST(@QuestionID AS VARCHAR) + ' (#' + CAST(@Count AS VARCHAR) + ')';

    FETCH NEXT FROM fix_mcq_cursor INTO @QuestionID, @WordID, @TopicID, @CorrectMeaning;
END;

CLOSE fix_mcq_cursor;
DEALLOCATE fix_mcq_cursor;

PRINT '';
PRINT '  ✅ Đã sửa ' + CAST(@Count AS VARCHAR) + ' câu hỏi MCQ';
PRINT '';

-- ============================================================
-- PHẦN 2: FIX FillBlank — Đồng bộ OptionsJson từ '{}' → '[]'
-- ============================================================
PRINT '=== PHẦN 2: ĐỒNG BỘ FILLBLANK OPTIONSJSON ===';
PRINT '';

UPDATE Questions
SET OptionsJson = '[]',
    UpdatedAt = SYSDATETIMEOFFSET()
WHERE QuestionType = 'FillBlank'
  AND (OptionsJson = '{}' OR OptionsJson IS NULL OR OptionsJson = '')
  AND ContentStatus = 'Published';

SET @Count = @@ROWCOUNT;
PRINT '  ✅ Đã đồng bộ ' + CAST(@Count AS VARCHAR) + ' câu hỏi FillBlank';
PRINT '';

-- ============================================================
-- PHẦN 3: DICTATION — Đồng bộ về '{}' (không cần options)
-- ============================================================
PRINT '=== PHẦN 3: ĐỒNG BỘ DICTATION OPTIONSJSON ===';
PRINT '';

UPDATE Questions
SET OptionsJson = '{}',
    UpdatedAt = SYSDATETIMEOFFSET()
WHERE QuestionType = 'Dictation'
  AND (OptionsJson IS NULL OR OptionsJson = '')
  AND ContentStatus = 'Published';

SET @Count = @@ROWCOUNT;
PRINT '  ✅ Đã đồng bộ ' + CAST(@Count AS VARCHAR) + ' câu hỏi Dictation';
PRINT '';

-- ============================================================
-- VERIFY
-- ============================================================
PRINT '============================================================';
PRINT '  VERIFY KẾT QUẢ';
PRINT '============================================================';
PRINT '';

PRINT '--- Missing OptionsJson theo từng loại ---';
SELECT QuestionType,
       COUNT(*) AS Total,
       SUM(CASE WHEN OptionsJson IS NULL OR OptionsJson = '' OR OptionsJson = '{}' THEN 1 ELSE 0 END) AS StillMissing
FROM Questions
WHERE ContentStatus = 'Published'
GROUP BY QuestionType
ORDER BY QuestionType;

PRINT '';
PRINT '--- Sample MCQ OptionsJson (top 5) ---';
SELECT TOP 5 q.QuestionID, w.Term,
       LEFT(q.OptionsJson, 150) AS OptionsJson,
       LEFT(q.CorrectAnswer, 60) AS CorrectAnswer
FROM Questions q
JOIN Words w ON q.WordID = w.WordID
WHERE q.QuestionType = 'MCQ'
  AND q.ContentStatus = 'Published'
  AND q.OptionsJson != '{}'
  AND q.OptionsJson IS NOT NULL
ORDER BY q.QuestionID DESC;

PRINT '';
PRINT '============================================================';
PRINT '  HOÀN THÀNH SỬA OPTIONSJSON!';
PRINT '============================================================';
GO
