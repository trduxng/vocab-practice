USE ToeicVocabularyPlatform;

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

BEGIN TRY
    DECLARE @AdminID BIGINT;
    DECLARE @TopicID BIGINT;
    DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

    SELECT TOP (1) @AdminID = UserID
    FROM dbo.Users
    WHERE UserRole IN (N'Admin', N'ContentCreator')
    ORDER BY CASE WHEN Email = N'system@vocaboost.com' THEN 0 ELSE 1 END, UserID;

    IF @AdminID IS NULL
        THROW 51000, 'Cannot create vocabulary set because no Admin or ContentCreator user exists.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.Topics WHERE TopicCode = N'TOEIC-OFFICE-01')
    BEGIN
        INSERT INTO dbo.Topics
            (TopicName, TopicCode, Description, CreatedByUserID, CreatedAt, UpdatedAt,
             ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt)
        VALUES
            (N'TOEIC Office & Meetings',
             N'TOEIC-OFFICE-01',
             N'20 TOEIC words for office communication, meetings, schedules, and workplace reports.',
             @AdminID, @Now, @Now, N'Published', @AdminID, @Now, @Now);
    END;

    SELECT @TopicID = TopicID
    FROM dbo.Topics
    WHERE TopicCode = N'TOEIC-OFFICE-01';

    DECLARE @Words TABLE
    (
        Term NVARCHAR(200) NOT NULL,
        Meaning NVARCHAR(1000) NOT NULL,
        Phonetic NVARCHAR(255) NULL,
        PosCode NVARCHAR(20) NOT NULL,
        DifficultyLevel TINYINT NOT NULL,
        Example NVARCHAR(2000) NOT NULL,
        ExampleMeaning NVARCHAR(2000) NULL
    );

    INSERT INTO @Words (Term, Meaning, Phonetic, PosCode, DifficultyLevel, Example, ExampleMeaning)
    VALUES
        (N'agenda', N'chuong trinh nghi su, noi dung cuoc hop', N'/eˈdʒendə/', N'n', 1, N'The manager sent the meeting agenda yesterday.', N'Nguoi quan ly da gui chuong trinh cuoc hop vao hom qua.'),
        (N'appointment', N'cuoc hen, lich hen', N'/əˈpɔɪntmənt/', N'n', 1, N'I have an appointment with the client at 10 a.m.', N'Toi co lich hen voi khach hang luc 10 gio sang.'),
        (N'arrange', N'sap xep, bo tri', N'/əˈreɪndʒ/', N'v', 1, N'Please arrange a conference room for the interview.', N'Vui long sap xep phong hop cho buoi phong van.'),
        (N'attend', N'tham du, co mat', N'/əˈtend/', N'v', 1, N'All team members are expected to attend the training.', N'Tat ca thanh vien nhom duoc yeu cau tham du buoi dao tao.'),
        (N'brief', N'ngan gon; thong bao tom tat', N'/briːf/', N'adj', 2, N'The director gave a brief update on sales.', N'Giam doc dua ra cap nhat ngan gon ve doanh so.'),
        (N'collaborate', N'cong tac, hop tac', N'/kəˈlæbəreɪt/', N'v', 2, N'Two departments will collaborate on the new campaign.', N'Hai phong ban se hop tac trong chien dich moi.'),
        (N'confirm', N'xac nhan', N'/kənˈfɜːrm/', N'v', 1, N'Please confirm your attendance by Friday.', N'Vui long xac nhan viec tham du truoc thu Sau.'),
        (N'deadline', N'han chot', N'/ˈdedlaɪn/', N'n', 1, N'The deadline for the report is next Monday.', N'Han chot nop bao cao la thu Hai toi.'),
        (N'delegate', N'giao pho, uy quyen', N'/ˈdelɪɡeɪt/', N'v', 2, N'The supervisor will delegate tasks to the assistants.', N'Giam sat vien se giao viec cho cac tro ly.'),
        (N'discuss', N'thao luan', N'/dɪˈskʌs/', N'v', 1, N'We need to discuss the budget before approval.', N'Chung ta can thao luan ngan sach truoc khi phe duyet.'),
        (N'extension', N'su gia han, may nhanh noi bo', N'/ɪkˈstenʃn/', N'n', 2, N'She requested an extension for the project deadline.', N'Co ay yeu cau gia han thoi han du an.'),
        (N'follow-up', N'viec tiep tuc xu ly, theo doi sau do', N'/ˈfɑːloʊ ʌp/', N'n', 2, N'The follow-up email included the final schedule.', N'Email theo doi sau do co kem lich trinh cuoi cung.'),
        (N'minutes', N'bien ban cuoc hop', N'/ˈmɪnɪts/', N'n', 2, N'The assistant prepared the minutes after the meeting.', N'Tro ly da chuan bi bien ban sau cuoc hop.'),
        (N'postpone', N'tri hoan', N'/poʊˈspoʊn/', N'v', 2, N'They decided to postpone the presentation until Thursday.', N'Ho quyet dinh hoan bai thuyet trinh den thu Nam.'),
        (N'proposal', N'de xuat, ban de xuat', N'/prəˈpoʊzl/', N'n', 2, N'The proposal was reviewed by senior management.', N'Ban de xuat da duoc ban quan ly cap cao xem xet.'),
        (N'regarding', N've viec, lien quan den', N'/rɪˈɡɑːrdɪŋ/', N'prep', 2, N'I am calling regarding your recent invoice.', N'Toi goi ve hoa don gan day cua ban.'),
        (N'reschedule', N'doi lich, sap xep lai lich', N'/ˌriːˈskedʒuːl/', N'v', 2, N'We had to reschedule the supplier meeting.', N'Chung toi da phai doi lich hop voi nha cung cap.'),
        (N'summarize', N'tom tat', N'/ˈsʌməraɪz/', N'v', 2, N'Could you summarize the main points of the report?', N'Ban co the tom tat cac y chinh cua bao cao khong?'),
        (N'venue', N'dia diem to chuc', N'/ˈvenjuː/', N'n', 1, N'The venue for the seminar is on the third floor.', N'Dia diem to chuc hoi thao nam o tang ba.'),
        (N'workflow', N'quy trinh lam viec', N'/ˈwɜːrkfloʊ/', N'n', 2, N'The new software improved the team workflow.', N'Phan mem moi da cai thien quy trinh lam viec cua nhom.');

    DECLARE
        @Term NVARCHAR(200),
        @Meaning NVARCHAR(1000),
        @Phonetic NVARCHAR(255),
        @PosCode NVARCHAR(20),
        @DifficultyLevel TINYINT,
        @Example NVARCHAR(2000),
        @ExampleMeaning NVARCHAR(2000),
        @PartOfSpeechID INT,
        @WordID BIGINT,
        @QuestionText NVARCHAR(2000),
        @OptionsJson NVARCHAR(MAX);

    DECLARE word_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT Term, Meaning, Phonetic, PosCode, DifficultyLevel, Example, ExampleMeaning
        FROM @Words;

    OPEN word_cursor;

    FETCH NEXT FROM word_cursor
    INTO @Term, @Meaning, @Phonetic, @PosCode, @DifficultyLevel, @Example, @ExampleMeaning;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT TOP (1) @PartOfSpeechID = PartOfSpeechID
        FROM dbo.PartOfSpeeches
        WHERE LOWER(PartOfSpeechCode) = LOWER(@PosCode);

        IF @PartOfSpeechID IS NULL
            THROW 51001, 'Cannot create vocabulary set because a part of speech is missing.', 1;

        SELECT @WordID = WordID
        FROM dbo.Words
        WHERE Term = @Term AND PartOfSpeechID = @PartOfSpeechID;

        IF @WordID IS NULL
        BEGIN
            INSERT INTO dbo.Words
                (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID,
                 CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt)
            VALUES
                (@Term, @PartOfSpeechID, @Meaning, @Phonetic, @DifficultyLevel, @AdminID,
                 @Now, @Now, N'Published', @AdminID, @Now, @Now);

            SET @WordID = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE dbo.Words
            SET Meaning = @Meaning,
                Phonetic = @Phonetic,
                DifficultyLevel = @DifficultyLevel,
                UpdatedAt = @Now,
                ContentStatus = N'Published',
                ReviewedByUserID = COALESCE(ReviewedByUserID, @AdminID),
                ReviewedAt = COALESCE(ReviewedAt, @Now),
                PublishedAt = COALESCE(PublishedAt, @Now)
            WHERE WordID = @WordID;
        END;

        IF NOT EXISTS (SELECT 1 FROM dbo.WordTopics WHERE WordID = @WordID AND TopicID = @TopicID)
        BEGIN
            INSERT INTO dbo.WordTopics (WordID, TopicID, AssignedAt)
            VALUES (@WordID, @TopicID, @Now);
        END;

        IF NOT EXISTS (SELECT 1 FROM dbo.ExampleSentences WHERE WordID = @WordID AND SentenceText = @Example)
        BEGIN
            INSERT INTO dbo.ExampleSentences
                (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
            VALUES
                (@WordID, @Example, @ExampleMeaning, @Now, @Now);
        END;

        SET @QuestionText = N'What does "' + @Term + N'" mean in Vietnamese?';
        SET @OptionsJson = N'["' + REPLACE(@Meaning, N'"', N'\"') + N'","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]';

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Questions
            WHERE WordID = @WordID
              AND QuestionType = N'MCQ'
              AND QuestionText = @QuestionText
        )
        BEGIN
            INSERT INTO dbo.Questions
                (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation,
                 DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus,
                 ReviewedByUserID, ReviewedAt, PublishedAt)
            VALUES
                (@WordID, N'MCQ', @QuestionText, @OptionsJson, @Meaning,
                 N'Choose the Vietnamese meaning that matches the TOEIC workplace context.',
                 @DifficultyLevel, @AdminID, @Now, @Now, N'Published',
                 @AdminID, @Now, @Now);
        END;

        SET @QuestionText = REPLACE(@Example, @Term, N'______');

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Questions
            WHERE WordID = @WordID
              AND QuestionType = N'FillBlank'
              AND QuestionText = @QuestionText
        )
        BEGIN
            INSERT INTO dbo.Questions
                (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation,
                 DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus,
                 ReviewedByUserID, ReviewedAt, PublishedAt)
            VALUES
                (@WordID, N'FillBlank', @QuestionText, N'[]', @Term,
                 N'Complete the sentence with the correct TOEIC vocabulary word.',
                 @DifficultyLevel, @AdminID, @Now, @Now, N'Published',
                 @AdminID, @Now, @Now);
        END;

        SET @PartOfSpeechID = NULL;
        SET @WordID = NULL;

        FETCH NEXT FROM word_cursor
        INTO @Term, @Meaning, @Phonetic, @PosCode, @DifficultyLevel, @Example, @ExampleMeaning;
    END;

    CLOSE word_cursor;
    DEALLOCATE word_cursor;

    COMMIT TRANSACTION;

    SELECT
        @TopicID AS TopicID,
        COUNT(DISTINCT w.WordID) AS WordCount,
        COUNT(DISTINCT q.QuestionID) AS QuestionCount,
        COUNT(DISTINCT es.ExampleSentenceID) AS ExampleCount
    FROM dbo.WordTopics wt
    JOIN dbo.Words w ON w.WordID = wt.WordID
    LEFT JOIN dbo.Questions q ON q.WordID = w.WordID
    LEFT JOIN dbo.ExampleSentences es ON es.WordID = w.WordID
    WHERE wt.TopicID = @TopicID;
END TRY
BEGIN CATCH
    IF CURSOR_STATUS('local', 'word_cursor') >= -1
    BEGIN
        CLOSE word_cursor;
        DEALLOCATE word_cursor;
    END;

    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
