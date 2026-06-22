// vocab-practice/backend/src/routes/categories.routes.js
const express = require("express");
const CategoriesController = require("../controllers/categories.controller");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/part-of-speeches", CategoriesController.getPartOfSpeeches);

// Authenticated route - yêu cầu token để lấy topics với user progress
router.get("/topics", verifyToken, CategoriesController.getTopics);

module.exports = router;
