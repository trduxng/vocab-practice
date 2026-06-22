const CreatorService = require('../services/creator.service');

const CREATOR_ERROR_MESSAGES = {
  'Topic name or code already exists': 'Tên hoặc mã chủ đề đã tồn tại.',
  'Topic category not found': 'Danh mục chủ đề không tồn tại hoặc đã ngừng hoạt động.',
  'Invalid part of speech': 'Loại từ không hợp lệ.',
  'Word already exists for this part of speech': 'Từ vựng với loại từ này đã tồn tại.',
  'Topic not found or unavailable': 'Chủ đề không tồn tại hoặc bạn không có quyền sử dụng.',
  'Word not found or unavailable': 'Từ vựng không tồn tại hoặc bạn không có quyền sử dụng.',
  'Question options must be an array': 'Danh sách lựa chọn của câu hỏi không hợp lệ.',
  'MCQ requires at least two options': 'Câu trắc nghiệm cần ít nhất hai lựa chọn.',
  'Correct answer must match an MCQ option': 'Đáp án đúng phải trùng với một lựa chọn.',
  'Mini test contains duplicate questions': 'Mini test không được chứa câu hỏi trùng lặp.',
  'Mini test requires at least one question': 'Mini test cần ít nhất một câu hỏi.',
  'Mini test questions must be owned and published': 'Mini test chỉ được dùng câu hỏi đã xuất bản do bạn tạo.',
  'Question is already in this mini test': 'Câu hỏi đã có trong mini test này.',
  'Media asset is currently linked to content': 'Media đang được liên kết với nội dung và chưa thể xóa.'
};

const getCreatorErrorMessage = (error) => CREATOR_ERROR_MESSAGES[error.message] || error.message;

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
    } catch (err) {
      if (['Topic name or code already exists', 'Topic category not found'].includes(err.message)) {
        return res.status(400).json({ message: getCreatorErrorMessage(err) });
      }
      next(err);
    }
  }

  static async updateTopic(req, res, next) {
    try {
      const ok = await CreatorService.updateTopic(req.params.id, req.body, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
      if (['Topic name or code already exists', 'Topic category not found'].includes(err.message)) {
        return res.status(400).json({ message: getCreatorErrorMessage(err) });
      }
      next(err);
    }
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
      const ok = await CreatorService.submitForReview('Topics', 'TopicID', req.params.id, req.user.id);
      if (!ok) return res.status(400).json({ message: 'Không thể gửi duyệt (sai trạng thái hoặc không có quyền)' });
      res.json({ message: 'Đã gửi duyệt' });
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
    } catch (err) {
      if ([
        'Invalid part of speech',
        'Word already exists for this part of speech',
        'Topic not found or unavailable'
      ].includes(err.message)) {
        return res.status(400).json({ message: getCreatorErrorMessage(err) });
      }
      next(err);
    }
  }

  static async updateWord(req, res, next) {
    try {
      const ok = await CreatorService.updateWord(req.params.id, req.body, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
      if ([
        'Invalid part of speech',
        'Word already exists for this part of speech',
        'Topic not found or unavailable'
      ].includes(err.message)) {
        return res.status(400).json({ message: getCreatorErrorMessage(err) });
      }
      next(err);
    }
  }

  static async deleteWord(req, res, next) {
    try {
      const ok = await CreatorService.deleteWord(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Chỉ xóa được bản nháp do bạn tạo' });
      res.json({ message: 'Xóa thành công' });
    } catch (err) {
      if (err.message === 'Word is linked to questions') {
        return res.status(409).json({ message: 'Từ vựng đang được dùng bởi câu hỏi. Hãy xử lý câu hỏi liên quan trước.' });
      }
      next(err);
    }
  }

  static async submitWordForReview(req, res, next) {
    try {
      const ok = await CreatorService.submitWordForReview(req.params.id, req.user.id);
      if (!ok) return res.status(400).json({ message: 'Không thể gửi duyệt' });
      res.json({ message: 'Đã gửi duyệt' });
    } catch (err) {
      if (err.message === 'Word topics must be published before review') {
        return res.status(400).json({ message: 'Các chủ đề gắn với từ vựng phải được xuất bản trước khi gửi duyệt.' });
      }
      next(err);
    }
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
    } catch (err) {
      if (err instanceof SyntaxError || [
        'Word not found or unavailable',
        'Question options must be an array',
        'MCQ requires at least two options',
        'Correct answer must match an MCQ option'
      ].includes(err.message)) {
        return res.status(400).json({ message: err instanceof SyntaxError ? 'Options JSON không hợp lệ' : getCreatorErrorMessage(err) });
      }
      next(err);
    }
  }

  static async updateQuestion(req, res, next) {
    try {
      const ok = await CreatorService.updateQuestion(req.params.id, req.body, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
      if (err instanceof SyntaxError || [
        'Word not found or unavailable',
        'Question options must be an array',
        'MCQ requires at least two options',
        'Correct answer must match an MCQ option'
      ].includes(err.message)) {
        return res.status(400).json({ message: err instanceof SyntaxError ? 'Options JSON không hợp lệ' : getCreatorErrorMessage(err) });
      }
      next(err);
    }
  }

  static async deleteQuestion(req, res, next) {
    try {
      const ok = await CreatorService.deleteQuestion(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Chỉ xóa được bản nháp do bạn tạo' });
      res.json({ message: 'Xóa thành công' });
    } catch (err) {
      if (err.message === 'Question is used in mini tests') {
        return res.status(409).json({ message: 'Câu hỏi đang được dùng trong mini test. Hãy gỡ câu hỏi khỏi bài test trước.' });
      }
      next(err);
    }
  }

  static async submitQuestionForReview(req, res, next) {
    try {
      const ok = await CreatorService.submitQuestionForReview(req.params.id, req.user.id);
      if (!ok) return res.status(400).json({ message: 'Không thể gửi duyệt' });
      res.json({ message: 'Đã gửi duyệt' });
    } catch (err) {
      if (err.message === 'Question word must be published before review') {
        return res.status(400).json({ message: 'Từ vựng của câu hỏi phải được xuất bản trước khi gửi duyệt.' });
      }
      next(err);
    }
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
    } catch (err) {
      if ([
        'Mini test contains duplicate questions',
        'Mini test requires at least one question',
        'Topic not found or unavailable',
        'Mini test questions must be owned and published'
      ].includes(err.message)) {
        return res.status(400).json({ message: getCreatorErrorMessage(err) });
      }
      next(err);
    }
  }

  static async updateMiniTest(req, res, next) {
    try {
      const ok = await CreatorService.updateMiniTest(req.params.id, req.body, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
      res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
      if ([
        'Mini test contains duplicate questions',
        'Mini test requires at least one question',
        'Topic not found or unavailable',
        'Mini test questions must be owned and published'
      ].includes(err.message)) {
        return res.status(400).json({ message: getCreatorErrorMessage(err) });
      }
      next(err);
    }
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
    } catch (err) {
      if ([
        'Mini test questions must be owned and published',
        'Question is already in this mini test'
      ].includes(err.message)) {
        return res.status(400).json({ message: getCreatorErrorMessage(err) });
      }
      next(err);
    }
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
      if (
        err.message.includes('Published') ||
        err.message.includes('ít nhất một câu hỏi')
      ) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  }

  static async getMedia(req, res, next) {
    try {
      const data = await CreatorService.getMedia(req.user.id);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async createMedia(req, res, next) {
    try {
      const data = await CreatorService.createMedia(req.body, req.user.id);
      res.status(201).json({ message: 'Đã thêm media', data });
    } catch (err) { next(err); }
  }

  static async deleteMedia(req, res, next) {
    try {
      const ok = await CreatorService.deleteMedia(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy media' });
      res.json({ message: 'Đã xóa media' });
    } catch (err) {
      if (err.message === 'Media asset is currently linked to content') {
        return res.status(409).json({ message: getCreatorErrorMessage(err) });
      }
      next(err);
    }
  }
}

module.exports = CreatorController;
