const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const GamificationService = require('./gamification.service');

class AuthService {
  static async register(fullName, email, password, role) {
    const pool = await poolPromise;
    
    // Check if user exists
    const checkUser = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query(`
        SELECT UserID FROM Users WHERE Email = @Email
      `);
      
    if (checkUser.recordset.length > 0) {
      throw new Error('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Map role
    let targetRoleName = 'Learner';
    let targetUserRole = 'Learner';
    if (role === 'Teacher' || role === 'ContentCreator') {
      targetRoleName = 'ContentCreator';
      targetUserRole = 'ContentCreator';
    }

    const result = await pool.request()
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('PasswordHash', sql.NVarChar(500), hashedPassword)
      .input('RoleName', sql.NVarChar(50), targetRoleName)
      .input('UserRole', sql.NVarChar(50), targetUserRole)
      .query(`
        DECLARE @TargetRoleID INT;
        SELECT @TargetRoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

        IF @TargetRoleID IS NULL
        BEGIN
          SELECT @TargetRoleID = RoleID FROM Roles WHERE RoleName = 'Learner';
        END

        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, RoleID, IsActive, CreatedAt, UpdatedAt)
        OUTPUT inserted.UserID AS id, inserted.FullName AS fullName, inserted.Email AS email
        VALUES (@FullName, @Email, @PasswordHash, ISNULL(@UserRole, 'Learner'), @TargetRoleID, 1, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);

    const user = result.recordset[0];

    // Fetch Permissions dynamically
    const permResult = await pool.request()
      .input('UserID', sql.BigInt, user.id)
      .query(`
        SELECT p.PermissionCode
        FROM RolePermissions rp
        JOIN Permissions p ON rp.PermissionID = p.PermissionID
        JOIN Users u ON rp.RoleID = u.RoleID
        WHERE u.UserID = @UserID
      `);
    
    const permissions = permResult.recordset.map(r => r.PermissionCode);
    return { ...user, role: targetRoleName, permissions };
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const pool = await poolPromise;

    if (!oldPassword || !newPassword) {
      throw new Error('Thiếu thông tin mật khẩu cũ hoặc mới');
    }
    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải từ 6 ký tự trở lên');
    }

    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`SELECT PasswordHash FROM Users WHERE UserID = @UserID`);

    const user = result.recordset[0];
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!isMatch) {
      throw new Error('Mật khẩu cũ không chính xác');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('PasswordHash', sql.NVarChar(500), hashedPassword)
      .query(`UPDATE Users SET PasswordHash = @PasswordHash, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID`);

    return { message: 'Thay đổi mật khẩu thành công' };
  }

  static async login(email, password) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query(`
        SELECT u.UserID AS id, u.FullName AS fullName, u.Email AS email, 
               u.PasswordHash AS passwordHash, r.RoleName AS role 
        FROM Users u
        JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.Email = @Email AND u.IsActive = 1
      `);

    const user = result.recordset[0];
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    // Fetch Permissions
    const permResult = await pool.request()
      .input('UserID', sql.BigInt, user.id)
      .query(`
        SELECT p.PermissionCode
        FROM RolePermissions rp
        JOIN Permissions p ON rp.PermissionID = p.PermissionID
        JOIN Users u ON rp.RoleID = u.RoleID
        WHERE u.UserID = @UserID
      `);
    
    const permissions = permResult.recordset.map(r => r.PermissionCode);

    const payload = {
      id: Number(user.id),
      fullName: user.fullName,
      role: user.role,
      permissions
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    let gamification = null;
    if (user.role === 'Learner') {
      try {
        gamification = await GamificationService.awardDailyLogin(user.id);
      } catch (error) {
        console.error('[AuthService.login] Failed to award daily login XP:', error);
      }
    }

    return {
      token,
      gamification,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions
      }
    };
  }
}

module.exports = AuthService;
