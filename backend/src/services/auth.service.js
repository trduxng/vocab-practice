const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  static async register(fullName, email, password) {
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

    const result = await pool.request()
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('PasswordHash', sql.NVarChar(500), hashedPassword)
      .query(`
        DECLARE @DefaultRoleID INT;
        SELECT @DefaultRoleID = RoleID FROM Roles WHERE RoleName = 'Learner';

        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, RoleID, IsActive, CreatedAt, UpdatedAt)
        OUTPUT inserted.UserID AS id, inserted.FullName AS fullName, inserted.Email AS email
        VALUES (@FullName, @Email, @PasswordHash, 'Learner', @DefaultRoleID, 1, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);

    const user = result.recordset[0];
    return { ...user, role: 'Learner', permissions: ['VIEW_DASHBOARD', 'LEARN_VOCAB'] };
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
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      permissions
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return {
      token,
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
