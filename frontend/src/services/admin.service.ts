import apiClient from '../lib/api-client';

export interface UserMutationPayload {
  fullName: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Learner' | 'ContentCreator';
  isActive: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface AdminTopicPayload {
  name: string;
  code?: string;
  description?: string;
  topicCategoryId?: number | null;
  status?: 'Draft' | 'PendingReview' | 'Published' | 'Rejected' | 'Archived';
}

export interface AdminTopicCategoryPayload {
  name: string;
  code?: string;
  description?: string;
  iconUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

function unwrapItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items;
}

export const adminService = {
  async getTopicsPage<T = unknown>(page = 1, limit = 50, filters: { search?: string; status?: string; categoryId?: number | string } = {}) {
    const response = await apiClient.get('/admin/topics', {
      params: {
        page,
        limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        categoryId: filters.categoryId || undefined,
      }
    });
    return response.data as PagedResponse<T>;
  },

  async getTopicCategories<T = unknown>() {
    const response = await apiClient.get('/admin/topic-categories');
    return response.data as T[];
  },

  async createTopic(data: AdminTopicPayload) {
    const response = await apiClient.post('/admin/topics', data);
    return response.data;
  },

  async updateTopic(id: number | string, data: AdminTopicPayload) {
    const response = await apiClient.put(`/admin/topics/${id}`, data);
    return response.data;
  },

  async deleteTopic(id: number | string) {
    const response = await apiClient.delete(`/admin/topics/${id}`);
    return response.data;
  },

  async createTopicCategory(data: AdminTopicCategoryPayload) {
    const response = await apiClient.post('/admin/topic-categories', data);
    return response.data;
  },

  async updateTopicCategory(id: number | string, data: AdminTopicCategoryPayload) {
    const response = await apiClient.put(`/admin/topic-categories/${id}`, data);
    return response.data;
  },

  async deleteTopicCategory(id: number | string) {
    const response = await apiClient.delete(`/admin/topic-categories/${id}`);
    return response.data;
  },

  async getWordsPage<T = unknown>(page = 1, limit = 20, filters: {
    topicId?: number | string;
    partOfSpeechId?: number | string;
    status?: string;
    missingExamples?: boolean;
    missingQuestions?: boolean;
    sortBy?: string;
    sortDirection?: string;
    search?: string;
  } = {}) {
    const response = await apiClient.get('/admin/words', {
      params: {
        page,
        limit,
        topicId: filters.topicId || undefined,
        partOfSpeechId: filters.partOfSpeechId || undefined,
        status: filters.status || undefined,
        missingExamples: filters.missingExamples || undefined,
        missingQuestions: filters.missingQuestions || undefined,
        sortBy: filters.sortBy || undefined,
        sortDirection: filters.sortDirection || undefined,
        search: filters.search || undefined,
      }
    });
    return response.data as PagedResponse<T>;
  },

  async getWords<T = unknown>(page = 1, limit = 20, filters: Parameters<typeof this.getWordsPage>[2] = {}) {
    const data = await this.getWordsPage<T>(page, limit, filters);
    return unwrapItems<T>(data);
  },

  async getWordDetail<T = unknown>(id: number | string) {
    const response = await apiClient.get(`/admin/words/${id}`);
    return response.data as T;
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

  async previewImportWords(data: unknown[] | string) {
    const isCsv = typeof data === 'string';
    const response = await apiClient.post(
      '/admin/words/import-preview',
      isCsv ? data : { words: data },
      isCsv ? { headers: { 'Content-Type': 'text/csv' } } : undefined
    );
    return response.data;
  },

  async hardDeleteWord(id: number) {
    const response = await apiClient.delete(`/admin/words/${id}/hard`);
    return response.data;
  },

  async getQuestionsByWordPage<T = unknown>(
    wordId: number,
    page = 1,
    limit = 20,
    filters: { search?: string; type?: string; status?: string } = {}
  ) {
    const response = await apiClient.get(`/admin/questions/${wordId}`, {
      params: {
        page,
        limit,
        search: filters.search || undefined,
        type: filters.type || undefined,
        status: filters.status || undefined,
      }
    });
    return response.data as PagedResponse<T>;
  },

  async getQuestionsByWord<T = unknown>(wordId: number, page = 1, limit = 20, filters: { search?: string; type?: string; status?: string } = {}) {
    const data = await this.getQuestionsByWordPage<T>(wordId, page, limit, filters);
    return unwrapItems<T>(data);
  },

  async createQuestion(data: unknown) {
    const response = await apiClient.post('/admin/questions', data);
    return response.data;
  },

  async updateQuestion(id: number | string, data: unknown) {
    const response = await apiClient.put(`/admin/questions/${id}`, data);
    return response.data;
  },

  async deleteQuestion(id: number | string) {
    const response = await apiClient.delete(`/admin/questions/${id}`);
    return response.data;
  },

  async bulkImportQuestions(csv: string) {
    const response = await apiClient.post('/admin/questions/bulk-import', csv, {
      headers: { 'Content-Type': 'text/csv' },
    });
    return response.data;
  },

  async getMiniTestsPage<T = unknown>(page = 1, limit = 20, filters: { search?: string; topicId?: number | string; status?: string } = {}) {
    const response = await apiClient.get('/admin/minitests', {
      params: {
        page,
        limit,
        search: filters.search || undefined,
        topicId: filters.topicId || undefined,
        status: filters.status || undefined,
      }
    });
    return response.data as PagedResponse<T>;
  },

  async getMiniTests<T = unknown>(page = 1, limit = 20, filters: { search?: string; topicId?: number | string; status?: string } = {}) {
    const data = await this.getMiniTestsPage<T>(page, limit, filters);
    return unwrapItems<T>(data);
  },

  async createMiniTest(data: unknown) {
    const response = await apiClient.post('/admin/minitests', data);
    return response.data;
  },

  async updateMiniTest(id: number | string, data: unknown) {
    const response = await apiClient.put(`/admin/minitests/${id}`, data);
    return response.data;
  },

  async deleteMiniTest(id: number | string) {
    const response = await apiClient.delete(`/admin/minitests/${id}`);
    return response.data;
  },

  async publishMiniTest(id: number | string) {
    const response = await apiClient.patch(`/admin/minitests/${id}/publish`);
    return response.data;
  },

  async archiveMiniTest(id: number | string) {
    const response = await apiClient.patch(`/admin/minitests/${id}/archive`);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  async getStudentsPage<T = unknown>(params: { page?: number; limit?: number; search?: string; status?: string; role?: string } = {}) {
    const response = await apiClient.get('/admin/students', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || undefined,
        status: params.status && params.status !== 'all' ? params.status : undefined,
        role: params.role && params.role !== 'all' ? params.role : undefined,
      }
    });
    return response.data as PagedResponse<T>;
  },

  async getStudents<T = unknown>(params: { page?: number; limit?: number; search?: string; status?: string; role?: string } = {}) {
    const data = await this.getStudentsPage<T>(params);
    return unwrapItems<T>(data);
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

  async updateContentStatus(data: { entityType: 'Topic' | 'Word' | 'Question' | 'MiniTest'; entityId: number | string; status: string; comment?: string }) {
    const response = await apiClient.patch('/admin/content-status', data);
    return response.data;
  },

  async getNotificationsPage<T = unknown>(params: { page?: number; limit?: number; search?: string; type?: string; deliveryChannel?: string; isRead?: boolean | string } = {}) {
    const response = await apiClient.get('/admin/notifications', {
      params: {
        page: params.page || 1,
        limit: params.limit || 50,
        search: params.search || undefined,
        type: params.type || undefined,
        deliveryChannel: params.deliveryChannel || undefined,
        isRead: params.isRead,
      }
    });
    return response.data as PagedResponse<T>;
  },

  async getNotifications<T = unknown>(limit = 50) {
    const data = await this.getNotificationsPage<T>({ limit });
    return unwrapItems<T>(data);
  },

  async getAuditLogsPage<T = unknown>(params: { page?: number; limit?: number; search?: string; action?: string; entityType?: string; adminId?: number | string } = {}) {
    const response = await apiClient.get('/admin/audit-logs', {
      params: {
        page: params.page || 1,
        limit: params.limit || 50,
        search: params.search || undefined,
        action: params.action || undefined,
        entityType: params.entityType || undefined,
        adminId: params.adminId || undefined,
      }
    });
    return response.data as PagedResponse<T>;
  },

  async sendAnnouncement(data: unknown) {
    const response = await apiClient.post('/admin/notifications', data);
    return response.data;
  },

  async createDailyReminders() {
    const response = await apiClient.post('/admin/notifications/daily-reminders');
    return response.data;
  },

  // ── Content Review ──
  async getPendingContent() {
    const response = await apiClient.get('/admin/content-review/pending');
    return response.data;
  },

  async approveContent(entityType: string, entityId: number) {
    const response = await apiClient.post(`/admin/content-review/${entityType}/${entityId}/approve`);
    return response.data;
  },

  async rejectContent(entityType: string, entityId: number, reason?: string) {
    const response = await apiClient.post(`/admin/content-review/${entityType}/${entityId}/reject`, { reason });
    return response.data;
  },

  async archiveContent(entityType: string, entityId: number) {
    const response = await apiClient.post(`/admin/content-review/${entityType}/${entityId}/archive`);
    return response.data;
  },

  async getReviewLogs(entityType: string, entityId: number) {
    const response = await apiClient.get(`/admin/content-review/${entityType}/${entityId}/logs`);
    return response.data;
  }
};
