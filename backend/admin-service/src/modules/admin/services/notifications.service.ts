import type { AnnouncementPayload, NotificationFilters } from '../admin.types.ts';
import { AdminShared, poolPromise, sql } from '../shared/admin.shared.ts';

class NotificationService extends AdminShared {
  static async getNotifications(page = 1, limit = 50, filters: NotificationFilters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const tableExists = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.Notifications', N'U') AS tableId
    `);

    if (!tableExists.recordset[0].tableId) {
      return this.paginate([], 0, paging.page, paging.limit);
    }

    const search = String(filters.search ?? '').trim();
    const type = String(filters.type ?? '').trim();
    const deliveryChannel = String(filters.deliveryChannel ?? '').trim();
    const isRead = filters.isRead === undefined || filters.isRead === '' ? null : filters.isRead === true || filters.isRead === 'true' || filters.isRead === '1';
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(n.Title LIKE @Search OR n.Message LIKE @Search OR u.FullName LIKE @Search OR u.Email LIKE @Search)');
    }

    if (type) {
      request.input('Type', sql.NVarChar(50), type);
      conditions.push('n.Type = @Type');
    }

    if (deliveryChannel) {
      request.input('DeliveryChannel', sql.NVarChar(20), deliveryChannel);
      conditions.push('n.DeliveryChannel = @DeliveryChannel');
    }

    if (isRead !== null) {
      request.input('IsRead', sql.Bit, isRead);
      conditions.push('n.IsRead = @IsRead');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request
      .query(`
        SELECT COUNT_BIG(1) AS total
        FROM Notifications n
        JOIN Users u ON n.UserID = u.UserID
        ${whereClause};

        SELECT
          n.NotificationID AS id,
          n.UserID AS userId,
          u.FullName AS fullName,
          u.Email AS email,
          n.Title AS title,
          n.Message AS message,
          n.Type AS type,
          n.DeliveryChannel AS deliveryChannel,
          n.IsRead AS isRead,
          n.CreatedAt AS createdAt,
          n.ActionUrl AS actionUrl
        FROM Notifications n
        JOIN Users u ON n.UserID = u.UserID
        ${whereClause}
        ORDER BY n.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);

    return this.paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async sendAnnouncement({ audience = 'All users', title, message, deliveryChannel = 'InApp', actionUrl = null }: AnnouncementPayload) {
    if (!title || !message) {
      throw new Error('Missing title or message');
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Audience', sql.NVarChar(50), audience)
      .input('Title', sql.NVarChar(200), title)
      .input('Message', sql.NVarChar(2000), message)
      .input('DeliveryChannel', sql.NVarChar(20), deliveryChannel)
      .input('ActionUrl', sql.NVarChar(500), actionUrl)
      .query(`
        IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
          THROW 50020, 'Notifications table is missing. Run migration_alignment_improvements.sql first.', 1;

        INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, ActionUrl)
        SELECT
          UserID,
          @Title,
          @Message,
          'Announcement',
          CASE WHEN @DeliveryChannel = 'Both' THEN 'InApp' ELSE @DeliveryChannel END,
          @ActionUrl
        FROM Users
        WHERE IsActive = 1
          AND (
            @Audience = 'All users'
            OR (@Audience = 'Learners' AND UserRole = 'Learner')
            OR (@Audience = 'Admins' AND UserRole = 'Admin')
          );

        SELECT @@ROWCOUNT AS inserted;
      `);

    return { inserted: result.recordset[0].inserted };
  }

  static async createDailyReminders() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
        THROW 50020, 'Notifications table is missing. Run migration_alignment_improvements.sql first.', 1;

      INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, ActionUrl)
      SELECT
        u.UserID,
        N'Time to study!',
        CONCAT(N'You have ', due.DueWords, N' words waiting for review today.'),
        'DailyReminder',
        'InApp',
        '/user/learn'
      FROM Users u
      CROSS APPLY
      (
        SELECT COUNT(*) AS DueWords
        FROM UserWordProgress uwp
        WHERE uwp.UserID = u.UserID
          AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET())
      ) due
      WHERE u.IsActive = 1
        AND u.UserRole = 'Learner'
        AND due.DueWords > 0
        AND NOT EXISTS
        (
          SELECT 1
          FROM Notifications n
          WHERE n.UserID = u.UserID
            AND n.Type = 'DailyReminder'
            AND CAST(n.CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
        );

      SELECT @@ROWCOUNT AS inserted;
    `);

    return { inserted: result.recordset[0].inserted };
  }
}

export default NotificationService;
