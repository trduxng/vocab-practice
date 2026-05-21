const express = require('express');
const AdminController = require('../controllers/admin.controller');
const { verifyToken, checkPermission, checkAnyPermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.use(verifyToken);

// Topics
router.get('/topics', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), AdminController.getTopics);
router.post('/topics', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), validate(schemas.createTopic), AdminController.createTopic);
router.put('/topics/:id', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), validate(schemas.updateTopic), AdminController.updateTopic);
router.delete('/topics/:id', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), AdminController.deleteTopic);
router.get('/topic-categories', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS', 'MANAGE_WORDS']), AdminController.getTopicCategories);
router.post('/topic-categories', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), validate(schemas.topicCategory), AdminController.createTopicCategory);
router.put('/topic-categories/:id', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), validate(schemas.topicCategory), AdminController.updateTopicCategory);
router.delete('/topic-categories/:id', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), AdminController.deleteTopicCategory);

// Words
router.get('/words', checkPermission('MANAGE_WORDS'), AdminController.getWords);
router.post('/words', checkPermission('MANAGE_WORDS'), validate(schemas.createWord), AdminController.createWord);
router.post('/words/import-preview', checkPermission('MANAGE_WORDS'), express.text({ type: ['text/csv', 'text/plain'], limit: '5mb' }), AdminController.previewWordImport);
router.post('/words/bulk-import', checkPermission('MANAGE_WORDS'), express.text({ type: ['text/csv', 'text/plain'], limit: '5mb' }), AdminController.bulkImportWords);
router.get('/words/:id', checkPermission('MANAGE_WORDS'), AdminController.getWordDetail);
router.put('/words/:id', checkPermission('MANAGE_WORDS'), validate(schemas.createWord), AdminController.updateWord);
router.delete('/words/:id/hard', checkPermission('MANAGE_SYSTEM_SETTINGS'), AdminController.hardDeleteWord);
router.delete('/words/:id', checkPermission('MANAGE_WORDS'), AdminController.deleteWord);

// Questions
router.post('/questions/bulk-import', checkPermission('MANAGE_QUESTIONS'), express.text({ type: ['text/csv', 'text/plain'], limit: '2mb' }), AdminController.bulkImportQuestions);
router.get('/questions/:wordId', checkPermission('MANAGE_QUESTIONS'), AdminController.getQuestionsByWord);
router.post('/questions', checkPermission('MANAGE_QUESTIONS'), validate(schemas.createQuestion), AdminController.createQuestion);
router.put('/questions/:id', checkPermission('MANAGE_QUESTIONS'), validate(schemas.createQuestion), AdminController.updateQuestion);
router.delete('/questions/:id', checkPermission('MANAGE_QUESTIONS'), AdminController.deleteQuestion);

// Mini Tests
router.get('/minitests', checkPermission('MANAGE_TESTS'), AdminController.getMiniTests);
router.post('/minitests', checkPermission('MANAGE_TESTS'), validate(schemas.miniTest), AdminController.createMiniTest);
router.put('/minitests/:id', checkPermission('MANAGE_TESTS'), validate(schemas.miniTest), AdminController.updateMiniTest);
router.delete('/minitests/:id', checkPermission('MANAGE_TESTS'), AdminController.deleteMiniTest);
router.patch('/minitests/:id/publish', checkPermission('MANAGE_TESTS'), AdminController.publishMiniTest);
router.patch('/minitests/:id/archive', checkPermission('MANAGE_TESTS'), AdminController.archiveMiniTest);
router.get('/stats', checkPermission('VIEW_DASHBOARD'), AdminController.getStats);

// Students
router.get('/students', checkPermission('MANAGE_USERS'), AdminController.getStudents);
router.post('/students', checkPermission('MANAGE_USERS'), AdminController.createUser);
router.put('/students/:id', checkPermission('MANAGE_USERS'), AdminController.updateUser);
router.delete('/students/:id', checkPermission('MANAGE_USERS'), AdminController.deleteUser);
router.patch('/students/:id/toggle', checkPermission('MANAGE_USERS'), AdminController.toggleStudentStatus);
router.patch('/students/:id/role', checkPermission('MANAGE_USERS'), AdminController.updateUserRole);
router.get('/analytics', checkPermission('VIEW_DASHBOARD'), AdminController.getAnalytics);
router.get('/content-management', checkPermission('VIEW_DASHBOARD'), AdminController.getContentManagement);
router.patch('/content-status', checkAnyPermission(['MANAGE_SYSTEM_SETTINGS', 'MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_QUESTIONS', 'MANAGE_TESTS']), validate(schemas.contentStatus), AdminController.updateContentStatus);
router.get('/audit-logs', checkAnyPermission(['VIEW_AUDIT_LOGS', 'MANAGE_SYSTEM_SETTINGS', 'MANAGE_USERS']), AdminController.getAuditLogs);

// Notifications
router.get('/notifications', checkPermission('MANAGE_NOTIFICATIONS'), AdminController.getNotifications);
router.post('/notifications', checkPermission('MANAGE_NOTIFICATIONS'), AdminController.sendAnnouncement);
router.post('/notifications/daily-reminders', checkPermission('MANAGE_NOTIFICATIONS'), AdminController.createDailyReminders);

module.exports = router;
