-- ============================================================
-- SEED BỔ SUNG DỮ LIỆU CHO VOCABOOST
-- Thêm từ vựng, câu hỏi, ví dụ và mini tests
-- ============================================================
-- Cách chạy:
--   docker exec sqlserver_2022 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Hoangphuc@040505' -d ToeicVocabularyPlatform -i /tmp/seed_additional_data.sql -C
-- Hoặc copy file vào container trước:
--   docker cp Database/seed_additional_data.sql sqlserver_2022:/tmp/
-- ============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();
DECLARE @AdminID BIGINT;

-- Lấy Admin user đầu tiên
SELECT TOP (1) @AdminID = UserID FROM dbo.Users WHERE UserRole = N'Admin' AND IsActive = 1 ORDER BY UserID;

IF @AdminID IS NULL
BEGIN
    PRINT N'ERROR: Không tìm thấy Admin user. Hãy tạo user admin trước.';
    RETURN;
END

BEGIN TRANSACTION;

BEGIN TRY
    -- ============================================================
    -- 1. THÊM TỪ VỰNG CHO TOPIC 1: TOEIC Starter Core (TopicID = 1)
    -- ============================================================
    PRINT N'--- Seeding Topic 1: TOEIC Starter Core ---';
    
    DECLARE @Topic1ID BIGINT = 1;
    DECLARE @NounID INT = 1, @VerbID INT = 2, @AdjID INT = 3, @AdvID INT = 4;
    DECLARE @WordID BIGINT;

    -- Word: Strategy (chưa có trong DB)
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Strategy')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Strategy', @NounID, N'Chiến lược', N'/ˈstrætədʒi/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic1ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The company developed a new marketing strategy.', N'Công ty đã phát triển một chiến lược tiếp thị mới.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Strategy" mean?', N'["Chiến lược","Kế hoạch","Mục tiêu","Kết quả"]', N'Chiến lược', N'"Strategy" là chiến lược tổng thể.', 2, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'The company developed a new marketing ______.', N'[]', N'Strategy', N'Điền từ Strategy vào chỗ trống.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Strategy';
    END

    -- Word: Revenue
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Revenue')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Revenue', @NounID, N'Doanh thu', N'/ˈrevənjuː/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic1ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The company reported strong revenue growth.', N'Công ty báo cáo tăng trưởng doanh thu mạnh.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Revenue" mean?', N'["Doanh thu","Lợi nhuận","Chi phí","Đầu tư"]', N'Doanh thu', N'"Revenue" là doanh thu.', 2, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'The company reported strong ______ growth.', N'[]', N'Revenue', N'Điền từ Revenue.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Revenue';
    END

    -- Word: Estimate
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Estimate')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Estimate', @VerbID, N'Ước tính', N'/ˈestɪmeɪt/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic1ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'We estimate the project will cost $50,000.', N'Chúng tôi ước tính dự án sẽ tốn $50,000.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Estimate" mean?', N'["Ước tính","Xác nhận","Hoàn thành","Phân tích"]', N'Ước tính', N'"Estimate" là ước tính.', 2, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'We ______ the project will cost $50,000.', N'[]', N'Estimate', N'Điền từ Estimate.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Estimate';
    END

    -- Word: Efficient (Adj)
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Efficient')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Efficient', @AdjID, N'Hiệu quả', N'/ɪˈfɪʃnt/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic1ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The new system is more efficient than the old one.', N'Hệ thống mới hiệu quả hơn hệ thống cũ.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Efficient" mean?', N'["Hiệu quả","Nhanh chóng","Tiết kiệm","Chính xác"]', N'Hiệu quả', N'"Efficient" là hiệu quả.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Efficient';
    END

    -- Word: Negotiate
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Negotiate')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Negotiate', @VerbID, N'Đàm phán', N'/nɪˈɡoʊʃieɪt/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic1ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'We need to negotiate the terms of the contract.', N'Chúng ta cần đàm phán các điều khoản hợp đồng.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Negotiate" mean?', N'["Đàm phán","Ký kết","Hủy bỏ","Chấp thuận"]', N'Đàm phán', N'"Negotiate" là đàm phán.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Negotiate';
    END

    -- Word: Promote
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Promote')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Promote', @VerbID, N'Thúc đẩy, xúc tiến', N'/prəˈmoʊt/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic1ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The company plans to promote its new product.', N'Công ty dự định xúc tiến sản phẩm mới.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Promote" mean?', N'["Thúc đẩy","Giảm giá","Ngăn cản","Trì hoãn"]', N'Thúc đẩy', N'"Promote" là thúc đẩy.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Promote';
    END

    -- Word: Approve
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Approve')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Approve', @VerbID, N'Phê duyệt', N'/əˈpruːv/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic1ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The manager must approve the budget.', N'Quản lý phải phê duyệt ngân sách.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Approve" mean?', N'["Phê duyệt","Từ chối","Xem xét","Sửa đổi"]', N'Phê duyệt', N'"Approve" là phê duyệt.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Approve';
    END

    -- Word: Purchase
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Purchase')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Purchase', @VerbID, N'Mua hàng', N'/ˈpɜːrtʃəs/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic1ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'We need to purchase new equipment.', N'Chúng tôi cần mua thiết bị mới.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Purchase" mean?', N'["Mua hàng","Bán hàng","Thuê","Sản xuất"]', N'Mua hàng', N'"Purchase" là mua hàng.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Purchase';
    END

    -- ============================================================
    -- 2. THÊM TỪ VỰNG CHO TOPIC 3: Daily Routines (TopicID = 3)
    -- ============================================================
    PRINT N'--- Seeding Topic 3: Daily Routines ---';
    DECLARE @Topic3ID BIGINT = 3;

    -- Word: Wake up
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Wake up')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Wake up', @VerbID, N'Thức dậy', N'/weɪk ʌp/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'I wake up at 6 AM every day.', N'Tôi thức dậy lúc 6 giờ sáng mỗi ngày.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Wake up" mean?', N'["Thức dậy","Đi ngủ","Ăn sáng","Tắm"]', N'Thức dậy', N'"Wake up" là thức dậy.', 1, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'I ______ at 6 AM every day.', N'[]', N'wake up', N'Điền "wake up".', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Wake up';
    END

    -- Word: Breakfast
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Breakfast')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Breakfast', @NounID, N'Bữa sáng', N'/ˈbrekfəst/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'I usually have toast for breakfast.', N'Tôi thường ăn bánh mì nướng vào bữa sáng.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Breakfast" mean?', N'["Bữa sáng","Bữa trưa","Bữa tối","Bữa ăn nhẹ"]', N'Bữa sáng', N'"Breakfast" là bữa sáng.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Breakfast';
    END

    -- Word: Commute
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Commute')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Commute', @VerbID, N'Đi lại hàng ngày', N'/kəˈmjuːt/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'She commutes to work by train.', N'Cô ấy đi làm bằng tàu hỏa.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Commute" mean?', N'["Đi lại hàng ngày","Du lịch","Lái xe","Đi bộ"]', N'Đi lại hàng ngày', N'"Commute" là đi lại hàng ngày.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Commute';
    END

    -- Word: Grocery
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Grocery')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Grocery', @NounID, N'Hàng tạp hóa', N'/ˈɡroʊsəri/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'I need to buy some groceries for dinner.', N'Tôi cần mua một ít thực phẩm cho bữa tối.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Grocery" mean?', N'["Hàng tạp hóa","Quần áo","Đồ điện tử","Sách vở"]', N'Hàng tạp hóa', N'"Grocery" là hàng tạp hóa.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Grocery';
    END

    -- Word: Exercise
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Exercise')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Exercise', @VerbID, N'Tập thể dục', N'/ˈeksərsaɪz/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'She exercises at the gym three times a week.', N'Cô ấy tập gym ba lần một tuần.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Exercise" mean?', N'["Tập thể dục","Học tập","Làm việc","Nghỉ ngơi"]', N'Tập thể dục', N'"Exercise" là tập thể dục.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Exercise';
    END

    -- Word: Relax
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Relax')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Relax', @VerbID, N'Thư giãn', N'/rɪˈlæks/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'After work, I relax by watching TV.', N'Sau giờ làm, tôi thư giãn bằng cách xem TV.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Relax" mean?', N'["Thư giãn","Làm việc","Học tập","Nấu ăn"]', N'Thư giãn', N'"Relax" là thư giãn.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Relax';
    END

    -- Word: Leisure
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Leisure')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Leisure', @NounID, N'Thời gian rảnh', N'/ˈleʒər/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Reading is my favorite leisure activity.', N'Đọc sách là hoạt động giải trí yêu thích của tôi.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Leisure" mean?', N'["Thời gian rảnh","Công việc","Học tập","Du lịch"]', N'Thời gian rảnh', N'"Leisure" là thời gian rảnh.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Leisure';
    END

    -- Word: Household
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Household')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Household', @AdjID, N'Thuộc gia đình', N'/ˈhaʊshoʊld/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'They share the household chores equally.', N'Họ chia sẻ việc nhà một cách công bằng.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Household" mean?', N'["Thuộc gia đình","Văn phòng","Công ty","Trường học"]', N'Thuộc gia đình', N'"Household" là thuộc gia đình.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Household';
    END

    -- Word: Laundry
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Laundry')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Laundry', @NounID, N'Việc giặt giũ', N'/ˈlɔːndri/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'I do the laundry on weekends.', N'Tôi giặt giũ vào cuối tuần.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Laundry" mean?', N'["Việc giặt giũ","Nấu ăn","Dọn dẹp","Mua sắm"]', N'Việc giặt giũ', N'"Laundry" là việc giặt giũ.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Laundry';
    END

    -- Word: Socialize
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Socialize')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Socialize', @VerbID, N'Giao lưu', N'/ˈsoʊʃəlaɪz/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic3ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'We often socialize with colleagues after work.', N'Chúng tôi thường giao lưu với đồng nghiệp sau giờ làm.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Socialize" mean?', N'["Giao lưu","Làm việc","Học tập","Ngủ"]', N'Giao lưu', N'"Socialize" là giao lưu.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Socialize';
    END

    -- ============================================================
    -- 3. THÊM TỪ VỰNG CHO TOPIC 4: Airport & Flight Travel (TopicID = 4)
    -- ============================================================
    PRINT N'--- Seeding Topic 4: Airport & Flight Travel ---';
    DECLARE @Topic4ID BIGINT = 4;

    -- Word: Departure
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Departure')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Departure', @NounID, N'Sự khởi hành', N'/dɪˈpɑːrtʃər/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The departure is scheduled for 3 PM.', N'Chuyến khởi hành dự kiến lúc 3 giờ chiều.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Departure" mean?', N'["Sự khởi hành","Sự đến","Sự hoãn","Sự hủy"]', N'Sự khởi hành', N'"Departure" là sự khởi hành.', 2, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'The ______ is scheduled for 3 PM.', N'[]', N'departure', N'Điền "departure".', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Departure';
    END

    -- Word: Luggage
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Luggage')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Luggage', @NounID, N'Hành lý', N'/ˈlʌɡɪdʒ/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Please collect your luggage from carousel 3.', N'Vui lòng nhận hành lý từ băng chuyền số 3.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Luggage" mean?', N'["Hành lý","Vé máy bay","Hộ chiếu","Thẻ lên máy bay"]', N'Hành lý', N'"Luggage" là hành lý.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Luggage';
    END

    -- Word: Reservation
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Reservation')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Reservation', @NounID, N'Sự đặt chỗ', N'/ˌrezərˈveɪʃn/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'I have a reservation at the hotel.', N'Tôi có đặt phòng tại khách sạn.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Reservation" mean?', N'["Sự đặt chỗ","Sự hủy","Sự thanh toán","Sự xác nhận"]', N'Sự đặt chỗ', N'"Reservation" là sự đặt chỗ.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Reservation';
    END

    -- Word: Delay
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Delay')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Delay', @VerbID, N'Trì hoãn', N'/dɪˈleɪ/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The flight was delayed due to weather.', N'Chuyến bay bị hoãn do thời tiết.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Delay" mean?', N'["Trì hoãn","Tăng tốc","Hủy bỏ","Khởi hành"]', N'Trì hoãn', N'"Delay" là trì hoãn.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Delay';
    END

    -- Word: Customs
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Customs')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Customs', @NounID, N'Hải quan', N'/ˈkʌstəmz/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'You need to declare goods at customs.', N'Bạn cần khai báo hàng hóa tại hải quan.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Customs" mean?', N'["Hải quan","Sân bay","Nhà ga","Lễ tân"]', N'Hải quan', N'"Customs" là hải quan.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Customs';
    END

    -- Word: Itinerary
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Itinerary')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Itinerary', @NounID, N'Lịch trình', N'/aɪˈtɪnəreri/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Please send me the travel itinerary.', N'Vui lòng gửi tôi lịch trình du lịch.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Itinerary" mean?', N'["Lịch trình","Vé máy bay","Hành lý","Khách sạn"]', N'Lịch trình', N'"Itinerary" là lịch trình.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Itinerary';
    END

    -- Word: Check-in
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Check-in')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Check-in', @NounID, N'Làm thủ tục', N'/tʃek ɪn/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Online check-in saves time at the airport.', N'Làm thủ tục trực tuyến tiết kiệm thời gian ở sân bay.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Check-in" mean?', N'["Làm thủ tục","Lên máy bay","Xuống máy bay","Đặt vé"]', N'Làm thủ tục', N'"Check-in" là làm thủ tục.', 1, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'Online ______ saves time at the airport.', N'[]', N'check-in', N'Điền "check-in".', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Check-in';
    END

    -- Word: Terminal
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Terminal')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Terminal', @NounID, N'Nhà ga', N'/ˈtɜːrmɪnl/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Our flight departs from terminal 2.', N'Chuyến bay khởi hành từ nhà ga số 2.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Terminal" mean?', N'["Nhà ga","Sân bay","Máy bay","Phi công"]', N'Nhà ga', N'"Terminal" là nhà ga.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Terminal';
    END

    -- Word: Arrival
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Arrival')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Arrival', @NounID, N'Sự đến nơi', N'/əˈraɪvl/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic4ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Our arrival was delayed by two hours.', N'Chuyến đến của chúng tôi bị trễ hai tiếng.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Arrival" mean?', N'["Sự đến nơi","Sự khởi hành","Sự quá cảnh","Sự chuyển tiếp"]', N'Sự đến nơi', N'"Arrival" là sự đến nơi.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Arrival';
    END

    -- ============================================================
    -- 4. THÊM TỪ VỰNG CHO TOPIC 5: Software & Office Tech (TopicID = 5)
    -- ============================================================
    PRINT N'--- Seeding Topic 5: Software & Office Tech ---';
    DECLARE @Topic5ID BIGINT = 5;

    -- Word: Software
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Software')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Software', @NounID, N'Phần mềm', N'/ˈsɔːftwer/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic5ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'We need to update our accounting software.', N'Chúng tôi cần cập nhật phần mềm kế toán.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Software" mean?', N'["Phần mềm","Phần cứng","Máy tính","Mạng"]', N'Phần mềm', N'"Software" là phần mềm.', 1, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'We need to update our accounting ______.', N'[]', N'software', N'Điền "software".', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Software';
    END

    -- Word: Database
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Database')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Database', @NounID, N'Cơ sở dữ liệu', N'/ˈdeɪtəbeɪs/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic5ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The database contains all customer records.', N'Cơ sở dữ liệu chứa tất cả hồ sơ khách hàng.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Database" mean?', N'["Cơ sở dữ liệu","Máy chủ","Mạng","Bảng tính"]', N'Cơ sở dữ liệu', N'"Database" là cơ sở dữ liệu.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Database';
    END

    -- Word: Update
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Update')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Update', @VerbID, N'Cập nhật', N'/ʌpˈdeɪt/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic5ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Please update the spreadsheet with new data.', N'Vui lòng cập nhật bảng tính với dữ liệu mới.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Update" mean?', N'["Cập nhật","Xóa","Thêm","Sửa"]', N'Cập nhật', N'"Update" là cập nhật.', 1, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'Please ______ the spreadsheet with new data.', N'[]', N'update', N'Điền "update".', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Update';
    END

    -- Word: Network
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Network')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Network', @NounID, N'Mạng lưới', N'/ˈnetwɜːrk/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic5ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The office network is down for maintenance.', N'Mạng văn phòng bị gián đoạn để bảo trì.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Network" mean?', N'["Mạng lưới","Máy tính","Phần mềm","Dữ liệu"]', N'Mạng lưới', N'"Network" là mạng lưới.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Network';
    END

    -- Word: Download
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Download')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Download', @VerbID, N'Tải xuống', N'/ˌdaʊnˈloʊd/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic5ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'You can download the report from our website.', N'Bạn có thể tải báo cáo từ trang web của chúng tôi.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Download" mean?', N'["Tải xuống","Tải lên","Xóa","Lưu"]', N'Tải xuống', N'"Download" là tải xuống.', 1, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'You can ______ the report from our website.', N'[]', N'download', N'Điền "download".', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Download';
    END

    -- Word: Backup
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Backup')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Backup', @NounID, N'Sao lưu', N'/ˈbækʌp/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic5ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Always make a backup of your files.', N'Luôn sao lưu các tệp tin của bạn.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Backup" mean?', N'["Sao lưu","Xóa","Di chuyển","Chỉnh sửa"]', N'Sao lưu', N'"Backup" là sao lưu.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Backup';
    END

    -- Word: Install
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Install')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Install', @VerbID, N'Cài đặt', N'/ɪnˈstɔːl/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic5ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The IT team will install the new system.', N'Đội CNTT sẽ cài đặt hệ thống mới.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Install" mean?', N'["Cài đặt","Gỡ bỏ","Sửa chữa","Kiểm tra"]', N'Cài đặt', N'"Install" là cài đặt.', 1, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'The IT team will ______ the new system.', N'[]', N'install', N'Điền "install".', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Install';
    END

    -- Word: Configuration
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Configuration')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Configuration', @NounID, N'Cấu hình', N'/kənˌfɪɡjəˈreɪʃn/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic5ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The system configuration needs adjustment.', N'Cấu hình hệ thống cần được điều chỉnh.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Configuration" mean?', N'["Cấu hình","Kết nối","Cài đặt","Vận hành"]', N'Cấu hình', N'"Configuration" là cấu hình.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Configuration';
    END

    -- ============================================================
    -- 5. THÊM TỪ VỰNG CHO TOPIC 6: Academic Study & Research (TopicID = 6)
    -- ============================================================
    PRINT N'--- Seeding Topic 6: Academic Study & Research ---';
    DECLARE @Topic6ID BIGINT = 6;

    -- Word: Research
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Research')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Research', @NounID, N'Nghiên cứu', N'/rɪˈsɜːrtʃ/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'She is conducting research on climate change.', N'Cô ấy đang nghiên cứu về biến đổi khí hậu.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Research" mean?', N'["Nghiên cứu","Giảng dạy","Học tập","Viết lách"]', N'Nghiên cứu', N'"Research" là nghiên cứu.', 2, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'She is conducting ______ on climate change.', N'[]', N'research', N'Điền "research".', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Research';
    END

    -- Word: Assignment
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Assignment')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Assignment', @NounID, N'Bài tập', N'/əˈsaɪnmənt/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The assignment is due next Monday.', N'Bài tập phải nộp vào thứ Hai tới.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Assignment" mean?', N'["Bài tập","Kỳ thi","Lớp học","Giáo viên"]', N'Bài tập', N'"Assignment" là bài tập.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Assignment';
    END

    -- Word: Lecture
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Lecture')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Lecture', @NounID, N'Bài giảng', N'/ˈlektʃər/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The professor gave a lecture on economics.', N'Giáo sư đã giảng bài về kinh tế học.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Lecture" mean?', N'["Bài giảng","Sách giáo khoa","Thư viện","Phòng học"]', N'Bài giảng', N'"Lecture" là bài giảng.', 2, @AdminID, @Now, @Now, N'Published');
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'FillBlank', N'The professor gave a ______ on economics.', N'[]', N'lecture', N'Điền "lecture".', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Lecture';
    END

    -- Word: Scholarship
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Scholarship')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Scholarship', @NounID, N'Học bổng', N'/ˈskɒləʃɪp/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'She won a scholarship to study abroad.', N'Cô ấy đã giành học bổng du học.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Scholarship" mean?', N'["Học bổng","Học phí","Bằng cấp","Chứng chỉ"]', N'Học bổng', N'"Scholarship" là học bổng.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Scholarship';
    END

    -- Word: Enroll
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Enroll')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Enroll', @VerbID, N'Đăng ký học', N'/ɪnˈroʊl/', 1, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'I want to enroll in the English course.', N'Tôi muốn đăng ký khóa học tiếng Anh.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Enroll" mean?', N'["Đăng ký học","Tốt nghiệp","Giảng dạy","Nghiên cứu"]', N'Đăng ký học', N'"Enroll" là đăng ký học.', 1, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Enroll';
    END

    -- Word: Graduate
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Graduate')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Graduate', @VerbID, N'Tốt nghiệp', N'/ˈɡrædʒueɪt/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'He graduated from university with honors.', N'Anh ấy tốt nghiệp đại học với bằng danh dự.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Graduate" mean?', N'["Tốt nghiệp","Nhập học","Thi cử","Dạy học"]', N'Tốt nghiệp', N'"Graduate" là tốt nghiệp.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Graduate';
    END

    -- Word: Curriculum
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Curriculum')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Curriculum', @NounID, N'Chương trình giảng dạy', N'/kəˈrɪkjələm/', 3, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The curriculum includes both theory and practice.', N'Chương trình giảng dạy bao gồm cả lý thuyết và thực hành.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Curriculum" mean?', N'["Chương trình giảng dạy","Thư viện","Phòng thí nghiệm","Ký túc xá"]', N'Chương trình giảng dạy', N'"Curriculum" là chương trình giảng dạy.', 3, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Curriculum';
    END

    -- Word: Tuition
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Tuition')
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Tuition', @NounID, N'Học phí', N'/tjuˈɪʃn/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'The tuition fee for this course is $500.', N'Học phí cho khóa học này là $500.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Tuition" mean?', N'["Học phí","Sách giáo khoa","Đồng phục","Bảo hiểm"]', N'Học phí', N'"Tuition" là học phí.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Tuition';
    END

    -- Word: Thesis
    IF NOT EXISTS (SELECT 1 FROM dbo.Words WHERE Term = N'Reference' AND PartOfSpeechID = @NounID)
    BEGIN
        INSERT INTO dbo.Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (N'Reference', @NounID, N'Tài liệu tham khảo', N'/ˈrefrəns/', 2, @AdminID, @Now, @Now, N'Published');
        SET @WordID = SCOPE_IDENTITY();
        INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @Topic6ID, @Now);
        INSERT INTO dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, N'Please list your references at the end.', N'Vui lòng liệt kê tài liệu tham khảo ở cuối bài.', @Now, @Now);
        INSERT INTO dbo.Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus)
        VALUES (@WordID, N'MCQ', N'What does "Reference" mean?', N'["Tài liệu tham khảo","Bài báo","Sách","Luận văn"]', N'Tài liệu tham khảo', N'"Reference" là tài liệu tham khảo.', 2, @AdminID, @Now, @Now, N'Published');
        PRINT N'  + Added: Reference';
    END

    -- ============================================================
    -- 6. THÊM MINI TESTS CHO TỪNG TOPIC
    -- ============================================================
    PRINT N'--- Creating Mini Tests ---';

    DECLARE @MiniTestID BIGINT;
    DECLARE @TopicTbl TABLE (TopicID BIGINT, TopicName NVARCHAR(200), RowNum INT);
    INSERT INTO @TopicTbl (TopicID, TopicName, RowNum)
    SELECT TopicID, TopicName, ROW_NUMBER() OVER (ORDER BY TopicID)
    FROM dbo.Topics;

    DECLARE @CurTopicID BIGINT, @CurTopicName NVARCHAR(200), @RowNum INT;
    DECLARE topic_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT TopicID, TopicName, RowNum FROM @TopicTbl;

    OPEN topic_cursor;
    FETCH NEXT FROM topic_cursor INTO @CurTopicID, @CurTopicName, @RowNum;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @TestTitle NVARCHAR(255) = CONCAT(N'Kiểm tra: ', @CurTopicName);

        -- Tạo MiniTest nếu chưa tồn tại
        IF NOT EXISTS (SELECT 1 FROM dbo.MiniTests WHERE TestTitle = @TestTitle)
        BEGIN
            INSERT INTO dbo.MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt, ContentStatus)
            VALUES (@CurTopicID, @TestTitle, CONCAT(N'Bài kiểm tra chủ đề: ', @CurTopicName), @AdminID, 5, 1, @Now, @Now, N'Published');
            SET @MiniTestID = SCOPE_IDENTITY();

            -- Thêm 5 câu hỏi MCQ từ topic này vào mini test
            INSERT INTO dbo.MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
            SELECT TOP 5 @MiniTestID, q.QuestionID,
                   ROW_NUMBER() OVER (ORDER BY q.QuestionID)
            FROM dbo.Questions q
            JOIN dbo.WordTopics wt ON wt.WordID = q.WordID
            WHERE wt.TopicID = @CurTopicID AND q.QuestionType = N'MCQ'
              AND NOT EXISTS (
                  SELECT 1 FROM dbo.MiniTestItems mti
                  WHERE mti.MiniTestID = @MiniTestID AND mti.QuestionID = q.QuestionID
              );

            PRINT CONCAT(N'  + Created MiniTest: ', @CurTopicName);
        END

        FETCH NEXT FROM topic_cursor INTO @CurTopicID, @CurTopicName, @RowNum;
    END

    CLOSE topic_cursor;
    DEALLOCATE topic_cursor;

    -- ============================================================
    -- KẾT THÚC
    -- ============================================================
    COMMIT TRANSACTION;

    PRINT N'';
    PRINT N'============================================';
    PRINT N'SEED BỔ SUNG HOÀN TẤT!';
    PRINT N'============================================';

    -- Báo cáo kết quả
    SELECT COUNT(*) AS TotalWordsAfterSeed FROM dbo.Words;
    SELECT COUNT(*) AS TotalQuestionsAfterSeed FROM dbo.Questions;
    SELECT COUNT(*) AS TotalMiniTestsAfterSeed FROM dbo.MiniTests;
    SELECT COUNT(*) AS TotalMiniTestItemsAfterSeed FROM dbo.MiniTestItems;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT N'ERROR: ' + ERROR_MESSAGE();
    PRINT N'ERROR LINE: ' + CAST(ERROR_LINE() AS NVARCHAR(10));
END CATCH;
GO
