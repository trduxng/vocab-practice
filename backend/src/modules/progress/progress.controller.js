const ProgressService = require("../learner/progress.service");

class ProgressController {
  static async getProgress(req, res, next) {
    try {
      const progress = await ProgressService.getProgress(req.user.id);
      res.status(200).json(progress);
    } catch (error) { next(error); }
  }

  static async getStats(req, res, next) {
    try {
      const stats = await ProgressService.getStats(req.user.id);
      res.status(200).json(stats);
    } catch (error) { next(error); }
  }
}

module.exports = ProgressController;
