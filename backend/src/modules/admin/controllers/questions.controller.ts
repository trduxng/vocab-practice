const QuestionService = require('../services/questions.service.ts');

class QuestionController {
  static async getQuestionsByWord(req, res, next) {
    try {
      const { wordId } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const questions = await QuestionService.getQuestionsByWord(wordId, page, limit, {
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
      const result = await QuestionService.createQuestion(req.body, adminId);
      res.status(201).json({ message: "Tạo câu hỏi thành công", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuestion(req, res, next) {
    try {
      const success = await QuestionService.updateQuestion(req.params.id, req.body, req.user.id);
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
      const success = await QuestionService.deleteQuestion(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
      }
      res.status(200).json({ message: 'Xóa câu hỏi thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async bulkImportQuestions(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await QuestionService.bulkInsertQuestions(req.body, adminId);
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
}

module.exports = QuestionController;
