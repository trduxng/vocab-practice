const AdminService = require('../services/admin.service');

class AdminController {
  // Words
  static async getWords(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const words = await AdminService.getWords(page, limit);
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
      res.status(201).json({ message: 'Tạo từ vựng thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateWord(req, res, next) {
    try {
      const { id } = req.params;
      const wordData = req.body;
      const success = await AdminService.updateWord(id, wordData);
      if (success) {
        res.status(200).json({ message: 'Cập nhật thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy từ vựng' });
      }
    } catch (error) {
      next(error);
    }
  }

  // Questions
  static async createQuestion(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await AdminService.createQuestion(req.body, adminId);
      res.status(201).json({ message: 'Tạo câu hỏi thành công', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
