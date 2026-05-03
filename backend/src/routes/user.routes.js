const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post('/submit-answer', UserController.submitAnswer);
router.get('/flashcards', UserController.getFlashcards);
router.get('/stats', UserController.getStats);

// Mini Tests
router.get('/minitests', UserController.getMiniTests);
router.get('/minitests/:id', UserController.getMiniTestDetails);

router.put('/profile', UserController.updateProfile);

module.exports = router;
