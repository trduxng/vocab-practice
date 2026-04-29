const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  static async register(username, email, password) {
    const pool = await poolPromise;
    
    // Check if user exists
    const checkUser = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .input('Username', sql.NVarChar(100), username)
      .query(`
        SELECT UserID FROM Users WHERE Email = @Email OR Username = @Username
      `);
      
    if (checkUser.recordset.length > 0) {
      throw new Error('Email hoặc Username đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input('Username', sql.NVarChar(100), username)
      .input('Email', sql.NVarChar(255), email)
      .input('PasswordHash', sql.NVarChar(255), hashedPassword)
      .query(`
        INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt, UpdatedAt)
        OUTPUT inserted.UserID, inserted.Username, inserted.Email, inserted.Role
        VALUES (@Username, @Email, @PasswordHash, 'User', GETDATE(), GETDATE())
      `);

    return result.recordset[0];
  }

  static async login(email, password) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query(`
        SELECT UserID, Username, Email, PasswordHash, Role FROM Users WHERE Email = @Email
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
      username: user.Username,
      role: user.Role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return {
      token,
      user: {
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        role: user.Role
      }
    };
  }
}

module.exports = AuthService;
