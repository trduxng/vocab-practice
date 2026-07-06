const AiService = require('../services/ai.service');

class AiController {
  static async suggestWordContent(req, res, next) {
    try {
      const suggestion = await AiService.suggestWordContent(req.body);
      res.status(200).json(suggestion);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  static async suggestTopicContent(req, res, next) {
    try {
      const suggestion = await AiService.suggestTopicContent(req.body);
      res.status(200).json(suggestion);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  static async suggestQuestionContent(req, res, next) {
    try {
      const suggestion = await AiService.suggestQuestionContent(req.body);
      res.status(200).json(suggestion);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  static async translate(req, res, next) {
    try {
      const result = await AiService.translateText(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  static async dictionary(req, res, next) {
    try {
      const result = await AiService.lookupDictionary(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  static async suggestMiniTestContent(req, res, next) {
    try {
      const suggestion = await AiService.suggestMiniTestContent(req.body);
      res.status(200).json(suggestion);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = AiController;
