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
      const tests = await UserService.getMiniTests();
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
      const history = await UserService.getTestHistory(userId);
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
}

module.exports = UserController;
