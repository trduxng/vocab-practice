const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validate');
const rateLimiter = require('../middlewares/rateLimiter');

const authLimiter = rateLimiter({ maxRequests: 10, windowMs: 15 * 60 * 1000, message: 'Quá nhiều lần đăng nhập/đăng ký, vui lòng thử lại sau 15 phút' });

const router = express.Router();

router.post('/register', authLimiter, validate(schemas.register), AuthController.register);
router.post('/login', authLimiter, validate(schemas.login), AuthController.login);

module.exports = router;
