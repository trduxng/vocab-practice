-- ============================================================
-- SEED FIX: Insert missing words + all sentences/questions/mini-tests
-- ============================================================
-- This script handles the gaps from the previous run and
-- creates all remaining interconnected data.

-- ============================================================
-- PART A: INSERT MISSING WORDS (IDs 273-290, 340-347)
-- Using individual MERGE to avoid batch failures from duplicates
-- ============================================================

-- Word already exists check helper
PRINT '--- Inserting missing Topic 1 words ---';

-- WordID 273: Delegate (already exists in DB as different ID, skip)
-- WordID 274: Allocate
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Allocate')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (273, 'Allocate', 2, N'Phân bổ, cấp phát', '/ˈæl.ə.keɪt/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Allocate (273) inserted';
END
GO

-- WordID 275: Dividend
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Dividend')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (275, 'Dividend', 1, N'Cổ tức', '/ˈdɪv.ɪ.dend/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Dividend (275) inserted';
END
GO

-- WordID 276: Forecast
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Forecast')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (276, 'Forecast', 2, N'Dự báo', '/ˈfɔːr.kæst/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Forecast (276) inserted';
END
GO

-- WordID 277: Liquidate
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Liquidate')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (277, 'Liquidate', 2, N'Thanh lý', '/ˈlɪk.wɪ.deɪt/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Liquidate (277) inserted';
END
GO

-- WordID 278: Downsize
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Downsize')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (278, 'Downsize', 2, N'Thu hẹp quy mô', '/ˈdaʊn.saɪz/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Downsize (278) inserted';
END
GO

-- WordID 279: Equity
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Equity')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (279, 'Equity', 1, N'Vốn chủ sở hữu', '/ˈek.wɪ.ti/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Equity (279) inserted';
END
GO

-- WordID 280: Leverage (different word, not Fiscal which exists)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Leverage')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (280, 'Leverage', 1, N'Đòn bẩy', '/ˈlev.ər.ɪdʒ/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Leverage (280) inserted';
END
GO

PRINT '--- Inserting missing Topic 2 words ---';

-- WordIDs 281-290: Topic 2 words that DON'T already exist
-- Ballot (281)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Ballot')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (281, 'Ballot', 1, N'Lá phiếu, bỏ phiếu', '/ˈbæl.ət/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Ballot (281) inserted';
END
GO

-- Consensus (282)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Consensus')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (282, 'Consensus', 1, N'Sự đồng thuận', '/kənˈsen.səs/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Consensus (282) inserted';
END
GO

-- Stakeholder (283)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Stakeholder')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (283, 'Stakeholder', 1, N'Bên liên quan', '/ˈsteɪk.həʊl.dər/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Stakeholder (283) inserted';
END
GO

-- Benchmark (284)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Benchmark')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (284, 'Benchmark', 1, N'Điểm chuẩn', '/ˈbentʃ.mɑːrk/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Benchmark (284) inserted';
END
GO

-- Mandate (285)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Mandate')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (285, 'Mandate', 1, N'Nhiệm vụ, ủy thác', '/ˈmæn.deɪt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Mandate (285) inserted';
END
GO

-- Convene (286)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Convene')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (286, 'Convene', 2, N'Triệu tập, họp', '/kənˈviːn/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Convene (286) inserted';
END
GO

-- Adjourn (287)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Adjourn')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (287, 'Adjourn', 2, N'Hoãn lại, tạm nghỉ', '/əˈdʒɜːrn/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Adjourn (287) inserted';
END
GO

-- Quorum (288)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Quorum')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (288, 'Quorum', 1, N'Số đại biểu tối thiểu', '/ˈkwɔːr.əm/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Quorum (288) inserted';
END
GO

-- Arbitrate (289)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Arbitrate')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (289, 'Arbitrate', 2, N'Phân xử, làm trọng tài', '/ˈɑːr.bɪ.treɪt/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Arbitrate (289) inserted';
END
GO

-- Ratify (290)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Ratify')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (290, 'Ratify', 2, N'Phê chuẩn, thông qua', '/ˈræt.ɪ.faɪ/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Ratify (290) inserted';
END
GO

PRINT '--- Inserting missing Topic 8 words ---';

-- WordIDs 340-347: Shopping words (Appraisal already exists, skip)
-- Consignment (340)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Consignment')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (340, 'Consignment', 1, N'Lô hàng gửi bán', '/kənˈsaɪn.mənt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Consignment (340) inserted';
END
GO

-- Merchandise (341)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Merchandise')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (341, 'Merchandise', 1, N'Hàng hóa', '/ˈmɜːr.tʃən.daɪs/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Merchandise (341) inserted';
END
GO

-- Procurement (342)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Procurement')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (342, 'Procurement', 1, N'Thu mua, mua sắm', '/prəˈkjʊr.mənt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Procurement (342) inserted';
END
GO

-- Retail (343)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Retail')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (343, 'Retail', 1, N'Bán lẻ', '/ˈriː.teɪl/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Retail (343) inserted';
END
GO

-- Vendor (344)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Vendor')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (344, 'Vendor', 1, N'Nhà cung cấp, người bán', '/ˈven.dər/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Vendor (344) inserted';
END
GO

-- Surcharge (345)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Surcharge')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (345, 'Surcharge', 1, N'Phụ phí', '/ˈsɜːr.tʃɑːrdʒ/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Surcharge (345) inserted';
END
GO

-- Clearance (347 - skipping 346 which is Appraisal, already exists)
IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = 'Clearance')
BEGIN
    SET IDENTITY_INSERT Words ON;
    INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
    VALUES (347, 'Clearance', 1, N'Thanh lý, giải phóng hàng', '/ˈklɪr.əns/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
    SET IDENTITY_INSERT Words OFF;
    PRINT '   + Clearance (347) inserted';
END
GO

-- Add Appraisal as a new word if it doesn't exist (it already does, so skip)
PRINT '--- Missing words inserted. Adding WordTopics... ---';
GO

-- ============================================================
-- PART B: INSERT MISSING WORD-TOPIC MAPPINGS
-- ============================================================
-- Topic 1
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT w.WordID, 1, SYSDATETIMEOFFSET() FROM Words w
WHERE w.Term IN ('Allocate','Dividend','Forecast','Liquidate','Downsize','Equity','Leverage')
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = 1);

-- Topic 2
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT w.WordID, 2, SYSDATETIMEOFFSET() FROM Words w
WHERE w.Term IN ('Ballot','Consensus','Stakeholder','Benchmark','Mandate','Convene','Adjourn','Quorum','Arbitrate','Ratify')
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = 2);

-- Topic 8 (Shopping)
INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
SELECT w.WordID, 8, SYSDATETIMEOFFSET() FROM Words w
WHERE w.Term IN ('Consignment','Merchandise','Procurement','Retail','Vendor','Surcharge','Clearance')
AND NOT EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = 8);

PRINT '✅ WordTopics updated';
GO

-- ============================================================
-- PART C: EXAMPLE SENTENCES FOR ALL NEW WORDS
-- Using MERGE to safely insert
-- ============================================================
DECLARE @maxExId INT;
SELECT @maxExId = ISNULL(MAX(ExampleSentenceID), 195) FROM ExampleSentences;

-- Sentences for Topic 1 words
SET IDENTITY_INSERT ExampleSentences ON;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'We need to allocate the budget carefully for this quarter.', N'Chúng ta cần phân bổ ngân sách cẩn thận cho quý này.'
FROM Words w WHERE w.Term = 'Allocate' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The company announced a dividend of $2 per share.', N'Công ty đã công bố cổ tức 2 đô la mỗi cổ phiếu.'
FROM Words w WHERE w.Term = 'Dividend' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The sales forecast predicts a 10% increase next year.', N'Dự báo doanh số dự đoán mức tăng 10% vào năm tới.'
FROM Words w WHERE w.Term = 'Forecast' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The company had to liquidate its assets to pay off debts.', N'Công ty phải thanh lý tài sản để trả nợ.'
FROM Words w WHERE w.Term = 'Liquidate' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The firm decided to downsize its workforce by 20%.', N'Công ty quyết định thu hẹp quy mô lực lượng lao động 20%.'
FROM Words w WHERE w.Term = 'Downsize' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'Home equity loans are popular among homeowners.', N'Các khoản vay vốn chủ sở hữu nhà phổ biến trong giới chủ nhà.'
FROM Words w WHERE w.Term = 'Equity' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The firm used leverage to finance its expansion.', N'Công ty đã sử dụng đòn bẩy để tài trợ cho việc mở rộng.'
FROM Words w WHERE w.Term = 'Leverage' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

-- Sentences for Topic 2 words
IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'Members cast their ballots to elect the new chairperson.', N'Các thành viên bỏ phiếu để bầu chủ tịch mới.'
FROM Words w WHERE w.Term = 'Ballot' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The team reached a consensus after a long discussion.', N'Nhóm đã đạt được sự đồng thuận sau một cuộc thảo luận dài.'
FROM Words w WHERE w.Term = 'Consensus' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'All stakeholders were invited to the project meeting.', N'Tất cả các bên liên quan đã được mời đến cuộc họp dự án.'
FROM Words w WHERE w.Term = 'Stakeholder' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'We use industry benchmarks to measure performance.', N'Chúng tôi sử dụng điểm chuẩn ngành để đo lường hiệu suất.'
FROM Words w WHERE w.Term = 'Benchmark' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The government issued a mandate to reduce emissions.', N'Chính phủ ban hành nhiệm vụ giảm khí thải carbon.'
FROM Words w WHERE w.Term = 'Mandate' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The board decided to convene an emergency meeting.', N'Hội đồng quyết định triệu tập cuộc họp khẩn cấp.'
FROM Words w WHERE w.Term = 'Convene' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The chairman decided to adjourn the meeting until next week.', N'Chủ tịch quyết định hoãn cuộc họp đến tuần sau.'
FROM Words w WHERE w.Term = 'Adjourn' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'We need a quorum of at least ten members to vote.', N'Chúng tôi cần tối thiểu mười thành viên để bỏ phiếu.'
FROM Words w WHERE w.Term = 'Quorum' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'A neutral third party was called to arbitrate the dispute.', N'Một bên thứ ba trung lập được mời đến phân xử tranh chấp.'
FROM Words w WHERE w.Term = 'Arbitrate' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The board ratified the agreement unanimously.', N'Hội đồng đã phê chuẩn thỏa thuận nhất trí.'
FROM Words w WHERE w.Term = 'Ratify' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

-- Topic 8 words
IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The store sells items on a consignment basis.', N'Cửa hàng bán hàng theo hình thức gửi bán.'
FROM Words w WHERE w.Term = 'Consignment' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'All merchandise must be inspected before shipment.', N'Tất cả hàng hóa phải được kiểm tra trước khi vận chuyển.'
FROM Words w WHERE w.Term = 'Merchandise' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The procurement department handles supplier contracts.', N'Phòng thu mua xử lý hợp đồng nhà cung cấp.'
FROM Words w WHERE w.Term = 'Procurement' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'Retail prices are often higher than wholesale prices.', N'Giá bán lẻ thường cao hơn giá bán buôn.'
FROM Words w WHERE w.Term = 'Retail' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The vendor delivered the goods on time.', N'Nhà cung cấp đã giao hàng đúng hạn.'
FROM Words w WHERE w.Term = 'Vendor' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'A surcharge applies for express delivery.', N'Phụ phí áp dụng cho giao hàng hỏa tốc.'
FROM Words w WHERE w.Term = 'Surcharge' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET @maxExId = @maxExId + 1;

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE ExampleSentenceID = @maxExId + 1)
INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
SELECT @maxExId + 1, w.WordID, N'The store is having a clearance sale this weekend.', N'Cửa hàng đang có đợt giảm giá thanh lý cuối tuần này.'
FROM Words w WHERE w.Term = 'Clearance' AND NOT EXISTS (SELECT 1 FROM ExampleSentences es WHERE es.WordID = w.WordID);

SET IDENTITY_INSERT ExampleSentences OFF;

PRINT '✅ Example sentences for missing words inserted';
GO

-- ============================================================
-- PART D: QUESTIONS FOR ALL NEW WORDS
-- ============================================================

-- Get max question ID first
DECLARE @maxQId INT;
SELECT @maxQId = ISNULL(MAX(QuestionID), 757) FROM Questions;

SET IDENTITY_INSERT Questions ON;

-- === TOPIC 1 WORDS ===
-- Allocate (273)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'MCQ', N'What does "allocate" mean?', N'["Phân bổ, cấp phát","Tính toán","Loại bỏ","Đánh giá"]', N'Phân bổ, cấp phát', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Allocate';
SET @maxQId = @maxQId + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'FillBlank', N'We need to ______ the budget carefully for this quarter.', N'[]', N'allocate', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Allocate';
SET @maxQId = @maxQId + 1;

-- Dividend (275)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'MCQ', N'What does "dividend" mean in finance?', N'["Cổ tức","Lợi nhuận","Thu nhập","Đầu tư"]', N'Cổ tức', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Dividend';
SET @maxQId = @maxQId + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'FillBlank', N'The company announced a ______ of $2 per share.', N'[]', N'dividend', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Dividend';
SET @maxQId = @maxQId + 1;

-- Forecast (276)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'MCQ', N'What does "forecast" mean?', N'["Dự báo","Dự án","Kết luận","Phân tích"]', N'Dự báo', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Forecast';
SET @maxQId = @maxQId + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'FillBlank', N'The sales ______ predicts a 10% increase next year.', N'[]', N'forecast', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Forecast';
SET @maxQId = @maxQId + 1;

-- Liquidate (277)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'MCQ', N'What does "liquidate" mean?', N'["Thanh lý","Đầu tư","Mua lại","Sáp nhập"]', N'Thanh lý', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Liquidate';
SET @maxQId = @maxQId + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'FillBlank', N'The company had to ______ its assets to pay off debts.', N'[]', N'liquidate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Liquidate';
SET @maxQId = @maxQId + 1;

-- Downsize (278)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'MCQ', N'What does "downsize" mean?', N'["Thu hẹp quy mô","Mở rộng","Tái cấu trúc","Đầu tư"]', N'Thu hẹp quy mô', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Downsize';
SET @maxQId = @maxQId + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'FillBlank', N'The firm decided to ______ its workforce by 20%.', N'[]', N'downsize', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Downsize';
SET @maxQId = @maxQId + 1;

-- Equity (279)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'MCQ', N'What does "equity" mean in finance?', N'["Vốn chủ sở hữu","Nợ","Lợi nhuận","Chi phí"]', N'Vốn chủ sở hữu', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Equity';
SET @maxQId = @maxQId + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'FillBlank', N'Home ______ loans are popular among homeowners.', N'[]', N'equity', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Equity';
SET @maxQId = @maxQId + 1;

-- Leverage (280)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'MCQ', N'What does "leverage" mean in business?', N'["Đòn bẩy tài chính","Tiết kiệm","Chi phí","Đầu tư"]', N'Đòn bẩy tài chính', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Leverage';
SET @maxQId = @maxQId + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId + 1, WordID, 'FillBlank', N'The company used ______ to finance its expansion.', N'[]', N'leverage', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Leverage';
SET @maxQId = @maxQId + 1;

PRINT '✅ Topic 1 questions inserted';
GO

-- Reset maxQId for each batch
DECLARE @maxQId2 INT;
SELECT @maxQId2 = ISNULL(MAX(QuestionID), 757) FROM Questions;

SET IDENTITY_INSERT Questions ON;

-- Ballot (281)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What does "ballot" mean?', N'["Lá phiếu, bỏ phiếu","Cuộc họp","Biên bản","Quyết định"]', N'Lá phiếu, bỏ phiếu', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Ballot';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'Members cast their ______ to elect the new chairperson.', N'[]', N'ballot', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Ballot';
SET @maxQId2 = @maxQId2 + 1;

-- Consensus (282)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What does "consensus" mean?', N'["Sự đồng thuận","Tranh luận","Bất đồng","Thỏa hiệp"]', N'Sự đồng thuận', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Consensus';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'The team reached a ______ after a long discussion.', N'[]', N'consensus', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Consensus';
SET @maxQId2 = @maxQId2 + 1;

-- Stakeholder (283)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'Who are "stakeholders"?', N'["Các bên liên quan","Cổ đông","Nhân viên","Khách hàng"]', N'Các bên liên quan', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Stakeholder';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'All ______ were invited to the project meeting.', N'[]', N'stakeholders', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Stakeholder';
SET @maxQId2 = @maxQId2 + 1;

-- Benchmark (284)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What is a "benchmark"?', N'["Điểm chuẩn","Mục tiêu","Ngân sách","Báo cáo"]', N'Điểm chuẩn', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Benchmark';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'We use industry ______ to measure performance.', N'[]', N'benchmark', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Benchmark';
SET @maxQId2 = @maxQId2 + 1;

-- Mandate (285)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What does "mandate" mean?', N'["Nhiệm vụ, ủy thác","Quyền lực","Lợi ích","Ưu tiên"]', N'Nhiệm vụ, ủy thác', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Mandate';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'The government issued a ______ to reduce emissions.', N'[]', N'mandate', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Mandate';
SET @maxQId2 = @maxQId2 + 1;

-- Convene (286)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What does "convene" mean?', N'["Triệu tập, họp","Kết thúc","Báo cáo","Phân công"]', N'Triệu tập, họp', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Convene';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'The board decided to ______ an emergency meeting.', N'[]', N'convene', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Convene';
SET @maxQId2 = @maxQId2 + 1;

-- Adjourn (287)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What does "adjourn" mean?', N'["Hoãn lại, tạm nghỉ","Bắt đầu","Kết thúc","Hoàn thành"]', N'Hoãn lại, tạm nghỉ', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Adjourn';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'The chairman decided to ______ the meeting.', N'[]', N'adjourn', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Adjourn';
SET @maxQId2 = @maxQId2 + 1;

-- Quorum (288)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What is a "quorum"?', N'["Số đại biểu tối thiểu","Đa số","Biểu quyết","Ủy ban"]', N'Số đại biểu tối thiểu', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Quorum';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'We need a ______ of at least ten members to vote.', N'[]', N'quorum', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Quorum';
SET @maxQId2 = @maxQId2 + 1;

-- Arbitrate (289)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What does "arbitrate" mean?', N'["Phân xử, làm trọng tài","Tranh luận","Kiện tụng","Đàm phán"]', N'Phân xử, làm trọng tài', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Arbitrate';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'A neutral party was called to ______ the dispute.', N'[]', N'arbitrate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Arbitrate';
SET @maxQId2 = @maxQId2 + 1;

-- Ratify (290)
IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'MCQ', N'What does "ratify" mean?', N'["Phê chuẩn, thông qua","Từ chối","Sửa đổi","Đề xuất"]', N'Phê chuẩn, thông qua', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Ratify';
SET @maxQId2 = @maxQId2 + 1;

IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @maxQId2 + 1)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
SELECT @maxQId2 + 1, WordID, 'FillBlank', N'The board ______ the agreement unanimously.', N'[]', N'ratified', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM Words WHERE Term = 'Ratify';
SET @maxQId2 = @maxQId2 + 1;

SET IDENTITY_INSERT Questions OFF;

PRINT '✅ Topic 2 questions inserted';
GO

-- ============================================================
-- MINI-TESTS
-- ============================================================
DECLARE @maxMId INT;
SELECT @maxMId = ISNULL(MAX(MiniTestID), 61) FROM MiniTests;

SET IDENTITY_INSERT MiniTests ON;

IF NOT EXISTS (SELECT 1 FROM MiniTests WHERE MiniTestID = @maxMId + 1)
INSERT INTO MiniTests (MiniTestID, TopicID, TestTitle, Description, TotalQuestions, IsPublished, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES (@maxMId + 1, 1, N'TOEIC Starter Core - Mở rộng', N'Bài kiểm tra từ vựng bổ sung cho chủ đề TOEIC Starter Core', 8, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
SET @maxMId = @maxMId + 1;

IF NOT EXISTS (SELECT 1 FROM MiniTests WHERE MiniTestID = @maxMId + 1)
INSERT INTO MiniTests (MiniTestID, TopicID, TestTitle, Description, TotalQuestions, IsPublished, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES (@maxMId + 1, 2, N'TOEIC Office & Meetings - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về họp hành và văn phòng', 10, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
SET @maxMId = @maxMId + 1;

IF NOT EXISTS (SELECT 1 FROM MiniTests WHERE MiniTestID = @maxMId + 1)
INSERT INTO MiniTests (MiniTestID, TopicID, TestTitle, Description, TotalQuestions, IsPublished, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES (@maxMId + 1, 7, N'Artificial Intelligence - Nhập môn', N'Bài kiểm tra từ vựng AI cơ bản: thuật toán, mạng nơ-ron', 15, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
SET @maxMId = @maxMId + 1;

IF NOT EXISTS (SELECT 1 FROM MiniTests WHERE MiniTestID = @maxMId + 1)
INSERT INTO MiniTests (MiniTestID, TopicID, TestTitle, Description, TotalQuestions, IsPublished, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES (@maxMId + 1, 7, N'Artificial Intelligence - Chuyên sâu', N'Bài kiểm tra từ vựng AI nâng cao: transformer, generative AI', 15, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
SET @maxMId = @maxMId + 1;

IF NOT EXISTS (SELECT 1 FROM MiniTests WHERE MiniTestID = @maxMId + 1)
INSERT INTO MiniTests (MiniTestID, TopicID, TestTitle, Description, TotalQuestions, IsPublished, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES (@maxMId + 1, 8, N'Shopping & Services - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về mua sắm và dịch vụ', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
SET @maxMId = @maxMId + 1;

SET IDENTITY_INSERT MiniTests OFF;

PRINT '✅ Mini-tests created';
GO

-- ============================================================
-- FINAL: Review and publish all new questions
-- ============================================================
UPDATE Questions
SET ReviewedByUserID = 1, ReviewedAt = SYSDATETIMEOFFSET(), PublishedAt = SYSDATETIMEOFFSET()
WHERE QuestionID > 757 AND ReviewedByUserID IS NULL;

PRINT '✅ All new questions reviewed and published.';
PRINT '';
PRINT '============================================';
PRINT '✅ SEED DATA FIX COMPLETED SUCCESSFULLY';
PRINT '============================================';
GO
