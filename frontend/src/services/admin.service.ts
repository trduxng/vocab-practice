import apiClient from '../lib/api-client';

export const adminService = {
  async getWords(page = 1, limit = 20) {
    const response = await apiClient.get('/admin/words', { params: { page, limit } });
    return response.data;
  },

  async createWord(data: any) {
    const response = await apiClient.post('/admin/words', data);
    return response.data;
  },

  async updateWord(id: number, data: any) {
    const response = await apiClient.put(`/admin/words/${id}`, data);
    return response.data;
  },

  async deleteWord(id: number) {
    const response = await apiClient.delete(`/admin/words/${id}`);
    return response.data;
  },

  async getQuestionsByWord(wordId: number) {
    const response = await apiClient.get(`/admin/questions/${wordId}`);
    return response.data;
  },

  async createQuestion(data: any) {
    const response = await apiClient.post('/admin/questions', data);
    return response.data;
  },

  async getMiniTests() {
    const response = await apiClient.get('/admin/minitests');
    return response.data;
  },

  async createMiniTest(data: any) {
    const response = await apiClient.post('/admin/minitests', data);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  async getStudents() {
    const response = await apiClient.get('/admin/students');
    return response.data;
  },

  async toggleStudentStatus(id: number | string) {
    const response = await apiClient.patch(`/admin/students/${id}/toggle`);
    return response.data;
  },

  async updateStudentRole(id: number | string, role: 'Admin' | 'Learner') {
    const response = await apiClient.patch(`/admin/students/${id}/role`, { role });
    return response.data;
  },

  async getAnalytics() {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  }
};
