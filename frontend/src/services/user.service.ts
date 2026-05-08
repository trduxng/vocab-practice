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

  async submitAnswer(data: any) {
    const response = await apiClient.post('/user/submit-answer', data);
    return response.data;
  },

  async getMiniTests() {
    const response = await apiClient.get('/user/minitests');
    return response.data;
  },

  async getTestHistory() {
    const response = await apiClient.get('/user/minitests/history');
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

  async updateProfile(data: any) {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  }
};
