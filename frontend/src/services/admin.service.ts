import apiClient from '../lib/api-client';

export interface UserMutationPayload {
  fullName: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Learner' | 'ContentCreator';
  isActive: boolean;
}

export const adminService = {
  async getWords(page = 1, limit = 20) {
    const response = await apiClient.get('/admin/words', { params: { page, limit } });
    return response.data;
  },

  async createWord(data: unknown) {
    const response = await apiClient.post('/admin/words', data);
    return response.data;
  },

  async updateWord(id: number, data: unknown) {
    const response = await apiClient.put(`/admin/words/${id}`, data);
    return response.data;
  },

  async deleteWord(id: number) {
    const response = await apiClient.delete(`/admin/words/${id}`);
    return response.data;
  },

  async bulkImportWords(data: unknown[] | string) {
    const isCsv = typeof data === 'string';
    const response = await apiClient.post(
      '/admin/words/bulk-import',
      isCsv ? data : { words: data },
      isCsv ? { headers: { 'Content-Type': 'text/csv' } } : undefined
    );
    return response.data;
  },

  async getQuestionsByWord(wordId: number) {
    const response = await apiClient.get(`/admin/questions/${wordId}`);
    return response.data;
  },

  async createQuestion(data: unknown) {
    const response = await apiClient.post('/admin/questions', data);
    return response.data;
  },

  async bulkImportQuestions(csv: string) {
    const response = await apiClient.post('/admin/questions/bulk-import', csv, {
      headers: { 'Content-Type': 'text/csv' },
    });
    return response.data;
  },

  async getMiniTests() {
    const response = await apiClient.get('/admin/minitests');
    return response.data;
  },

  async createMiniTest(data: unknown) {
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

  async createStudent(data: UserMutationPayload) {
    const response = await apiClient.post('/admin/students', data);
    return response.data;
  },

  async updateStudent(id: number | string, data: UserMutationPayload) {
    const response = await apiClient.put(`/admin/students/${id}`, data);
    return response.data;
  },

  async deleteStudent(id: number | string) {
    const response = await apiClient.delete(`/admin/students/${id}`);
    return response.data;
  },

  async toggleStudentStatus(id: number | string) {
    const response = await apiClient.patch(`/admin/students/${id}/toggle`);
    return response.data;
  },

  async updateStudentRole(id: number | string, role: 'Admin' | 'Learner' | 'ContentCreator') {
    const response = await apiClient.patch(`/admin/students/${id}/role`, { role });
    return response.data;
  },

  async getAnalytics() {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },

  async getContentManagement() {
    const response = await apiClient.get('/admin/content-management');
    return response.data;
  },

  async getModeration() {
    const response = await apiClient.get('/admin/moderation');
    return response.data;
  },

  async getSystemSettings() {
    const response = await apiClient.get('/admin/system-settings');
    return response.data;
  },

  async getNotifications(limit = 50) {
    const response = await apiClient.get('/admin/notifications', { params: { limit } });
    return response.data;
  },

  async sendAnnouncement(data: unknown) {
    const response = await apiClient.post('/admin/notifications', data);
    return response.data;
  },

  async createDailyReminders() {
    const response = await apiClient.post('/admin/notifications/daily-reminders');
    return response.data;
  }
};
