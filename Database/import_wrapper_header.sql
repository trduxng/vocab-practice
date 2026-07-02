USE [ToeicVocabularyPlatform]
GO

-- Disable all foreign key constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'
GO

-- Disable all triggers
EXEC sp_MSforeachtable 'ALTER TABLE ? DISABLE TRIGGER ALL'
GO

-- Delete existing data from all tables (in dependency-safe order)
DELETE FROM [dbo].[ContentMediaLinks]
DELETE FROM [dbo].[LearningPathTopics]
DELETE FROM [dbo].[MiniTestItems]
DELETE FROM [dbo].[MiniTestAttempts]
DELETE FROM [dbo].[ExerciseAttempts]
DELETE FROM [dbo].[UserWordProgress]
DELETE FROM [dbo].[UserVocabularyNotebook]
DELETE FROM [dbo].[UserXPEvents]
DELETE FROM [dbo].[UserAchievements]
DELETE FROM [dbo].[ExampleSentences]
DELETE FROM [dbo].[WordTopics]
DELETE FROM [dbo].[Questions]
DELETE FROM [dbo].[ContentReports]
DELETE FROM [dbo].[ContentReviewLogs]
DELETE FROM [dbo].[Notifications]
DELETE FROM [dbo].[MediaAssets]
DELETE FROM [dbo].[AdminAuditLogs]
DELETE FROM [dbo].[UserTopicEnrollments]
DELETE FROM [dbo].[Words]
DELETE FROM [dbo].[MiniTests]
DELETE FROM [dbo].[Users]
DELETE FROM [dbo].[Topics]
DELETE FROM [dbo].[TopicCategories]
DELETE FROM [dbo].[Achievements]
DELETE FROM [dbo].[RolePermissions]
DELETE FROM [dbo].[Permissions]
DELETE FROM [dbo].[Roles]
DELETE FROM [dbo].[PartOfSpeeches]
DELETE FROM [dbo].[LearningPathLevels]
GO

-- Reset identity seeds
DBCC CHECKIDENT ('[dbo].[Achievements]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[AdminAuditLogs]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[ContentReports]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[ContentReviewLogs]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[ExampleSentences]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[ExerciseAttempts]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[LearningPathLevels]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[LearningPathTopics]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[MediaAssets]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[MiniTestAttempts]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[MiniTestItems]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[MiniTests]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[Notifications]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[PartOfSpeeches]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[Permissions]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[Questions]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[RolePermissions]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[Roles]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[TopicCategories]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[Topics]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[UserAchievements]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[Users]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[UserVocabularyNotebook]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[UserWordProgress]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[UserXPEvents]', RESEED, 0)
DBCC CHECKIDENT ('[dbo].[Words]', RESEED, 0)
GO

