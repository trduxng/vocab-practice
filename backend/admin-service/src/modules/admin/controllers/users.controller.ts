import UserService from '../services/users.service.ts';

class UserController {
  static async getStudents(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const students = await UserService.getStudents(page, limit, {
        search: req.query.search,
        status: req.query.status,
        role: req.query.role
      });
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      const result = await UserService.createUser(req.body);
      res.status(201).json({ message: 'Tạo user thành công', data: result });
    } catch (error) {
      if (error.message === 'Email already exists' || error.message === 'Invalid role' || error.message === 'Invalid user data') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const success = await UserService.updateUser(id, req.body);

      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
      }

      res.status(200).json({ message: 'Cập nhật user thành công' });
    } catch (error) {
      if (error.message === 'Email already exists' || error.message === 'Invalid role' || error.message === 'Invalid user data') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const success = await UserService.deleteUser(id);

      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
      }

      res.status(200).json({ message: 'Xóa user thành công' });
    } catch (error) {
      if (error.message === 'User owns content') {
        return res.status(409).json({
          message: 'Không thể xóa user đã tạo nội dung. Hãy khóa tài khoản thay vì xóa.'
        });
      }
      next(error);
    }
  }

  static async toggleStudentStatus(req, res, next) {
    try {
      const { id } = req.params;
      await UserService.toggleUserStatus(id);
      res.status(200).json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      await UserService.updateUserRole(id, role);
      res.status(200).json({ message: 'Cập nhật vai trò thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentDetail(req, res, next) {
    try {
      const studentId = parseInt(req.params.id, 10);
      if (!studentId) return res.status(400).json({ message: 'ID không hợp lệ' });
      const data = await UserService.getStudentDetail(studentId);
      if (!data) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
