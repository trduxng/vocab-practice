const { poolPromise, sql } = require('../config/db');

class CreatorService {
  // ── Dashboard & Analytics ──
  static async getDashboardStats(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT * FROM vw_ContentCreatorContentSummary WHERE UserID = @UserID;
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
    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 't.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND t.ContentStatus = @Status';
    }
    const result = await req.query(`
      SELECT t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code,
             t.Description AS description, t.ContentStatus AS contentStatus,
             tc.CategoryName AS categoryName, t.TopicCategoryID AS categoryId,
             t.CreatedAt AS createdAt
      FROM Topics t
      LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID
      WHERE ${where}
      ORDER BY t.CreatedAt DESC
    `);
    return result.recordset;
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
    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'w.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND w.ContentStatus = @Status';
    }
    const result = await req.query(`
      SELECT w.WordID AS id, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic,
             w.PartOfSpeechID AS partOfSpeechId, p.PartOfSpeechName AS partOfSpeechName,
             w.ContentStatus AS contentStatus, w.CreatedAt AS createdAt
      FROM Words w
      LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      WHERE ${where}
      ORDER BY w.CreatedAt DESC
    `);
    return result.recordset;
  }

  static async createWord(data, userId) {
    const { term, meaning, phonetic, partOfSpeechId, topicIds, examples } = data;
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
    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'q.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND q.ContentStatus = @Status';
    }
    const result = await req.query(`
      SELECT q.QuestionID AS id, q.WordID AS wordId, w.Term AS wordTerm,
             q.QuestionType AS questionType, q.QuestionText AS questionText,
             q.OptionsJson AS optionsJson, q.CorrectAnswer AS correctAnswer,
             q.Explanation AS explanation, q.ContentStatus AS contentStatus,
             q.CreatedAt AS createdAt
      FROM Questions q
      LEFT JOIN Words w ON q.WordID = w.WordID
      WHERE ${where}
      ORDER BY q.CreatedAt DESC
    `);
    return result.recordset;
  }

  static async createQuestion(data, userId) {
    const { wordId, questionType, questionText, optionsJson, correctAnswer, explanation } = data;
    const pool = await poolPromise;
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
    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'mt.CreatedByUserID = @UserID';
    if (filters.status) {
      req.input('Status', sql.NVarChar(20), filters.status);
      where += ' AND mt.ContentStatus = @Status';
    }
    const result = await req.query(`
      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description,
             t.TopicName AS topicName, mt.TotalQuestions AS totalQuestions,
             mt.IsPublished AS isPublished, mt.ContentStatus AS contentStatus,
             mt.CreatedAt AS createdAt
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      WHERE ${where}
      ORDER BY mt.CreatedAt DESC
    `);
    return result.recordset;
  }

  static async createMiniTest(data, userId) {
    const { title, description, topicId, questionIds } = data;
    const pool = await poolPromise;
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
    const pool = await poolPromise;
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
    return this.submitForReview('MiniTests', 'MiniTestID', id, userId);
  }
}

module.exports = CreatorService;
