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
  async getTopics(filters?: { status?: string }) {
    const res = await apiClient.get('/creator/topics', { params: filters });
    return res.data;
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
  async getWords(filters?: { status?: string }) {
    const res = await apiClient.get('/creator/words', { params: filters });
    return res.data;
  },

  async createWord(data: WordPayload) {
    const res = await apiClient.post('/creator/words', data);
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
  async getQuestions(filters?: { status?: string }) {
    const res = await apiClient.get('/creator/questions', { params: filters });
    return res.data;
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
  async getMiniTests(filters?: { status?: string }) {
    const res = await apiClient.get('/creator/mini-tests', { params: filters });
    return res.data;
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
};
