const { poolPromise, sql } = require('../config/db');

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
      const req3 = new sql.Request(transaction);
      const creatorResult = await req3
        .input('EntityID', sql.BigInt, entityId)
        .query(`
          DECLARE @CreatorID BIGINT;
          DECLARE @Title NVARCHAR(200);
          DECLARE @EntityName NVARCHAR(200);

          IF '${e.type}' = 'Topic'
          BEGIN
            SELECT @CreatorID = CreatedByUserID, @EntityName = TopicName
            FROM Topics WHERE ${e.idCol} = @EntityID;
            SET @Title = N'Topic "' + @EntityName + N'" đã được duyệt';
          END
          ELSE IF '${e.type}' = 'Word'
          BEGIN
            SELECT @CreatorID = CreatedByUserID, @EntityName = Term
            FROM Words WHERE ${e.idCol} = @EntityID;
            SET @Title = N'Từ "' + @EntityName + N'" đã được duyệt';
          END
          ELSE IF '${e.type}' = 'Question'
          BEGIN
            SELECT @CreatorID = CreatedByUserID, @EntityName = QuestionText
            FROM Questions WHERE ${e.idCol} = @EntityID;
            SET @Title = N'Câu hỏi "' + LEFT(@EntityName, 50) + N'" đã được duyệt';
          END
          ELSE IF '${e.type}' = 'MiniTest'
          BEGIN
            SELECT @CreatorID = CreatedByUserID, @EntityName = TestTitle
            FROM MiniTests WHERE ${e.idCol} = @EntityID;
            SET @Title = N'Bài test "' + @EntityName + N'" đã được duyệt';
          END

          IF @CreatorID IS NOT NULL
          BEGIN
            INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel)
            VALUES (@CreatorID, @Title, N'Nội dung của bạn đã được admin phê duyệt và xuất bản.', 'Announcement', 'InApp');
          END
        `);

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
      const req3 = new sql.Request(transaction);
      await req3
        .input('EntityID', sql.BigInt, entityId)
        .input('RejectReason', sql.NVarChar(2000), reason || null)
        .query(`
          DECLARE @CreatorID BIGINT;
          DECLARE @Title NVARCHAR(200);
          DECLARE @EntityName NVARCHAR(200);
          DECLARE @Msg NVARCHAR(500);

          IF '${e.type}' = 'Topic'
          BEGIN
            SELECT @CreatorID = CreatedByUserID, @EntityName = TopicName
            FROM Topics WHERE ${e.idCol} = @EntityID;
            SET @Title = N'Topic "' + @EntityName + N'" bị từ chối';
          END
          ELSE IF '${e.type}' = 'Word'
          BEGIN
            SELECT @CreatorID = CreatedByUserID, @EntityName = Term
            FROM Words WHERE ${e.idCol} = @EntityID;
            SET @Title = N'Từ "' + @EntityName + N'" bị từ chối';
          END
          ELSE IF '${e.type}' = 'Question'
          BEGIN
            SELECT @CreatorID = CreatedByUserID, @EntityName = QuestionText
            FROM Questions WHERE ${e.idCol} = @EntityID;
            SET @Title = N'Câu hỏi bị từ chối';
          END
          ELSE IF '${e.type}' = 'MiniTest'
          BEGIN
            SELECT @CreatorID = CreatedByUserID, @EntityName = TestTitle
            FROM MiniTests WHERE ${e.idCol} = @EntityID;
            SET @Title = N'Bài test "' + @EntityName + N'" bị từ chối';
          END

          SET @Msg = N'Nội dung của bạn đã bị từ chối.';
          IF @RejectReason IS NOT NULL
            SET @Msg = @Msg + N' Lý do: ' + @RejectReason;

          IF @CreatorID IS NOT NULL
          BEGIN
            INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel)
            VALUES (@CreatorID, @Title, @Msg, 'Announcement', 'InApp');
          END
        `);

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Archive: any status → Archived
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

module.exports = ReviewService;
