const { poolPromise, sql } = require('../config/db');

class CreatorService {
  // ── Dashboard & Analytics ──
  static async getDashboardStats(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        -- Query 1: Content Creator Summary
        SELECT * FROM vw_ContentCreatorContentSummary WHERE UserID = @UserID;

        -- Query 2: Topic Learning Analytics for Creator's Topics
        SELECT a.*
        FROM vw_TopicLearningAnalytics a
        JOIN Topics t ON t.TopicID = a.TopicID
        WHERE t.CreatedByUserID = @UserID;

        -- Query 3: MiniTest Analytics for Creator's MiniTests
        SELECT a.*
        FROM vw_MiniTestAnalytics a
        JOIN MiniTests mt ON mt.MiniTestID = a.MiniTestID
        WHERE mt.CreatedByUserID = @UserID;
      `);
    return {
      stats: result.recordsets[0][0] || {},
      topicAnalytics: result.recordsets[1] || [],
      miniTestAnalytics: result.recordsets[2] || []
    };
  }

  static async getContentSummary(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT 'Topic' AS EntityType, ContentStatus, COUNT(*) AS Total
        FROM Topics WHERE CreatedByUserID = @UserID GROUP BY ContentStatus
        UNION ALL
        SELECT 'Word', ContentStatus, COUNT(*)
        FROM Words WHERE CreatedByUserID = @UserID GROUP BY ContentStatus
        UNION ALL
        SELECT 'Question', ContentStatus, COUNT(*)
        FROM Questions WHERE CreatedByUserID = @UserID GROUP BY ContentStatus
        UNION ALL
        SELECT 'MiniTest', ContentStatus, COUNT(*)
        FROM MiniTests WHERE CreatedByUserID = @UserID GROUP BY ContentStatus
      `);
    return result.recordset;
  }

  static async getTopicAnalytics(userId, topicId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('TopicID', sql.BigInt, topicId)
      .query(`
        SELECT a.*
        FROM vw_TopicLearningAnalytics a
        JOIN Topics t ON t.TopicID = a.TopicID
        WHERE t.CreatedByUserID = @UserID AND t.TopicID = @TopicID
      `);
    return result.recordset[0] || null;
  }

  static async getMiniTestAnalytics(userId, miniTestId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('MiniTestID', sql.BigInt, miniTestId)
      .query(`
        SELECT a.*
        FROM vw_MiniTestAnalytics a
        JOIN MiniTests mt ON mt.MiniTestID = a.MiniTestID
        WHERE mt.CreatedByUserID = @UserID AND mt.MiniTestID = @MiniTestID
      `);
    return result.recordset[0] || null;
  }

  static async getAcademicAnalytics(userId) {
    const pool = await poolPromise;

    const summaryQuery = pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT
          (SELECT COUNT(DISTINCT mta.UserID)
           FROM dbo.MiniTestAttempts mta
           JOIN dbo.MiniTests mt ON mta.MiniTestID = mt.MiniTestID
           WHERE mt.CreatedByUserID = @UserID) AS totalStudents,

          (SELECT ISNULL(AVG(mta.Score), 0)
           FROM dbo.MiniTestAttempts mta
           JOIN dbo.MiniTests mt ON mta.MiniTestID = mt.MiniTestID
           WHERE mt.CreatedByUserID = @UserID) AS averageScore,

          (SELECT COUNT(mta.MiniTestAttemptID)
           FROM dbo.MiniTestAttempts mta
           JOIN dbo.MiniTests mt ON mta.MiniTestID = mt.MiniTestID
           WHERE mt.CreatedByUserID = @UserID) AS totalAttempts,

          (SELECT COUNT(*)
           FROM dbo.Topics
           WHERE CreatedByUserID = @UserID AND ContentStatus = 'Published') AS publishedTopics
      `);

    const hardWordsQuery = pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT TOP 10
               w.WordID AS wordId,
               w.Term AS term,
               w.Meaning AS meaning,
               COUNT(*) AS totalAttempts,
               SUM(CASE WHEN ea.IsCorrect = 0 THEN 1 ELSE 0 END) AS wrongAttempts,
               CAST(SUM(CASE WHEN ea.IsCorrect = 0 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*) AS DECIMAL(5,1)) AS failureRate
        FROM dbo.ExerciseAttempts ea
        JOIN dbo.Words w ON ea.WordID = w.WordID
        WHERE w.CreatedByUserID = @UserID
        GROUP BY w.WordID, w.Term, w.Meaning
        HAVING COUNT(*) >= 1
        ORDER BY failureRate DESC, wrongAttempts DESC
      `);

    const studentAttemptsQuery = pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT mta.MiniTestAttemptID AS id,
               mta.MiniTestID AS testId,
               mt.TestTitle AS testTitle,
               mta.UserID AS userId,
               u.FullName AS studentName,
               u.Email AS studentEmail,
               mta.Score AS score,
               mta.TotalQuestions AS totalQuestions,
               mta.CorrectCount AS correctCount,
               mta.SubmittedAt AS submittedAt
        FROM dbo.MiniTestAttempts mta
        JOIN dbo.MiniTests mt ON mta.MiniTestID = mt.MiniTestID
        JOIN dbo.Users u ON mta.UserID = u.UserID
        WHERE mt.CreatedByUserID = @UserID
        ORDER BY mta.SubmittedAt DESC
      `);

    const testPerformanceQuery = pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT mt.MiniTestID AS testId,
               mt.TestTitle AS testTitle,
               ISNULL(AVG(mta.Score), 0) AS averageScore,
               COUNT(mta.MiniTestAttemptID) AS attemptCount
        FROM dbo.MiniTests mt
        LEFT JOIN dbo.MiniTestAttempts mta ON mt.MiniTestID = mta.MiniTestID
        WHERE mt.CreatedByUserID = @UserID
        GROUP BY mt.MiniTestID, mt.TestTitle
      `);

    const [summaryRes, hardWordsRes, attemptsRes, perfRes] = await Promise.all([
      summaryQuery,
      hardWordsQuery,
      studentAttemptsQuery,
      testPerformanceQuery
    ]);

    const summary = summaryRes.recordset[0] || { totalStudents: 0, averageScore: 0, totalAttempts: 0, publishedTopics: 0 };
    summary.averageScore = Number(Number(summary.averageScore).toFixed(1));

    return {
      summary,
      hardWords: hardWordsRes.recordset.map(w => ({
        ...w,
        failureRate: Number(w.failureRate)
      })),
      studentAttempts: attemptsRes.recordset,
      testPerformance: perfRes.recordset.map(t => ({
        ...t,
        averageScore: Number(Number(t.averageScore).toFixed(1))
      }))
    };
  }

  static async submitForReview(entityType, entityId, userId) {
    const map = {
      topic: { table: 'Topics', idCol: 'TopicID', type: 'Topic' },
      word: { table: 'Words', idCol: 'WordID', type: 'Word' },
      question: { table: 'Questions', idCol: 'QuestionID', type: 'Question' },
      minitest: { table: 'MiniTests', idCol: 'MiniTestID', type: 'MiniTest' }
    };
    const e = map[String(entityType || '').toLowerCase()];
    if (!e) throw new Error('EntityType không hợp lệ');

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      const checkReq = new sql.Request(transaction);
      const checkResult = await checkReq
        .input('ID', sql.BigInt, entityId)
        .input('UserID', sql.BigInt, userId)
        .query(`SELECT ContentStatus FROM ${e.table} WHERE ${e.idCol} = @ID AND CreatedByUserID = @UserID`);

      if (checkResult.recordset.length === 0) {
        await transaction.rollback();
        return false;
      }

      const status = checkResult.recordset[0].ContentStatus;
      if (status !== 'Draft' && status !== 'Rejected') {
        await transaction.rollback();
        return false;
      }

      const updateReq = new sql.Request(transaction);
      await updateReq
        .input('ID', sql.BigInt, entityId)
        .input('UserID', sql.BigInt, userId)
        .query(`UPDATE ${e.table} SET ContentStatus = 'PendingReview', UpdatedAt = SYSDATETIMEOFFSET() WHERE ${e.idCol} = @ID AND CreatedByUserID = @UserID`);

      const logReq = new sql.Request(transaction);
      await logReq
        .input('EntityType', sql.NVarChar(30), e.type)
        .input('EntityID', sql.BigInt, entityId)
        .input('UserID', sql.BigInt, userId)
        .input('OldStatus', sql.NVarChar(20), status)
        .query(`
          INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment, CreatedAt)
          VALUES (@EntityType, @EntityID, @UserID, @OldStatus, 'PendingReview', N'Submitted for review by creator', SYSDATETIMEOFFSET())
        `);

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ── TopicCategories (Read-only) ──
  static async getTopicCategories() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TopicCategoryID AS id, CategoryName AS name, CategoryCode AS code,
             Description AS description, IconUrl AS iconUrl, DisplayOrder AS displayOrder,
             IsActive AS isActive
      FROM TopicCategories
      WHERE IsActive = 1
      ORDER BY DisplayOrder, CategoryName
    `);
    return result.recordset;
  }

  // ── Topics CRUD ──
  static async getMyTopics(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 50));
    const offset = (page - 1) * pageSize;

    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 't.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND t.ContentStatus = @Status';
    }

    const countResult = await req.query(`
      SELECT COUNT(*) AS total
      FROM Topics t
      WHERE ${where}
    `);
    const total = countResult.recordset[0].total;

    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 't.CreatedByUserID = @UserID';
    if (filters.status) {
      req2.input('Status', sql.NVarChar(20), filters.status);
      where2 += ' AND t.ContentStatus = @Status';
    }

    const result = await req2.query(`
      SELECT t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code,
             t.Description AS description, t.ContentStatus AS contentStatus,
             tc.CategoryName AS categoryName, t.TopicCategoryID AS categoryId,
             t.CreatedAt AS createdAt
      FROM Topics t
      LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID
      WHERE ${where2}
      ORDER BY t.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async createTopic(data, userId) {
    const { topicName, topicCode, description, topicCategoryId } = data;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TopicName', sql.NVarChar(200), topicName)
      .input('TopicCode', sql.NVarChar(50), topicCode)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('TopicCategoryID', sql.BigInt, topicCategoryId || null)
      .input('CreatedByUserID', sql.BigInt, userId)
      .query(`
        INSERT INTO Topics (TopicName, TopicCode, Description, TopicCategoryID,
                            CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
        OUTPUT inserted.TopicID AS id
        VALUES (@TopicName, @TopicCode, @Description, @TopicCategoryID,
                @CreatedByUserID, 'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);
    return { id: result.recordset[0].id, topicName };
  }

  static async updateTopic(id, data, userId) {
    const { topicName, topicCode, description, topicCategoryId } = data;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TopicID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .input('TopicName', sql.NVarChar(200), topicName)
      .input('TopicCode', sql.NVarChar(50), topicCode || null)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('TopicCategoryID', sql.BigInt, topicCategoryId || null)
      .query(`
        UPDATE Topics
        SET TopicName = ISNULL(@TopicName, TopicName),
            TopicCode = ISNULL(@TopicCode, TopicCode),
            Description = ISNULL(@Description, Description),
            TopicCategoryID = ISNULL(@TopicCategoryID, TopicCategoryID),
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE TopicID = @TopicID AND CreatedByUserID = @UserID
      `);
    return result.rowsAffected[0] > 0;
  }

  static async deleteTopic(id, userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TopicID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`
        DELETE FROM Topics
        WHERE TopicID = @TopicID AND CreatedByUserID = @UserID AND ContentStatus = 'Draft'
      `);
    return result.rowsAffected[0] > 0;
  }

  static async submitForReview(entityType, id, userId) {
    const entityMap = {
      topic: { table: 'Topics', idCol: 'TopicID', type: 'Topic' },
      word: { table: 'Words', idCol: 'WordID', type: 'Word' },
      question: { table: 'Questions', idCol: 'QuestionID', type: 'Question' },
      minitest: { table: 'MiniTests', idCol: 'MiniTestID', type: 'MiniTest' },
    };
    const e = entityMap[String(entityType || '').toLowerCase()];
    if (!e) throw new Error('EntityType không hợp lệ');

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const req1 = new sql.Request(transaction);
      const upd = await req1
        .input('ID', sql.BigInt, id)
        .input('UserID', sql.BigInt, userId)
        .query(`
          UPDATE ${e.table}
          SET ContentStatus = 'PendingReview', UpdatedAt = SYSDATETIMEOFFSET()
          WHERE ${e.idCol} = @ID AND CreatedByUserID = @UserID
            AND ContentStatus IN ('Draft', 'Rejected')
        `);
      if (upd.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }
      const req2 = new sql.Request(transaction);
      await req2
        .input('EntityType', sql.NVarChar(30), e.type)
        .input('EntityID', sql.BigInt, id)
        .input('ActionByUserID', sql.BigInt, userId)
        .query(`
          INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, NewStatus, Comment, CreatedAt)
          VALUES (@EntityType, @EntityID, @ActionByUserID, 'PendingReview', 'Submitted for review', SYSDATETIMEOFFSET())
        `);
      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ── Words CRUD ──
  static async getMyWords(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 50));
    const offset = (page - 1) * pageSize;
    const topicId = filters.topicId ? Number(filters.topicId) : null;

    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'w.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND w.ContentStatus = @Status';
    }
    if (topicId) {
      req.input('TopicID', sql.BigInt, topicId);
      where += ' AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = @TopicID)';
    }

    const countResult = await req.query(`
      SELECT COUNT(*) AS total
      FROM Words w
      WHERE ${where}
    `);
    const total = countResult.recordset[0].total;

    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 'w.CreatedByUserID = @UserID';
    if (filters.status) {
      req2.input('Status', sql.NVarChar(20), filters.status);
      where2 += ' AND w.ContentStatus = @Status';
    }
    if (topicId) {
      req2.input('TopicID', sql.BigInt, topicId);
      where2 += ' AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = @TopicID)';
    }

    const result = await req2.query(`
      SELECT w.WordID AS id, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic,
             w.PartOfSpeechID AS partOfSpeechId, p.PartOfSpeechName AS partOfSpeechName,
             w.ContentStatus AS contentStatus, w.CreatedAt AS createdAt
      FROM Words w
      LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      WHERE ${where2}
      ORDER BY w.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async createWord(data, userId) {
    const { term, meaning, phonetic, partOfSpeechId, topicIds, examples } = data;
    if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
      throw new Error('Từ vựng bắt buộc phải được gán vào ít nhất một chủ đề (Topic)');
    }
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const req = new sql.Request(transaction);
      const wordResult = await req
        .input('Term', sql.NVarChar(200), term)
        .input('Meaning', sql.NVarChar(1000), meaning)
        .input('Phonetic', sql.NVarChar(255), phonetic || '')
        .input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .input('CreatedByUserID', sql.BigInt, userId)
        .query(`
          INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID,
                             ContentStatus, CreatedAt, UpdatedAt)
          OUTPUT inserted.WordID AS id
          VALUES (@Term, @Meaning, @Phonetic, @PartOfSpeechID, @CreatedByUserID,
                  'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      const wordId = wordResult.recordset[0].id;

      if (Array.isArray(topicIds)) {
        for (const tid of topicIds) {
          const r = new sql.Request(transaction);
          await r.input('WordID', sql.BigInt, wordId)
            .input('TopicID', sql.BigInt, tid)
            .query(`INSERT INTO WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @TopicID, SYSDATETIMEOFFSET())`);
        }
      }

      const validExamples = Array.isArray(examples) ? examples.filter(e => String(e?.sentence ?? '').trim()) : [];
      for (const ex of validExamples) {
        const r = new sql.Request(transaction);
        await r.input('WordID', sql.BigInt, wordId)
          .input('SentenceText', sql.NVarChar(2000), ex.sentence)
          .input('SentenceTranslation', sql.NVarChar(2000), ex.meaning || '')
          .query(`INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
                  VALUES (@WordID, @SentenceText, @SentenceTranslation, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
      }

      await transaction.commit();
      return { id: wordId, term };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async bulkCreateWords(wordsData, userId, conflictStrategy = 'merge') {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const insertedIds = [];

      for (const data of wordsData) {
        const { term, meaning, phonetic, partOfSpeechId, topicIds, examples } = data;
        if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
          throw new Error('Tất cả từ vựng import bắt buộc phải được gán vào ít nhất một chủ đề (Topic)');
        }
        
        // 1. Resolve Part of Speech ID
        let resolvedPartOfSpeechId = 1; // Default
        if (typeof partOfSpeechId === 'number') {
          resolvedPartOfSpeechId = partOfSpeechId;
        } else if (typeof partOfSpeechId === 'string' && partOfSpeechId.trim()) {
          const cleanPos = partOfSpeechId.toLowerCase().trim();
          if (cleanPos === 'noun' || cleanPos === 'n' || cleanPos === 'danh từ' || cleanPos === 'danh tu' || cleanPos === '1') {
            resolvedPartOfSpeechId = 1;
          } else if (cleanPos === 'verb' || cleanPos === 'v' || cleanPos === 'động từ' || cleanPos === 'dong tu' || cleanPos === '2') {
            resolvedPartOfSpeechId = 2;
          } else if (cleanPos === 'adjective' || cleanPos === 'adj' || cleanPos === 'tính từ' || cleanPos === 'tinh tu' || cleanPos === '3') {
            resolvedPartOfSpeechId = 3;
          } else if (cleanPos === 'adverb' || cleanPos === 'adv' || cleanPos === 'trạng từ' || cleanPos === 'trang tu' || cleanPos === '4') {
            resolvedPartOfSpeechId = 4;
          } else if (cleanPos === 'preposition' || cleanPos === 'prep' || cleanPos === 'giới từ' || cleanPos === 'gioi tu' || cleanPos === '5') {
            resolvedPartOfSpeechId = 5;
          }
        }

        // 2. Check for duplicate key (Term, PartOfSpeechID)
        const checkReq = new sql.Request(transaction);
        const existingResult = await checkReq
          .input('Term', sql.NVarChar(200), term)
          .input('PartOfSpeechID', sql.Int, resolvedPartOfSpeechId)
          .query(`SELECT WordID, Meaning, Phonetic FROM Words WHERE Term = @Term AND PartOfSpeechID = @PartOfSpeechID`);

        let wordId;
        
        if (existingResult.recordset.length > 0) {
          // Word already exists
          if (conflictStrategy === 'skip') {
            continue; // Skip this word entirely
          }
          
          wordId = existingResult.recordset[0].WordID;
          
          if (conflictStrategy === 'overwrite') {
            // Update meaning & phonetic
            const updateReq = new sql.Request(transaction);
            await updateReq
              .input('WordID', sql.BigInt, wordId)
              .input('Meaning', sql.NVarChar(1000), meaning)
              .input('Phonetic', sql.NVarChar(255), phonetic || '')
              .query(`UPDATE Words SET Meaning = @Meaning, Phonetic = @Phonetic, UpdatedAt = SYSDATETIMEOFFSET() WHERE WordID = @WordID`);
          }
          // If strategy is merge, we keep the old meaning & phonetic and just reuse the ID
        } else {
          // Word does not exist, insert it
          const insertReq = new sql.Request(transaction);
          const wordResult = await insertReq
            .input('Term', sql.NVarChar(200), term)
            .input('Meaning', sql.NVarChar(1000), meaning)
            .input('Phonetic', sql.NVarChar(255), phonetic || '')
            .input('PartOfSpeechID', sql.Int, resolvedPartOfSpeechId)
            .input('CreatedByUserID', sql.BigInt, userId)
            .query(`
              INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID,
                                 ContentStatus, CreatedAt, UpdatedAt)
              OUTPUT inserted.WordID AS id
              VALUES (@Term, @Meaning, @Phonetic, @PartOfSpeechID, @CreatedByUserID,
                      'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
            `);
          wordId = wordResult.recordset[0].id;
          insertedIds.push(wordId);
        }

        // 3. Link topics safely
        if (Array.isArray(topicIds)) {
          for (const tid of topicIds) {
            const topicCheckReq = new sql.Request(transaction);
            const existsLink = await topicCheckReq
              .input('WordID', sql.BigInt, wordId)
              .input('TopicID', sql.BigInt, tid)
              .query(`SELECT 1 FROM WordTopics WHERE WordID = @WordID AND TopicID = @TopicID`);
            
            if (existsLink.recordset.length === 0) {
              const insertTopicReq = new sql.Request(transaction);
              await insertTopicReq
                .input('WordID', sql.BigInt, wordId)
                .input('TopicID', sql.BigInt, tid)
                .query(`INSERT INTO WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @TopicID, SYSDATETIMEOFFSET())`);
            }
          }
        }

        // 4. Add examples safely
        const validExamples = Array.isArray(examples) ? examples.filter(e => String(e?.sentence ?? '').trim()) : [];
        for (const ex of validExamples) {
          const exCheckReq = new sql.Request(transaction);
          const existsEx = await exCheckReq
            .input('WordID', sql.BigInt, wordId)
            .input('SentenceText', sql.NVarChar(2000), ex.sentence)
            .query(`SELECT 1 FROM ExampleSentences WHERE WordID = @WordID AND SentenceText = @SentenceText`);
            
          if (existsEx.recordset.length === 0) {
            const insertExReq = new sql.Request(transaction);
            await insertExReq
              .input('WordID', sql.BigInt, wordId)
              .input('SentenceText', sql.NVarChar(2000), ex.sentence)
              .input('SentenceTranslation', sql.NVarChar(2000), ex.meaning || '')
              .query(`INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
                      VALUES (@WordID, @SentenceText, @SentenceTranslation, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
          }
        }
      }

      await transaction.commit();
      return { count: insertedIds.length, ids: insertedIds };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async updateWord(id, data, userId) {
    const { term, meaning, phonetic, partOfSpeechId } = data;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .input('Term', sql.NVarChar(200), term)
      .input('Meaning', sql.NVarChar(1000), meaning)
      .input('Phonetic', sql.NVarChar(255), phonetic || '')
      .input('PartOfSpeechID', sql.Int, partOfSpeechId)
      .query(`
        UPDATE Words SET Term=@Term, Meaning=@Meaning, Phonetic=@Phonetic,
          PartOfSpeechID=@PartOfSpeechID, UpdatedAt=SYSDATETIMEOFFSET()
        WHERE WordID=@WordID AND CreatedByUserID=@UserID
      `);
    return result.rowsAffected[0] > 0;
  }

  static async deleteWord(id, userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`DELETE FROM Words WHERE WordID=@WordID AND CreatedByUserID=@UserID AND ContentStatus='Draft'`);
    return result.rowsAffected[0] > 0;
  }

  // ── Questions CRUD ──
  static async getMyQuestions(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 50));
    const offset = (page - 1) * pageSize;
    const topicId = filters.topicId ? Number(filters.topicId) : null;

    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'q.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND q.ContentStatus = @Status';
    }
    if (topicId) {
      req.input('TopicID', sql.BigInt, topicId);
      where += ' AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = q.WordID AND wt.TopicID = @TopicID)';
    }

    const countResult = await req.query(`
      SELECT COUNT(*) AS total
      FROM Questions q
      WHERE ${where}
    `);
    const total = countResult.recordset[0].total;

    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 'q.CreatedByUserID = @UserID';
    if (filters.status) {
      req2.input('Status', sql.NVarChar(20), filters.status);
      where2 += ' AND q.ContentStatus = @Status';
    }
    if (topicId) {
      req2.input('TopicID', sql.BigInt, topicId);
      where2 += ' AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = q.WordID AND wt.TopicID = @TopicID)';
    }

    const result = await req2.query(`
      SELECT q.QuestionID AS id, q.WordID AS wordId, w.Term AS wordTerm,
             q.QuestionType AS questionType, q.QuestionText AS questionText,
             q.OptionsJson AS optionsJson, q.CorrectAnswer AS correctAnswer,
             q.Explanation AS explanation, q.ContentStatus AS contentStatus,
             q.CreatedAt AS createdAt
      FROM Questions q
      LEFT JOIN Words w ON q.WordID = w.WordID
      WHERE ${where2}
      ORDER BY q.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async createQuestion(data, userId) {
    const { wordId, questionType, questionText, optionsJson, correctAnswer, explanation } = data;
    const pool = await poolPromise;
    
    // Check if the word exists, belongs to a topic, and is owned by/accessible to the creator
    const wordCheck = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT w.WordID FROM Words w
        JOIN WordTopics wt ON w.WordID = wt.WordID
        WHERE w.WordID = @WordID AND w.CreatedByUserID = @UserID
      `);
    if (wordCheck.recordset.length === 0) {
      throw new Error('Từ vựng không hợp lệ hoặc không thuộc về chủ đề nào do bạn quản lý');
    }

    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText)
      .input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson || '[]')
      .input('CorrectAnswer', sql.NVarChar(500), correctAnswer)
      .input('Explanation', sql.NVarChar(2000), explanation || null)
      .input('CreatedByUserID', sql.BigInt, userId)
      .query(`
        INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer,
                               Explanation, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
        OUTPUT inserted.QuestionID AS id
        VALUES (@WordID, @QuestionType, @QuestionText, @OptionsJson, @CorrectAnswer,
                @Explanation, @CreatedByUserID, 'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);
    return result.recordset[0];
  }

  static async updateQuestion(id, data, userId) {
    const { wordId, questionType, questionText, optionsJson, correctAnswer, explanation } = data;
    const pool = await poolPromise;

    // Check if the word exists, belongs to a topic, and is owned by/accessible to the creator
    const wordCheck = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT w.WordID FROM Words w
        JOIN WordTopics wt ON w.WordID = wt.WordID
        WHERE w.WordID = @WordID AND w.CreatedByUserID = @UserID
      `);
    if (wordCheck.recordset.length === 0) {
      throw new Error('Từ vựng không hợp lệ hoặc không thuộc về chủ đề nào do bạn quản lý');
    }

    const result = await pool.request()
      .input('QuestionID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .input('WordID', sql.BigInt, wordId)
      .input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText)
      .input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson || '[]')
      .input('CorrectAnswer', sql.NVarChar(500), correctAnswer)
      .input('Explanation', sql.NVarChar(2000), explanation || null)
      .query(`
        UPDATE Questions SET WordID=@WordID, QuestionType=@QuestionType, QuestionText=@QuestionText,
          OptionsJson=@OptionsJson, CorrectAnswer=@CorrectAnswer, Explanation=@Explanation,
          UpdatedAt=SYSDATETIMEOFFSET()
        WHERE QuestionID=@QuestionID AND CreatedByUserID=@UserID
      `);
    return result.rowsAffected[0] > 0;
  }

  static async deleteQuestion(id, userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('QuestionID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`DELETE FROM Questions WHERE QuestionID=@QuestionID AND CreatedByUserID=@UserID AND ContentStatus='Draft'`);
    return result.rowsAffected[0] > 0;
  }

  // ── MiniTests CRUD ──
  static async getMyMiniTests(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 50));
    const offset = (page - 1) * pageSize;

    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'mt.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND mt.ContentStatus = @Status';
    }

    const countResult = await req.query(`
      SELECT COUNT(*) AS total
      FROM MiniTests mt
      WHERE ${where}
    `);
    const total = countResult.recordset[0].total;

    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 'mt.CreatedByUserID = @UserID';
    if (filters.status) {
      req2.input('Status', sql.NVarChar(20), filters.status);
      where2 += ' AND mt.ContentStatus = @Status';
    }

    const result = await req2.query(`
      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description,
             mt.TopicID AS topicId, t.TopicName AS topicName, mt.TotalQuestions AS totalQuestions,
             mt.IsPublished AS isPublished, mt.ContentStatus AS contentStatus,
             mt.CreatedAt AS createdAt
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      WHERE ${where2}
      ORDER BY mt.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async createMiniTest(data, userId) {
    const { title, description, topicId, questionIds } = data;
    if (!topicId) {
      throw new Error('Bài test bắt buộc phải gắn liền với một chủ đề (Topic)');
    }
    const pool = await poolPromise;
    // Check if the topic exists and belongs to the creator
    const topicCheck = await pool.request()
      .input('TopicID', sql.BigInt, topicId)
      .input('UserID', sql.BigInt, userId)
      .query(`SELECT TopicID FROM Topics WHERE TopicID = @TopicID AND CreatedByUserID = @UserID`);
    if (topicCheck.recordset.length === 0) {
      throw new Error('Chủ đề (Topic) không hợp lệ hoặc không thuộc quyền sở hữu của bạn');
    }

    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const req = new sql.Request(transaction);
      const testResult = await req
        .input('Title', sql.NVarChar(255), title)
        .input('Description', sql.NVarChar(1000), description || null)
        .input('TopicID', sql.BigInt, topicId)
        .input('CreatedByUserID', sql.BigInt, userId)
        .input('TotalQuestions', sql.Int, Array.isArray(questionIds) ? questionIds.length : 0)
        .query(`
          INSERT INTO MiniTests (TestTitle, Description, TopicID, CreatedByUserID, TotalQuestions,
                                 IsPublished, ContentStatus, CreatedAt, UpdatedAt)
          OUTPUT inserted.MiniTestID AS id
          VALUES (@Title, @Description, @TopicID, @CreatedByUserID, @TotalQuestions,
                  0, 'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      const testId = testResult.recordset[0].id;

      if (Array.isArray(questionIds)) {
        for (let i = 0; i < questionIds.length; i++) {
          const r = new sql.Request(transaction);
          await r.input('MiniTestID', sql.BigInt, testId)
            .input('QuestionID', sql.BigInt, questionIds[i])
            .input('DisplayOrder', sql.Int, i + 1)
            .query(`INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES (@MiniTestID, @QuestionID, @DisplayOrder)`);
        }
      }
      await transaction.commit();
      return { id: testId, title };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async updateMiniTest(id, data, userId) {
    const { title, description, topicId } = data;
    if (!topicId) {
      throw new Error('Bài test bắt buộc phải gắn liền với một chủ đề (Topic)');
    }
    const pool = await poolPromise;
    // Check if the topic exists and belongs to the creator
    const topicCheck = await pool.request()
      .input('TopicID', sql.BigInt, topicId)
      .input('UserID', sql.BigInt, userId)
      .query(`SELECT TopicID FROM Topics WHERE TopicID = @TopicID AND CreatedByUserID = @UserID`);
    if (topicCheck.recordset.length === 0) {
      throw new Error('Chủ đề (Topic) không hợp lệ hoặc không thuộc quyền sở hữu của bạn');
    }

    const result = await pool.request()
      .input('MiniTestID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .input('Title', sql.NVarChar(255), title)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('TopicID', sql.BigInt, topicId)
      .query(`
        UPDATE MiniTests SET TestTitle=@Title, Description=@Description, TopicID=@TopicID,
          UpdatedAt=SYSDATETIMEOFFSET()
        WHERE MiniTestID=@MiniTestID AND CreatedByUserID=@UserID
      `);
    return result.rowsAffected[0] > 0;
  }

  static async deleteMiniTest(id, userId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const r1 = new sql.Request(transaction);
      await r1.input('MiniTestID', sql.BigInt, id).input('UserID', sql.BigInt, userId)
        .query(`DELETE FROM MiniTestItems WHERE MiniTestID = @MiniTestID
                AND EXISTS (SELECT 1 FROM MiniTests WHERE MiniTestID=@MiniTestID AND CreatedByUserID=@UserID AND ContentStatus='Draft')`);
      const r2 = new sql.Request(transaction);
      const del = await r2.input('MiniTestID', sql.BigInt, id).input('UserID', sql.BigInt, userId)
        .query(`DELETE FROM MiniTests WHERE MiniTestID=@MiniTestID AND CreatedByUserID=@UserID AND ContentStatus='Draft'`);
      await transaction.commit();
      return del.rowsAffected[0] > 0;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async addMiniTestItem(miniTestId, questionId, userId) {
    const pool = await poolPromise;
    const check = await pool.request()
      .input('MiniTestID', sql.BigInt, miniTestId)
      .input('UserID', sql.BigInt, userId)
      .query(`SELECT MiniTestID FROM MiniTests WHERE MiniTestID=@MiniTestID AND CreatedByUserID=@UserID`);
    if (check.recordset.length === 0) return false;

    const orderResult = await pool.request()
      .input('MiniTestID', sql.BigInt, miniTestId)
      .query(`SELECT ISNULL(MAX(DisplayOrder),0)+1 AS nextOrder FROM MiniTestItems WHERE MiniTestID=@MiniTestID`);
    const nextOrder = orderResult.recordset[0].nextOrder;

    await pool.request()
      .input('MiniTestID', sql.BigInt, miniTestId)
      .input('QuestionID', sql.BigInt, questionId)
      .input('DisplayOrder', sql.Int, nextOrder)
      .query(`INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES (@MiniTestID, @QuestionID, @DisplayOrder)`);

    await pool.request().input('MiniTestID', sql.BigInt, miniTestId)
      .query(`UPDATE MiniTests SET TotalQuestions=(SELECT COUNT(*) FROM MiniTestItems WHERE MiniTestID=@MiniTestID), UpdatedAt=SYSDATETIMEOFFSET() WHERE MiniTestID=@MiniTestID`);
    return true;
  }

  static async removeMiniTestItem(miniTestId, questionId, userId) {
    const pool = await poolPromise;
    const check = await pool.request()
      .input('MiniTestID', sql.BigInt, miniTestId)
      .input('UserID', sql.BigInt, userId)
      .query(`SELECT MiniTestID FROM MiniTests WHERE MiniTestID=@MiniTestID AND CreatedByUserID=@UserID`);
    if (check.recordset.length === 0) return false;

    await pool.request()
      .input('MiniTestID', sql.BigInt, miniTestId)
      .input('QuestionID', sql.BigInt, questionId)
      .query(`DELETE FROM MiniTestItems WHERE MiniTestID=@MiniTestID AND QuestionID=@QuestionID`);

    await pool.request().input('MiniTestID', sql.BigInt, miniTestId)
      .query(`UPDATE MiniTests SET TotalQuestions=(SELECT COUNT(*) FROM MiniTestItems WHERE MiniTestID=@MiniTestID), UpdatedAt=SYSDATETIMEOFFSET() WHERE MiniTestID=@MiniTestID`);
    return true;
  }

  static async submitMiniTestForReview(id, userId) {
    const pool = await poolPromise;
    // Check all questions in test are Published
    const check = await pool.request()
      .input('MiniTestID', sql.BigInt, id)
      .query(`
        SELECT COUNT(*) AS unpublished
        FROM MiniTestItems mti
        JOIN Questions q ON mti.QuestionID = q.QuestionID
        WHERE mti.MiniTestID = @MiniTestID AND q.ContentStatus <> 'Published'
      `);
    if (check.recordset[0].unpublished > 0) {
      throw new Error('Tất cả câu hỏi trong bài test phải được Published trước khi gửi duyệt');
    }
    return this.submitForReview('minitest', id, userId);
  }

  // ── Media CRUD ──
  static async getMyMedia(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 24));
    const offset = (page - 1) * pageSize;

    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'm.UploadedByUserID = @UserID';
    if (filters.mediaType) {
      req.input('MediaType', sql.NVarChar(30), filters.mediaType);
      where += ' AND m.MediaType = @MediaType';
    }
    if (filters.search) {
      req.input('Search', sql.NVarChar(255), `%${filters.search}%`);
      where += ' AND m.FileName LIKE @Search';
    }

    const countResult = await req.query(`SELECT COUNT(*) AS total FROM MediaAssets m WHERE ${where}`);
    const total = countResult.recordset[0].total;

    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 'm.UploadedByUserID = @UserID';
    if (filters.mediaType) {
      req2.input('MediaType', sql.NVarChar(30), filters.mediaType);
      where2 += ' AND m.MediaType = @MediaType';
    }
    if (filters.search) {
      req2.input('Search', sql.NVarChar(255), `%${filters.search}%`);
      where2 += ' AND m.FileName LIKE @Search';
    }

    const result = await req2.query(`
      SELECT m.MediaAssetID AS id, m.FileName AS fileName, m.FileUrl AS fileUrl,
             m.MediaType AS mediaType, m.MimeType AS mimeType, m.FileSizeBytes AS fileSizeBytes,
             m.AltText AS altText, m.Transcript AS transcript, m.CreatedAt AS createdAt
      FROM MediaAssets m
      WHERE ${where2}
      ORDER BY m.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async createMedia(file, userId, metadata = {}) {
    const { ALLOWED_TYPES } = require('../middlewares/upload');
    const mediaType = ALLOWED_TYPES[file.mimetype] || 'Image';
    const fileUrl = `/uploads/media/${file.filename}`;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('UploadedByUserID', sql.BigInt, userId)
      .input('MediaType', sql.NVarChar(30), mediaType)
      .input('FileUrl', sql.NVarChar(1000), fileUrl)
      .input('FileName', sql.NVarChar(255), file.originalname)
      .input('MimeType', sql.NVarChar(100), file.mimetype)
      .input('FileSizeBytes', sql.BigInt, file.size)
      .input('AltText', sql.NVarChar(500), metadata.altText || null)
      .input('Transcript', sql.NVarChar(2000), metadata.transcript || null)
      .query(`
        INSERT INTO MediaAssets (UploadedByUserID, MediaType, FileUrl, FileName, MimeType,
                                 FileSizeBytes, AltText, Transcript, CreatedAt)
        OUTPUT inserted.MediaAssetID AS id, inserted.FileUrl AS fileUrl, inserted.FileName AS fileName,
               inserted.MediaType AS mediaType, inserted.MimeType AS mimeType,
               inserted.FileSizeBytes AS fileSizeBytes, inserted.CreatedAt AS createdAt
        VALUES (@UploadedByUserID, @MediaType, @FileUrl, @FileName, @MimeType,
                @FileSizeBytes, @AltText, @Transcript, SYSDATETIMEOFFSET())
      `);
    return result.recordset[0];
  }

  static async deleteMedia(id, userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MediaAssetID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`DELETE FROM MediaAssets WHERE MediaAssetID = @MediaAssetID AND UploadedByUserID = @UserID`);
    return result.rowsAffected[0] > 0;
  }
}

module.exports = CreatorService;
