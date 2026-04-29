const { poolPromise, sql } = require('../config/db');

class UserService {
  static async submitQuestionAttempt(userId, questionId, wordId, submittedAnswer, isCorrect, scoreAwarded) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('QuestionID', sql.Int, questionId)
      .input('WordID', sql.Int, wordId)
      .input('SubmittedAnswer', sql.NVarChar(sql.MAX), submittedAnswer)
      .input('IsCorrect', sql.Bit, isCorrect)
      .input('ScoreAwarded', sql.Decimal(5, 2), scoreAwarded)
      .execute('usp_SubmitQuestionAttempt');

    return result;
  }

  static async getDueFlashcards(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT w.WordID, w.Term, w.Meaning, w.Phonetic, q.QuestionID, q.QuestionType, q.QuestionText, q.OptionsJson
        FROM Words w
        JOIN Questions q ON w.WordID = q.WordID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE uwp.UserWordProgressID IS NULL 
           OR uwp.MemoryStatus = 'New' 
           OR uwp.NextReviewDate <= GETDATE()
      `);
    return result.recordset;
  }
}

module.exports = UserService;
