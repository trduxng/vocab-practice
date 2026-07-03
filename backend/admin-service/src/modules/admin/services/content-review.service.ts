import { poolPromise, sql } from '../../../config/db.ts';

class ReviewService {
  /**
   * Lấy danh sách nội dung PendingReview (tất cả entity types)
   */
  static async getPendingContent() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 'Topic' AS entityType, TopicID AS entityId, TopicName AS title,
             ContentStatus AS status, CreatedByUserID AS creatorId, u.FullName AS creatorName,
             t.CreatedAt AS createdAt
      FROM Topics t JOIN Users u ON t.CreatedByUserID = u.UserID
      WHERE t.ContentStatus = 'PendingReview'
      UNION ALL
      SELECT 'Word', WordID, Term, ContentStatus, CreatedByUserID, u.FullName, w.CreatedAt
      FROM Words w JOIN Users u ON w.CreatedByUserID = u.UserID
      WHERE w.ContentStatus = 'PendingReview'
      UNION ALL
      SELECT 'Question', QuestionID, QuestionText, ContentStatus, CreatedByUserID, u.FullName, q.CreatedAt
      FROM Questions q JOIN Users u ON q.CreatedByUserID = u.UserID
      WHERE q.ContentStatus = 'PendingReview'
      UNION ALL
      SELECT 'MiniTest', MiniTestID, TestTitle, ContentStatus, CreatedByUserID, u.FullName, mt.CreatedAt
      FROM MiniTests mt JOIN Users u ON mt.CreatedByUserID = u.UserID
      WHERE mt.ContentStatus = 'PendingReview'
      ORDER BY createdAt ASC
    `);
    return result.recordset;
  }

  /**
   * Map entityType → table metadata
   */
  static _resolveEntity(entityType) {
    const input = String(entityType || '').toLowerCase();
    const map = {
      topic: { type: 'Topic', table: 'Topics', idCol: 'TopicID', publishedAtCol: 'PublishedAt', reviewedByCol: 'ReviewedByUserID', reviewedAtCol: 'ReviewedAt' },
      word: { type: 'Word', table: 'Words', idCol: 'WordID', publishedAtCol: 'PublishedAt', reviewedByCol: 'ReviewedByUserID', reviewedAtCol: 'ReviewedAt' },
      question: { type: 'Question', table: 'Questions', idCol: 'QuestionID', publishedAtCol: 'PublishedAt', reviewedByCol: 'ReviewedByUserID', reviewedAtCol: 'ReviewedAt' },
      minitest: { type: 'MiniTest', table: 'MiniTests', idCol: 'MiniTestID', publishedAtCol: 'PublishedAt', reviewedByCol: 'ReviewedByUserID', reviewedAtCol: 'ReviewedAt' },
    };
    const entity = map[input];
    if (!entity) throw new Error('EntityType không hợp lệ');
    return entity;
  }

  /**
   * Approve: PendingReview → Published
   */
  static async approve(entityType, entityId, adminId) {
    const e = this._resolveEntity(entityType);
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      let extraSet = '';
      if (e.publishedAtCol) extraSet += `, ${e.publishedAtCol} = SYSDATETIMEOFFSET()`;
      if (e.reviewedByCol) extraSet += `, ${e.reviewedByCol} = @AdminID`;
      if (e.reviewedAtCol) extraSet += `, ${e.reviewedAtCol} = SYSDATETIMEOFFSET()`;

      const req1 = new sql.Request(transaction);
      const upd = await req1
        .input('ID', sql.BigInt, entityId)
        .input('AdminID', sql.BigInt, adminId)
        .query(`
          UPDATE ${e.table}
          SET ContentStatus = 'Published', UpdatedAt = SYSDATETIMEOFFSET() ${extraSet}
          WHERE ${e.idCol} = @ID AND ContentStatus = 'PendingReview'
        `);

      if (upd.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }

      // If MiniTest, also set IsPublished = 1
      if (e.type === 'MiniTest') {
        const req1b = new sql.Request(transaction);
        await req1b.input('ID', sql.BigInt, entityId)
          .query(`UPDATE MiniTests SET IsPublished = 1 WHERE MiniTestID = @ID`);
      }

      const req2 = new sql.Request(transaction);
      await req2
        .input('EntityType', sql.NVarChar(30), e.type)
        .input('EntityID', sql.BigInt, entityId)
        .input('AdminID', sql.BigInt, adminId)
        .query(`
          INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment, CreatedAt)
          VALUES (@EntityType, @EntityID, @AdminID, 'PendingReview', 'Published', 'Approved by admin', SYSDATETIMEOFFSET())
        `);

      // Gửi notification cho Creator
      let creatorId = null;
      let title = '';
      const req3 = new sql.Request(transaction).input('EntityID', sql.BigInt, entityId);

      if (e.type === 'Topic') {
        const creatorResult = await req3.query(`SELECT CreatedByUserID, TopicName FROM Topics WHERE TopicID = @EntityID`);
        if (creatorResult.recordset.length > 0) {
          creatorId = creatorResult.recordset[0].CreatedByUserID;
          title = `Topic "${creatorResult.recordset[0].TopicName}" đã được duyệt`;
        }
      } else if (e.type === 'Word') {
        const creatorResult = await req3.query(`SELECT CreatedByUserID, Term FROM Words WHERE WordID = @EntityID`);
        if (creatorResult.recordset.length > 0) {
          creatorId = creatorResult.recordset[0].CreatedByUserID;
          title = `Từ "${creatorResult.recordset[0].Term}" đã được duyệt`;
        }
      } else if (e.type === 'Question') {
        const creatorResult = await req3.query(`SELECT CreatedByUserID, QuestionText FROM Questions WHERE QuestionID = @EntityID`);
        if (creatorResult.recordset.length > 0) {
          creatorId = creatorResult.recordset[0].CreatedByUserID;
          title = `Câu hỏi "${creatorResult.recordset[0].QuestionText.substring(0, 50)}" đã được duyệt`;
        }
      } else if (e.type === 'MiniTest') {
        const creatorResult = await req3.query(`SELECT CreatedByUserID, TestTitle FROM MiniTests WHERE MiniTestID = @EntityID`);
        if (creatorResult.recordset.length > 0) {
          creatorId = creatorResult.recordset[0].CreatedByUserID;
          title = `Bài test "${creatorResult.recordset[0].TestTitle}" đã được duyệt`;
        }
      }

      if (creatorId) {
        await new sql.Request(transaction)
          .input('UserID', sql.BigInt, creatorId)
          .input('Title', sql.NVarChar(200), title)
          .query(`
            INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel)
            VALUES (@UserID, @Title, N'Nội dung của bạn đã được admin phê duyệt và xuất bản.', 'Announcement', 'InApp')
          `);
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Reject: PendingReview → Rejected (with reason)
   */
  static async reject(entityType, entityId, adminId, reason) {
    const e = this._resolveEntity(entityType);
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      let extraSet = '';
      if (e.reviewedByCol) extraSet += `, ${e.reviewedByCol} = @AdminID`;
      if (e.reviewedAtCol) extraSet += `, ${e.reviewedAtCol} = SYSDATETIMEOFFSET()`;

      const req1 = new sql.Request(transaction);
      const upd = await req1
        .input('ID', sql.BigInt, entityId)
        .input('AdminID', sql.BigInt, adminId)
        .query(`
          UPDATE ${e.table}
          SET ContentStatus = 'Rejected', UpdatedAt = SYSDATETIMEOFFSET() ${extraSet}
          WHERE ${e.idCol} = @ID AND ContentStatus = 'PendingReview'
        `);

      if (upd.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }

      const req2 = new sql.Request(transaction);
      await req2
        .input('EntityType', sql.NVarChar(30), e.type)
        .input('EntityID', sql.BigInt, entityId)
        .input('AdminID', sql.BigInt, adminId)
        .input('Comment', sql.NVarChar(2000), reason || null)
        .query(`
          INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment, CreatedAt)
          VALUES (@EntityType, @EntityID, @AdminID, 'PendingReview', 'Rejected', @Comment, SYSDATETIMEOFFSET())
        `);

      // Gửi notification cho Creator
      let creatorId = null;
      let title = '';
      const req3 = new sql.Request(transaction).input('EntityID', sql.BigInt, entityId);

      if (e.type === 'Topic') {
        const creatorResult = await req3.query(`SELECT CreatedByUserID, TopicName FROM Topics WHERE TopicID = @EntityID`);
        if (creatorResult.recordset.length > 0) {
          creatorId = creatorResult.recordset[0].CreatedByUserID;
          title = `Topic "${creatorResult.recordset[0].TopicName}" bị từ chối`;
        }
      } else if (e.type === 'Word') {
        const creatorResult = await req3.query(`SELECT CreatedByUserID, Term FROM Words WHERE WordID = @EntityID`);
        if (creatorResult.recordset.length > 0) {
          creatorId = creatorResult.recordset[0].CreatedByUserID;
          title = `Từ "${creatorResult.recordset[0].Term}" bị từ chối`;
        }
      } else if (e.type === 'Question') {
        const creatorResult = await req3.query(`SELECT CreatedByUserID, QuestionText FROM Questions WHERE QuestionID = @EntityID`);
        if (creatorResult.recordset.length > 0) {
          creatorId = creatorResult.recordset[0].CreatedByUserID;
          title = `Câu hỏi bị từ chối`;
        }
      } else if (e.type === 'MiniTest') {
        const creatorResult = await req3.query(`SELECT CreatedByUserID, TestTitle FROM MiniTests WHERE MiniTestID = @EntityID`);
        if (creatorResult.recordset.length > 0) {
          creatorId = creatorResult.recordset[0].CreatedByUserID;
          title = `Bài test "${creatorResult.recordset[0].TestTitle}" bị từ chối`;
        }
      }

      if (creatorId) {
        let msg = 'Nội dung của bạn đã bị từ chối.';
        if (reason) {
          msg += ' Lý do: ' + reason;
        }

        await new sql.Request(transaction)
          .input('UserID', sql.BigInt, creatorId)
          .input('Title', sql.NVarChar(200), title)
          .input('Msg', sql.NVarChar(500), msg)
          .query(`
            INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel)
            VALUES (@UserID, @Title, @Msg, 'Announcement', 'InApp')
          `);
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Archive: current status -> Archived
   */
  static async archive(entityType, entityId, adminId) {
    const e = this._resolveEntity(entityType);
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      const req1 = new sql.Request(transaction);
      const upd = await req1
        .input('ID', sql.BigInt, entityId)
        .query(`
          UPDATE ${e.table}
          SET ContentStatus = 'Archived', UpdatedAt = SYSDATETIMEOFFSET()
          WHERE ${e.idCol} = @ID
        `);

      if (upd.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }

      const req2 = new sql.Request(transaction);
      await req2
        .input('EntityType', sql.NVarChar(30), e.type)
        .input('EntityID', sql.BigInt, entityId)
        .input('AdminID', sql.BigInt, adminId)
        .query(`
          INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, NewStatus, Comment, CreatedAt)
          VALUES (@EntityType, @EntityID, @AdminID, 'Archived', 'Archived by admin', SYSDATETIMEOFFSET())
        `);

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Lấy lịch sử review log cho một entity
   */
  static async getReviewLogs(entityType, entityId) {
    const e = this._resolveEntity(entityType);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('EntityType', sql.NVarChar(30), e.type)
      .input('EntityID', sql.BigInt, entityId)
      .query(`
        SELECT crl.ContentReviewLogID AS id, crl.OldStatus AS oldStatus,
               crl.NewStatus AS newStatus, crl.Comment AS comment,
               crl.CreatedAt AS createdAt, u.FullName AS actionByName
        FROM ContentReviewLogs crl
        JOIN Users u ON crl.ActionByUserID = u.UserID
        WHERE crl.EntityType = @EntityType AND crl.EntityID = @EntityID
        ORDER BY crl.CreatedAt DESC
      `);
    return result.recordset;
  }
}

export default ReviewService;
