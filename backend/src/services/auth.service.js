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
        OUTPUT inserted.UserID AS id, inserted.FullName AS fullName, inserted.Email AS email, inserted.UserRole AS role
        VALUES (@FullName, @Email, @PasswordHash, 'Learner', 1, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);

    return result.recordset[0];
  }

  static async login(email, password) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query(`
        SELECT UserID AS id, FullName AS fullName, Email AS email, PasswordHash AS passwordHash, UserRole AS role 
        FROM Users WHERE Email = @Email AND IsActive = 1
      `);

    const user = result.recordset[0];
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const payload = {
      id: user.id,
      fullName: user.fullName,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    };
  }
}

module.exports = AuthService;
