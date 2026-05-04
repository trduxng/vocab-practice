const { sql, poolPromise } = require('../config/db');

class UserService {
  static async getFlashcards(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT TOP 10 q.QuestionID AS questionId, q.QuestionText AS questionText, 
               q.CorrectAnswer AS term, w.Phonetic AS phonetic, w.Meaning AS meaning,
               w.WordID AS wordId
        FROM Questions q
        JOIN Words w ON q.WordID = w.WordID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET()
        ORDER BY NEWID()
      `);
    return result.recordset;
  }

  static async getDueFlashcards(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT TOP 15 
          q.QuestionID AS questionId, 
          q.QuestionType AS questionType,
          q.QuestionText AS questionText, 
          q.CorrectAnswer AS term, 
          q.OptionsJson AS optionsJson,
          w.Phonetic AS phonetic, 
          w.Meaning AS meaning,
          w.WordID AS wordId
        FROM Questions q
        JOIN Words w ON q.WordID = w.WordID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET()
        ORDER BY uwp.MasteryLevel ASC, NEWID()
      `);
    return result.recordset;
  }

  static async submitAnswer({ userId, questionId, submittedAnswer }) {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('QuestionID', sql.BigInt, questionId)
      .input('SubmittedAnswer', sql.NVarChar, submittedAnswer)
      .execute('usp_SubmitQuestionAttempt');
  }

  static async getUserStats(userId) {
    const pool = await poolPromise;
    
    // 1. Total words learned
    const learnedResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('SELECT COUNT(*) AS total FROM UserWordProgress WHERE UserID = @UserID AND MasteryLevel >= 3');

    // 2. Accuracy rate
    const accuracyResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT 
          CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS accuracy,
          SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS correct,
          SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END) AS wrong
        FROM ExerciseAttempts WHERE UserID = @UserID
      `);

    // 3. Weak words
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
      `);

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
    stats.achievements = [
      { id: 1, icon: "🌱", label: "Mới bắt đầu", unlocked: learnedResult.recordset[0].total > 0 },
      { id: 2, icon: "💯", label: "Chăm chỉ", unlocked: (accuracyResult.recordset[0].correct || 0) >= 100 },
      { id: 3, icon: "🎯", label: "Chính xác", unlocked: Math.round(accuracyResult.recordset[0].accuracy || 0) >= 90 && learnedResult.recordset[0].total >= 10 },
      { id: 4, icon: "🏆", label: "Bậc thầy", unlocked: learnedResult.recordset[0].total >= 50 },
      { id: 5, icon: "🔥", label: "Streak 7", unlocked: false },
      { id: 6, icon: "⚡", label: "Tốc độ", unlocked: (accuracyResult.recordset[0].correct || 0) >= 10 },
      { id: 7, icon: "📚", label: "Mọt sách", unlocked: learnedResult.recordset[0].total >= 20 },
      { id: 8, icon: "🌟", label: "Ngôi sao", unlocked: false }
    ];

    return stats;
  }

  static async getMiniTests() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description,
             t.TopicName AS topicName, t.TopicCode AS topicCode
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
