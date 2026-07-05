const { poolPromise, sql } = require('../../../config/db');

class DashboardService {
  static async getDashboardStats() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT (SELECT COUNT(*) FROM Users) AS totalUsers, (SELECT COUNT(*) FROM Users WHERE UserRole = 'Learner') AS totalStudents,
        (SELECT COUNT(*) FROM Words) AS totalWords, (SELECT COUNT(*) FROM Topics) AS totalTopics,
        (SELECT COUNT(*) FROM Topics WHERE ContentStatus = 'Published') AS publishedTopics,
        (SELECT COUNT(*) FROM Questions) AS totalQuestions, (SELECT COUNT(*) FROM ExerciseAttempts) AS totalAttempts,
        (SELECT COUNT(*) FROM MiniTests) AS totalMiniTests,
        (SELECT COUNT(*) FROM Topics WHERE ContentStatus = 'PendingReview') + (SELECT COUNT(*) FROM Words WHERE ContentStatus = 'PendingReview') + (SELECT COUNT(*) FROM Questions WHERE ContentStatus = 'PendingReview') + (SELECT COUNT(*) FROM MiniTests WHERE ContentStatus = 'PendingReview') AS pendingReviews,
        (SELECT COUNT(*) FROM UserWordProgress WHERE MemoryStatus = 'Mastered') AS masteredRecords,
        (SELECT COUNT(*) FROM UserWordProgress WHERE NextReviewDate <= SYSDATETIMEOFFSET() OR NextReviewDate IS NULL) AS dueReviews,
        (SELECT COUNT(*) FROM Users WHERE CreatedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET())) AS newUsersThisWeek,
        (SELECT COUNT(DISTINCT UserID) FROM ExerciseAttempts WHERE AttemptedAt >= DATEADD(day, -1, SYSDATETIMEOFFSET())) AS activeUsersToday,
        (SELECT CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) FROM ExerciseAttempts) AS averageAccuracy;
      SELECT CONVERT(varchar(10), CAST(CreatedAt AS date), 120) AS date, COUNT(*) AS users FROM Users WHERE CreatedAt >= DATEADD(day, -30, SYSDATETIMEOFFSET()) GROUP BY CAST(CreatedAt AS date) ORDER BY CAST(CreatedAt AS date);
      SELECT FORMAT(CAST(AttemptedAt AS date), 'ddd', 'en-US') AS day, COUNT(*) AS attempts, SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS correct FROM ExerciseAttempts WHERE AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET()) GROUP BY CAST(AttemptedAt AS date);
      SELECT UserRole AS name, COUNT(*) AS value FROM Users GROUP BY UserRole;
      SELECT p.PartOfSpeechName AS name, COUNT(w.WordID) AS value FROM PartOfSpeeches p LEFT JOIN Words w ON p.PartOfSpeechID = w.PartOfSpeechID GROUP BY p.PartOfSpeechName ORDER BY p.PartOfSpeechName;`);
    return { ...result.recordsets[0][0], systemHealth: { apiStatus: 'OK', databaseStatus: 'Connected', environment: process.env.NODE_ENV || 'development', uptimeSeconds: Math.round(process.uptime()) }, userGrowth: result.recordsets[1], weeklyActivity: result.recordsets[2], userTypes: result.recordsets[3], wordDistribution: result.recordsets[4] };
  }

  static async getAnalyticsData() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT CAST(COALESCE(AVG(CAST(CASE WHEN ea.IsCorrect = 1 THEN 100.0 ELSE 0.0 END AS DECIMAL(5,2))), 0) AS DECIMAL(5,2)) AS averageAccuracy, COUNT(ea.ExerciseAttemptID) AS totalAttempts, COUNT(DISTINCT ea.UserID) AS activeLearners, SUM(CASE WHEN ea.IsCorrect = 0 THEN 1 ELSE 0 END) AS wrongAttempts FROM ExerciseAttempts ea;
      SELECT TOP 8 COALESCE(t.TopicName, 'Uncategorized') AS name, COUNT(ea.ExerciseAttemptID) AS attempts, CAST(SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.ExerciseAttemptID), 0) AS DECIMAL(5,2)) AS completion FROM ExerciseAttempts ea JOIN Words w ON ea.WordID = w.WordID LEFT JOIN WordTopics wt ON w.WordID = wt.WordID LEFT JOIN Topics t ON wt.TopicID = t.TopicID GROUP BY COALESCE(t.TopicName, 'Uncategorized') ORDER BY COUNT(ea.ExerciseAttemptID) DESC;
      SELECT FORMAT(CAST(AttemptedAt AS date), 'ddd', 'en-US') AS day, COUNT(*) AS attempts, CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS accuracy FROM ExerciseAttempts WHERE AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET()) GROUP BY CAST(AttemptedAt AS date);
      SELECT TOP 5 COALESCE(t.TopicName, 'Uncategorized') AS label, CAST(SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.ExerciseAttemptID), 0) AS DECIMAL(5,2)) AS accuracy FROM ExerciseAttempts ea JOIN Words w ON ea.WordID = w.WordID LEFT JOIN WordTopics wt ON w.WordID = wt.WordID LEFT JOIN Topics t ON wt.TopicID = t.TopicID GROUP BY COALESCE(t.TopicName, 'Uncategorized') ORDER BY accuracy ASC;`);
    return { summary: result.recordsets[0][0], popularQuizzes: result.recordsets[1], studyActivity: result.recordsets[2], difficultTopics: result.recordsets[3] };
  }

  static async getContentManagementData() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT (SELECT COUNT(*) FROM Topics WHERE ContentStatus = 'Published') + (SELECT COUNT(*) FROM Words WHERE ContentStatus = 'Published') + (SELECT COUNT(*) FROM Questions WHERE ContentStatus = 'Published') + (SELECT COUNT(*) FROM MiniTests WHERE ContentStatus = 'Published') AS publishedItems,
        (SELECT COUNT(*) FROM Words) AS totalWords, (SELECT COUNT(*) FROM Questions) AS totalQuestions, (SELECT COUNT(*) FROM TopicCategories WHERE IsActive = 1) AS activeCategories,
        (SELECT COUNT(*) FROM Topics WHERE ContentStatus IN ('Draft','PendingReview','Rejected')) + (SELECT COUNT(*) FROM Words WHERE ContentStatus IN ('Draft','PendingReview','Rejected')) + (SELECT COUNT(*) FROM Questions WHERE ContentStatus IN ('Draft','PendingReview','Rejected')) + (SELECT COUNT(*) FROM MiniTests WHERE ContentStatus IN ('Draft','PendingReview','Rejected')) AS reviewItems;
      SELECT TOP 100 * FROM (SELECT CONCAT('TOPIC-', t.TopicID) AS id, t.TopicID AS entityId, 'Topic' AS type, t.TopicName AS title, COALESCE(tc.CategoryName, 'Uncategorized') AS category, t.ContentStatus AS status, COUNT(DISTINCT wt.WordID) AS itemCount, t.UpdatedAt AS updatedAt FROM Topics t LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID GROUP BY t.TopicID, t.TopicName, tc.CategoryName, t.ContentStatus, t.UpdatedAt UNION ALL SELECT CONCAT('WORD-', w.WordID), w.WordID, 'Word', w.Term, COALESCE(p.PartOfSpeechName, 'Vocabulary'), w.ContentStatus, COUNT(DISTINCT q.QuestionID), w.UpdatedAt FROM Words w LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID LEFT JOIN Questions q ON w.WordID = q.WordID GROUP BY w.WordID, w.Term, p.PartOfSpeechName, w.ContentStatus, w.UpdatedAt) content ORDER BY updatedAt DESC;
      SELECT CategoryName AS name, CategoryCode AS code, DisplayOrder, IsActive FROM TopicCategories ORDER BY DisplayOrder, CategoryName;`);
    return { summary: result.recordsets[0][0], content: result.recordsets[1], categories: result.recordsets[2] };
  }
}

module.exports = DashboardService;
