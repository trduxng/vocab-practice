const express = require('express');

const { checkPermission } = require('../../../middlewares/auth.js');
const { schemas, validate } = require('../validate.ts');
const NotificationController = require('../controllers/notifications.controller.ts');

const router = express.Router();

router.get('/notifications', checkPermission('MANAGE_NOTIFICATIONS'), NotificationController.getNotifications);
router.post('/notifications', checkPermission('MANAGE_NOTIFICATIONS'), validate(schemas.announcement), NotificationController.sendAnnouncement);
router.post('/notifications/daily-reminders', checkPermission('MANAGE_NOTIFICATIONS'), NotificationController.createDailyReminders);

module.exports = router;
