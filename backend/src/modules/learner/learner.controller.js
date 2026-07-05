const FlashcardService = require("./flashcard.service");
const ProfileService = require("./profile.service");
const NotebookService = require("./notebook.service");
const NotificationService = require("./notification.service");
const GamificationService = require("./gamification.service");
const LearningPathService = require("./learning-path.service");
const ReportService = require("./report.service");

class LearnerController {
  // =============== FLASHCARD & REVIEW ===============
  static async submitAnswer(req, res, next) {
    try {
      const userId = req.user.id;
      const { questionId, wordId, submittedAnswer, isCorrect, reviewRating, activityType } = req.body;
      if (!questionId && !wordId) return res.status(400).json({ message: 'Thiếu questionId' });

      let feedback;
      if (questionId) {
        feedback = await FlashcardService.submitAnswer({ userId, questionId, wordId, submittedAnswer, isCorrect, reviewRating, activityType });
      } else {
        feedback = await FlashcardService.submitWordReview({ userId, wordId, isCorrect: Boolean(isCorrect), reviewRating, activityType });
      }
      return res.status(200).json({ message: 'Lưu kết quả thành công', ...feedback });
    } catch (error) { next(error); }
  }

  static async getFlashcards(req, res, next) {
    try {
      const flashcards = await FlashcardService.getDueFlashcards(req.user.id, { topicId: req.query.topicId, mode: req.query.mode });
      res.status(200).json(flashcards);
    } catch (error) { next(error); }
  }

  static async getTopicWords(req, res, next) {
    try {
      const words = await FlashcardService.getTopicWords(req.user.id, req.params.topicId);
      res.status(200).json(words);
    } catch (error) { next(error); }
  }

  static async getStats(req, res, next) {
    try {
      const stats = await ProfileService.getUserStats(req.user.id);
      res.status(200).json(stats);
    } catch (error) { next(error); }
  }

  // =============== GAMIFICATION ===============
  static async getGamificationProfile(req, res, next) {
    try {
      const profile = await GamificationService.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (error) { next(error); }
  }

  static async completePractice(req, res, next) {
    try {
      const { sessionKey, topicId = null, correctCount = 0, totalAttempts = 0 } = req.body;
      if (!sessionKey || typeof sessionKey !== "string") return res.status(400).json({ message: "Missing practice session key" });
      const reward = await GamificationService.awardXP(req.user.id, {
        eventType: "PracticeComplete", sourceKey: `practice:${sessionKey.slice(0, 120)}`,
        metadata: { topicId: Number(topicId) || null, correctCount: Number(correctCount) || 0, totalAttempts: Number(totalAttempts) || 0 },
      });
      res.status(200).json(reward);
    } catch (error) { next(error); }
  }

  static async markAchievementsSeen(req, res, next) {
    try {
      await GamificationService.markAchievementsSeen(req.user.id, req.body.achievementIds);
      res.status(200).json({ message: "Achievements marked as seen" });
    } catch (error) { next(error); }
  }

  // =============== LEARNING PATH ===============
  static async getRoadmap(req, res, next) {
    try {
      const roadmap = await LearningPathService.getRoadmap(req.user.id);
      res.status(200).json(roadmap);
    } catch (error) { next(error); }
  }

  // =============== DASHBOARD ===============
  static async getMasteryTimeline(req, res, next) {
    try {
      const projection = await ProfileService.getMasteryTimeline(req.user.id);
      res.status(200).json(projection);
    } catch (error) { next(error); }
  }

  static async getActivityHeatmap(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const data = await ProfileService.getActivityHeatmap(req.user.id, year);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  static async getProgressAnalytics(req, res, next) {
    try {
      const data = await ProfileService.getProgressAnalytics(req.user.id);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  static async getDailyProgress(req, res, next) {
    try {
      const progress = await ProfileService.getDailyProgress(req.user.id);
      res.status(200).json(progress);
    } catch (error) { next(error); }
  }

  // =============== MINI TESTS ===============
  static async getMiniTests(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const tests = await FlashcardService.getMiniTests(page, pageSize);
      res.status(200).json(tests);
    } catch (error) { next(error); }
  }

  static async getMiniTestDetails(req, res, next) {
    try {
      const questions = await FlashcardService.getMiniTestDetails(req.params.id);
      res.status(200).json(questions);
    } catch (error) { next(error); }
  }

  static async getTestHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const history = await FlashcardService.getTestHistory(userId, page, pageSize);
      res.status(200).json(history);
    } catch (error) { next(error); }
  }

  static async getTestSessionDetails(req, res, next) {
    try {
      const { testId, date } = req.query;
      const details = await FlashcardService.getTestSessionDetails(req.user.id, testId, date);
      res.status(200).json(details);
    } catch (error) { next(error); }
  }

  static async submitMiniTest(req, res, next) {
    try {
      const { answers } = req.body;
      if (!Array.isArray(answers) || answers.length === 0) return res.status(400).json({ message: 'Thiếu danh sách câu trả lời' });
      const result = await FlashcardService.submitMiniTestBatch(req.user.id, req.params.id, answers);
      res.status(200).json(result);
    } catch (error) {
      console.error('[LearnerController.submitMiniTest] Error:', error);
      return res.status(500).json({ message: 'Lỗi server khi nộp bài kiểm tra', error: error.message });
    }
  }

  // =============== PROFILE ===============
  static async updateProfile(req, res, next) {
    try {
      const { fullName, email } = req.body;
      const result = await ProfileService.updateProfile(req.user.id, fullName, email);
      res.status(200).json({ message: 'Cập nhật thành công', data: result });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Thiếu thông tin mật khẩu cũ hoặc mới' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự trở lên' });
      await ProfileService.changePassword(req.user.id, oldPassword, newPassword);
      res.status(200).json({ message: 'Thay đổi mật khẩu thành công' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
      next(error);
    }
  }

  // =============== REPORTS ===============
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

  // =============== DAILY GOAL & SRS ===============
  static async getDailyGoal(req, res, next) {
    try {
      const data = await ProfileService.getDailyGoal(req.user.id);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  static async updateDailyGoal(req, res, next) {
    try {
      const { dailyGoal } = req.body;
      if (!dailyGoal || dailyGoal < 5 || dailyGoal > 100) return res.status(400).json({ message: 'Mục tiêu phải từ 5 đến 100 từ' });
      const result = await ProfileService.updateDailyGoal(req.user.id, dailyGoal);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  static async updateSRSConfig(req, res, next) {
    try {
      const { srsReviewLimit } = req.body;
      if (!srsReviewLimit || srsReviewLimit < 5 || srsReviewLimit > 50) return res.status(400).json({ message: 'Số thẻ mỗi ngày phải từ 5 đến 50' });
      const result = await ProfileService.updateSRSReviewLimit(req.user.id, srsReviewLimit);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  // =============== SMART REVIEW QUEUE ===============
  static async getSmartReviewQueue(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const queue = await FlashcardService.getSmartReviewQueue(req.user.id, limit);
      res.status(200).json(queue);
    } catch (error) { next(error); }
  }

  static async getSessionSummary(req, res, next) {
    try {
      const summary = await ProfileService.getSessionSummary(req.user.id);
      res.status(200).json(summary);
    } catch (error) { next(error); }
  }

  static async getMistakeReviewQueue(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const queue = await FlashcardService.getMistakeReviewQueue(req.user.id, limit);
      res.status(200).json(queue);
    } catch (error) { next(error); }
  }

  // =============== NOTIFICATIONS ===============
  static async getNotifications(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const data = await NotificationService.getUserNotifications(req.user.id, limit);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  static async markNotificationRead(req, res, next) {
    try {
      await NotificationService.markNotificationRead(req.user.id, req.params.id);
      res.status(200).json({ message: 'Đã đánh dấu đã đọc' });
    } catch (error) { next(error); }
  }

  static async markAllNotificationsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllNotificationsRead(req.user.id);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  // =============== VOCABULARY NOTEBOOK ===============
  static async getNotebook(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const notebook = await NotebookService.getNotebook(req.user.id, page, pageSize);
      res.status(200).json(notebook);
    } catch (error) { next(error); }
  }

  static async addNotebookEntry(req, res, next) {
    try {
      const { wordId, personalNote } = req.body;
      if (!wordId) return res.status(400).json({ message: 'Thiếu wordId' });
      const entry = await NotebookService.addNotebookEntry(req.user.id, wordId, personalNote);
      res.status(201).json({ message: 'Đã thêm vào sổ tay', data: entry });
    } catch (error) { next(error); }
  }

  static async updateNotebookEntry(req, res, next) {
    try {
      const { personalNote, isFavorite } = req.body;
      const entry = await NotebookService.updateNotebookEntry(req.params.id, req.user.id, { personalNote, isFavorite });
      if (!entry) return res.status(404).json({ message: 'Không tìm thấy mục trong sổ tay' });
      res.status(200).json({ message: 'Đã cập nhật sổ tay', data: entry });
    } catch (error) { next(error); }
  }

  static async deleteNotebookEntry(req, res, next) {
    try {
      const entry = await NotebookService.deleteNotebookEntry(req.params.id, req.user.id);
      if (!entry) return res.status(404).json({ message: 'Không tìm thấy mục trong sổ tay' });
      res.status(200).json({ message: 'Đã xóa khỏi sổ tay' });
    } catch (error) { next(error); }
  }

  static async checkNotebookEntry(req, res, next) {
    try {
      const wordId = parseInt(req.query.wordId);
      if (!wordId) return res.status(400).json({ message: 'Thiếu wordId' });
      const entry = await NotebookService.checkNotebookEntry(req.user.id, wordId);
      res.status(200).json(entry || {});
    } catch (error) { next(error); }
  }
}

module.exports = LearnerController;
