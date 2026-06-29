-- Migration: Gán dữ liệu học thuật và bộ từ vựng SEED720 cho creator teacher@gmail.com (UserID = 11)
-- Và sửa lỗi hiệu năng view vw_ContentCreatorContentSummary (tránh phép nhân Cartesian)
USE [ToeicVocabularyPlatform];
GO

BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Cập nhật CategoryCode SEED720_TOEIC
    UPDATE TopicCategories
    SET CreatedByUserID = 11
    WHERE CategoryCode = N'SEED720_TOEIC';

    -- 2. Cập nhật các chủ đề SEED720-%
    UPDATE Topics
    SET CreatedByUserID = 11
    WHERE TopicCode LIKE N'SEED720-%';

    -- 3. Cập nhật từ vựng tương ứng
    UPDATE w
    SET CreatedByUserID = 11
    FROM dbo.Words w
    WHERE EXISTS (
        SELECT 1 
        FROM dbo.WordTopics wt 
        JOIN dbo.Topics t ON wt.TopicID = t.TopicID 
        WHERE wt.WordID = w.WordID 
          AND t.TopicCode LIKE N'SEED720-%'
    );

    -- 4. Cập nhật câu hỏi luyện tập tương ứng
    UPDATE q
    SET CreatedByUserID = 11
    FROM dbo.Questions q
    WHERE EXISTS (
        SELECT 1 
        FROM dbo.WordTopics wt 
        JOIN dbo.Topics t ON wt.TopicID = t.TopicID 
        WHERE wt.WordID = q.WordID 
          AND t.TopicCode LIKE N'SEED720-%'
    );

    -- 5. Cập nhật MiniTests tương ứng
    UPDATE mt
    SET CreatedByUserID = 11
    FROM dbo.MiniTests mt
    JOIN dbo.Topics t ON mt.TopicID = t.TopicID
    WHERE t.TopicCode LIKE N'SEED720-%';

    -- 6. Sửa lỗi hiệu năng view vw_ContentCreatorContentSummary
    -- Thay thế phép JOIN hàng loạt (gây Cartesian Product hàng chục triệu dòng) bằng các câu Subquery tối ưu
    EXEC('
    ALTER VIEW dbo.vw_ContentCreatorContentSummary
    AS
    SELECT
        u.UserID,
        u.FullName,
        u.Email,
        (SELECT COUNT(*) FROM dbo.Topics t WHERE t.CreatedByUserID = u.UserID) AS TotalTopics,
        (SELECT COUNT(*) FROM dbo.Words w WHERE w.CreatedByUserID = u.UserID) AS TotalWords,
        (SELECT COUNT(*) FROM dbo.Questions q WHERE q.CreatedByUserID = u.UserID) AS TotalQuestions,
        (SELECT COUNT(*) FROM dbo.MiniTests mt WHERE mt.CreatedByUserID = u.UserID) AS TotalMiniTests,
        (SELECT COUNT(*) FROM dbo.Words w WHERE w.CreatedByUserID = u.UserID AND w.ContentStatus = N''Published'') AS PublishedWords,
        (SELECT COUNT(*) FROM dbo.Words w WHERE w.CreatedByUserID = u.UserID AND w.ContentStatus = N''PendingReview'') AS PendingWords,
        (SELECT COUNT(*) FROM dbo.Words w WHERE w.CreatedByUserID = u.UserID AND w.ContentStatus = N''Rejected'') AS RejectedWords
    FROM dbo.Users u
    WHERE u.UserRole = N''ContentCreator'';
    ');

    COMMIT TRANSACTION;
    PRINT 'Migration completed successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
