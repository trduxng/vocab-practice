const express = require("express");
const UserController = require("../controllers/user.controller");
const GamificationController = require("../controllers/gamification.controller");
const LearningPathController = require("../controllers/learning-path.controller");
const authMiddleware = require("../middlewares/auth");
const { validate, schemas } = require("../middlewares/validate");

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post("/submit-answer", UserController.submitAnswer);
router.get("/flashcards", UserController.getFlashcards);
router.get("/stats", UserController.getStats);
router.get("/gamification/profile", GamificationController.getProfile);
router.post("/gamification/practice-complete", GamificationController.completePractice);
router.put("/gamification/achievements/seen", GamificationController.markAchievementsSeen);
router.get("/dashboard/mastery-timeline", UserController.getMasteryTimeline);
router.get("/learning-path", LearningPathController.getRoadmap);
router.get("/topics/:topicId/words", UserController.getTopicWords);

// Mini Tests
router.get("/minitests", UserController.getMiniTests);
router.get("/minitests/history", UserController.getTestHistory);
router.get("/minitests/session-details", UserController.getTestSessionDetails);
router.get("/minitests/:id", UserController.getMiniTestDetails);

router.put("/profile", UserController.updateProfile);
// Batch submit minitest answers
router.post("/minitests/:id/submit", UserController.submitMiniTest);

router.post(
  "/reports",
  validate(schemas.createReport),
  UserController.createReport,
);

// Calendar Heatmap
router.get("/activity/heatmap", UserController.getActivityHeatmap);
router.get("/progress/analytics", UserController.getProgressAnalytics);

// Daily Goal Progress
router.get("/goals/daily-progress", UserController.getDailyProgress);

// Daily Goal
router.get("/goals/daily-goal", UserController.getDailyGoal);
router.put("/goals/daily-goal", UserController.updateDailyGoal);

// SRS Config
router.put("/goals/srs-config", UserController.updateSRSConfig);

// Smart Review Queue
router.get("/review/smart-queue", UserController.getSmartReviewQueue);

// Notifications
router.get("/notifications", UserController.getNotifications);
router.put("/notifications/:id/read", UserController.markNotificationRead);
router.put("/notifications/read-all", UserController.markAllNotificationsRead);

// Session Summary
router.get("/review/session-summary", UserController.getSessionSummary);

// Mistake Review Queue
router.get("/review/mistakes", UserController.getMistakeReviewQueue);

// Vocabulary Notebook
router.get("/notebook", UserController.getNotebook);
router.get("/notebook/check", UserController.checkNotebookEntry);
router.post("/notebook", UserController.addNotebookEntry);
router.put("/notebook/:id", UserController.updateNotebookEntry);
router.delete("/notebook/:id", UserController.deleteNotebookEntry);

module.exports = router;
