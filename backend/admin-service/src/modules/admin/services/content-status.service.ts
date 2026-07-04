import type { ContentStatusPayload } from '../admin.types.ts';
import { AdminShared, poolPromise, sql } from '../shared/admin.shared.ts';

type ContentStatusTarget = {
  table: string;
  id: string;
  publishColumn?: boolean;
};

class ContentStatusService extends AdminShared {
  static async updateContentStatus({ entityType, entityId, status, comment }: ContentStatusPayload, adminId) {
    this.assertContentStatus(status);

    const tableMap: Record<ContentStatusPayload['entityType'], ContentStatusTarget> = {
      Topic: { table: 'Topics', id: 'TopicID' },
      Word: { table: 'Words', id: 'WordID' },
      Question: { table: 'Questions', id: 'QuestionID' },
      MiniTest: { table: 'MiniTests', id: 'MiniTestID', publishColumn: true }
    };
    const target = tableMap[entityType];
    if (!target) throw new Error('Invalid entity type');

    const pool = await poolPromise;
    const oldStatusResult = await pool.request()
      .input('EntityID', sql.BigInt, entityId)
      .query(`SELECT ContentStatus FROM ${target.table} WHERE ${target.id} = @EntityID`);

    if (oldStatusResult.recordset.length === 0) return false;
    const oldStatus = oldStatusResult.recordset[0].ContentStatus;

    const publishFragment = target.publishColumn
      ? ', IsPublished = CASE WHEN @ContentStatus = N\'Published\' THEN 1 ELSE 0 END'
      : '';

    const result = await pool.request()
      .input('EntityID', sql.BigInt, entityId)
      .input('ContentStatus', sql.NVarChar(30), status)
      .input('ReviewedByUserID', sql.BigInt, adminId)
      .query(`
        UPDATE ${target.table}
        SET ContentStatus = @ContentStatus,
            ReviewedByUserID = @ReviewedByUserID,
            ReviewedAt = SYSDATETIMEOFFSET(),
            PublishedAt = CASE WHEN @ContentStatus = N'Published' THEN SYSDATETIMEOFFSET() ELSE PublishedAt END,
            UpdatedAt = SYSDATETIMEOFFSET()
            ${publishFragment}
        WHERE ${target.id} = @EntityID
      `);

    if (result.rowsAffected[0] > 0) {
      await this.logContentReview(entityType, entityId, oldStatus, status, adminId, comment);
      await this.logAdminAction(adminId, 'UPDATE_CONTENT_STATUS', entityType, entityId, { oldStatus, status, comment });
    }

    return result.rowsAffected[0] > 0;
  }

  static async getPendingContent() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT *
      FROM (
        SELECT
          N'Topic' AS entityType,
          t.TopicID AS entityId,
          t.TopicName AS title,
          t.ContentStatus AS status,
          t.CreatedByUserID AS creatorId,
          COALESCE(u.FullName, u.Email, N'Người dùng #' + CAST(t.CreatedByUserID AS nvarchar(30))) AS creatorName,
          t.CreatedAt AS createdAt
        FROM Topics t
        LEFT JOIN Users u ON t.CreatedByUserID = u.UserID
        WHERE t.ContentStatus = N'PendingReview'

        UNION ALL

        SELECT
          N'Word',
          w.WordID,
          w.Term,
          w.ContentStatus,
          w.CreatedByUserID,
          COALESCE(u.FullName, u.Email, N'Người dùng #' + CAST(w.CreatedByUserID AS nvarchar(30))),
          w.CreatedAt
        FROM Words w
        LEFT JOIN Users u ON w.CreatedByUserID = u.UserID
        WHERE w.ContentStatus = N'PendingReview'

        UNION ALL

        SELECT
          N'Question',
          q.QuestionID,
          q.QuestionText,
          q.ContentStatus,
          q.CreatedByUserID,
          COALESCE(u.FullName, u.Email, N'Người dùng #' + CAST(q.CreatedByUserID AS nvarchar(30))),
          q.CreatedAt
        FROM Questions q
        LEFT JOIN Users u ON q.CreatedByUserID = u.UserID
        WHERE q.ContentStatus = N'PendingReview'

        UNION ALL

        SELECT
          N'MiniTest',
          mt.MiniTestID,
          mt.TestTitle,
          mt.ContentStatus,
          mt.CreatedByUserID,
          COALESCE(u.FullName, u.Email, N'Người dùng #' + CAST(mt.CreatedByUserID AS nvarchar(30))),
          mt.CreatedAt
        FROM MiniTests mt
        LEFT JOIN Users u ON mt.CreatedByUserID = u.UserID
        WHERE mt.ContentStatus = N'PendingReview'
      ) pending
      ORDER BY createdAt ASC, entityType, entityId;
    `);

    return result.recordset;
  }

  static async getContentReviewLogs(entityType, entityId) {
    const validEntityTypes = ['Topic', 'Word', 'Question', 'MiniTest'];
    if (!validEntityTypes.includes(entityType)) {
      throw new Error('Invalid entity type');
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('EntityType', sql.NVarChar(30), entityType)
      .input('EntityID', sql.BigInt, entityId)
      .query(`
        IF OBJECT_ID(N'dbo.ContentReviewLogs', N'U') IS NULL
        BEGIN
          SELECT
            CAST(NULL AS bigint) AS id,
            CAST(NULL AS nvarchar(30)) AS oldStatus,
            CAST(NULL AS nvarchar(30)) AS newStatus,
            CAST(NULL AS nvarchar(2000)) AS comment,
            CAST(NULL AS datetimeoffset) AS createdAt,
            CAST(NULL AS nvarchar(200)) AS actionByName
          WHERE 1 = 0;
          RETURN;
        END

        SELECT
          l.ContentReviewLogID AS id,
          l.OldStatus AS oldStatus,
          l.NewStatus AS newStatus,
          l.Comment AS comment,
          l.CreatedAt AS createdAt,
          COALESCE(u.FullName, u.Email, N'Hệ thống') AS actionByName
        FROM ContentReviewLogs l
        LEFT JOIN Users u ON l.ActionByUserID = u.UserID
        WHERE l.EntityType = @EntityType
          AND l.EntityID = @EntityID
        ORDER BY l.CreatedAt DESC;
      `);

    return result.recordset;
  }
}

export default ContentStatusService;
