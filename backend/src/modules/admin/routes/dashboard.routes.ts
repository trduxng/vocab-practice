const express = require('express');

const { checkAnyPermission, checkPermission } = require('../../../middlewares/auth.js');
const DashboardController = require('../controllers/dashboard.controller.ts');

const router = express.Router();

router.get('/stats', checkPermission('VIEW_DASHBOARD'), DashboardController.getStats);
router.get('/analytics', checkAnyPermission(['VIEW_ANALYTICS', 'VIEW_DASHBOARD']), DashboardController.getAnalytics);
router.get('/content-management', checkAnyPermission(['VIEW_DASHBOARD', 'MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_QUESTIONS', 'MANAGE_TESTS']), DashboardController.getContentManagement);

module.exports = router;
