const { sql, poolPromise } = require("../config/db");

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
        SELECT TOP 15
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
          ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus
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
          ORDER BY NEWID()
        ) q
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE (@TopicID IS NULL OR EXISTS (
            SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = @TopicID
          ))
          AND (
            (@Mode = N'learned' AND uwp.UserWordProgressID IS NOT NULL)
            OR
            (@Mode <> N'learned' AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET()))
          )
        ORDER BY uwp.MasteryLevel ASC, NEWID()
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
          uwp.LastReviewedAt AS lastReviewedAt,
          uwp.NextReviewDate AS nextReviewDate,
          ex.SentenceText AS exampleSentence,
          ex.SentenceTranslation AS exampleMeaning
        FROM WordTopics wt
        JOIN Words w ON wt.WordID = w.WordID
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
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

  static async submitAnswer({ userId, questionId, submittedAnswer }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("QuestionID", sql.BigInt, questionId)
      .input("SubmittedAnswer", sql.NVarChar(1000), submittedAnswer || "")
      .execute("usp_SubmitQuestionAttempt");
    return result.recordset[0];
  }

  static async submitWordReview({ userId, wordId, isCorrect }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("WordID", sql.BigInt, wordId)
      .input("IsCorrect", sql.Bit, Boolean(isCorrect)).query(`
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
            CASE WHEN @IsCorrect = 1 THEN DATEADD(day, 1, @Now) ELSE @Now END,
            CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
            CASE WHEN @IsCorrect = 1 THEN N'Learning' ELSE N'Lapsed' END,
            @Now,
            @Now
          )
        OUTPUT inserted.UserWordProgressID AS id, inserted.MasteryLevel AS masteryLevel, inserted.MemoryStatus AS memoryStatus;
      `);

    return result.recordset[0];
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

    const stats = {
      totalLearned: learnedResult.recordset[0].total,
      accuracy: Math.round(accuracyResult.recordset[0].accuracy || 0),
      correct: accuracyResult.recordset[0].correct || 0,
      wrong: accuracyResult.recordset[0].wrong || 0,
      weakWords: weakWordsResult.recordset,
      recentAttempts: recentAttemptsResult.recordset,
      streak: 5,
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

    // Calculate Achievements
    stats.achievements = [
      {
        id: 1,
        icon: "🌱",
        label: "Mới bắt đầu",
        unlocked: learnedResult.recordset[0].total > 0,
      },
      {
        id: 2,
        icon: "💯",
        label: "Chăm chỉ",
        unlocked: (accuracyResult.recordset[0].correct || 0) >= 100,
      },
      {
        id: 3,
        icon: "🎯",
        label: "Chính xác",
        unlocked:
          Math.round(accuracyResult.recordset[0].accuracy || 0) >= 90 &&
          learnedResult.recordset[0].total >= 10,
      },
      {
        id: 4,
        icon: "🏆",
        label: "Bậc thầy",
        unlocked: learnedResult.recordset[0].total >= 50,
      },
      { id: 5, icon: "🔥", label: "Streak 7", unlocked: false },
      {
        id: 6,
        icon: "⚡",
        label: "Tốc độ",
        unlocked: (accuracyResult.recordset[0].correct || 0) >= 10,
      },
      {
        id: 7,
        icon: "📚",
        label: "Mọt sách",
        unlocked: learnedResult.recordset[0].total >= 20,
      },
      { id: 8, icon: "🌟", label: "Ngôi sao", unlocked: false },
    ];

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
        SELECT COUNT(DISTINCT CAST(ea.AttemptedAt AS DATE) + CAST(mt.MiniTestID AS NVARCHAR)) AS total
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
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("Year", sql.Int, year || new Date().getFullYear()).query(`
        SELECT
          CAST(AttemptedAt AS DATE) AS date,
          COUNT(*) AS count
        FROM ExerciseAttempts
        WHERE UserID = @UserID
          AND YEAR(AttemptedAt) = @Year
        GROUP BY CAST(AttemptedAt AS DATE)
        ORDER BY date ASC
      `);
    return result.recordset;
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
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE (
          uwp.NextReviewDate IS NULL
          OR uwp.NextReviewDate <= DATEADD(day, 7, SYSDATETIMEOFFSET())
        )
        ORDER BY priorityScore DESC, uwp.MasteryLevel ASC
      `);
    return result.recordset;
  }

  // =============== BATCH MINITEST SUBMIT ===============
  static async submitMiniTestBatch(userId, testId, answers) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      let correctCount = 0;
      const results = [];

      for (const answer of answers) {
        const { questionId, submittedAnswer, wordId } = answer;
        const isCorrect = Boolean(answer.isCorrect);

        // Insert exercise attempt
        const req = new sql.Request(transaction);
        req.input('UserID', sql.BigInt, userId);
        req.input('QuestionID', sql.BigInt, questionId || null);
        req.input('WordID', sql.BigInt, wordId || null);
        req.input('SubmittedAnswer', sql.NVarChar(1000), String(submittedAnswer || '').slice(0, 1000));
        req.input('IsCorrect', sql.Bit, isCorrect);

        await req.query(`
          INSERT INTO ExerciseAttempts (UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, AttemptedAt)
          VALUES (@UserID, @QuestionID, @WordID, @SubmittedAnswer, @IsCorrect, SYSDATETIMEOFFSET())
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

      await transaction.commit();

      return {
        total: answers.length,
        correct: correctCount,
        score: Math.round((correctCount / answers.length) * 100),
        results,
      };
    } catch (err) {
      await transaction.rollback();
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
          SET PersonalNote = @PersonalNote, UpdatedAt = SYSDATETIMEOFFSET()
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
