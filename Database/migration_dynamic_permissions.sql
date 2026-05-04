-- MIGRATION SCRIPT: DYNAMIC PERMISSIONS (FIXED V2)
USE ToeicVocabularyPlatform;
GO

-- Batch 1: Create Tables
IF OBJECT_ID('dbo.Permissions', 'U') IS NULL
CREATE TABLE dbo.Permissions (
    PermissionID INT IDENTITY(1,1) PRIMARY KEY,
    PermissionCode NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL
);
GO

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
CREATE TABLE dbo.Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL
);
GO

IF OBJECT_ID('dbo.RolePermissions', 'U') IS NULL
CREATE TABLE dbo.RolePermissions (
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleID, PermissionID),
    CONSTRAINT FK_RolePermissions_Role FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID) ON DELETE CASCADE,
    CONSTRAINT FK_RolePermissions_Permission FOREIGN KEY (PermissionID) REFERENCES dbo.Permissions(PermissionID) ON DELETE CASCADE
);
GO

-- Batch 2: Seed Initial Data
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Admin')
BEGIN
    INSERT INTO dbo.Permissions (PermissionCode, Description)
    VALUES 
    ('VIEW_DASHBOARD', N'Xem dashboard'),
    ('MANAGE_WORDS', N'Quản lý từ vựng'),
    ('MANAGE_QUESTIONS', N'Quản lý câu hỏi'),
    ('MANAGE_TESTS', N'Quản lý bài thi'),
    ('MANAGE_USERS', N'Quản lý người dùng'),
    ('LEARN_VOCAB', N'Học từ vựng');

    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES 
    ('Admin', N'Quản trị viên toàn quyền'),
    ('Learner', N'Người học thường');

    -- Assign Permissions to Admin (All)
    INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
    SELECT (SELECT RoleID FROM dbo.Roles WHERE RoleName = 'Admin'), PermissionID FROM dbo.Permissions;

    -- Assign Permissions to Learner
    INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
    SELECT (SELECT RoleID FROM dbo.Roles WHERE RoleName = 'Learner'), PermissionID 
    FROM dbo.Permissions WHERE PermissionCode IN ('VIEW_DASHBOARD', 'LEARN_VOCAB');
END
GO

-- Batch 3: Add Column
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'RoleID')
BEGIN
    ALTER TABLE dbo.Users ADD RoleID INT NULL;
END
GO

-- Batch 4: Migrate Data
DECLARE @LearnerRoleID INT;
SELECT @LearnerRoleID = RoleID FROM dbo.Roles WHERE RoleName = 'Learner';
DECLARE @AdminRoleID INT;
SELECT @AdminRoleID = RoleID FROM dbo.Roles WHERE RoleName = 'Admin';

UPDATE dbo.Users SET RoleID = @AdminRoleID WHERE UserRole = 'Admin' AND RoleID IS NULL;
UPDATE dbo.Users SET RoleID = @LearnerRoleID WHERE (UserRole = 'Learner' OR UserRole IS NULL) AND RoleID IS NULL;
UPDATE dbo.Users SET RoleID = @LearnerRoleID WHERE RoleID IS NULL;
GO

-- Batch 5: Make Non-Nullable
ALTER TABLE dbo.Users ALTER COLUMN RoleID INT NOT NULL;
GO
