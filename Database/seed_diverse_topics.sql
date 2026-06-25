-- SCRIPT SEEDING DỮ LIỆU MẪU ĐA DẠNG CHO VOCABOOST
-- Chạy script này trong SSMS hoặc qua script NodeJS để gieo dữ liệu.

USE ToeicVocabularyPlatform;
GO

BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Lấy thông tin các Admin để ghi log phê duyệt
    DECLARE @AdminID BIGINT;
    SELECT TOP 1 @AdminID = UserID FROM Users WHERE UserRole = 'Admin' ORDER BY UserID ASC;
    IF @AdminID IS NULL SET @AdminID = 1;

    -- Định nghĩa danh sách người dùng Creator cần seeding
    -- UserID 2 (creator@gmail.com)
    -- UserID 11 (teacher@gmail.com)
    -- UserID 21 (teacher@vocaboost.com)

    -- Hàm/Bảng tạm chứa danh sách chủ đề cần gieo
    DECLARE @SeedTopics TABLE (
        CreatorID BIGINT,
        TopicName NVARCHAR(100),
        TopicCode NVARCHAR(50),
        Description NVARCHAR(255),
        CategoryID INT,
        Status NVARCHAR(50),
        RejectComment NVARCHAR(1000)
    );

    -- Chèn danh sách chủ đề mẫu đa dạng trạng thái và danh mục
    INSERT INTO @SeedTopics (CreatorID, TopicName, TopicCode, Description, CategoryID, Status, RejectComment)
    VALUES 
    -- Creator 2: creator@gmail.com
    (2, N'Office Conversations (Draft)', 'CR2_DRAFT_OFFICE', N'Từ vựng đối thoại công sở cơ bản', 1, 'Draft', NULL),
    (2, N'Daily Commute (Pending Review)', 'CR2_PENDING_COMMUTE', N'Từ vựng di chuyển đi lại hàng ngày', 2, 'PendingReview', NULL),
    (2, N'Airport Vocabulary (Rejected)', 'CR2_REJECT_AIRPORT', N'Học từ vựng tại sân bay và làm thủ tục', 3, 'Rejected', N'Nội dung quá sơ sài, thiếu ví dụ thực tế. Vui lòng bổ sung thêm 5 từ vựng nữa.'),
    (2, N'TOEIC Grammar Hacks (Published)', 'CR2_PUB_GRAMMAR', N'Các mẹo ngữ pháp TOEIC ăn điểm nhanh', 4, 'Published', NULL),

    -- Creator 11: teacher@gmail.com
    (11, N'Advanced Negotiations (Draft)', 'CR11_DRAFT_NEG', N'Kỹ năng đàm phán thương lượng cấp cao', 1, 'Draft', NULL),
    (11, N'Restaurant Dialogue (Pending Review)', 'CR11_PENDING_REST', N'Từ vựng giao tiếp tại nhà hàng', 2, 'PendingReview', NULL),
    (11, N'Hotel Booking (Rejected)', 'CR11_REJECT_HOTEL', N'Từ vựng đặt phòng khách sạn và dịch vụ phòng', 3, 'Rejected', N'Từ vựng bị trùng lặp với bộ từ vựng Daily Life đã có sẵn. Hãy đổi thuật ngữ.'),
    (11, N'Academic Reading Vocab (Published)', 'CR11_PUB_ACAD', N'Từ vựng phục vụ đọc hiểu tài liệu học thuật', 5, 'Published', NULL),

    -- Creator 21: teacher@vocaboost.com
    (21, N'Cloud Computing Basics (Draft)', 'CR21_DRAFT_CLOUD', N'Khái niệm cơ bản về điện toán đám mây', 6, 'Draft', NULL),
    (21, N'Software Development (Pending Review)', 'CR21_PENDING_SOFT', N'Từ vựng chuyên ngành phát triển phần mềm', 6, 'PendingReview', NULL),
    (21, N'Cybersecurity Essentials (Rejected)', 'CR21_REJECT_CYBER', N'Bảo mật thông tin và phòng ngừa rủi ro mạng', 6, 'Rejected', N'Thiếu các câu hỏi luyện tập MCQ và Dictation. Vui lòng thêm câu hỏi cho tất cả các từ.'),
    (21, N'AI and ML Terminology (Published)', 'CR21_PUB_AI', N'Thuật ngữ trí tuệ nhân tạo và học máy', 6, 'Published', NULL);

    -- 2. Vòng lặp chèn Topic
    DECLARE @CreatorID BIGINT, @TopicName NVARCHAR(100), @TopicCode NVARCHAR(50), @Description NVARCHAR(255), @CategoryID INT, @Status NVARCHAR(50), @RejectComment NVARCHAR(1000);
    DECLARE @NewTopicID BIGINT;

    DECLARE topic_cursor CURSOR FOR 
    SELECT CreatorID, TopicName, TopicCode, Description, CategoryID, Status, RejectComment FROM @SeedTopics;

    OPEN topic_cursor;
    FETCH NEXT FROM topic_cursor INTO @CreatorID, @TopicName, @TopicCode, @Description, @CategoryID, @Status, @RejectComment;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Chỉ chèn nếu chưa tồn tại mã TopicCode
        IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = @TopicCode)
        BEGIN
            INSERT INTO Topics (TopicName, TopicCode, Description, TopicCategoryID, ContentStatus, CreatedByUserID, CreatedAt, UpdatedAt)
            VALUES (@TopicName, @TopicCode, @Description, @CategoryID, @Status, @CreatorID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
            
            SET @NewTopicID = SCOPE_IDENTITY();

            -- Nếu trạng thái là Rejected, chèn thêm log từ chối của Admin
            IF @Status = 'Rejected' AND @RejectComment IS NOT NULL
            BEGIN
                -- Ghi nhận lịch sử duyệt
                INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment, CreatedAt)
                VALUES ('Topic', @NewTopicID, @AdminID, 'PendingReview', 'Rejected', @RejectComment, SYSDATETIMEOFFSET());

                -- Gửi thông báo cho Creator
                INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, CreatedAt)
                VALUES (@CreatorID, N'Chủ đề "' + @TopicName + N'" bị từ chối', N'Lý do: ' + @RejectComment, 'Announcement', 'InApp', SYSDATETIMEOFFSET());
            END

            -- Nếu trạng thái là Published, chèn log duyệt thành công
            IF @Status = 'Published'
            BEGIN
                INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment, CreatedAt)
                VALUES ('Topic', @NewTopicID, @AdminID, 'PendingReview', 'Published', N'Approved by admin', SYSDATETIMEOFFSET());
            END

            -- Thêm 2 Từ vựng mẫu cho mỗi Topic
            DECLARE @Word1_Term NVARCHAR(100), @Word1_Meaning NVARCHAR(255), @Word1_Phonetic NVARCHAR(100), @Word1_Example NVARCHAR(MAX);
            DECLARE @Word2_Term NVARCHAR(100), @Word2_Meaning NVARCHAR(255), @Word2_Phonetic NVARCHAR(100), @Word2_Example NVARCHAR(MAX);

            IF @TopicCode LIKE '%OFFICE%'
            BEGIN
                SET @Word1_Term = 'Collaborate'; SET @Word1_Meaning = N'Hợp tác, cộng tác'; SET @Word1_Phonetic = '/kəˈlæbəreɪt/'; SET @Word1_Example = 'We need to collaborate on this project.';
                SET @Word2_Term = 'Deadline'; SET @Word2_Meaning = N'Hạn chót'; SET @Word2_Phonetic = '/ˈdedlaɪn/'; SET @Word2_Example = 'The deadline is next Friday.';
            END
            ELSE IF @TopicCode LIKE '%COMMUTE%'
            BEGIN
                SET @Word1_Term = 'Commute'; SET @Word1_Meaning = N'Hành trình đi làm hàng ngày'; SET @Word1_Phonetic = '/kəˈmjuːt/'; SET @Word1_Example = 'She has a long commute to work.';
                SET @Word2_Term = 'Transit'; SET @Word2_Meaning = N'Sự quá cảnh, vận tải'; SET @Word2_Phonetic = '/ˈtrænzɪt/'; SET @Word2_Example = 'The goods are in transit.';
            END
            ELSE IF @TopicCode LIKE '%AIRPORT%'
            BEGIN
                SET @Word1_Term = 'Boarding'; SET @Word1_Meaning = N'Sự lên tàu/máy bay'; SET @Word1_Phonetic = '/ˈbɔːrdɪŋ/'; SET @Word1_Example = 'Boarding will start in 10 minutes.';
                SET @Word2_Term = 'Luggage'; SET @Word2_Meaning = N'Hành lý'; SET @Word2_Phonetic = '/ˈlʌɡɪdʒ/'; SET @Word2_Example = 'Keep an eye on your luggage.';
            END
            ELSE IF @TopicCode LIKE '%GRAMMAR%'
            BEGIN
                SET @Word1_Term = 'Clause'; SET @Word1_Meaning = N'Mệnh đề'; SET @Word1_Phonetic = '/klɔːz/'; SET @Word1_Example = 'A sentence has at least one main clause.';
                SET @Word2_Term = 'Conjunction'; SET @Word2_Meaning = N'Liên từ'; SET @Word2_Phonetic = '/kənˈdʒʌŋkʃn/'; SET @Word2_Example = '"And" and "but" are conjunctions.';
            END
            ELSE IF @TopicCode LIKE '%NEG%'
            BEGIN
                SET @Word1_Term = 'Negotiate'; SET @Word1_Meaning = N'Đàm phán, thương lượng'; SET @Word1_Phonetic = '/nɪˈɡəʊʃieɪt/'; SET @Word1_Example = 'We need to negotiate a new contract.';
                SET @Word2_Term = 'Compromise'; SET @Word2_Meaning = N'Sự thỏa hiệp'; SET @Word2_Phonetic = '/ˈkɒmprəmaɪz/'; SET @Word2_Example = 'Both sides had to make a compromise.';
            END
            ELSE IF @TopicCode LIKE '%REST%'
            BEGIN
                SET @Word1_Term = 'Appetizer'; SET @Word1_Meaning = N'Món khai vị'; SET @Word1_Phonetic = '/ˈæpɪtaɪzə(r)/'; SET @Word1_Example = 'We ordered soup as an appetizer.';
                SET @Word2_Term = 'Beverage'; SET @Word2_Meaning = N'Đồ uống'; SET @Word2_Phonetic = '/ˈbevərɪdʒ/'; SET @Word2_Example = 'Hot beverages include tea and coffee.';
            END
            ELSE IF @TopicCode LIKE '%HOTEL%'
            BEGIN
                SET @Word1_Term = 'Reservation'; SET @Word1_Meaning = N'Sự đặt chỗ trước'; SET @Word1_Phonetic = '/ˌrezəˈveɪʃn/'; SET @Word1_Example = 'I have a reservation under the name John.';
                SET @Word2_Term = 'Amenity'; SET @Word2_Meaning = N'Tiện nghi'; SET @Word2_Phonetic = '/əˈmiːnəti/'; SET @Word2_Example = 'The hotel offers many amenities.';
            END
            ELSE IF @TopicCode LIKE '%ACAD%'
            BEGIN
                SET @Word1_Term = 'Hypothesis'; SET @Word1_Meaning = N'Giả thuyết'; SET @Word1_Phonetic = '/haɪˈpɒθəsɪs/'; SET @Word1_Example = 'The hypothesis must be tested by experiment.';
                SET @Word2_Term = 'Analyze'; SET @Word2_Meaning = N'Phân tích'; SET @Word2_Phonetic = '/ˈænəlaɪz/'; SET @Word2_Example = 'We need to analyze the test results.';
            END
            ELSE IF @TopicCode LIKE '%CLOUD%'
            BEGIN
                SET @Word1_Term = 'Infrastructure'; SET @Word1_Meaning = N'Cơ sở hạ tầng'; SET @Word1_Phonetic = '/ˈɪnfrəstrʌktʃə(r)/'; SET @Word1_Example = 'The company needs to upgrade its IT infrastructure.';
                SET @Word2_Term = 'Scalability'; SET @Word2_Meaning = N'Khả năng mở rộng'; SET @Word2_Phonetic = '/ˌskeɪləˈbɪləti/'; SET @Word2_Example = 'Cloud services provide excellent scalability.';
            END
            ELSE IF @TopicCode LIKE '%SOFT%'
            BEGIN
                SET @Word1_Term = 'Repository'; SET @Word1_Meaning = N'Kho chứa mã nguồn'; SET @Word1_Phonetic = '/rɪˈpɒzətri/'; SET @Word1_Example = 'Push your code to the Git repository.';
                SET @Word2_Term = 'Compile'; SET @Word2_Meaning = N'Biên dịch'; SET @Word2_Phonetic = '/kəmˈpaɪl/'; SET @Word2_Example = 'The compiler translates code into machine language.';
            END
            ELSE IF @TopicCode LIKE '%CYBER%'
            BEGIN
                SET @Word1_Term = 'Encryption'; SET @Word1_Meaning = N'Sự mã hóa'; SET @Word1_Phonetic = '/ɪnˈkrɪpʃn/'; SET @Word1_Example = 'Data encryption is essential for privacy.';
                SET @Word2_Term = 'Vulnerability'; SET @Word2_Meaning = N'Lỗ hổng bảo mật'; SET @Word2_Phonetic = '/ˌvʌlnərəˈbɪləti/'; SET @Word2_Example = 'They found a vulnerability in the software.';
            END
            ELSE -- AI
            BEGIN
                SET @Word1_Term = 'Algorithm'; SET @Word1_Meaning = N'Thuật toán'; SET @Word1_Phonetic = '/ˈælɡərɪðəm/'; SET @Word1_Example = 'The algorithm processes data very quickly.';
                SET @Word2_Term = 'Dataset'; SET @Word2_Meaning = N'Tập dữ liệu'; SET @Word2_Phonetic = '/ˈdeɪtəset/'; SET @Word2_Example = 'We trained the model on a large dataset.';
            END

            -- Chèn Word 1
            DECLARE @Word1ID BIGINT, @Word2ID BIGINT;
            DECLARE @VerbPOSID INT, @NounPOSID INT;
            SELECT @VerbPOSID = PartOfSpeechID FROM PartOfSpeeches WHERE PartOfSpeechCode = 'Verb';
            SELECT @NounPOSID = PartOfSpeechID FROM PartOfSpeeches WHERE PartOfSpeechCode = 'Noun';

            INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
            VALUES (@Word1_Term, @Word1_Meaning, @Word1_Phonetic, @VerbPOSID, @CreatorID, @Status, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
            SET @Word1ID = SCOPE_IDENTITY();

            INSERT INTO WordTopics (WordID, TopicID) VALUES (@Word1ID, @NewTopicID);

            -- MCQ Question cho Word 1
            INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
            VALUES (@Word1ID, 'MCQ', N'Định nghĩa của từ ''' + @Word1_Term + N''' là gì?', @Word1_Meaning, 
            N'["' + @Word1_Meaning + N'", "Wrong Definition A", "Wrong Definition B", "Wrong Definition C"]', @CreatorID, @Status, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

            -- Chèn Word 2
            INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
            VALUES (@Word2_Term, @Word2_Meaning, @Word2_Phonetic, @NounPOSID, @CreatorID, @Status, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
            SET @Word2ID = SCOPE_IDENTITY();

            INSERT INTO WordTopics (WordID, TopicID) VALUES (@Word2ID, @NewTopicID);

            -- MCQ Question cho Word 2
            INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
            VALUES (@Word2ID, 'MCQ', N'Định nghĩa của từ ''' + @Word2_Term + N''' là gì?', @Word2_Meaning, 
            N'["' + @Word2_Meaning + N'", "Wrong Definition A", "Wrong Definition B", "Wrong Definition C"]', @CreatorID, @Status, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
        END

        FETCH NEXT FROM topic_cursor INTO @CreatorID, @TopicName, @TopicCode, @Description, @CategoryID, @Status, @RejectComment;
    END

    CLOSE topic_cursor;
    DEALLOCATE topic_cursor;

    COMMIT TRANSACTION;
    PRINT 'SEED DIVERSE TOPICS COMPLETED SUCCESSFULLY!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT 'ERROR: ' + ERROR_MESSAGE();
END CATCH
