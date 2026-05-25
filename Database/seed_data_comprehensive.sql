-- ============================================================
-- SEED DATA FOR ToeicVocabularyPlatform
-- Comprehensive seed excluding user accounts
-- ============================================================
-- IMPORTANT:
-- This seed file populates ALL reference & content tables.
-- User accounts are NOT seeded here. Before running this file,
-- ensure you have at least ONE Admin user in the [dbo].[Users]
-- table with UserID = 1 (or adjust the CreatedByUserID references
-- in Topics / Words / Questions / MiniTests accordingly).
--
-- Usage:
--   1. Run your schema migration first
--   2. Seed user accounts separately
--   3. Run this file
-- ============================================================

USE [ToeicVocabularyPlatform]
GO

-- ============================================================
-- 1. PART OF SPEECHES
-- ============================================================
SET IDENTITY_INSERT [dbo].[PartOfSpeeches] ON

INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description])
VALUES (1, N'n',     N'Noun',      N'Danh t?')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description])
VALUES (2, N'v',     N'Verb',      N'Ð?ng t?')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description])
VALUES (3, N'adj',   N'Adjective', N'Tinh t?')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description])
VALUES (4, N'adv',   N'Adverb',    N'Tr?ng t?')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description])
VALUES (5, N'prep',  N'Preposition', N'Gioi t?')

SET IDENTITY_INSERT [dbo].[PartOfSpeeches] OFF
GO

-- ============================================================
-- 2. PERMISSIONS
-- ============================================================
SET IDENTITY_INSERT [dbo].[Permissions] ON

INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (1,  N'VIEW_DASHBOARD',         N'Xem dashboard')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (2,  N'MANAGE_WORDS',           N'Qu?n lý t? v?ng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (3,  N'MANAGE_QUESTIONS',       N'Qu?n lý câu h?i')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (4,  N'MANAGE_TESTS',           N'Qu?n lý bài thi')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (5,  N'MANAGE_USERS',           N'Qu?n lý ngu?i dùng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (6,  N'LEARN_VOCAB',            N'H?c t? v?ng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (7,  N'MANAGE_TOPIC_CATEGORIES', N'Qu?n lý danh m?c ch? d?')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (8,  N'ENROLL_TOPICS',          N'Ch?n / dang ký b? t? v?ng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (9,  N'MANAGE_NOTEBOOK',        N'Qu?n lý s? tay t? v?ng cá nhân')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (10, N'MANAGE_TOPICS',          N'Qu?n lý b? t? v?ng / ch? d?')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (11, N'MANAGE_MEDIA',           N'Qu?n lý t?p âm thanh và hình ?nh minh h?a')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (12, N'SUBMIT_CONTENT_REVIEW',  N'G?i n?i dung d? duy?t')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (13, N'REVIEW_CONTENT',         N'Duy?t / t? ch?i / luu tr? n?i dung')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (14, N'PUBLISH_OWN_CONTENT',    N'Xu?t b?n n?i dung do mình t?o')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (15, N'VIEW_CONTENT_ANALYTICS', N'Xem phân tích hi?u qu? n?i dung do mình t?o')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (16, N'VIEW_GLOBAL_ANALYTICS',  N'Xem phân tích toàn c?c')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (17, N'MANAGE_SYSTEM_SETTINGS', N'Qu?n lý c?u hình h? th?ng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (18, N'MANAGE_NOTIFICATIONS',   N'Qu?n lý thông báo và thông báo d?y')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (19, N'MANAGE_REPORTS',         N'Qu?n lý báo cáo và ph?n h?i t? ngu?i h?c')

SET IDENTITY_INSERT [dbo].[Permissions] OFF
GO

-- ============================================================
-- 3. ROLES
-- ============================================================
SET IDENTITY_INSERT [dbo].[Roles] ON

INSERT [dbo].[Roles] ([RoleID], [RoleName], [Description]) VALUES (1, N'Admin',          N'Qu?n tr? viên toàn quy?n')
INSERT [dbo].[Roles] ([RoleID], [RoleName], [Description]) VALUES (2, N'Learner',        N'Ngu?i h?c thu?ng')
INSERT [dbo].[Roles] ([RoleID], [RoleName], [Description]) VALUES (3, N'ContentCreator', N'Biên t?p viên / Giáo viên qu?n lý n?i dung h?c t?p')

SET IDENTITY_INSERT [dbo].[Roles] OFF
GO

-- ============================================================
-- 4. ROLE PERMISSIONS
-- ============================================================
-- Admin (RoleID=1): all permissions
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 1)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 2)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 3)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 4)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 5)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 6)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 7)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 8)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 9)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 10)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 11)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 12)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 13)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 14)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 15)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 16)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 17)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 18)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 19)
GO

-- Learner (RoleID=2): limited permissions
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (2, 1)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (2, 6)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (2, 8)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (2, 9)
GO

-- ContentCreator (RoleID=3): create & manage content
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 1)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 2)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 3)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 4)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 6)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 10)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 11)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 12)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 15)
GO

-- ============================================================
-- 5. TOPIC CATEGORIES
-- ============================================================
SET IDENTITY_INSERT [dbo].[TopicCategories] ON

INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt])
VALUES (1, N'TOEIC Business',    N'TOEIC_BUSINESS', N'T? v?ng TOEIC v? kinh doanh, thuong m?i, h?p d?ng', NULL, 1, 1, 1, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))

INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt])
VALUES (2, N'Daily Life',        N'DAILY_LIFE',    N'T? v?ng giao ti?p d?i s?ng h?ng ngày', NULL, 2, 1, 1, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))

INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt])
VALUES (3, N'Travel English',    N'TRAVEL_ENGLISH', N'T? v?ng du l?ch, sân bay, khách s?n, ch? du?ng', NULL, 3, 1, 1, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))

INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt])
VALUES (4, N'TOEIC Skills',      N'TOEIC_SKILLS',  N'T? v?ng và bài h?c theo k? nang TOEIC', NULL, 4, 1, 1, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))

INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt])
VALUES (5, N'Academic English',  N'ACADEMIC_ENGLISH', N'T? v?ng h?c thu?t, giáo d?c, nghiên c?u', NULL, 5, 1, 1, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))

INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt])
VALUES (6, N'Technology',        N'TECHNOLOGY',    N'T? v?ng công ngh?, ph?n m?m, internet, d? li?u', NULL, 6, 1, 1, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))

SET IDENTITY_INSERT [dbo].[TopicCategories] OFF
GO

-- ============================================================
-- 6. TOPICS
-- ============================================================
SET IDENTITY_INSERT [dbo].[Topics] ON

-- Topic 1: TOEIC Starter Core (Category: TOEIC Skills)
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (1, N'TOEIC Starter Core', N'T50', N'15 t? v?ng n?n t?ng quan tr?ng nh?t cho k? thi TOEIC', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), 4, N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

-- Topic 2: TOEIC Office & Meetings (Category: TOEIC Business)
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (2, N'TOEIC Office & Meetings', N'TOEIC-OFFICE-01', N'20 TOEIC words for office communication, meetings, schedules, and workplace reports.', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), 1, N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Topic 3: Daily Routines (Category: Daily Life)
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (3, N'Daily Routines & Activities', N'DAILY-ROUTINES-01', N'10 t? v?ng v? sinh ho?t h?ng ngày, thói quen và các ho?t d?ng thu?ng nh?t.', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), 2, N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))

-- Topic 4: Airport & Flight Travel (Category: Travel English)
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (4, N'Airport & Flight Travel', N'TRAVEL-AIRPORT-01', N'10 t? v?ng c?n thi?t v? sân bay, bay, hành lý và th? t?c du l?ch.', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), 3, N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))

-- Topic 5: Software & Office Technology (Category: Technology)
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (5, N'Software & Office Tech', N'TECH-SOFTWARE-01', N'10 t? v?ng công ngh? v? ph?n m?m, thi?t b? v?n phòng và công c? k? thu?t s?.', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), 6, N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))

-- Topic 6: Academic Study & Research (Category: Academic English)
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (6, N'Academic Study & Research', N'ACADEMIC-STUDY-01', N'10 t? v?ng h?c thu?t v? nghiên c?u, bài gi?ng, lu?n v?n và th? vi?n.', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), 5, N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))

SET IDENTITY_INSERT [dbo].[Topics] OFF
GO

-- ============================================================
-- 7. WORDS
-- ============================================================
SET IDENTITY_INSERT [dbo].[Words] ON

-- ===== TOPIC 1: TOEIC Starter Core (WordID 11-26, PartOfSpeech: 1=Noun, 2=Verb, 3=Adj) =====
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (11, N'Maintain', 2, N'B?o trì, duy trì', N'/me?n?te?n/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (12, N'Objective', 1, N'M?c tiêu', N'/?b?d??kt?v/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (13, N'Strategy', 1, N'Chi?n lu?c', N'/?stræt?d?i/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (14, N'Revenue', 1, N'Doanh thu', N'/?rev?nju?/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (15, N'Estimate', 2, N'U?c tính', N'/?est?me?t/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (16, N'Promote', 2, N'Th?c d?y, xúc ti?n', N'/pr??m??t/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (17, N'Efficient', 3, N'Hi?u qu?', N'/??f???nt/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (18, N'Purchase', 2, N'Mua, s?m', N'/?p??t??s/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (19, N'Approve', 2, N'Phê duy?t, ch?p thu?n', N'/??pru?v/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (20, N'Negotiate', 2, N'Ðàm phán', N'/n??ɡo???ie?t/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (21, N'Require', 2, N'Yêu c?u, dòi h?i', N'/r??kwa???r/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (22, N'Deadline', 1, N'H?n ch?t, th?i h?n', N'/?dedla?n/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

-- ===== TOPIC 2: TOEIC Office & Meetings (WordID 23-42) =====
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (23, N'Agenda', 1, N'Chuong trình ngh? s?, n?i dung cu?c h?p', N/??d??nd?/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (24, N'Appointment', 1, N'Cu?c h?n, l?ch h?n', N/??p??ntm?nt/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (25, N'Arrange', 2, N'S?p x?p, b? trí', N/??re?nd?/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (26, N'Attend', 2, N'Tham d?, có m?t', N/??tend/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (27, N'Brief', 3, N'Ng?n g?n; thông báo tóm t?t', N'/bri?f/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (28, N'Collaborate', 2, N'C?ng tác, h?p tác', N/k??læb?re?t/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (29, N'Confirm', 2, N'Xác nh?n', N/k?n?f??rm/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (30, N'Delegate', 2, N'Giao phó, ?y quy?n', N/?del??e?t/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (31, N'Discuss', 2, N'Th?o lu?n', N/d??sk?s/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (32, N'Extension', 1, N'S? gia h?n, máy nhánh n?i b?', N/?k?sten?n/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (33, N'Follow-up', 1, N'Vi?c ti?p t?c x? lý, theo dõi sau dó', N/?f?lo??p/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (34, N'Minutes', 1, N'Biên b?n cu?c h?p', N/?m?n?ts/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (35, N'Postpone', 2, N'Trì hoãn', N/p??sp??n/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (36, N'Proposal', 1, N'Ð? xu?t, b?n d? xu?t', N/pr??p??zl/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (37, N'Regarding', 5, N'V? vi?c, liên quan d?n', N/r??ɡ??rd??/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (38, N'Reschedule', 2, N'Ð?i l?ch, s?p x?p l?i l?ch', N/ri??sk?d?u?l/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (39, N'Summarize', 2, N'Tóm t?t', N/?s?m?ra?z/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (40, N'Venue', 1, N'Ð?a di?m t? ch?c', N/?venju?/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (41, N'Workflow', 1, N'Quy trình làm vi?c', N/?w??rkflo?/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (42, N'Invoice', 1, N'Hóa don', N/??nv??s/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- ===== TOPIC 3: Daily Routines & Activities (WordID 43-52) =====
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (43, N'Wake up', 2, N'Th?c d?y', N/?we?k ?p/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (44, N'Breakfast', 1, N'B?a sáng', N/?brekf?st/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (45, N'Commute', 2, N'Ði l?i hàng ngày (di làm)', N/k??mju?t/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (46, N'Grocery', 1, N'Hàng t?p hóa, th?c ph?m', N/?ɡro?s?ri/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (47, N'Exercise', 2, N'T?p th? d?c', N/?eks?rsa?z/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (48, N'Relax', 2, N'Thu giãn', N/r??læks/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (49, N'Household', 3, N'Thu?c v? gia ình, n?i tr?', N/?ha?sho?ld/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (50, N'Leisure', 1, N'Th?i gian r?nh, gi?i trí', N/?le???r/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (51, N'Laundry', 1, N'Vi?c gi?t gi?', N/?l??ndri/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (52, N'Socialize', 2, N'Giao l?u, g?p g? b?n bè', N/?so???la?z/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))

-- ===== TOPIC 4: Airport & Flight Travel (WordID 53-62) =====
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (53, N'Departure', 1, N'S? kh?i hành, chuy?n bay di', N/d??p??rt???r/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (54, N'Arrival', 1, N'S? d?n nói', N/??ra?v?l/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (55, N'Luggage', 1, N'Hành lý', N/?l???d?/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (56, N'Boarding pass', 1, N'Th? lên máy bay', N/?b??rd?? pæs/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (57, N'Check-in', 1, N'Th? t?c làm th? lên máy bay', N/?t?ek ?n/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (58, N'Delay', 2, N'Hoãn, tr? (chuy?n bay)', N/d??le?/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (59, N'Reservation', 1, N'Ð?t ch? tr?c', N/?rez?r?ve???n/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (60, N'Customs', 1, N'H?i quan', N/?k?st?mz/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (61, N'Itinerary', 1, N'L?ch trình', N/a??t?n?reri/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (62, N'Terminal', 1, N'Nhà ga, b?n (sân bay)', N/?t??rm?nl/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))

-- ===== TOPIC 5: Software & Office Technology (WordID 63-72) =====
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (63, N'Software', 1, N'Ph?n m?m', N/?s??ftwer/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (64, N'Database', 1, N'C? s? d? li?u', N/?de?t?be?s/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (65, N'Update', 2, N'C?p nh?t', N/?p?de?t/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (66, N'Install', 2, N'Cài d?t', N/?n?st??l/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (67, N'Backup', 1, N'Sao l?u', N/?bæk?p/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (68, N'Network', 1, N'M?ng lu?i', N/?netw??rk/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (69, N'Download', 2, N'T?i xu?ng', N/?da?nlo?d/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (70, N'Configuration', 1, N'C?u hình', N/k?n?f?ɡj??re???n/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (71, N'Encryption', 1, N'S? mã hóa', N/?n?kr?p?n/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (72, N'Interface', 1, N'Giao di?n', N/??nt?rfe?s/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))

-- ===== TOPIC 6: Academic Study & Research (WordID 73-82) =====
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (73, N'Research', 1, N'Nghiên c?u', N/r??s??rt?/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (74, N'Lecture', 1, N'Bài gi?ng', N/?lekt???r/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (75, N'Assignment', 1, N'Bài t?p, bài t?p l?n', N/??sa?nm?nt/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (76, N'Curriculum', 1, N'Chuong trình gi?ng d?y', N/k??r?kj?l?m/', NULL, NULL, NULL, 3, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (77, N'Graduate', 2, N'T?t nghi?p', N/?ɡræd?ue?t/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (78, N'Scholarship', 1, N'H?c b?ng', N/?sk?l?r??p/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (79, N'Thesis', 1, N'Lu?n v?n, lu?n án', N/?θi?s?s/', NULL, NULL, NULL, 3, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (80, N'Enroll', 2, N'Ðang ký h?c', N/?n?ro?l/', NULL, NULL, NULL, 1, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (81, N'Reference', 1, N'Tài li?u tham kh?o', N/?ref?r?ns/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (82, N'Tuition', 1, N'H?c phí', N/tju???n/', NULL, NULL, NULL, 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))

SET IDENTITY_INSERT [dbo].[Words] OFF
GO

-- ============================================================
-- 8. WORD-TOPIC MAPPINGS
-- ============================================================
-- Topic 1: TOEIC Starter Core (WordID 11-22)
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (11, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (12, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (13, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (14, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (15, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (16, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (17, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (18, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (19, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (20, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (21, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (22, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

-- Topic 2: TOEIC Office & Meetings (WordID 23-42)
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (23, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (24, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (25, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (26, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (27, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (28, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (29, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (30, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (31, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (32, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (33, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (34, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (35, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (36, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (37, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (38, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (39, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (40, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (41, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (42, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Topic 3: Daily Routines (WordID 43-52)
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (43, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (44, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (45, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (46, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (47, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (48, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (49, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (50, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (51, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (52, 3, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))

-- Topic 4: Airport & Flight Travel (WordID 53-62)
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (53, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (54, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (55, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (56, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (57, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (58, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (59, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (60, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (61, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (62, 4, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))

-- Topic 5: Software & Office Technology (WordID 63-72)
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (63, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (64, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (65, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (66, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (67, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (68, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (69, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (70, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (71, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (72, 5, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))

-- Topic 6: Academic Study & Research (WordID 73-82)
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (73, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (74, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (75, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (76, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (77, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (78, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (79, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (80, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (81, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (82, 6, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
GO

-- ============================================================
-- 9. EXAMPLE SENTENCES
-- ============================================================
SET IDENTITY_INSERT [dbo].[ExampleSentences] ON

-- Word 11: Maintain
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (1, 11, N'The company needs to maintain high standards of quality.', N'Công ty c?n duy trì tiêu chu?n ch?t lu?ng cao.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 12: Objective
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (2, 12, N'Our main objective is to increase market share.', N'M?c tiêu chính c?a chúng tôi là tang th? ph?n.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 13: Strategy
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (3, 13, N'The board approved the new marketing strategy.', N'H?i d?ng qu?n tr? da phê duy?t chi?n lu?c ti?p th? m?i.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 14: Revenue
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (4, 14, N'The company reported a 20% increase in revenue.', N'Công ty da báo cáo doanh thu tang 20%.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 15: Estimate
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (5, 15, N'We estimate the project will take six months.', N'Chúng tôi u?c tính d? án s? m?t sáu tháng.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 16: Promote
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (6, 16, N'The company plans to promote its new product line.', N'Công ty d? d?nh xúc ti?n dòng s?n ph?m m?i.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 17: Efficient
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (7, 17, N'The new system is more efficient than the old one.', N'H? th?ng m?i hi?u qu? hon h? th?ng cu.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 18: Purchase
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (8, 18, N'We need to purchase new equipment for the office.', N'Chúng tôi c?n mua thi?t b? m?i cho v?n phòng.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 19: Approve
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (9, 19, N'The manager must approve the budget before we proceed.', N'Ngu?i qu?n lý ph?i phê duy?t ngân sách tru?c khi chúng tôi ti?n hành.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 20: Negotiate
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (10, 20, N'They are negotiating the terms of the contract.', N'H? dang dàm phán các di?u kho?n c?a h?p d?ng.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 21: Require
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (11, 21, N'The job requires excellent communication skills.', N'Công vi?c yêu c?u k? nang giao ti?p xu?t s?c.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 22: Deadline
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (12, 22, N'The deadline for the report is next Friday.', N'H?n ch?t n?p báo cáo là th? Sáu t?i.', NULL, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

-- Word 23: Agenda
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (13, 23, N'The manager sent the meeting agenda yesterday.', N'Ngu?i qu?n lý da g?i chuong trình cu?c h?p vào hôm qua.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 24: Appointment
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (14, 24, N'I have an appointment with the client at 10 a.m.', N'Tôi có l?ch h?n v?i khách hàng lúc 10 gi? sáng.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 25: Arrange
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (15, 25, N'Please arrange a conference room for the interview.', N'Vui lòng s?p x?p phòng h?p cho bu?i ph?ng v?n.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 26: Attend
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (16, 26, N'All team members are expected to attend the training.', N'T?t c? thành viên nhóm du?c yêu c?u tham d? bu?i dào t?o.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 27: Brief
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (17, 27, N'The director gave a brief update on sales.', N'Giám d?c dua ra c?p nh?t ng?n g?n v? doanh s?.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 28: Collaborate
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (18, 28, N'Two departments will collaborate on the new campaign.', N'Hai phòng ban s? h?p tác trong chi?n d?ch m?i.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 29: Confirm
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (19, 29, N'Please confirm your attendance by Friday.', N'Vui lòng xác nh?n vi?c tham d? tru?c th? Sáu.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 30: Delegate
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (20, 30, N'The supervisor will delegate tasks to the assistants.', N'Giám sát viên s? giao vi?c cho các tr? lý.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 31: Discuss
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (21, 31, N'We need to discuss the budget before approval.', N'Chúng ta c?n th?o lu?n ngân sách tru?c khi phê duy?t.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 32: Extension
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (22, 32, N'She requested an extension for the project deadline.', N'Cô ?y yêu c?u gia h?n th?i h?n d? án.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 33: Follow-up
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (23, 33, N'The follow-up email included the final schedule.', N'Email theo dõi sau dó có kèm l?ch trình cu?i cùng.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 34: Minutes
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (24, 34, N'The assistant prepared the minutes after the meeting.', N'Tr? lý da chu?n b? biên b?n sau cu?c h?p.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 35: Postpone
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (25, 35, N'They decided to postpone the presentation until Thursday.', N'H? quy?t d?nh hoãn bài thuy?t trình d?n th? N?m.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 36: Proposal
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (26, 36, N'The proposal was reviewed by senior management.', N'B?n d? xu?t da du?c ban qu?n lý c?p cao xem xét.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 37: Regarding
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (27, 37, N'I am calling regarding your recent invoice.', N'Tôi g?i v? hóa don g?n dây c?a b?n.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 38: Reschedule
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (28, 38, N'We had to reschedule the supplier meeting.', N'Chúng tôi da ph?i d?i l?ch h?p v?i nhà cung c?p.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 39: Summarize
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (29, 39, N'Could you summarize the main points of the report?', N'B?n có th? tóm t?t các ý chính c?a báo cáo không?', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 40: Venue
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (30, 40, N'The venue for the seminar is on the third floor.', N'Ð?a di?m t? ch?c h?i th?o nam ? t?ng ba.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 41: Workflow
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (31, 41, N'The new software improved the team workflow.', N'Ph?n m?m m?i da c?i thi?n quy trình làm vi?c c?a nhóm.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
-- Word 42: Invoice
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (32, 42, N'Please send the invoice by the end of the month.', N'Vui lòng g?i hóa don tru?c cu?i tháng.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 43: Wake up
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (33, 43, N'I wake up at 6 a.m. every morning.', N'Tôi th?c d?y lúc 6 gi? sáng m?i bu?i sáng.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 44: Breakfast
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (34, 44, N'She usually has toast and eggs for breakfast.', N'Cô ?y thu?ng an bánh mì nư?ng và tr?ng cho b?a sáng.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 45: Commute
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (35, 45, N'He commutes to work by train every day.', N'Anh ?y di làm b?ng tàu h?a m?i ngày.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 46: Grocery
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (36, 46, N'I need to buy some groceries for dinner.', N'Tôi c?n mua m?t ít th?c ph?m cho b?a t?i.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 47: Exercise
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (37, 47, N'She exercises at the gym three times a week.', N'Cô ?y t?p th? d?c ? phòng gym ba l?n m?t tu?n.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 48: Relax
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (38, 48, N'After work, I relax by watching TV.', N'Sau gi? làm vi?c, tôi thu giãn b?ng cách xem TV.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 49: Household
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (39, 49, N'They share the household chores equally.', N'H? chia s? công vi?c nhà m?t cách công b?ng.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 50: Leisure
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (40, 50, N'Reading is my favorite leisure activity.', N'Ð?c sách là ho?t d?ng gi?i trí yêu thích c?a tôi.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 51: Laundry
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (41, 51, N'I do the laundry on weekends.', N'Tôi gi?t gi? vào cu?i tu?n.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 52: Socialize
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (42, 52, N'We often socialize with colleagues after work.', N'Chúng tôi thu?ng giao l?u v?i d?ng nghi?p sau gi? làm.', NULL, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))

-- Word 53: Departure
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (43, 53, N'The departure lounge is very crowded today.', N'Phòng ch? kh?i hành r?t dông dúc hôm nay.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 54: Arrival
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (44, 54, N'Our arrival was delayed by two hours.', N'Chuy?n d?n c?a chúng tôi da b? tr? hai ti?ng.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 55: Luggage
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (45, 55, N'Please collect your luggage from carousel three.', N'Vui lòng nh?n hành lý c?a b?n t?i b?ng chuy?n s? ba.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 56: Boarding pass
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (46, 56, N'Please show your boarding pass at the gate.', N'Vui lòng xu?t th? lên máy bay t?i c?a.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 57: Check-in
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (47, 57, N'Online check-in saves a lot of time at the airport.', N'Làm th? tr?c tuy?n ti?t ki?m nhi?u th?i gian ? sân bay.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 58: Delay
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (48, 58, N'The flight was delayed due to bad weather.', N'Chuy?n bay da b? hoãn do th?i ti?t x?u.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 59: Reservation
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (49, 59, N'I have a reservation for two at the hotel.', N'Tôi có d?t ch? cho hai ngu?i t?i khách s?n.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 60: Customs
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (50, 60, N'You need to declare your goods at customs.', N'B?n c?n khai báo hàng hóa t?i h?i quan.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 61: Itinerary
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (51, 61, N'Please send me the travel itinerary by email.', N'Vui lòng g?i cho tôi l?ch trình du l?ch qua email.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 62: Terminal
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (52, 62, N'Our flight departs from terminal two.', N'Chuy?n bay c?a chúng tôi kh?i hành t? nhà ga s? hai.', NULL, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))

-- Word 63: Software
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (53, 63, N'We need to update our accounting software.', N'Chúng tôi c?n c?p nh?t ph?n m?m k? toán.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 64: Database
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (54, 64, N'The database contains all customer records.', N'C? s? d? li?u ch?a t?t c? h? s? khách hàng.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 65: Update
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (55, 65, N'Please update the spreadsheet with the latest figures.', N'Vui lòng c?p nh?t b?ng tính v?i s? li?u m?i nh?t.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 66: Install
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (56, 66, N'The IT team will install the new system tomorrow.', N'Ð?i CNTT s? cài d?t h? th?ng m?i vào ngày mai.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 67: Backup
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (57, 67, N'Always make a backup of your important files.', N'Luôn luôn sao l?u các t?p tin quan tr?ng c?a b?n.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 68: Network
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (58, 68, N'The office network is down for maintenance.', N'M?ng lu?i v?n phòng dang b? gián do?n d? b?o trì.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 69: Download
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (59, 69, N'You can download the report from our website.', N'B?n có th? t?i báo cáo t? trang web c?a chúng tôi.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 70: Configuration
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (60, 70, N'The system configuration needs to be adjusted.', N'C?u hình h? th?ng c?n du?c di?u ch?nh.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 71: Encryption
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (61, 71, N'All sensitive data is protected by encryption.', N'T?t c? d? li?u nh?y c?m du?c b?o v? b?ng mã hóa.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
-- Word 72: Interface
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (62, 72, N'The user interface should be intuitive and easy to use.', N'Giao di?n ngu?i dùng nên tru?c quan và d? s? d?ng.', NULL, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))

-- Word 73: Research
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (63, 73, N'She is conducting research on climate change.', N'Cô ?y dang ti?n hành nghiên c?u v? bi?n d?i khí h?u.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 74: Lecture
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (64, 74, N'The professor gave an interesting lecture on economics.', N'Giáo s? da có m?t bài gi?ng thú v? v? kinh t? h?c.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 75: Assignment
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (65, 75, N'The assignment is due next Monday.', N'Bài t?p ph?i n?p vào th? Hai t?i.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 76: Curriculum
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (66, 76, N'The curriculum includes both theory and practice.', N'Chuong trình gi?ng d?y bao g?m c? lý thuy?t và th?c hành.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 77: Graduate
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (67, 77, N'He graduated from university with honors.', N'Anh ?y t?t nghi?p d?i h?c v?i b?ng danh d?.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 78: Scholarship
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (68, 78, N'She won a scholarship to study abroad.', N'Cô ?y da giành du?c h?c b?ng d? di du h?c.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 79: Thesis
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (69, 79, N'She is writing her thesis on artificial intelligence.', N'Cô ?y dang vi?t lu?n v?n v? trí tu? nhân t?o.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 80: Enroll
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (70, 80, N'I want to enroll in the English course.', N'Tôi mu?n dang ký khóa h?c ti?ng Anh.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 81: Reference
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (71, 81, N'Please list your references at the end of the paper.', N'Vui lòng li?t kê tài li?u tham kh?o ? cu?i bài vi?t.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
-- Word 82: Tuition
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
VALUES (72, 82, N'The tuition fee for this course is $500.', N'H?c phí cho khóa h?c này là 500 dô la.', NULL, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))

SET IDENTITY_INSERT [dbo].[ExampleSentences] OFF
GO

-- ============================================================
-- 10. QUESTIONS
-- ============================================================
SET IDENTITY_INSERT [dbo].[Questions] ON

-- Topic 1: TOEIC Starter Core (QuestionID 1-24)
-- Word 11: Maintain
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (1, 11, N'MCQ', N'What does "Maintain" mean?', N'["B?o trì, duy trì","Xóa b?","Thay d?i","T?o m?i"]', N'B?o trì, duy trì', N'Maintain nghia là b?o trì ho?c duy trì.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (2, 11, N'FillBlank', N'The roads are well ______ed.', N'[]', N'maintain', N'Complete the sentence with the correct form of "Maintain".', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 12: Objective
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (3, 12, N'MCQ', N'What does "Objective" mean?', N'["M?c tiêu","V?n d?","Công vi?c","K?t qu?"]', N'M?c tiêu', N'Objective nghia là m?c tiêu.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (4, 12, N'FillBlank', N'Our main ______ is to increase sales.', N'[]', N'objective', N'Our main objective = m?c tiêu chính c?a chúng tôi.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 13: Strategy
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (5, 13, N'MCQ', N'What does "Strategy" mean?', N'["Chi?n lu?c","Ngân sách","Nhân viên","S?n ph?m"]', N'Chi?n lu?c', N'Strategy nghia là chi?n lu?c.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (6, 13, N'FillBlank', N'The board approved the new marketing ______.', N'[]', N'strategy', N'The new marketing strategy = chi?n lu?c ti?p th? m?i.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 14: Revenue
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (7, 14, N'MCQ', N'What does "Revenue" mean?', N'["Doanh thu","Chi phí","L?i nhu?n","Kho?n n?"]', N'Doanh thu', N'Revenue nghia là doanh thu.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (8, 14, N'FillBlank', N'The company reported a 20% increase in ______.', N'[]', N'revenue', N'Increase in revenue = tang doanh thu.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 15: Estimate
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (9, 15, N'MCQ', N'What does "Estimate" mean?', N'["U?c tính","Xác nh?n","Hoàn thành","B?t d?u"]', N'U?c tính', N'Estimate nghia là u?c tính.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (10, 15, N'FillBlank', N'We ______ the project will take six months.', N'[]', N'estimate', N'We estimate = chúng tôi u?c tính.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 16: Promote
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (11, 16, N'MCQ', N'What does "Promote" mean?', N'["Thúc d?y, xúc ti?n","Gi?m giá","K?t thúc","S?n xu?t"]', N'Thúc d?y, xúc ti?n', N'Promote nghia là thúc d?y ho?c xúc ti?n.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (12, 16, N'FillBlank', N'The company plans to ______ its new product.', N'[]', N'promote', N'Promote its new product = xúc ti?n s?n ph?m m?i.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 17: Efficient
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (13, 17, N'MCQ', N'What does "Efficient" mean?', N'["Hi?u qu?","Ch?m ch?p","T?n kém","Ph?c t?p"]', N'Hi?u qu?', N'Efficient nghia là hi?u qu?.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (14, 17, N'FillBlank', N'The new system is more ______ than the old one.', N'[]', N'efficient', N'More efficient = hi?u qu? hon.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 18: Purchase
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (15, 18, N'MCQ', N'What does "Purchase" mean?', N'["Mua, s?m","Bán","Thuê","M?n"]', N'Mua, s?m', N'Purchase nghia là mua ho?c s?m.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (16, 18, N'FillBlank', N'We need to ______ new equipment for the office.', N'[]', N'purchase', N'Purchase new equipment = mua thi?t b? m?i.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 19: Approve
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (17, 19, N'MCQ', N'What does "Approve" mean?', N'["Phê duy?t","T? ch?i","Xem xét","S?a d?i"]', N'Phê duy?t', N'Approve nghia là phê duy?t ho?c ch?p thu?n.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (18, 19, N'FillBlank', N'The manager must ______ the budget first.', N'[]', N'approve', N'Approve the budget = phê duy?t ngân sách.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 20: Negotiate
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (19, 20, N'MCQ', N'What does "Negotiate" mean?', N'["Ðàm phán","Ký k?t","Tranh lu?n","Nh?n xét"]', N'Ðàm phán', N'Negotiate nghia là dàm phán.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (20, 20, N'FillBlank', N'They are ______ing the terms of the contract.', N'[]', N'negotiate', N'Negotiating the terms = dàm phán di?u kho?n.', 2, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 21: Require
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (21, 21, N'MCQ', N'What does "Require" mean?', N'["Yêu c?u","Cho phép","Ð? ngh?","H? tr?"]', N'Yêu c?u', N'Require nghia là yêu c?u ho?c dòi h?i.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (22, 21, N'FillBlank', N'The job ______s excellent communication skills.', N'[]', N'require', N'The job requires = công vi?c yêu c?u.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
-- Word 22: Deadline
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (23, 22, N'MCQ', N'What does "Deadline" mean?', N'["H?n ch?t","Cu?c h?p","Báo cáo","L?ch trình"]', N'H?n ch?t', N'Deadline nghia là h?n ch?t ho?c th?i h?n.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (24, 22, N'FillBlank', N'The ______ for the report is next Friday.', N'[]', N'deadline', N'The deadline for the report = h?n ch?t n?p báo cáo.', 1, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

-- Topic 2: TOEIC Office & Meetings (QuestionID 25-64, WordID 23-42)
-- Word 23: Agenda
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (25, 23, N'MCQ', N'What does "agenda" mean in Vietnamese?', N'["Chuong trình ngh? s?","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Chuong trình ngh? s?', N'Agenda = chuong trình ngh? s? ho?c n?i dung cu?c h?p.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (26, 23, N'FillBlank', N'The manager sent the meeting ______ yesterday.', N'[]', N'agenda', N'Meeting agenda = n?i dung cu?c h?p.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 24: Appointment
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (27, 24, N'MCQ', N'What does "appointment" mean in Vietnamese?', N'["Cu?c h?n, l?ch h?n","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Cu?c h?n, l?ch h?n', N'Appointment = cu?c h?n ho?c l?ch h?n.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (28, 24, N'FillBlank', N'I have an ______ with the client at 10 a.m.', N'[]', N'appointment', N'Appointment with the client = l?ch h?n v?i khách hàng.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 25: Arrange
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (29, 25, N'MCQ', N'What does "arrange" mean in Vietnamese?', N'["S?p x?p, b? trí","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'S?p x?p, b? trí', N'Arrange = s?p x?p ho?c b? trí.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (30, 25, N'FillBlank', N'Please ______ a conference room for the interview.', N'[]', N'arrange', N'Arrange a conference room = s?p x?p phòng h?p.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 26: Attend
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (31, 26, N'MCQ', N'What does "attend" mean in Vietnamese?', N'["Tham d?, có m?t","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Tham d?, có m?t', N'Attend = tham d? ho?c có m?t.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (32, 26, N'FillBlank', N'All team members are expected to ______ the training.', N'[]', N'attend', N'Attend the training = tham d? dào t?o.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 27: Brief
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (33, 27, N'MCQ', N'What does "brief" mean in Vietnamese?', N'["Ng?n g?n; thông báo tóm t?t","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Ng?n g?n; thông báo tóm t?t', N'Brief = ng?n g?n ho?c thông báo tóm t?t.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (34, 27, N'FillBlank', N'The director gave a ______ update on sales.', N'[]', N'brief', N'A brief update = c?p nh?t ng?n g?n.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 28: Collaborate
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (35, 28, N'MCQ', N'What does "collaborate" mean in Vietnamese?', N'["C?ng tác, h?p tác","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'C?ng tác, h?p tác', N'Collaborate = c?ng tác ho?c h?p tác.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (36, 28, N'FillBlank', N'Two departments will ______ on the new campaign.', N'[]', N'collaborate', N'Collaborate on the campaign = h?p tác trong chi?n d?ch.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 29: Confirm
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (37, 29, N'MCQ', N'What does "confirm" mean in Vietnamese?', N'["Xác nh?n","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Xác nh?n', N'Confirm = xác nh?n.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (38, 29, N'FillBlank', N'Please ______ your attendance by Friday.', N'[]', N'confirm', N'Confirm your attendance = xác nh?n tham d?.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 30: Delegate
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (39, 30, N'MCQ', N'What does "delegate" mean in Vietnamese?', N'["Giao phó, ?y quy?n","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Giao phó, ?y quy?n', N'Delegate = giao phó ho?c ?y quy?n.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (40, 30, N'FillBlank', N'The supervisor will ______ tasks to the assistants.', N'[]', N'delegate', N'Delegate tasks = giao vi?c.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 31: Discuss
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (41, 31, N'MCQ', N'What does "discuss" mean in Vietnamese?', N'["Th?o lu?n","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Th?o lu?n', N'Discuss = th?o lu?n.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (42, 31, N'FillBlank', N'We need to ______ the budget before approval.', N'[]', N'discuss', N'Discuss the budget = th?o lu?n ngân sách.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 32: Extension
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (43, 32, N'MCQ', N'What does "extension" mean in Vietnamese?', N'["S? gia h?n, máy nhánh n?i b?","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'S? gia h?n, máy nhánh n?i b?', N'Extension = s? gia h?n ho?c máy nhánh.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (44, 32, N'FillBlank', N'She requested an ______ for the project deadline.', N'[]', N'extension', N'Request an extension = yêu c?u gia h?n.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 33: Follow-up
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (45, 33, N'MCQ', N'What does "follow-up" mean in Vietnamese?', N'["Vi?c ti?p t?c x? lý, theo dõi sau dó","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Vi?c ti?p t?c x? lý, theo dõi sau dó', N'Follow-up = theo dõi ho?c x? lý ti?p.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (46, 33, N'FillBlank', N'The ______ email included the final schedule.', N'[]', N'follow-up', N'Follow-up email = email theo dõi.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 34: Minutes
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (47, 34, N'MCQ', N'What does "minutes" mean in Vietnamese?', N'["Biên b?n cu?c h?p","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Biên b?n cu?c h?p', N'Minutes = biên b?n cu?c h?p (nghia d?c bi?t).', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (48, 34, N'FillBlank', N'The assistant prepared the ______ after the meeting.', N'[]', N'minutes', N'Minutes of the meeting = biên b?n cu?c h?p.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 35: Postpone
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (49, 35, N'MCQ', N'What does "postpone" mean in Vietnamese?', N'["Trì hoãn","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Trì hoãn', N'Postpone = trì hoãn.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (50, 35, N'FillBlank', N'They decided to ______ the presentation until Thursday.', N'[]', N'postpone', N'Postpone the presentation = trì hoãn bài thuy?t trình.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 36: Proposal
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (51, 36, N'MCQ', N'What does "proposal" mean in Vietnamese?', N'["Ð? xu?t, b?n d? xu?t","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Ð? xu?t, b?n d? xu?t', N'Proposal = d? xu?t ho?c b?n d? xu?t.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (52, 36, N'FillBlank', N'The ______ was reviewed by senior management.', N'[]', N'proposal', N'The proposal was reviewed = d? xu?t du?c xem xét.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 37: Regarding
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (53, 37, N'MCQ', N'What does "regarding" mean in Vietnamese?', N'["V? vi?c, liên quan d?n","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'V? vi?c, liên quan d?n', N'Regarding = v? vi?c ho?c liên quan d?n.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (54, 37, N'FillBlank', N'I am calling ______ your recent invoice.', N'[]', N'regarding', N'Regarding your invoice = liên quan d?n hóa don c?a b?n.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 38: Reschedule
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (55, 38, N'MCQ', N'What does "reschedule" mean in Vietnamese?', N'["Ð?i l?ch, s?p x?p l?i l?ch","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Ð?i l?ch, s?p x?p l?i l?ch', N'Reschedule = d?i l?ch ho?c s?p x?p l?i.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (56, 38, N'FillBlank', N'We had to ______ the supplier meeting.', N'[]', N'reschedule', N'Reschedule the meeting = d?i l?ch h?p.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 39: Summarize
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (57, 39, N'MCQ', N'What does "summarize" mean in Vietnamese?', N'["Tóm t?t","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Tóm t?t', N'Summarize = tóm t?t.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (58, 39, N'FillBlank', N'Could you ______ the main points of the report?', N'[]', N'summarize', N'Summarize the points = tóm t?t các ý.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 40: Venue
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (59, 40, N'MCQ', N'What does "venue" mean in Vietnamese?', N'["Ð?a di?m t? ch?c","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Ð?a di?m t? ch?c', N'Venue = d?a di?m t? ch?c.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (60, 40, N'FillBlank', N'The ______ for the seminar is on the third floor.', N'[]', N'venue', N'The venue for the seminar = d?a di?m h?i th?o.', 1, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 41: Workflow
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (61, 41, N'MCQ', N'What does "workflow" mean in Vietnamese?', N'["Quy trình làm vi?c","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Quy trình làm vi?c', N'Workflow = quy trình làm vi?c.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (62, 41, N'FillBlank', N'The new software improved the team ______.', N'[]', N'workflow', N'Improved the workflow = c?i thi?n quy trình.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Word 42: Invoice
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (63, 42, N'MCQ', N'What does "invoice" mean in Vietnamese?', N'["Hóa don","Khách hàng ti?m nang","Hóa don da thanh toán","Thi?t b? v?n phòng"]', N'Hóa don', N'Invoice = hóa don.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (64, 42, N'FillBlank', N'Please send the ______ by the end of the month.', N'[]', N'invoice', N'Send the invoice = g?i hóa don.', 2, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

-- Topic 3: Daily Routines - representative questions (WordID 43-52)
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (65, 43, N'MCQ', N'What does "wake up" mean in Vietnamese?', N'["Th?c d?y","Di ng?","N?u an","Di làm"]', N'Th?c d?y', N'Wake up = th?c d?y.', 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (66, 43, N'FillBlank', N'I ______ up at 6 a.m. every morning.', N'[]', N'wake', N'Wake up = th?c d?y.', 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (67, 45, N'MCQ', N'What does "commute" mean in Vietnamese?', N'["Di l?i hàng ngày","N?u an","Mua s?m","H?c t?p"]', N'Di l?i hàng ngày', N'Commute = di l?i hàng ngày (di làm).', 2, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (68, 45, N'FillBlank', N'He ______s to work by train every day.', N'[]', N'commute', N'Commutes to work = di làm b?ng tàu.', 2, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (69, 48, N'MCQ', N'What does "relax" mean in Vietnamese?', N'["Thu giãn","Làm vi?c","H?c t?p","Di chuy?n"]', N'Thu giãn', N'Relax = thu giãn.', 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (70, 48, N'FillBlank', N'After work, I like to ______ by watching TV.', N'[]', N'relax', N'Relax by watching TV = thu giãn b?ng cách xem TV.', 1, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))

-- Topic 4: Airport & Flight - representative questions (WordID 53-62)
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (71, 53, N'MCQ', N'What does "departure" mean in Vietnamese?', N'["Kh?i hành","D?n nói","Quá c?nh","H?i quan"]', N'Kh?i hành', N'Departure = s? kh?i hành.', 2, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (72, 53, N'FillBlank', N'The ______ lounge is very crowded today.', N'[]', N'departure', N'Departure lounge = phòng ch? kh?i hành.', 2, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (73, 55, N'MCQ', N'What does "luggage" mean in Vietnamese?', N'["Hành lý","Vé máy bay","H? chi?u","Th? lên máy bay"]', N'Hành lý', N'Luggage = hành lý.', 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (74, 55, N'FillBlank', N'Please collect your ______ from carousel three.', N'[]', N'luggage', N'Collect your luggage = nh?n hành lý.', 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (75, 58, N'MCQ', N'What does "delay" mean in Vietnamese?', N'["Hoãn, tr?","Nhanh","Dúng gi?","H?y"]', N'Hoãn, tr?', N'Delay = hoãn ho?c tr?.', 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (76, 58, N'FillBlank', N'The flight was ______ed due to bad weather.', N'[]', N'delay', N'Delayed due to weather = b? hoãn do th?i ti?t.', 1, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))

-- Topic 5: Software & Office Technology - representative questions (WordID 63-72)
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (77, 63, N'MCQ', N'What does "software" mean in Vietnamese?', N'["Ph?n m?m","Ph?n c?ng","M?ng lu?i","C? s? d? li?u"]', N'Ph?n m?m', N'Software = ph?n m?m.', 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (78, 63, N'FillBlank', N'We need to update our accounting ______.', N'[]', N'software', N'Accounting software = ph?n m?m k? toán.', 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (79, 66, N'MCQ', N'What does "install" mean in Vietnamese?', N'["Cài d?t","G? b?","S?a ch?a","C?p nh?t"]', N'Cài d?t', N'Install = cài d?t.', 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (80, 66, N'FillBlank', N'The IT team will ______ the new system tomorrow.', N'[]', N'install', N'Install the new system = cài d?t h? th?ng m?i.', 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (81, 67, N'MCQ', N'What does "backup" mean in Vietnamese?', N'["Sao l?u","Xóa","Nén","M? khóa"]', N'Sao l?u', N'Backup = sao l?u.', 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (82, 67, N'FillBlank', N'Make a ______ of your important files.', N'[]', N'backup', N'Make a backup = t?o sao l?u.', 1, 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))

-- Topic 6: Academic Study & Research - representative questions (WordID 73-82)
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (83, 73, N'MCQ', N'What does "research" mean in Vietnamese?', N'["Nghiên c?u","Bài gi?ng","H?c phí","Th? vi?n"]', N'Nghiên c?u', N'Research = nghiên c?u.', 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (84, 73, N'FillBlank', N'She is conducting ______ on climate change.', N'[]', N'research', N'Conducting research = ti?n hành nghiên c?u.', 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (85, 75, N'MCQ', N'What does "assignment" mean in Vietnamese?', N'["Bài t?p","K? thi","H?c k?","Tín ch?"]', N'Bài t?p', N'Assignment = bài t?p ho?c bài t?p l?n.', 1, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (86, 75, N'FillBlank', N'The ______ is due next Monday.', N'[]', N'assignment', N'The assignment is due = bài t?p ph?i n?p.', 1, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (87, 78, N'MCQ', N'What does "scholarship" mean in Vietnamese?', N'["H?c b?ng","H?c phí","B?ng d?i h?c","Khóa h?c"]', N'H?c b?ng', N'Scholarship = h?c b?ng.', 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (88, 78, N'FillBlank', N'She won a ______ to study abroad.', N'[]', N'scholarship', N'Won a scholarship = giành h?c b?ng.', 2, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (89, 80, N'MCQ', N'What does "enroll" mean in Vietnamese?', N'["Ðang ký h?c","T?t nghi?p","Gi?ng d?y","Thi c?"]', N'Ðang ký h?c', N'Enroll = dang ký h?c.', 1, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (90, 80, N'FillBlank', N'I want to ______ in the English course.', N'[]', N'enroll', N'Enroll in the course = dang ký khóa h?c.', 1, 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))

SET IDENTITY_INSERT [dbo].[Questions] OFF
GO

-- ============================================================
-- 11. MINI TESTS
-- ============================================================
SET IDENTITY_INSERT [dbo].[MiniTests] ON

INSERT [dbo].[MiniTests] ([MiniTestID], [TopicID], [TestTitle], [Description], [CreatedByUserID], [TotalQuestions], [IsPublished], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (1, 1, N'TOEIC Starter Quiz', N'Bài ki?m tra nhanh 10 câu v? t? v?ng TOEIC co b?n.', 1, 10, 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset))

INSERT [dbo].[MiniTests] ([MiniTestID], [TopicID], [TestTitle], [Description], [CreatedByUserID], [TotalQuestions], [IsPublished], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (2, 2, N'Office Communication Test', N'Bài ki?m tra 10 câu v? t? v?ng giao ti?p v?n phòng và cu?c h?p.', 1, 10, 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))

INSERT [dbo].[MiniTests] ([MiniTestID], [TopicID], [TestTitle], [Description], [CreatedByUserID], [TotalQuestions], [IsPublished], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (3, 3, N'Daily Routines Quiz', N'Bài ki?m tra nhanh v? t? v?ng sinh ho?t hàng ngày.', 1, 5, 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))

INSERT [dbo].[MiniTests] ([MiniTestID], [TopicID], [TestTitle], [Description], [CreatedByUserID], [TotalQuestions], [IsPublished], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt])
VALUES (4, 4, N'Airport Travel Test', N'Bài ki?m tra 5 câu v? t? v?ng sân bay và du l?ch.', 1, 5, 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))

SET IDENTITY_INSERT [dbo].[MiniTests] OFF
GO

-- ============================================================
-- 12. MINI TEST ITEMS
-- ============================================================
-- MiniTest 1: TOEIC Starter Quiz (10 questions from Topic 1)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 1, 1)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 2, 2)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 3, 3)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 5, 4)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 7, 5)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 11, 6)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 13, 7)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 15, 8)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 17, 9)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (1, 23, 10)

-- MiniTest 2: Office Communication Test (10 questions from Topic 2)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 25, 1)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 27, 2)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 29, 3)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 31, 4)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 35, 5)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 37, 6)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 41, 7)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 47, 8)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 49, 9)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (2, 51, 10)

-- MiniTest 3: Daily Routines Quiz (5 questions)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (3, 65, 1)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (3, 66, 2)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (3, 67, 3)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (3, 69, 4)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (3, 70, 5)

-- MiniTest 4: Airport Travel Test (5 questions)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (4, 71, 1)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (4, 73, 2)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (4, 74, 3)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (4, 75, 4)
INSERT [dbo].[MiniTestItems] ([MiniTestID], [QuestionID], [DisplayOrder]) VALUES (4, 76, 5)
GO

-- ============================================================
-- SEED COMPLETE
-- ============================================================
-- Tables NOT seeded (seed separately): Users, UserTopicEnrollments,
--   UserWordProgress, ExerciseAttempts, MiniTestAttempts,
--   UserVocabularyNotebook, AdminAuditLogs, ContentReports,
--   ContentReviewLogs, MediaAssets, ContentMediaLinks
--
-- Remember: Topics, Words, Questions, MiniTests reference
-- UserID = 1 as CreatedByUserID. Ensure your admin user
-- has UserID = 1 before running this seed.
-- ============================================================
GO
