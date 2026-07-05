const express = require('express');

const { checkPermission } = require('../../../middlewares/auth.js');
const { schemas, validate } = require('../validate.ts');
const MiniTestController = require('../controllers/mini-tests.controller.ts');

const router = express.Router();

router.get('/minitests', checkPermission('MANAGE_TESTS'), MiniTestController.getMiniTests);
router.post('/minitests', checkPermission('MANAGE_TESTS'), validate(schemas.miniTest), MiniTestController.createMiniTest);
router.put('/minitests/:id', checkPermission('MANAGE_TESTS'), validate(schemas.miniTest), MiniTestController.updateMiniTest);
router.delete('/minitests/:id', checkPermission('MANAGE_TESTS'), MiniTestController.deleteMiniTest);
router.patch('/minitests/:id/publish', checkPermission('MANAGE_TESTS'), MiniTestController.publishMiniTest);
router.patch('/minitests/:id/archive', checkPermission('MANAGE_TESTS'), MiniTestController.archiveMiniTest);

module.exports = router;
