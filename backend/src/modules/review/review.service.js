const { poolPromise, sql } = require('../../config/db');

const ENTITY_MAP = {
  topic: { type: 'Topic', table: 'Topics', idCol: 'TopicID' },
  word: { type: 'Word', table: 'Words', idCol: 'WordID' },
  question: { type: 'Question', table: 'Questions', idCol: 'QuestionID' },
  minitest: { type: 'MiniTest', table: 'MiniTests', idCol: 'MiniTestID' },
};

function resolveEntity(entityType) {
  const e = ENTITY_MAP[String(entityType || '').toLowerCase()];
  if (!e) throw new Error('EntityType không hợp lệ');
  return e;
}

class ReviewService {
  static async getPendingContent() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 'Topic' AS entityType, TopicID AS entityId, TopicName AS title, ContentStatus AS status, CreatedByUserID AS creatorId, u.FullName AS creatorName, t.CreatedAt AS createdAt
      FROM Topics t JOIN Users u ON t.CreatedByUserID = u.UserID WHERE t.ContentStatus = 'PendingReview'
      UNION ALL SELECT 'Word', WordID, Term, ContentStatus, CreatedByUserID, u.FullName, w.CreatedAt FROM Words w JOIN Users u ON w.CreatedByUserID = u.UserID WHERE w.ContentStatus = 'PendingReview'
      UNION ALL SELECT 'Question', QuestionID, QuestionText, ContentStatus, CreatedByUserID, u.FullName, q.CreatedAt FROM Questions q JOIN Users u ON q.CreatedByUserID = u.UserID WHERE q.ContentStatus = 'PendingReview'
      UNION ALL SELECT 'MiniTest', MiniTestID, TestTitle, ContentStatus, CreatedByUserID, u.FullName, mt.CreatedAt FROM MiniTests mt JOIN Users u ON mt.CreatedByUserID = u.UserID WHERE mt.ContentStatus = 'PendingReview'
      ORDER BY createdAt ASC`);
    return result.recordset;
  }

  static async approve(entityType, entityId, adminId) {
    const e = resolveEntity(entityType);
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const upd = await new sql.Request(transaction).input('ID', sql.BigInt, entityId).query(`UPDATE ${e.table} SET ContentStatus = 'Published', UpdatedAt = SYSDATETIMEOFFSET(), ReviewedByUserID = ${adminId}, ReviewedAt = SYSDATETIMEOFFSET(), PublishedAt = SYSDATETIMEOFFSET() WHERE ${e.idCol} = @ID AND ContentStatus = 'PendingReview'`);
      if (upd.rowsAffected[0] === 0) { await transaction.rollback(); return false; }
      if (e.type === 'MiniTest') await new sql.Request(transaction).input('ID', sql.BigInt, entityId).query('UPDATE MiniTests SET IsPublished = 1 WHERE MiniTestID = @ID');
      await new sql.Request(transaction).input('EntityType', sql.NVarChar(30), e.type).input('EntityID', sql.BigInt, entityId).input('AdminID', sql.BigInt, adminId).query(`INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment, CreatedAt) VALUES (@EntityType, @EntityID, @AdminID, 'PendingReview', 'Published', 'Approved by admin', SYSDATETIMEOFFSET())`);
      // Notify creator
      const creatorResult = await new sql.Request(transaction).input('EntityID', sql.BigInt, entityId).query(`SELECT CreatedByUserID ${e.type === 'Topic' ? ', TopicName AS title' : e.type === 'Word' ? ', Term AS title' : e.type === 'MiniTest' ? ', TestTitle AS title' : ', QuestionText AS title'} FROM ${e.table} WHERE ${e.idCol} = @EntityID`);
      if (creatorResult.recordset.length > 0) {
        const { CreatedByUserID, title } = creatorResult.recordset[0];
        await new sql.Request(transaction).input('UserID', sql.BigInt, CreatedByUserID).input('Title', sql.NVarChar(200), `${e.type} "${String(title).substring(0, 50)}" đã được duyệt`).query(`INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel) VALUES (@UserID, @Title, N'Nội dung của bạn đã được admin phê duyệt.', 'Announcement', 'InApp')`);
      }
      await transaction.commit();
      return true;
    } catch (err) { await transaction.rollback(); throw err; }
  }

  static async reject(entityType, entityId, adminId, reason) {
    const e = resolveEntity(entityType);
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const upd = await new sql.Request(transaction).input('ID', sql.BigInt, entityId).query(`UPDATE ${e.table} SET ContentStatus = 'Rejected', UpdatedAt = SYSDATETIMEOFFSET(), ReviewedByUserID = ${adminId}, ReviewedAt = SYSDATETIMEOFFSET() WHERE ${e.idCol} = @ID AND ContentStatus = 'PendingReview'`);
      if (upd.rowsAffected[0] === 0) { await transaction.rollback(); return false; }
      await new sql.Request(transaction).input('EntityType', sql.NVarChar(30), e.type).input('EntityID', sql.BigInt, entityId).input('AdminID', sql.BigInt, adminId).input('Comment', sql.NVarChar(2000), reason || null).query(`INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment, CreatedAt) VALUES (@EntityType, @EntityID, @AdminID, 'PendingReview', 'Rejected', @Comment, SYSDATETIMEOFFSET())`);
      const creatorResult = await new sql.Request(transaction).input('EntityID', sql.BigInt, entityId).query(`SELECT CreatedByUserID FROM ${e.table} WHERE ${e.idCol} = @EntityID`);
      if (creatorResult.recordset.length > 0) {
        const { CreatedByUserID } = creatorResult.recordset[0];
        const msg = `Nội dung của bạn đã bị từ chối.${reason ? ' Lý do: ' + reason : ''}`;
        await new sql.Request(transaction).input('UserID', sql.BigInt, CreatedByUserID).input('Title', sql.NVarChar(200), `Nội dung bị từ chối`).input('Msg', sql.NVarChar(500), msg).query(`INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel) VALUES (@UserID, @Title, @Msg, 'Announcement', 'InApp')`);
      }
      await transaction.commit();
      return true;
    } catch (err) { await transaction.rollback(); throw err; }
  }

  static async archive(entityType, entityId, adminId) {
    const e = resolveEntity(entityType);
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const upd = await new sql.Request(transaction).input('ID', sql.BigInt, entityId).query(`UPDATE ${e.table} SET ContentStatus = 'Archived', UpdatedAt = SYSDATETIMEOFFSET() WHERE ${e.idCol} = @ID`);
      if (upd.rowsAffected[0] === 0) { await transaction.rollback(); return false; }
      await new sql.Request(transaction).input('EntityType', sql.NVarChar(30), e.type).input('EntityID', sql.BigInt, entityId).input('AdminID', sql.BigInt, adminId).query(`INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, NewStatus, Comment, CreatedAt) VALUES (@EntityType, @EntityID, @AdminID, 'Archived', 'Archived by admin', SYSDATETIMEOFFSET())`);
      await transaction.commit();
      return true;
    } catch (err) { await transaction.rollback(); throw err; }
  }

  static async getReviewLogs(entityType, entityId) {
    const e = resolveEntity(entityType);
    const pool = await poolPromise;
    const result = await pool.request().input('EntityType', sql.NVarChar(30), e.type).input('EntityID', sql.BigInt, entityId)
      .query(`SELECT crl.ContentReviewLogID AS id, crl.OldStatus AS oldStatus, crl.NewStatus AS newStatus, crl.Comment AS comment, crl.CreatedAt AS createdAt, u.FullName AS actionByName FROM ContentReviewLogs crl JOIN Users u ON crl.ActionByUserID = u.UserID WHERE crl.EntityType = @EntityType AND crl.EntityID = @EntityID ORDER BY crl.CreatedAt DESC`);
    return result.recordset;
  }
}

module.exports = ReviewService;