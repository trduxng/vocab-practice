const express = require('express');
const ReviewController = require('../controllers/review.controller');
const { verifyToken, checkPermission } = require('../middlewares/auth');

const router = express.Router();

router.use(verifyToken);

// Admin content review — requires REVIEW_CONTENT permission
router.get('/pending', checkPermission('REVIEW_CONTENT'), ReviewController.getPending);
router.post('/:entityType/:entityId/approve', checkPermission('REVIEW_CONTENT'), ReviewController.approve);
router.post('/:entityType/:entityId/reject', checkPermission('REVIEW_CONTENT'), ReviewController.reject);
router.post('/:entityType/:entityId/archive', checkPermission('REVIEW_CONTENT'), ReviewController.archive);
router.get('/:entityType/:entityId/logs', checkPermission('REVIEW_CONTENT'), ReviewController.getReviewLogs);

module.exports = router;
