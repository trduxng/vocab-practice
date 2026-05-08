const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post('/submit-answer', UserController.submitAnswer);
router.get('/flashcards', UserController.getFlashcards);
router.get('/stats', UserController.getStats);
router.get('/dashboard/mastery-timeline', UserController.getMasteryTimeline);

// Mini Tests
router.get('/minitests', UserController.getMiniTests);
router.get('/minitests/history', UserController.getTestHistory);
router.get('/minitests/session-details', UserController.getTestSessionDetails);
router.get('/minitests/:id', UserController.getMiniTestDetails);

router.put('/profile', UserController.updateProfile);

module.exports = router;
