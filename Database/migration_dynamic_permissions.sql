/* ============================================================
   MIGRATION: ADD DYNAMIC PERMISSIONS
   Date: 2026-05-20
   Purpose: Thêm quyền quản lý thông báo cho vai trò Admin
   ============================================================ */

USE ToeicVocabularyPlatform;
GO

-- 1. Thêm quyền MANAGE_NOTIFICATIONS vào bảng Permissions nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM dbo.Permissions WHERE PermissionCode = N'MANAGE_NOTIFICATIONS')
BEGIN
    INSERT INTO dbo.Permissions (PermissionCode, Description)
    VALUES (N'MANAGE_NOTIFICATIONS', N'Quản lý thông báo và thông báo đẩy');
    
    PRINT 'Added permission: MANAGE_NOTIFICATIONS';
END
ELSE
BEGIN
    PRINT 'Permission MANAGE_NOTIFICATIONS already exists.';
END
GO

-- 2. Gán quyền MANAGE_NOTIFICATIONS cho vai trò Admin
INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM dbo.Roles r
JOIN dbo.Permissions p ON p.PermissionCode = N'MANAGE_NOTIFICATIONS'
WHERE r.RoleName = N'Admin'
  AND NOT EXISTS (
      SELECT 1 
      FROM dbo.RolePermissions rp 
      WHERE rp.RoleID = r.RoleID 
        AND rp.PermissionID = p.PermissionID
  );

IF @@ROWCOUNT > 0
    PRINT 'Assigned MANAGE_NOTIFICATIONS to Admin role.';
ELSE
    PRINT 'MANAGE_NOTIFICATIONS is already assigned to Admin or Admin role not found.';
GO
