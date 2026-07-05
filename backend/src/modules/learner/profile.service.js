const { sql, poolPromise } = require("../../config/db");
const GamificationService = require("./gamification.service");

class ProfileService {
  static async getUserStats(userId) {
    const pool = await poolPromise;
    const learnedResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query("SELECT COUNT(*) AS total FROM UserWordProgress WHERE UserID = @UserID AND MasteryLevel >= 3");
    const accuracyResult = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS accuracy,
        SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS correct, SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END) AS wrong
      FROM ExerciseAttempts WHERE UserID = @UserID
    `);
    const weakWordsResult = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT TOP 5 w.Term AS word, w.Meaning AS meaning FROM UserWordProgress uwp JOIN Words w ON uwp.WordID = w.WordID
      WHERE uwp.UserID = @UserID AND (uwp.MemoryStatus = 'Lapsed' OR uwp.MasteryLevel < 3) ORDER BY uwp.MasteryLevel ASC
    `);
    const recentAttemptsResult = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT TOP 10 ea.SubmittedAnswer AS answer, ea.IsCorrect AS isCorrect, ea.AttemptedAt AS date, w.Term AS term
      FROM ExerciseAttempts ea JOIN Words w ON ea.WordID = w.WordID WHERE ea.UserID = @UserID ORDER BY ea.AttemptedAt DESC
    `);
    const gamification = await GamificationService.getProfile(userId);
    const trendsResult = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT CAST(AttemptedAt AS DATE) AS date, COUNT(*) AS count FROM ExerciseAttempts
      WHERE UserID = @UserID AND AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET()) GROUP BY CAST(AttemptedAt AS DATE) ORDER BY date ASC
    `);

    const stats = {
      totalLearned: learnedResult.recordset[0].total,
      accuracy: Math.round(accuracyResult.recordset[0].accuracy || 0),
      correct: accuracyResult.recordset[0].correct || 0,
      wrong: accuracyResult.recordset[0].wrong || 0,
      weakWords: weakWordsResult.recordset,
      recentAttempts: recentAttemptsResult.recordset,
      streak: gamification.streak, totalXP: gamification.totalXP, currentLevel: gamification.currentLevel,
      currentLevelXP: gamification.currentLevelXP, xpForNextLevel: gamification.xpForNextLevel,
      xpToNextLevel: gamification.xpToNextLevel, levelProgress: gamification.levelProgress, todayXP: gamification.todayXP,
    };
    stats.masteryTimeline = await this.getMasteryTimeline(userId);
    stats.dailyTrends = trendsResult.recordset.map((r) => ({ day: new Date(r.date).toLocaleDateString("vi-VN", { weekday: "short" }), count: r.count }));
    stats.achievements = gamification.achievements;
    return stats;
  }

  static async getMasteryTimeline(userId) {
    const pool = await poolPromise;
    const viewExists = await pool.request().query(`SELECT OBJECT_ID(N'dbo.vw_MasteryTimelineProjection', N'V') AS viewId`);
    if (viewExists.recordset[0].viewId) {
      const result = await pool.request().input("UserID", sql.BigInt, userId).query(`
        SELECT TotalWords AS totalWords, MasteredWords AS masteredWords, ISNULL(CompletionPercentage, 0) AS completionPercentage,
          EstimatedDaysToMastery AS estimatedDaysToMastery, ProjectedCompletionDate AS projectedCompletionDate
        FROM dbo.vw_MasteryTimelineProjection WHERE UserID = @UserID
      `);
      if (result.recordset.length > 0) return result.recordset[0];
    }
    const result = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT COUNT(*) AS totalWords, SUM(CASE WHEN MasteryLevel >= 7 THEN 1 ELSE 0 END) AS masteredWords,
        CAST(SUM(CASE WHEN MasteryLevel >= 7 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS completionPercentage
      FROM UserWordProgress WHERE UserID = @UserID
    `);
    const row = result.recordset[0] || {};
    return { totalWords: row.totalWords || 0, masteredWords: row.masteredWords || 0, completionPercentage: row.completionPercentage || 0, estimatedDaysToMastery: null, projectedCompletionDate: null };
  }

  static async getActivityHeatmap(userId, year) {
    await GamificationService.ensureSchema();
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("Year", sql.Int, year || new Date().getFullYear()).query(`
      WITH DailyAttempts AS (SELECT CAST(AttemptedAt AS DATE) AS date, COUNT(*) AS count FROM ExerciseAttempts WHERE UserID = @UserID AND YEAR(AttemptedAt) = @Year GROUP BY CAST(AttemptedAt AS DATE)),
      DailyXP AS (SELECT CAST(CreatedAt AS DATE) AS date, SUM(XPAmount) AS xpEarned FROM dbo.UserXPEvents WHERE UserID = @UserID AND YEAR(CreatedAt) = @Year GROUP BY CAST(CreatedAt AS DATE))
      SELECT COALESCE(a.date, x.date) AS date, ISNULL(a.count, 0) AS count, ISNULL(x.xpEarned, 0) AS xpEarned
      FROM DailyAttempts a FULL OUTER JOIN DailyXP x ON x.date = a.date ORDER BY date;
    `);
    return result.recordset;
  }

  static async getProgressAnalytics(userId) {
    await GamificationService.ensureSchema();
    const pool = await poolPromise;
    const [activityResult, growthResult, topicResult, retentionResult, gamification] = await Promise.all([
      pool.request().input("UserID", sql.BigInt, userId).query(`WITH DateSeries AS (SELECT DATEADD(day, -364, CAST(SYSDATETIMEOFFSET() AS DATE)) AS ActivityDate UNION ALL SELECT DATEADD(day, 1, ActivityDate) FROM DateSeries WHERE ActivityDate < CAST(SYSDATETIMEOFFSET() AS DATE)), DailyAttempts AS (SELECT CAST(AttemptedAt AS DATE) AS ActivityDate, COUNT(*) AS ActivityCount FROM dbo.ExerciseAttempts WHERE UserID = @UserID AND AttemptedAt >= DATEADD(day, -364, CAST(SYSDATETIMEOFFSET() AS DATE)) GROUP BY CAST(AttemptedAt AS DATE)), DailyRewards AS (SELECT CAST(CreatedAt AS DATE) AS ActivityDate, COUNT(*) AS RewardCount, SUM(XPAmount) AS XPEarned FROM dbo.UserXPEvents WHERE UserID = @UserID AND CreatedAt >= DATEADD(day, -364, CAST(SYSDATETIMEOFFSET() AS DATE)) GROUP BY CAST(CreatedAt AS DATE)) SELECT CONVERT(CHAR(10), d.ActivityDate, 23) AS date, CASE WHEN ISNULL(a.ActivityCount, 0) > 0 THEN a.ActivityCount ELSE ISNULL(r.RewardCount, 0) END AS activityCount, ISNULL(r.XPEarned, 0) AS xpEarned FROM DateSeries d LEFT JOIN DailyAttempts a ON a.ActivityDate = d.ActivityDate LEFT JOIN DailyRewards r ON r.ActivityDate = d.ActivityDate ORDER BY d.ActivityDate OPTION (MAXRECURSION 400);`),
      pool.request().input("UserID", sql.BigInt, userId).query(`WITH MonthOffsets AS (SELECT 11 AS offsetValue UNION ALL SELECT 10 UNION ALL SELECT 9 UNION ALL SELECT 8 UNION ALL SELECT 7 UNION ALL SELECT 6 UNION ALL SELECT 5 UNION ALL SELECT 4 UNION ALL SELECT 3 UNION ALL SELECT 2 UNION ALL SELECT 1 UNION ALL SELECT 0), MonthSeries AS (SELECT DATEADD(month, -offsetValue, DATEFROMPARTS(YEAR(SYSDATETIMEOFFSET()), MONTH(SYSDATETIMEOFFSET()), 1)) AS periodStart FROM MonthOffsets) SELECT CONVERT(CHAR(10), m.periodStart, 23) AS date, SUM(CASE WHEN uwp.CreatedAt < DATEADD(month, 1, m.periodStart) THEN 1 ELSE 0 END) AS learnedWords, SUM(CASE WHEN uwp.MasteryLevel >= 7 AND uwp.UpdatedAt < DATEADD(month, 1, m.periodStart) THEN 1 ELSE 0 END) AS masteredWords FROM MonthSeries m LEFT JOIN dbo.UserWordProgress uwp ON uwp.UserID = @UserID GROUP BY m.periodStart ORDER BY m.periodStart;`),
      pool.request().input("UserID", sql.BigInt, userId).query(`SELECT t.TopicID AS topicId, t.TopicName AS topicName, COUNT(DISTINCT wt.WordID) AS totalWords, COUNT(DISTINCT CASE WHEN uwp.RepetitionCount > 0 THEN wt.WordID END) AS learnedWords, COUNT(DISTINCT CASE WHEN uwp.MasteryLevel >= 7 THEN wt.WordID END) AS masteredWords, ISNULL(AVG(CAST(ISNULL(uwp.MasteryLevel, 0) AS DECIMAL(10, 2))), 0) AS averageMastery FROM dbo.Topics t JOIN dbo.WordTopics wt ON wt.TopicID = t.TopicID LEFT JOIN dbo.UserWordProgress uwp ON uwp.WordID = wt.WordID AND uwp.UserID = @UserID GROUP BY t.TopicID, t.TopicName ORDER BY averageMastery DESC, t.TopicName;`),
      pool.request().input("UserID", sql.BigInt, userId).query(`SELECT ISNULL((SELECT COUNT(*) FROM dbo.ExerciseAttempts WHERE UserID = @UserID), 0) AS totalAnswers, ISNULL((SELECT SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) FROM dbo.ExerciseAttempts WHERE UserID = @UserID), 0) AS correctAnswers, ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @UserID AND RepetitionCount > 0), 0) AS learnedWords, ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @UserID AND RepetitionCount > 0 AND MemoryStatus = N'Lapsed'), 0) AS forgottenWords, ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @UserID AND RepetitionCount > 0 AND (NextReviewDate IS NULL OR NextReviewDate > SYSDATETIMEOFFSET())), 0) AS upToDateWords, ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @UserID AND MasteryLevel >= 7), 0) AS masteredWords;`),
      GamificationService.getMetrics(userId),
    ]);

    const retentionRow = retentionResult.recordset[0] || {};
    const totalAnswers = Number(retentionRow.totalAnswers || 0);
    const correctAnswers = Number(retentionRow.correctAnswers || 0);
    const learnedWords = Number(retentionRow.learnedWords || 0);
    const forgottenWords = Number(retentionRow.forgottenWords || 0);
    const upToDateWords = Number(retentionRow.upToDateWords || 0);
    const masteredWords = Number(retentionRow.masteredWords || 0);
    const percentage = (v, t) => t > 0 ? Math.round((v / t) * 100) : 0;
    const activity = activityResult.recordset.map((d) => ({ date: d.date, activityCount: Number(d.activityCount || 0), xpEarned: Number(d.xpEarned || 0) }));

    return {
      summary: { activeDays: activity.filter((d) => d.activityCount > 0).length, totalXP: gamification.totalXP, currentStreak: gamification.streak, learnedWords, masteredWords },
      activity,
      vocabularyGrowth: growthResult.recordset.map((p) => ({ date: p.date, learnedWords: Number(p.learnedWords || 0), masteredWords: Number(p.masteredWords || 0) })),
      topicMastery: topicResult.recordset.map((t) => { const avg = Number(t.averageMastery || 0); return { topicId: Number(t.topicId), topicName: t.topicName, totalWords: Number(t.totalWords || 0), learnedWords: Number(t.learnedWords || 0), masteredWords: Number(t.masteredWords || 0), averageMastery: avg, completionPercentage: Math.round((avg / 10) * 100) }; }),
      retention: { correctAnswerRate: percentage(correctAnswers, totalAnswers), forgottenWordRate: percentage(forgottenWords, learnedWords), reviewCompletionRate: percentage(upToDateWords, learnedWords), totalAnswers, correctAnswers, learnedWords, forgottenWords, upToDateWords },
    };
  }

  static async getDailyProgress(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT COUNT(*) AS count FROM ExerciseAttempts WHERE UserID = @UserID AND CAST(AttemptedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
    `);
    return { todayCount: result.recordset[0].count || 0 };
  }

  static async getSessionSummary(userId) {
    await GamificationService.ensureSchema();
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId).query(`
      WITH SessionStats AS (SELECT COUNT(*) AS totalAttempts, SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS correctCount, SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END) AS wrongCount FROM ExerciseAttempts WHERE UserID = @UserID AND CAST(AttemptedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)),
      XPInfo AS (SELECT TotalXP, CurrentLevel FROM dbo.Users WHERE UserID = @UserID),
      TodayXP AS (SELECT ISNULL(SUM(XPAmount), 0) AS xpEarned FROM dbo.UserXPEvents WHERE UserID = @UserID AND CAST(CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE))
      SELECT ss.totalAttempts, ss.correctCount, ss.wrongCount, CASE WHEN ss.totalAttempts > 0 THEN CAST(ss.correctCount * 100.0 / ss.totalAttempts AS DECIMAL(5,1)) ELSE 0 END AS accuracy, txp.xpEarned, xp.TotalXP, xp.CurrentLevel
      FROM SessionStats ss CROSS JOIN XPInfo xp CROSS JOIN TodayXP txp
    `);
    const row = result.recordset[0] || { totalAttempts: 0, correctCount: 0, wrongCount: 0, accuracy: 0, xpEarned: 0, TotalXP: 0, CurrentLevel: 1 };
    const weakResult = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT TOP 10 w.WordID AS wordId, w.Term AS term, w.Meaning AS meaning, COUNT(*) AS wrongCount
      FROM ExerciseAttempts ea JOIN Words w ON ea.WordID = w.WordID
      WHERE ea.UserID = @UserID AND CAST(ea.AttemptedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE) AND ea.IsCorrect = 0
      GROUP BY w.WordID, w.Term, w.Meaning ORDER BY wrongCount DESC
    `);
    return { totalAttempts: row.totalAttempts, correctCount: row.correctCount, wrongCount: row.wrongCount, accuracy: Number(row.accuracy), xpEarned: Number(row.xpEarned), totalXP: Number(row.TotalXP), currentLevel: Number(row.CurrentLevel), weakWords: weakResult.recordset };
  }

  // ── Profile ──
  static async updateProfile(userId, fullName, email) {
    const pool = await poolPromise;
    if (email) {
      const checkEmail = await pool.request().input("UserID", sql.BigInt, userId).input("Email", sql.NVarChar(255), email)
        .query("SELECT UserID FROM Users WHERE Email = @Email AND UserID <> @UserID");
      if (checkEmail.recordset.length > 0) { const err = new Error("Email đã được sử dụng bởi người dùng khác"); err.statusCode = 400; throw err; }
      await pool.request().input("UserID", sql.BigInt, userId).input("FullName", sql.NVarChar(200), fullName).input("Email", sql.NVarChar(255), email)
        .query("UPDATE Users SET FullName = @FullName, Email = @Email, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID");
      return { id: userId, fullName, email };
    } else {
      await pool.request().input("UserID", sql.BigInt, userId).input("FullName", sql.NVarChar(200), fullName)
        .query("UPDATE Users SET FullName = @FullName, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID");
      return { id: userId, fullName };
    }
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const pool = await poolPromise;
    const userResult = await pool.request().input("UserID", sql.BigInt, userId).query("SELECT PasswordHash FROM Users WHERE UserID = @UserID");
    const user = userResult.recordset[0];
    if (!user) { const err = new Error("Người dùng không tồn tại"); err.statusCode = 404; throw err; }
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!isMatch) { const err = new Error("Mật khẩu cũ không chính xác"); err.statusCode = 400; throw err; }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.request().input("UserID", sql.BigInt, userId).input("PasswordHash", sql.NVarChar(500), hashedPassword)
      .query("UPDATE Users SET PasswordHash = @PasswordHash, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID");
    return true;
  }

  // ── Goals ──
  static async getDailyGoal(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`SELECT DailyGoal AS dailyGoal, SRSReviewLimit AS srsReviewLimit FROM dbo.Users WHERE UserID = @UserID`);
    return result.recordset[0] || { dailyGoal: 20, srsReviewLimit: 15 };
  }

  static async updateDailyGoal(userId, dailyGoal) {
    const pool = await poolPromise;
    const goal = Math.min(100, Math.max(5, Number(dailyGoal) || 20));
    await pool.request().input("UserID", sql.BigInt, userId).input("DailyGoal", sql.Int, goal)
      .query(`UPDATE dbo.Users SET DailyGoal = @DailyGoal, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID`);
    return { dailyGoal: goal };
  }

  static async updateSRSReviewLimit(userId, limit) {
    const pool = await poolPromise;
    const newLimit = Math.min(50, Math.max(5, Number(limit) || 15));
    await pool.request().input("UserID", sql.BigInt, userId).input("SRSReviewLimit", sql.Int, newLimit)
      .query(`UPDATE dbo.Users SET SRSReviewLimit = @SRSReviewLimit, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID`);
    return { srsReviewLimit: newLimit };
  }
}

module.exports = ProfileService;
