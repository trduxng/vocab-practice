const AiService = require('./ai.service');

class AiController {
  static async suggestWordContent(req, res, next) {
    try {
      const suggestion = await AiService.suggestWordContent(req.body);
      res.status(200).json(suggestion);
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
      next(error);
    }
  }
}

module.exports = AiController;
