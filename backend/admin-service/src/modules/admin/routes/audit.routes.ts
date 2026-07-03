import express from 'express';

import { checkAnyPermission } from '../../../middlewares/auth.ts';
import AuditController from '../controllers/audit.controller.ts';

const router = express.Router();

router.get('/audit-logs', checkAnyPermission(['VIEW_AUDIT_LOGS', 'MANAGE_SYSTEM_SETTINGS', 'MANAGE_USERS']), AuditController.getAuditLogs);

export default router;
