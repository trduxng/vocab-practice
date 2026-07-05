const express = require('express');
const AuthController = require('./auth.controller');
const { validate } = require('../../shared/validations');
const authSchemas = require('./auth.schema');
const rateLimiter = require('../../middlewares/rateLimiter');

const authLimiter = rateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Quá nhiều lần đăng nhập/đăng ký, vui lòng thử lại sau 15 phút'
});

const router = express.Router();

router.post('/register', authLimiter, validate(authSchemas.register), AuthController.register);
router.post('/login', authLimiter, validate(authSchemas.login), AuthController.login);

module.exports = router;
