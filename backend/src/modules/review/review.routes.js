const express = require('express');
const ReviewController = require('./review.controller');
const { verifyToken, checkAnyPermission } = require('../../middlewares/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/pending', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), ReviewController.getPending);
router.post('/:entityType/:entityId/approve', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), ReviewController.approve);
router.post('/:entityType/:entityId/reject', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), ReviewController.reject);
router.post('/:entityType/:entityId/archive', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), ReviewController.archive);
router.get('/:entityType/:entityId/logs', checkAnyPermission(['REVIEW_CONTENT', 'PUBLISH_CONTENT', 'MANAGE_SYSTEM_SETTINGS']), ReviewController.getReviewLogs);

module.exports = router;