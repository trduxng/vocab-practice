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
        SELECT NguoiDungID FROM NguoiDung WHERE Email = @Email
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
        DECLARE @DefaultVaiTroID INT;
        SELECT @DefaultVaiTroID = VaiTroID FROM VaiTro WHERE TenVaiTro = 'NguoiHoc';

        INSERT INTO NguoiDung (HoTen, Email, MatKhauHash, VaiTroNguoiDung, VaiTroID, DangHoatDong, ThoiDiemTao, ThoiDiemCapNhat)
        OUTPUT inserted.NguoiDungID AS id, inserted.HoTen AS fullName, inserted.Email AS email
        VALUES (@FullName, @Email, @PasswordHash, 'NguoiHoc', @DefaultVaiTroID, 1, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);

    const user = result.recordset[0];
    return { ...user, role: 'NguoiHoc', permissions: ['XEM_BANG_DIEU_KHIEN', 'HOC_TU_VUNG'] };
  }

  static async login(email, password) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query(`
        SELECT u.NguoiDungID AS id, u.HoTen AS fullName, u.Email AS email, 
               u.MatKhauHash AS passwordHash, r.TenVaiTro AS role 
        FROM NguoiDung u
        JOIN VaiTro r ON u.VaiTroID = r.VaiTroID
        WHERE u.Email = @Email AND u.DangHoatDong = 1
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
        SELECT p.MaQuyen AS PermissionCode
        FROM QuyenVaiTro rp
        JOIN Quyen p ON rp.QuyenID = p.QuyenID
        JOIN NguoiDung u ON rp.VaiTroID = u.VaiTroID
        WHERE u.NguoiDungID = @UserID
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
