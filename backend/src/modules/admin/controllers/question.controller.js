const QuestionService = require('../services/question.service');

class QuestionController {
  static async getByWord(req, res, next) { try { res.json(await QuestionService.getQuestionsByWord(req.params.wordId, parseInt(req.query.page) || 1, parseInt(req.query.limit) || 20, req.query)); } catch (e) { next(e); } }
  static async create(req, res, next) { try { const result = await QuestionService.createQuestion(req.body, req.user.id); res.status(201).json({ message: 'Tạo câu hỏi thành công', data: result }); } catch (e) { next(e); } }
  static async update(req, res, next) { try { const ok = await QuestionService.updateQuestion(req.params.id, req.body, req.user.id); res.json({ message: ok ? 'Cập nhật thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
  static async delete(req, res, next) { try { const ok = await QuestionService.deleteQuestion(req.params.id, req.user.id); res.json({ message: ok ? 'Xóa thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
  static async bulkImport(req, res, next) { try { const result = await QuestionService.bulkInsertQuestions(req.body, req.user.id); res.json({ message: 'Import hoàn tất', ...result }); } catch (e) { next(e); } }
}

module.exports = QuestionController;