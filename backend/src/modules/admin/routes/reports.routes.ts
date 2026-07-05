const express = require('express');

const { checkAnyPermission } = require('../../../middlewares/auth.js');
const { schemas, validate } = require('../validate.ts');
const ReportsController = require('../controllers/reports.controller.ts');

const router = express.Router();

router.get('/reports', checkAnyPermission(['MANAGE_REPORTS', 'MANAGE_SYSTEM_SETTINGS']), ReportsController.getReports);
router.patch('/reports/:id', checkAnyPermission(['MANAGE_REPORTS', 'MANAGE_SYSTEM_SETTINGS']), validate(schemas.updateReport), ReportsController.updateReport);

module.exports = router;
