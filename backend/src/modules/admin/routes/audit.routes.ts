const express = require('express');

const { checkAnyPermission } = require('../../../middlewares/auth.js');
const AuditController = require('../controllers/audit.controller.ts');

const router = express.Router();

router.get('/audit-logs', checkAnyPermission(['VIEW_AUDIT_LOGS', 'MANAGE_SYSTEM_SETTINGS', 'MANAGE_USERS']), AuditController.getAuditLogs);

module.exports = router;
