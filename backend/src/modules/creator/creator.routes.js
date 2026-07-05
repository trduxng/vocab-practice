const express = require('express');
const CreatorController = require('./creator.controller');
const { verifyToken, checkPermission } = require('../../middlewares/auth');
const { upload } = require('../../middlewares/upload');

const router = express.Router();
router.use(verifyToken);

// Dashboard & Analytics
router.get('/dashboard', checkPermission('VIEW_DASHBOARD'), CreatorController.getDashboard);
router.get('/content-summary', checkPermission('VIEW_CONTENT_ANALYTICS'), CreatorController.getContentSummary);
router.get('/academic-analytics', checkPermission('VIEW_CONTENT_ANALYTICS'), CreatorController.getAcademicAnalytics);
router.get('/topics/:id/analytics', checkPermission('VIEW_CONTENT_ANALYTICS'), CreatorController.getTopicAnalytics);
router.get('/mini-tests/:id/analytics', checkPermission('VIEW_CONTENT_ANALYTICS'), CreatorController.getMiniTestAnalytics);

// TopicCategories
router.get('/topic-categories', CreatorController.getTopics); // getTopicCategories

// Topics
router.get('/topics', checkPermission('MANAGE_TOPICS'), CreatorController.getTopics);
router.post('/topics', checkPermission('MANAGE_TOPICS'), CreatorController.createTopic);
router.put('/topics/:id', checkPermission('MANAGE_TOPICS'), CreatorController.updateTopic);
router.delete('/topics/:id', checkPermission('MANAGE_TOPICS'), CreatorController.deleteTopic);
router.post('/topics/:id/submit-review', checkPermission('SUBMIT_CONTENT_REVIEW'), CreatorController.submitTopicForReview);

// Words
router.get('/words', checkPermission('MANAGE_WORDS'), CreatorController.getWords);
router.post('/words', checkPermission('MANAGE_WORDS'), CreatorController.createWord);
router.put('/words/:id', checkPermission('MANAGE_WORDS'), CreatorController.updateWord);
router.delete('/words/:id', checkPermission('MANAGE_WORDS'), CreatorController.deleteWord);
router.post('/words/:id/submit-review', checkPermission('SUBMIT_CONTENT_REVIEW'), CreatorController.submitWordForReview);

// Questions
router.get('/questions', checkPermission('MANAGE_QUESTIONS'), CreatorController.getQuestions);
router.post('/questions', checkPermission('MANAGE_QUESTIONS'), CreatorController.createQuestion);
router.put('/questions/:id', checkPermission('MANAGE_QUESTIONS'), CreatorController.updateQuestion);
router.delete('/questions/:id', checkPermission('MANAGE_QUESTIONS'), CreatorController.deleteQuestion);
router.post('/questions/:id/submit-review', checkPermission('SUBMIT_CONTENT_REVIEW'), CreatorController.submitQuestionForReview);

// MiniTests
router.get('/mini-tests', checkPermission('MANAGE_TESTS'), CreatorController.getMiniTests);
router.post('/mini-tests', checkPermission('MANAGE_TESTS'), CreatorController.createMiniTest);
router.put('/mini-tests/:id', checkPermission('MANAGE_TESTS'), CreatorController.updateMiniTest);
router.delete('/mini-tests/:id', checkPermission('MANAGE_TESTS'), CreatorController.deleteMiniTest);
router.post('/mini-tests/:id/submit-review', checkPermission('SUBMIT_CONTENT_REVIEW'), CreatorController.submitMiniTestForReview);

// Media
router.get('/media', checkPermission('MANAGE_WORDS'), CreatorController.getMedia);
router.post('/media', checkPermission('MANAGE_WORDS'), upload.array('file', 10), CreatorController.uploadMedia);
router.delete('/media/:id', checkPermission('MANAGE_WORDS'), CreatorController.deleteMedia);

module.exports = router;