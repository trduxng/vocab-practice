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
        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, IsActive, CreatedAt, UpdatedAt)
        OUTPUT inserted.UserID, inserted.FullName, inserted.Email, inserted.UserRole
        VALUES (@FullName, @Email, @PasswordHash, 'Learner', 1, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);

    return result.recordset[0];
  }

  static async login(email, password) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query(`
        SELECT UserID, FullName, Email, PasswordHash, UserRole FROM Users WHERE Email = @Email AND IsActive = 1
      `);

    const user = result.recordset[0];
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const payload = {
      id: user.UserID,
      fullName: user.FullName,
      role: user.UserRole
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return {
      token,
      user: {
        id: user.UserID,
        fullName: user.FullName,
        email: user.Email,
        role: user.UserRole
      }
    };
  }
}

module.exports = AuthService;
