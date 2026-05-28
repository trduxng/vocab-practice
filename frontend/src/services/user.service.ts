import apiClient from '../lib/api-client';

export const userService = {
  async getDueFlashcards(params?: { topicId?: number | string; mode?: string }) {
    const response = await apiClient.get('/user/flashcards', { params });
    return response.data;
  },

  async getTopicWords(topicId: number | string) {
    const response = await apiClient.get(`/user/topics/${topicId}/words`);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/user/stats');
    return response.data;
  },

  async getMasteryTimeline() {
    const response = await apiClient.get('/user/dashboard/mastery-timeline');
    return response.data;
  },

  async submitAnswer(data: unknown) {
    const response = await apiClient.post('/user/submit-answer', data);
    return response.data;
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

  async getMiniTests(page = 1, pageSize = 20) {
    const response = await apiClient.get('/user/minitests', { params: { page, pageSize } });
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

  async updateProfile(data: unknown) {
    const response = await apiClient.put('/user/profile', data);
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

  // =============== SMART REVIEW QUEUE ===============
  async getSmartReviewQueue(limit?: number) {
    const response = await apiClient.get('/user/review/smart-queue', {
      params: { limit: limit || 20 }
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
};
