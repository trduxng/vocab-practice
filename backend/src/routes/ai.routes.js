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

router.post(
  '/topic-suggestions',
  checkAnyPermission(['MANAGE_TOPICS']),
  validate(schemas.aiTopicSuggestion),
  AiController.suggestTopicContent
);

router.post(
  '/question-suggestions',
  checkAnyPermission(['MANAGE_QUESTIONS']),
  validate(schemas.aiQuestionSuggestion),
  AiController.suggestQuestionContent
);

router.post(
  '/translate',
  checkAnyPermission(['MANAGE_WORDS', 'MANAGE_TOPICS', 'MANAGE_QUESTIONS']),
  validate(schemas.aiTranslate),
  AiController.translate
);

router.post(
  '/dictionary',
  checkAnyPermission(['MANAGE_WORDS', 'MANAGE_QUESTIONS']),
  validate(schemas.aiDictionary),
  AiController.dictionary
);

router.post(
  '/mini-test-suggestions',
  checkAnyPermission(['MANAGE_TESTS']),
  validate(schemas.aiMiniTestSuggestion),
  AiController.suggestMiniTestContent
);

module.exports = router;
