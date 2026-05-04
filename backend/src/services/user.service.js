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

    // 4. Recent attempts
    const recentAttemptsResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT TOP 10 ea.SubmittedAnswer AS answer, ea.IsCorrect AS isCorrect, ea.AttemptedAt AS date, w.Term AS term
        FROM ExerciseAttempts ea
        JOIN Words w ON ea.WordID = w.WordID
        WHERE ea.UserID = @UserID
        ORDER BY ea.AttemptedAt DESC
      const stats = {
        totalLearned: learnedResult.recordset[0].total,
        accuracy: Math.round(accuracyResult.recordset[0].accuracy || 0),
        correct: accuracyResult.recordset[0].correct || 0,
        wrong: accuracyResult.recordset[0].wrong || 0,
        weakWords: weakWordsResult.recordset,
        recentAttempts: recentAttemptsResult.recordset,
        streak: 5 
      };

      // 5. Daily trends (Last 7 days)
      const trendsResult = await pool.request()
        .input('UserID', sql.BigInt, userId)
        .query(`
          SELECT CAST(AttemptedAt AS DATE) AS date, COUNT(*) AS count
          FROM ExerciseAttempts
          WHERE UserID = @UserID AND AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET())
          GROUP BY CAST(AttemptedAt AS DATE)
          ORDER BY date ASC
        `);

      stats.dailyTrends = trendsResult.recordset.map(r => ({
        day: new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
        count: r.count
      }));

      // Calculate Achievements
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

  static async updateProfile(userId, fullName) {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('FullName', sql.NVarChar(200), fullName)
      .query('UPDATE Users SET FullName = @FullName, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID');
    return { id: userId, fullName };
  }

  static async getTestHistory(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT 
          CAST(ea.AttemptedAt AS DATE) AS date,
          mt.MiniTestID AS testId,
          mt.TestTitle AS testTitle,
          COUNT(*) AS totalQuestions,
          SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) AS correctAnswers
        FROM ExerciseAttempts ea
        JOIN Questions q ON ea.QuestionID = q.QuestionID
        JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
        JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID
        WHERE ea.UserID = @UserID
        GROUP BY CAST(ea.AttemptedAt AS DATE), mt.TestTitle, mt.MiniTestID
        ORDER BY date DESC
      `);
    return result.recordset;
  }

  static async getTestSessionDetails(userId, testId, date) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('MiniTestID', sql.BigInt, testId)
      .input('Date', sql.Date, date)
      .query(`
        SELECT 
          q.QuestionText AS questionText,
          q.QuestionType AS questionType,
          q.OptionsJson AS optionsJson,
          q.CorrectAnswer AS correctAnswer,
          ea.SubmittedAnswer AS submittedAnswer,
          ea.IsCorrect AS isCorrect,
          w.Term AS term,
          w.Meaning AS meaning
        FROM ExerciseAttempts ea
        JOIN Questions q ON ea.QuestionID = q.QuestionID
        JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
        JOIN Words w ON q.WordID = w.WordID
        WHERE ea.UserID = @UserID 
          AND mti.MiniTestID = @MiniTestID
          AND CAST(ea.AttemptedAt AS DATE) = @Date
      `);
    return result.recordset;
  }
}

module.exports = UserService;
