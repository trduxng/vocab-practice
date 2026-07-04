import NotificationService from '../services/notifications.service.ts';

class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const data = await NotificationService.getNotifications(page, limit, {
        search: req.query.search,
        type: req.query.type,
        deliveryChannel: req.query.deliveryChannel,
        isRead: req.query.isRead
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async sendAnnouncement(req, res, next) {
    try {
      const result = await NotificationService.sendAnnouncement(req.body);
      res.status(201).json({ message: 'Announcement queued', data: result });
    } catch (error) {
      if (error.message === 'Missing title or message') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async createDailyReminders(req, res, next) {
    try {
      const result = await NotificationService.createDailyReminders();
      res.status(201).json({ message: 'Daily reminders queued', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
