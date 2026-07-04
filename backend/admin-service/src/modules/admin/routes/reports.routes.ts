import express from 'express';

import { checkAnyPermission } from '../../../middlewares/auth.ts';
import { schemas, validate } from '../../../middlewares/validate.ts';
import ReportsController from '../controllers/reports.controller.ts';

const router = express.Router();

router.get('/reports', checkAnyPermission(['MANAGE_REPORTS', 'MANAGE_SYSTEM_SETTINGS']), ReportsController.getReports);
router.patch('/reports/:id', checkAnyPermission(['MANAGE_REPORTS', 'MANAGE_SYSTEM_SETTINGS']), validate(schemas.updateReport), ReportsController.updateReport);

export default router;
