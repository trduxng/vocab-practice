const express = require('express');
const CreatorController = require('../controllers/creator.controller');
const { verifyToken, checkPermission, checkAnyPermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.use(verifyToken);

// Dashboard & Analytics
router.get('/dashboard', checkPermission('VIEW_DASHBOARD'), CreatorController.getDashboard);
router.get('/content-summary', checkPermission('VIEW_CONTENT_ANALYTICS'), CreatorController.getContentSummary);
router.get('/topics/:id/analytics', checkPermission('VIEW_CONTENT_ANALYTICS'), CreatorController.getTopicAnalytics);
router.get('/mini-tests/:id/analytics', checkPermission('VIEW_CONTENT_ANALYTICS'), CreatorController.getMiniTestAnalytics);

// TopicCategories (Read-only for Creator, serves dropdown)
router.get('/topic-categories', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_TESTS']), CreatorController.getTopicCategories);

// Topics
router.get('/topics', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_TESTS', 'SUBMIT_CONTENT_REVIEW']), CreatorController.getTopics);
router.post('/topics', checkPermission('MANAGE_TOPICS'), validate(schemas.creatorTopic), CreatorController.createTopic);
router.put('/topics/:id', checkPermission('MANAGE_TOPICS'), validate(schemas.creatorTopic), CreatorController.updateTopic);
router.delete('/topics/:id', checkPermission('MANAGE_TOPICS'), CreatorController.deleteTopic);
router.post('/topics/:id/submit-review', checkPermission('SUBMIT_CONTENT_REVIEW'), CreatorController.submitTopicForReview);

// Words
router.get('/words', checkAnyPermission(['MANAGE_WORDS', 'MANAGE_QUESTIONS', 'SUBMIT_CONTENT_REVIEW']), CreatorController.getWords);
router.post('/words', checkPermission('MANAGE_WORDS'), validate(schemas.creatorWord), CreatorController.createWord);
router.put('/words/:id', checkPermission('MANAGE_WORDS'), validate(schemas.creatorWord), CreatorController.updateWord);
router.delete('/words/:id', checkPermission('MANAGE_WORDS'), CreatorController.deleteWord);
router.post('/words/:id/submit-review', checkPermission('SUBMIT_CONTENT_REVIEW'), CreatorController.submitWordForReview);

// Questions
router.get('/questions', checkAnyPermission(['MANAGE_QUESTIONS', 'MANAGE_TESTS', 'SUBMIT_CONTENT_REVIEW']), CreatorController.getQuestions);
router.post('/questions', checkPermission('MANAGE_QUESTIONS'), validate(schemas.creatorQuestion), CreatorController.createQuestion);
router.put('/questions/:id', checkPermission('MANAGE_QUESTIONS'), validate(schemas.creatorQuestion), CreatorController.updateQuestion);
router.delete('/questions/:id', checkPermission('MANAGE_QUESTIONS'), CreatorController.deleteQuestion);
router.post('/questions/:id/submit-review', checkPermission('SUBMIT_CONTENT_REVIEW'), CreatorController.submitQuestionForReview);

// MiniTests
router.get('/mini-tests', checkAnyPermission(['MANAGE_TESTS', 'SUBMIT_CONTENT_REVIEW']), CreatorController.getMiniTests);
router.post('/mini-tests', checkPermission('MANAGE_TESTS'), validate(schemas.creatorMiniTest), CreatorController.createMiniTest);
router.put('/mini-tests/:id', checkPermission('MANAGE_TESTS'), validate(schemas.creatorMiniTest), CreatorController.updateMiniTest);
router.delete('/mini-tests/:id', checkPermission('MANAGE_TESTS'), CreatorController.deleteMiniTest);
router.post('/mini-tests/:id/items', checkPermission('MANAGE_TESTS'), validate(schemas.creatorMiniTestItem), CreatorController.addMiniTestItem);
router.delete('/mini-tests/:id/items/:questionId', checkPermission('MANAGE_TESTS'), CreatorController.removeMiniTestItem);
router.post('/mini-tests/:id/submit-review', checkPermission('SUBMIT_CONTENT_REVIEW'), CreatorController.submitMiniTestForReview);

// Media metadata (file storage is provided externally; Creator registers owned asset URLs)
router.get('/media', checkAnyPermission(['MANAGE_WORDS', 'MANAGE_QUESTIONS']), CreatorController.getMedia);
router.post('/media', checkAnyPermission(['MANAGE_WORDS', 'MANAGE_QUESTIONS']), validate(schemas.creatorMedia), CreatorController.createMedia);
router.delete('/media/:id', checkAnyPermission(['MANAGE_WORDS', 'MANAGE_QUESTIONS']), CreatorController.deleteMedia);

module.exports = router;
