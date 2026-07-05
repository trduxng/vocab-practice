const WordService = require('../services/word.service');
const { validate, schemas } = require('../../../shared/validations');

class WordController {
  static async getWords(req, res, next) {
    try { res.json(await WordService.getWords(parseInt(req.query.page) || 1, parseInt(req.query.limit) || 20, req.query)); } catch (e) { next(e); }
  }
  static async getDetail(req, res, next) {
    try { const word = await WordService.getWordDetail(req.params.id); if (!word) return res.status(404).json({ message: 'Không tìm thấy từ vựng' }); res.json(word); } catch (e) { next(e); }
  }
  static async createWord(req, res, next) {
    try { const result = await WordService.createWord(req.body, req.user.id); res.status(201).json({ message: 'Tạo từ vựng thành công', data: result }); } catch (e) { next(e); }
  }
  static async updateWord(req, res, next) {
    try { const ok = await WordService.updateWord(req.params.id, req.body, req.user.id); res.json({ message: ok ? 'Cập nhật thành công' : 'Không tìm thấy từ vựng' }); } catch (e) { next(e); }
  }
  static async deleteWord(req, res, next) {
    try { const ok = await WordService.archiveWord(req.params.id, req.user.id); if (!ok) return res.status(404).json({ message: 'Không tìm thấy từ vựng' }); res.json({ message: 'Xóa từ vựng thành công' }); } catch (e) { next(e); }
  }
  static async hardDelete(req, res, next) {
    try { const ok = await WordService.deleteWord(req.params.id, req.user.id); if (!ok) return res.status(404).json({ message: 'Không tìm thấy từ vựng' }); res.json({ message: 'Xóa vĩnh viễn thành công' }); } catch (e) { next(e); }
  }
  static async previewImport(req, res, next) {
    try { res.json(await WordService.previewWordImport(req.body)); } catch (e) { next(e); }
  }
  static async bulkImport(req, res, next) {
    try { const result = await WordService.bulkInsertWords(req.body, req.user.id); res.json({ message: 'Import hoàn tất', ...result }); } catch (e) { next(e); }
  }
}

module.exports = WordController;