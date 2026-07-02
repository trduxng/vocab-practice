-- ============================================================
-- Migration: Add Analytics Views
-- Description: Adds 4 analytics views for content creators,
--   topic learning, mini-test analytics, and topic categories.
-- Idempotent: Uses CREATE OR ALTER VIEW (SQL Server 2016+).
-- ============================================================
-- How to run:
--   USE [ToeicVocabularyPlatform];
--   GO
--   :r .\migration_add_analytics_views.sql
-- ============================================================

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

PRINT N'Creating view [dbo].[vw_ContentCreatorContentSummary]...';
GO

CREATE OR ALTER VIEW [dbo].[vw_ContentCreatorContentSummary]
AS
SELECT
    u.UserID,
    u.FullName,
    u.Email,

    COUNT(DISTINCT t.TopicID) AS TotalTopics,
    COUNT(DISTINCT w.WordID) AS TotalWords,
    COUNT(DISTINCT q.QuestionID) AS TotalQuestions,
    COUNT(DISTINCT mt.MiniTestID) AS TotalMiniTests,

    SUM(CASE WHEN w.ContentStatus = N'Published' THEN 1 ELSE 0 END) AS PublishedWords,
    SUM(CASE WHEN w.ContentStatus = N'PendingReview' THEN 1 ELSE 0 END) AS PendingWords,
    SUM(CASE WHEN w.ContentStatus = N'Rejected' THEN 1 ELSE 0 END) AS RejectedWords
FROM dbo.Users u
LEFT JOIN dbo.Topics t
    ON t.CreatedByUserID = u.UserID
LEFT JOIN dbo.Words w
    ON w.CreatedByUserID = u.UserID
LEFT JOIN dbo.Questions q
    ON q.CreatedByUserID = u.UserID
LEFT JOIN dbo.MiniTests mt
    ON mt.CreatedByUserID = u.UserID
WHERE u.UserRole = N'ContentCreator'
GROUP BY
    u.UserID,
    u.FullName,
    u.Email;

GO

PRINT N'Creating view [dbo].[vw_TopicLearningAnalytics]...';
GO

CREATE OR ALTER VIEW [dbo].[vw_TopicLearningAnalytics]
AS
SELECT
    t.TopicID,
    t.TopicName,
    t.TopicCode,

    COUNT(DISTINCT ute.UserID) AS TotalEnrolledLearners,
    COUNT(DISTINCT wt.WordID) AS TotalWords,
    COUNT(DISTINCT uwp.UserID) AS LearnersWithProgress,

    AVG(CAST(uwp.MasteryLevel AS DECIMAL(10,2))) AS AvgMasteryLevel,
    AVG(CAST(uwp.LastScore AS DECIMAL(10,2))) AS AvgLastScore,

    SUM(CASE WHEN uwp.MemoryStatus = N'Mastered' THEN 1 ELSE 0 END) AS TotalMasteredRecords,
    SUM(CASE WHEN uwp.MemoryStatus = N'Lapsed' THEN 1 ELSE 0 END) AS TotalLapsedRecords
FROM dbo.Topics t
LEFT JOIN dbo.UserTopicEnrollments ute
    ON ute.TopicID = t.TopicID
    AND ute.IsActive = 1
LEFT JOIN dbo.WordTopics wt
    ON wt.TopicID = t.TopicID
LEFT JOIN dbo.UserWordProgress uwp
    ON uwp.WordID = wt.WordID
GROUP BY
    t.TopicID,
    t.TopicName,
    t.TopicCode;

GO

PRINT N'Creating view [dbo].[vw_MiniTestAnalytics]...';
GO

CREATE OR ALTER VIEW [dbo].[vw_MiniTestAnalytics]
AS
SELECT
    mt.MiniTestID,
    mt.TestTitle,
    mt.TopicID,
    t.TopicName,

    COUNT(mta.MiniTestAttemptID) AS TotalAttempts,
    COUNT(DISTINCT mta.UserID) AS TotalLearners,
    AVG(CAST(mta.Score AS DECIMAL(10,2))) AS AvgScore,
    MIN(mta.Score) AS MinScore,
    MAX(mta.Score) AS MaxScore,

    SUM(CASE WHEN mta.SubmittedAt IS NOT NULL THEN 1 ELSE 0 END) AS SubmittedAttempts,
    SUM(CASE WHEN mta.SubmittedAt IS NULL THEN 1 ELSE 0 END) AS UnfinishedAttempts
FROM dbo.MiniTests mt
LEFT JOIN dbo.Topics t
    ON t.TopicID = mt.TopicID
LEFT JOIN dbo.MiniTestAttempts mta
    ON mta.MiniTestID = mt.MiniTestID
GROUP BY
    mt.MiniTestID,
    mt.TestTitle,
    mt.TopicID,
    t.TopicName;

GO

PRINT N'Creating view [dbo].[vw_TopicCategorySummary]...';
GO

CREATE OR ALTER VIEW [dbo].[vw_TopicCategorySummary]
AS
SELECT
    tc.TopicCategoryID,
    tc.CategoryName,
    tc.CategoryCode,
    tc.Description,
    tc.IconUrl,
    tc.DisplayOrder,
    tc.IsActive,
    COUNT(t.TopicID) AS TotalTopics,
    SUM
    (
        CASE
            WHEN t.ContentStatus = N'Published' THEN 1
            ELSE 0
        END
    ) AS PublishedTopics,
    SUM
    (
        CASE
            WHEN t.ContentStatus = N'Draft' THEN 1
            ELSE 0
        END
    ) AS DraftTopics,
    SUM
    (
        CASE
            WHEN t.ContentStatus = N'PendingReview' THEN 1
            ELSE 0
        END
    ) AS PendingReviewTopics
FROM dbo.TopicCategories tc
LEFT JOIN dbo.Topics t
    ON t.TopicCategoryID = tc.TopicCategoryID
GROUP BY
    tc.TopicCategoryID,
    tc.CategoryName,
    tc.CategoryCode,
    tc.Description,
    tc.IconUrl,
    tc.DisplayOrder,
    tc.IsActive;

GO

PRINT N'Migration complete: 4 analytics views created.';
GO
