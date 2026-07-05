import apiClient from '../lib/api-client';
import type { GamificationProfile, GamificationReward, LearningPathRoadmap, ProgressAnalytics, ReviewFeedback, SubmitAnswerData, TopicWord } from '../modules/user/types';

export const userService = {
  async getDueFlashcards(params?: { topicId?: number | string; mode?: string }) {
    const response = await apiClient.get('/user/flashcards', { params });
    return response.data;
  },

  async getTopicWords(topicId: number | string) {
    const response = await apiClient.get(`/user/topics/${topicId}/words`);
    return (response.data as TopicWord[]).map((word) => ({
      ...word,
      wordId: Number(word.wordId),
      notebookId: word.notebookId ? Number(word.notebookId) : undefined,
      masteryLevel: Number(word.masteryLevel || 0),
      repetitionCount: Number(word.repetitionCount || 0),
      isInNotebook: Boolean(word.isInNotebook),
    }));
  },

  async getStats() {
    const response = await apiClient.get('/user/stats');
    return response.data;
  },

  async getGamificationProfile() {
    const response = await apiClient.get('/user/gamification/profile');
    return response.data as GamificationProfile;
  },

  async completePracticeSession(data: { sessionKey: string; topicId?: number; correctCount: number; totalAttempts: number }) {
    const response = await apiClient.post('/user/gamification/practice-complete', data);
    return response.data as GamificationReward;
  },

  async markAchievementsSeen(achievementIds: number[]) {
    const response = await apiClient.put('/user/gamification/achievements/seen', { achievementIds });
    return response.data;
  },

  async getMasteryTimeline() {
    const response = await apiClient.get('/user/dashboard/mastery-timeline');
    return response.data;
  },

  async getProgressAnalytics() {
    const response = await apiClient.get('/user/progress/analytics');
    return response.data as ProgressAnalytics;
  },

  async getLearningPath() {
    const response = await apiClient.get('/user/learning-path');
    return response.data as LearningPathRoadmap;
  },

  async submitAnswer(data: SubmitAnswerData) {
    const response = await apiClient.post('/user/submit-answer', data);
    return response.data as ReviewFeedback;
  },

  async submitMiniTest(testId: number | string, answers: { questionId?: number; wordId?: number; submittedAnswer: string; isCorrect: boolean }[]) {
    const response = await apiClient.post(`/user/minitests/${testId}/submit`, { answers });
    return response.data;
  },

  async submitReport(data: {
    reportType: 'WordIncorrect' | 'AudioIssue' | 'AnswerIncorrect' | 'Typo' | 'Other';
    entityType?: 'Word' | 'Question' | 'Audio' | 'General';
    wordId?: number;
    questionId?: number;
    title?: string;
    description: string;
  }) {
    const response = await apiClient.post('/user/reports', data);
    return response.data;
  },

  async getMiniTests(page = 1, pageSize = 20, search = "") {
    const response = await apiClient.get('/user/minitests', { params: { page, pageSize, search } });
    return response.data;
  },

  async getTestHistory(page = 1, pageSize = 20) {
    const response = await apiClient.get('/user/minitests/history', { params: { page, pageSize } });
    return response.data;
  },

  async getTestSessionDetails(testId: number, date: string) {
    const response = await apiClient.get(`/user/minitests/session-details?testId=${testId}&date=${date}`);
    return response.data;
  },

  async getMiniTestDetails(id: string) {
    const response = await apiClient.get(`/user/minitests/${id}`);
    return response.data;
  },

  async getMyMiniTestAttempts(id: string) {
    const response = await apiClient.get(`/user/minitests/${id}/my-attempts`);
    return response.data as { attemptCount: number; bestScore: number };
  },

  async updateProfile(data: unknown) {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  async changePassword(data: unknown) {
    const response = await apiClient.post('/user/change-password', data);
    return response.data;
  },

  // =============== CALENDAR HEATMAP ===============
  async getActivityHeatmap(year?: number) {
    const response = await apiClient.get('/user/activity/heatmap', {
      params: { year: year || new Date().getFullYear() }
    });
    return response.data;
  },

  // =============== DAILY GOAL ===============
  async getDailyProgress() {
    const response = await apiClient.get('/user/goals/daily-progress');
    return response.data;
  },

  async getDailyGoalSetting() {
    const response = await apiClient.get('/user/goals/daily-goal');
    return response.data;
  },

  async updateDailyGoal(dailyGoal: number) {
    const response = await apiClient.put('/user/goals/daily-goal', { dailyGoal });
    return response.data;
  },

  async updateSRSConfig(srsReviewLimit: number) {
    const response = await apiClient.put('/user/goals/srs-config', { srsReviewLimit });
    return response.data;
  },

  // =============== PRACTICE QUEUE (merged) ===============
  async getPracticeQueue(params?: { limit?: number; topicId?: number | string }) {
    const response = await apiClient.get('/user/practice-queue', { params });
    return response.data;
  },

  // =============== SMART REVIEW QUEUE ===============
  async getSmartReviewQueue(limit?: number) {
    const response = await apiClient.get('/user/review/smart-queue', {
      params: { limit: limit || 20 }
    });
    return response.data;
  },

  // =============== SESSION SUMMARY ===============
  async getSessionSummary() {
    const response = await apiClient.get('/user/review/session-summary');
    return response.data;
  },

  // =============== MISTAKE REVIEW QUEUE ===============
  async getMistakeReviewQueue(limit?: number) {
    const response = await apiClient.get('/user/review/mistakes', {
      params: { limit: limit || 10 }
    });
    return response.data;
  },

  // =============== VOCABULARY NOTEBOOK ===============
  async getNotebook(page = 1, pageSize = 20) {
    const response = await apiClient.get('/user/notebook', {
      params: { page, pageSize }
    });
    return response.data;
  },

  async addNotebookEntry(wordId: number, personalNote?: string) {
    const response = await apiClient.post('/user/notebook', { wordId, personalNote });
    return response.data;
  },

  async updateNotebookEntry(notebookId: number, data: { personalNote?: string; isFavorite?: boolean }) {
    const response = await apiClient.put(`/user/notebook/${notebookId}`, data);
    return response.data;
  },

  async deleteNotebookEntry(notebookId: number) {
    const response = await apiClient.delete(`/user/notebook/${notebookId}`);
    return response.data;
  },

  async checkNotebookEntry(wordId: number) {
    const response = await apiClient.get(`/user/notebook/check?wordId=${wordId}`);
    return response.data;
  },

  // =============== NOTIFICATIONS ===============
  async getNotifications(limit = 50) {
    const response = await apiClient.get('/user/notifications', { params: { limit } });
    return response.data as {
      notifications: Array<{
        id: number;
        title: string;
        message: string;
        type: string;
        channel: string;
        isRead: boolean;
        actionUrl: string | null;
        createdAt: string;
      }>;
      unreadCount: number;
      total: number;
    };
  },

  async markNotificationRead(id: number) {
    const response = await apiClient.put(`/user/notifications/${id}/read`);
    return response.data;
  },

  async markAllNotificationsRead() {
    const response = await apiClient.put('/user/notifications/read-all');
    return response.data;
  },
};
