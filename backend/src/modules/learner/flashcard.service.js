const { sql, poolPromise } = require("../../config/db");
const GamificationService = require("./gamification.service");
const { calculateEaseFactor, calculateNextReview, calculateMasteryLevel, determineMemoryStatus, DEFAULT_EASE_FACTOR } = require("../../engine/srs");

function gradeQuestion(questionType, submittedAnswer, correctAnswer) {
  const answer = (submittedAnswer || "").trim().toLowerCase().replace(/\s+/g, " ");
  const expected = (correctAnswer || "").trim().toLowerCase().replace(/\s+/g, " ");

  switch ((questionType || "").toLowerCase()) {
    case "fillblank":
    case "fill_in_blank":
      return answer === expected;
    case "mcq":
    case "multiplechoice":
    case "dragdrop":
    case "dictation":
    case "flashcardcheck":
    case "audiorecognition":
    case "truefalse":
    case "matching":
    case "listening":
    default:
      return answer === expected;
  }
}

function normalizeOptions(optionsJson) {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

class FlashcardService {
  static async getDueFlashcards(userId, { topicId = null, mode = null } = {}) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("TopicID", sql.BigInt, topicId ? Number(topicId) : null)
      .input("Mode", sql.NVarChar(20), mode || "").query(`
        DECLARE @Limit INT = ISNULL((SELECT SRSReviewLimit FROM dbo.Users WHERE UserID = @UserID), 15);
        DECLARE @NewTopicID BIGINT = @TopicID;
        IF @NewTopicID IS NULL
        BEGIN
          SELECT TOP (1) @NewTopicID = ute.TopicID
          FROM dbo.UserTopicEnrollments ute
          JOIN dbo.Topics enrolledTopic ON enrolledTopic.TopicID = ute.TopicID
          WHERE ute.UserID = @UserID AND ute.IsActive = 1 AND enrolledTopic.ContentStatus = N'Published'
          ORDER BY ute.EnrolledAt, ute.TopicID;
        END;
        SELECT TOP (@Limit) q.QuestionID AS questionId, q.QuestionType AS questionType,
          COALESCE(q.QuestionText, w.Meaning) AS questionText, COALESCE(q.CorrectAnswer, w.Term) AS correctAnswer,
          q.OptionsJson AS optionsJson, w.Phonetic AS phonetic, w.Meaning AS meaning, w.Term AS term,
          w.AudioUrlUK AS audioUrlUK, w.AudioUrlUS AS audioUrlUS, w.ImageUrl AS imageUrl, w.WordID AS wordId,
          p.PartOfSpeechName AS partOfSpeechName, ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
          ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus, ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
          ex.SentenceText AS exampleSentence, ex.SentenceTranslation AS exampleMeaning
        FROM Words w LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        OUTER APPLY (SELECT TOP 1 QuestionID, QuestionType, QuestionText, CorrectAnswer, OptionsJson FROM Questions WHERE WordID = w.WordID AND ContentStatus = N'Published' ORDER BY QuestionID) q
        OUTER APPLY (SELECT TOP 1 SentenceText, SentenceTranslation FROM ExampleSentences WHERE WordID = w.WordID ORDER BY ExampleSentenceID) ex
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE w.ContentStatus = N'Published'
          AND ((@TopicID IS NOT NULL AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = @TopicID))
            OR (@TopicID IS NULL AND (uwp.UserWordProgressID IS NOT NULL OR EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = @NewTopicID))))
          AND ((@Mode = N'new' AND ISNULL(uwp.RepetitionCount, 0) = 0)
            OR (@Mode = N'learned' AND uwp.UserWordProgressID IS NOT NULL)
            OR (@Mode NOT IN (N'new', N'learned') AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET())))
        ORDER BY CASE WHEN uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN 0 WHEN uwp.UserWordProgressID IS NOT NULL THEN 1 ELSE 2 END,
          uwp.NextReviewDate, uwp.MasteryLevel, NEWID()
      `);
    return result.recordset;
  }

  static async getAllDueFlashcards(userId, limit = 15) {
    const pool = await poolPromise;
    limit = Math.min(50, Math.max(1, limit));
    const result = await pool.request()
      .input("UserID", sql.BigInt, userId)
      .input("Limit", sql.Int, limit).query(`
        SELECT TOP (@Limit) q.QuestionID AS questionId, q.QuestionType AS questionType,
          COALESCE(q.QuestionText, w.Meaning) AS questionText, COALESCE(q.CorrectAnswer, w.Term) AS correctAnswer,
          q.OptionsJson AS optionsJson, w.Phonetic AS phonetic, w.Meaning AS meaning, w.Term AS term,
          w.AudioUrlUK AS audioUrlUK, w.AudioUrlUS AS audioUrlUS, w.ImageUrl AS imageUrl, w.WordID AS wordId,
          p.PartOfSpeechName AS partOfSpeechName, ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
          ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus, ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
          ex.SentenceText AS exampleSentence, ex.SentenceTranslation AS exampleMeaning
        FROM dbo.UserTopicEnrollments ute
        JOIN dbo.WordTopics wt ON ute.TopicID = wt.TopicID
        JOIN dbo.Words w ON wt.WordID = w.WordID AND w.ContentStatus = N'Published'
        LEFT JOIN dbo.PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        OUTER APPLY (SELECT TOP 1 QuestionID, QuestionType, QuestionText, CorrectAnswer, OptionsJson FROM dbo.Questions WHERE WordID = w.WordID AND ContentStatus = N'Published' ORDER BY QuestionID) q
        OUTER APPLY (SELECT TOP 1 SentenceText, SentenceTranslation FROM dbo.ExampleSentences WHERE WordID = w.WordID ORDER BY ExampleSentenceID) ex
        LEFT JOIN dbo.UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE ute.UserID = @UserID AND ute.IsActive = 1
          AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET())
        ORDER BY
          CASE WHEN uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN 0 WHEN uwp.UserWordProgressID IS NOT NULL THEN 1 ELSE 2 END,
          uwp.NextReviewDate, uwp.MasteryLevel, NEWID()
      `);
    return result.recordset;
  }

  static async getTopicWords(userId, topicId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("TopicID", sql.BigInt, topicId).query(`
      SELECT w.WordID AS wordId, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic,
        p.PartOfSpeechName AS partOfSpeechName, ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
        ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus, ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
        uwp.LastReviewedAt AS lastReviewedAt, uwp.NextReviewDate AS nextReviewDate,
        notebook.NotebookID AS notebookId, CASE WHEN notebook.NotebookID IS NULL THEN 0 ELSE 1 END AS isInNotebook,
        ex.SentenceText AS exampleSentence, ex.SentenceTranslation AS exampleMeaning
      FROM Topics t JOIN WordTopics wt ON wt.TopicID = t.TopicID
      JOIN Words w ON wt.WordID = w.WordID AND w.ContentStatus = N'Published'
      LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
      LEFT JOIN UserVocabularyNotebook notebook ON notebook.WordID = w.WordID AND notebook.UserID = @UserID
      OUTER APPLY (SELECT TOP 1 SentenceText, SentenceTranslation FROM ExampleSentences WHERE WordID = w.WordID ORDER BY ExampleSentenceID) ex
      WHERE t.TopicID = @TopicID AND t.ContentStatus = N'Published' ORDER BY w.Term ASC
    `);
    return result.recordset;
  }

  /** ── submitAnswer: engine/srs/ integrated ── */
  static async submitAnswer({ userId, questionId, wordId, submittedAnswer, isCorrect, reviewRating, activityType }) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId)
      .input("QuestionID", sql.BigInt, questionId).input("SubmittedAnswer", sql.NVarChar(1000), submittedAnswer || "")
      .execute("usp_SubmitQuestionAttempt");

    const canonicalWordId = Number(result.recordset[0]?.WordID || 0);
    if (!canonicalWordId) throw new Error("Question does not resolve to a vocabulary word");

    let reviewFeedback = {};
    if (['Again', 'Hard', 'Good', 'Easy'].includes(reviewRating)) {
      // 1. Đọc current progress
      const current = await pool.request().input("UserID", sql.BigInt, userId).input("WordID", sql.BigInt, canonicalWordId)
        .query(`SELECT EaseFactor, MasteryLevel FROM UserWordProgress WHERE UserID = @UserID AND WordID = @WordID`);
      const row = current.recordset[0] || {};
      const currentEF = row.EaseFactor != null ? Number(row.EaseFactor) : DEFAULT_EASE_FACTOR;
      const currentMastery = row.MasteryLevel != null ? Number(row.MasteryLevel) : 0;

      // 2. Tính toán SRS bằng engine/srs/ pure functions
      const newEF = calculateEaseFactor(currentEF, reviewRating);
      const nextReview = calculateNextReview(reviewRating, currentMastery);
      const now = new Date();

      // 3. UPDATE với giá trị đã tính
      const updateResult = await pool.request()
        .input("UserID", sql.BigInt, userId).input("WordID", sql.BigInt, canonicalWordId)
        .input("EaseFactor", sql.Decimal(5, 2), newEF)
        .input("NextReviewDate", sql.DateTimeOffset, nextReview)
        .query(`UPDATE UserWordProgress SET
            EaseFactor = @EaseFactor, NextReviewDate = @NextReviewDate, UpdatedAt = SYSDATETIMEOFFSET()
          OUTPUT inserted.NextReviewDate AS nextReviewDate, inserted.MemoryStatus AS memoryStatus, inserted.MasteryLevel AS masteryLevel
          WHERE UserID = @UserID AND WordID = @WordID`);
      reviewFeedback = updateResult.recordset[0] || {};
    }

    const gamification = activityType === "LearnWord"
      ? await GamificationService.awardXP(userId, { eventType: "LearnWord", sourceKey: `learn-word:${canonicalWordId}:${GamificationService.getDateKey()}`, metadata: { wordId: canonicalWordId, reviewRating: reviewRating || null } })
      : null;

    return { ...(result.recordset[0] || {}), ...reviewFeedback, xpGained: gamification?.xpGained || 0, reviewRating: reviewRating || null, gamification };
  }

  /** ── submitWordReview: engine/srs/ integrated ── */
  static async submitWordReview({ userId, wordId, isCorrect, reviewRating, activityType }) {
    const pool = await poolPromise;
    const now = new Date();

    // 1. Đọc current progress (nếu có)
    const current = await pool.request().input("UserID", sql.BigInt, userId).input("WordID", sql.BigInt, wordId)
      .query(`SELECT EaseFactor, MasteryLevel, RepetitionCount, ConsecutiveCorrect, ConsecutiveWrong FROM UserWordProgress WHERE UserID = @UserID AND WordID = @WordID`);
    const row = current.recordset[0];
    const hasExisting = !!row;

    // 2. Tính toán SRS bằng engine/srs/ pure functions
    const currentEF = row ? Number(row.EaseFactor) : DEFAULT_EASE_FACTOR;
    const currentMastery = row ? Number(row.MasteryLevel) : 0;
    const currentReps = row ? Number(row.RepetitionCount) : 0;

    const newEF = reviewRating ? calculateEaseFactor(currentEF, reviewRating) : currentEF;
    const newMastery = calculateMasteryLevel(currentMastery, isCorrect);
    const nextReview = reviewRating ? calculateNextReview(reviewRating, currentMastery)
      : isCorrect ? calculateNextReview('Good', currentMastery) : new Date();
    const newMemoryStatus = determineMemoryStatus(isCorrect, newMastery);
    const newReps = currentReps + 1;
    const newConsecutiveCorrect = row ? (isCorrect ? Number(row.ConsecutiveCorrect) + 1 : 0) : (isCorrect ? 1 : 0);
    const newConsecutiveWrong = row ? (!isCorrect ? Number(row.ConsecutiveWrong) + 1 : 0) : (!isCorrect ? 1 : 0);

    // 3. UPDATE hoặc INSERT
    let output;
    if (hasExisting) {
      const result = await pool.request()
        .input("UserID", sql.BigInt, userId).input("WordID", sql.BigInt, wordId)
        .input("MasteryLevel", sql.Int, newMastery)
        .input("EaseFactor", sql.Decimal(5, 2), newEF)
        .input("RepetitionCount", sql.Int, newReps)
        .input("ConsecutiveCorrect", sql.Int, newConsecutiveCorrect)
        .input("ConsecutiveWrong", sql.Int, newConsecutiveWrong)
        .input("NextReviewDate", sql.DateTimeOffset, nextReview)
        .input("MemoryStatus", sql.NVarChar(20), newMemoryStatus)
        .input("IsCorrect", sql.Bit, Boolean(isCorrect))
        .query(`UPDATE UserWordProgress SET
            MasteryLevel = @MasteryLevel, EaseFactor = @EaseFactor, RepetitionCount = @RepetitionCount,
            ConsecutiveCorrect = @ConsecutiveCorrect, ConsecutiveWrong = @ConsecutiveWrong,
            LastReviewedAt = SYSDATETIMEOFFSET(), NextReviewDate = @NextReviewDate,
            LastScore = CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
            MemoryStatus = @MemoryStatus, UpdatedAt = SYSDATETIMEOFFSET()
          OUTPUT inserted.UserWordProgressID AS id, inserted.MasteryLevel AS masteryLevel,
            inserted.MemoryStatus AS memoryStatus, inserted.NextReviewDate AS nextReviewDate
          WHERE UserID = @UserID AND WordID = @WordID`);
      output = result.recordset[0] || {};
    } else {
      const result = await pool.request()
        .input("UserID", sql.BigInt, userId).input("WordID", sql.BigInt, wordId)
        .input("MasteryLevel", sql.Int, newMastery)
        .input("EaseFactor", sql.Decimal(5, 2), newEF)
        .input("RepetitionCount", sql.Int, newReps)
        .input("ConsecutiveCorrect", sql.Int, newConsecutiveCorrect)
        .input("ConsecutiveWrong", sql.Int, newConsecutiveWrong)
        .input("NextReviewDate", sql.DateTimeOffset, nextReview)
        .input("MemoryStatus", sql.NVarChar(20), newMemoryStatus)
        .input("IsCorrect", sql.Bit, Boolean(isCorrect))
        .query(`INSERT INTO UserWordProgress (UserID, WordID, MasteryLevel, EaseFactor, RepetitionCount,
            ConsecutiveCorrect, ConsecutiveWrong, LastReviewedAt, NextReviewDate, LastScore, MemoryStatus, CreatedAt, UpdatedAt)
          OUTPUT inserted.UserWordProgressID AS id, inserted.MasteryLevel AS masteryLevel,
            inserted.MemoryStatus AS memoryStatus, inserted.NextReviewDate AS nextReviewDate
          VALUES (@UserID, @WordID, @MasteryLevel, @EaseFactor, @RepetitionCount,
            @ConsecutiveCorrect, @ConsecutiveWrong, SYSDATETIMEOFFSET(), @NextReviewDate,
            CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END, @MemoryStatus, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
      output = result.recordset[0] || {};
    }

    const gamification = activityType === "LearnWord"
      ? await GamificationService.awardXP(userId, { eventType: "LearnWord", sourceKey: `learn-word:${wordId}:${GamificationService.getDateKey()}`, metadata: { wordId, reviewRating: reviewRating || null } })
      : null;

    return { ...output, xpGained: gamification?.xpGained || 0, reviewRating: reviewRating || null, gamification };
  }

  static async getSmartReviewQueue(userId, limit = 20) {
    const pool = await poolPromise;
    limit = Math.min(50, Math.max(1, limit));
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("Limit", sql.Int, limit).query(`
      SELECT TOP (@Limit) w.WordID AS wordId, w.Term AS term, w.Phonetic AS phonetic, w.Meaning AS meaning,
        w.AudioUrlUK AS audioUrlUK, w.AudioUrlUS AS audioUrlUS, p.PartOfSpeechName AS partOfSpeechName,
        ISNULL(uwp.MasteryLevel, 0) AS masteryLevel, ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
        uwp.LastReviewedAt AS lastReviewedAt, uwp.NextReviewDate AS nextReviewDate,
        uwp.RepetitionCount AS repetitionCount, uwp.ConsecutiveWrong AS consecutiveWrong,
        CASE WHEN uwp.NextReviewDate IS NULL THEN 0
          WHEN uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN DATEDIFF(hour, uwp.NextReviewDate, SYSDATETIMEOFFSET()) * CASE WHEN uwp.ConsecutiveWrong > 0 THEN 3 ELSE 1 END
          ELSE DATEDIFF(hour, SYSDATETIMEOFFSET(), uwp.NextReviewDate) * -1 END AS priorityScore
      FROM Words w LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
      WHERE w.ContentStatus = N'Published' AND uwp.NextReviewDate <= DATEADD(day, 7, SYSDATETIMEOFFSET())
      ORDER BY priorityScore DESC, uwp.MasteryLevel ASC
    `);
    return result.recordset;
  }

  static async getPracticeQueue(userId, { limit = 15, topicId = null } = {}) {
    limit = Math.min(50, Math.max(1, limit));

    const smartLimit = Math.min(7, Math.max(3, Math.round(limit / 3)));
    const smartQueue = await this.getSmartReviewQueue(userId, smartLimit);

    const remainingLimit = limit - smartQueue.length;
    let normalQueue = [];
    if (remainingLimit > 0) {
      normalQueue = topicId
        ? await this.getDueFlashcards(userId, { topicId })
        : await this.getAllDueFlashcards(userId, remainingLimit);
      normalQueue = normalQueue.slice(0, remainingLimit);
    }

    const smartQuestions = smartQueue.map((item) => ({
      questionId: null,
      wordId: Number(item.wordId),
      questionType: 'FillBlank',
      questionText: String(item.meaning || '') || String(item.term || ''),
      correctAnswer: String(item.term || ''),
      optionsJson: null,
      term: String(item.term || ''),
      meaning: String(item.meaning || ''),
      phonetic: item.phonetic || null,
      source: 'smart',
    }));

    const normalQuestions = normalQueue.map((item) => ({
      ...item,
      source: 'normal',
    }));

    const merged = [];
    let si = 0;
    let ni = 0;
    let turn = 0;
    while (si < smartQuestions.length || ni < normalQuestions.length) {
      if (si < smartQuestions.length && (turn % 3 === 0 || ni >= normalQuestions.length)) {
        merged.push(smartQuestions[si++]);
      } else if (ni < normalQuestions.length) {
        merged.push(normalQuestions[ni++]);
      } else if (si < smartQuestions.length) {
        merged.push(smartQuestions[si++]);
      }
      turn++;
    }

    return merged;
  }

  static async getMistakeReviewQueue(userId, limit = 10) {
    const pool = await poolPromise;
    limit = Math.min(30, Math.max(1, limit));
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("Limit", sql.Int, limit).query(`
      SELECT TOP (@Limit) w.WordID AS wordId, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic,
        p.PartOfSpeechName AS partOfSpeechName, ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
        ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus, uwp.ConsecutiveWrong AS consecutiveWrong, recent.wrongCount
      FROM (SELECT WordID, COUNT(*) AS wrongCount FROM ExerciseAttempts WHERE UserID = @UserID AND IsCorrect = 0 AND WordID IS NOT NULL GROUP BY WordID HAVING COUNT(*) >= 1) recent
      JOIN Words w ON recent.WordID = w.WordID
      LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
      ORDER BY recent.wrongCount DESC, uwp.MasteryLevel ASC
    `);
    return result.recordset;
  }

  // ── Mini Tests ──
  static async getMiniTests(page = 1, pageSize = 20, search = "") {
    const pool = await poolPromise;
    page = Math.max(1, page);
    pageSize = Math.min(100, Math.max(1, pageSize));
    const offset = (page - 1) * pageSize;
    const searchFilter = search
      ? `AND mt.TestTitle LIKE @Search`
      : "";
    const countReq = search
      ? pool.request().input("Search", sql.NVarChar(200), `%${search}%`)
      : pool.request();
    const countResult = await countReq.query(`SELECT COUNT(*) AS total FROM MiniTests mt LEFT JOIN Topics t ON mt.TopicID = t.TopicID WHERE mt.IsPublished = 1 ${searchFilter}`);
    const total = countResult.recordset[0].total;
    const dataReq = pool.request().input("Offset", sql.Int, offset).input("PageSize", sql.Int, pageSize);
    if (search) dataReq.input("Search", sql.NVarChar(200), `%${search}%`);
    const result = await dataReq.query(`
      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description,
        t.TopicName AS topicName, t.TopicCode AS topicCode, mt.TotalQuestions AS totalQuestions
      FROM MiniTests mt LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      WHERE mt.IsPublished = 1 ${searchFilter} ORDER BY mt.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async getMyMiniTestAttempts(userId, testId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("MiniTestID", sql.BigInt, testId)
      .query(`SELECT COUNT(*) AS attemptCount, ISNULL(MAX(Score), 0) AS bestScore FROM dbo.MiniTestAttempts WHERE MiniTestID = @MiniTestID AND UserID = @UserID AND SubmittedAt IS NOT NULL`);
    return { attemptCount: Number(result.recordset[0]?.attemptCount || 0), bestScore: Number(result.recordset[0]?.bestScore || 0) };
  }

  static async getMiniTestDetails(testId) {
    const pool = await poolPromise;
    const result = await pool.request().input("MiniTestID", sql.BigInt, testId).query(`
      SELECT q.QuestionID AS questionId, q.QuestionType AS questionType, q.QuestionText AS questionText,
        q.OptionsJson AS optionsJson, q.CorrectAnswer AS correctAnswer, w.Term AS term
      FROM MiniTests mt JOIN MiniTestItems mti ON mti.MiniTestID = mt.MiniTestID
      JOIN Questions q ON mti.QuestionID = q.QuestionID AND q.ContentStatus = N'Published'
      JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = N'Published'
      WHERE mt.MiniTestID = @MiniTestID AND mt.IsPublished = 1 ORDER BY NEWID()
    `);
    return result.recordset;
  }

  static async getTestHistory(userId, page = 1, pageSize = 20) {
    const pool = await poolPromise;
    page = Math.max(1, page);
    pageSize = Math.min(100, Math.max(1, pageSize));
    const offset = (page - 1) * pageSize;
    const countResult = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT COUNT(DISTINCT CAST(ea.AttemptedAt AS DATE) + CAST(mt.MiniTestID AS NVARCHAR)) AS total
      FROM ExerciseAttempts ea JOIN Questions q ON ea.QuestionID = q.QuestionID
      JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID WHERE ea.UserID = @UserID
    `);
    const total = countResult.recordset[0].total;
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("Offset", sql.Int, offset).input("PageSize", sql.Int, pageSize).query(`
      SELECT CAST(ea.AttemptedAt AS DATE) AS date, mt.MiniTestID AS testId, mt.TestTitle AS testTitle,
        COUNT(*) AS totalQuestions, SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) AS correctAnswers
      FROM ExerciseAttempts ea JOIN Questions q ON ea.QuestionID = q.QuestionID
      JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID WHERE ea.UserID = @UserID
      GROUP BY CAST(ea.AttemptedAt AS DATE), mt.TestTitle, mt.MiniTestID
      ORDER BY date DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async getTestSessionDetails(userId, testId, date) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("MiniTestID", sql.BigInt, testId).input("Date", sql.Date, date).query(`
      SELECT q.QuestionText AS questionText, q.QuestionType AS questionType, q.OptionsJson AS optionsJson,
        q.CorrectAnswer AS correctAnswer, ea.SubmittedAnswer AS submittedAnswer, ea.IsCorrect AS isCorrect,
        w.Term AS term, w.Meaning AS meaning
      FROM ExerciseAttempts ea JOIN Questions q ON ea.QuestionID = q.QuestionID
      JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID JOIN Words w ON q.WordID = w.WordID
      WHERE ea.UserID = @UserID AND mti.MiniTestID = @MiniTestID AND CAST(ea.AttemptedAt AS DATE) = @Date
    `);
    return result.recordset;
  }

  /** ── submitMiniTestBatch: engine/srs/ integrated ── */
  static async submitMiniTestBatch(userId, testId, answers) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    let committed = false;
    try {
      await transaction.begin();
      const mtCheck = await new sql.Request(transaction).input("MiniTestID", sql.BigInt, testId)
        .query(`SELECT IsPublished, ContentStatus FROM dbo.MiniTests WHERE MiniTestID = @MiniTestID`);
      if (!mtCheck.recordset[0] || mtCheck.recordset[0].IsPublished !== true)
        throw new Error(`Mini test ${testId} chưa được xuất bản hoặc không tồn tại`);

      const attemptCountResult = await new sql.Request(transaction).input("MiniTestID", sql.BigInt, testId).input("UserID", sql.BigInt, userId)
        .query(`SELECT COUNT(*) AS cnt, ISNULL(MAX(Score), 0) AS bestScore FROM dbo.MiniTestAttempts WHERE MiniTestID = @MiniTestID AND UserID = @UserID AND SubmittedAt IS NOT NULL`);
      const attemptInfo = attemptCountResult.recordset[0];

      const testQuestionsResult = await new sql.Request(transaction).input("MiniTestID", sql.BigInt, testId)
        .query(`SELECT q.QuestionID, q.WordID, q.CorrectAnswer, q.QuestionType FROM dbo.MiniTestItems mti JOIN dbo.Questions q ON q.QuestionID = mti.QuestionID AND q.ContentStatus = N'Published' WHERE mti.MiniTestID = @MiniTestID;`);
      const testQuestions = new Map(testQuestionsResult.recordset.map((q) => [Number(q.QuestionID), q]));
      if (testQuestions.size === 0) throw new Error(`Mini test ${testId} does not contain questions`);
      if (answers.length !== testQuestions.size) throw new Error(`Mini test ${testId} requires exactly ${testQuestions.size} answers`);

      let correctCount = 0;
      const results = [];
      const submittedQuestionIds = new Set();

      // Batch lấy current progress cho tất cả wordIds
      const wordIds = [...new Set(answers.map((a) => {
        const q = testQuestions.get(Number(a.questionId));
        return q ? Number(q.WordID) : null;
      }).filter(Boolean))];

      let progressMap = new Map();
      if (wordIds.length > 0) {
        const placeholders = wordIds.map((_, i) => `@WordID_${i}`).join(',');
        const progReq = new sql.Request(transaction).input('UserID', sql.BigInt, userId);
        wordIds.forEach((wid, i) => progReq.input(`WordID_${i}`, sql.BigInt, wid));
        const progResult = await progReq.query(`SELECT WordID, EaseFactor, MasteryLevel, RepetitionCount, ConsecutiveCorrect, ConsecutiveWrong FROM UserWordProgress WHERE UserID = @UserID AND WordID IN (${placeholders})`);
        progressMap = new Map(progResult.recordset.map((r) => [Number(r.WordID), r]));
      }

      for (const answer of answers) {
        const { questionId } = answer;
        const submittedAnswer = String(answer.submittedAnswer || "").slice(0, 1000);
        const numericQuestionId = Number(questionId);
        const question = testQuestions.get(numericQuestionId);
        if (!question) throw new Error(`Question ${questionId || "unknown"} does not belong to mini test ${testId}`);
        if (submittedQuestionIds.has(numericQuestionId)) throw new Error(`Question ${numericQuestionId} was submitted more than once`);
        submittedQuestionIds.add(numericQuestionId);

        const wordId = Number(question.WordID);
        const isCorrect = gradeQuestion(question.QuestionType, submittedAnswer, question.CorrectAnswer);
        const scoreAwarded = isCorrect ? 100 : 0;
        const req = new sql.Request(transaction);
        req.input('UserID', sql.BigInt, userId).input('QuestionID', sql.BigInt, questionId || null);
        req.input('WordID', sql.BigInt, wordId || null).input('SubmittedAnswer', sql.NVarChar(1000), submittedAnswer);
        req.input('IsCorrect', sql.Bit, isCorrect).input('ScoreAwarded', sql.Decimal(5, 2), scoreAwarded);
        await req.query(`INSERT INTO ExerciseAttempts (UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, ScoreAwarded, AttemptedAt) VALUES (@UserID, @QuestionID, @WordID, @SubmittedAnswer, @IsCorrect, @ScoreAwarded, SYSDATETIMEOFFSET())`);

        if (wordId) {
          // Tính toán SRS bằng engine/srs/ pure functions
          const row = progressMap.get(wordId);
          const currentEF = row ? Number(row.EaseFactor) : DEFAULT_EASE_FACTOR;
          const currentMastery = row ? Number(row.MasteryLevel) : 0;
          const currentReps = row ? Number(row.RepetitionCount) : 0;

          const newMastery = calculateMasteryLevel(currentMastery, isCorrect);
          const nextReview = isCorrect
            ? calculateNextReview('Good', currentMastery)
            : new Date();
          const newMemoryStatus = determineMemoryStatus(isCorrect, newMastery);
          const newReps = currentReps + 1;

          const wordReq = new sql.Request(transaction);
          wordReq.input('UserID', sql.BigInt, userId).input('WordID', sql.BigInt, wordId);
          wordReq.input('MasteryLevel', sql.Int, newMastery);
          wordReq.input('RepetitionCount', sql.Int, newReps);
          wordReq.input('NextReviewDate', sql.DateTimeOffset, nextReview);
          wordReq.input('MemoryStatus', sql.NVarChar(20), newMemoryStatus);
          wordReq.input('IsCorrect', sql.Bit, isCorrect);

          if (row) {
            const newEF = calculateEaseFactor(currentEF, 'Good');
            const newConsecutiveCorrect = isCorrect ? Number(row.ConsecutiveCorrect) + 1 : 0;
            const newConsecutiveWrong = !isCorrect ? Number(row.ConsecutiveWrong) + 1 : 0;
            wordReq.input('EaseFactor', sql.Decimal(5, 2), newEF);
            wordReq.input('ConsecutiveCorrect', sql.Int, newConsecutiveCorrect);
            wordReq.input('ConsecutiveWrong', sql.Int, newConsecutiveWrong);
            await wordReq.query(`UPDATE UserWordProgress SET MasteryLevel = @MasteryLevel, EaseFactor = @EaseFactor,
              RepetitionCount = @RepetitionCount, ConsecutiveCorrect = @ConsecutiveCorrect, ConsecutiveWrong = @ConsecutiveWrong,
              LastReviewedAt = SYSDATETIMEOFFSET(), NextReviewDate = @NextReviewDate,
              LastScore = CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END, MemoryStatus = @MemoryStatus, UpdatedAt = SYSDATETIMEOFFSET()
              WHERE UserID = @UserID AND WordID = @WordID`);
            progressMap.set(wordId, { ...row, EaseFactor: newEF, MasteryLevel: newMastery,
              RepetitionCount: newReps, ConsecutiveCorrect: newConsecutiveCorrect,
              ConsecutiveWrong: newConsecutiveWrong, MemoryStatus: newMemoryStatus });
          } else {
            wordReq.input('EaseFactor', sql.Decimal(5, 2), DEFAULT_EASE_FACTOR);
            await wordReq.query(`INSERT INTO UserWordProgress (UserID, WordID, MasteryLevel, EaseFactor, RepetitionCount,
                ConsecutiveCorrect, ConsecutiveWrong, LastReviewedAt, NextReviewDate, LastScore, MemoryStatus, CreatedAt, UpdatedAt)
              VALUES (@UserID, @WordID, @MasteryLevel, @EaseFactor, @RepetitionCount,
                CASE WHEN @IsCorrect = 1 THEN 1 ELSE 0 END, CASE WHEN @IsCorrect = 0 THEN 1 ELSE 0 END,
                SYSDATETIMEOFFSET(), @NextReviewDate, CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
                @MemoryStatus, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
            progressMap.set(wordId, { WordID: wordId, EaseFactor: DEFAULT_EASE_FACTOR,
              MasteryLevel: newMastery, RepetitionCount: newReps,
              ConsecutiveCorrect: isCorrect ? 1 : 0, ConsecutiveWrong: isCorrect ? 0 : 1,
              MemoryStatus: newMemoryStatus });
          }
        }
        if (isCorrect) correctCount++;
        results.push({ questionId, wordId, isCorrect });
      }

      const score = Math.round((correctCount / answers.length) * 100);
      const attemptResult = await new sql.Request(transaction)
        .input('UserID', sql.BigInt, userId).input('MiniTestID', sql.BigInt, testId)
        .input('TotalQuestions', sql.Int, answers.length).input('CorrectCount', sql.Int, correctCount).input('Score', sql.Decimal(5, 2), score)
        .query(`INSERT dbo.MiniTestAttempts (MiniTestID, UserID, StartedAt, SubmittedAt, TotalQuestions, CorrectCount, Score) OUTPUT inserted.MiniTestAttemptID AS id VALUES (@MiniTestID, @UserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), @TotalQuestions, @CorrectCount, @Score);`);
      await transaction.commit();
      committed = true;
      const miniTestAttemptId = attemptResult.recordset[0]?.id;

      const isRetake = attemptInfo.cnt > 0;
      const previousBest = Number(attemptInfo.bestScore || 0);
      const improved = isRetake && score > previousBest;
      let xpAmount = 20;
      if (isRetake) xpAmount = 10;
      if (improved) xpAmount += 5;

      const gamification = await GamificationService.awardXP(userId, { eventType: "MiniTestComplete", sourceKey: `mini-test-attempt:${miniTestAttemptId}`, xpAmount, metadata: { testId: Number(testId), miniTestAttemptId, score, attemptNumber: attemptInfo.cnt + 1 } });
      return { total: answers.length, correct: correctCount, score, xpEarned: gamification.xpGained, gamification, results, attemptNumber: attemptInfo.cnt + 1 };
    } catch (err) {
      if (!committed) await transaction.rollback();
      throw err;
    }
  }
}

module.exports = FlashcardService;
