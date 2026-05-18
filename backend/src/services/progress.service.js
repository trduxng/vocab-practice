// vocab-practice/backend/src/services/progress.service.js
const { poolPromise, sql } = require("../config/db");

class ProgressService {
  static async getProgress(userId) {
    const pool = await poolPromise;

    // Tổng số từ đã học (có progress)
    const totalResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT COUNT(*) AS totalLearned
        FROM TienDoTuVungNguoiDung
        WHERE NguoiDungID = @UserID
      `);

    // Số câu đúng/sai
    const statsResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT
          COUNT(CASE WHEN DungSai = 1 THEN 1 END) AS correct,
          COUNT(CASE WHEN DungSai = 0 THEN 1 END) AS wrong
        FROM LanLamBaiTap
        WHERE NguoiDungID = @UserID
      `);

    // Từ yếu (trả lời sai nhiều nhất)
    const weakResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT TOP 10
          w.Tu AS word,
          w.Nghia AS meaning,
          COUNT(CASE WHEN ea.DungSai = 0 THEN 1 END) AS wrongCount
        FROM LanLamBaiTap ea
        JOIN TuVung w ON ea.TuVungID = w.TuVungID
        WHERE ea.NguoiDungID = @UserID
        GROUP BY w.Tu, w.Nghia
        HAVING COUNT(CASE WHEN ea.DungSai = 0 THEN 1 END) > 0
        ORDER BY wrongCount DESC
      `);

    // Streak (số ngày liên tiếp có học)
    const streakResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        WITH DailyActivity AS (
          SELECT DISTINCT CAST(ThoiDiemLam AS DATE) AS StudyDate
          FROM LanLamBaiTap
          WHERE NguoiDungID = @UserID
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
          TrangThaiGhiNho AS MemoryStatus,
          COUNT(*) AS count
        FROM TienDoTuVungNguoiDung
        WHERE NguoiDungID = @UserID
        GROUP BY TrangThaiGhiNho
      `);

    // Hoạt động 7 ngày gần đây
    const weeklyResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        SELECT
          CAST(ThoiDiemLam AS DATE) AS date,
          COUNT(*) AS attempts
        FROM LanLamBaiTap
        WHERE NguoiDungID = @UserID
          AND ThoiDiemLam >= DATEADD(DAY, -7, SYSDATETIMEOFFSET())
        GROUP BY CAST(ThoiDiemLam AS DATE)
        ORDER BY date
      `);

    return {
      masteryLevels: masteryResult.recordset,
      weeklyActivity: weeklyResult.recordset,
    };
  }
}

module.exports = ProgressService;
