const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post('/submit-answer', UserController.submitAnswer);
router.get('/flashcards', UserController.getFlashcards);
router.get('/stats', UserController.getStats);
router.get('/dashboard/mastery-timeline', UserController.getMasteryTimeline);
router.get('/topics/:topicId/words', UserController.getTopicWords);

// Mini Tests
router.get('/minitests', UserController.getMiniTests);
router.get('/minitests/history', UserController.getTestHistory);
router.get('/minitests/session-details', UserController.getTestSessionDetails);
router.get('/minitests/:id', UserController.getMiniTestDetails);

router.put('/profile', UserController.updateProfile);
router.post('/reports', validate(schemas.createReport), UserController.createReport);

module.exports = router;
