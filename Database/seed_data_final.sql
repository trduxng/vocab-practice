-- SCRIPT SEEDING DỮ LIỆU MẪU CHO VOCABOOST (PHIÊN BẢN SỬA LỖI LẦN 2)
-- Chạy script này trong SSMS

USE ToeicVocabularyPlatform;
GO

BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Tạo User hệ thống (để gán CreatedByUserID)
    DECLARE @SysAdminID BIGINT;
    IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'system@vocaboost.com')
    BEGIN
        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, IsActive)
        VALUES (N'System Admin', 'system@vocaboost.com', 'N/A', 'Admin', 1);
        SET @SysAdminID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SELECT @SysAdminID = UserID FROM Users WHERE Email = 'system@vocaboost.com';
    END

    -- 2. Tạo Part Of Speeches
    IF NOT EXISTS (SELECT 1 FROM PartOfSpeeches WHERE PartOfSpeechCode = 'Verb')
        INSERT INTO PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName) VALUES ('Verb', N'Động từ');
    IF NOT EXISTS (SELECT 1 FROM PartOfSpeeches WHERE PartOfSpeechCode = 'Noun')
        INSERT INTO PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName) VALUES ('Noun', N'Danh từ');
    IF NOT EXISTS (SELECT 1 FROM PartOfSpeeches WHERE PartOfSpeechCode = 'Adj')
        INSERT INTO PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName) VALUES ('Adj', N'Tính từ');

    -- 3. Tạo Topic mẫu
    DECLARE @TopicID BIGINT;
    IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = 'T50')
    BEGIN
        INSERT INTO Topics (TopicName, TopicCode, Description, CreatedByUserID)
        VALUES (N'TOEIC Starter Core', 'T50', N'15 từ vựng nền tảng quan trọng nhất cho kỳ thi TOEIC', @SysAdminID);
        SET @TopicID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SELECT @TopicID = TopicID FROM Topics WHERE TopicCode = 'T50';
    END

    -- 4. Danh sách từ vựng
    DECLARE @Words TABLE (Term NVARCHAR(100), Meaning NVARCHAR(255), Phonetic NVARCHAR(100), POSCode NVARCHAR(20), Example NVARCHAR(MAX));
    INSERT INTO @Words VALUES 
    ('Abandon', N'Từ bỏ, ruồng bỏ', '/əˈbændən/', 'Verb', N'The baby was abandoned by his parents.'),
    ('Accurate', N'Chính xác', '/ˈækjərət/', 'Adj', N'The map was very accurate.'),
    ('Benefit', N'Lợi ích', '/ˈbenɪfɪt/', 'Noun', N'The new law will benefit everyone.'),
    ('Capacity', N'Sức chứa, năng lực', '/kəˈpæsəti/', 'Noun', N'The stadium has a capacity of 50,000.'),
    ('Dedicate', N'Cống hiến', '/ˈdedɪkeɪt/', 'Verb', N'He dedicated his life to helping the poor.'),
    ('Efficient', N'Hiệu quả', '/ɪˈfɪʃnt/', 'Adj', N'The new machine is very efficient.'),
    ('Facilitate', N'Tạo điều kiện thuận lợi', '/fəˈsɪlɪteɪt/', 'Verb', N'The new app will facilitate communication.'),
    ('Generate', N'Tạo ra, phát sinh', '/ˈdʒenəreɪt/', 'Verb', N'The solar panels generate electricity.'),
    ('Hazard', N'Mối nguy hại', '/ˈhæzəd/', 'Noun', N'Smoking is a serious health hazard.'),
    ('Implement', N'Triển khai, thực hiện', '/ˈɪmplɪment/', 'Verb', N'The plan was implemented last week.'),
    ('Maintain', N'Bảo trì, duy trì', '/meɪnˈteɪn/', 'Verb', N'The roads are well maintained.'),
    ('Objective', N'Mục tiêu', '/əbˈdʒektɪv/', 'Noun', N'Our main objective is to win.'),
    ('Precise', N'Tỉ mỉ, chính xác', '/prɪˈsaɪs/', 'Adj', N'We need precise measurements.'),
    ('Quality', N'Chất lượng', '/ˈkwɒləti/', 'Noun', N'The quality of the food is high.'),
    ('Resources', N'Nguồn lực', '/rɪˈsɔːrsɪz/', 'Noun', N'We have limited resources.');

    -- 5. Vòng lặp chèn
    DECLARE @Term NVARCHAR(100), @Meaning NVARCHAR(255), @Phonetic NVARCHAR(100), @POSCode NVARCHAR(20), @Example NVARCHAR(MAX);
    DECLARE @WordID BIGINT, @POSID INT;

    DECLARE cur CURSOR FOR SELECT Term, Meaning, Phonetic, POSCode, Example FROM @Words;
    OPEN cur;
    FETCH NEXT FROM cur INTO @Term, @Meaning, @Phonetic, @POSCode, @Example;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Lấy POS ID
        SELECT @POSID = PartOfSpeechID FROM PartOfSpeeches WHERE PartOfSpeechCode = @POSCode;

        -- Chèn Từ
        IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = @Term AND PartOfSpeechID = @POSID)
        BEGIN
            INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID, DifficultyLevel)
            VALUES (@Term, @Meaning, @Phonetic, @POSID, @SysAdminID, 1);
            SET @WordID = SCOPE_IDENTITY();

            -- Gán vào Topic
            INSERT INTO WordTopics (WordID, TopicID) VALUES (@WordID, @TopicID);

            -- Tạo câu hỏi MCQ
            INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson, CreatedByUserID)
            VALUES (@WordID, 'MCQ', N'Định nghĩa của từ ''' + @Term + N''' là gì?', @Meaning, 
            N'["' + @Meaning + N'", "Wrong Definition A", "Wrong Definition B", "Wrong Definition C"]', @SysAdminID);

            -- Tạo câu hỏi Điền từ
            INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson, CreatedByUserID)
            VALUES (@WordID, 'FillBlank', REPLACE(@Example, @Term, '______'), @Term, N'[]', @SysAdminID);

            -- TOEIC alignment question types
            INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson, CreatedByUserID)
            VALUES (@WordID, 'Dictation', N'Listen and type the vocabulary word.', @Term,
            N'{"instruction":"Listen and type the exact word","maxAttempts":3}', @SysAdminID);

            INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson, CreatedByUserID)
            VALUES (@WordID, 'DragDrop', N'Arrange the words into the correct sentence.', @Example,
            N'{"items":["' + REPLACE(@Example, N' ', N'","') + N'"]}', @SysAdminID);

            IF OBJECT_ID(N'dbo.WordPartsAssignment', N'U') IS NOT NULL
            BEGIN
                INSERT INTO WordPartsAssignment (WordID, PartID, RelevancyScore)
                SELECT @WordID, PartID, 3
                FROM PartsClassification
                WHERE PartNumber IN (5, 7);
            END
        END

        FETCH NEXT FROM cur INTO @Term, @Meaning, @Phonetic, @POSCode, @Example;
    END

    CLOSE cur;
    DEALLOCATE cur;

    COMMIT TRANSACTION;
    PRINT 'SEEDING COMPLETE SUCCESSFULLY IN ToeicVocabularyPlatform!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT 'ERROR: ' + ERROR_MESSAGE();
END CATCH
