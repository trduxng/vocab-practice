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

  static async getUserStats(userId) {
    const pool = await poolPromise;
    
    // 1. Total learned (MasteryLevel > 0)
    const learnedResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('SELECT COUNT(*) AS total FROM UserWordProgress WHERE UserID = @UserID AND MasteryLevel > 0');
    
    // 2. Accuracy (from ExerciseAttempts)
    const accuracyResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT 
          CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / 
          NULLIF(COUNT(*), 0) * 100 AS accuracy,
          SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS correct,
          SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END) AS wrong
        FROM ExerciseAttempts WHERE UserID = @UserID
      `);

    // 3. Weak words (MemoryStatus = 'Lapsed' or low mastery)
    const weakWordsResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT TOP 5 w.Term AS word, w.Meaning AS meaning
        FROM UserWordProgress uwp
        JOIN Words w ON uwp.WordID = w.WordID
        WHERE uwp.UserID = @UserID AND (uwp.MemoryStatus = 'Lapsed' OR uwp.MasteryLevel < 3)
        ORDER BY uwp.MasteryLevel ASC
      `);

    return {
      totalLearned: learnedResult.recordset[0].total,
      accuracy: Math.round(accuracyResult.recordset[0].accuracy || 0),
      correct: accuracyResult.recordset[0].correct || 0,
      wrong: accuracyResult.recordset[0].wrong || 0,
      weakWords: weakWordsResult.recordset,
      streak: 5,
      achievements: [
        { id: 1, icon: "🌱", label: "Mới bắt đầu", unlocked: learnedResult.recordset[0].total > 0 },
        { id: 2, icon: "💯", label: "Chăm chỉ", unlocked: (accuracyResult.recordset[0].correct || 0) >= 100 },
        { id: 3, icon: "🎯", label: "Chính xác", unlocked: Math.round(accuracyResult.recordset[0].accuracy || 0) >= 90 && learnedResult.recordset[0].total >= 10 },
        { id: 4, icon: "🏆", label: "Bậc thầy", unlocked: learnedResult.recordset[0].total >= 50 },
        { id: 5, icon: "🔥", label: "Streak 7", unlocked: false },
      ]
    };
  }

  static async getMiniTests() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description, 
             t.TopicName AS topicName, mt.TotalQuestions AS totalQuestions
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      WHERE mt.IsPublished = 1
    `);
    return result.recordset;
  }

  static async getMiniTestDetails(testId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MiniTestID', sql.BigInt, testId)
      .query(`
        SELECT q.QuestionID AS questionId, q.QuestionType AS questionType, 
               q.QuestionText AS questionText, q.OptionsJson AS optionsJson, 
               q.CorrectAnswer AS correctAnswer, w.Term AS term
        FROM MiniTestItems mti
        JOIN Questions q ON mti.QuestionID = q.QuestionID
        JOIN Words w ON q.WordID = w.WordID
        WHERE mti.MiniTestID = @MiniTestID
        ORDER BY mti.DisplayOrder
      `);
    return result.recordset;
  }
}

module.exports = UserService;
