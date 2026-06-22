-- ============================================================
-- MASTER SEED SCRIPT — VocaBoost
-- UTF-8 ENCODING — All Vietnamese text uses N'' prefix
-- ============================================================
-- HOW TO RUN:
--   docker cp seed_master.sql sqlserver_2022:/tmp/
--   docker exec sqlserver_2022 /opt/mssql-tools18/bin/sqlcmd \
--     -S localhost -U sa -P 'YourPassword' \
--     -d ToeicVocabularyPlatform \
--     -i /tmp/seed_master.sql -f 65001 -C
-- ============================================================
-- This script is IDEMPOTENT — safe to run multiple times.
-- ============================================================

USE ToeicVocabularyPlatform;
GO

BEGIN TRANSACTION;
BEGIN TRY

DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();
DECLARE @SysAdminID BIGINT;

-- Find or create system admin user
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = 'system@vocaboost.com')
BEGIN
    INSERT INTO dbo.Users (FullName, Email, PasswordHash, UserRole, IsActive)
    VALUES (N'System Admin', 'system@vocaboost.com', 'N/A', 'Admin', 1);
    SET @SysAdminID = SCOPE_IDENTITY();
END
ELSE
    SELECT @SysAdminID = UserID FROM dbo.Users WHERE Email = 'system@vocaboost.com';

PRINT N'System Admin ID: ' + CAST(@SysAdminID AS NVARCHAR(10));

-- ============================================================
-- 1. PART OF SPEECHES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.PartOfSpeeches WHERE PartOfSpeechCode = 'n')
    INSERT INTO dbo.PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName) VALUES ('n', N'Danh từ');
IF NOT EXISTS (SELECT 1 FROM dbo.PartOfSpeeches WHERE PartOfSpeechCode = 'v')
    INSERT INTO dbo.PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName) VALUES ('v', N'Động từ');
IF NOT EXISTS (SELECT 1 FROM dbo.PartOfSpeeches WHERE PartOfSpeechCode = 'adj')
    INSERT INTO dbo.PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName) VALUES ('adj', N'Tính từ');
IF NOT EXISTS (SELECT 1 FROM dbo.PartOfSpeeches WHERE PartOfSpeechCode = 'adv')
    INSERT INTO dbo.PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName) VALUES ('adv', N'Trạng từ');
IF NOT EXISTS (SELECT 1 FROM dbo.PartOfSpeeches WHERE PartOfSpeechCode = 'prep')
    INSERT INTO dbo.PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName) VALUES ('prep', N'Giới từ');

-- Fix mojibake in PartOfSpeeches if it exists
UPDATE dbo.PartOfSpeeches SET PartOfSpeechName = N'Động từ' WHERE PartOfSpeechName LIKE N'%Ä%ng t%' OR PartOfSpeechName LIKE N'%?ng t?%';
UPDATE dbo.PartOfSpeeches SET PartOfSpeechName = N'Danh từ' WHERE PartOfSpeechName LIKE N'%Danh t%' AND PartOfSpeechName NOT LIKE N'%Danh từ';

PRINT N'1. PartOfSpeeches ✓';

-- ============================================================
-- 2. TOPIC CATEGORIES
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.TopicCategories WHERE CategoryCode = 'TOEIC_BUSINESS')
    INSERT INTO dbo.TopicCategories (CategoryName, CategoryCode, Description, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
    VALUES (N'TOEIC Business', N'TOEIC_BUSINESS', N'Từ vựng TOEIC về kinh doanh, thương mại, hợp đồng', 1, 1, @SysAdminID, @Now, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.TopicCategories WHERE CategoryCode = 'DAILY_LIFE')
    INSERT INTO dbo.TopicCategories (CategoryName, CategoryCode, Description, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
    VALUES (N'Daily Life', N'DAILY_LIFE', N'Từ vựng giao tiếp đời sống hằng ngày', 2, 1, @SysAdminID, @Now, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.TopicCategories WHERE CategoryCode = 'TRAVEL_ENGLISH')
    INSERT INTO dbo.TopicCategories (CategoryName, CategoryCode, Description, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
    VALUES (N'Travel English', N'TRAVEL_ENGLISH', N'Từ vựng du lịch, sân bay, khách sạn, chỉ đường', 3, 1, @SysAdminID, @Now, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.TopicCategories WHERE CategoryCode = 'TOEIC_SKILLS')
    INSERT INTO dbo.TopicCategories (CategoryName, CategoryCode, Description, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
    VALUES (N'TOEIC Skills', N'TOEIC_SKILLS', N'Từ vựng và bài học theo kỹ năng TOEIC', 4, 1, @SysAdminID, @Now, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.TopicCategories WHERE CategoryCode = 'ACADEMIC_ENGLISH')
    INSERT INTO dbo.TopicCategories (CategoryName, CategoryCode, Description, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
    VALUES (N'Academic English', N'ACADEMIC_ENGLISH', N'Từ vựng học thuật, giáo dục, nghiên cứu', 5, 1, @SysAdminID, @Now, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.TopicCategories WHERE CategoryCode = 'TECHNOLOGY')
    INSERT INTO dbo.TopicCategories (CategoryName, CategoryCode, Description, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
    VALUES (N'Technology', N'TECHNOLOGY', N'Từ vựng công nghệ, phần mềm, internet, dữ liệu', 6, 1, @SysAdminID, @Now, @Now);

PRINT N'2. TopicCategories ✓';

-- ============================================================
-- 3. TOPICS - with CORRECT Vietnamese descriptions
-- ============================================================
-- Topic 1: TOEIC Starter Core
IF NOT EXISTS (SELECT 1 FROM dbo.Topics WHERE TopicCode = 'T50')
    INSERT INTO dbo.Topics (TopicName, TopicCode, Description, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt, TopicCategoryID)
    VALUES (N'TOEIC Starter Core', 'T50', N'15 từ vựng nền tảng quan trọng nhất cho kỳ thi TOEIC', @SysAdminID, @Now, @Now, N'Published', @SysAdminID, @Now, @Now, 4);
ELSE
    UPDATE dbo.Topics SET Description = N'15 từ vựng nền tảng quan trọng nhất cho kỳ thi TOEIC' WHERE TopicCode = 'T50' AND (Description LIKE N'%tá»«%' OR Description LIKE N'%t? v?ng%');

-- Topic 2: TOEIC Office & Meetings
IF NOT EXISTS (SELECT 1 FROM dbo.Topics WHERE TopicCode = 'TOEIC-OFFICE-01')
    INSERT INTO dbo.Topics (TopicName, TopicCode, Description, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt, TopicCategoryID)
    VALUES (N'TOEIC Office & Meetings', N'TOEIC-OFFICE-01', N'20 từ vựng về giao tiếp văn phòng, cuộc họp, lịch trình và báo cáo công việc.', @SysAdminID, @Now, @Now, N'Published', @SysAdminID, @Now, @Now, 1);

-- Topic 3: Daily Routines
IF NOT EXISTS (SELECT 1 FROM dbo.Topics WHERE TopicCode = 'DAILY-ROUTINES-01')
    INSERT INTO dbo.Topics (TopicName, TopicCode, Description, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt, TopicCategoryID)
    VALUES (N'Daily Routines & Activities', N'DAILY-ROUTINES-01', N'10 từ vựng về sinh hoạt hằng ngày, thói quen và các hoạt động thường nhật.', @SysAdminID, @Now, @Now, N'Published', @SysAdminID, @Now, @Now, 2);
ELSE
    UPDATE dbo.Topics SET Description = N'10 từ vựng về sinh hoạt hằng ngày, thói quen và các hoạt động thường nhật.' WHERE TopicCode = 'DAILY-ROUTINES-01' AND Description LIKE N'%t? v?ng%';

-- Topic 4: Airport & Flight Travel
IF NOT EXISTS (SELECT 1 FROM dbo.Topics WHERE TopicCode = 'TRAVEL-AIRPORT-01')
    INSERT INTO dbo.Topics (TopicName, TopicCode, Description, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt, TopicCategoryID)
    VALUES (N'Airport & Flight Travel', N'TRAVEL-AIRPORT-01', N'10 từ vựng cần thiết về sân bay, bay, hành lý và thủ tục du lịch.', @SysAdminID, @Now, @Now, N'Published', @SysAdminID, @Now, @Now, 3);
ELSE
    UPDATE dbo.Topics SET Description = N'10 từ vựng cần thiết về sân bay, bay, hành lý và thủ tục du lịch.' WHERE TopicCode = 'TRAVEL-AIRPORT-01' AND Description LIKE N'%t? v?ng%';

-- Topic 5: Software & Office Tech
IF NOT EXISTS (SELECT 1 FROM dbo.Topics WHERE TopicCode = 'TECH-SOFTWARE-01')
    INSERT INTO dbo.Topics (TopicName, TopicCode, Description, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt, TopicCategoryID)
    VALUES (N'Software & Office Tech', N'TECH-SOFTWARE-01', N'10 từ vựng công nghệ về phần mềm, thiết bị văn phòng và công cụ kỹ thuật số.', @SysAdminID, @Now, @Now, N'Published', @SysAdminID, @Now, @Now, 6);
ELSE
    UPDATE dbo.Topics SET Description = N'10 từ vựng công nghệ về phần mềm, thiết bị văn phòng và công cụ kỹ thuật số.' WHERE TopicCode = 'TECH-SOFTWARE-01' AND Description LIKE N'%t? v?ng%';

-- Topic 6: Academic Study & Research
IF NOT EXISTS (SELECT 1 FROM dbo.Topics WHERE TopicCode = 'ACADEMIC-STUDY-01')
    INSERT INTO dbo.Topics (TopicName, TopicCode, Description, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt, TopicCategoryID)
    VALUES (N'Academic Study & Research', N'ACADEMIC-STUDY-01', N'10 từ vựng học thuật về nghiên cứu, bài giảng, luận văn và thư viện.', @SysAdminID, @Now, @Now, N'Published', @SysAdminID, @Now, @Now, 5);
ELSE
    UPDATE dbo.Topics SET Description = N'10 từ vựng học thuật về nghiên cứu, bài giảng, luận văn và thư viện.' WHERE TopicCode = 'ACADEMIC-STUDY-01' AND Description LIKE N'%t? v?ng%';

PRINT N'3. Topics ✓';

-- ============================================================
-- 4. LEARNING PATH LEVELS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.LearningPathLevels WHERE LevelCode = 'TOEIC_300')
    INSERT INTO dbo.LearningPathLevels (LevelCode, LevelName, TargetScore, Description, DisplayOrder, AccentKey, IsActive, CreatedAt, UpdatedAt)
    VALUES ('TOEIC_300', N'TOEIC 300', 300, N'Xây dựng nền tảng từ vựng TOEIC thiết yếu hàng ngày.', 1, 'sky', 1, @Now, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.LearningPathLevels WHERE LevelCode = 'TOEIC_500')
    INSERT INTO dbo.LearningPathLevels (LevelCode, LevelName, TargetScore, Description, DisplayOrder, AccentKey, IsActive, CreatedAt, UpdatedAt)
    VALUES ('TOEIC_500', N'TOEIC 500', 500, N'Mở rộng từ vựng công việc và cải thiện tốc độ phản xạ.', 2, 'emerald', 1, @Now, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.LearningPathLevels WHERE LevelCode = 'TOEIC_700')
    INSERT INTO dbo.LearningPathLevels (LevelCode, LevelName, TargetScore, Description, DisplayOrder, AccentKey, IsActive, CreatedAt, UpdatedAt)
    VALUES ('TOEIC_700', N'TOEIC 700', 700, N'Làm chủ từ vựng tần suất cao trong kinh doanh và học thuật.', 3, 'amber', 1, @Now, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.LearningPathLevels WHERE LevelCode = 'TOEIC_900')
    INSERT INTO dbo.LearningPathLevels (LevelCode, LevelName, TargetScore, Description, DisplayOrder, AccentKey, IsActive, CreatedAt, UpdatedAt)
    VALUES ('TOEIC_900', N'TOEIC 900', 900, N'Nâng cao từ vựng chuyên sâu để đạt điểm TOEIC cao.', 4, 'violet', 1, @Now, @Now);

PRINT N'4. LearningPathLevels ✓';

-- ============================================================
-- 5. ACHIEVEMENTS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Achievements WHERE Code = 'FIRST_WORD')
    INSERT INTO dbo.Achievements (Code, Name, Description, Icon, CriteriaType, CriteriaValue, DisplayOrder, IsActive, CreatedAt)
    VALUES ('FIRST_WORD', N'First Word', N'Học từ vựng đầu tiên của bạn.', N'🌱', 'WORDS_LEARNED', 1, 1, 1, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.Achievements WHERE Code = 'WORDS_100')
    INSERT INTO dbo.Achievements (Code, Name, Description, Icon, CriteriaType, CriteriaValue, DisplayOrder, IsActive, CreatedAt)
    VALUES ('WORDS_100', N'First 100 Words', N'Học 100 từ vựng.', N'📚', 'WORDS_LEARNED', 100, 2, 1, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.Achievements WHERE Code = 'STREAK_7')
    INSERT INTO dbo.Achievements (Code, Name, Description, Icon, CriteriaType, CriteriaValue, DisplayOrder, IsActive, CreatedAt)
    VALUES ('STREAK_7', N'7 Day Streak', N'Học 7 ngày liên tiếp.', N'🔥', 'STREAK_DAYS', 7, 3, 1, @Now);
IF NOT EXISTS (SELECT 1 FROM dbo.Achievements WHERE Code = 'STREAK_30')
    INSERT INTO dbo.Achievements (Code, Name, Description, Icon, CriteriaType, CriteriaValue, DisplayOrder, IsActive, CreatedAt)
    VALUES ('STREAK_30', N'30 Day Streak', N'Học 30 ngày liên tiếp.', N'⚡', 'STREAK_DAYS', 30, 4, 1, @Now);

PRINT N'5. Achievements ✓';

-- ============================================================
-- 6. LEARNING PATH TOPIC MAPPINGS
-- ============================================================
-- Map Topics to LearningPathLevels
DECLARE @Level1ID INT = (SELECT LearningPathLevelID FROM dbo.LearningPathLevels WHERE LevelCode = 'TOEIC_300');
DECLARE @Level2ID INT = (SELECT LearningPathLevelID FROM dbo.LearningPathLevels WHERE LevelCode = 'TOEIC_500');
DECLARE @Level3ID INT = (SELECT LearningPathLevelID FROM dbo.LearningPathLevels WHERE LevelCode = 'TOEIC_700');
DECLARE @Level4ID INT = (SELECT LearningPathLevelID FROM dbo.LearningPathLevels WHERE LevelCode = 'TOEIC_900');

DECLARE @T1ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'T50');
DECLARE @T2ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'TOEIC-OFFICE-01');
DECLARE @T3ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'DAILY-ROUTINES-01');
DECLARE @T4ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'TRAVEL-AIRPORT-01');
DECLARE @T5ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'TECH-SOFTWARE-01');
DECLARE @T6ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'ACADEMIC-STUDY-01');

IF @Level1ID IS NOT NULL AND @T1ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.LearningPathTopics WHERE LearningPathLevelID = @Level1ID AND TopicID = @T1ID)
    INSERT INTO dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt) VALUES (@Level1ID, @T1ID, 1, 1, @Now);
IF @Level1ID IS NOT NULL AND @T2ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.LearningPathTopics WHERE LearningPathLevelID = @Level1ID AND TopicID = @T2ID)
    INSERT INTO dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt) VALUES (@Level1ID, @T2ID, 2, 1, @Now);
IF @Level2ID IS NOT NULL AND @T3ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.LearningPathTopics WHERE LearningPathLevelID = @Level2ID AND TopicID = @T3ID)
    INSERT INTO dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt) VALUES (@Level2ID, @T3ID, 1, 1, @Now);
IF @Level2ID IS NOT NULL AND @T4ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.LearningPathTopics WHERE LearningPathLevelID = @Level2ID AND TopicID = @T4ID)
    INSERT INTO dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt) VALUES (@Level2ID, @T4ID, 2, 1, @Now);
IF @Level3ID IS NOT NULL AND @T5ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.LearningPathTopics WHERE LearningPathLevelID = @Level3ID AND TopicID = @T5ID)
    INSERT INTO dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt) VALUES (@Level3ID, @T5ID, 1, 1, @Now);
IF @Level4ID IS NOT NULL AND @T6ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.LearningPathTopics WHERE LearningPathLevelID = @Level4ID AND TopicID = @T6ID)
    INSERT INTO dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt) VALUES (@Level4ID, @T6ID, 1, 1, @Now);

PRINT N'6. LearningPathTopics ✓';

-- ============================================================
-- 7. MINI TESTS - with correct Vietnamese
-- ============================================================
-- Note: MiniTests use TopicID instead of TestCode
DECLARE @Topic1ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'T50');
DECLARE @Topic2ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'TOEIC-OFFICE-01');
DECLARE @Topic3ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'DAILY-ROUTINES-01');
DECLARE @Topic4ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'TRAVEL-AIRPORT-01');
DECLARE @Topic5ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'TECH-SOFTWARE-01');
DECLARE @Topic6ID INT = (SELECT TopicID FROM dbo.Topics WHERE TopicCode = 'ACADEMIC-STUDY-01');

IF @Topic1ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MiniTests WHERE TopicID = @Topic1ID)
    INSERT INTO dbo.MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt, ContentStatus)
    VALUES (@Topic1ID, N'Kiểm tra: TOEIC Starter Core', N'Bài kiểm tra từ vựng TOEIC nền tảng gồm các từ cơ bản.', @SysAdminID, 15, 1, @Now, @Now, N'Published');
IF @Topic2ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MiniTests WHERE TopicID = @Topic2ID)
    INSERT INTO dbo.MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt, ContentStatus)
    VALUES (@Topic2ID, N'Kiểm tra: TOEIC Office & Meetings', N'Bài kiểm tra từ vựng văn phòng và cuộc họp TOEIC.', @SysAdminID, 20, 1, @Now, @Now, N'Published');
IF @Topic3ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MiniTests WHERE TopicID = @Topic3ID)
    INSERT INTO dbo.MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt, ContentStatus)
    VALUES (@Topic3ID, N'Kiểm tra: Daily Routines & Activities', N'Bài kiểm tra từ vựng về sinh hoạt hằng ngày.', @SysAdminID, 10, 1, @Now, @Now, N'Published');
IF @Topic4ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MiniTests WHERE TopicID = @Topic4ID)
    INSERT INTO dbo.MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt, ContentStatus)
    VALUES (@Topic4ID, N'Kiểm tra: Airport & Flight Travel', N'Bài kiểm tra từ vựng về sân bay và du lịch.', @SysAdminID, 10, 1, @Now, @Now, N'Published');
IF @Topic5ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MiniTests WHERE TopicID = @Topic5ID)
    INSERT INTO dbo.MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt, ContentStatus)
    VALUES (@Topic5ID, N'Kiểm tra: Software & Office Tech', N'Bài kiểm tra từ vựng về công nghệ văn phòng.', @SysAdminID, 10, 1, @Now, @Now, N'Published');
IF @Topic6ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MiniTests WHERE TopicID = @Topic6ID)
    INSERT INTO dbo.MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt, ContentStatus)
    VALUES (@Topic6ID, N'Kiểm tra: Academic Study & Research', N'Bài kiểm tra từ vựng học thuật và nghiên cứu.', @SysAdminID, 10, 1, @Now, @Now, N'Published');

PRINT N'7. MiniTests ✓';

-- ============================================================
-- VERIFICATION
-- ============================================================
PRINT N'';
PRINT N'=== SEED COMPLETE ===';
SELECT 'PartOfSpeeches' AS Tbl, COUNT(*) AS Cnt FROM dbo.PartOfSpeeches
UNION ALL SELECT 'TopicCategories', COUNT(*) FROM dbo.TopicCategories
UNION ALL SELECT 'Topics', COUNT(*) FROM dbo.Topics
UNION ALL SELECT 'LearningPathLevels', COUNT(*) FROM dbo.LearningPathLevels
UNION ALL SELECT 'Achievements', COUNT(*) FROM dbo.Achievements
UNION ALL SELECT 'MiniTests', COUNT(*) FROM dbo.MiniTests;

COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT N'ERROR: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
