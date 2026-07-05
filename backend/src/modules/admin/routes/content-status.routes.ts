const express = require('express');

const { checkAnyPermission } = require('../../../middlewares/auth.js');
const { schemas, validate } = require('../validate.ts');
const ContentStatusController = require('../controllers/content-status.controller.ts');

const router = express.Router();

router.patch(
  '/content-status',
  checkAnyPermission(['MANAGE_SYSTEM_SETTINGS', 'MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_QUESTIONS', 'MANAGE_TESTS']),
  validate(schemas.contentStatus),
  ContentStatusController.updateContentStatus
);

module.exports = router;
