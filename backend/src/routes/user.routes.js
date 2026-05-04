// vocab-practice/backend/src/routes/user.routes.js
const express = require("express");
const UserController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth");
const { validateSubmitAnswer } = require("../middlewares/validate");

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post(
  "/submit-answer",
  validateSubmitAnswer,
  UserController.submitAnswer,
);
router.get("/flashcards", UserController.getFlashcards);

module.exports = router;
