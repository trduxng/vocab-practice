// vocab-practice/backend/src/controllers/categories.controller.js
const CategoriesService = require("../services/categories.service");

class CategoriesController {
  static async getPartOfSpeeches(req, res, next) {
    try {
      const pos = await CategoriesService.getPartOfSpeeches();
      res.status(200).json(pos);
    } catch (error) {
      next(error);
    }
  }

  static async getTopics(req, res, next) {
    try {
      const topics = await CategoriesService.getTopics();
      res.status(200).json(topics);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoriesController;
