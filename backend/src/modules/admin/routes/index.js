const express = require('express');
const { checkAnyPermission } = require('../../../middlewares/auth');
const TopicController = require('../controllers/topic.controller');
const WordController = require('../controllers/word.controller');
const QuestionController = require('../controllers/question.controller');
const MiniTestController = require('../controllers/mini-test.controller');
const AdminUserController = require('../controllers/users.controller');
const DashboardController = require('../controllers/dashboard.controller');
const AuditController = require('../controllers/audit.controller');
const NotificationController = require('../controllers/notification.controller');
const ReportController = require('../controllers/report.controller');
const ContentStatusController = require('../controllers/content-status.controller');

const router = express.Router();

// ── Topics ──
router.get('/topics', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), TopicController.getTopics);
router.post('/topics', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), TopicController.createTopic);
router.put('/topics/:id', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), TopicController.updateTopic);
router.delete('/topics/:id', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), TopicController.deleteTopic);
router.get('/topic-categories', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS', 'MANAGE_WORDS']), TopicController.getTopicCategories);
router.post('/topic-categories', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), TopicController.createTopicCategory);
router.put('/topic-categories/:id', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), TopicController.updateTopicCategory);
router.delete('/topic-categories/:id', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), TopicController.deleteTopicCategory);

// ── Words ──
router.get('/words', checkAnyPermission(['MANAGE_WORDS']), WordController.getWords);
router.post('/words', checkAnyPermission(['MANAGE_WORDS']), WordController.createWord);
router.post('/words/import-preview', checkAnyPermission(['MANAGE_WORDS']), express.text({ type: ['text/csv', 'text/plain'], limit: '5mb' }), WordController.previewImport);
router.post('/words/bulk-import', checkAnyPermission(['MANAGE_WORDS']), express.text({ type: ['text/csv', 'text/plain'], limit: '5mb' }), WordController.bulkImport);
router.get('/words/:id', checkAnyPermission(['MANAGE_WORDS']), WordController.getDetail);
router.put('/words/:id', checkAnyPermission(['MANAGE_WORDS']), WordController.updateWord);
router.delete('/words/:id/hard', checkAnyPermission(['MANAGE_SYSTEM_SETTINGS']), WordController.hardDelete);
router.delete('/words/:id', checkAnyPermission(['MANAGE_WORDS']), WordController.deleteWord);

// ── Questions ──
router.post('/questions/bulk-import', checkAnyPermission(['MANAGE_QUESTIONS']), express.text({ type: ['text/csv', 'text/plain'], limit: '2mb' }), QuestionController.bulkImport);
router.get('/questions/:wordId', checkAnyPermission(['MANAGE_QUESTIONS']), QuestionController.getByWord);
router.post('/questions', checkAnyPermission(['MANAGE_QUESTIONS']), QuestionController.create);
router.put('/questions/:id', checkAnyPermission(['MANAGE_QUESTIONS']), QuestionController.update);
router.delete('/questions/:id', checkAnyPermission(['MANAGE_QUESTIONS']), QuestionController.delete);

// ── Mini Tests ──
router.get('/minitests', checkAnyPermission(['MANAGE_TESTS']), MiniTestController.getMiniTests);
router.post('/minitests', checkAnyPermission(['MANAGE_TESTS']), MiniTestController.createMiniTest);
router.put('/minitests/:id', checkAnyPermission(['MANAGE_TESTS']), MiniTestController.updateMiniTest);
router.delete('/minitests/:id', checkAnyPermission(['MANAGE_TESTS']), MiniTestController.deleteMiniTest);
router.patch('/minitests/:id/publish', checkAnyPermission(['MANAGE_TESTS']), MiniTestController.publishMiniTest);
router.patch('/minitests/:id/archive', checkAnyPermission(['MANAGE_TESTS']), MiniTestController.archiveMiniTest);

// ── Dashboard & Stats ──
router.get('/stats', checkAnyPermission(['VIEW_DASHBOARD']), DashboardController.getStats);
router.get('/analytics', checkAnyPermission(['VIEW_ANALYTICS', 'VIEW_DASHBOARD']), DashboardController.getAnalytics);
router.get('/content-management', checkAnyPermission(['VIEW_DASHBOARD', 'MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_QUESTIONS', 'MANAGE_TESTS']), DashboardController.getContentManagement);

// ── Users ──
router.get('/students', checkAnyPermission(['MANAGE_USERS']), AdminUserController.getStudents);
router.post('/students', checkAnyPermission(['MANAGE_USERS']), AdminUserController.createUser);
router.put('/students/:id', checkAnyPermission(['MANAGE_USERS']), AdminUserController.updateUser);
router.delete('/students/:id', checkAnyPermission(['MANAGE_USERS']), AdminUserController.deleteUser);
router.patch('/students/:id/toggle', checkAnyPermission(['MANAGE_USERS']), AdminUserController.toggleStatus);
router.patch('/students/:id/role', checkAnyPermission(['MANAGE_USERS']), AdminUserController.updateRole);
router.get('/students/:id/progress', checkAnyPermission(['MANAGE_USERS']), AdminUserController.getStudentDetail);

// ── Content Status ──
router.patch('/content-status', checkAnyPermission(['MANAGE_SYSTEM_SETTINGS', 'MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_QUESTIONS', 'MANAGE_TESTS']), ContentStatusController.updateContentStatus);

// ── Audit ──
router.get('/audit-logs', checkAnyPermission(['VIEW_AUDIT_LOGS', 'MANAGE_SYSTEM_SETTINGS', 'MANAGE_USERS']), AuditController.getAuditLogs);

// ── Reports ──
router.get('/reports', checkAnyPermission(['MANAGE_REPORTS', 'MANAGE_SYSTEM_SETTINGS']), ReportController.getReports);
router.patch('/reports/:id', checkAnyPermission(['MANAGE_REPORTS', 'MANAGE_SYSTEM_SETTINGS']), ReportController.updateReport);

// ── Notifications ──
router.get('/notifications', checkAnyPermission(['MANAGE_NOTIFICATIONS']), NotificationController.getNotifications);
router.post('/notifications', checkAnyPermission(['MANAGE_NOTIFICATIONS']), NotificationController.sendAnnouncement);
router.post('/notifications/daily-reminders', checkAnyPermission(['MANAGE_NOTIFICATIONS']), NotificationController.createDailyReminders);

module.exports = router;