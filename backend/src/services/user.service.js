const { poolPromise, sql } = require('../config/db');

class UserService {
  static async submitQuestionAttempt(userId, questionId, wordId, submittedAnswer, isCorrect, scoreAwarded) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('QuestionID', sql.BigInt, questionId)
      .input('SubmittedAnswer', sql.NVarChar(1000), submittedAnswer)
      .execute('usp_SubmitQuestionAttempt');

    return result.recordset[0];
  }

  static async getDueFlashcards(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT w.WordID AS wordId, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic, 
               q.QuestionID AS questionId, q.QuestionType AS questionType, 
               q.QuestionText AS questionText, q.OptionsJson AS optionsJson
        FROM Words w
        JOIN Questions q ON w.WordID = q.WordID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE uwp.UserWordProgressID IS NULL 
           OR uwp.MemoryStatus = 'New' 
           OR uwp.NextReviewDate <= SYSDATETIMEOFFSET()
      `);
    return result.recordset;
  }
}

module.exports = UserService;
