import express from 'express';

import { checkPermission } from '../../../middlewares/auth.ts';
import { schemas, validate } from '../../../middlewares/validate.ts';
import NotificationController from '../controllers/notifications.controller.ts';

const router = express.Router();

router.get('/notifications', checkPermission('MANAGE_NOTIFICATIONS'), NotificationController.getNotifications);
router.post('/notifications', checkPermission('MANAGE_NOTIFICATIONS'), validate(schemas.announcement), NotificationController.sendAnnouncement);
router.post('/notifications/daily-reminders', checkPermission('MANAGE_NOTIFICATIONS'), NotificationController.createDailyReminders);

export default router;
