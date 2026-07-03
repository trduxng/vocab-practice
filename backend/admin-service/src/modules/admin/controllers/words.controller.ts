import WordService from '../services/words.service.ts';

class WordController {
  static async getWords(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const words = await WordService.getWords(page, limit, {
        topicId: req.query.topicId,
        partOfSpeechId: req.query.partOfSpeechId,
        status: req.query.status,
        missingExamples: req.query.missingExamples,
        missingQuestions: req.query.missingQuestions,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        search: req.query.search
      });
      res.status(200).json(words);
    } catch (error) {
      next(error);
    }
  }

  static async createWord(req, res, next) {
    try {
      const adminId = req.user.id;
      const wordData = req.body;
      const result = await WordService.createWord(wordData, adminId);
      res.status(201).json({ message: "Tạo từ vựng thành công", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getWordDetail(req, res, next) {
    try {
      const word = await WordService.getWordDetail(req.params.id);
      if (!word) {
        return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
      }
      res.status(200).json(word);
    } catch (error) {
      next(error);
    }
  }

  static async bulkImportWords(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await WordService.bulkInsertWords(req.body, adminId);
      res.status(200).json({
        message: 'Import từ vựng hoàn tất',
        ...result
      });
    } catch (error) {
      if (
        error.message === 'Invalid import payload' ||
        error.message.startsWith('CSV must include')
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async previewWordImport(req, res, next) {
    try {
      const result = await WordService.previewWordImport(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (
        error.message === 'Invalid import payload' ||
        error.message.startsWith('CSV must include')
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateWord(req, res, next) {
    try {
      const { id } = req.params;
      const wordData = req.body;
      const success = await WordService.updateWord(id, wordData, req.user.id);
      if (success) {
        res.status(200).json({ message: "Cập nhật thành công" });
      } else {
        res.status(404).json({ message: "Không tìm thấy từ vựng" });
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteWord(req, res, next) {
    try {
      const { id } = req.params;
      const success = await WordService.archiveWord(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy từ vựng" });
      }
      res.status(200).json({ message: 'Xóa từ vựng thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async hardDeleteWord(req, res, next) {
    try {
      const { id } = req.params;
      const success = await WordService.deleteWord(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
      }
      res.status(200).json({ message: 'Xóa vĩnh viễn từ vựng thành công' });
    } catch (error) {
      next(error);
    }
  }
}

export default WordController;
