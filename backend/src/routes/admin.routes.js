const express = require('express');
const AdminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin, checkPermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.use(verifyToken);

// Words
router.get('/words', checkPermission('QUAN_LY_TU_VUNG'), AdminController.getWords);
router.post('/words', checkPermission('QUAN_LY_TU_VUNG'), validate(schemas.createWord), AdminController.createWord);
router.post('/words/bulk-import', checkPermission('QUAN_LY_TU_VUNG'), express.text({ type: ['text/csv', 'text/plain'], limit: '5mb' }), AdminController.bulkImportWords);
router.put('/words/:id', checkPermission('QUAN_LY_TU_VUNG'), AdminController.updateWord);
router.delete('/words/:id', checkPermission('QUAN_LY_TU_VUNG'), AdminController.deleteWord);

// Questions
router.post('/questions/bulk-import', checkPermission('QUAN_LY_CAU_HOI'), express.text({ type: ['text/csv', 'text/plain'], limit: '2mb' }), AdminController.bulkImportQuestions);
router.get('/questions/:wordId', checkPermission('QUAN_LY_CAU_HOI'), AdminController.getQuestionsByWord);
router.post('/questions', checkPermission('QUAN_LY_CAU_HOI'), validate(schemas.createQuestion), AdminController.createQuestion);

// Mini Tests
router.get('/minitests', checkPermission('QUAN_LY_BAI_KIEM_TRA'), AdminController.getMiniTests);
router.post('/minitests', checkPermission('QUAN_LY_BAI_KIEM_TRA'), AdminController.createMiniTest);
router.get('/stats', checkPermission('XEM_BANG_DIEU_KHIEN'), AdminController.getStats);

// Students
router.get('/students', checkPermission('QUAN_LY_NGUOI_DUNG'), AdminController.getStudents);
router.post('/students', checkPermission('QUAN_LY_NGUOI_DUNG'), AdminController.createUser);
router.put('/students/:id', checkPermission('QUAN_LY_NGUOI_DUNG'), AdminController.updateUser);
router.delete('/students/:id', checkPermission('QUAN_LY_NGUOI_DUNG'), AdminController.deleteUser);
router.patch('/students/:id/toggle', checkPermission('QUAN_LY_NGUOI_DUNG'), AdminController.toggleStudentStatus);
router.patch('/students/:id/role', checkPermission('QUAN_LY_NGUOI_DUNG'), AdminController.updateUserRole);
router.get('/analytics', checkPermission('XEM_BANG_DIEU_KHIEN'), AdminController.getAnalytics);
router.get('/content-management', checkPermission('XEM_BANG_DIEU_KHIEN'), AdminController.getContentManagement);
router.get('/moderation', checkPermission('XEM_BANG_DIEU_KHIEN'), AdminController.getModeration);
router.get('/system-settings', checkPermission('XEM_BANG_DIEU_KHIEN'), AdminController.getSystemSettings);

// Notifications
router.get('/notifications', checkPermission('QUAN_LY_CAI_DAT_HE_THONG'), AdminController.getNotifications);
router.post('/notifications', checkPermission('QUAN_LY_CAI_DAT_HE_THONG'), AdminController.sendAnnouncement);
router.post('/notifications/daily-reminders', checkPermission('QUAN_LY_CAI_DAT_HE_THONG'), AdminController.createDailyReminders);

module.exports = router;
