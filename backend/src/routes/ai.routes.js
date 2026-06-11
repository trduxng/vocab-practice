const express = require('express');
const AiController = require('../controllers/ai.controller');
const { verifyToken, checkAnyPermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.use(verifyToken);

router.post(
  '/word-suggestions',
  checkAnyPermission(['MANAGE_WORDS', 'MANAGE_QUESTIONS']),
  validate(schemas.aiWordSuggestion),
  AiController.suggestWordContent
);

module.exports = router;
