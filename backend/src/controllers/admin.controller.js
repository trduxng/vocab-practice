// vocab-practice/backend/src/controllers/admin.controller.js
const AdminService = require("../services/admin.service");
const ReportService = require("../services/report.service");

class AdminController {
  // Topics
  static async getTopics(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const topics = await AdminService.getTopics(page, limit, {
        search: req.query.search,
        status: req.query.status,
        categoryId: req.query.categoryId
      });
      res.status(200).json(topics);
    } catch (error) {
      next(error);
    }
  }

  static async getTopicCategories(req, res, next) {
    try {
      const categories = await AdminService.getTopicCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async createTopic(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await AdminService.createTopic(req.body, adminId);
      res.status(201).json({ message: "Tạo chủ đề thành công", data: result });
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
        return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
      }
      res.status(200).json({ message: 'Cập nhật chủ đề thành công' });
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
        return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
      }
      res.status(200).json({
        message: result.archived ? 'Đã lưu trữ chủ đề vì đang có nội dung liên quan' : 'Xóa chủ đề thành công',
        archived: result.archived
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTopicCategory(req, res, next) {
    try {
      const result = await AdminService.createTopicCategory(req.body, req.user.id);
      res.status(201).json({ message: 'Tạo danh mục chủ đề thành công', data: result });
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
        return res.status(404).json({ message: 'Không tìm thấy danh mục chủ đề' });
      }
      res.status(200).json({ message: 'Cập nhật danh mục chủ đề thành công' });
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
        return res.status(404).json({ message: 'Không tìm thấy danh mục chủ đề' });
      }
      res.status(200).json({ message: 'Đã tắt danh mục chủ đề' });
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
        partOfSpeechId: req.query.partOfSpeechId,
        status: req.query.status,
        missingExamples: req.query.missingExamples,
        missingQuestions: req.query.missingQuestions,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
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

  static async getWordDetail(req, res, next) {
    try {
      const word = await AdminService.getWordDetail(req.params.id);
      if (!word) {
        return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
      }
      res.status(200).json(word);
    } catch (error) {
      next(error);
    }
  }

  static async bulkImportWords(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await AdminService.bulkInsertWords(req.body, adminId);
      res.status(200).json({
        message: 'Import từ vựng hoàn tất',
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

  static async previewWordImport(req, res, next) {
    try {
      const result = await AdminService.previewWordImport(req.body);
      res.status(200).json(result);
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
      const success = await AdminService.archiveWord(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy từ vựng" });
      }
      res.status(200).json({ message: 'Xóa từ vựng thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async hardDeleteWord(req, res, next) {
    try {
      const { id } = req.params;
      const success = await AdminService.deleteWord(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
      }
      res.status(200).json({ message: 'Xóa vĩnh viễn từ vựng thành công' });
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
        return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
      }
      res.status(200).json({ message: 'Cập nhật câu hỏi thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteQuestion(req, res, next) {
    try {
      const success = await AdminService.deleteQuestion(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
      }
      res.status(200).json({ message: 'Xóa câu hỏi thành công' });
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
        message: 'Import câu hỏi hoàn tất',
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
        return res.status(404).json({ message: 'Không tìm thấy mini test' });
      }
      res.status(200).json({ message: 'Cập nhật mini test thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMiniTest(req, res, next) {
    try {
      const success = await AdminService.deleteMiniTest(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy mini test' });
      }
      res.status(200).json({ message: 'Xóa mini test thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async publishMiniTest(req, res, next) {
    try {
      const success = await AdminService.setMiniTestStatus(req.params.id, 'Published', req.user.id, 'Published from mini test manager');
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy mini test' });
      }
      res.status(200).json({ message: 'Xuất bản mini test thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async archiveMiniTest(req, res, next) {
    try {
      const success = await AdminService.setMiniTestStatus(req.params.id, 'Archived', req.user.id, 'Archived from mini test manager');
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy mini test' });
      }
      res.status(200).json({ message: 'Lưu trữ mini test thành công' });
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
      const success = await AdminService.updateUser(id, req.body);

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
      const success = await AdminService.deleteUser(id);

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

  static async updateContentStatus(req, res, next) {
    try {
      const success = await AdminService.updateContentStatus(req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy nội dung' });
      }
      res.status(200).json({ message: 'Cập nhật trạng thái nội dung thành công' });
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

  static async getReports(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const data = await ReportService.getReports(page, limit, {
        search: req.query.search,
        status: req.query.status,
        reportType: req.query.reportType,
        entityType: req.query.entityType,
        priority: req.query.priority
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async updateReport(req, res, next) {
    try {
      const success = await ReportService.updateReport(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.status(200).json({ message: 'Report updated' });
    } catch (error) {
      if (error.message.startsWith('Invalid ')) {
        return res.status(400).json({ message: error.message });
      }
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
