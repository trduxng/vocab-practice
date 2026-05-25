const UserService = require('../services/user.service');
const ReportService = require('../services/report.service');

class UserController {
  static async submitAnswer(req, res, next) {
    try {
      const userId = req.user.id;
      const { questionId, wordId, submittedAnswer, isCorrect } = req.body;

      if (!questionId && !wordId) {
        return res.status(400).json({ message: 'Thiếu questionId' });
      }

      if (questionId) {
        await UserService.submitAnswer({
          userId,
          questionId,
          submittedAnswer
        });
      } else {
        await UserService.submitWordReview({
          userId,
          wordId,
          isCorrect: Boolean(isCorrect)
        });
      }

      return res.status(200).json({ message: 'Lưu kết quả thành công' });
    } catch (error) {
      console.error('[UserController.submitAnswer] Full Error:', error);
      return res.status(500).json({ 
        message: 'Lỗi server khi nộp bài',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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
}

module.exports = UserController;
