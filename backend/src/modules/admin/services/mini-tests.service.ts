import type { MiniTestFilters, MiniTestPayload } from '../admin.types.ts';
const { AdminShared, poolPromise, sql } = require('../shared/admin.shared.ts');

class MiniTestService extends AdminShared {
  static async getMiniTests(page = 1, limit = 20, filters: MiniTestFilters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const search = String(filters.search ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const topicId = Number(filters.topicId) || null;
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(mt.TestTitle LIKE @Search OR mt.Description LIKE @Search OR t.TopicName LIKE @Search)');
    }

    if (status) {
      request.input('ContentStatus', sql.NVarChar(30), status);
      conditions.push('mt.ContentStatus = @ContentStatus');
    }

    if (topicId) {
      request.input('TopicID', sql.BigInt, topicId);
      conditions.push('mt.TopicID = @TopicID');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      ${whereClause};

      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description, 
             mt.TopicID AS topicId, t.TopicName AS topicName, mt.TotalQuestions AS totalQuestions,
             mt.IsPublished AS isPublished, mt.ContentStatus AS status, mt.UpdatedAt AS updatedAt,
             (
               SELECT mti.QuestionID AS id
               FROM MiniTestItems mti
               WHERE mti.MiniTestID = mt.MiniTestID
               ORDER BY mti.DisplayOrder
               FOR JSON PATH
             ) AS questionsJson
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      ${whereClause}
      ORDER BY mt.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    const items = result.recordsets[1].map((test) => ({
      ...test,
      questionIds: test.questionsJson ? JSON.parse(test.questionsJson).map((item) => item.id) : []
    }));
    return this.paginate(items, result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async createMiniTest(testData: MiniTestPayload, adminId) {
    const { title, description, topicId, questionIds } = testData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      
      const testResult = await request
        .input('Title', sql.NVarChar(255), title)
        .input('Description', sql.NVarChar(1000), description)
        .input('TopicID', sql.BigInt, topicId)
        .input('CreatedByUserID', sql.BigInt, adminId)
        .input('TotalQuestions', sql.Int, questionIds.length)
        .query(`
          INSERT INTO MiniTests (TestTitle, Description, TopicID, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt)
          OUTPUT inserted.MiniTestID AS id
          VALUES (@Title, @Description, @TopicID, @CreatedByUserID, @TotalQuestions, 0, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      
      const testId = testResult.recordset[0].id;

      for (let i = 0; i < questionIds.length; i++) {
        const itemReq = new sql.Request(transaction);
        await itemReq
          .input('MiniTestID', sql.BigInt, testId)
          .input('QuestionID', sql.BigInt, questionIds[i])
          .input('DisplayOrder', sql.Int, i + 1)
          .query(`
            INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
            VALUES (@MiniTestID, @QuestionID, @DisplayOrder)
          `);
      }

      await transaction.commit();
      await this.logAdminAction(adminId, 'CREATE_MINI_TEST', 'MiniTest', testId, { title, topicId, questionCount: questionIds.length });
      return { id: testId, title };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateMiniTest(testId, testData: MiniTestPayload, adminId) {
    const { title, description, topicId, questionIds } = testData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const updateReq = new sql.Request(transaction);
      const result = await updateReq
        .input('MiniTestID', sql.BigInt, testId)
        .input('Title', sql.NVarChar(255), title)
        .input('Description', sql.NVarChar(1000), description || null)
        .input('TopicID', sql.BigInt, topicId || null)
        .input('TotalQuestions', sql.Int, questionIds.length)
        .query(`
          UPDATE MiniTests
          SET TestTitle = @Title,
              Description = @Description,
              TopicID = @TopicID,
              TotalQuestions = @TotalQuestions,
              UpdatedAt = SYSDATETIMEOFFSET()
          WHERE MiniTestID = @MiniTestID
        `);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }

      const deleteReq = new sql.Request(transaction);
      await deleteReq
        .input('MiniTestID', sql.BigInt, testId)
        .query('DELETE FROM MiniTestItems WHERE MiniTestID = @MiniTestID');

      for (let i = 0; i < questionIds.length; i++) {
        const itemReq = new sql.Request(transaction);
        await itemReq
          .input('MiniTestID', sql.BigInt, testId)
          .input('QuestionID', sql.BigInt, questionIds[i])
          .input('DisplayOrder', sql.Int, i + 1)
          .query(`
            INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
            VALUES (@MiniTestID, @QuestionID, @DisplayOrder)
          `);
      }

      await transaction.commit();
      await this.logAdminAction(adminId, 'UPDATE_MINI_TEST', 'MiniTest', testId, { title, topicId, questionCount: questionIds.length });
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteMiniTest(testId, adminId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      const result = await request
        .input('MiniTestID', sql.BigInt, testId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM MiniTests WHERE MiniTestID = @MiniTestID)
          BEGIN
            SELECT CAST(0 AS INT) AS deleted;
            RETURN;
          END

          IF OBJECT_ID(N'dbo.MiniTestAttempts', N'U') IS NOT NULL
            DELETE FROM MiniTestAttempts WHERE MiniTestID = @MiniTestID;

          DELETE FROM MiniTestItems WHERE MiniTestID = @MiniTestID;
          DELETE FROM MiniTests WHERE MiniTestID = @MiniTestID;
          SELECT CAST(1 AS INT) AS deleted;
        `);

      await transaction.commit();
      const success = result.recordset[0]?.deleted > 0;
      if (success) {
        await this.logAdminAction(adminId, 'DELETE_MINI_TEST', 'MiniTest', testId);
      }
      return success;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async setMiniTestStatus(testId, status, adminId, comment = null) {
    this.assertContentStatus(status);
    const pool = await poolPromise;
    const oldStatusResult = await pool.request()
      .input('MiniTestID', sql.BigInt, testId)
      .query('SELECT ContentStatus FROM MiniTests WHERE MiniTestID = @MiniTestID');

    if (oldStatusResult.recordset.length === 0) return false;
    const oldStatus = oldStatusResult.recordset[0].ContentStatus;

    const result = await pool.request()
      .input('MiniTestID', sql.BigInt, testId)
      .input('ContentStatus', sql.NVarChar(30), status)
      .input('ReviewedByUserID', sql.BigInt, adminId)
      .query(`
        UPDATE MiniTests
        SET ContentStatus = @ContentStatus,
            IsPublished = CASE WHEN @ContentStatus = N'Published' THEN 1 ELSE 0 END,
            ReviewedByUserID = @ReviewedByUserID,
            ReviewedAt = SYSDATETIMEOFFSET(),
            PublishedAt = CASE WHEN @ContentStatus = N'Published' THEN SYSDATETIMEOFFSET() ELSE PublishedAt END,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE MiniTestID = @MiniTestID
      `);

    if (result.rowsAffected[0] > 0) {
      await this.logContentReview('MiniTest', testId, oldStatus, status, adminId, comment);
      await this.logAdminAction(adminId, 'UPDATE_MINI_TEST_STATUS', 'MiniTest', testId, { oldStatus, status, comment });
    }
    return result.rowsAffected[0] > 0;
  }
}

module.exports = MiniTestService;
