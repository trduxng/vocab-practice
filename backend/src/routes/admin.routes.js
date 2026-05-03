const express = require('express');
const AdminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.use(verifyToken, verifyAdmin);

// Words
router.get('/words', AdminController.getWords);
router.post('/words', validate(schemas.createWord), AdminController.createWord);
router.put('/words/:id', AdminController.updateWord);
router.delete('/words/:id', AdminController.deleteWord);

// Questions
router.get('/questions/:wordId', AdminController.getQuestionsByWord);
router.post('/questions', validate(schemas.createQuestion), AdminController.createQuestion);

// Mini Tests
router.get('/minitests', AdminController.getMiniTests);
router.post('/minitests', AdminController.createMiniTest);
router.get('/stats', AdminController.getStats);

// Students
router.get('/students', AdminController.getStudents);
router.patch('/students/:id/toggle', AdminController.toggleStudentStatus);
router.get('/analytics', AdminController.getAnalytics);

module.exports = router;
