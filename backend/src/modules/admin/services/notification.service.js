const { poolPromise, sql } = require('../../../config/db');
const { normalizePagination, paginate, logAdminAction } = require('./admin.shared');

class NotificationService {
  static async getNotifications(page = 1, limit = 50, filters = {}) {
    const pool = await poolPromise;
    const paging = normalizePagination(page, limit, 100);
    const conditions = [];
    const request = pool.request().input('Offset', sql.Int, paging.offset).input('Limit', sql.Int, paging.limit);
    const search = String(filters.search ?? '').trim();
    const type = String(filters.type ?? '').trim();
    const isRead = filters.isRead === undefined || filters.isRead === '' ? null : (filters.isRead === true || filters.isRead === 'true' || filters.isRead === '1');
    if (search) { request.input('Search', sql.NVarChar(250), `%${search}%`); conditions.push('(n.Title LIKE @Search OR n.Message LIKE @Search OR u.FullName LIKE @Search OR u.Email LIKE @Search)'); }
    if (type) { request.input('Type', sql.NVarChar(50), type); conditions.push('n.Type = @Type'); }
    if (isRead !== null) { request.input('IsRead', sql.Bit, isRead); conditions.push('n.IsRead = @IsRead'); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`SELECT COUNT_BIG(1) AS total FROM Notifications n JOIN Users u ON n.UserID = u.UserID ${where}; SELECT n.NotificationID AS id, n.UserID AS userId, u.FullName AS fullName, u.Email AS email, n.Title AS title, n.Message AS message, n.Type AS type, n.DeliveryChannel AS deliveryChannel, n.IsRead AS isRead, n.CreatedAt AS createdAt, n.ActionUrl AS actionUrl FROM Notifications n JOIN Users u ON n.UserID = u.UserID ${where} ORDER BY n.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`);
    return paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async sendAnnouncement({ audience = 'All users', title, message, deliveryChannel = 'InApp', actionUrl = null }) {
    if (!title || !message) throw new Error('Missing title or message');
    const pool = await poolPromise;
    const result = await pool.request().input('Audience', sql.NVarChar(50), audience).input('Title', sql.NVarChar(200), title).input('Message', sql.NVarChar(2000), message).input('DeliveryChannel', sql.NVarChar(20), deliveryChannel).input('ActionUrl', sql.NVarChar(500), actionUrl)
      .query(`INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, ActionUrl) SELECT UserID, @Title, @Message, 'Announcement', CASE WHEN @DeliveryChannel = 'Both' THEN 'InApp' ELSE @DeliveryChannel END, @ActionUrl FROM Users WHERE IsActive = 1 AND (@Audience = 'All users' OR (@Audience = 'Learners' AND UserRole = 'Learner') OR (@Audience = 'Admins' AND UserRole = 'Admin')); SELECT @@ROWCOUNT AS inserted`);
    return { inserted: result.recordset[0].inserted };
  }

  static async createDailyReminders() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, ActionUrl)
      SELECT u.UserID, N'Time to study!', CONCAT(N'You have ', due.DueWords, N' words waiting for review today.'), 'DailyReminder', 'InApp', '/user/learn'
      FROM Users u CROSS APPLY (SELECT COUNT(*) AS DueWords FROM UserWordProgress uwp WHERE uwp.UserID = u.UserID AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET())) due
      WHERE u.IsActive = 1 AND u.UserRole = 'Learner' AND due.DueWords > 0
        AND NOT EXISTS (SELECT 1 FROM Notifications n WHERE n.UserID = u.UserID AND n.Type = 'DailyReminder' AND CAST(n.CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE));
      SELECT @@ROWCOUNT AS inserted`);
    return { inserted: result.recordset[0].inserted };
  }
}

module.exports = NotificationService;
