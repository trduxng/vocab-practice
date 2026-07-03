// vocab-practice/backend/src/controllers/auth.controller.js
const AuthService = require("../services/auth.service");

class AuthController {
  static async register(req, res, next) {
    try {
      const { fullName, email, password, role } = req.body;
      if (!fullName || !email || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp đủ thông tin" });
      }

      const user = await AuthService.register(fullName, email, password, role);
      res.status(201).json({ message: "Đăng ký thành công", user });
    } catch (error) {
      if (error.message === "Email đã tồn tại") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(userId, oldPassword, newPassword);
      res.status(200).json(result);
    } catch (error) {
      if (['Thiếu thông tin mật khẩu cũ hoặc mới', 'Mật khẩu mới phải từ 6 ký tự trở lên', 'Mật khẩu cũ không chính xác', 'Người dùng không tồn tại'].includes(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp email và mật khẩu" });
      }

      const data = await AuthService.login(email, password);
      res.status(200).json({ message: "Đăng nhập thành công", ...data });
    } catch (error) {
      if (error.message === "Email hoặc mật khẩu không chính xác") {
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = AuthController;
