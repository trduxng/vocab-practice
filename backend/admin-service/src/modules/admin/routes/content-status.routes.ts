import express from 'express';

import { checkAnyPermission } from '../../../middlewares/auth.ts';
import { schemas, validate } from '../../../middlewares/validate.ts';
import ContentStatusController from '../controllers/content-status.controller.ts';

const router = express.Router();

router.patch(
  '/content-status',
  checkAnyPermission(['MANAGE_SYSTEM_SETTINGS', 'MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_QUESTIONS', 'MANAGE_TESTS']),
  validate(schemas.contentStatus),
  ContentStatusController.updateContentStatus
);

export default router;
