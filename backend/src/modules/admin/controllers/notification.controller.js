const NotificationService = require('../services/notification.service');

class NotificationController {
  static async getNotifications(req, res, next) { try { res.json(await NotificationService.getNotifications(parseInt(req.query.page) || 1, parseInt(req.query.limit) || 50, req.query)); } catch (e) { next(e); } }
  static async sendAnnouncement(req, res, next) { try { const result = await NotificationService.sendAnnouncement(req.body); res.status(201).json({ message: 'Announcement queued', data: result }); } catch (e) { next(e); } }
  static async createDailyReminders(req, res, next) { try { const result = await NotificationService.createDailyReminders(); res.status(201).json({ message: 'Daily reminders queued', data: result }); } catch (e) { next(e); } }
}

module.exports = NotificationController;