const express = require('express');
const AdminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(verifyToken, verifyAdmin);

// Words
router.get('/words', AdminController.getWords);
router.post('/words', AdminController.createWord);
router.put('/words/:id', AdminController.updateWord);

// Questions
router.post('/questions', AdminController.createQuestion);

// Mini Tests
router.get('/minitests', AdminController.getMiniTests);
router.post('/minitests', AdminController.createMiniTest);
router.get('/stats', AdminController.getStats);

module.exports = router;
