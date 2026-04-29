const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post('/submit-answer', UserController.submitAnswer);
router.get('/flashcards', UserController.getFlashcards);

module.exports = router;
