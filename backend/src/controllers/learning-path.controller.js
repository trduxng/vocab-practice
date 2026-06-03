const LearningPathService = require("../services/learning-path.service");

class LearningPathController {
  static async getRoadmap(req, res, next) {
    try {
      const roadmap = await LearningPathService.getRoadmap(req.user.id);
      res.status(200).json(roadmap);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LearningPathController;
