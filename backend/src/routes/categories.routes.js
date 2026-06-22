// vocab-practice/backend/src/routes/categories.routes.js
const express = require("express");
const CategoriesController = require("../controllers/categories.controller");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

// Public routes - không yêu cầu đăng nhập
router.get("/part-of-speeches", CategoriesController.getPartOfSpeeches);
router.get("/topics", CategoriesController.getTopics);

// Authenticated routes - yêu cầu token
router.get("/topics/enrolled", verifyToken, CategoriesController.getTopics);

module.exports = router;
