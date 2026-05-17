/*
    ============================================================
    MIGRATION: ADD CONTENT CREATOR / TEACHER ROLE
    Database: ToeicVocabularyPlatform
    Purpose:
      - Giữ nguyên hệ thống cũ
      - Bổ sung role ContentCreator / Teacher
      - Bổ sung permission
      - Bổ sung workflow duyệt/xuất bản nội dung
      - Bổ sung sổ tay cá nhân, chọn topic, media, analytics test
    ============================================================
*/

USE ToeicVocabularyPlatform;
GO

/* ============================================================
   1. ENSURE ROLE + PERMISSION TABLES EXIST
   ============================================================ */

IF OBJECT_ID(N'dbo.Permissions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Permissions
    (
        PermissionID INT IDENTITY(1,1) NOT NULL,
        PermissionCode NVARCHAR(50) NOT NULL,
        Description NVARCHAR(255) NULL,

        CONSTRAINT PK_Permissions PRIMARY KEY CLUSTERED (PermissionID),
        CONSTRAINT UQ_Permissions_PermissionCode UNIQUE (PermissionCode)
    );
END;
GO

IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles
    (
        RoleID INT IDENTITY(1,1) NOT NULL,
        RoleName NVARCHAR(50) NOT NULL,
        Description NVARCHAR(255) NULL,

        CONSTRAINT PK_Roles PRIMARY KEY CLUSTERED (RoleID),
        CONSTRAINT UQ_Roles_RoleName UNIQUE (RoleName)
    );
END;
GO

IF OBJECT_ID(N'dbo.RolePermissions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RolePermissions
    (
        RoleID INT NOT NULL,
        PermissionID INT NOT NULL,

        CONSTRAINT PK_RolePermissions PRIMARY KEY CLUSTERED (RoleID, PermissionID),

        CONSTRAINT FK_RolePermissions_RoleID FOREIGN KEY (RoleID)
            REFERENCES dbo.Roles(RoleID)
            ON DELETE CASCADE,

        CONSTRAINT FK_RolePermissions_PermissionID FOREIGN KEY (PermissionID)
            REFERENCES dbo.Permissions(PermissionID)
            ON DELETE CASCADE
    );
END;
GO


/* ============================================================
   2. ADD RoleID TO Users IF MISSING
   ============================================================ */

IF COL_LENGTH(N'dbo.Users', N'RoleID') IS NULL
BEGIN
    ALTER TABLE dbo.Users ADD RoleID INT NULL;
END;
GO


/* ============================================================
   3. SEED ROLES
   ============================================================ */

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = N'Admin')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES (N'Admin', N'Quản trị viên toàn quyền');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = N'Learner')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES (N'Learner', N'Người học');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = N'ContentCreator')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES (N'ContentCreator', N'Biên tập viên / Giáo viên quản lý nội dung học tập');
END;
GO


/* ============================================================
   4. SEED PERMISSIONS
   ============================================================ */

INSERT INTO dbo.Permissions (PermissionCode, Description)
SELECT v.PermissionCode, v.Description
FROM
(
    VALUES
    (N'VIEW_DASHBOARD', N'Xem dashboard'),
    (N'LEARN_VOCAB', N'Học từ vựng'),
    (N'ENROLL_TOPICS', N'Chọn / đăng ký bộ từ vựng'),
    (N'MANAGE_NOTEBOOK', N'Quản lý sổ tay từ vựng cá nhân'),

    (N'MANAGE_WORDS', N'Quản lý từ vựng'),
    (N'MANAGE_TOPICS', N'Quản lý bộ từ vựng / chủ đề'),
    (N'MANAGE_QUESTIONS', N'Quản lý ngân hàng câu hỏi'),
    (N'MANAGE_TESTS', N'Quản lý bài kiểm tra'),
    (N'MANAGE_MEDIA', N'Quản lý tệp âm thanh và hình ảnh minh họa'),

    (N'SUBMIT_CONTENT_REVIEW', N'Gửi nội dung để duyệt'),
    (N'REVIEW_CONTENT', N'Duyệt / từ chối / lưu trữ nội dung'),
    (N'PUBLISH_OWN_CONTENT', N'Xuất bản nội dung do mình tạo'),

    (N'VIEW_CONTENT_ANALYTICS', N'Xem phân tích hiệu quả nội dung do mình tạo'),
    (N'VIEW_GLOBAL_ANALYTICS', N'Xem phân tích toàn cục'),
    (N'MANAGE_USERS', N'Quản lý người dùng'),
    (N'MANAGE_SYSTEM_SETTINGS', N'Quản lý cấu hình hệ thống')
) AS v(PermissionCode, Description)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Permissions p
    WHERE p.PermissionCode = v.PermissionCode
);
GO


/* ============================================================
   5. ASSIGN PERMISSIONS TO ROLES
   ============================================================ */

-- Learner
INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM dbo.Roles r
JOIN dbo.Permissions p
    ON p.PermissionCode IN
    (
        N'VIEW_DASHBOARD',
        N'LEARN_VOCAB',
        N'ENROLL_TOPICS',
        N'MANAGE_NOTEBOOK'
    )
WHERE r.RoleName = N'Learner'
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.RolePermissions rp
      WHERE rp.RoleID = r.RoleID
        AND rp.PermissionID = p.PermissionID
  );
GO

-- Content Creator / Teacher
INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM dbo.Roles r
JOIN dbo.Permissions p
    ON p.PermissionCode IN
    (
        N'VIEW_DASHBOARD',
        N'LEARN_VOCAB',
        N'MANAGE_WORDS',
        N'MANAGE_TOPICS',
        N'MANAGE_QUESTIONS',
        N'MANAGE_TESTS',
        N'MANAGE_MEDIA',
        N'SUBMIT_CONTENT_REVIEW',
        N'VIEW_CONTENT_ANALYTICS'
    )
WHERE r.RoleName = N'ContentCreator'
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.RolePermissions rp
      WHERE rp.RoleID = r.RoleID
        AND rp.PermissionID = p.PermissionID
  );
GO

-- Admin
INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM dbo.Roles r
JOIN dbo.Permissions p
    ON p.PermissionCode IN
    (
        N'VIEW_DASHBOARD',
        N'LEARN_VOCAB',
        N'ENROLL_TOPICS',
        N'MANAGE_NOTEBOOK',
        N'MANAGE_WORDS',
        N'MANAGE_TOPICS',
        N'MANAGE_QUESTIONS',
        N'MANAGE_TESTS',
        N'MANAGE_MEDIA',
        N'SUBMIT_CONTENT_REVIEW',
        N'REVIEW_CONTENT',
        N'PUBLISH_OWN_CONTENT',
        N'VIEW_CONTENT_ANALYTICS',
        N'VIEW_GLOBAL_ANALYTICS',
        N'MANAGE_USERS',
        N'MANAGE_SYSTEM_SETTINGS'
    )
WHERE r.RoleName = N'Admin'
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.RolePermissions rp
      WHERE rp.RoleID = r.RoleID
        AND rp.PermissionID = p.PermissionID
  );
GO


/* ============================================================
   6. MIGRATE Users.RoleID FROM Users.UserRole
   ============================================================ */

DECLARE @AdminRoleID INT;
DECLARE @LearnerRoleID INT;
DECLARE @ContentCreatorRoleID INT;

SELECT @AdminRoleID = RoleID FROM dbo.Roles WHERE RoleName = N'Admin';
SELECT @LearnerRoleID = RoleID FROM dbo.Roles WHERE RoleName = N'Learner';
SELECT @ContentCreatorRoleID = RoleID FROM dbo.Roles WHERE RoleName = N'ContentCreator';

UPDATE dbo.Users
SET RoleID = @AdminRoleID
WHERE UserRole = N'Admin'
  AND (RoleID IS NULL OR RoleID <> @AdminRoleID);

UPDATE dbo.Users
SET RoleID = @ContentCreatorRoleID
WHERE UserRole = N'ContentCreator'
  AND (RoleID IS NULL OR RoleID <> @ContentCreatorRoleID);

UPDATE dbo.Users
SET RoleID = @LearnerRoleID
WHERE UserRole = N'Learner'
  AND (RoleID IS NULL OR RoleID <> @LearnerRoleID);

UPDATE dbo.Users
SET RoleID = @LearnerRoleID,
    UserRole = N'Learner'
WHERE RoleID IS NULL;
GO

IF EXISTS
(
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Users')
      AND name = N'RoleID'
      AND is_nullable = 1
)
BEGIN
    ALTER TABLE dbo.Users ALTER COLUMN RoleID INT NOT NULL;
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Users_RoleID'
)
BEGIN
    ALTER TABLE dbo.Users
    ADD CONSTRAINT FK_Users_RoleID FOREIGN KEY (RoleID)
        REFERENCES dbo.Roles(RoleID)
        ON DELETE NO ACTION;
END;
GO


/* ============================================================
   7. OPTIONAL: CREATE SAMPLE CONTENT CREATOR USER
   ============================================================ */

DECLARE @ContentCreatorRoleID_ForUser INT;

SELECT @ContentCreatorRoleID_ForUser = RoleID
FROM dbo.Roles
WHERE RoleName = N'ContentCreator';

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.Users
    WHERE Email = N'teacher@vocaboost.com'
)
BEGIN
    INSERT INTO dbo.Users
    (
        FullName,
        Email,
        PasswordHash,
        UserRole,
        RoleID,
        IsActive
    )
    VALUES
    (
        N'Biên tập viên / Giáo viên',
        N'teacher@vocaboost.com',
        N'CHANGE_ME_HASH',
        N'ContentCreator',
        @ContentCreatorRoleID_ForUser,
        1
    );
END;
GO


/* ============================================================
   8. ADD CONTENT WORKFLOW COLUMNS
   ============================================================ */

-- Topics
IF COL_LENGTH(N'dbo.Topics', N'ContentStatus') IS NULL
BEGIN
    ALTER TABLE dbo.Topics
    ADD ContentStatus NVARCHAR(30) NOT NULL
        CONSTRAINT DF_Topics_ContentStatus DEFAULT (N'Published');
END;
GO

IF COL_LENGTH(N'dbo.Topics', N'ReviewedByUserID') IS NULL
BEGIN
    ALTER TABLE dbo.Topics ADD ReviewedByUserID BIGINT NULL;
END;
GO

IF COL_LENGTH(N'dbo.Topics', N'ReviewedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Topics ADD ReviewedAt DATETIMEOFFSET(7) NULL;
END;
GO

IF COL_LENGTH(N'dbo.Topics', N'PublishedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Topics ADD PublishedAt DATETIMEOFFSET(7) NULL;
END;
GO

-- Words
IF COL_LENGTH(N'dbo.Words', N'ContentStatus') IS NULL
BEGIN
    ALTER TABLE dbo.Words
    ADD ContentStatus NVARCHAR(30) NOT NULL
        CONSTRAINT DF_Words_ContentStatus DEFAULT (N'Published');
END;
GO

IF COL_LENGTH(N'dbo.Words', N'ReviewedByUserID') IS NULL
BEGIN
    ALTER TABLE dbo.Words ADD ReviewedByUserID BIGINT NULL;
END;
GO

IF COL_LENGTH(N'dbo.Words', N'ReviewedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Words ADD ReviewedAt DATETIMEOFFSET(7) NULL;
END;
GO

IF COL_LENGTH(N'dbo.Words', N'PublishedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Words ADD PublishedAt DATETIMEOFFSET(7) NULL;
END;
GO

-- Questions
IF COL_LENGTH(N'dbo.Questions', N'ContentStatus') IS NULL
BEGIN
    ALTER TABLE dbo.Questions
    ADD ContentStatus NVARCHAR(30) NOT NULL
        CONSTRAINT DF_Questions_ContentStatus DEFAULT (N'Published');
END;
GO

IF COL_LENGTH(N'dbo.Questions', N'ReviewedByUserID') IS NULL
BEGIN
    ALTER TABLE dbo.Questions ADD ReviewedByUserID BIGINT NULL;
END;
GO

IF COL_LENGTH(N'dbo.Questions', N'ReviewedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Questions ADD ReviewedAt DATETIMEOFFSET(7) NULL;
END;
GO

IF COL_LENGTH(N'dbo.Questions', N'PublishedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Questions ADD PublishedAt DATETIMEOFFSET(7) NULL;
END;
GO

-- MiniTests
IF COL_LENGTH(N'dbo.MiniTests', N'ContentStatus') IS NULL
BEGIN
    ALTER TABLE dbo.MiniTests
    ADD ContentStatus NVARCHAR(30) NOT NULL
        CONSTRAINT DF_MiniTests_ContentStatus DEFAULT (N'Draft');
END;
GO

IF COL_LENGTH(N'dbo.MiniTests', N'ReviewedByUserID') IS NULL
BEGIN
    ALTER TABLE dbo.MiniTests ADD ReviewedByUserID BIGINT NULL;
END;
GO

IF COL_LENGTH(N'dbo.MiniTests', N'ReviewedAt') IS NULL
BEGIN
    ALTER TABLE dbo.MiniTests ADD ReviewedAt DATETIMEOFFSET(7) NULL;
END;
GO

IF COL_LENGTH(N'dbo.MiniTests', N'PublishedAt') IS NULL
BEGIN
    ALTER TABLE dbo.MiniTests ADD PublishedAt DATETIMEOFFSET(7) NULL;
END;
GO

UPDATE dbo.MiniTests
SET ContentStatus = CASE
    WHEN IsPublished = 1 THEN N'Published'
    ELSE ContentStatus
END
WHERE IsPublished = 1;
GO


/* ============================================================
   9. ADD CHECK CONSTRAINTS FOR CONTENT STATUS
   ============================================================ */

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_Topics_ContentStatus'
)
BEGIN
    ALTER TABLE dbo.Topics
    ADD CONSTRAINT CK_Topics_ContentStatus
    CHECK (ContentStatus IN (N'Draft', N'PendingReview', N'Published', N'Rejected', N'Archived'));
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_Words_ContentStatus'
)
BEGIN
    ALTER TABLE dbo.Words
    ADD CONSTRAINT CK_Words_ContentStatus
    CHECK (ContentStatus IN (N'Draft', N'PendingReview', N'Published', N'Rejected', N'Archived'));
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_Questions_ContentStatus'
)
BEGIN
    ALTER TABLE dbo.Questions
    ADD CONSTRAINT CK_Questions_ContentStatus
    CHECK (ContentStatus IN (N'Draft', N'PendingReview', N'Published', N'Rejected', N'Archived'));
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_MiniTests_ContentStatus'
)
BEGIN
    ALTER TABLE dbo.MiniTests
    ADD CONSTRAINT CK_MiniTests_ContentStatus
    CHECK (ContentStatus IN (N'Draft', N'PendingReview', N'Published', N'Rejected', N'Archived'));
END;
GO


/* ============================================================
   10. ADD REVIEWED-BY FOREIGN KEYS
   ============================================================ */

IF NOT EXISTS
(
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_Topics_ReviewedByUserID'
)
BEGIN
    ALTER TABLE dbo.Topics
    ADD CONSTRAINT FK_Topics_ReviewedByUserID FOREIGN KEY (ReviewedByUserID)
        REFERENCES dbo.Users(UserID)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_Words_ReviewedByUserID'
)
BEGIN
    ALTER TABLE dbo.Words
    ADD CONSTRAINT FK_Words_ReviewedByUserID FOREIGN KEY (ReviewedByUserID)
        REFERENCES dbo.Users(UserID)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_Questions_ReviewedByUserID'
)
BEGIN
    ALTER TABLE dbo.Questions
    ADD CONSTRAINT FK_Questions_ReviewedByUserID FOREIGN KEY (ReviewedByUserID)
        REFERENCES dbo.Users(UserID)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_MiniTests_ReviewedByUserID'
)
BEGIN
    ALTER TABLE dbo.MiniTests
    ADD CONSTRAINT FK_MiniTests_ReviewedByUserID FOREIGN KEY (ReviewedByUserID)
        REFERENCES dbo.Users(UserID)
        ON DELETE NO ACTION;
END;
GO


/* ============================================================
   11. USER TOPIC ENROLLMENTS
   ============================================================ */

IF OBJECT_ID(N'dbo.UserTopicEnrollments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserTopicEnrollments
    (
        UserTopicEnrollmentID BIGINT IDENTITY(1,1) NOT NULL,
        UserID BIGINT NOT NULL,
        TopicID BIGINT NOT NULL,
        EnrolledAt DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_UserTopicEnrollments_EnrolledAt DEFAULT (SYSDATETIMEOFFSET()),
        IsActive BIT NOT NULL
            CONSTRAINT DF_UserTopicEnrollments_IsActive DEFAULT (1),

        CONSTRAINT PK_UserTopicEnrollments PRIMARY KEY CLUSTERED (UserTopicEnrollmentID),

        CONSTRAINT FK_UserTopicEnrollments_UserID FOREIGN KEY (UserID)
            REFERENCES dbo.Users(UserID)
            ON DELETE CASCADE,

        CONSTRAINT FK_UserTopicEnrollments_TopicID FOREIGN KEY (TopicID)
            REFERENCES dbo.Topics(TopicID)
            ON DELETE CASCADE,

        CONSTRAINT UQ_UserTopicEnrollments_UserID_TopicID UNIQUE (UserID, TopicID)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_UserTopicEnrollments_UserID'
      AND object_id = OBJECT_ID(N'dbo.UserTopicEnrollments')
)
BEGIN
    CREATE INDEX IX_UserTopicEnrollments_UserID
    ON dbo.UserTopicEnrollments(UserID, IsActive);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_UserTopicEnrollments_TopicID'
      AND object_id = OBJECT_ID(N'dbo.UserTopicEnrollments')
)
BEGIN
    CREATE INDEX IX_UserTopicEnrollments_TopicID
    ON dbo.UserTopicEnrollments(TopicID, IsActive);
END;
GO


/* ============================================================
   12. USER VOCABULARY NOTEBOOK
   ============================================================ */

IF OBJECT_ID(N'dbo.UserVocabularyNotebook', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserVocabularyNotebook
    (
        NotebookID BIGINT IDENTITY(1,1) NOT NULL,
        UserID BIGINT NOT NULL,
        WordID BIGINT NOT NULL,
        PersonalNote NVARCHAR(2000) NULL,
        IsFavorite BIT NOT NULL
            CONSTRAINT DF_UserVocabularyNotebook_IsFavorite DEFAULT (0),
        AddedAt DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_UserVocabularyNotebook_AddedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_UserVocabularyNotebook_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_UserVocabularyNotebook PRIMARY KEY CLUSTERED (NotebookID),

        CONSTRAINT FK_UserVocabularyNotebook_UserID FOREIGN KEY (UserID)
            REFERENCES dbo.Users(UserID)
            ON DELETE CASCADE,

        CONSTRAINT FK_UserVocabularyNotebook_WordID FOREIGN KEY (WordID)
            REFERENCES dbo.Words(WordID)
            ON DELETE CASCADE,

        CONSTRAINT UQ_UserVocabularyNotebook_UserID_WordID UNIQUE (UserID, WordID)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_UserVocabularyNotebook_UserID'
      AND object_id = OBJECT_ID(N'dbo.UserVocabularyNotebook')
)
BEGIN
    CREATE INDEX IX_UserVocabularyNotebook_UserID
    ON dbo.UserVocabularyNotebook(UserID, IsFavorite);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_UserVocabularyNotebook_WordID'
      AND object_id = OBJECT_ID(N'dbo.UserVocabularyNotebook')
)
BEGIN
    CREATE INDEX IX_UserVocabularyNotebook_WordID
    ON dbo.UserVocabularyNotebook(WordID);
END;
GO


/* ============================================================
   13. CONTENT REVIEW LOGS
   ============================================================ */

IF OBJECT_ID(N'dbo.ContentReviewLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContentReviewLogs
    (
        ContentReviewLogID BIGINT IDENTITY(1,1) NOT NULL,
        EntityType NVARCHAR(30) NOT NULL,
        EntityID BIGINT NOT NULL,
        ActionByUserID BIGINT NOT NULL,
        OldStatus NVARCHAR(30) NULL,
        NewStatus NVARCHAR(30) NOT NULL,
        Comment NVARCHAR(2000) NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_ContentReviewLogs_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_ContentReviewLogs PRIMARY KEY CLUSTERED (ContentReviewLogID),

        CONSTRAINT FK_ContentReviewLogs_ActionByUserID FOREIGN KEY (ActionByUserID)
            REFERENCES dbo.Users(UserID)
            ON DELETE NO ACTION,

        CONSTRAINT CK_ContentReviewLogs_EntityType CHECK
        (
            EntityType IN
            (
                N'Topic',
                N'Word',
                N'Question',
                N'MiniTest',
                N'ExampleSentence',
                N'MediaAsset'
            )
        ),

        CONSTRAINT CK_ContentReviewLogs_Status CHECK
        (
            NewStatus IN (N'Draft', N'PendingReview', N'Published', N'Rejected', N'Archived')
            AND
            (
                OldStatus IS NULL
                OR OldStatus IN (N'Draft', N'PendingReview', N'Published', N'Rejected', N'Archived')
            )
        )
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ContentReviewLogs_Entity'
      AND object_id = OBJECT_ID(N'dbo.ContentReviewLogs')
)
BEGIN
    CREATE INDEX IX_ContentReviewLogs_Entity
    ON dbo.ContentReviewLogs(EntityType, EntityID, CreatedAt DESC);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ContentReviewLogs_ActionByUserID'
      AND object_id = OBJECT_ID(N'dbo.ContentReviewLogs')
)
BEGIN
    CREATE INDEX IX_ContentReviewLogs_ActionByUserID
    ON dbo.ContentReviewLogs(ActionByUserID, CreatedAt DESC);
END;
GO


/* ============================================================
   14. MEDIA ASSETS
   ============================================================ */

IF OBJECT_ID(N'dbo.MediaAssets', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MediaAssets
    (
        MediaAssetID BIGINT IDENTITY(1,1) NOT NULL,
        UploadedByUserID BIGINT NOT NULL,
        MediaType NVARCHAR(30) NOT NULL,
        FileUrl NVARCHAR(1000) NOT NULL,
        FileName NVARCHAR(255) NULL,
        MimeType NVARCHAR(100) NULL,
        FileSizeBytes BIGINT NULL,
        AltText NVARCHAR(500) NULL,
        Transcript NVARCHAR(2000) NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_MediaAssets_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_MediaAssets PRIMARY KEY CLUSTERED (MediaAssetID),

        CONSTRAINT FK_MediaAssets_UploadedByUserID FOREIGN KEY (UploadedByUserID)
            REFERENCES dbo.Users(UserID)
            ON DELETE NO ACTION,

        CONSTRAINT CK_MediaAssets_MediaType CHECK
        (
            MediaType IN
            (
                N'AudioUK',
                N'AudioUS',
                N'Image',
                N'ExampleAudio',
                N'QuestionAudio',
                N'QuestionImage'
            )
        ),

        CONSTRAINT CK_MediaAssets_FileSizeBytes CHECK
        (
            FileSizeBytes IS NULL OR FileSizeBytes >= 0
        )
    );
END;
GO

IF OBJECT_ID(N'dbo.ContentMediaLinks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContentMediaLinks
    (
        ContentMediaLinkID BIGINT IDENTITY(1,1) NOT NULL,
        MediaAssetID BIGINT NOT NULL,
        EntityType NVARCHAR(30) NOT NULL,
        EntityID BIGINT NOT NULL,
        Purpose NVARCHAR(50) NULL,
        DisplayOrder INT NOT NULL
            CONSTRAINT DF_ContentMediaLinks_DisplayOrder DEFAULT (1),

        CONSTRAINT PK_ContentMediaLinks PRIMARY KEY CLUSTERED (ContentMediaLinkID),

        CONSTRAINT FK_ContentMediaLinks_MediaAssetID FOREIGN KEY (MediaAssetID)
            REFERENCES dbo.MediaAssets(MediaAssetID)
            ON DELETE CASCADE,

        CONSTRAINT CK_ContentMediaLinks_EntityType CHECK
        (
            EntityType IN (N'Word', N'Question', N'ExampleSentence', N'Topic')
        ),

        CONSTRAINT CK_ContentMediaLinks_DisplayOrder CHECK (DisplayOrder > 0)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_MediaAssets_UploadedByUserID'
      AND object_id = OBJECT_ID(N'dbo.MediaAssets')
)
BEGIN
    CREATE INDEX IX_MediaAssets_UploadedByUserID
    ON dbo.MediaAssets(UploadedByUserID, CreatedAt DESC);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ContentMediaLinks_Entity'
      AND object_id = OBJECT_ID(N'dbo.ContentMediaLinks')
)
BEGIN
    CREATE INDEX IX_ContentMediaLinks_Entity
    ON dbo.ContentMediaLinks(EntityType, EntityID, DisplayOrder);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ContentMediaLinks_MediaAssetID'
      AND object_id = OBJECT_ID(N'dbo.ContentMediaLinks')
)
BEGIN
    CREATE INDEX IX_ContentMediaLinks_MediaAssetID
    ON dbo.ContentMediaLinks(MediaAssetID);
END;
GO


/* ============================================================
   15. MINI TEST ATTEMPTS
   ============================================================ */

IF OBJECT_ID(N'dbo.MiniTestAttempts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MiniTestAttempts
    (
        MiniTestAttemptID BIGINT IDENTITY(1,1) NOT NULL,
        MiniTestID BIGINT NOT NULL,
        UserID BIGINT NOT NULL,
        StartedAt DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_MiniTestAttempts_StartedAt DEFAULT (SYSDATETIMEOFFSET()),
        SubmittedAt DATETIMEOFFSET(7) NULL,
        TotalQuestions INT NOT NULL
            CONSTRAINT DF_MiniTestAttempts_TotalQuestions DEFAULT (0),
        CorrectCount INT NOT NULL
            CONSTRAINT DF_MiniTestAttempts_CorrectCount DEFAULT (0),
        Score DECIMAL(5,2) NULL,

        CONSTRAINT PK_MiniTestAttempts PRIMARY KEY CLUSTERED (MiniTestAttemptID),

        CONSTRAINT FK_MiniTestAttempts_MiniTestID FOREIGN KEY (MiniTestID)
            REFERENCES dbo.MiniTests(MiniTestID)
            ON DELETE CASCADE,

        CONSTRAINT FK_MiniTestAttempts_UserID FOREIGN KEY (UserID)
            REFERENCES dbo.Users(UserID)
            ON DELETE CASCADE,

        CONSTRAINT CK_MiniTestAttempts_TotalQuestions CHECK (TotalQuestions >= 0),
        CONSTRAINT CK_MiniTestAttempts_CorrectCount CHECK (CorrectCount >= 0),
        CONSTRAINT CK_MiniTestAttempts_Score CHECK (Score IS NULL OR Score BETWEEN 0 AND 100)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_MiniTestAttempts_UserID'
      AND object_id = OBJECT_ID(N'dbo.MiniTestAttempts')
)
BEGIN
    CREATE INDEX IX_MiniTestAttempts_UserID
    ON dbo.MiniTestAttempts(UserID, StartedAt DESC);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_MiniTestAttempts_MiniTestID'
      AND object_id = OBJECT_ID(N'dbo.MiniTestAttempts')
)
BEGIN
    CREATE INDEX IX_MiniTestAttempts_MiniTestID
    ON dbo.MiniTestAttempts(MiniTestID, StartedAt DESC);
END;
GO


/* ============================================================
   16. USEFUL ANALYTICS VIEWS
   ============================================================ */

IF OBJECT_ID(N'dbo.vw_ContentCreatorContentSummary', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_ContentCreatorContentSummary;
END;
GO

CREATE VIEW dbo.vw_ContentCreatorContentSummary
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

IF OBJECT_ID(N'dbo.vw_TopicLearningAnalytics', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_TopicLearningAnalytics;
END;
GO

CREATE VIEW dbo.vw_TopicLearningAnalytics
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

IF OBJECT_ID(N'dbo.vw_MiniTestAnalytics', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_MiniTestAnalytics;
END;
GO

CREATE VIEW dbo.vw_MiniTestAnalytics
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



/* ============================================================
   18. TOPIC CATEGORIES / DANH MỤC CHỦ ĐỀ
   Purpose:
     - Thêm danh mục chủ đề cha cho Topics
     - Ví dụ: Business English -> Economy, Office, Meeting
     - Giữ Learner chọn Topic như cũ thông qua UserTopicEnrollments
   ============================================================ */

USE ToeicVocabularyPlatform;
GO

/* 18.1. CREATE TopicCategories TABLE */
IF OBJECT_ID(N'dbo.TopicCategories', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TopicCategories
    (
        TopicCategoryID BIGINT IDENTITY(1,1) NOT NULL,
        CategoryName NVARCHAR(255) NOT NULL,
        CategoryCode NVARCHAR(100) NOT NULL,
        Description NVARCHAR(1000) NULL,
        IconUrl NVARCHAR(1000) NULL,
        DisplayOrder INT NOT NULL
            CONSTRAINT DF_TopicCategories_DisplayOrder DEFAULT (1),
        IsActive BIT NOT NULL
            CONSTRAINT DF_TopicCategories_IsActive DEFAULT (1),
        CreatedByUserID BIGINT NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_TopicCategories_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_TopicCategories_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_TopicCategories PRIMARY KEY CLUSTERED (TopicCategoryID),
        CONSTRAINT UQ_TopicCategories_CategoryCode UNIQUE (CategoryCode),

        CONSTRAINT FK_TopicCategories_CreatedByUserID FOREIGN KEY (CreatedByUserID)
            REFERENCES dbo.Users(UserID)
            ON DELETE NO ACTION,

        CONSTRAINT CK_TopicCategories_DisplayOrder CHECK (DisplayOrder > 0)
    );
END;
GO

/* 18.2. ADD TopicCategoryID TO Topics */
IF COL_LENGTH(N'dbo.Topics', N'TopicCategoryID') IS NULL
BEGIN
    ALTER TABLE dbo.Topics
    ADD TopicCategoryID BIGINT NULL;
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Topics_TopicCategoryID'
)
BEGIN
    ALTER TABLE dbo.Topics
    ADD CONSTRAINT FK_Topics_TopicCategoryID FOREIGN KEY (TopicCategoryID)
        REFERENCES dbo.TopicCategories(TopicCategoryID)
        ON DELETE NO ACTION;
END;
GO

/* 18.3. ADD INDEXES */
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_TopicCategories_IsActive_DisplayOrder'
      AND object_id = OBJECT_ID(N'dbo.TopicCategories')
)
BEGIN
    CREATE INDEX IX_TopicCategories_IsActive_DisplayOrder
    ON dbo.TopicCategories(IsActive, DisplayOrder, CategoryName);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Topics_TopicCategoryID_ContentStatus'
      AND object_id = OBJECT_ID(N'dbo.Topics')
)
BEGIN
    CREATE INDEX IX_Topics_TopicCategoryID_ContentStatus
    ON dbo.Topics(TopicCategoryID, ContentStatus);
END;
GO

/* 18.4. SEED DEFAULT TOPIC CATEGORIES */
INSERT INTO dbo.TopicCategories
(
    CategoryName,
    CategoryCode,
    Description,
    DisplayOrder,
    IsActive
)
SELECT v.CategoryName, v.CategoryCode, v.Description, v.DisplayOrder, 1
FROM
(
    VALUES
    (N'Business English', N'BUSINESS_ENGLISH', N'Từ vựng tiếng Anh thương mại, công sở, kinh tế, hợp đồng, cuộc họp', 1),
    (N'Daily Life', N'DAILY_LIFE', N'Từ vựng giao tiếp đời sống hằng ngày', 2),
    (N'Travel English', N'TRAVEL_ENGLISH', N'Từ vựng du lịch, sân bay, khách sạn, chỉ đường', 3),
    (N'TOEIC Skills', N'TOEIC_SKILLS', N'Từ vựng và bài học theo kỹ năng TOEIC', 4),
    (N'Academic English', N'ACADEMIC_ENGLISH', N'Từ vựng học thuật, giáo dục, nghiên cứu', 5),
    (N'Technology', N'TECHNOLOGY', N'Từ vựng công nghệ, phần mềm, internet, dữ liệu', 6)
) AS v(CategoryName, CategoryCode, Description, DisplayOrder)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.TopicCategories tc
    WHERE tc.CategoryCode = v.CategoryCode
);
GO

/* 18.5. MAP EXISTING TOPICS TO CATEGORIES BY KEYWORD */
UPDATE t
SET TopicCategoryID = tc.TopicCategoryID
FROM dbo.Topics t
JOIN dbo.TopicCategories tc
    ON tc.CategoryCode = N'BUSINESS_ENGLISH'
WHERE t.TopicCategoryID IS NULL
  AND
  (
      t.TopicName LIKE N'%Economy%'
      OR t.TopicName LIKE N'%Office%'
      OR t.TopicName LIKE N'%Business%'
      OR t.TopicName LIKE N'%Meeting%'
      OR t.TopicName LIKE N'%Contract%'
  );
GO

UPDATE t
SET TopicCategoryID = tc.TopicCategoryID
FROM dbo.Topics t
JOIN dbo.TopicCategories tc
    ON tc.CategoryCode = N'TRAVEL_ENGLISH'
WHERE t.TopicCategoryID IS NULL
  AND
  (
      t.TopicName LIKE N'%Travel%'
      OR t.TopicName LIKE N'%Airport%'
      OR t.TopicName LIKE N'%Hotel%'
      OR t.TopicName LIKE N'%Direction%'
  );
GO

UPDATE t
SET TopicCategoryID = tc.TopicCategoryID
FROM dbo.Topics t
JOIN dbo.TopicCategories tc
    ON tc.CategoryCode = N'TOEIC_SKILLS'
WHERE t.TopicCategoryID IS NULL
  AND
  (
      t.TopicName LIKE N'%TOEIC%'
      OR t.TopicName LIKE N'%Part 1%'
      OR t.TopicName LIKE N'%Part 2%'
      OR t.TopicName LIKE N'%Part 3%'
      OR t.TopicName LIKE N'%Part 4%'
      OR t.TopicName LIKE N'%Part 5%'
      OR t.TopicName LIKE N'%Part 6%'
      OR t.TopicName LIKE N'%Part 7%'
  );
GO

/* 18.6. ADD PERMISSION: MANAGE_TOPIC_CATEGORIES */
INSERT INTO dbo.Permissions (PermissionCode, Description)
SELECT N'MANAGE_TOPIC_CATEGORIES', N'Quản lý danh mục chủ đề'
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Permissions
    WHERE PermissionCode = N'MANAGE_TOPIC_CATEGORIES'
);
GO

/* Khuyến nghị: chỉ Admin quản lý danh mục chủ đề */
INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM dbo.Roles r
JOIN dbo.Permissions p
    ON p.PermissionCode = N'MANAGE_TOPIC_CATEGORIES'
WHERE r.RoleName = N'Admin'
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.RolePermissions rp
      WHERE rp.RoleID = r.RoleID
        AND rp.PermissionID = p.PermissionID
  );
GO

/* 18.7. VIEW: CATEGORY SUMMARY */
IF OBJECT_ID(N'dbo.vw_TopicCategorySummary', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_TopicCategorySummary;
END;
GO

CREATE VIEW dbo.vw_TopicCategorySummary
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

/* 18.8. FINAL CHECK: TOPIC CATEGORIES */
SELECT
    tc.TopicCategoryID,
    tc.CategoryName,
    tc.CategoryCode,
    tc.DisplayOrder,
    tc.IsActive,
    COUNT(t.TopicID) AS TotalTopics
FROM dbo.TopicCategories tc
LEFT JOIN dbo.Topics t
    ON t.TopicCategoryID = tc.TopicCategoryID
GROUP BY
    tc.TopicCategoryID,
    tc.CategoryName,
    tc.CategoryCode,
    tc.DisplayOrder,
    tc.IsActive
ORDER BY tc.DisplayOrder;
GO


/* ============================================================
   17. FINAL CHECK RESULT
   ============================================================ */

SELECT
    r.RoleName,
    COUNT(rp.PermissionID) AS PermissionCount
FROM dbo.Roles r
LEFT JOIN dbo.RolePermissions rp
    ON rp.RoleID = r.RoleID
GROUP BY r.RoleName
ORDER BY r.RoleName;
GO

SELECT
    u.UserID,
    u.FullName,
    u.Email,
    u.UserRole,
    r.RoleName,
    u.IsActive
FROM dbo.Users u
JOIN dbo.Roles r
    ON r.RoleID = u.RoleID
ORDER BY u.UserID;
GO