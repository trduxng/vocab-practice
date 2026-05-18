// vocab-practice/backend/src/controllers/admin.controller.js
const AdminService = require("../services/admin.service");

class AdminController {
  // Topics
  static async createTopic(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await AdminService.createTopic(req.body, adminId);
      res.status(201).json({ message: "Tao chu de thanh cong", data: result });
    } catch (error) {
      if (
        error.message === 'Invalid topic data' ||
        error.message === 'Topic already exists' ||
        error.message === 'Topic code already exists'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateTopic(req, res, next) {
    try {
      const success = await AdminService.updateTopic(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay chu de' });
      }
      res.status(200).json({ message: 'Cap nhat chu de thanh cong' });
    } catch (error) {
      if (['Invalid topic data', 'Topic already exists', 'Topic code already exists'].includes(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async deleteTopic(req, res, next) {
    try {
      const result = await AdminService.deleteTopic(req.params.id, req.user.id);
      if (!result.success) {
        return res.status(404).json({ message: 'Khong tim thay chu de' });
      }
      res.status(200).json({
        message: result.archived ? 'Da luu tru chu de vi dang co noi dung lien quan' : 'Xoa chu de thanh cong',
        archived: result.archived
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTopicCategory(req, res, next) {
    try {
      const result = await AdminService.createTopicCategory(req.body, req.user.id);
      res.status(201).json({ message: 'Tao danh muc chu de thanh cong', data: result });
    } catch (error) {
      if (['Invalid topic category data', 'Topic category code already exists'].includes(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateTopicCategory(req, res, next) {
    try {
      const success = await AdminService.updateTopicCategory(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay danh muc chu de' });
      }
      res.status(200).json({ message: 'Cap nhat danh muc chu de thanh cong' });
    } catch (error) {
      if (['Invalid topic category data', 'Topic category code already exists'].includes(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async deleteTopicCategory(req, res, next) {
    try {
      const success = await AdminService.deleteTopicCategory(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay danh muc chu de' });
      }
      res.status(200).json({ message: 'Da tat danh muc chu de' });
    } catch (error) {
      next(error);
    }
  }

  // Words
  static async getWords(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const words = await AdminService.getWords(page, limit, {
        topicId: req.query.topicId,
        search: req.query.search
      });
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
      const success = await AdminService.updateWord(id, wordData, req.user.id);
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
      const success = await AdminService.deleteWord(id, req.user.id);
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
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const questions = await AdminService.getQuestionsByWord(wordId, page, limit, {
        search: req.query.search,
        type: req.query.type,
        status: req.query.status
      });
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

  static async updateQuestion(req, res, next) {
    try {
      const success = await AdminService.updateQuestion(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay cau hoi' });
      }
      res.status(200).json({ message: 'Cap nhat cau hoi thanh cong' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteQuestion(req, res, next) {
    try {
      const success = await AdminService.deleteQuestion(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay cau hoi' });
      }
      res.status(200).json({ message: 'Xoa cau hoi thanh cong' });
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
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const tests = await AdminService.getMiniTests(page, limit, {
        search: req.query.search,
        topicId: req.query.topicId,
        status: req.query.status
      });
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

  static async updateMiniTest(req, res, next) {
    try {
      const success = await AdminService.updateMiniTest(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay mini test' });
      }
      res.status(200).json({ message: 'Cap nhat mini test thanh cong' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMiniTest(req, res, next) {
    try {
      const success = await AdminService.deleteMiniTest(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay mini test' });
      }
      res.status(200).json({ message: 'Xoa mini test thanh cong' });
    } catch (error) {
      next(error);
    }
  }

  static async publishMiniTest(req, res, next) {
    try {
      const success = await AdminService.setMiniTestStatus(req.params.id, 'Published', req.user.id, 'Published from mini test manager');
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay mini test' });
      }
      res.status(200).json({ message: 'Xuat ban mini test thanh cong' });
    } catch (error) {
      next(error);
    }
  }

  static async archiveMiniTest(req, res, next) {
    try {
      const success = await AdminService.setMiniTestStatus(req.params.id, 'Archived', req.user.id, 'Archived from mini test manager');
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay mini test' });
      }
      res.status(200).json({ message: 'Luu tru mini test thanh cong' });
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
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const students = await AdminService.getStudents(page, limit, {
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

  static async updateContentStatus(req, res, next) {
    try {
      const success = await AdminService.updateContentStatus(req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Khong tim thay noi dung' });
      }
      res.status(200).json({ message: 'Cap nhat trang thai noi dung thanh cong' });
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
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const data = await AdminService.getNotifications(page, limit, {
        search: req.query.search,
        type: req.query.type,
        deliveryChannel: req.query.deliveryChannel,
        isRead: req.query.isRead
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const data = await AdminService.getAuditLogs(page, limit, {
        search: req.query.search,
        action: req.query.action,
        entityType: req.query.entityType,
        adminId: req.query.adminId
      });
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
