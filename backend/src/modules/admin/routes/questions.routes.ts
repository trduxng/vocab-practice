const express = require('express');

const { checkPermission } = require('../../../middlewares/auth.js');
const { schemas, validate } = require('../validate.ts');
const QuestionController = require('../controllers/questions.controller.ts');

const router = express.Router();

router.post('/questions/bulk-import', checkPermission('MANAGE_QUESTIONS'), express.text({ type: ['text/csv', 'text/plain'], limit: '2mb' }), QuestionController.bulkImportQuestions);
router.get('/questions/:wordId', checkPermission('MANAGE_QUESTIONS'), QuestionController.getQuestionsByWord);
router.post('/questions', checkPermission('MANAGE_QUESTIONS'), validate(schemas.createQuestion), QuestionController.createQuestion);
router.put('/questions/:id', checkPermission('MANAGE_QUESTIONS'), validate(schemas.createQuestion), QuestionController.updateQuestion);
router.delete('/questions/:id', checkPermission('MANAGE_QUESTIONS'), QuestionController.deleteQuestion);

module.exports = router;
