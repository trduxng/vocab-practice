-- ============================================================
-- FIX CUỐI CÙNG: Tests 52 (thiếu DisplayOrder 2, cần MCQ)
--                    và 55 (thiếu DisplayOrder 8, cần DragDrop)
-- ============================================================

PRINT '=== FIX FINAL 2 TESTS ===';
PRINT '';

-- Test 52: thiếu order 2 - cần thêm MCQ
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 52, q.QuestionID, 2
FROM Questions q
JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
JOIN WordTopics wt ON w.WordID = wt.WordID
JOIN Topics t ON wt.TopicID = t.TopicID AND t.TopicCode = 'HEALTH_MEDICAL'
WHERE q.QuestionType = 'MCQ' AND q.ContentStatus = 'Published'
  AND q.QuestionID NOT IN (SELECT QuestionID FROM MiniTestItems WHERE MiniTestID = 52)
ORDER BY NEWID();
PRINT '  + Test 52: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' row(s) added';

-- Test 55: thiếu order 8 - cần thêm DragDrop
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
SELECT TOP 1 55, q.QuestionID, 8
FROM Questions q
JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
JOIN WordTopics wt ON w.WordID = wt.WordID
JOIN Topics t ON wt.TopicID = t.TopicID AND t.TopicCode = 'FINANCE_BANKING'
WHERE q.QuestionType = 'DragDrop' AND q.ContentStatus = 'Published'
  AND q.QuestionID NOT IN (SELECT QuestionID FROM MiniTestItems WHERE MiniTestID = 55)
ORDER BY NEWID();
PRINT '  + Test 55: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' row(s) added';

PRINT '';
PRINT '=== VERIFY ===';
SELECT 
    mt.MiniTestID, 
    COUNT(mti.QuestionID) AS ActualItems,
    CASE WHEN COUNT(mti.QuestionID) = 8 THEN 'OK' ELSE 'MISSING' END AS Status
FROM MiniTests mt
LEFT JOIN MiniTestItems mti ON mt.MiniTestID = mti.MiniTestID
WHERE mt.MiniTestID IN (52, 55)
GROUP BY mt.MiniTestID, mt.TotalQuestions
ORDER BY mt.MiniTestID;

SELECT MiniTestID, DisplayOrder FROM MiniTestItems WHERE MiniTestID IN (52, 55) ORDER BY MiniTestID, DisplayOrder;

PRINT '';
SELECT COUNT(*) AS TotalMiniTestItems FROM MiniTestItems;
PRINT '';
PRINT '=== HOÀN THÀNH ===';
GO
