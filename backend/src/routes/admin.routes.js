// vocab-practice/backend/src/routes/admin.routes.js
const express = require("express");
const AdminController = require("../controllers/admin.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/auth");
const { validateCreateWord } = require("../middlewares/validate");

const router = express.Router();

router.use(verifyToken, verifyAdmin);

// Words
router.get("/words", AdminController.getWords);
router.post("/words", validateCreateWord, AdminController.createWord);
router.put("/words/:id", AdminController.updateWord);

// Questions
router.post("/questions", AdminController.createQuestion);

// Dashboard APIs (thêm mới)
router.get("/overview-stats", AdminController.getOverviewStats);
router.get("/weekly-activity", AdminController.getWeeklyActivity);
router.get("/today-activity", AdminController.getTodayActivity);
router.get("/recent-users", AdminController.getRecentUsers);
router.get("/top-courses", AdminController.getTopCourses);

module.exports = router;
