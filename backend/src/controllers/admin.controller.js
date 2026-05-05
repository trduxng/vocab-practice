const AdminService = require('../services/admin.service');

class AdminController {
  // Words
  static async getWords(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const words = await AdminService.getWords(page, limit);
      res.status(200).json(words);
    } catch (error) {
      next(error);
    }
  }

  static async createWord(req, res, next) {
    try {
      const adminId = req.user.id;
      const wordData = req.body;
      const result = await AdminService.createWord(wordData, adminId);
      res.status(201).json({ message: 'Tạo từ vựng thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateWord(req, res, next) {
    try {
      const { id } = req.params;
      const wordData = req.body;
      const success = await AdminService.updateWord(id, wordData);
      if (success) {
        res.status(200).json({ message: 'Cập nhật thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy từ vựng' });
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteWord(req, res, next) {
    try {
      const { id } = req.params;
      await AdminService.deleteWord(id);
      res.status(200).json({ message: 'Xóa từ vựng thành công' });
    } catch (error) {
      next(error);
    }
  }

  // Questions
  static async getQuestionsByWord(req, res, next) {
    try {
      const { wordId } = req.params;
      const questions = await AdminService.getQuestionsByWord(wordId);
      res.status(200).json(questions);
    } catch (error) {
      next(error);
    }
  }

  static async createQuestion(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await AdminService.createQuestion(req.body, adminId);
      res.status(201).json({ message: 'Tạo câu hỏi thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  // Mini Tests
  static async getMiniTests(req, res, next) {
    try {
      const tests = await AdminService.getMiniTests();
      res.status(200).json(tests);
    } catch (error) {
      next(error);
    }
  }

  static async createMiniTest(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await AdminService.createMiniTest(req.body, adminId);
      res.status(201).json({ message: 'Tạo Mini Test thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getStudents(req, res, next) {
    try {
      const students = await AdminService.getStudents();
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  }

  static async toggleStudentStatus(req, res, next) {
    try {
      const { id } = req.params;
      await AdminService.toggleUserStatus(id);
      res.status(200).json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      await AdminService.updateUserRole(id, role);
      res.status(200).json({ message: 'Cập nhật vai trò thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const data = await AdminService.getAnalyticsData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
