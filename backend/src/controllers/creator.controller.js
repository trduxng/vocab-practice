const CreatorService = require('../services/creator.service');

class CreatorController {
  // Dashboard & Analytics
  static async getDashboard(req, res, next) {
    try {
      const stats = await CreatorService.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (err) { next(err); }
  }

  static async getContentSummary(req, res, next) {
    try {
      const data = await CreatorService.getContentSummary(req.user.id);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async getAcademicAnalytics(req, res, next) {
    try {
      const data = await CreatorService.getAcademicAnalytics(req.user.id);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async getTopicAnalytics(req, res, next) {
    try {
      const data = await CreatorService.getTopicAnalytics(req.user.id, req.params.id);
      if (!data) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json(data);
    } catch (err) { next(err); }
  }

  static async getMiniTestAnalytics(req, res, next) {
    try {
      const data = await CreatorService.getMiniTestAnalytics(req.user.id, req.params.id);
      if (!data) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json(data);
    } catch (err) { next(err); }
  }

  // TopicCategories (Read-only)
  static async getTopicCategories(req, res, next) {
    try {
      const data = await CreatorService.getTopicCategories();
      res.json(data);
    } catch (err) { next(err); }
  }

  // Topics
  static async getTopics(req, res, next) {
    try {
      const data = await CreatorService.getMyTopics(req.user.id, req.query);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async createTopic(req, res, next) {
    try {
      const result = await CreatorService.createTopic(req.body, req.user.id);
      res.status(201).json({ message: 'Tạo chủ đề thành công', data: result });
    } catch (err) { next(err); }
  }

  static async updateTopic(req, res, next) {
    try {
      const ok = await CreatorService.updateTopic(req.params.id, req.body, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) { next(err); }
  }

  static async deleteTopic(req, res, next) {
    try {
      const ok = await CreatorService.deleteTopic(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Chỉ xóa được bản nháp do bạn tạo' });
      res.json({ message: 'Xóa thành công' });
    } catch (err) { next(err); }
  }

  static async submitTopicForReview(req, res, next) {
    try {
      const ok = await CreatorService.submitForReview('topic', req.params.id, req.user.id);
      if (!ok) return res.status(400).json({ message: 'Không thể gửi duyệt (sai trạng thái hoặc không có quyền)' });
      res.json({ message: 'Đã gửi duyệt' });
    } catch (err) { next(err); }
  }

  static async withdrawTopic(req, res, next) {
    try {
      const result = await CreatorService.withdrawTopic(req.params.id, req.user.id);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.json({ message: 'Đã thu hồi yêu cầu duyệt' });
    } catch (err) { next(err); }
  }

  static async duplicateTopic(req, res, next) {
    try {
      const result = await CreatorService.duplicateTopic(req.params.id, req.user.id);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.status(201).json({ message: 'Sao chép chủ đề thành công', data: { id: result.newTopicId } });
    } catch (err) { next(err); }
  }

  static async getTopicReviewLogs(req, res, next) {
    try {
      const logs = await CreatorService.getTopicReviewLogs(req.params.id, req.user.id);
      res.json(logs);
    } catch (err) { next(err); }
  }

  // Words
  static async getWords(req, res, next) {
    try {
      const data = await CreatorService.getMyWords(req.user.id, req.query);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async createWord(req, res, next) {
    try {
      const result = await CreatorService.createWord(req.body, req.user.id);
      res.status(201).json({ message: 'Tạo từ vựng thành công', data: result });
    } catch (err) { next(err); }
  }

  static async bulkCreateWords(req, res, next) {
    try {
      const { words, conflictStrategy } = req.body;
      if (!Array.isArray(words) || words.length === 0) {
        return res.status(400).json({ message: 'Danh sách từ vựng không hợp lệ' });
      }
      const result = await CreatorService.bulkCreateWords(words, req.user.id, conflictStrategy);
      res.status(201).json({ message: `Đã import thành công ${result.count} từ vựng`, data: result });
    } catch (err) { next(err); }
  }

  static async updateWord(req, res, next) {
    try {
      const ok = await CreatorService.updateWord(req.params.id, req.body, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) { next(err); }
  }

  static async deleteWord(req, res, next) {
    try {
      const ok = await CreatorService.deleteWord(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Chỉ xóa được bản nháp do bạn tạo' });
      res.json({ message: 'Xóa thành công' });
    } catch (err) { next(err); }
  }

  static async submitWordForReview(req, res, next) {
    try {
      const ok = await CreatorService.submitForReview('word', req.params.id, req.user.id);
      if (!ok) return res.status(400).json({ message: 'Không thể gửi duyệt' });
      res.json({ message: 'Đã gửi duyệt' });
    } catch (err) { next(err); }
  }

  // Questions
  static async getQuestions(req, res, next) {
    try {
      const data = await CreatorService.getMyQuestions(req.user.id, req.query);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async createQuestion(req, res, next) {
    try {
      const result = await CreatorService.createQuestion(req.body, req.user.id);
      res.status(201).json({ message: 'Tạo câu hỏi thành công', data: result });
    } catch (err) { next(err); }
  }

  static async updateQuestion(req, res, next) {
    try {
      const ok = await CreatorService.updateQuestion(req.params.id, req.body, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) { next(err); }
  }

  static async deleteQuestion(req, res, next) {
    try {
      const ok = await CreatorService.deleteQuestion(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Chỉ xóa được bản nháp do bạn tạo' });
      res.json({ message: 'Xóa thành công' });
    } catch (err) { next(err); }
  }

  static async submitQuestionForReview(req, res, next) {
    try {
      const ok = await CreatorService.submitForReview('question', req.params.id, req.user.id);
      if (!ok) return res.status(400).json({ message: 'Không thể gửi duyệt' });
      res.json({ message: 'Đã gửi duyệt' });
    } catch (err) { next(err); }
  }

  // MiniTests
  static async getMiniTests(req, res, next) {
    try {
      const data = await CreatorService.getMyMiniTests(req.user.id, req.query);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async createMiniTest(req, res, next) {
    try {
      const result = await CreatorService.createMiniTest(req.body, req.user.id);
      res.status(201).json({ message: 'Tạo bài test thành công', data: result });
    } catch (err) { next(err); }
  }

  static async updateMiniTest(req, res, next) {
    try {
      const ok = await CreatorService.updateMiniTest(req.params.id, req.body, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) { next(err); }
  }

  static async deleteMiniTest(req, res, next) {
    try {
      const ok = await CreatorService.deleteMiniTest(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Chỉ xóa được bản nháp do bạn tạo' });
      res.json({ message: 'Xóa thành công' });
    } catch (err) { next(err); }
  }

  static async addMiniTestItem(req, res, next) {
    try {
      const ok = await CreatorService.addMiniTestItem(req.params.id, req.body.questionId, req.user.id);
      if (!ok) return res.status(403).json({ message: 'Không có quyền' });
      res.json({ message: 'Thêm câu hỏi thành công' });
    } catch (err) { next(err); }
  }

  static async removeMiniTestItem(req, res, next) {
    try {
      const ok = await CreatorService.removeMiniTestItem(req.params.id, req.params.questionId, req.user.id);
      if (!ok) return res.status(403).json({ message: 'Không có quyền' });
      res.json({ message: 'Xóa câu hỏi khỏi test thành công' });
    } catch (err) { next(err); }
  }

  static async submitMiniTestForReview(req, res, next) {
    try {
      const ok = await CreatorService.submitMiniTestForReview(req.params.id, req.user.id);
      if (!ok) return res.status(400).json({ message: 'Không thể gửi duyệt' });
      res.json({ message: 'Đã gửi duyệt' });
    } catch (err) {
      if (err.message.includes('Published')) return res.status(400).json({ message: err.message });
      next(err);
    }
  }

  // Media
  static async getMedia(req, res, next) {
    try {
      const data = await CreatorService.getMyMedia(req.user.id, req.query);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async uploadMedia(req, res, next) {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      if (files.length === 0) return res.status(400).json({ message: 'Không có file nào được upload' });
      const results = [];
      for (const file of files) {
        const media = await CreatorService.createMedia(file, req.user.id, {
          altText: req.body.altText,
          transcript: req.body.transcript,
        });
        results.push(media);
      }
      res.status(201).json({
        message: `Upload thành công ${results.length} file`,
        data: results.length === 1 ? results[0] : results,
      });
    } catch (err) { next(err); }
  }

  static async deleteMedia(req, res, next) {
    try {
      const ok = await CreatorService.deleteMedia(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Xóa thành công' });
    } catch (err) { next(err); }
  }
}

module.exports = CreatorController;
