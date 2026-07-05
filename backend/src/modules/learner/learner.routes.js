const express = require("express");
const LearnerController = require("./learner.controller");
const authMiddleware = require("../../middlewares/auth");
const { validate, schemas } = require("../../shared/validations");

const router = express.Router();
router.use(authMiddleware.verifyToken);

// Flashcard & Review
router.post("/submit-answer", LearnerController.submitAnswer);
router.get("/flashcards", LearnerController.getFlashcards);
router.get("/stats", LearnerController.getStats);
router.get("/topics/:topicId/words", LearnerController.getTopicWords);

// Gamification
router.get("/gamification/profile", LearnerController.getGamificationProfile);
router.post("/gamification/practice-complete", LearnerController.completePractice);
router.put("/gamification/achievements/seen", LearnerController.markAchievementsSeen);

// Learning Path
router.get("/learning-path", LearnerController.getRoadmap);

// Dashboard
router.get("/dashboard/mastery-timeline", LearnerController.getMasteryTimeline);
router.get("/activity/heatmap", LearnerController.getActivityHeatmap);
router.get("/progress/analytics", LearnerController.getProgressAnalytics);
router.get("/goals/daily-progress", LearnerController.getDailyProgress);

// Mini Tests
router.get("/minitests", LearnerController.getMiniTests);
router.get("/minitests/history", LearnerController.getTestHistory);
router.get("/minitests/session-details", LearnerController.getTestSessionDetails);
router.get("/minitests/:id", LearnerController.getMiniTestDetails);
router.get("/minitests/:id/my-attempts", LearnerController.getMyMiniTestAttempts);
router.post("/minitests/:id/submit", LearnerController.submitMiniTest);

// Profile
router.put("/profile", LearnerController.updateProfile);
router.post("/change-password", LearnerController.changePassword);

// Reports
router.post("/reports", validate(schemas.createReport), LearnerController.createReport);

// Daily Goal & SRS Config
router.get("/goals/daily-goal", LearnerController.getDailyGoal);
router.put("/goals/daily-goal", LearnerController.updateDailyGoal);
router.put("/goals/srs-config", LearnerController.updateSRSConfig);

// Practice Queue (merged)
router.get("/practice-queue", LearnerController.getPracticeQueue);

// Smart Review Queue
router.get("/review/smart-queue", LearnerController.getSmartReviewQueue);
router.get("/review/session-summary", LearnerController.getSessionSummary);
router.get("/review/mistakes", LearnerController.getMistakeReviewQueue);

// Notifications
router.get("/notifications", LearnerController.getNotifications);
router.put("/notifications/:id/read", LearnerController.markNotificationRead);
router.put("/notifications/read-all", LearnerController.markAllNotificationsRead);

// Vocabulary Notebook
router.get("/notebook", LearnerController.getNotebook);
router.get("/notebook/check", LearnerController.checkNotebookEntry);
router.post("/notebook", LearnerController.addNotebookEntry);
router.put("/notebook/:id", LearnerController.updateNotebookEntry);
router.delete("/notebook/:id", LearnerController.deleteNotebookEntry);

module.exports = router;
