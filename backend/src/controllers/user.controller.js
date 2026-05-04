// vocab-practice/backend/src/controllers/user.controller.js
const UserService = require("../services/user.service");

class UserController {
  static async submitAnswer(req, res, next) {
    try {
      const userId = req.user.id;
      const { questionId, submittedAnswer } = req.body;

      if (
        !questionId ||
        submittedAnswer === undefined ||
        submittedAnswer === null
      ) {
        return res.status(400).json({
          message: "Thiếu questionId hoặc submittedAnswer",
        });
      }

      // Backend tự tính isCorrect và scoreAwarded
      const result = await UserService.submitQuestionAttempt(
        userId,
        questionId,
        submittedAnswer,
      );

      return res.status(200).json({
        message: "Lưu kết quả thành công",
        data: result,
      });
    } catch (error) {
      console.error("[UserController.submitAnswer] Error:", error);
      next(error);
    }
  }

  static async getFlashcards(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const flashcards = await UserService.getDueFlashcards(userId, limit);
      res.status(200).json(flashcards);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
