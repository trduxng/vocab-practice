import apiClient from '../lib/api-client';

export const userService = {
  async getDueFlashcards() {
    const response = await apiClient.get('/user/flashcards');
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/user/stats');
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

  async getMiniTestDetails(id: string) {
    const response = await apiClient.get(`/user/minitests/${id}`);
    return response.data;
  }
};
