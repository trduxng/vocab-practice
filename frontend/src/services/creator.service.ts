import apiClient from '../lib/api-client';

// ── Types ──
export interface TopicCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export interface TopicPayload {
  topicName: string;
  topicCode: string;
  description?: string;
  topicCategoryId?: number;
  displayOrder?: number;
}

export interface WordPayload {
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechId: number;
  topicIds?: number[];
  examples?: { sentence: string; meaning?: string }[];
}

export interface QuestionPayload {
  wordId: number;
  questionType: string;
  questionText: string;
  optionsJson?: string;
  correctAnswer: string;
  explanation?: string;
}

export interface MiniTestPayload {
  title: string;
  description?: string;
  topicId: number;
  questionIds?: number[];
}

export interface Topic {
  id: number;
  name: string;
  code: string;
  description: string;
  contentStatus: string;
  categoryName: string;
  categoryId: number;
  displayOrder: number;
  createdAt: string;
}

export interface Word {
  id: number;
  term: string;
  meaning: string;
  phonetic: string;
  partOfSpeechId: number;
  partOfSpeechName: string;
  contentStatus: string;
  createdAt: string;
}

export interface Question {
  id: number;
  wordId: number;
  wordTerm: string;
  questionType: string;
  questionText: string;
  optionsJson: string;
  correctAnswer: string;
  explanation: string;
  contentStatus: string;
  createdAt: string;
}

export interface MiniTest {
  id: number;
  title: string;
  description: string;
  topicId: number;
  topicName: string;
  totalQuestions: number;
  isPublished: boolean;
  contentStatus: string;
  createdAt: string;
}

export interface MediaItem {
  id: number;
  fileName: string;
  fileUrl: string;
  mediaType: string;
  mimeType: string;
  fileSizeBytes: number;
  altText: string | null;
  transcript: string | null;
  createdAt: string;
}

// ── Helpers ──
function unwrapItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'data' in data) return (data as { data: T[] }).data;
  return [];
}

// ── Creator API Service ──
export const creatorService = {
  // Dashboard & Analytics
  async getDashboard() {
    const res = await apiClient.get('/creator/dashboard');
    return res.data;
  },

  async getContentSummary() {
    const res = await apiClient.get('/creator/content-summary');
    return res.data;
  },

  async getTopicAnalytics(topicId: number) {
    const res = await apiClient.get(`/creator/topics/${topicId}/analytics`);
    return res.data;
  },

  async getMiniTestAnalytics(miniTestId: number) {
    const res = await apiClient.get(`/creator/mini-tests/${miniTestId}/analytics`);
    return res.data;
  },

  // TopicCategories (Read-only)
  async getTopicCategories(): Promise<TopicCategory[]> {
    const res = await apiClient.get('/creator/topic-categories');
    return res.data;
  },

  // Topics
  async getTopics(filters?: { status?: string; page?: number; pageSize?: number }): Promise<Topic[]> {
    const res = await apiClient.get('/creator/topics', { params: filters });
    return unwrapItems<Topic>(res.data);
  },

  async createTopic(data: TopicPayload) {
    const res = await apiClient.post('/creator/topics', data);
    return res.data;
  },

  async updateTopic(id: number, data: TopicPayload) {
    const res = await apiClient.put(`/creator/topics/${id}`, data);
    return res.data;
  },

  async deleteTopic(id: number) {
    const res = await apiClient.delete(`/creator/topics/${id}`);
    return res.data;
  },

  async submitTopicForReview(id: number) {
    const res = await apiClient.post(`/creator/topics/${id}/submit-review`);
    return res.data;
  },

  // Words
  async getWords(filters?: { status?: string; page?: number; pageSize?: number; topicId?: number }): Promise<Word[]> {
    const res = await apiClient.get('/creator/words', { params: filters });
    return unwrapItems<Word>(res.data);
  },

  async createWord(data: WordPayload) {
    const res = await apiClient.post('/creator/words', data);
    return res.data;
  },

  async bulkCreateWords(data: { words: WordPayload[], conflictStrategy?: string }) {
    const res = await apiClient.post('/creator/words/bulk', data);
    return res.data;
  },

  async updateWord(id: number, data: Partial<WordPayload>) {
    const res = await apiClient.put(`/creator/words/${id}`, data);
    return res.data;
  },

  async deleteWord(id: number) {
    const res = await apiClient.delete(`/creator/words/${id}`);
    return res.data;
  },

  async submitWordForReview(id: number) {
    const res = await apiClient.post(`/creator/words/${id}/submit-review`);
    return res.data;
  },

  // Questions
  async getQuestions(filters?: { status?: string; page?: number; pageSize?: number; topicId?: number }): Promise<Question[]> {
    const res = await apiClient.get('/creator/questions', { params: filters });
    return unwrapItems<Question>(res.data);
  },

  async createQuestion(data: QuestionPayload) {
    const res = await apiClient.post('/creator/questions', data);
    return res.data;
  },

  async updateQuestion(id: number, data: Partial<QuestionPayload>) {
    const res = await apiClient.put(`/creator/questions/${id}`, data);
    return res.data;
  },

  async deleteQuestion(id: number) {
    const res = await apiClient.delete(`/creator/questions/${id}`);
    return res.data;
  },

  async submitQuestionForReview(id: number) {
    const res = await apiClient.post(`/creator/questions/${id}/submit-review`);
    return res.data;
  },

  // MiniTests
  async getMiniTests(filters?: { status?: string; page?: number; pageSize?: number }): Promise<MiniTest[]> {
    const res = await apiClient.get('/creator/mini-tests', { params: filters });
    return unwrapItems<MiniTest>(res.data);
  },

  async createMiniTest(data: MiniTestPayload) {
    const res = await apiClient.post('/creator/mini-tests', data);
    return res.data;
  },

  async updateMiniTest(id: number, data: Partial<MiniTestPayload>) {
    const res = await apiClient.put(`/creator/mini-tests/${id}`, data);
    return res.data;
  },

  async deleteMiniTest(id: number) {
    const res = await apiClient.delete(`/creator/mini-tests/${id}`);
    return res.data;
  },

  async addMiniTestItem(miniTestId: number, questionId: number) {
    const res = await apiClient.post(`/creator/mini-tests/${miniTestId}/items`, { questionId });
    return res.data;
  },

  async removeMiniTestItem(miniTestId: number, questionId: number) {
    const res = await apiClient.delete(`/creator/mini-tests/${miniTestId}/items/${questionId}`);
    return res.data;
  },

  async submitMiniTestForReview(id: number) {
    const res = await apiClient.post(`/creator/mini-tests/${id}/submit-review`);
    return res.data;
  },

  // Media
  async getMedia(filters?: { mediaType?: string; search?: string; page?: number; pageSize?: number }): Promise<{ data: MediaItem[], total: number, totalPages: number }> {
    const res = await apiClient.get('/creator/media', { params: filters });
    return {
      data: unwrapItems<MediaItem>(res.data),
      total: res.data.total || 0,
      totalPages: res.data.totalPages || 1
    };
  },

  async uploadMedia(formData: FormData) {
    const res = await apiClient.post('/creator/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },

  async deleteMedia(id: number) {
    const res = await apiClient.delete(`/creator/media/${id}`);
    return res.data;
  },
};
