// vocab-practice/backend/src/controllers/admin.controller.js
const AdminService = require("../services/admin.service");

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
      res.status(201).json({ message: "Tạo từ vựng thành công", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async bulkImportWords(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await AdminService.bulkInsertWords(req.body, adminId);
      res.status(200).json({
        message: 'Bulk word import completed',
        ...result
      });
    } catch (error) {
      if (
        error.message === 'Invalid import payload' ||
        error.message.startsWith('CSV must include')
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateWord(req, res, next) {
    try {
      const { id } = req.params;
      const wordData = req.body;
      const success = await AdminService.updateWord(id, wordData);
      if (success) {
        res.status(200).json({ message: "Cập nhật thành công" });
      } else {
        res.status(404).json({ message: "Không tìm thấy từ vựng" });
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteWord(req, res, next) {
    try {
      const { id } = req.params;
      const success = await AdminService.deleteWord(id);
      if (!success) {
        return res.status(404).json({ message: "Khong tim thay tu vung" });
      }
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
      res.status(201).json({ message: "Tạo câu hỏi thành công", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getOverviewStats(req, res, next) {
    try {
      const stats = await AdminService.getOverviewStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getWeeklyActivity(req, res, next) {
    try {
      const activity = await AdminService.getWeeklyActivity();
      res.status(200).json(activity);
    } catch (error) {
      next(error);
    }
  }

  static async getTodayActivity(req, res, next) {
    try {
      const activity = await AdminService.getTodayActivity();
      res.status(200).json(activity);
    } catch (error) {
      next(error);
    }
  }

  static async getRecentUsers(req, res, next) {
    try {
      const users = await AdminService.getRecentUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getTopCourses(req, res, next) {
    try {
      const courses = await AdminService.getTopCourses();
      res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  }

  static async bulkImportQuestions(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await AdminService.bulkInsertQuestions(req.body, adminId);
      res.status(200).json({
        message: 'Bulk import completed',
        ...result
      });
    } catch (error) {
      if (error.message === 'Invalid import payload' || error.message.startsWith('CSV must include')) {
        return res.status(400).json({ message: error.message });
      }
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

  static async createUser(req, res, next) {
    try {
      const result = await AdminService.createUser(req.body);
      res.status(201).json({ message: 'Tao user thanh cong', data: result });
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
      const success = await AdminService.updateUser(id, req.body);

      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay user' });
      }

      res.status(200).json({ message: 'Cap nhat user thanh cong' });
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
      const success = await AdminService.deleteUser(id);

      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay user' });
      }

      res.status(200).json({ message: 'Xoa user thanh cong' });
    } catch (error) {
      if (error.message === 'User owns content') {
        return res.status(409).json({
          message: 'Khong the xoa user da tao noi dung. Hay khoa tai khoan thay vi xoa.'
        });
      }
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

  static async getContentManagement(req, res, next) {
    try {
      const data = await AdminService.getContentManagementData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getModeration(req, res, next) {
    try {
      const data = await AdminService.getModerationData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getSystemSettings(req, res, next) {
    try {
      const data = await AdminService.getSystemSettingsData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const data = await AdminService.getNotifications(limit);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async sendAnnouncement(req, res, next) {
    try {
      const result = await AdminService.sendAnnouncement(req.body);
      res.status(201).json({ message: 'Announcement queued', data: result });
    } catch (error) {
      if (error.message === 'Missing title or message') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async createDailyReminders(req, res, next) {
    try {
      const result = await AdminService.createDailyReminders();
      res.status(201).json({ message: 'Daily reminders queued', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
