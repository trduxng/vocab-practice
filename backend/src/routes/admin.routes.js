const express = require('express');
const AdminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin, checkPermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.use(verifyToken);

// Words
router.get('/words', checkPermission('MANAGE_WORDS'), AdminController.getWords);
router.post('/words', checkPermission('MANAGE_WORDS'), validate(schemas.createWord), AdminController.createWord);
router.post('/words/bulk-import', checkPermission('MANAGE_WORDS'), express.text({ type: ['text/csv', 'text/plain'], limit: '5mb' }), AdminController.bulkImportWords);
router.put('/words/:id', checkPermission('MANAGE_WORDS'), AdminController.updateWord);
router.delete('/words/:id', checkPermission('MANAGE_WORDS'), AdminController.deleteWord);

// Questions
router.post('/questions/bulk-import', checkPermission('MANAGE_QUESTIONS'), express.text({ type: ['text/csv', 'text/plain'], limit: '2mb' }), AdminController.bulkImportQuestions);
router.get('/questions/:wordId', checkPermission('MANAGE_QUESTIONS'), AdminController.getQuestionsByWord);
router.post('/questions', checkPermission('MANAGE_QUESTIONS'), validate(schemas.createQuestion), AdminController.createQuestion);

// Mini Tests
router.get('/minitests', checkPermission('MANAGE_TESTS'), AdminController.getMiniTests);
router.post('/minitests', checkPermission('MANAGE_TESTS'), AdminController.createMiniTest);
router.get('/stats', checkPermission('VIEW_DASHBOARD'), AdminController.getStats);

// Students
router.get('/students', checkPermission('MANAGE_USERS'), AdminController.getStudents);
router.post('/students', checkPermission('MANAGE_USERS'), AdminController.createUser);
router.put('/students/:id', checkPermission('MANAGE_USERS'), AdminController.updateUser);
router.delete('/students/:id', checkPermission('MANAGE_USERS'), AdminController.deleteUser);
router.patch('/students/:id/toggle', checkPermission('MANAGE_USERS'), AdminController.toggleStudentStatus);
router.patch('/students/:id/role', checkPermission('MANAGE_USERS'), AdminController.updateUserRole);
router.get('/analytics', checkPermission('VIEW_DASHBOARD'), AdminController.getAnalytics);

// Notifications
router.get('/notifications', checkPermission('MANAGE_NOTIFICATIONS'), AdminController.getNotifications);
router.post('/notifications', checkPermission('MANAGE_NOTIFICATIONS'), AdminController.sendAnnouncement);
router.post('/notifications/daily-reminders', checkPermission('MANAGE_NOTIFICATIONS'), AdminController.createDailyReminders);

module.exports = router;
