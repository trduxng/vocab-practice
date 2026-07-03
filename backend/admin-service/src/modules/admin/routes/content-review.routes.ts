import express from 'express';

import { checkAnyPermission } from '../../../middlewares/auth.ts';
import { schemas, validate } from '../../../middlewares/validate.ts';
import ReviewController from '../controllers/content-review.controller.ts';

const router = express.Router();
const canReviewContent = checkAnyPermission(['MANAGE_SYSTEM_SETTINGS', 'MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_QUESTIONS', 'MANAGE_TESTS']);

router.get('/pending', canReviewContent, ReviewController.getPending);
router.patch('/:entityType/:entityId/approve', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.approve);
router.patch('/:entityType/:entityId/reject', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.reject);
router.patch('/:entityType/:entityId/archive', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.archive);
router.get('/:entityType/:entityId/logs', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.getReviewLogs);

export default router;
