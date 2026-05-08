// vocab-practice/backend/src/services/progress.service.js
const { poolPromise, sql } = require("../config/db");

class ProgressService {
  static async getProgress(userId) {
    const pool = await poolPromise;

    // Tổng số từ đã học (có progress)
    const totalResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT COUNT(*) AS totalLearned
        FROM UserWordProgress
        WHERE UserID = @UserID
      `);

    // Số câu đúng/sai
    const statsResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT
          COUNT(CASE WHEN IsCorrect = 1 THEN 1 END) AS correct,
          COUNT(CASE WHEN IsCorrect = 0 THEN 1 END) AS wrong
        FROM ExerciseAttempts
        WHERE UserID = @UserID
      `);

    // Từ yếu (trả lời sai nhiều nhất)
    const weakResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT TOP 10
          w.Term AS word,
          w.Meaning AS meaning,
          COUNT(CASE WHEN ea.IsCorrect = 0 THEN 1 END) AS wrongCount
        FROM ExerciseAttempts ea
        JOIN Words w ON ea.WordID = w.WordID
        WHERE ea.UserID = @UserID
        GROUP BY w.Term, w.Meaning
        HAVING COUNT(CASE WHEN ea.IsCorrect = 0 THEN 1 END) > 0
        ORDER BY wrongCount DESC
      `);

    // Streak (số ngày liên tiếp có học)
    const streakResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        WITH DailyActivity AS (
          SELECT DISTINCT CAST(AttemptedAt AS DATE) AS StudyDate
          FROM ExerciseAttempts
          WHERE UserID = @UserID
        ),
        RankedDates AS (
          SELECT
            StudyDate,
            DATEDIFF(DAY, ROW_NUMBER() OVER (ORDER BY StudyDate DESC), StudyDate) AS grp
          FROM DailyActivity
        )
        SELECT COUNT(*) AS streak
        FROM RankedDates
        WHERE grp = (SELECT MAX(grp) FROM RankedDates)
      `);

    const totalLearned = totalResult.recordset[0].totalLearned || 0;
    const correct = statsResult.recordset[0].correct || 0;
    const wrong = statsResult.recordset[0].wrong || 0;
    const streak = streakResult.recordset[0].streak || 0;
    const accuracy =
      correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

    return {
      totalLearned,
      accuracy,
      streak,
      correct,
      wrong,
      weakWords: weakResult.recordset.map(function (row) {
        return {
          word: row.word,
          meaning: row.meaning,
        };
      }),
    };
  }

  static async getStats(userId) {
    const pool = await poolPromise;

    // Tổng quan mastery levels
    const masteryResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        SELECT
          MemoryStatus,
          COUNT(*) AS count
        FROM UserWordProgress
        WHERE UserID = @UserID
        GROUP BY MemoryStatus
      `);

    // Hoạt động 7 ngày gần đây
    const weeklyResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        SELECT
          CAST(AttemptedAt AS DATE) AS date,
          COUNT(*) AS attempts
        FROM ExerciseAttempts
        WHERE UserID = @UserID
          AND AttemptedAt >= DATEADD(DAY, -7, SYSDATETIMEOFFSET())
        GROUP BY CAST(AttemptedAt AS DATE)
        ORDER BY date
      `);

    return {
      masteryLevels: masteryResult.recordset,
      weeklyActivity: weeklyResult.recordset,
    };
  }
}

module.exports = ProgressService;
