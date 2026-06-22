const { poolPromise, sql } = require('../config/db');

class CreatorService {
  static parseQuestionOptions(questionType, optionsJson, correctAnswer) {
    const options = JSON.parse(optionsJson || '[]');
    if (!Array.isArray(options)) {
      throw new Error('Question options must be an array');
    }
    if (questionType === 'MCQ') {
      const normalizedOptions = [...new Set(options.map((option) => String(option).trim()).filter(Boolean))];
      if (normalizedOptions.length < 2) {
        throw new Error('MCQ requires at least two options');
      }
      if (!normalizedOptions.includes(String(correctAnswer).trim())) {
        throw new Error('Correct answer must match an MCQ option');
      }
      return normalizedOptions;
    }
    return options;
  }

  static async validateMiniTestReferences(transaction, topicId, questionIds, userId) {
    const rawQuestionIds = Array.isArray(questionIds) ? questionIds : [];
    const normalizedQuestionIds = [...new Set(rawQuestionIds)];
    if (normalizedQuestionIds.length !== rawQuestionIds.length) {
      throw new Error('Mini test contains duplicate questions');
    }
    if (!normalizedQuestionIds.length) {
      throw new Error('Mini test requires at least one question');
    }

    if (topicId) {
      const topicRequest = new sql.Request(transaction);
      const topic = await topicRequest
        .input('TopicID', sql.BigInt, topicId)
        .input('UserID', sql.BigInt, userId)
        .query(`
          SELECT TopicID FROM Topics
          WHERE TopicID = @TopicID
            AND (CreatedByUserID = @UserID OR ContentStatus = N'Published')
        `);
      if (!topic.recordset.length) throw new Error('Topic not found or unavailable');
    }

    for (const questionId of normalizedQuestionIds) {
      const questionRequest = new sql.Request(transaction);
      const question = await questionRequest
        .input('QuestionID', sql.BigInt, questionId)
        .input('UserID', sql.BigInt, userId)
        .query(`
          SELECT QuestionID FROM Questions
          WHERE QuestionID = @QuestionID
            AND CreatedByUserID = @UserID
            AND ContentStatus = N'Published'
        `);
      if (!question.recordset.length) {
        throw new Error('Mini test questions must be owned and published');
      }
    }

    return normalizedQuestionIds;
  }

  // ── Dashboard & Analytics ──
  static async getDashboardStats(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID) AS TotalTopics,
          (SELECT COUNT(*) FROM Words WHERE CreatedByUserID = @UserID) AS TotalWords,
          (SELECT COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID) AS TotalQuestions,
          (SELECT COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID) AS TotalMiniTests,
          (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID AND ContentStatus = N'Published') AS PublishedTopics,
          (SELECT COUNT(*) FROM Words WHERE CreatedByUserID = @UserID AND ContentStatus = N'Published') AS PublishedWords,
          (SELECT COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID AND ContentStatus = N'Published') AS PublishedQuestions,
          (SELECT COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID AND ContentStatus = N'Published') AS PublishedMiniTests,
          (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID AND ContentStatus = N'Draft') +
          (SELECT COUNT(*) FROM Words WHERE CreatedByUserID = @UserID AND ContentStatus = N'Draft') +
          (SELECT COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID AND ContentStatus = N'Draft') +
          (SELECT COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID AND ContentStatus = N'Draft') AS TotalDrafts,
          (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID AND ContentStatus = N'PendingReview') +
          (SELECT COUNT(*) FROM Words WHERE CreatedByUserID = @UserID AND ContentStatus = N'PendingReview') +
          (SELECT COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID AND ContentStatus = N'PendingReview') +
          (SELECT COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID AND ContentStatus = N'PendingReview') AS TotalPendingReview,
          (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID AND ContentStatus = N'Rejected') +
          (SELECT COUNT(*) FROM Words WHERE CreatedByUserID = @UserID AND ContentStatus = N'Rejected') +
          (SELECT COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID AND ContentStatus = N'Rejected') +
          (SELECT COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID AND ContentStatus = N'Rejected') AS TotalRejected;
      `);
    return result.recordset[0] || {};
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
    const search = String(filters.search || '').trim();
    if (search) {
      req.input('Search', sql.NVarChar(250), `%${search}%`);
      where += ' AND (t.TopicName LIKE @Search OR t.TopicCode LIKE @Search OR t.Description LIKE @Search)';
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
    if (search) {
      req2.input('Search', sql.NVarChar(250), `%${search}%`);
      where2 += ' AND (t.TopicName LIKE @Search OR t.TopicCode LIKE @Search OR t.Description LIKE @Search)';
    }

    const result = await req2.query(`
      SELECT t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code,
             t.Description AS description, t.ContentStatus AS contentStatus,
             tc.CategoryName AS categoryName, t.TopicCategoryID AS categoryId,
             t.CreatedAt AS createdAt, t.UpdatedAt AS updatedAt,
             (
               SELECT TOP 1 crl.Comment
               FROM ContentReviewLogs crl
               WHERE crl.EntityType = N'Topic' AND crl.EntityID = t.TopicID AND crl.NewStatus = N'Rejected'
               ORDER BY crl.CreatedAt DESC
             ) AS rejectionReason
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
    if (topicCategoryId) {
      const category = await pool.request()
        .input('TopicCategoryID', sql.BigInt, topicCategoryId)
        .query('SELECT TopicCategoryID FROM TopicCategories WHERE TopicCategoryID = @TopicCategoryID AND IsActive = 1');
      if (!category.recordset.length) throw new Error('Topic category not found');
    }
    const duplicate = await pool.request()
      .input('TopicName', sql.NVarChar(200), topicName)
      .input('TopicCode', sql.NVarChar(50), topicCode)
      .query('SELECT TopicID FROM Topics WHERE TopicName = @TopicName OR TopicCode = @TopicCode');
    if (duplicate.recordset.length) throw new Error('Topic name or code already exists');

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
    if (topicCategoryId) {
      const category = await pool.request()
        .input('TopicCategoryID', sql.BigInt, topicCategoryId)
        .query('SELECT TopicCategoryID FROM TopicCategories WHERE TopicCategoryID = @TopicCategoryID AND IsActive = 1');
      if (!category.recordset.length) throw new Error('Topic category not found');
    }
    const duplicate = await pool.request()
      .input('TopicID', sql.BigInt, id)
      .input('TopicName', sql.NVarChar(200), topicName)
      .input('TopicCode', sql.NVarChar(50), topicCode)
      .query(`
        SELECT TopicID FROM Topics
        WHERE TopicID <> @TopicID AND (TopicName = @TopicName OR TopicCode = @TopicCode)
      `);
    if (duplicate.recordset.length) throw new Error('Topic name or code already exists');

    const result = await pool.request()
      .input('TopicID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .input('TopicName', sql.NVarChar(200), topicName)
      .input('TopicCode', sql.NVarChar(50), topicCode || null)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('TopicCategoryID', sql.BigInt, topicCategoryId || null)
      .query(`
        UPDATE Topics
        SET TopicName = @TopicName,
            TopicCode = @TopicCode,
            Description = @Description,
            TopicCategoryID = @TopicCategoryID,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE TopicID = @TopicID AND CreatedByUserID = @UserID
          AND ContentStatus IN (N'Draft', N'Rejected')
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

  static async submitForReview(tableName, idColumn, id, userId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const req1 = new sql.Request(transaction);
      const upd = await req1
        .input('ID', sql.BigInt, id)
        .input('UserID', sql.BigInt, userId)
        .query(`
          UPDATE ${tableName}
          SET ContentStatus = 'PendingReview', UpdatedAt = SYSDATETIMEOFFSET()
          WHERE ${idColumn} = @ID AND CreatedByUserID = @UserID
            AND ContentStatus IN ('Draft', 'Rejected')
        `);
      if (upd.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }
      const req2 = new sql.Request(transaction);
      await req2
        .input('EntityType', sql.NVarChar(30), tableName === 'Topics' ? 'Topic' : tableName === 'Words' ? 'Word' : tableName === 'Questions' ? 'Question' : 'MiniTest')
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

    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'w.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND w.ContentStatus = @Status';
    }
    const search = String(filters.search || '').trim();
    if (search) {
      req.input('Search', sql.NVarChar(250), `%${search}%`);
      where += ' AND (w.Term LIKE @Search OR w.Meaning LIKE @Search OR w.Phonetic LIKE @Search)';
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
    if (search) {
      req2.input('Search', sql.NVarChar(250), `%${search}%`);
      where2 += ' AND (w.Term LIKE @Search OR w.Meaning LIKE @Search OR w.Phonetic LIKE @Search)';
    }

    const result = await req2.query(`
      SELECT w.WordID AS id, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic,
             w.PartOfSpeechID AS partOfSpeechId, p.PartOfSpeechName AS partOfSpeechName,
             w.ContentStatus AS contentStatus, w.CreatedAt AS createdAt, w.UpdatedAt AS updatedAt,
             (
               SELECT wt.TopicID AS id, t.TopicName AS name
               FROM WordTopics wt
               JOIN Topics t ON wt.TopicID = t.TopicID
               WHERE wt.WordID = w.WordID
               FOR JSON PATH
             ) AS topicsJson,
             (
               SELECT es.ExampleSentenceID AS id, es.SentenceText AS sentence, es.SentenceTranslation AS meaning
               FROM ExampleSentences es
               WHERE es.WordID = w.WordID
               ORDER BY es.ExampleSentenceID
               FOR JSON PATH
             ) AS examplesJson,
             (
               SELECT TOP 1 crl.Comment
               FROM ContentReviewLogs crl
               WHERE crl.EntityType = N'Word' AND crl.EntityID = w.WordID AND crl.NewStatus = N'Rejected'
               ORDER BY crl.CreatedAt DESC
             ) AS rejectionReason
      FROM Words w
      LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      WHERE ${where2}
      ORDER BY w.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return {
      data: result.recordset.map((word) => ({
        ...word,
        topics: word.topicsJson ? JSON.parse(word.topicsJson) : [],
        topicIds: word.topicsJson ? JSON.parse(word.topicsJson).map((topic) => topic.id) : [],
        examples: word.examplesJson ? JSON.parse(word.examplesJson) : []
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  static async createWord(data, userId) {
    const { term, meaning, phonetic, partOfSpeechId, topicIds, examples } = data;
    const normalizedTopicIds = [...new Set(Array.isArray(topicIds) ? topicIds : [])];
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const ownershipRequest = new sql.Request(transaction);
      const references = await ownershipRequest
        .input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .query('SELECT PartOfSpeechID FROM PartOfSpeeches WHERE PartOfSpeechID = @PartOfSpeechID');
      if (!references.recordset.length) throw new Error('Invalid part of speech');

      const duplicateRequest = new sql.Request(transaction);
      const duplicate = await duplicateRequest
        .input('Term', sql.NVarChar(200), term)
        .input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .query('SELECT WordID FROM Words WHERE Term = @Term AND PartOfSpeechID = @PartOfSpeechID');
      if (duplicate.recordset.length) throw new Error('Word already exists for this part of speech');

      for (const topicId of normalizedTopicIds) {
        const topicRequest = new sql.Request(transaction);
        const topic = await topicRequest
          .input('TopicID', sql.BigInt, topicId)
          .input('UserID', sql.BigInt, userId)
          .query(`
            SELECT TopicID FROM Topics
            WHERE TopicID = @TopicID
              AND (CreatedByUserID = @UserID OR ContentStatus = N'Published')
          `);
        if (!topic.recordset.length) throw new Error('Topic not found or unavailable');
      }

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

      if (normalizedTopicIds.length) {
        for (const tid of normalizedTopicIds) {
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

  static async updateWord(id, data, userId) {
    const { term, meaning, phonetic, partOfSpeechId, topicIds = [], examples = [] } = data;
    const normalizedTopicIds = [...new Set(topicIds)];
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const partOfSpeechRequest = new sql.Request(transaction);
      const partOfSpeech = await partOfSpeechRequest
        .input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .query('SELECT PartOfSpeechID FROM PartOfSpeeches WHERE PartOfSpeechID = @PartOfSpeechID');
      if (!partOfSpeech.recordset.length) throw new Error('Invalid part of speech');

      const duplicateRequest = new sql.Request(transaction);
      const duplicate = await duplicateRequest
        .input('WordID', sql.BigInt, id)
        .input('Term', sql.NVarChar(200), term)
        .input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .query(`
          SELECT WordID FROM Words
          WHERE WordID <> @WordID AND Term = @Term AND PartOfSpeechID = @PartOfSpeechID
        `);
      if (duplicate.recordset.length) throw new Error('Word already exists for this part of speech');

      for (const topicId of normalizedTopicIds) {
        const topicRequest = new sql.Request(transaction);
        const topic = await topicRequest
          .input('TopicID', sql.BigInt, topicId)
          .input('UserID', sql.BigInt, userId)
          .query(`
            SELECT TopicID FROM Topics
            WHERE TopicID = @TopicID
              AND (CreatedByUserID = @UserID OR ContentStatus = N'Published')
          `);
        if (!topic.recordset.length) throw new Error('Topic not found or unavailable');
      }

      const request = new sql.Request(transaction);
      const result = await request
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
            AND ContentStatus IN (N'Draft', N'Rejected')
        `);
      if (!result.rowsAffected[0]) {
        await transaction.rollback();
        return false;
      }

      const clear = new sql.Request(transaction);
      await clear.input('WordID', sql.BigInt, id).query(`
        DELETE FROM WordTopics WHERE WordID = @WordID;
        DELETE FROM ExampleSentences WHERE WordID = @WordID;
      `);

      for (const topicId of normalizedTopicIds) {
        const topicRequest = new sql.Request(transaction);
        await topicRequest
          .input('WordID', sql.BigInt, id)
          .input('TopicID', sql.BigInt, topicId)
          .query(`
            INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
            VALUES (@WordID, @TopicID, SYSDATETIMEOFFSET());
          `);
      }

      for (const example of examples.filter((item) => String(item?.sentence || '').trim())) {
        const exampleRequest = new sql.Request(transaction);
        await exampleRequest
          .input('WordID', sql.BigInt, id)
          .input('SentenceText', sql.NVarChar(2000), example.sentence)
          .input('SentenceTranslation', sql.NVarChar(2000), example.meaning || '')
          .query(`
            INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
            VALUES (@WordID, @SentenceText, @SentenceTranslation, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
          `);
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteWord(id, userId) {
    const pool = await poolPromise;
    const linked = await pool.request()
      .input('WordID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT w.WordID,
               (SELECT COUNT(*) FROM Questions q WHERE q.WordID = w.WordID) AS QuestionCount
        FROM Words w
        WHERE w.WordID = @WordID AND w.CreatedByUserID = @UserID AND w.ContentStatus = N'Draft'
      `);
    if (!linked.recordset.length) return false;
    if (linked.recordset[0].QuestionCount > 0) {
      throw new Error('Word is linked to questions');
    }
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

    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'q.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND q.ContentStatus = @Status';
    }
    const search = String(filters.search || '').trim();
    if (search) {
      req.input('Search', sql.NVarChar(250), `%${search}%`);
      where += ' AND (q.QuestionText LIKE @Search OR q.CorrectAnswer LIKE @Search OR w.Term LIKE @Search)';
    }

    const countResult = await req.query(`
      SELECT COUNT(*) AS total
      FROM Questions q
      LEFT JOIN Words w ON q.WordID = w.WordID
      WHERE ${where}
    `);
    const total = countResult.recordset[0].total;

    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 'q.CreatedByUserID = @UserID';
    if (filters.status) {
      req2.input('Status', sql.NVarChar(20), filters.status);
      where2 += ' AND q.ContentStatus = @Status';
    }
    if (search) {
      req2.input('Search', sql.NVarChar(250), `%${search}%`);
      where2 += ' AND (q.QuestionText LIKE @Search OR q.CorrectAnswer LIKE @Search OR w.Term LIKE @Search)';
    }

    const result = await req2.query(`
      SELECT q.QuestionID AS id, q.WordID AS wordId, w.Term AS wordTerm,
             q.QuestionType AS questionType, q.QuestionText AS questionText,
             q.OptionsJson AS optionsJson, q.CorrectAnswer AS correctAnswer,
             q.Explanation AS explanation, q.ContentStatus AS contentStatus,
             q.CreatedAt AS createdAt, q.UpdatedAt AS updatedAt,
             (
               SELECT TOP 1 crl.Comment
               FROM ContentReviewLogs crl
               WHERE crl.EntityType = N'Question' AND crl.EntityID = q.QuestionID AND crl.NewStatus = N'Rejected'
               ORDER BY crl.CreatedAt DESC
             ) AS rejectionReason
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
    const normalizedOptionsJson = JSON.stringify(
      this.parseQuestionOptions(questionType, optionsJson, correctAnswer)
    );
    const word = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT WordID FROM Words
        WHERE WordID = @WordID
          AND (CreatedByUserID = @UserID OR ContentStatus = N'Published')
      `);
    if (!word.recordset.length) throw new Error('Word not found or unavailable');

    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText)
      .input('OptionsJson', sql.NVarChar(sql.MAX), normalizedOptionsJson)
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
    const normalizedOptionsJson = JSON.stringify(
      this.parseQuestionOptions(questionType, optionsJson, correctAnswer)
    );
    const word = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT WordID FROM Words
        WHERE WordID = @WordID
          AND (CreatedByUserID = @UserID OR ContentStatus = N'Published')
      `);
    if (!word.recordset.length) throw new Error('Word not found or unavailable');

    const result = await pool.request()
      .input('QuestionID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .input('WordID', sql.BigInt, wordId)
      .input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText)
      .input('OptionsJson', sql.NVarChar(sql.MAX), normalizedOptionsJson)
      .input('CorrectAnswer', sql.NVarChar(500), correctAnswer)
      .input('Explanation', sql.NVarChar(2000), explanation || null)
      .query(`
        UPDATE Questions SET WordID=@WordID, QuestionType=@QuestionType, QuestionText=@QuestionText,
          OptionsJson=@OptionsJson, CorrectAnswer=@CorrectAnswer, Explanation=@Explanation,
          UpdatedAt=SYSDATETIMEOFFSET()
        WHERE QuestionID=@QuestionID AND CreatedByUserID=@UserID
          AND ContentStatus IN (N'Draft', N'Rejected')
      `);
    return result.rowsAffected[0] > 0;
  }

  static async deleteQuestion(id, userId) {
    const pool = await poolPromise;
    const linked = await pool.request()
      .input('QuestionID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT q.QuestionID,
               (SELECT COUNT(*) FROM MiniTestItems mti WHERE mti.QuestionID = q.QuestionID) AS MiniTestCount
        FROM Questions q
        WHERE q.QuestionID = @QuestionID
          AND q.CreatedByUserID = @UserID
          AND q.ContentStatus = N'Draft'
      `);
    if (!linked.recordset.length) return false;
    if (linked.recordset[0].MiniTestCount > 0) {
      throw new Error('Question is used in mini tests');
    }
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
    const search = String(filters.search || '').trim();
    if (search) {
      req.input('Search', sql.NVarChar(250), `%${search}%`);
      where += ' AND (mt.TestTitle LIKE @Search OR mt.Description LIKE @Search)';
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
    if (search) {
      req2.input('Search', sql.NVarChar(250), `%${search}%`);
      where2 += ' AND (mt.TestTitle LIKE @Search OR mt.Description LIKE @Search)';
    }

    const result = await req2.query(`
      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description, mt.TopicID AS topicId,
             t.TopicName AS topicName, mt.TotalQuestions AS totalQuestions,
             mt.IsPublished AS isPublished, mt.ContentStatus AS contentStatus,
             mt.CreatedAt AS createdAt, mt.UpdatedAt AS updatedAt,
             (
               SELECT mti.QuestionID AS id
               FROM MiniTestItems mti
               WHERE mti.MiniTestID = mt.MiniTestID
               ORDER BY mti.DisplayOrder
               FOR JSON PATH
             ) AS questionsJson,
             (
               SELECT TOP 1 crl.Comment
               FROM ContentReviewLogs crl
               WHERE crl.EntityType = N'MiniTest' AND crl.EntityID = mt.MiniTestID AND crl.NewStatus = N'Rejected'
               ORDER BY crl.CreatedAt DESC
             ) AS rejectionReason
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      WHERE ${where2}
      ORDER BY mt.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return {
      data: result.recordset.map((test) => ({
        ...test,
        questionIds: test.questionsJson ? JSON.parse(test.questionsJson).map((question) => question.id) : []
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  static async createMiniTest(data, userId) {
    const { title, description, topicId, questionIds } = data;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const normalizedQuestionIds = await this.validateMiniTestReferences(
        transaction,
        topicId,
        questionIds,
        userId
      );
      const req = new sql.Request(transaction);
      const testResult = await req
        .input('Title', sql.NVarChar(255), title)
        .input('Description', sql.NVarChar(1000), description || null)
        .input('TopicID', sql.BigInt, topicId)
        .input('CreatedByUserID', sql.BigInt, userId)
        .input('TotalQuestions', sql.Int, normalizedQuestionIds.length)
        .query(`
          INSERT INTO MiniTests (TestTitle, Description, TopicID, CreatedByUserID, TotalQuestions,
                                 IsPublished, ContentStatus, CreatedAt, UpdatedAt)
          OUTPUT inserted.MiniTestID AS id
          VALUES (@Title, @Description, @TopicID, @CreatedByUserID, @TotalQuestions,
                  0, 'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      const testId = testResult.recordset[0].id;

      if (normalizedQuestionIds.length) {
        for (let i = 0; i < normalizedQuestionIds.length; i++) {
          const r = new sql.Request(transaction);
          await r.input('MiniTestID', sql.BigInt, testId)
            .input('QuestionID', sql.BigInt, normalizedQuestionIds[i])
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
    const { title, description, topicId, questionIds = [] } = data;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const normalizedQuestionIds = await this.validateMiniTestReferences(
        transaction,
        topicId,
        questionIds,
        userId
      );
      const request = new sql.Request(transaction);
      const result = await request
        .input('MiniTestID', sql.BigInt, id)
        .input('UserID', sql.BigInt, userId)
        .input('Title', sql.NVarChar(255), title)
        .input('Description', sql.NVarChar(1000), description || null)
        .input('TopicID', sql.BigInt, topicId || null)
        .input('TotalQuestions', sql.Int, normalizedQuestionIds.length)
        .query(`
          UPDATE MiniTests SET TestTitle=@Title, Description=@Description, TopicID=@TopicID,
            TotalQuestions=@TotalQuestions, UpdatedAt=SYSDATETIMEOFFSET()
          WHERE MiniTestID=@MiniTestID AND CreatedByUserID=@UserID
            AND ContentStatus IN (N'Draft', N'Rejected')
        `);
      if (!result.rowsAffected[0]) {
        await transaction.rollback();
        return false;
      }

      const clear = new sql.Request(transaction);
      await clear.input('MiniTestID', sql.BigInt, id).query('DELETE FROM MiniTestItems WHERE MiniTestID = @MiniTestID');
      for (let index = 0; index < normalizedQuestionIds.length; index++) {
        const itemRequest = new sql.Request(transaction);
        await itemRequest
          .input('MiniTestID', sql.BigInt, id)
          .input('QuestionID', sql.BigInt, normalizedQuestionIds[index])
          .input('DisplayOrder', sql.Int, index + 1)
          .query(`
            INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
            VALUES (@MiniTestID, @QuestionID, @DisplayOrder)
          `);
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const checkRequest = new sql.Request(transaction);
      const check = await checkRequest
        .input('MiniTestID', sql.BigInt, miniTestId)
        .input('QuestionID', sql.BigInt, questionId)
        .input('UserID', sql.BigInt, userId)
        .query(`
          SELECT mt.MiniTestID,
                 CASE WHEN q.QuestionID IS NULL THEN 0 ELSE 1 END AS QuestionAvailable,
                 CASE WHEN mti.QuestionID IS NULL THEN 0 ELSE 1 END AS AlreadyAdded
          FROM MiniTests mt
          LEFT JOIN Questions q ON q.QuestionID = @QuestionID
            AND q.CreatedByUserID = @UserID
            AND q.ContentStatus = N'Published'
          LEFT JOIN MiniTestItems mti ON mti.MiniTestID = mt.MiniTestID
            AND mti.QuestionID = @QuestionID
          WHERE mt.MiniTestID = @MiniTestID
            AND mt.CreatedByUserID = @UserID
            AND mt.ContentStatus IN (N'Draft', N'Rejected')
        `);
      if (!check.recordset.length) {
        await transaction.rollback();
        return false;
      }
      if (!check.recordset[0].QuestionAvailable) {
        throw new Error('Mini test questions must be owned and published');
      }
      if (check.recordset[0].AlreadyAdded) {
        throw new Error('Question is already in this mini test');
      }

      const insertRequest = new sql.Request(transaction);
      await insertRequest
        .input('MiniTestID', sql.BigInt, miniTestId)
        .input('QuestionID', sql.BigInt, questionId)
        .query(`
          INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
          SELECT @MiniTestID, @QuestionID, ISNULL(MAX(DisplayOrder), 0) + 1
          FROM MiniTestItems
          WHERE MiniTestID = @MiniTestID
        `);

      const updateRequest = new sql.Request(transaction);
      await updateRequest.input('MiniTestID', sql.BigInt, miniTestId)
        .query(`
          UPDATE MiniTests
          SET TotalQuestions = (SELECT COUNT(*) FROM MiniTestItems WHERE MiniTestID = @MiniTestID),
              UpdatedAt = SYSDATETIMEOFFSET()
          WHERE MiniTestID = @MiniTestID
        `);
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async removeMiniTestItem(miniTestId, questionId, userId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const checkRequest = new sql.Request(transaction);
      const check = await checkRequest
        .input('MiniTestID', sql.BigInt, miniTestId)
        .input('UserID', sql.BigInt, userId)
        .query(`
          SELECT MiniTestID FROM MiniTests
          WHERE MiniTestID=@MiniTestID AND CreatedByUserID=@UserID
            AND ContentStatus IN (N'Draft', N'Rejected')
        `);
      if (!check.recordset.length) {
        await transaction.rollback();
        return false;
      }

      const deleteRequest = new sql.Request(transaction);
      await deleteRequest
        .input('MiniTestID', sql.BigInt, miniTestId)
        .input('QuestionID', sql.BigInt, questionId)
        .query('DELETE FROM MiniTestItems WHERE MiniTestID = @MiniTestID AND QuestionID = @QuestionID');

      const updateRequest = new sql.Request(transaction);
      await updateRequest.input('MiniTestID', sql.BigInt, miniTestId)
        .query(`
          UPDATE MiniTests
          SET TotalQuestions = (SELECT COUNT(*) FROM MiniTestItems WHERE MiniTestID = @MiniTestID),
              UpdatedAt = SYSDATETIMEOFFSET()
          WHERE MiniTestID = @MiniTestID
        `);
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getMedia(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        IF OBJECT_ID(N'dbo.MediaAssets', N'U') IS NULL
        BEGIN
          SELECT CAST(NULL AS bigint) AS id WHERE 1 = 0;
          RETURN;
        END

        SELECT MediaAssetID AS id, MediaType AS mediaType, FileUrl AS fileUrl,
               FileName AS fileName, MimeType AS mimeType, FileSizeBytes AS fileSizeBytes,
               AltText AS altText, Transcript AS transcript, CreatedAt AS createdAt
        FROM MediaAssets
        WHERE UploadedByUserID = @UserID
        ORDER BY CreatedAt DESC;
      `);
    return result.recordset;
  }

  static async createMedia(data, userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('MediaType', sql.NVarChar(30), data.mediaType)
      .input('FileUrl', sql.NVarChar(1000), data.fileUrl)
      .input('FileName', sql.NVarChar(255), data.fileName || null)
      .input('MimeType', sql.NVarChar(100), data.mimeType || null)
      .input('FileSizeBytes', sql.BigInt, data.fileSizeBytes ?? null)
      .input('AltText', sql.NVarChar(500), data.altText || null)
      .input('Transcript', sql.NVarChar(2000), data.transcript || null)
      .query(`
        IF OBJECT_ID(N'dbo.MediaAssets', N'U') IS NULL
          THROW 50030, 'MediaAssets table is missing', 1;

        INSERT INTO MediaAssets (
          UploadedByUserID, MediaType, FileUrl, FileName, MimeType,
          FileSizeBytes, AltText, Transcript, CreatedAt
        )
        OUTPUT inserted.MediaAssetID AS id
        VALUES (
          @UserID, @MediaType, @FileUrl, @FileName, @MimeType,
          @FileSizeBytes, @AltText, @Transcript, SYSDATETIMEOFFSET()
        );
      `);
    return result.recordset[0];
  }

  static async deleteMedia(id, userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MediaAssetID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`
        IF EXISTS (SELECT 1 FROM ContentMediaLinks WHERE MediaAssetID = @MediaAssetID)
          THROW 50031, 'Media asset is currently linked to content', 1;

        DELETE FROM MediaAssets
        WHERE MediaAssetID = @MediaAssetID AND UploadedByUserID = @UserID;
      `);
    return result.rowsAffected[0] > 0;
  }

  static async submitQuestionForReview(id, userId) {
    const pool = await poolPromise;
    const dependency = await pool.request()
      .input('QuestionID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT q.QuestionID, w.ContentStatus AS WordStatus
        FROM Questions q
        JOIN Words w ON w.WordID = q.WordID
        WHERE q.QuestionID = @QuestionID AND q.CreatedByUserID = @UserID
          AND q.ContentStatus IN (N'Draft', N'Rejected')
      `);
    if (!dependency.recordset.length) return false;
    if (dependency.recordset[0].WordStatus !== 'Published') {
      throw new Error('Question word must be published before review');
    }
    return this.submitForReview('Questions', 'QuestionID', id, userId);
  }

  static async submitWordForReview(id, userId) {
    const pool = await poolPromise;
    const dependency = await pool.request()
      .input('WordID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT w.WordID,
               SUM(CASE WHEN t.ContentStatus <> N'Published' THEN 1 ELSE 0 END) AS UnpublishedTopics
        FROM Words w
        LEFT JOIN WordTopics wt ON wt.WordID = w.WordID
        LEFT JOIN Topics t ON t.TopicID = wt.TopicID
        WHERE w.WordID = @WordID AND w.CreatedByUserID = @UserID
          AND w.ContentStatus IN (N'Draft', N'Rejected')
        GROUP BY w.WordID
      `);
    if (!dependency.recordset.length) return false;
    if ((dependency.recordset[0].UnpublishedTopics || 0) > 0) {
      throw new Error('Word topics must be published before review');
    }
    return this.submitForReview('Words', 'WordID', id, userId);
  }

  static async submitMiniTestForReview(id, userId) {
    const pool = await poolPromise;
    const check = await pool.request()
      .input('MiniTestID', sql.BigInt, id)
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT mt.MiniTestID,
               COUNT(mti.QuestionID) AS total,
               SUM(CASE WHEN q.QuestionID IS NOT NULL AND q.ContentStatus <> N'Published' THEN 1 ELSE 0 END) AS unpublished,
               MAX(CASE WHEN mt.TopicID IS NOT NULL AND t.ContentStatus <> N'Published' THEN 1 ELSE 0 END) AS topicUnpublished
        FROM MiniTests mt
        LEFT JOIN MiniTestItems mti ON mti.MiniTestID = mt.MiniTestID
        LEFT JOIN Questions q ON mti.QuestionID = q.QuestionID
        LEFT JOIN Topics t ON t.TopicID = mt.TopicID
        WHERE mt.MiniTestID = @MiniTestID
          AND mt.CreatedByUserID = @UserID
          AND mt.ContentStatus IN (N'Draft', N'Rejected')
        GROUP BY mt.MiniTestID
      `);
    if (!check.recordset.length) return false;
    if (!check.recordset[0].total) {
      throw new Error('Bài test phải có ít nhất một câu hỏi trước khi gửi duyệt');
    }
    if (check.recordset[0].unpublished > 0) {
      throw new Error('Tất cả câu hỏi trong bài test phải được Published trước khi gửi duyệt');
    }
    if (check.recordset[0].topicUnpublished > 0) {
      throw new Error('Chủ đề của bài test phải được Published trước khi gửi duyệt');
    }
    return this.submitForReview('MiniTests', 'MiniTestID', id, userId);
  }
}

module.exports = CreatorService;
