IF OBJECT_ID(N'dbo.ContentReports', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContentReports
    (
        ContentReportID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ContentReports PRIMARY KEY,
        ReporterUserID BIGINT NOT NULL,
        EntityType NVARCHAR(30) NOT NULL,
        WordID BIGINT NULL,
        QuestionID BIGINT NULL,
        ReportType NVARCHAR(50) NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(2000) NOT NULL,
        Status NVARCHAR(30) NOT NULL CONSTRAINT DF_ContentReports_Status DEFAULT (N'Open'),
        Priority NVARCHAR(20) NOT NULL CONSTRAINT DF_ContentReports_Priority DEFAULT (N'Normal'),
        AdminResponse NVARCHAR(2000) NULL,
        ResolvedByUserID BIGINT NULL,
        ResolvedAt DATETIMEOFFSET(7) NULL,
        CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ContentReports_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ContentReports_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT FK_ContentReports_ReporterUserID FOREIGN KEY (ReporterUserID) REFERENCES dbo.Users(UserID),
        CONSTRAINT FK_ContentReports_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID),
        CONSTRAINT FK_ContentReports_QuestionID FOREIGN KEY (QuestionID) REFERENCES dbo.Questions(QuestionID),
        CONSTRAINT FK_ContentReports_ResolvedByUserID FOREIGN KEY (ResolvedByUserID) REFERENCES dbo.Users(UserID),
        CONSTRAINT CK_ContentReports_EntityType CHECK (EntityType IN (N'Word', N'Question', N'Audio', N'General')),
        CONSTRAINT CK_ContentReports_ReportType CHECK (ReportType IN (N'WordIncorrect', N'AudioIssue', N'AnswerIncorrect', N'Typo', N'Other')),
        CONSTRAINT CK_ContentReports_Status CHECK (Status IN (N'Open', N'InReview', N'Resolved', N'Rejected')),
        CONSTRAINT CK_ContentReports_Priority CHECK (Priority IN (N'Low', N'Normal', N'High', N'Urgent'))
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_Status_CreatedAt' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
    CREATE INDEX IX_ContentReports_Status_CreatedAt ON dbo.ContentReports(Status, CreatedAt DESC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_ReportType' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
    CREATE INDEX IX_ContentReports_ReportType ON dbo.ContentReports(ReportType);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_ReporterUserID' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
    CREATE INDEX IX_ContentReports_ReporterUserID ON dbo.ContentReports(ReporterUserID, CreatedAt DESC);

IF OBJECT_ID(N'dbo.Permissions', N'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.Permissions (PermissionCode, Description)
    SELECT N'MANAGE_REPORTS', N'Quản lý báo cáo và phản hồi từ người học'
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Permissions WHERE PermissionCode = N'MANAGE_REPORTS');
END;

IF OBJECT_ID(N'dbo.RolePermissions', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.Roles', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.Permissions', N'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
    SELECT r.RoleID, p.PermissionID
    FROM dbo.Roles r
    JOIN dbo.Permissions p ON p.PermissionCode = N'MANAGE_REPORTS'
    WHERE r.RoleName = N'Admin'
      AND NOT EXISTS (
          SELECT 1
          FROM dbo.RolePermissions rp
          WHERE rp.RoleID = r.RoleID
            AND rp.PermissionID = p.PermissionID
      );
END;
