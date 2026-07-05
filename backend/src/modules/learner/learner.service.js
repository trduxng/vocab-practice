/**
 * LearnerService — Facade pattern
 * Re-exports methods from sub-services so existing controller imports still work.
 * New code should import directly from the specific sub-service.
 */
const FlashcardService = require("./flashcard.service");
const ProfileService = require("./profile.service");
const NotebookService = require("./notebook.service");
const NotificationService = require("./notification.service");
const ReportService = require("./report.service");

const LearnerService = {
  // ── Flashcard / SRS ──
  getDueFlashcards: FlashcardService.getDueFlashcards.bind(FlashcardService),
  getTopicWords: FlashcardService.getTopicWords.bind(FlashcardService),
  submitAnswer: FlashcardService.submitAnswer.bind(FlashcardService),
  submitWordReview: FlashcardService.submitWordReview.bind(FlashcardService),
  getSmartReviewQueue: FlashcardService.getSmartReviewQueue.bind(FlashcardService),
  getMistakeReviewQueue: FlashcardService.getMistakeReviewQueue.bind(FlashcardService),
  getMiniTests: FlashcardService.getMiniTests.bind(FlashcardService),
  getMiniTestDetails: FlashcardService.getMiniTestDetails.bind(FlashcardService),
  getTestHistory: FlashcardService.getTestHistory.bind(FlashcardService),
  getTestSessionDetails: FlashcardService.getTestSessionDetails.bind(FlashcardService),
  submitMiniTestBatch: FlashcardService.submitMiniTestBatch.bind(FlashcardService),

  // ── Profile / Stats / Goals ──
  getUserStats: ProfileService.getUserStats.bind(ProfileService),
  getMasteryTimeline: ProfileService.getMasteryTimeline.bind(ProfileService),
  getActivityHeatmap: ProfileService.getActivityHeatmap.bind(ProfileService),
  getProgressAnalytics: ProfileService.getProgressAnalytics.bind(ProfileService),
  getDailyProgress: ProfileService.getDailyProgress.bind(ProfileService),
  getSessionSummary: ProfileService.getSessionSummary.bind(ProfileService),
  updateProfile: ProfileService.updateProfile.bind(ProfileService),
  changePassword: ProfileService.changePassword.bind(ProfileService),
  getDailyGoal: ProfileService.getDailyGoal.bind(ProfileService),
  updateDailyGoal: ProfileService.updateDailyGoal.bind(ProfileService),
  updateSRSReviewLimit: ProfileService.updateSRSReviewLimit.bind(ProfileService),

  // ── Notebook ──
  getNotebook: NotebookService.getNotebook.bind(NotebookService),
  addNotebookEntry: NotebookService.addNotebookEntry.bind(NotebookService),
  updateNotebookEntry: NotebookService.updateNotebookEntry.bind(NotebookService),
  deleteNotebookEntry: NotebookService.deleteNotebookEntry.bind(NotebookService),
  checkNotebookEntry: NotebookService.checkNotebookEntry.bind(NotebookService),

  // ── Notification ──
  getUserNotifications: NotificationService.getUserNotifications.bind(NotificationService),
  markNotificationRead: NotificationService.markNotificationRead.bind(NotificationService),
  markAllNotificationsRead: NotificationService.markAllNotificationsRead.bind(NotificationService),

  // ── Report ──
  createReport: (userId, reportData) => ReportService.createReport(userId, reportData),
};

module.exports = LearnerService;
