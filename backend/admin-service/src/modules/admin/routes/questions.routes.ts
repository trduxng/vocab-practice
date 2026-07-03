import express from 'express';

import { checkPermission } from '../../../middlewares/auth.ts';
import { schemas, validate } from '../../../middlewares/validate.ts';
import QuestionController from '../controllers/questions.controller.ts';

const router = express.Router();

router.post('/questions/bulk-import', checkPermission('MANAGE_QUESTIONS'), express.text({ type: ['text/csv', 'text/plain'], limit: '2mb' }), QuestionController.bulkImportQuestions);
router.get('/questions/:wordId', checkPermission('MANAGE_QUESTIONS'), QuestionController.getQuestionsByWord);
router.post('/questions', checkPermission('MANAGE_QUESTIONS'), validate(schemas.createQuestion), QuestionController.createQuestion);
router.put('/questions/:id', checkPermission('MANAGE_QUESTIONS'), validate(schemas.createQuestion), QuestionController.updateQuestion);
router.delete('/questions/:id', checkPermission('MANAGE_QUESTIONS'), QuestionController.deleteQuestion);

export default router;
