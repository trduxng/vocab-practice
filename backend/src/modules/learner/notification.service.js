const { sql, poolPromise } = require("../../config/db");

class NotificationService {
  static async getUserNotifications(userId, limit = 20) {
    const pool = await poolPromise;
    limit = Math.min(50, Math.max(1, limit));
    const result = await pool.request().input('UserID', sql.BigInt, userId).input('Limit', sql.Int, limit).query(`
      SELECT TOP (@Limit) NotificationID AS id, Title AS title, Message AS message, Type AS type,
        DeliveryChannel AS channel, IsRead AS isRead, ActionUrl AS actionUrl, CreatedAt AS createdAt
      FROM dbo.Notifications WHERE UserID = @UserID ORDER BY IsRead ASC, CreatedAt DESC
    `);
    const countResult = await pool.request().input('UserID', sql.BigInt, userId).query(`
      SELECT COUNT(*) AS total, SUM(CASE WHEN IsRead = 0 THEN 1 ELSE 0 END) AS unread FROM dbo.Notifications WHERE UserID = @UserID
    `);
    return { notifications: result.recordset, unreadCount: countResult.recordset[0]?.unread || 0, total: countResult.recordset[0]?.total || 0 };
  }

  static async markNotificationRead(userId, notificationId) {
    const pool = await poolPromise;
    await pool.request().input('UserID', sql.BigInt, userId).input('NotificationID', sql.BigInt, notificationId)
      .query(`UPDATE dbo.Notifications SET IsRead = 1 WHERE NotificationID = @NotificationID AND UserID = @UserID`);
    return { success: true };
  }

  static async markAllNotificationsRead(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input('UserID', sql.BigInt, userId)
      .query(`UPDATE dbo.Notifications SET IsRead = 1 WHERE UserID = @UserID AND IsRead = 0`);
    return { success: true, count: result.rowsAffected[0] || 0 };
  }
}

module.exports = NotificationService;
