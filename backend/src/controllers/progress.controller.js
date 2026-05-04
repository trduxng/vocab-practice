// vocab-practice/backend/src/controllers/progress.controller.js
const ProgressService = require("../services/progress.service");

class ProgressController {
  static async getProgress(req, res, next) {
    try {
      const userId = req.user.id;
      const progress = await ProgressService.getProgress(userId);
      res.status(200).json(progress);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await ProgressService.getStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProgressController;
