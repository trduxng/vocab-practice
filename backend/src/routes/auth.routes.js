// vocab-practice/backend/src/routes/auth.routes.js
const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { validateRegister, validateLogin } = require("../middlewares/validate");

const router = express.Router();

router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);

module.exports = router;
