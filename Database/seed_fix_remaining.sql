-- ============================================================
-- FIX: Bổ sung dữ liệu còn thiếu sau seed lần 1
-- ============================================================

DECLARE @Now DateTimeOffset = SYSDATETIMEOFFSET();
DECLARE @AdminUserId BIGINT = 8;
DECLARE @CreatorUserId BIGINT = 9;
DECLARE @LearnerUserId1 BIGINT = 2;
DECLARE @LearnerUserId2 BIGINT = 10;

PRINT '=== FIXING REMAINING DATA ISSUES ===';
PRINT '';

-- ============================================================
-- 1. FIX MEDIAASSETS — Insert audio files (IDs 1-10) if missing
-- ============================================================
PRINT '>>> 1. Fixing MediaAssets (audio files)...';

IF NOT EXISTS (SELECT 1 FROM MediaAssets WHERE MediaAssetID = 1)
BEGIN
    SET IDENTITY_INSERT [dbo].[MediaAssets] ON;

    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (1, @AdminUserId, N'AudioUK', N'/media/audio/maintain-uk.mp3', N'maintain-uk.mp3', N'audio/mpeg', 24576, N'UK pronunciation of Maintain', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (2, @AdminUserId, N'AudioUK', N'/media/audio/revenue-uk.mp3', N'revenue-uk.mp3', N'audio/mpeg', 22528, N'UK pronunciation of Revenue', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (3, @AdminUserId, N'AudioUK', N'/media/audio/agenda-uk.mp3', N'agenda-uk.mp3', N'audio/mpeg', 21504, N'UK pronunciation of Agenda', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (4, @AdminUserId, N'AudioUK', N'/media/audio/confirm-uk.mp3', N'confirm-uk.mp3', N'audio/mpeg', 23552, N'UK pronunciation of Confirm', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (5, @AdminUserId, N'AudioUS', N'/media/audio/negotiate-us.mp3', N'negotiate-us.mp3', N'audio/mpeg', 25600, N'US pronunciation of Negotiate', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (6, @AdminUserId, N'AudioUS', N'/media/audio/proposal-us.mp3', N'proposal-us.mp3', N'audio/mpeg', 24576, N'US pronunciation of Proposal', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (7, @AdminUserId, N'AudioUK', N'/media/audio/commute-uk.mp3', N'commute-uk.mp3', N'audio/mpeg', 22528, N'UK pronunciation of Commute', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (8, @AdminUserId, N'AudioUK', N'/media/audio/departure-uk.mp3', N'departure-uk.mp3', N'audio/mpeg', 25600, N'UK pronunciation of Departure', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (9, @AdminUserId, N'AudioUK', N'/media/audio/software-uk.mp3', N'software-uk.mp3', N'audio/mpeg', 21504, N'UK pronunciation of Software', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (10, @AdminUserId, N'AudioUK', N'/media/audio/research-uk.mp3', N'research-uk.mp3', N'audio/mpeg', 23552, N'UK pronunciation of Research', NULL, @Now);

    SET IDENTITY_INSERT [dbo].[MediaAssets] OFF;
    PRINT '   -> Đã thêm 10 audio MediaAssets (IDs 1-10)';
END
ELSE
BEGIN
    PRINT '   -> MediaAssets audio đã tồn tại, bỏ qua.';
END

-- ============================================================
-- 2. FIX CONTENTMEDIALINKS — Insert if missing
-- ============================================================
PRINT '>>> 2. Fixing ContentMediaLinks...';

IF NOT EXISTS (SELECT 1 FROM ContentMediaLinks WHERE ContentMediaLinkID = 1)
BEGIN
    SET IDENTITY_INSERT [dbo].[ContentMediaLinks] ON;

    -- Audio links (MediaAssetID 1-10 -> WordID 11,14,23,29,20,36,45,53,63,73)
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (1, 1, N'Word', 11, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (2, 2, N'Word', 14, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (3, 3, N'Word', 23, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (4, 4, N'Word', 29, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (5, 5, N'Word', 20, N'AudioUS', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (6, 6, N'Word', 36, N'AudioUS', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (7, 7, N'Word', 45, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (8, 8, N'Word', 53, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (9, 9, N'Word', 63, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (10, 10, N'Word', 73, N'AudioUK', 1);

    -- Image links (MediaAssetID 11-15 -> multiple words)
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (11, 11, N'Word', 23, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (12, 11, N'Word', 24, N'Illustration', 2);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (13, 12, N'Word', 53, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (14, 12, N'Word', 57, N'Illustration', 2);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (15, 13, N'Word', 63, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (16, 13, N'Word', 66, N'Illustration', 2);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (17, 14, N'Word', 43, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (18, 14, N'Word', 44, N'Illustration', 2);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (19, 15, N'Word', 73, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder]) VALUES (20, 15, N'Word', 74, N'Illustration', 2);

    SET IDENTITY_INSERT [dbo].[ContentMediaLinks] OFF;
    PRINT '   -> Đã thêm 20 ContentMediaLinks';
END
ELSE
BEGIN
    PRINT '   -> ContentMediaLinks đã tồn tại, bỏ qua.';
END

-- ============================================================
-- 3. FIX CONTENTREPORTS — Fix ReportType and Priority values
--    CHECK constraints: 
--      ReportType: 'Other','Typo','AnswerIncorrect','AudioIssue','WordIncorrect'
--      Priority: 'Urgent','High','Normal','Low'
-- ============================================================
PRINT '>>> 3. Fixing ContentReports...';

IF NOT EXISTS (SELECT 1 FROM ContentReports WHERE ContentReportID = 2)
BEGIN
    SET IDENTITY_INSERT [dbo].[ContentReports] ON;

    INSERT [dbo].[ContentReports] ([ContentReportID], [ReporterUserID], [EntityType], [WordID], [QuestionID], [ReportType], [Title], [Description], [Status], [Priority], [AdminResponse], [ResolvedByUserID], [ResolvedAt], [CreatedAt], [UpdatedAt])
    VALUES (2, @LearnerUserId1, N'Question', 15, 5, N'Typo', N'Sai chính tả trong câu hỏi', N'Câu hỏi số 5 có lỗi chính tả', N'Open', N'Low', NULL, NULL, NULL, DATEADD(DAY, -2, @Now), DATEADD(DAY, -2, @Now));

    INSERT [dbo].[ContentReports] ([ContentReportID], [ReporterUserID], [EntityType], [WordID], [QuestionID], [ReportType], [Title], [Description], [Status], [Priority], [AdminResponse], [ResolvedByUserID], [ResolvedAt], [CreatedAt], [UpdatedAt])
    VALUES (3, @LearnerUserId2, N'Word', 34, NULL, N'WordIncorrect', N'Nghĩa không chính xác', N'Từ "Minutes" trong ngữ cảnh cuộc họp chưa rõ ràng', N'Open', N'Normal', NULL, NULL, NULL, DATEADD(DAY, -1, @Now), DATEADD(DAY, -1, @Now));

    INSERT [dbo].[ContentReports] ([ContentReportID], [ReporterUserID], [EntityType], [WordID], [QuestionID], [ReportType], [Title], [Description], [Status], [Priority], [AdminResponse], [ResolvedByUserID], [ResolvedAt], [CreatedAt], [UpdatedAt])
    VALUES (4, 3, N'Question', 66, NULL, N'AnswerIncorrect', N'Đáp án sai', N'Câu hỏi về "Install" có đáp án không chính xác', N'InReview', N'High', N'Đang kiểm tra lại nội dung', NULL, NULL, @Now, @Now);

    SET IDENTITY_INSERT [dbo].[ContentReports] OFF;
    PRINT '   -> Đã thêm 3 ContentReports';
END
ELSE
BEGIN
    PRINT '   -> ContentReports đã tồn tại, bỏ qua.';
END

-- ============================================================
-- 4. FIX USERACHIEVEMENTS — Thêm achievements còn thiếu
--    Dùng UserAchievementID không trùng
-- ============================================================
PRINT '>>> 4. Fixing UserAchievements...';

-- User Test 1 (UserID=2): FIRST_WORD (Achv 1), WORDS_50 (Achv 7), STREAK_3 (Achv 10), FIRST_TEST (Achv 15)
IF NOT EXISTS (SELECT 1 FROM UserAchievements WHERE UserID = 2 AND AchievementID = 1)
BEGIN
    INSERT [dbo].[UserAchievements] ([UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (2, 1, DATEADD(DAY, -30, @Now), DATEADD(DAY, -29, @Now));
    PRINT '   -> Added: User 2, Achievement 1';
END

IF NOT EXISTS (SELECT 1 FROM UserAchievements WHERE UserID = 2 AND AchievementID = 7)
BEGIN
    INSERT [dbo].[UserAchievements] ([UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (2, 7, DATEADD(DAY, -20, @Now), DATEADD(DAY, -20, @Now));
    PRINT '   -> Added: User 2, Achievement 7';
END

-- Nguyễn Hoàng Phúc (UserID=10): FIRST_WORD (Achv 1) already exists
-- STREAK_7 (Achv 3) already exists
-- TEST_SCORE_90 (Achv 5) already exists
-- FIRST_TEST (Achv 15) already exists

PRINT '   -> UserAchievements fix hoàn tất.';

PRINT '';
PRINT '=== FIX COMPLETE ===';
