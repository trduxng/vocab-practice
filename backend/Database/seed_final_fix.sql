-- ============================================================
-- SEED FINAL FIX: Insert missing WordTopics, Topic 12 words, 
-- and mark topic 7 as complete with learning path
-- ============================================================

-- ============================================================
-- PART 1: INSERT WORDTOPICS FOR ALL WORDS INSERTED IN FIRST RUN
-- (Topics 3,4,5,6,7,9,10,11,12,13)
-- ============================================================
PRINT '--- Inserting missing WordTopics ---';

-- Topic 3: Daily Routines (WordIDs 291-298)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 3, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 291 AND 298 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 3);
PRINT '   Topic 3: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 4: Airport & Travel (WordIDs 299-306)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 4, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 299 AND 306 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 4);
PRINT '   Topic 4: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 5: Software & Office Tech (WordIDs 307-316)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 5, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 307 AND 316 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 5);
PRINT '   Topic 5: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 6: Academic Study (WordIDs 317-324)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 6, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 317 AND 324 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 6);
PRINT '   Topic 6: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 7: A.I English (WordIDs 325-339) 
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 7, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 325 AND 339 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 7);
PRINT '   Topic 7: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 9: Health & Medical (WordIDs 348-355)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 9, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 348 AND 355 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 9);
PRINT '   Topic 9: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 10: Finance & Banking (WordIDs 356-363)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 10, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 356 AND 363 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 10);
PRINT '   Topic 10: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 11: Marketing & Advertising (WordIDs 364-371)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 11, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 364 AND 371 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 11);
PRINT '   Topic 11: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 12: HR & Personnel - need to check which words exist here
-- Words were supposed to be 372-379 but many failed
-- Let me find the words by term
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT w.WordID, 12, SYSDATETIMEOFFSET() FROM Words w
WHERE w.Term IN ('Attrition','Delegation','Remuneration','Succession','Contingent','Discretion','Grievance','Compliance')
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = 12);
PRINT '   Topic 12: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Topic 13: Law & Legal (WordIDs 380-387)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 13, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 380 AND 387 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 13);
PRINT '   Topic 13: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Also fix Topic 1 and Topic 2 mappings for words from the fix script
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT w.WordID, 1, SYSDATETIMEOFFSET() FROM Words w
WHERE w.Term IN ('Allocate','Dividend','Forecast','Liquidate','Downsize','Equity')
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = 1);
PRINT '   Topic 1 (fix): ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT w.WordID, 2, SYSDATETIMEOFFSET() FROM Words w
WHERE w.Term IN ('Ballot','Consensus','Stakeholder','Benchmark','Mandate','Convene','Adjourn','Quorum','Arbitrate','Ratify')
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = 2);
PRINT '   Topic 2 (fix): ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

-- Leverage -> Topic 10 (Finance)
-- Note: Leverage was inserted at a different WordID by the first run (361)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT w.WordID, 10, SYSDATETIMEOFFSET() FROM Words w
WHERE w.Term = 'Leverage'
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = 10);
PRINT '   Leverage->Topic10: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

PRINT '✅ All WordTopics inserted.';
GO

-- ============================================================
-- PART 2: INSERT MISSING TOPIC 12 WORDS (individual inserts)
-- ============================================================
PRINT '--- Inserting missing Topic 12 (HR) words ---';

IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Attrition')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (372, 'Attrition', 1, N'Sự nghỉ việc, hao hụt nhân sự', '/əˈtrɪʃ.ən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Attrition (372)';
END
GO

IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Delegation')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (373, 'Delegation', 1, N'Sự ủy quyền, phân công', '/ˌdel.ɪˈɡeɪ.ʃən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Delegation (373)';
END
GO

IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Remuneration')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (374, 'Remuneration', 1, N'Thù lao, đãi ngộ', '/rɪˌmjuː.nərˈeɪ.ʃən/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Remuneration (374)';
END
GO

IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Succession')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (375, 'Succession', 1, N'Sự kế nhiệm', '/səkˈseʃ.ən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Succession (375)';
END
GO

IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Contingent')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (376, 'Contingent', 3, N'Tạm thời, phụ thuộc', '/kənˈtɪn.dʒənt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Contingent (376)';
END
GO

IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Discretion')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (377, 'Discretion', 1, N'Quyền quyết định, thận trọng', '/dɪˈskreʃ.ən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Discretion (377)';
END
GO

IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Grievance')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (378, 'Grievance', 1, N'Khiếu nại (nhân viên)', '/ˈɡriː.vəns/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Grievance (378)';
END
GO

-- Link new HR words to Topic 12
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT WordID, 12, SYSDATETIMEOFFSET() FROM Words 
WHERE WordID BETWEEN 372 AND 378 
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = Words.WordID AND wt.TopicID = 12);
PRINT '   Topic 12 WordTopics: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' rows';

PRINT '✅ Topic 12 (HR) words inserted.';
GO

-- ============================================================
-- PART 3: ADD LEARNING PATH FOR TOPIC 7 (AI English)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = 3 AND TopicID = 7)
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (3, 7, 4, 0, SYSDATETIMEOFFSET());

IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = 4 AND TopicID = 7)
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (4, 7, 4, 0, SYSDATETIMEOFFSET());

PRINT '✅ Learning path updated for AI Topic.';
GO

-- ============================================================
-- SUMMARY
-- ============================================================
SELECT 'FINAL COUNTS' AS info;
SELECT COUNT(*) AS total_words FROM Words;
SELECT COUNT(*) AS total_questions FROM Questions;
SELECT COUNT(*) AS total_example_sentences FROM ExampleSentences;
SELECT COUNT(*) AS total_minitests FROM MiniTests;
SELECT COUNT(*) AS total_minitest_items FROM MiniTestItems;
SELECT COUNT(*) AS total_wordtopics FROM WordTopics;
SELECT COUNT(*) AS total_learningpath_topics FROM LearningPathTopics;
GO

PRINT '';
PRINT '============================================';
PRINT '✅ SEED DATA FINAL FIX COMPLETED';
PRINT '============================================';
GO
