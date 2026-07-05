const { poolPromise, sql } = require("../../config/db");

class CategoriesService {
  static async getPartOfSpeeches() {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT PartOfSpeechID AS id, PartOfSpeechName AS name, Description AS description FROM PartOfSpeeches`);
    return result.recordset;
  }

  static async getTopics(userId = null) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId ? Number(userId) : null).query(`
      SELECT t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code, t.Description AS description,
             t.ContentStatus AS status, COUNT(DISTINCT w.WordID) AS wordCount,
             COUNT(DISTINCT CASE WHEN uwp.UserWordProgressID IS NOT NULL THEN w.WordID END) AS learnedCount,
             COUNT(DISTINCT CASE WHEN uwp.MasteryLevel >= 7 THEN w.WordID END) AS masteredCount,
             COUNT(DISTINCT CASE WHEN uwp.UserWordProgressID IS NULL OR uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN w.WordID END) AS dueCount,
             CAST(AVG(CAST(ISNULL(uwp.MasteryLevel, 0) AS DECIMAL(5,2))) AS DECIMAL(5,2)) AS averageMastery,
             CAST(COUNT(DISTINCT CASE WHEN uwp.MasteryLevel >= 7 THEN w.WordID END) * 100.0 / NULLIF(COUNT(DISTINCT w.WordID), 0) AS DECIMAL(5,2)) AS progressPercent
      FROM Topics t LEFT JOIN WordTopics wt ON wt.TopicID = t.TopicID
      LEFT JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = N'Published'
      LEFT JOIN UserWordProgress uwp ON uwp.WordID = w.WordID AND uwp.UserID = @UserID
      WHERE t.ContentStatus = N'Published'
      GROUP BY t.TopicID, t.TopicName, t.TopicCode, t.Description, t.ContentStatus
      ORDER BY t.TopicID ASC
    `);
    return result.recordset;
  }
}

module.exports = CategoriesService;
