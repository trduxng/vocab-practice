const { sql, poolPromise } = require("../config/db");
const GamificationService = require("./gamification.service");

class UserService {
  static async getFlashcards(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId)
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

  static async getDueFlashcards(userId, { topicId = null, mode = null } = {}) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("TopicID", sql.BigInt, topicId ? Number(topicId) : null)
      .input("Mode", sql.NVarChar(20), mode || "").query(`
        DECLARE @Limit INT = ISNULL(
          (SELECT SRSReviewLimit FROM dbo.Users WHERE UserID = @UserID),
          15
        );
        DECLARE @NewTopicID BIGINT = @TopicID;

        IF @NewTopicID IS NULL
        BEGIN
          SELECT TOP (1) @NewTopicID = ute.TopicID
          FROM dbo.UserTopicEnrollments ute
          JOIN dbo.Topics enrolledTopic ON enrolledTopic.TopicID = ute.TopicID
          WHERE ute.UserID = @UserID
            AND ute.IsActive = 1
            AND enrolledTopic.ContentStatus = N'Published'
          ORDER BY ute.EnrolledAt, ute.TopicID;
        END;

        SELECT TOP (@Limit)
          q.QuestionID AS questionId,
          q.QuestionType AS questionType,
          COALESCE(q.QuestionText, w.Meaning) AS questionText,
          COALESCE(q.CorrectAnswer, w.Term) AS correctAnswer,
          q.OptionsJson AS optionsJson,
          w.Phonetic AS phonetic,
          w.Meaning AS meaning,
          w.Term AS term,
          w.AudioUrlUK AS audioUrlUK,
          w.AudioUrlUS AS audioUrlUS,
          w.ImageUrl AS imageUrl,
          w.WordID AS wordId,
          p.PartOfSpeechName AS partOfSpeechName,
          ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
          ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
          ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
          ex.SentenceText AS exampleSentence,
          ex.SentenceTranslation AS exampleMeaning
        FROM Words w
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        OUTER APPLY (
          SELECT TOP 1
            QuestionID,
            QuestionType,
            QuestionText,
            CorrectAnswer,
            OptionsJson
          FROM Questions
          WHERE WordID = w.WordID
            AND ContentStatus = N'Published'
          ORDER BY QuestionID
        ) q
        OUTER APPLY (
          SELECT TOP 1 SentenceText, SentenceTranslation
          FROM ExampleSentences
          WHERE WordID = w.WordID
          ORDER BY ExampleSentenceID
        ) ex
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE w.ContentStatus = N'Published'
          AND (
            (@TopicID IS NOT NULL AND EXISTS (
              SELECT 1 FROM WordTopics wt
              WHERE wt.WordID = w.WordID AND wt.TopicID = @TopicID
            ))
            OR
            (@TopicID IS NULL AND (
              uwp.UserWordProgressID IS NOT NULL
              OR EXISTS (
                SELECT 1 FROM WordTopics wt
                WHERE wt.WordID = w.WordID AND wt.TopicID = @NewTopicID
              )
            ))
          )
          AND (
            (@Mode = N'new' AND ISNULL(uwp.RepetitionCount, 0) = 0)
            OR
            (@Mode = N'learned' AND uwp.UserWordProgressID IS NOT NULL)
            OR
            (@Mode NOT IN (N'new', N'learned') AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET()))
          )
        ORDER BY
          CASE
            WHEN uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN 0
            WHEN uwp.UserWordProgressID IS NOT NULL THEN 1
            ELSE 2
          END,
          uwp.NextReviewDate,
          uwp.MasteryLevel,
          NEWID()
      `);
    return result.recordset;
  }

  static async getTopicWords(userId, topicId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("TopicID", sql.BigInt, topicId).query(`
        SELECT
          w.WordID AS wordId,
          w.Term AS term,
          w.Meaning AS meaning,
          w.Phonetic AS phonetic,
          p.PartOfSpeechName AS partOfSpeechName,
          ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
          ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
          ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
          uwp.LastReviewedAt AS lastReviewedAt,
          uwp.NextReviewDate AS nextReviewDate,
          notebook.NotebookID AS notebookId,
          CASE WHEN notebook.NotebookID IS NULL THEN 0 ELSE 1 END AS isInNotebook,
          ex.SentenceText AS exampleSentence,
          ex.SentenceTranslation AS exampleMeaning
        FROM WordTopics wt
        JOIN Words w ON wt.WordID = w.WordID
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        LEFT JOIN UserVocabularyNotebook notebook ON notebook.WordID = w.WordID AND notebook.UserID = @UserID
        OUTER APPLY (
          SELECT TOP 1 SentenceText, SentenceTranslation
          FROM ExampleSentences
          WHERE WordID = w.WordID
          ORDER BY ExampleSentenceID
        ) ex
        WHERE wt.TopicID = @TopicID
        ORDER BY w.Term ASC
      `);
    return result.recordset;
  }

  static async submitAnswer({ userId, questionId, wordId, submittedAnswer, isCorrect, reviewRating, activityType }) {
    const pool = await poolPromise;

    // Kiểm tra question tồn tại trước khi gọi SP
    const questionCheck = await pool
      .request()
      .input("QuestionID", sql.BigInt, questionId)
      .query(`SELECT WordID FROM Questions WHERE QuestionID = @QuestionID AND ContentStatus = N'Published'`);

    if (questionCheck.recordset.length === 0) {
      throw new Error("Câu hỏi không tồn tại hoặc chưa được xuất bản");
    }

    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("QuestionID", sql.BigInt, questionId)
      .input("SubmittedAnswer", sql.NVarChar(1000), submittedAnswer || "")
      .execute("usp_SubmitQuestionAttempt");

    let canonicalWordId = Number(result.recordset[0]?.WordID || 0);
    if (!canonicalWordId) {
      canonicalWordId = Number(questionCheck.recordset[0].WordID || 0);
    }

    let reviewFeedback = {};
    if (['Again', 'Hard', 'Good', 'Easy'].includes(reviewRating)) {
      const feedbackResult = await pool.request()
        .input("UserID", sql.BigInt, userId)
        .input("WordID", sql.BigInt, canonicalWordId)
        .input("ReviewRating", sql.NVarChar(10), reviewRating)
        .query(`
          DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

          UPDATE UserWordProgress
          SET
            EaseFactor = CASE @ReviewRating
              WHEN N'Again' THEN CASE WHEN EaseFactor - 0.20 < 1.30 THEN 1.30 ELSE EaseFactor - 0.20 END
              WHEN N'Hard' THEN CASE WHEN EaseFactor - 0.05 < 1.30 THEN 1.30 ELSE EaseFactor - 0.05 END
              WHEN N'Good' THEN CASE WHEN EaseFactor + 0.05 > 3.00 THEN 3.00 ELSE EaseFactor + 0.05 END
              WHEN N'Easy' THEN CASE WHEN EaseFactor + 0.15 > 3.00 THEN 3.00 ELSE EaseFactor + 0.15 END
              ELSE EaseFactor
            END,
            NextReviewDate = CASE @ReviewRating
              WHEN N'Again' THEN DATEADD(minute, 10, @Now)
              WHEN N'Hard' THEN DATEADD(day, 1, @Now)
              WHEN N'Easy' THEN DATEADD(day,
                CASE
                  WHEN MasteryLevel >= 8 THEN 30
                  WHEN MasteryLevel >= 5 THEN 14
                  WHEN MasteryLevel >= 2 THEN 7
                  ELSE 3
                END,
                @Now
              )
              ELSE DATEADD(day,
                CASE
                  WHEN MasteryLevel >= 8 THEN 14
                  WHEN MasteryLevel >= 5 THEN 7
                  WHEN MasteryLevel >= 2 THEN 3
                  ELSE 1
                END,
                @Now
              )
            END,
            UpdatedAt = @Now
          OUTPUT inserted.NextReviewDate AS nextReviewDate,
                 inserted.MemoryStatus AS memoryStatus,
                 inserted.MasteryLevel AS masteryLevel
          WHERE UserID = @UserID AND WordID = @WordID
        `);
      reviewFeedback = feedbackResult.recordset[0] || {};
    }

    const gamification = activityType === "LearnWord"
      ? await GamificationService.awardXP(userId, {
          eventType: "LearnWord",
          sourceKey: `learn-word:${canonicalWordId}:${GamificationService.getDateKey()}`,
          metadata: { wordId: canonicalWordId, reviewRating: reviewRating || null },
        })
      : null;

    return {
      ...(result.recordset[0] || {}),
      ...reviewFeedback,
      xpGained: gamification?.xpGained || 0,
      reviewRating: reviewRating || null,
      gamification,
    };
  }

  static async submitWordReview({ userId, wordId, isCorrect, reviewRating, activityType }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("WordID", sql.BigInt, wordId)
      .input("IsCorrect", sql.Bit, Boolean(isCorrect))
      .input("ReviewRating", sql.NVarChar(10), reviewRating || "").query(`
        DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

        MERGE UserWordProgress WITH (HOLDLOCK) AS target
        USING (SELECT @UserID AS UserID, @WordID AS WordID) AS source
        ON target.UserID = source.UserID AND target.WordID = source.WordID
        WHEN MATCHED THEN
          UPDATE SET
            MasteryLevel = CASE
              WHEN @IsCorrect = 1 AND target.MasteryLevel < 10 THEN target.MasteryLevel + 1
              WHEN @IsCorrect = 0 AND target.MasteryLevel > 0 THEN target.MasteryLevel - 1
              ELSE target.MasteryLevel
            END,
            RepetitionCount = target.RepetitionCount + 1,
            ConsecutiveCorrect = CASE WHEN @IsCorrect = 1 THEN target.ConsecutiveCorrect + 1 ELSE 0 END,
            ConsecutiveWrong = CASE WHEN @IsCorrect = 0 THEN target.ConsecutiveWrong + 1 ELSE 0 END,
            LastReviewedAt = @Now,
            NextReviewDate = CASE
              WHEN @ReviewRating = N'Again' THEN DATEADD(minute, 10, @Now)
              WHEN @ReviewRating = N'Hard' THEN DATEADD(day, 1, @Now)
              WHEN @ReviewRating = N'Easy' THEN DATEADD(day,
                CASE
                  WHEN target.MasteryLevel >= 8 THEN 30
                  WHEN target.MasteryLevel >= 5 THEN 14
                  WHEN target.MasteryLevel >= 2 THEN 7
                  ELSE 3
                END,
                @Now
              )
              WHEN @IsCorrect = 1 THEN DATEADD(day,
                CASE
                  WHEN target.MasteryLevel >= 8 THEN 14
                  WHEN target.MasteryLevel >= 5 THEN 7
                  WHEN target.MasteryLevel >= 2 THEN 3
                  ELSE 1
                END,
                @Now
              )
              ELSE @Now
            END,
            EaseFactor = CASE @ReviewRating
              WHEN N'Again' THEN CASE WHEN target.EaseFactor - 0.20 < 1.30 THEN 1.30 ELSE target.EaseFactor - 0.20 END
              WHEN N'Hard' THEN CASE WHEN target.EaseFactor - 0.05 < 1.30 THEN 1.30 ELSE target.EaseFactor - 0.05 END
              WHEN N'Good' THEN CASE WHEN target.EaseFactor + 0.05 > 3.00 THEN 3.00 ELSE target.EaseFactor + 0.05 END
              WHEN N'Easy' THEN CASE WHEN target.EaseFactor + 0.15 > 3.00 THEN 3.00 ELSE target.EaseFactor + 0.15 END
              ELSE target.EaseFactor
            END,
            LastScore = CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
            MemoryStatus = CASE
              WHEN @IsCorrect = 0 THEN N'Lapsed'
              WHEN target.MasteryLevel >= 7 THEN N'Mastered'
              WHEN target.MasteryLevel >= 2 THEN N'Reviewing'
              ELSE N'Learning'
            END,
            UpdatedAt = @Now
        WHEN NOT MATCHED THEN
          INSERT (UserID, WordID, MasteryLevel, EaseFactor, RepetitionCount, ConsecutiveCorrect, ConsecutiveWrong, LastReviewedAt, NextReviewDate, LastScore, MemoryStatus, CreatedAt, UpdatedAt)
          VALUES (
            @UserID,
            @WordID,
            CASE WHEN @IsCorrect = 1 THEN 1 ELSE 0 END,
            2.50,
            1,
            CASE WHEN @IsCorrect = 1 THEN 1 ELSE 0 END,
            CASE WHEN @IsCorrect = 0 THEN 1 ELSE 0 END,
            @Now,
            CASE
              WHEN @ReviewRating = N'Again' THEN DATEADD(minute, 10, @Now)
              WHEN @ReviewRating = N'Hard' THEN DATEADD(day, 1, @Now)
              WHEN @ReviewRating = N'Easy' THEN DATEADD(day, 3, @Now)
              WHEN @IsCorrect = 1 THEN DATEADD(day, 1, @Now)
              ELSE @Now
            END,
            CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
            CASE WHEN @IsCorrect = 1 THEN N'Learning' ELSE N'Lapsed' END,
            @Now,
            @Now
          )
        OUTPUT inserted.UserWordProgressID AS id,
               inserted.MasteryLevel AS masteryLevel,
               inserted.MemoryStatus AS memoryStatus,
               inserted.NextReviewDate AS nextReviewDate;

      `);

    const gamification = activityType === "LearnWord"
      ? await GamificationService.awardXP(userId, {
          eventType: "LearnWord",
          sourceKey: `learn-word:${wordId}:${GamificationService.getDateKey()}`,
          metadata: { wordId, reviewRating: reviewRating || null },
        })
      : null;

    return {
      ...(result.recordset[0] || {}),
      xpGained: gamification?.xpGained || 0,
      reviewRating: reviewRating || null,
      gamification,
    };
  }

  static async getUserStats(userId) {
    const pool = await poolPromise;

    // 1. Total words learned
    const learnedResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .query(
        "SELECT COUNT(*) AS total FROM UserWordProgress WHERE UserID = @UserID AND MasteryLevel >= 3",
      );

    // 2. Accuracy rate
    const accuracyResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        SELECT
          CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS accuracy,
          SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS correct,
          SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END) AS wrong
        FROM ExerciseAttempts WHERE UserID = @UserID
      `);

    // 3. Weak words
    const weakWordsResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        SELECT TOP 5 w.Term AS word, w.Meaning AS meaning
        FROM UserWordProgress uwp
        JOIN Words w ON uwp.WordID = w.WordID
        WHERE uwp.UserID = @UserID AND (uwp.MemoryStatus = 'Lapsed' OR uwp.MasteryLevel < 3)
        ORDER BY uwp.MasteryLevel ASC
      `);

    // 4. Recent attempts
    const recentAttemptsResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        SELECT TOP 10 ea.SubmittedAnswer AS answer, ea.IsCorrect AS isCorrect, ea.AttemptedAt AS date, w.Term AS term
        FROM ExerciseAttempts ea
        JOIN Words w ON ea.WordID = w.WordID
        WHERE ea.UserID = @UserID
        ORDER BY ea.AttemptedAt DESC
      `);

    const gamification = await GamificationService.getProfile(userId);

    const stats = {
      totalLearned: learnedResult.recordset[0].total,
      accuracy: Math.round(accuracyResult.recordset[0].accuracy || 0),
      correct: accuracyResult.recordset[0].correct || 0,
      wrong: accuracyResult.recordset[0].wrong || 0,
      weakWords: weakWordsResult.recordset,
      recentAttempts: recentAttemptsResult.recordset,
      streak: gamification.streak,
      totalXP: gamification.totalXP,
      currentLevel: gamification.currentLevel,
      currentLevelXP: gamification.currentLevelXP,
      xpForNextLevel: gamification.xpForNextLevel,
      xpToNextLevel: gamification.xpToNextLevel,
      levelProgress: gamification.levelProgress,
      todayXP: gamification.todayXP,
    };

    stats.masteryTimeline = await this.getMasteryTimeline(userId);

    // 5. Daily trends (Last 7 days)
    const trendsResult = await pool
      .request()
      .input("UserID", sql.BigInt, userId).query(`
        SELECT CAST(AttemptedAt AS DATE) AS date, COUNT(*) AS count
        FROM ExerciseAttempts
        WHERE UserID = @UserID AND AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET())
        GROUP BY CAST(AttemptedAt AS DATE)
        ORDER BY date ASC
      `);

    stats.dailyTrends = trendsResult.recordset.map((r) => ({
      day: new Date(r.date).toLocaleDateString("vi-VN", { weekday: "short" }),
      count: r.count,
    }));

    stats.achievements = gamification.achievements;

    return stats;
  }

  static async getMasteryTimeline(userId) {
    const pool = await poolPromise;
    const viewExists = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.vw_MasteryTimelineProjection', N'V') AS viewId
    `);

    if (viewExists.recordset[0].viewId) {
      const result = await pool.request().input("UserID", sql.BigInt, userId)
        .query(`
          SELECT
            TotalWords AS totalWords,
            MasteredWords AS masteredWords,
            ISNULL(CompletionPercentage, 0) AS completionPercentage,
            EstimatedDaysToMastery AS estimatedDaysToMastery,
            ProjectedCompletionDate AS projectedCompletionDate
          FROM dbo.vw_MasteryTimelineProjection
          WHERE UserID = @UserID
        `);

      if (result.recordset.length > 0) {
        return result.recordset[0];
      }
    }

    const result = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT
          COUNT(*) AS totalWords,
          SUM(CASE WHEN MasteryLevel >= 8 THEN 1 ELSE 0 END) AS masteredWords,
          CAST(SUM(CASE WHEN MasteryLevel >= 8 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS completionPercentage
        FROM UserWordProgress
        WHERE UserID = @UserID
      `);

    const row = result.recordset[0] || {};
    return {
      totalWords: row.totalWords || 0,
      masteredWords: row.masteredWords || 0,
      completionPercentage: row.completionPercentage || 0,
      estimatedDaysToMastery: null,
      projectedCompletionDate: null,
    };
  }

  static async getMiniTests(page = 1, pageSize = 20) {
    const pool = await poolPromise;
    page = Math.max(1, page);
    pageSize = Math.min(100, Math.max(1, pageSize));
    const offset = (page - 1) * pageSize;

    const countResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM MiniTests WHERE IsPublished = 1
    `);
    const total = countResult.recordset[0].total;

    const result = await pool
      .request()
      .input("Offset", sql.Int, offset)
      .input("PageSize", sql.Int, pageSize)      .query(`
        SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description,
               t.TopicName AS topicName, t.TopicCode AS topicCode,
               mt.TotalQuestions AS totalQuestions
        FROM MiniTests mt
        LEFT JOIN Topics t ON mt.TopicID = t.TopicID
        WHERE mt.IsPublished = 1
        ORDER BY mt.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
      `);
    return {
      data: result.recordset,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async getMiniTestDetails(testId) {
    const pool = await poolPromise;
    const result = await pool.request().input("MiniTestID", sql.BigInt, testId)
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
    await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("FullName", sql.NVarChar(200), fullName)
      .query(
        "UPDATE Users SET FullName = @FullName, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID",
      );
    return { id: userId, fullName };
  }

  static async getTestHistory(userId, page = 1, pageSize = 20) {
    const pool = await poolPromise;
    page = Math.max(1, page);
    pageSize = Math.min(100, Math.max(1, pageSize));
    const offset = (page - 1) * pageSize;

    const countResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT COUNT(DISTINCT CONCAT(CAST(ea.AttemptedAt AS DATE), '_', mt.MiniTestID)) AS total
        FROM ExerciseAttempts ea
        JOIN Questions q ON ea.QuestionID = q.QuestionID
        JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
        JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID
        WHERE ea.UserID = @UserID
      `);
    const total = countResult.recordset[0].total;

    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("Offset", sql.Int, offset)
      .input("PageSize", sql.Int, pageSize).query(`
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
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
      `);
    return {
      data: result.recordset,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async getTestSessionDetails(userId, testId, date) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("MiniTestID", sql.BigInt, testId)
      .input("Date", sql.Date, date).query(`
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

  // =============== CALENDAR HEATMAP ===============
  static async getActivityHeatmap(userId, year) {
    await GamificationService.ensureSchema();
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("Year", sql.Int, year || new Date().getFullYear()).query(`
        WITH DailyAttempts AS (
          SELECT CAST(AttemptedAt AS DATE) AS date, COUNT(*) AS count
          FROM ExerciseAttempts
          WHERE UserID = @UserID AND YEAR(AttemptedAt) = @Year
          GROUP BY CAST(AttemptedAt AS DATE)
        ),
        DailyXP AS (
          SELECT CAST(CreatedAt AS DATE) AS date, SUM(XPAmount) AS xpEarned
          FROM dbo.UserXPEvents
          WHERE UserID = @UserID AND YEAR(CreatedAt) = @Year
          GROUP BY CAST(CreatedAt AS DATE)
        )
        SELECT COALESCE(a.date, x.date) AS date,
               ISNULL(a.count, 0) AS count,
               ISNULL(x.xpEarned, 0) AS xpEarned
        FROM DailyAttempts a
        FULL OUTER JOIN DailyXP x ON x.date = a.date
        ORDER BY date;
      `);
    return result.recordset;
  }

  // =============== PROGRESS ANALYTICS ===============
  static async getProgressAnalytics(userId) {
    await GamificationService.ensureSchema();
    const pool = await poolPromise;

    const [activityResult, growthResult, topicResult, retentionResult, gamification] = await Promise.all([
      pool.request()
        .input("UserID", sql.BigInt, userId)
        .query(`
          WITH DateSeries AS (
            SELECT DATEADD(day, -364, CAST(SYSDATETIMEOFFSET() AS DATE)) AS ActivityDate
            UNION ALL
            SELECT DATEADD(day, 1, ActivityDate)
            FROM DateSeries
            WHERE ActivityDate < CAST(SYSDATETIMEOFFSET() AS DATE)
          ),
          DailyAttempts AS (
            SELECT CAST(AttemptedAt AS DATE) AS ActivityDate,
                   COUNT(*) AS ActivityCount
            FROM dbo.ExerciseAttempts
            WHERE UserID = @UserID
              AND AttemptedAt >= DATEADD(day, -364, CAST(SYSDATETIMEOFFSET() AS DATE))
            GROUP BY CAST(AttemptedAt AS DATE)
          ),
          DailyRewards AS (
            SELECT CAST(CreatedAt AS DATE) AS ActivityDate,
                   COUNT(*) AS RewardCount,
                   SUM(XPAmount) AS XPEarned
            FROM dbo.UserXPEvents
            WHERE UserID = @UserID
              AND CreatedAt >= DATEADD(day, -364, CAST(SYSDATETIMEOFFSET() AS DATE))
            GROUP BY CAST(CreatedAt AS DATE)
          )
          SELECT CONVERT(CHAR(10), d.ActivityDate, 23) AS date,
                 CASE
                   WHEN ISNULL(a.ActivityCount, 0) > 0 THEN a.ActivityCount
                   ELSE ISNULL(r.RewardCount, 0)
                 END AS activityCount,
                 ISNULL(r.XPEarned, 0) AS xpEarned
          FROM DateSeries d
          LEFT JOIN DailyAttempts a ON a.ActivityDate = d.ActivityDate
          LEFT JOIN DailyRewards r ON r.ActivityDate = d.ActivityDate
          ORDER BY d.ActivityDate
          OPTION (MAXRECURSION 400);
        `),
      pool.request()
        .input("UserID", sql.BigInt, userId)
        .query(`
          WITH MonthOffsets AS (
            SELECT offsetValue
            FROM (VALUES (11), (10), (9), (8), (7), (6), (5), (4), (3), (2), (1), (0)) month_offsets_tbl(offsetValue)
          ),
          MonthSeries AS (
            SELECT DATEADD(
              month,
              -offsetValue,
              DATEFROMPARTS(YEAR(SYSDATETIMEOFFSET()), MONTH(SYSDATETIMEOFFSET()), 1)
            ) AS periodStart
            FROM MonthOffsets
          )
          SELECT CONVERT(CHAR(10), m.periodStart, 23) AS date,
                 SUM(CASE WHEN uwp.CreatedAt < DATEADD(month, 1, m.periodStart) THEN 1 ELSE 0 END) AS learnedWords,
                 SUM(CASE
                   WHEN uwp.MasteryLevel >= 8
                    AND uwp.UpdatedAt < DATEADD(month, 1, m.periodStart)
                   THEN 1 ELSE 0
                 END) AS masteredWords
          FROM MonthSeries m
          LEFT JOIN dbo.UserWordProgress uwp ON uwp.UserID = @UserID
          GROUP BY m.periodStart
          ORDER BY m.periodStart;
        `),
      pool.request()
        .input("UserID", sql.BigInt, userId)
        .query(`
          SELECT t.TopicID AS topicId,
                 t.TopicName AS topicName,
                 COUNT(DISTINCT wt.WordID) AS totalWords,
                 COUNT(DISTINCT CASE WHEN uwp.RepetitionCount > 0 THEN wt.WordID END) AS learnedWords,
                 COUNT(DISTINCT CASE WHEN uwp.MasteryLevel >= 8 THEN wt.WordID END) AS masteredWords,
                 ISNULL(AVG(CAST(ISNULL(uwp.MasteryLevel, 0) AS DECIMAL(10, 2))), 0) AS averageMastery
          FROM dbo.Topics t
          JOIN dbo.WordTopics wt ON wt.TopicID = t.TopicID
          LEFT JOIN dbo.UserWordProgress uwp
            ON uwp.WordID = wt.WordID
           AND uwp.UserID = @UserID
          GROUP BY t.TopicID, t.TopicName
          ORDER BY averageMastery DESC, t.TopicName;
        `),
      pool.request()
        .input("UserID", sql.BigInt, userId)
        .query(`
          SELECT
            ISNULL((SELECT COUNT(*) FROM dbo.ExerciseAttempts WHERE UserID = @UserID), 0) AS totalAnswers,
            ISNULL((SELECT SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) FROM dbo.ExerciseAttempts WHERE UserID = @UserID), 0) AS correctAnswers,
            ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @UserID AND RepetitionCount > 0), 0) AS learnedWords,
            ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @UserID AND RepetitionCount > 0 AND MemoryStatus = N'Lapsed'), 0) AS forgottenWords,
            ISNULL((
              SELECT COUNT(*)
              FROM dbo.UserWordProgress
              WHERE UserID = @UserID
                AND RepetitionCount > 0
                AND (NextReviewDate IS NULL OR NextReviewDate > SYSDATETIMEOFFSET())
            ), 0) AS upToDateWords,
            ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @UserID AND MasteryLevel >= 8), 0) AS masteredWords;
        `),
      GamificationService.getMetrics(userId),
    ]);

    const retentionRow = retentionResult.recordset[0] || {};
    const totalAnswers = Number(retentionRow.totalAnswers || 0);
    const correctAnswers = Number(retentionRow.correctAnswers || 0);
    const learnedWords = Number(retentionRow.learnedWords || 0);
    const forgottenWords = Number(retentionRow.forgottenWords || 0);
    const upToDateWords = Number(retentionRow.upToDateWords || 0);
    const masteredWords = Number(retentionRow.masteredWords || 0);
    const percentage = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

    const activity = activityResult.recordset.map((day) => ({
      date: day.date,
      activityCount: Number(day.activityCount || 0),
      xpEarned: Number(day.xpEarned || 0),
    }));

    return {
      summary: {
        activeDays: activity.filter((day) => day.activityCount > 0).length,
        totalXP: gamification.totalXP,
        currentStreak: gamification.streak,
        learnedWords,
        masteredWords,
      },
      activity,
      vocabularyGrowth: growthResult.recordset.map((point) => ({
        date: point.date,
        learnedWords: Number(point.learnedWords || 0),
        masteredWords: Number(point.masteredWords || 0),
      })),
      topicMastery: topicResult.recordset.map((topic) => {
        const averageMastery = Number(topic.averageMastery || 0);
        return {
          topicId: Number(topic.topicId),
          topicName: topic.topicName,
          totalWords: Number(topic.totalWords || 0),
          learnedWords: Number(topic.learnedWords || 0),
          masteredWords: Number(topic.masteredWords || 0),
          averageMastery,
          completionPercentage: Math.round((averageMastery / 10) * 100),
        };
      }),
      retention: {
        correctAnswerRate: percentage(correctAnswers, totalAnswers),
        forgottenWordRate: percentage(forgottenWords, learnedWords),
        reviewCompletionRate: percentage(upToDateWords, learnedWords),
        totalAnswers,
        correctAnswers,
        learnedWords,
        forgottenWords,
        upToDateWords,
      },
    };
  }

  // =============== DAILY GOAL PROGRESS ===============
  static async getDailyProgress(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT COUNT(*) AS count
        FROM ExerciseAttempts
        WHERE UserID = @UserID
          AND CAST(AttemptedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
      `);
    return { todayCount: result.recordset[0].count || 0 };
  }

  // =============== SMART REVIEW QUEUE ===============
  static async getSmartReviewQueue(userId, limit = 20) {
    const pool = await poolPromise;
    limit = Math.min(50, Math.max(1, limit));
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("Limit", sql.Int, limit).query(`
        SELECT TOP (@Limit)
          w.WordID AS wordId,
          w.Term AS term,
          w.Phonetic AS phonetic,
          w.Meaning AS meaning,
          w.AudioUrlUK AS audioUrlUK,
          w.AudioUrlUS AS audioUrlUS,
          p.PartOfSpeechName AS partOfSpeechName,
          ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
          ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
          uwp.LastReviewedAt AS lastReviewedAt,
          uwp.NextReviewDate AS nextReviewDate,
          uwp.RepetitionCount AS repetitionCount,
          uwp.ConsecutiveWrong AS consecutiveWrong,
          -- Priority score: lower = more urgent
          CASE
            WHEN uwp.NextReviewDate IS NULL THEN 0
            WHEN uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN
              DATEDIFF(hour, uwp.NextReviewDate, SYSDATETIMEOFFSET()) *
              CASE WHEN uwp.ConsecutiveWrong > 0 THEN 3 ELSE 1 END
            ELSE DATEDIFF(hour, SYSDATETIMEOFFSET(), uwp.NextReviewDate) * -1
          END AS priorityScore
        FROM Words w
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE w.ContentStatus = N'Published'
          AND uwp.NextReviewDate <= DATEADD(day, 7, SYSDATETIMEOFFSET())
        ORDER BY priorityScore DESC, uwp.MasteryLevel ASC
      `);
    return result.recordset;
  }

  // =============== BATCH MINITEST SUBMIT ===============
  static async submitMiniTestBatch(userId, testId, answers) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    let committed = false;

    try {
      await transaction.begin();

      const testQuestionsResult = await new sql.Request(transaction)
        .input("MiniTestID", sql.BigInt, testId)
        .query(`
          SELECT q.QuestionID, q.WordID, q.CorrectAnswer
          FROM dbo.MiniTestItems mti
          JOIN dbo.Questions q ON q.QuestionID = mti.QuestionID
          WHERE mti.MiniTestID = @MiniTestID;
        `);
      const testQuestions = new Map(
        testQuestionsResult.recordset.map((question) => [Number(question.QuestionID), question]),
      );
      if (testQuestions.size === 0) {
        throw new Error(`Mini test ${testId} does not contain questions`);
      }
      if (answers.length !== testQuestions.size) {
        throw new Error(`Mini test ${testId} requires exactly ${testQuestions.size} answers`);
      }

      let correctCount = 0;
      const results = [];
      const submittedQuestionIds = new Set();

      for (const answer of answers) {
        const { questionId } = answer;
        const submittedAnswer = String(answer.submittedAnswer || "").slice(0, 1000);
        const numericQuestionId = Number(questionId);
        const question = testQuestions.get(numericQuestionId);
        if (!question) {
          throw new Error(`Question ${questionId || "unknown"} does not belong to mini test ${testId}`);
        }
        if (submittedQuestionIds.has(numericQuestionId)) {
          throw new Error(`Question ${numericQuestionId} was submitted more than once`);
        }
        submittedQuestionIds.add(numericQuestionId);

        const wordId = Number(question.WordID);
        const isCorrect = submittedAnswer.trim().toLocaleLowerCase()
          === String(question.CorrectAnswer || "").trim().toLocaleLowerCase();
        const scoreAwarded = isCorrect ? 100 : 0;

        // Insert exercise attempt
        const req = new sql.Request(transaction);
        req.input('UserID', sql.BigInt, userId);
        req.input('QuestionID', sql.BigInt, questionId || null);
        req.input('WordID', sql.BigInt, wordId || null);
        req.input('SubmittedAnswer', sql.NVarChar(1000), submittedAnswer);
        req.input('IsCorrect', sql.Bit, isCorrect);
        req.input('ScoreAwarded', sql.Decimal(5, 2), scoreAwarded);

        await req.query(`
          INSERT INTO ExerciseAttempts (UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, ScoreAwarded, AttemptedAt)
          VALUES (@UserID, @QuestionID, @WordID, @SubmittedAnswer, @IsCorrect, @ScoreAwarded, SYSDATETIMEOFFSET())
        `);

        // Update word progress if wordId is provided
        if (wordId) {
          const wordReq = new sql.Request(transaction);
          wordReq.input('UserID', sql.BigInt, userId);
          wordReq.input('WordID', sql.BigInt, wordId);
          wordReq.input('IsCorrect', sql.Bit, isCorrect);

          await wordReq.query(`
            MERGE UserWordProgress WITH (HOLDLOCK) AS target
            USING (SELECT @UserID AS UserID, @WordID AS WordID) AS source
            ON target.UserID = source.UserID AND target.WordID = source.WordID
            WHEN MATCHED THEN
              UPDATE SET
                MasteryLevel = CASE
                  WHEN @IsCorrect = 1 AND target.MasteryLevel < 10 THEN target.MasteryLevel + 1
                  WHEN @IsCorrect = 0 AND target.MasteryLevel > 0 THEN target.MasteryLevel - 1
                  ELSE target.MasteryLevel
                END,
                RepetitionCount = target.RepetitionCount + 1,
                ConsecutiveCorrect = CASE WHEN @IsCorrect = 1 THEN target.ConsecutiveCorrect + 1 ELSE 0 END,
                ConsecutiveWrong = CASE WHEN @IsCorrect = 0 THEN target.ConsecutiveWrong + 1 ELSE 0 END,
                LastReviewedAt = SYSDATETIMEOFFSET(),
                NextReviewDate = CASE
                  WHEN @IsCorrect = 1 THEN DATEADD(day,
                    CASE
                      WHEN target.MasteryLevel >= 8 THEN 14
                      WHEN target.MasteryLevel >= 5 THEN 7
                      WHEN target.MasteryLevel >= 2 THEN 3
                      ELSE 1
                    END,
                    SYSDATETIMEOFFSET()
                  )
                  ELSE SYSDATETIMEOFFSET()
                END,
                LastScore = CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
                MemoryStatus = CASE
                  WHEN @IsCorrect = 0 THEN N'Lapsed'
                  WHEN target.MasteryLevel >= 7 THEN N'Mastered'
                  WHEN target.MasteryLevel >= 2 THEN N'Reviewing'
                  ELSE N'Learning'
                END,
                UpdatedAt = SYSDATETIMEOFFSET()
            WHEN NOT MATCHED THEN
              INSERT (UserID, WordID, MasteryLevel, EaseFactor, RepetitionCount, ConsecutiveCorrect, ConsecutiveWrong, LastReviewedAt, NextReviewDate, LastScore, MemoryStatus, CreatedAt, UpdatedAt)
              VALUES (@UserID, @WordID, CASE WHEN @IsCorrect = 1 THEN 1 ELSE 0 END, 2.50, 1,
                CASE WHEN @IsCorrect = 1 THEN 1 ELSE 0 END,
                CASE WHEN @IsCorrect = 0 THEN 1 ELSE 0 END,
                SYSDATETIMEOFFSET(),
                CASE WHEN @IsCorrect = 1 THEN DATEADD(day, 1, SYSDATETIMEOFFSET()) ELSE SYSDATETIMEOFFSET() END,
                CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
                CASE WHEN @IsCorrect = 1 THEN N'Learning' ELSE N'Lapsed' END,
                SYSDATETIMEOFFSET(),
                SYSDATETIMEOFFSET())
              OUTPUT inserted.MasteryLevel AS masteryLevel, inserted.MemoryStatus AS memoryStatus;
          `);
        }

        if (isCorrect) correctCount++;
        results.push({
          questionId,
          wordId,
          isCorrect,
        });
      }

      const score = Math.round((correctCount / answers.length) * 100);
      const attemptResult = await new sql.Request(transaction)
        .input('UserID', sql.BigInt, userId)
        .input('MiniTestID', sql.BigInt, testId)
        .input('TotalQuestions', sql.Int, answers.length)
        .input('CorrectCount', sql.Int, correctCount)
        .input('Score', sql.Decimal(5, 2), score)
        .query(`
          INSERT dbo.MiniTestAttempts
            (MiniTestID, UserID, StartedAt, SubmittedAt, TotalQuestions, CorrectCount, Score)
          OUTPUT inserted.MiniTestAttemptID AS id
          VALUES
            (@MiniTestID, @UserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(),
             @TotalQuestions, @CorrectCount, @Score);
        `);

      await transaction.commit();
      committed = true;
      const miniTestAttemptId = attemptResult.recordset[0]?.id;
      const gamification = await GamificationService.awardXP(userId, {
        eventType: "MiniTestComplete",
        sourceKey: `mini-test-attempt:${miniTestAttemptId}`,
        metadata: { testId: Number(testId), miniTestAttemptId, score },
      });

      return {
        total: answers.length,
        correct: correctCount,
        score,
        xpEarned: gamification.xpGained,
        gamification,
        results,
      };
    } catch (err) {
      if (!committed) await transaction.rollback();
      throw err;
    }
  }

  // =============== DAILY GOAL ===============
  static async getDailyGoal(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`SELECT DailyGoal AS dailyGoal, SRSReviewLimit AS srsReviewLimit FROM dbo.Users WHERE UserID = @UserID`);
    return result.recordset[0] || { dailyGoal: 20, srsReviewLimit: 15 };
  }

  static async updateDailyGoal(userId, dailyGoal) {
    const pool = await poolPromise;
    const goal = Math.min(100, Math.max(5, Number(dailyGoal) || 20));
    await pool.request()
      .input("UserID", sql.BigInt, userId)
      .input("DailyGoal", sql.Int, goal)
      .query(`UPDATE dbo.Users SET DailyGoal = @DailyGoal, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID`);
    return { dailyGoal: goal };
  }

  static async updateSRSReviewLimit(userId, limit) {
    const pool = await poolPromise;
    const newLimit = Math.min(50, Math.max(5, Number(limit) || 15));
    await pool.request()
      .input("UserID", sql.BigInt, userId)
      .input("SRSReviewLimit", sql.Int, newLimit)
      .query(`UPDATE dbo.Users SET SRSReviewLimit = @SRSReviewLimit, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID`);
    return { srsReviewLimit: newLimit };
  }

  // =============== NOTIFICATIONS ===============
  static async getUserNotifications(userId, limit = 20) {
    const pool = await poolPromise;
    limit = Math.min(50, Math.max(1, limit));

    // Check if table exists
    const tableCheck = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.Notifications', N'U') AS tableId
    `);
    if (!tableCheck.recordset[0].tableId) {
      return { notifications: [], unreadCount: 0 };
    }

    const result = await pool
      .request()
      .input('UserID', sql.BigInt, userId)
      .input('Limit', sql.Int, limit).query(`
        SELECT TOP (@Limit)
          NotificationID AS id,
          Title AS title,
          Message AS message,
          Type AS type,
          DeliveryChannel AS channel,
          IsRead AS isRead,
          ActionUrl AS actionUrl,
          CreatedAt AS createdAt
        FROM dbo.Notifications
        WHERE UserID = @UserID
        ORDER BY IsRead ASC, CreatedAt DESC
      `);

    const countResult = await pool
      .request()
      .input('UserID', sql.BigInt, userId).query(`
        SELECT COUNT(*) AS total, SUM(CASE WHEN IsRead = 0 THEN 1 ELSE 0 END) AS unread
        FROM dbo.Notifications
        WHERE UserID = @UserID
      `);

    return {
      notifications: result.recordset,
      unreadCount: countResult.recordset[0]?.unread || 0,
      total: countResult.recordset[0]?.total || 0,
    };
  }

  static async markNotificationRead(userId, notificationId) {
    const pool = await poolPromise;
    const tableCheck = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.Notifications', N'U') AS tableId
    `);
    if (!tableCheck.recordset[0].tableId) return { success: false };

    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('NotificationID', sql.BigInt, notificationId).query(`
        UPDATE dbo.Notifications
        SET IsRead = 1
        WHERE NotificationID = @NotificationID AND UserID = @UserID
      `);
    return { success: true };
  }

  static async markAllNotificationsRead(userId) {
    const pool = await poolPromise;
    const tableCheck = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.Notifications', N'U') AS tableId
    `);
    if (!tableCheck.recordset[0].tableId) return { success: false, count: 0 };

    const result = await pool.request()
      .input('UserID', sql.BigInt, userId).query(`
        UPDATE dbo.Notifications
        SET IsRead = 1
        WHERE UserID = @UserID AND IsRead = 0
      `);
    return { success: true, count: result.rowsAffected[0] || 0 };
  }

  // =============== VOCABULARY NOTEBOOK ===============
  static async getNotebook(userId, page = 1, pageSize = 20) {
    const pool = await poolPromise;
    page = Math.max(1, page);
    pageSize = Math.min(50, Math.max(1, pageSize));
    const offset = (page - 1) * pageSize;

    const countResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT COUNT(*) AS total FROM UserVocabularyNotebook
        WHERE UserID = @UserID
      `);
    const total = countResult.recordset[0].total;

    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("Offset", sql.Int, offset)
      .input("PageSize", sql.Int, pageSize).query(`
        SELECT
          un.NotebookID AS notebookId,
          un.UserID AS userId,
          un.WordID AS wordId,
          un.PersonalNote AS personalNote,
          un.IsFavorite AS isFavorite,
          un.AddedAt AS addedAt,
          un.UpdatedAt AS updatedAt,
          w.Term AS term,
          w.Meaning AS meaning,
          w.Phonetic AS phonetic,
          p.PartOfSpeechName AS partOfSpeechName,
          ISNULL(uwp.MasteryLevel, 0) AS masteryLevel
        FROM UserVocabularyNotebook un
        JOIN Words w ON un.WordID = w.WordID
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE un.UserID = @UserID
        ORDER BY un.IsFavorite DESC, un.UpdatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
      `);
    return {
      data: result.recordset,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async addNotebookEntry(userId, wordId, personalNote) {
    const pool = await poolPromise;
    const existing = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("WordID", sql.BigInt, wordId).query(`
        SELECT NotebookID FROM UserVocabularyNotebook
        WHERE UserID = @UserID AND WordID = @WordID
      `);

    if (existing.recordset.length > 0) {
      // Update existing entry
      const result = await pool
        .request()
        .input("NotebookID", sql.BigInt, existing.recordset[0].NotebookID)
        .input("PersonalNote", sql.NVarChar(2000), personalNote || null).query(`
          UPDATE UserVocabularyNotebook
          SET PersonalNote = COALESCE(@PersonalNote, PersonalNote),
              UpdatedAt = SYSDATETIMEOFFSET()
          OUTPUT inserted.NotebookID AS notebookId, inserted.PersonalNote AS personalNote
          WHERE NotebookID = @NotebookID
        `);
      return result.recordset[0];
    }

    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("WordID", sql.BigInt, wordId)
      .input("PersonalNote", sql.NVarChar(2000), personalNote || null)
      .input("IsFavorite", sql.Bit, false).query(`
        INSERT INTO UserVocabularyNotebook (UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt)
        OUTPUT inserted.NotebookID AS notebookId, inserted.PersonalNote AS personalNote
        VALUES (@UserID, @WordID, @PersonalNote, @IsFavorite, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);
    return result.recordset[0];
  }

  static async updateNotebookEntry(
    notebookId,
    userId,
    { personalNote, isFavorite },
  ) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("NotebookID", sql.BigInt, notebookId)
      .input("UserID", sql.BigInt, userId)
      .input(
        "PersonalNote",
        sql.NVarChar(2000),
        personalNote !== undefined ? personalNote : null,
      )
      .input(
        "IsFavorite",
        sql.Bit,
        isFavorite !== undefined ? Boolean(isFavorite) : null,
      ).query(`
        UPDATE UserVocabularyNotebook
        SET
          PersonalNote = CASE WHEN @PersonalNote IS NOT NULL OR @PersonalNote IS NULL AND PersonalNote IS NOT NULL THEN COALESCE(@PersonalNote, PersonalNote) ELSE PersonalNote END,
          IsFavorite = CASE WHEN @IsFavorite IS NOT NULL THEN @IsFavorite ELSE IsFavorite END,
          UpdatedAt = SYSDATETIMEOFFSET()
        OUTPUT inserted.NotebookID AS notebookId, inserted.PersonalNote AS personalNote, inserted.IsFavorite AS isFavorite
        WHERE NotebookID = @NotebookID AND UserID = @UserID
      `);
    return result.recordset[0] || null;
  }

  static async deleteNotebookEntry(notebookId, userId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("NotebookID", sql.BigInt, notebookId)
      .input("UserID", sql.BigInt, userId).query(`
        DELETE FROM UserVocabularyNotebook
        OUTPUT deleted.NotebookID AS notebookId
        WHERE NotebookID = @NotebookID AND UserID = @UserID
      `);
    return result.recordset[0] || null;
  }

  // =============== SESSION SUMMARY ===============
  static async getSessionSummary(userId) {
    await GamificationService.ensureSchema();
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        WITH SessionStats AS (
          SELECT
            COUNT(*) AS totalAttempts,
            SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS correctCount,
            SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END) AS wrongCount
          FROM ExerciseAttempts
          WHERE UserID = @UserID
            AND CAST(AttemptedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
        ),
        XPInfo AS (
          SELECT TotalXP, CurrentLevel FROM dbo.Users WHERE UserID = @UserID
        ),
        TodayXP AS (
          SELECT ISNULL(SUM(XPAmount), 0) AS xpEarned
          FROM dbo.UserXPEvents
          WHERE UserID = @UserID
            AND CAST(CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
        )
        SELECT
          ss.totalAttempts,
          ss.correctCount,
          ss.wrongCount,
          CASE WHEN ss.totalAttempts > 0
            THEN CAST(ss.correctCount * 100.0 / ss.totalAttempts AS DECIMAL(5,1))
            ELSE 0
          END AS accuracy,
          txp.xpEarned,
          xp.TotalXP,
          xp.CurrentLevel
        FROM SessionStats ss
        CROSS JOIN XPInfo xp
        CROSS JOIN TodayXP txp
      `);

    const row = result.recordset[0] || {
      totalAttempts: 0,
      correctCount: 0,
      wrongCount: 0,
      accuracy: 0,
      xpEarned: 0,
      TotalXP: 0,
      CurrentLevel: 1,
    };

    // Get weak words separately
    const weakResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`
        SELECT TOP 10
          w.WordID AS wordId,
          w.Term AS term,
          w.Meaning AS meaning,
          COUNT(*) AS wrongCount
        FROM ExerciseAttempts ea
        JOIN Words w ON ea.WordID = w.WordID
        WHERE ea.UserID = @UserID
          AND CAST(ea.AttemptedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
          AND ea.IsCorrect = 0
        GROUP BY w.WordID, w.Term, w.Meaning
        ORDER BY wrongCount DESC
      `);

    return {
      totalAttempts: row.totalAttempts,
      correctCount: row.correctCount,
      wrongCount: row.wrongCount,
      accuracy: Number(row.accuracy),
      xpEarned: Number(row.xpEarned),
      totalXP: Number(row.TotalXP),
      currentLevel: Number(row.CurrentLevel),
      weakWords: weakResult.recordset,
    };
  }

  // =============== MISTAKE REVIEW QUEUE ===============
  static async getMistakeReviewQueue(userId, limit = 10) {
    const pool = await poolPromise;
    limit = Math.min(30, Math.max(1, limit));
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("Limit", sql.Int, limit).query(`
        SELECT TOP (@Limit)
          w.WordID AS wordId,
          w.Term AS term,
          w.Meaning AS meaning,
          w.Phonetic AS phonetic,
          p.PartOfSpeechName AS partOfSpeechName,
          ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
          ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
          uwp.ConsecutiveWrong AS consecutiveWrong,
          recent.wrongCount
        FROM (
          SELECT WordID, COUNT(*) AS wrongCount
          FROM ExerciseAttempts
          WHERE UserID = @UserID
            AND IsCorrect = 0
            AND WordID IS NOT NULL
          GROUP BY WordID
          HAVING COUNT(*) >= 1
        ) recent
        JOIN Words w ON recent.WordID = w.WordID
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        ORDER BY recent.wrongCount DESC, uwp.MasteryLevel ASC
      `);
    return result.recordset;
  }

  static async checkNotebookEntry(userId, wordId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("WordID", sql.BigInt, wordId).query(`
        SELECT un.NotebookID AS notebookId, un.PersonalNote AS personalNote, un.IsFavorite AS isFavorite
        FROM UserVocabularyNotebook un
        WHERE un.UserID = @UserID AND un.WordID = @WordID
      `);
    return result.recordset[0] || null;
  }
}
module.exports = UserService;
