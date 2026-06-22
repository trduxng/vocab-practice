const UserService = require('../services/user.service');
const ReportService = require('../services/report.service');

class UserController {
  static async submitAnswer(req, res, next) {
    try {
      const userId = req.user.id;
      const { questionId, wordId, submittedAnswer, isCorrect, reviewRating, activityType } = req.body;

      if (!questionId && !wordId) {
        return res.status(400).json({ message: 'Thiếu questionId' });
      }

      let feedback;
      if (questionId) {
        feedback = await UserService.submitAnswer({
          userId,
          questionId,
          wordId,
          submittedAnswer,
          isCorrect,
          reviewRating,
          activityType
        });
      } else {
        feedback = await UserService.submitWordReview({
          userId,
          wordId,
          isCorrect: Boolean(isCorrect),
          reviewRating,
          activityType
        });
      }

      return res.status(200).json({
        message: 'Lưu kết quả thành công',
        ...feedback
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFlashcards(req, res, next) {
    try {
      const userId = req.user.id;
      const flashcards = await UserService.getDueFlashcards(userId, {
        topicId: req.query.topicId,
        mode: req.query.mode
      });
      res.status(200).json(flashcards);
    } catch (error) {
      next(error);
    }
  }

  static async getTopicWords(req, res, next) {
    try {
      const userId = req.user.id;
      const { topicId } = req.params;
      const words = await UserService.getTopicWords(userId, topicId);
      res.status(200).json(words);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await UserService.getUserStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getMasteryTimeline(req, res, next) {
    try {
      const userId = req.user.id;
      const projection = await UserService.getMasteryTimeline(userId);
      res.status(200).json(projection);
    } catch (error) {
      next(error);
    }
  }

  static async getMiniTests(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const tests = await UserService.getMiniTests(page, pageSize);
      res.status(200).json(tests);
    } catch (error) {
      next(error);
    }
  }

  static async getMiniTestDetails(req, res, next) {
    try {
      const { id } = req.params;
      const questions = await UserService.getMiniTestDetails(id);
      res.status(200).json(questions);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { fullName } = req.body;
      const result = await UserService.updateProfile(userId, fullName);
      res.status(200).json({ message: 'Cập nhật thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTestHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const history = await UserService.getTestHistory(userId, page, pageSize);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }

  static async getTestSessionDetails(req, res, next) {
    try {
      const userId = req.user.id;
      const { testId, date } = req.query;
      const details = await UserService.getTestSessionDetails(userId, testId, date);
      res.status(200).json(details);
    } catch (error) {
      next(error);
    }
  }

  static async createReport(req, res, next) {
    try {
      const result = await ReportService.createReport(req.user.id, req.body);
      res.status(201).json({ message: 'Report submitted', data: result });
    } catch (error) {
      if (['Invalid report type', 'Invalid entity type', 'Report description is too short'].includes(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  // =============== DAILY GOAL ===============
  static async getDailyGoal(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await UserService.getDailyGoal(userId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async updateDailyGoal(req, res, next) {
    try {
      const userId = req.user.id;
      const { dailyGoal } = req.body;
      if (!dailyGoal || dailyGoal < 5 || dailyGoal > 100) {
        return res.status(400).json({ message: 'Mục tiêu phải từ 5 đến 100 từ' });
      }
      const result = await UserService.updateDailyGoal(userId, dailyGoal);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateSRSConfig(req, res, next) {
    try {
      const userId = req.user.id;
      const { srsReviewLimit } = req.body;
      if (!srsReviewLimit || srsReviewLimit < 5 || srsReviewLimit > 50) {
        return res.status(400).json({ message: 'Số thẻ mỗi ngày phải từ 5 đến 50' });
      }
      const result = await UserService.updateSRSReviewLimit(userId, srsReviewLimit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============== BATCH MINITEST SUBMIT ===============
  static async submitMiniTest(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { answers } = req.body;

      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: 'Thiếu danh sách câu trả lời' });
      }

      const result = await UserService.submitMiniTestBatch(userId, id, answers);
      res.status(200).json(result);
    } catch (error) {
      console.error('[UserController.submitMiniTest] Error:', error);
      return res.status(500).json({
        message: 'Lỗi server khi nộp bài kiểm tra',
        error: error.message,
      });
    }
  }

  // =============== CALENDAR HEATMAP ===============
  static async getActivityHeatmap(req, res, next) {
    try {
      const userId = req.user.id;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const data = await UserService.getActivityHeatmap(userId, year);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getProgressAnalytics(req, res, next) {
    try {
      const data = await UserService.getProgressAnalytics(req.user.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // =============== DAILY GOAL ===============
  static async getDailyProgress(req, res, next) {
    try {
      const userId = req.user.id;
      const progress = await UserService.getDailyProgress(userId);
      res.status(200).json(progress);
    } catch (error) {
      next(error);
    }
  }

  // =============== SMART REVIEW QUEUE ===============
  static async getSmartReviewQueue(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const queue = await UserService.getSmartReviewQueue(userId, limit);
      res.status(200).json(queue);
    } catch (error) {
      next(error);
    }
  }

  // =============== VOCABULARY NOTEBOOK ===============
  static async getNotebook(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const notebook = await UserService.getNotebook(userId, page, pageSize);
      res.status(200).json(notebook);
    } catch (error) {
      next(error);
    }
  }

  static async addNotebookEntry(req, res, next) {
    try {
      const userId = req.user.id;
      const { wordId, personalNote } = req.body;
      if (!wordId) return res.status(400).json({ message: 'Thiếu wordId' });
      const entry = await UserService.addNotebookEntry(userId, wordId, personalNote);
      res.status(201).json({ message: 'Đã thêm vào sổ tay', data: entry });
    } catch (error) {
      next(error);
    }
  }

  static async updateNotebookEntry(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { personalNote, isFavorite } = req.body;
      const entry = await UserService.updateNotebookEntry(id, userId, { personalNote, isFavorite });
      if (!entry) return res.status(404).json({ message: 'Không tìm thấy mục trong sổ tay' });
      res.status(200).json({ message: 'Đã cập nhật sổ tay', data: entry });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotebookEntry(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const entry = await UserService.deleteNotebookEntry(id, userId);
      if (!entry) return res.status(404).json({ message: 'Không tìm thấy mục trong sổ tay' });
      res.status(200).json({ message: 'Đã xóa khỏi sổ tay' });
    } catch (error) {
      next(error);
    }
  }

  static async checkNotebookEntry(req, res, next) {
    try {
      const userId = req.user.id;
      const wordId = parseInt(req.query.wordId);
      if (!wordId) return res.status(400).json({ message: 'Thiếu wordId' });
      const entry = await UserService.checkNotebookEntry(userId, wordId);
      res.status(200).json(entry || {});
    } catch (error) {
      next(error);
    }
  }

  // =============== NOTIFICATIONS ===============
  static async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const data = await UserService.getUserNotifications(userId, limit);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await UserService.markNotificationRead(userId, id);
      res.status(200).json({ message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
      next(error);
    }
  }

  static async markAllNotificationsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await UserService.markAllNotificationsRead(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============== SESSION SUMMARY ===============
  static async getSessionSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const summary = await UserService.getSessionSummary(userId);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  // =============== MISTAKE REVIEW QUEUE ===============
  static async getMistakeReviewQueue(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;
      const queue = await UserService.getMistakeReviewQueue(userId, limit);
      res.status(200).json(queue);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
