-- SCRIPT SEEDING DỮ LIỆU MẪU CHO VOCABOOST
-- Chạy script này trong SSMS để có ngay 15 từ vựng và câu hỏi mẫu

BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Tạo Topic mẫu
    DECLARE @TopicID BIGINT;
    IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = 'T50')
    BEGIN
        INSERT INTO Topics (TopicName, TopicCode, Description)
        VALUES (N'TOEIC Starter Core', 'T50', N'15 từ vựng nền tảng quan trọng nhất cho kỳ thi TOEIC');
        SET @TopicID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SELECT @TopicID = TopicID FROM Topics WHERE TopicCode = 'T50';
    END

    -- 2. Danh sách từ vựng
    DECLARE @Words TABLE (Term NVARCHAR(100), Meaning NVARCHAR(255), Phonetic NVARCHAR(100), Type NVARCHAR(50), Example NVARCHAR(MAX));
    INSERT INTO @Words VALUES 
    ('Abandon', N'Từ bỏ, ruồng bỏ', '/əˈbændən/', 'Verb', N'The baby was abandoned by his parents.'),
    ('Accurate', N'Chính xác', '/ˈækjərət/', 'Adjective', N'The map was very accurate.'),
    ('Benefit', N'Lợi ích', '/ˈbenɪfɪt/', 'Noun', N'The new law will benefit everyone.'),
    ('Capacity', N'Sức chứa, năng lực', '/kəˈpæsəti/', 'Noun', N'The stadium has a capacity of 50,000.'),
    ('Dedicate', N'Cống hiến', '/ˈdedɪkeɪt/', 'Verb', N'He dedicated his life to helping the poor.'),
    ('Efficient', N'Hiệu quả', '/ɪˈfɪʃnt/', 'Adjective', N'The new machine is very efficient.'),
    ('Facilitate', N'Tạo điều kiện thuận lợi', '/fəˈsɪlɪteɪt/', 'Verb', N'The new app will facilitate communication.'),
    ('Generate', N'Tạo ra, phát sinh', '/ˈdʒenəreɪt/', 'Verb', N'The solar panels generate electricity.'),
    ('Hazard', N'Mối nguy hại', '/ˈhæzəd/', 'Noun', N'Smoking is a serious health hazard.'),
    ('Implement', N'Triển khai, thực hiện', '/ˈɪmplɪment/', 'Verb', N'The plan was implemented last week.'),
    ('Maintain', N'Bảo trì, duy trì', '/meɪnˈteɪn/', 'Verb', N'The roads are well maintained.'),
    ('Objective', N'Mục tiêu', '/əbˈdʒektɪv/', 'Noun', N'Our main objective is to win.'),
    ('Precise', N'Tỉ mỉ, chính xác', '/prɪˈsaɪs/', 'Adjective', N'We need precise measurements.'),
    ('Quality', N'Chất lượng', '/ˈkwɒləti/', 'Noun', N'The quality of the food is high.'),
    ('Resources', N'Nguồn lực', '/rɪˈsɔːrsɪz/', 'Noun', N'We have limited resources.');

    -- 3. Vòng lặp chèn Từ vựng và Câu hỏi
    DECLARE @Term NVARCHAR(100), @Meaning NVARCHAR(255), @Phonetic NVARCHAR(100), @Type NVARCHAR(50), @Example NVARCHAR(MAX);
    DECLARE @WordID BIGINT;

    DECLARE cur CURSOR FOR SELECT Term, Meaning, Phonetic, Type, Example FROM @Words;
    OPEN cur;
    FETCH NEXT FROM cur INTO @Term, @Meaning, @Phonetic, @Type, @Example;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Chèn Từ
        IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = @Term)
        BEGIN
            INSERT INTO Words (Term, Meaning, Phonetic, WordType)
            VALUES (@Term, @Meaning, @Phonetic, @Type);
            SET @WordID = SCOPE_IDENTITY();

            -- Gán vào Topic
            INSERT INTO WordTopics (WordID, TopicID) VALUES (@WordID, @TopicID);

            -- Tạo câu hỏi MCQ
            INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson)
            VALUES (@WordID, 'MCQ', N'Định nghĩa của từ ''' + @Term + N''' là gì?', @Meaning, 
            N'["' + @Meaning + N'", "Wrong Definition A", "Wrong Definition B", "Wrong Definition C"]');

            -- Tạo câu hỏi Điền từ
            INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer)
            VALUES (@WordID, 'FillBlank', REPLACE(@Example, @Term, '______'), @Term);
        END

        FETCH NEXT FROM cur INTO @Term, @Meaning, @Phonetic, @Type, @Example;
    END

    CLOSE cur;
    DEALLOCATE cur;

    COMMIT TRANSACTION;
    PRINT 'SEEDING COMPLETE SUCCESSFULLY!';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'ERROR DURING SEEDING: ' + ERROR_MESSAGE();
END CATCH
