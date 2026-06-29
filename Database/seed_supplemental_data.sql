-- ============================================================
-- SUPPLEMENTAL SEED DATA FOR ToeicVocabularyPlatform
-- Bổ sung dữ liệu cho các bảng còn trống/thưa
-- ============================================================
-- Tables seeded (trừ Users, Roles, Permissions, RolePermissions):
--   1. MediaAssets (audio/image placeholders)
--   2. ContentMediaLinks
--   3. Notifications (mẫu thông báo)
--   4. ExampleSentences (bổ sung cho các từ chưa có)
--   5. MiniTests — gán TopicID cho các bài NULL
--   6. Achievements (thêm thành tựu)
--   7. ContentReports (mẫu báo cáo)
--   8. AdminAuditLogs (mẫu log)
--   9. ContentReviewLogs (bổ sung)
--   10. UserAchievements
-- ============================================================
-- Lưu ý: File này KHÔNG có GO để giữ biến DECLARE trong scope
-- ============================================================

-- ============================================================
-- Định nghĩa biến thời gian dùng chung
-- ============================================================
DECLARE @Now DateTimeOffset = SYSDATETIMEOFFSET();
DECLARE @AdminUserId BIGINT = 8;       -- System Admin
DECLARE @CreatorUserId BIGINT = 9;     -- ContentCreator
DECLARE @LearnerUserId1 BIGINT = 2;    -- User Test 1
DECLARE @LearnerUserId2 BIGINT = 10;   -- Nguyễn Hoàng Phúc

PRINT '=== BẮT ĐẦU SEED SUPPLEMENTAL DATA ===';
PRINT '';

-- ============================================================
-- 1. MEDIA ASSETS
-- Placeholder audio/image URLs for vocabulary words
-- ============================================================
PRINT '>>> 1. Seeding MediaAssets...';

IF NOT EXISTS (SELECT 1 FROM MediaAssets)
BEGIN
    SET IDENTITY_INSERT [dbo].[MediaAssets] ON;

    -- Audio files (UK pronunciation) for Topic 1-2 words
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

    -- Image files for visual learning
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (11, @CreatorUserId, N'Image', N'/media/images/meeting-room.jpg', N'meeting-room.jpg', N'image/jpeg', 65536, N'Phòng họp văn phòng', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (12, @CreatorUserId, N'Image', N'/media/images/airport-departure.jpg', N'airport-departure.jpg', N'image/jpeg', 81920, N'Sân bay - khu vực khởi hành', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (13, @CreatorUserId, N'Image', N'/media/images/office-tech.jpg', N'office-tech.jpg', N'image/jpeg', 73728, N'Văn phòng công nghệ', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (14, @CreatorUserId, N'Image', N'/media/images/daily-routine.jpg', N'daily-routine.jpg', N'image/jpeg', 59392, N'Sinh hoạt hàng ngày', NULL, @Now);
    INSERT [dbo].[MediaAssets] ([MediaAssetID], [UploadedByUserID], [MediaType], [FileUrl], [FileName], [MimeType], [FileSizeBytes], [AltText], [Transcript], [CreatedAt])
    VALUES (15, @CreatorUserId, N'Image', N'/media/images/university-campus.jpg', N'university-campus.jpg', N'image/jpeg', 69632, N'Khuôn viên trường đại học', NULL, @Now);

    SET IDENTITY_INSERT [dbo].[MediaAssets] OFF;
    PRINT '   -> Đã thêm 15 media assets (10 audio + 5 images)';
END
ELSE
BEGIN
    PRINT '   -> MediaAssets đã có dữ liệu, bỏ qua.';
END

-- ============================================================
-- 2. LINK MEDIA TO WORDS (ContentMediaLinks)
-- ============================================================
PRINT '>>> 2. Seeding ContentMediaLinks...';

IF NOT EXISTS (SELECT 1 FROM ContentMediaLinks)
BEGIN
    SET IDENTITY_INSERT [dbo].[ContentMediaLinks] ON;

    -- Link audio to words
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (1, 1, N'Word', 11, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (2, 2, N'Word', 14, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (3, 3, N'Word', 23, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (4, 4, N'Word', 29, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (5, 5, N'Word', 20, N'AudioUS', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (6, 6, N'Word', 36, N'AudioUS', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (7, 7, N'Word', 45, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (8, 8, N'Word', 53, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (9, 9, N'Word', 63, N'AudioUK', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (10, 10, N'Word', 73, N'AudioUK', 1);

    -- Link images to words
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (11, 11, N'Word', 23, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (12, 11, N'Word', 24, N'Illustration', 2);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (13, 12, N'Word', 53, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (14, 12, N'Word', 57, N'Illustration', 2);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (15, 13, N'Word', 63, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (16, 13, N'Word', 66, N'Illustration', 2);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (17, 14, N'Word', 43, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (18, 14, N'Word', 44, N'Illustration', 2);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (19, 15, N'Word', 73, N'Illustration', 1);
    INSERT [dbo].[ContentMediaLinks] ([ContentMediaLinkID], [MediaAssetID], [EntityType], [EntityID], [Purpose], [DisplayOrder])
    VALUES (20, 15, N'Word', 74, N'Illustration', 2);

    SET IDENTITY_INSERT [dbo].[ContentMediaLinks] OFF;
    PRINT '   -> Đã thêm 20 content-media links (10 audio + 10 image)';
END
ELSE
BEGIN
    PRINT '   -> ContentMediaLinks đã có dữ liệu, bỏ qua.';
END

-- ============================================================
-- 3. NOTIFICATIONS
-- Mẫu thông báo cho người dùng
-- ============================================================
PRINT '>>> 3. Seeding Notifications...';

IF NOT EXISTS (SELECT 1 FROM Notifications)
BEGIN
    SET IDENTITY_INSERT [dbo].[Notifications] ON;

    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (1, @LearnerUserId1, N'Chào mừng bạn!', N'Chào mừng bạn đến với VocaBoost. Hãy bắt đầu học từ vựng TOEIC ngay hôm nay!', N'Welcome', N'InApp', 0, N'/user/learn', DATEADD(DAY, -30, @Now));
    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (2, @LearnerUserId1, N'Nhắc nhở học tập', N'Bạn có 5 từ vựng cần ôn tập hôm nay. Đừng bỏ lỡ!', N'Reminder', N'InApp', 0, N'/user/review', DATEADD(DAY, -1, @Now));
    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (3, @LearnerUserId1, N'Thành tích mới!', N'Chúc mừng! Bạn đã đạt được thành tích "7 Day Streak".', N'Achievement', N'InApp', 0, N'/user/achievements', DATEADD(DAY, -7, @Now));
    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (4, @LearnerUserId1, N'Bài kiểm tra mới', N'Bài kiểm tra "Business English Essentials" đã sẵn sàng.', N'NewContent', N'InApp', 0, N'/user/minitests', DATEADD(DAY, -3, @Now));
    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (5, @LearnerUserId2, N'Chào mừng bạn!', N'Chào mừng Nguyễn Hoàng Phúc đến với VocaBoost!', N'Welcome', N'InApp', 1, NULL, DATEADD(DAY, -14, @Now));
    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (6, @LearnerUserId2, N'Nhắc nhở học tập', N'Bạn có 10 từ vựng cần ôn tập hôm nay.', N'Reminder', N'InApp', 0, N'/user/review', @Now);
    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (7, 3, N'Chào mừng bạn!', N'Chào mừng bạn đến với VocaBoost! Bắt đầu hành trình TOEIC của bạn.', N'Welcome', N'InApp', 0, N'/user/learn', DATEADD(DAY, -20, @Now));
    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (8, 3, N'Bài kiểm tra mới', N'Có bài kiểm tra mới trong chủ đề "Airport & Flight Travel".', N'NewContent', N'InApp', 0, N'/user/minitests', DATEADD(DAY, -5, @Now));
    INSERT [dbo].[Notifications] ([NotificationID], [UserID], [Title], [Message], [Type], [DeliveryChannel], [IsRead], [ActionUrl], [CreatedAt])
    VALUES (9, 4, N'Cập nhật tiến độ', N'Bạn đã học được 20 từ trong tuần này. Tiếp tục phát huy!', N'Progress', N'InApp', 1, N'/user/progress', DATEADD(DAY, -2, @Now));

    SET IDENTITY_INSERT [dbo].[Notifications] OFF;
    PRINT '   -> Đã thêm 9 notifications cho 4 người dùng';
END
ELSE
BEGIN
    PRINT '   -> Notifications đã có dữ liệu, bỏ qua.';
END

-- ============================================================
-- 4. EXAMPLE SENTENCES — Bổ sung cho các từ chưa có
-- ============================================================
PRINT '>>> 4. Seeding ExampleSentences (bổ sung)...';

IF NOT EXISTS (SELECT 1 FROM ExampleSentences WHERE WordID = 43)
BEGIN
    SET IDENTITY_INSERT [dbo].[ExampleSentences] ON;

    -- Word 43
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (73, 43, N'I wake up at 6 a.m. every morning.', N'Tôi thức dậy lúc 6 giờ sáng mỗi buổi sáng.', NULL, @Now, @Now);
    -- Word 83-87
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (74, 83, N'I want to enroll in the TOEIC preparation course.', N'Tôi muốn đăng ký khóa học luyện thi TOEIC.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (75, 84, N'She graduated with a degree in Business Administration.', N'Cô ấy tốt nghiệp với bằng Quản trị Kinh doanh.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (76, 85, N'The curriculum includes advanced English communication.', N'Chương trình giảng dạy bao gồm giao tiếp tiếng Anh nâng cao.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (77, 86, N'The tuition fee for the semester is $1,200.', N'Học phí cho học kỳ này là 1,200 đô la.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (78, 87, N'Please use this document as a reference for your report.', N'Vui lòng sử dụng tài liệu này làm tham khảo cho báo cáo của bạn.', NULL, @Now, @Now);
    -- Word 159-168
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (79, 159, N'The company asset includes buildings and equipment.', N'Tài sản công ty bao gồm nhà xưởng và thiết bị.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (80, 160, N'The budget for next quarter has been approved.', N'Ngân sách cho quý sau đã được phê duyệt.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (81, 161, N'Please review the contract before signing.', N'Vui lòng xem xét hợp đồng trước khi ký.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (82, 162, N'The investment yielded a 15% return.', N'Khoản đầu tư mang lại lợi nhuận 15%.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (83, 163, N'The company reported a record profit this year.', N'Công ty báo cáo lợi nhuận kỷ lục trong năm nay.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (84, 164, N'Please circulate the memo to all departments.', N'Vui lòng lưu hành bản ghi nhớ tới tất cả các phòng ban.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (85, 165, N'The first draft of the report is due on Friday.', N'Bản thảo đầu tiên của báo cáo phải nộp vào thứ Sáu.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (86, 166, N'The company headquarters is in New York.', N'Trụ sở chính của công ty ở New York.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (87, 167, N'We decided to outsource the IT support.', N'Chúng tôi quyết định thuê ngoài hỗ trợ CNTT.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (88, 168, N'The board passed a resolution to expand operations.', N'Hội đồng đã thông qua nghị quyết mở rộng hoạt động.', NULL, @Now, @Now);
    -- Word 169-173
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (89, 169, N'Personal hygiene is important for good health.', N'Vệ sinh cá nhân rất quan trọng cho sức khỏe.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (90, 170, N'I need to finish my chores before the weekend.', N'Tôi cần hoàn thành việc nhà trước cuối tuần.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (91, 171, N'Let us take a break for lunch.', N'Hãy nghỉ giải lao để ăn trưa.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (92, 172, N'Children should have a regular bedtime.', N'Trẻ em nên có giờ đi ngủ đều đặn.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (93, 173, N'Try not to overeat during the holidays.', N'Cố gắng không ăn quá nhiều trong kỳ nghỉ.', NULL, @Now, @Now);
    -- Word 174-178
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (94, 174, N'Please collect your baggage from carousel 5.', N'Vui lòng nhận hành lý của bạn từ băng chuyền số 5.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (95, 175, N'Boarding will begin in 30 minutes.', N'Việc lên máy bay sẽ bắt đầu trong 30 phút.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (96, 176, N'We have a three-hour layover in Singapore.', N'Chúng tôi có ba giờ quá cảnh ở Singapore.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (97, 177, N'Our destination is Tokyo, Japan.', N'Điểm đến của chúng tôi là Tokyo, Nhật Bản.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (98, 178, N'I took the red-eye flight from Los Angeles.', N'Tôi đã đi chuyến bay đêm từ Los Angeles.', NULL, @Now, @Now);
    -- Word 179-183
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (99, 179, N'The server is down for scheduled maintenance.', N'Máy chủ đang bảo trì theo lịch trình.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (100, 180, N'The firewall blocks unauthorized access.', N'Tường lửa chặn truy cập trái phép.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (101, 181, N'Encryption protects sensitive data during transmission.', N'Mã hóa bảo vệ dữ liệu nhạy cảm trong quá trình truyền.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (102, 182, N'The network uses TCP/IP protocol.', N'Mạng sử dụng giao thức TCP/IP.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (103, 183, N'The user interface should be user-friendly.', N'Giao diện người dùng nên thân thiện với người dùng.', NULL, @Now, @Now);
    -- Word 184-188
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (104, 184, N'She received her diploma last June.', N'Cô ấy đã nhận bằng tốt nghiệp vào tháng Sáu năm ngoái.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (105, 185, N'The fall semester starts in September.', N'Học kỳ mùa thu bắt đầu vào tháng Chín.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (106, 186, N'The syllabus outlines all course requirements.', N'Đề cương môn học nêu rõ tất cả các yêu cầu của khóa học.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (107, 187, N'The faculty meeting is scheduled for Friday.', N'Cuộc họp khoa được lên lịch vào thứ Sáu.', NULL, @Now, @Now);
    INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt])
    VALUES (108, 188, N'He is working on his doctoral dissertation.', N'Anh ấy đang làm luận án tiến sĩ.', NULL, @Now, @Now);

    SET IDENTITY_INSERT [dbo].[ExampleSentences] OFF;
    PRINT '   -> Đã thêm 36 example sentences (43 + 83-188)';
END
ELSE
BEGIN
    PRINT '   -> ExampleSentences đã đầy đủ, bỏ qua.';
END

-- ============================================================
-- 5. GÁN TOPIC CHO CÁC MINI TESTS NULL
-- MiniTest 25-36 không có TopicID. Gán vào topic phù hợp.
-- ============================================================
PRINT '>>> 5. Assigning TopicIDs to NULL MiniTests...';

UPDATE dbo.MiniTests SET TopicID = 1 WHERE MiniTestID = 25;
UPDATE dbo.MiniTests SET TopicID = 2 WHERE MiniTestID = 26;
UPDATE dbo.MiniTests SET TopicID = 5 WHERE MiniTestID = 27;
UPDATE dbo.MiniTests SET TopicID = 2 WHERE MiniTestID = 28;
UPDATE dbo.MiniTests SET TopicID = 1 WHERE MiniTestID = 29;
UPDATE dbo.MiniTests SET TopicID = 1 WHERE MiniTestID = 30;
UPDATE dbo.MiniTests SET TopicID = 2 WHERE MiniTestID = 31;
UPDATE dbo.MiniTests SET TopicID = 1 WHERE MiniTestID = 32;
UPDATE dbo.MiniTests SET TopicID = 1 WHERE MiniTestID = 33;
UPDATE dbo.MiniTests SET TopicID = 2 WHERE MiniTestID = 34;
UPDATE dbo.MiniTests SET TopicID = 6 WHERE MiniTestID = 35;
UPDATE dbo.MiniTests SET TopicID = 2 WHERE MiniTestID = 36;

PRINT '   -> Đã gán TopicID cho 12 MiniTests (ID 25-36)';

-- ============================================================
-- 6. ACHIEVEMENTS — Bổ sung thêm thành tựu
-- ============================================================
PRINT '>>> 6. Seeding additional Achievements...';

IF NOT EXISTS (SELECT 1 FROM Achievements WHERE Code = 'WORDS_50')
BEGIN
    SET IDENTITY_INSERT [dbo].[Achievements] ON;
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (7, N'WORDS_50', N'50 Từ vựng', N'Học được 50 từ vựng', N'book-open', N'WordsLearned', 50, 7, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (8, N'WORDS_200', N'200 Từ vựng', N'Học được 200 từ vựng', N'book', N'WordsLearned', 200, 8, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (9, N'WORDS_500', N'500 Từ vựng', N'Học được 500 từ vựng', N'award', N'WordsLearned', 500, 9, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (10, N'STREAK_3', N'3 Ngày liên tiếp', N'Duy trì chuỗi học 3 ngày', N'zap', N'StreakDays', 3, 10, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (11, N'STREAK_14', N'14 Ngày liên tiếp', N'Duy trì chuỗi học 14 ngày', N'flame', N'StreakDays', 14, 11, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (12, N'TEST_SCORE_70', N'Đạt 70%', N'Đạt 70% điểm số trong bài kiểm tra', N'target', N'TestScore', 70, 12, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (13, N'TEST_SCORE_100', N'Điểm tuyệt đối', N'Đạt 100% điểm số trong bài kiểm tra', N'star', N'TestScore', 100, 13, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (14, N'LEVEL_10', N'Cấp độ 10', N'Đạt cấp độ người học 10', N'chevrons-up', N'UserLevel', 10, 14, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (15, N'FIRST_TEST', N'Bài kiểm tra đầu tiên', N'Hoàn thành bài kiểm tra đầu tiên', N'clipboard', N'TestsCompleted', 1, 15, 1, @Now);
    INSERT [dbo].[Achievements] ([AchievementID], [Code], [Name], [Description], [Icon], [CriteriaType], [CriteriaValue], [DisplayOrder], [IsActive], [CreatedAt])
    VALUES (16, N'TESTS_10', N'10 Bài kiểm tra', N'Hoàn thành 10 bài kiểm tra', N'file-text', N'TestsCompleted', 10, 16, 1, @Now);
    SET IDENTITY_INSERT [dbo].[Achievements] OFF;
    PRINT '   -> Đã thêm 10 achievements mới (tổng: 16)';
END
ELSE
BEGIN
    PRINT '   -> Achievements đã có dữ liệu, bỏ qua.';
END

-- ============================================================
-- 7. CONTENT REPORTS — Bổ sung báo cáo mẫu
-- ============================================================
PRINT '>>> 7. Seeding additional ContentReports...';

IF NOT EXISTS (SELECT 1 FROM ContentReports WHERE ContentReportID > 1)
BEGIN
    SET IDENTITY_INSERT [dbo].[ContentReports] ON;
    INSERT [dbo].[ContentReports] ([ContentReportID], [ReporterUserID], [EntityType], [WordID], [QuestionID], [ReportType], [Title], [Description], [Status], [Priority], [AdminResponse], [ResolvedByUserID], [ResolvedAt], [CreatedAt], [UpdatedAt])
    VALUES (2, @LearnerUserId1, N'Question', 15, 5, N'TypoIncorrect', N'Sai chính tả trong câu hỏi', N'Câu hỏi số 5 có lỗi chính tả', N'Open', N'Low', NULL, NULL, NULL, DATEADD(DAY, -2, @Now), DATEADD(DAY, -2, @Now));
    INSERT [dbo].[ContentReports] ([ContentReportID], [ReporterUserID], [EntityType], [WordID], [QuestionID], [ReportType], [Title], [Description], [Status], [Priority], [AdminResponse], [ResolvedByUserID], [ResolvedAt], [CreatedAt], [UpdatedAt])
    VALUES (3, @LearnerUserId2, N'Word', 34, NULL, N'MeaningIncorrect', N'Nghĩa không chính xác', N'Từ "Minutes" trong ngữ cảnh cuộc họp chưa rõ ràng', N'Open', N'Medium', NULL, NULL, NULL, DATEADD(DAY, -1, @Now), DATEADD(DAY, -1, @Now));
    INSERT [dbo].[ContentReports] ([ContentReportID], [ReporterUserID], [EntityType], [WordID], [QuestionID], [ReportType], [Title], [Description], [Status], [Priority], [AdminResponse], [ResolvedByUserID], [ResolvedAt], [CreatedAt], [UpdatedAt])
    VALUES (4, 3, N'Question', 66, NULL, N'AnswerIncorrect', N'Đáp án sai', N'Câu hỏi về "Install" có đáp án không chính xác', N'InReview', N'High', N'Đang kiểm tra lại nội dung', NULL, NULL, @Now, @Now);
    SET IDENTITY_INSERT [dbo].[ContentReports] OFF;
    PRINT '   -> Đã thêm 3 content reports mới (tổng: 4)';
END
ELSE
BEGIN
    PRINT '   -> ContentReports đã có thêm dữ liệu, bỏ qua.';
END

-- ============================================================
-- 8. ADMIN AUDIT LOGS — Bổ sung log mẫu
-- ============================================================
PRINT '>>> 8. Seeding additional AdminAuditLogs...';

IF NOT EXISTS (SELECT 1 FROM AdminAuditLogs WHERE AdminAuditLogID > 5)
BEGIN
    SET IDENTITY_INSERT [dbo].[AdminAuditLogs] ON;
    INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt])
    VALUES (6, @AdminUserId, N'BULK_IMPORT', N'Word', NULL, N'{"importCount":10,"topicCode":"TECH-SOFTWARE-01","status":"Success"}', DATEADD(DAY, -10, @Now));
    INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt])
    VALUES (7, @AdminUserId, N'CREATE', N'Topic', 7, N'{"topicName":"TOEIC Grammar Basics","topicCode":"TOEIC-GRAMMAR-01"}', DATEADD(DAY, -8, @Now));
    INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt])
    VALUES (8, @AdminUserId, N'DELETE', N'Topic', 7, N'{"topicName":"TOEIC Grammar Basics","reason":"Duplicate content"}', DATEADD(DAY, -7, @Now));
    INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt])
    VALUES (9, @AdminUserId, N'PUBLISH', N'MiniTest', 30, N'{"testTitle":"Marketing & Sales","topicId":1}', DATEADD(DAY, -5, @Now));
    INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt])
    VALUES (10, @AdminUserId, N'UPDATE_USER_ROLE', N'User', 9, N'{"oldRole":"Learner","newRole":"ContentCreator","reason":"Promoted to editor"}', DATEADD(DAY, -3, @Now));
    INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt])
    VALUES (11, @AdminUserId, N'APPROVE_CONTENT', N'Word', 183, N'{"oldStatus":"PendingReview","newStatus":"Published"}', DATEADD(DAY, -1, @Now));
    SET IDENTITY_INSERT [dbo].[AdminAuditLogs] OFF;
    PRINT '   -> Đã thêm 6 admin audit logs (tổng: 11)';
END
ELSE
BEGIN
    PRINT '   -> AdminAuditLogs đã có thêm dữ liệu, bỏ qua.';
END

-- ============================================================
-- 9. CONTENT REVIEW LOGS — Bổ sung
-- ============================================================
PRINT '>>> 9. Seeding additional ContentReviewLogs...';

IF NOT EXISTS (SELECT 1 FROM ContentReviewLogs WHERE ContentReviewLogID > 5)
BEGIN
    SET IDENTITY_INSERT [dbo].[ContentReviewLogs] ON;
    INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt])
    VALUES (6, N'Word', 183, @AdminUserId, N'PendingReview', N'Published', N'Nội dung chính xác, đã kiểm tra kỹ', DATEADD(DAY, -1, @Now));
    INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt])
    VALUES (7, N'Question', 155, @AdminUserId, N'PendingReview', N'Published', N'Câu hỏi phù hợp với độ khó', DATEADD(DAY, -1, @Now));
    INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt])
    VALUES (8, N'MiniTest', 35, @AdminUserId, N'Draft', N'Published', N'Bài kiểm tra chất lượng tốt', DATEADD(DAY, -2, @Now));
    INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt])
    VALUES (9, N'Topic', 6, @AdminUserId, N'Draft', N'Rejected', N'Cần bổ sung thêm từ vựng, chưa đủ 10 từ', DATEADD(DAY, -5, @Now));
    INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt])
    VALUES (10, N'Word', 165, @CreatorUserId, N'Draft', N'Rejected', N'Phiên âm chưa chính xác', DATEADD(DAY, -4, @Now));
    SET IDENTITY_INSERT [dbo].[ContentReviewLogs] OFF;
    PRINT '   -> Đã thêm 5 content review logs (tổng: 10)';
END
ELSE
BEGIN
    PRINT '   -> ContentReviewLogs đã có thêm dữ liệu, bỏ qua.';
END

-- ============================================================
-- 10. USER ACHIEVEMENTS — Gán achievements cho user mẫu
-- ============================================================
PRINT '>>> 10. Seeding UserAchievements...';

IF NOT EXISTS (SELECT 1 FROM UserAchievements WHERE UserID = @LearnerUserId1)
BEGIN
    SET IDENTITY_INSERT [dbo].[UserAchievements] ON;
    INSERT [dbo].[UserAchievements] ([UserAchievementID], [UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (1, @LearnerUserId1, 1, DATEADD(DAY, -30, @Now), DATEADD(DAY, -29, @Now));
    INSERT [dbo].[UserAchievements] ([UserAchievementID], [UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (2, @LearnerUserId1, 7, DATEADD(DAY, -20, @Now), DATEADD(DAY, -20, @Now));
    INSERT [dbo].[UserAchievements] ([UserAchievementID], [UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (3, @LearnerUserId1, 10, DATEADD(DAY, -10, @Now), DATEADD(DAY, -9, @Now));
    INSERT [dbo].[UserAchievements] ([UserAchievementID], [UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (4, @LearnerUserId1, 15, DATEADD(DAY, -25, @Now), DATEADD(DAY, -25, @Now));
    INSERT [dbo].[UserAchievements] ([UserAchievementID], [UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (5, @LearnerUserId2, 1, DATEADD(DAY, -14, @Now), DATEADD(DAY, -13, @Now));
    INSERT [dbo].[UserAchievements] ([UserAchievementID], [UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (6, @LearnerUserId2, 3, DATEADD(DAY, -7, @Now), DATEADD(DAY, -6, @Now));
    INSERT [dbo].[UserAchievements] ([UserAchievementID], [UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (7, @LearnerUserId2, 5, DATEADD(DAY, -3, @Now), DATEADD(DAY, -2, @Now));
    INSERT [dbo].[UserAchievements] ([UserAchievementID], [UserID], [AchievementID], [UnlockedAt], [SeenAt])
    VALUES (8, @LearnerUserId2, 15, DATEADD(DAY, -12, @Now), DATEADD(DAY, -12, @Now));
    SET IDENTITY_INSERT [dbo].[UserAchievements] OFF;
    PRINT '   -> Đã thêm 8 user achievements cho 2 người dùng';
END
ELSE
BEGIN
    PRINT '   -> UserAchievements đã có dữ liệu, bỏ qua.';
END

-- ============================================================
-- KẾT THÚC
-- ============================================================
PRINT '';
PRINT '=== HOÀN THÀNH SEED SUPPLEMENTAL DATA ===';
