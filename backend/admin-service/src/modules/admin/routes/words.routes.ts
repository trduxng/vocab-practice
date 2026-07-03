import express from 'express';

import { checkPermission } from '../../../middlewares/auth.ts';
import { schemas, validate } from '../../../middlewares/validate.ts';
import WordController from '../controllers/words.controller.ts';

const router = express.Router();
const csvBodyParser = express.text({ type: ['text/csv', 'text/plain'], limit: '5mb' });

router.get('/words', checkPermission('MANAGE_WORDS'), WordController.getWords);
router.post('/words', checkPermission('MANAGE_WORDS'), validate(schemas.createWord), WordController.createWord);
router.post('/words/import-preview', checkPermission('MANAGE_WORDS'), csvBodyParser, WordController.previewWordImport);
router.post('/words/bulk-import', checkPermission('MANAGE_WORDS'), csvBodyParser, WordController.bulkImportWords);
router.get('/words/:id', checkPermission('MANAGE_WORDS'), WordController.getWordDetail);
router.put('/words/:id', checkPermission('MANAGE_WORDS'), validate(schemas.createWord), WordController.updateWord);
router.delete('/words/:id/hard', checkPermission('MANAGE_SYSTEM_SETTINGS'), WordController.hardDeleteWord);
router.delete('/words/:id', checkPermission('MANAGE_WORDS'), WordController.deleteWord);

export default router;
