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

  async createQuestion(data: any) {
    const response = await apiClient.post('/admin/questions', data);
    return response.data;
  }
};
