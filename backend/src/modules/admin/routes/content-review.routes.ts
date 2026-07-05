const express = require('express');

const { checkAnyPermission } = require('../../../middlewares/auth.js');
const { schemas, validate } = require('../validate.ts');
const ReviewController = require('../controllers/content-review.controller.ts');

const router = express.Router();
const canReviewContent = checkAnyPermission([
  'REVIEW_CONTENT',
  'PUBLISH_CONTENT',
  'MANAGE_SYSTEM_SETTINGS',
  'MANAGE_TOPICS',
  'MANAGE_WORDS',
  'MANAGE_QUESTIONS',
  'MANAGE_TESTS'
]);

router.get('/pending', canReviewContent, ReviewController.getPending);
router.patch('/:entityType/:entityId/approve', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.approve);
router.patch('/:entityType/:entityId/reject', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.reject);
router.patch('/:entityType/:entityId/archive', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.archive);
router.post('/:entityType/:entityId/approve', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.approve);
router.post('/:entityType/:entityId/reject', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.reject);
router.post('/:entityType/:entityId/archive', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.archive);
router.get('/:entityType/:entityId/logs', canReviewContent, validate(schemas.contentReviewTarget), ReviewController.getReviewLogs);

module.exports = router;
