const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validate');

const router = express.Router();

router.post('/register', validate(schemas.register), AuthController.register);
router.post('/login', validate(schemas.login), AuthController.login);

module.exports = router;
