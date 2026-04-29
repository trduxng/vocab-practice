const UserService = require('../services/user.service');

class UserController {
  static async submitAnswer(req, res, next) {
    try {
      const userId = req.user.id;
      const { questionId, wordId, submittedAnswer, isCorrect, scoreAwarded } = req.body;

      if (!questionId || !wordId) {
        return res.status(400).json({ message: 'Thiếu questionId hoặc wordId' });
      }

      await UserService.submitQuestionAttempt(
        userId,
        questionId,
        wordId,
        submittedAnswer,
        isCorrect,
        scoreAwarded
      );

      return res.status(200).json({ message: 'Lưu kết quả thành công' });
    } catch (error) {
      console.error('[UserController.submitAnswer] Error:', error);
      return res.status(500).json({ message: 'Lỗi server khi nộp bài' });
    }
  }

  static async getFlashcards(req, res, next) {
    try {
      const userId = req.user.id;
      const flashcards = await UserService.getDueFlashcards(userId);
      res.status(200).json(flashcards);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
