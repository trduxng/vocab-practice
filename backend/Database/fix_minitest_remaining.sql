-- ============================================================
-- FIX REMAINING: Tests 52, 54, 55, 59 còn thiếu 1 item mỗi test
-- ============================================================
-- Cách chạy: docker cp và exec như script khác
-- ============================================================

PRINT '=== FIX REMAINING 4 TESTS (52, 54, 55, 59) ===';
PRINT '';

-- Test 52 - Health & Medical A - thiếu 1 DragDrop
PRINT '--- Test 52: adding missing DragDrop ---';
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 52, q.QuestionID, 8
FROM Questions q
JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
JOIN WordTopics wt ON w.WordID = wt.WordID
JOIN Topics t ON wt.TopicID = t.TopicID AND t.TopicCode = 'HEALTH_MEDICAL'
WHERE q.QuestionType = 'DragDrop' AND q.ContentStatus = 'Published'
  AND q.QuestionID NOT IN (SELECT QuestionID FROM MiniTestItems WHERE MiniTestID = 52)
ORDER BY NEWID();

-- Test 54 - Finance & Banking A - thiếu 1 DragDrop
PRINT '--- Test 54: adding missing DragDrop ---';
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 54, q.QuestionID, 8
FROM Questions q
JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
JOIN WordTopics wt ON w.WordID = wt.WordID
JOIN Topics t ON wt.TopicID = t.TopicID AND t.TopicCode = 'FINANCE_BANKING'
WHERE q.QuestionType = 'DragDrop' AND q.ContentStatus = 'Published'
  AND q.QuestionID NOT IN (SELECT QuestionID FROM MiniTestItems WHERE MiniTestID = 54)
ORDER BY NEWID();

-- Test 55 - Finance & Banking B - thiếu 1 MCQ
PRINT '--- Test 55: adding missing MCQ ---';
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 55, q.QuestionID, 1
FROM Questions q
JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
JOIN WordTopics wt ON w.WordID = wt.WordID
JOIN Topics t ON wt.TopicID = t.TopicID AND t.TopicCode = 'FINANCE_BANKING'
WHERE q.QuestionType = 'MCQ' AND q.ContentStatus = 'Published'
  AND q.QuestionID NOT IN (SELECT QuestionID FROM MiniTestItems WHERE MiniTestID = 55)
ORDER BY NEWID();

-- Fix DisplayOrder cho test 55
UPDATE mti SET DisplayOrder = sq.NewOrder
FROM MiniTestItems mti
JOIN (
    SELECT MiniTestID, QuestionID, ROW_NUMBER() OVER (ORDER BY DisplayOrder, QuestionID) AS NewOrder
    FROM MiniTestItems WHERE MiniTestID = 55
) sq ON mti.MiniTestID = sq.MiniTestID AND mti.QuestionID = sq.QuestionID
WHERE mti.MiniTestID = 55;

-- Test 59 - HR & Personnel B - thiếu 1 FillBlank
PRINT '--- Test 59: adding missing FillBlank ---';
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 59, q.QuestionID, 4
FROM Questions q
JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
JOIN WordTopics wt ON w.WordID = wt.WordID
JOIN Topics t ON wt.TopicID = t.TopicID AND t.TopicCode = 'HR_PERSONNEL'
WHERE q.QuestionType = 'FillBlank' AND q.ContentStatus = 'Published'
  AND q.QuestionID NOT IN (SELECT QuestionID FROM MiniTestItems WHERE MiniTestID = 59)
ORDER BY NEWID();

-- Fix DisplayOrder cho test 59
UPDATE mti SET DisplayOrder = sq.NewOrder
FROM MiniTestItems mti
JOIN (
    SELECT MiniTestID, QuestionID, ROW_NUMBER() OVER (ORDER BY DisplayOrder, QuestionID) AS NewOrder
    FROM MiniTestItems WHERE MiniTestID = 59
) sq ON mti.MiniTestID = sq.MiniTestID AND mti.QuestionID = sq.QuestionID
WHERE mti.MiniTestID = 59;

PRINT '';
PRINT '=== VERIFY ===';
SELECT 
    mt.MiniTestID, 
    mt.TestTitle, 
    mt.TotalQuestions, 
    COUNT(mti.QuestionID) AS ActualItems
FROM MiniTests mt
LEFT JOIN MiniTestItems mti ON mt.MiniTestID = mti.MiniTestID
WHERE mt.MiniTestID IN (52, 54, 55, 59)
GROUP BY mt.MiniTestID, mt.TestTitle, mt.TotalQuestions
ORDER BY mt.MiniTestID;

PRINT '';
PRINT '=== ALL TESTS 50-61 FINAL ===';
SELECT 
    mt.MiniTestID, 
    COUNT(mti.QuestionID) AS ActualItems,
    CASE WHEN COUNT(mti.QuestionID) = 8 THEN 'OK' ELSE 'MISSING' END AS Status
FROM MiniTests mt
LEFT JOIN MiniTestItems mti ON mt.MiniTestID = mti.MiniTestID
WHERE mt.MiniTestID BETWEEN 50 AND 61
GROUP BY mt.MiniTestID, mt.TotalQuestions
ORDER BY mt.MiniTestID;

PRINT '';
SELECT COUNT(*) AS TotalMiniTestItems FROM MiniTestItems;
PRINT '';
PRINT '=== HOÀN THÀNH ===';
GO
