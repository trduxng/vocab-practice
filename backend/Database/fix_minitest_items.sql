-- ============================================================
-- FIX: Xoá MiniTestItems bị thiếu và insert lại đúng 8 câu/test
-- Cho các MiniTest ID 50 → 61
-- ============================================================
-- Cách chạy:
--   docker cp backend/Database/fix_minitest_items.sql sqlserver_2022:/tmp/fix_items.sql
--   docker exec sqlserver_2022 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Hoangphuc@040505' -C -d ToeicVocabularyPlatform -i /tmp/fix_items.sql
-- ============================================================

PRINT '=== BẮT ĐẦU FIX MINI TEST ITEMS ===';
PRINT '';

-- Xoá tất cả items cũ cho tests 50-61
DELETE FROM MiniTestItems WHERE MiniTestID BETWEEN 50 AND 61;
PRINT 'Deleted old items for tests 50-61';
PRINT '';

-- Insert từng test một
DECLARE @TestID INT, @TopicCode NVARCHAR(50), @Order INT;

-- Test 50-51: Shopping & Services
SET @TopicCode = 'SHOPPING_SERVICES';
SET @TestID = 50;
SET @Order = 1;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 2;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 3;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 4;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 5;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 6;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 7;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 8;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 50 done (8 items)';

SET @TestID = 51;
SET @Order = 1;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 2;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 3;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 4;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 5;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 6;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 7;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 8;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 51 done (8 items)';

-- Test 52-53: Health & Medical
SET @TopicCode = 'HEALTH_MEDICAL';
SET @TestID = 52;
SET @Order = 1;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 2;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 3;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 4;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 5;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 6;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 7;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 8;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 52 done (8 items)';

SET @TestID = 53;
SET @Order = 1;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 2;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 3;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 4;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 5;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 6;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 7;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 8;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 53 done (8 items)';

-- Test 54-55: Finance & Banking
SET @TopicCode = 'FINANCE_BANKING';
SET @TestID = 54;
SET @Order = 1;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 2;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 3;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 4;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 5;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 6;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 7;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 8;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 54 done (8 items)';

SET @TestID = 55;
PRINT '  + Test 55 start...';
SET @Order = 1;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 2;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 3;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 4;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 5;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 6;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 7;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 8;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 55 done (8 items)';

-- Test 56-57: Marketing & Advertising
SET @TopicCode = 'MARKETING_ADVERTISING';
SET @TestID = 56;
SET @Order = 1;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 2;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 3;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 4;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 5;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 6;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 7;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
SET @Order = 8;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 56 done (8 items)';

SET @TestID = 57;
PRINT '  + Test 57 start...';
SET @Order = 10;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+1 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+2 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+3 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+4 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+5 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+6 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+7 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 57 done (8 items)';

-- Test 58-59: HR & Personnel
SET @TopicCode = 'HR_PERSONNEL';
SET @TestID = 58;
SET @Order = 10;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+1 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+2 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+3 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+4 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+5 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+6 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+7 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 58 done (8 items)';

SET @TestID = 59;
SET @Order = 10;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+1 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+2 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+3 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+4 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+5 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+6 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+7 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 59 done (8 items)';

-- Test 60-61: Law & Legal
SET @TopicCode = 'LAW_LEGAL';
SET @TestID = 60;
SET @Order = 10;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+1 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+2 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+3 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+4 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+5 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+6 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+7 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 60 done (8 items)';

SET @TestID = 61;
SET @Order = 10;
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+1 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'MCQ' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+2 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+3 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'FillBlank' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+4 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+5 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'Dictation' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+6 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) SELECT TOP 1 @TestID, q.QuestionID, @Order+7 FROM Questions q JOIN Words w ON q.WordID = w.WordID JOIN WordTopics wt ON w.WordID = wt.WordID JOIN Topics t ON wt.TopicID = t.TopicID WHERE t.TopicCode = @TopicCode AND q.QuestionType = 'DragDrop' AND w.ContentStatus = 'Published' AND q.ContentStatus = 'Published' ORDER BY NEWID();
PRINT '  + Test 61 done (8 items)';

-- ============================================================
-- VERIFY
-- ============================================================
PRINT '';
PRINT '=== VERIFY ===';
SELECT 
    mt.MiniTestID, 
    mt.TestTitle, 
    mt.TotalQuestions, 
    COUNT(mti.QuestionID) AS ActualItems
FROM MiniTests mt
LEFT JOIN MiniTestItems mti ON mt.MiniTestID = mti.MiniTestID
WHERE mt.MiniTestID BETWEEN 50 AND 61
GROUP BY mt.MiniTestID, mt.TestTitle, mt.TotalQuestions
ORDER BY mt.MiniTestID;

PRINT '';
SELECT COUNT(*) AS TotalMiniTestItems FROM MiniTestItems;
PRINT '';
PRINT '=== HOÀN THÀNH ===';
GO
