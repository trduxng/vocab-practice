const express = require('express');
const ReviewController = require('../controllers/review.controller');
const { verifyToken, checkAnyPermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.use(verifyToken);

// Admin content review
router.get('/pending', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), ReviewController.getPending);
router.post('/:entityType/:entityId/approve', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), validate(schemas.contentReviewTarget), ReviewController.approve);
router.post('/:entityType/:entityId/reject', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), validate(schemas.contentReviewTarget), ReviewController.reject);
router.post('/:entityType/:entityId/archive', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), validate(schemas.contentReviewTarget), ReviewController.archive);
router.get('/:entityType/:entityId/logs', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), validate(schemas.contentReviewTarget), ReviewController.getReviewLogs);

module.exports = router;
