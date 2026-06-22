import apiClient from "../lib/api-client";

export type ContentStatus = "Draft" | "PendingReview" | "Published" | "Rejected" | "Archived";
export type QuestionType = "MCQ" | "FillBlank" | "DragDrop" | "Dictation" | "FlashcardCheck";

export interface CreatorPage<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TopicCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreatorTopic {
  id: number;
  name: string;
  code: string;
  description?: string;
  contentStatus: ContentStatus;
  categoryName?: string;
  categoryId?: number | null;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string | null;
}

export interface CreatorWord {
  id: number;
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechId: number;
  partOfSpeechName?: string;
  contentStatus: ContentStatus;
  topicIds?: number[];
  topics?: Array<{ id: number; name: string }>;
  examples?: Array<{ id?: number; sentence: string; meaning?: string }>;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string | null;
}

export interface CreatorQuestion {
  id: number;
  wordId: number;
  wordTerm?: string;
  questionType: QuestionType;
  questionText: string;
  optionsJson?: string;
  correctAnswer: string;
  explanation?: string;
  contentStatus: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string | null;
}

export interface CreatorMiniTest {
  id: number;
  title: string;
  description?: string;
  topicId?: number | null;
  topicName?: string;
  totalQuestions: number;
  questionIds?: number[];
  isPublished: boolean;
  contentStatus: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string | null;
}

export interface CreatorMedia {
  id: number;
  mediaType: "Image" | "AudioUK" | "AudioUS" | "ExampleAudio" | "QuestionAudio" | "QuestionImage";
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  fileSizeBytes?: number | null;
  altText?: string;
  transcript?: string;
  createdAt: string;
}

export interface TopicPayload {
  topicName: string;
  topicCode: string;
  description?: string;
  topicCategoryId?: number | null;
}

export interface WordPayload {
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechId: number;
  topicIds?: number[];
  examples?: Array<{ sentence: string; meaning?: string }>;
}

export interface QuestionPayload {
  wordId: number;
  questionType: QuestionType;
  questionText: string;
  optionsJson?: string;
  correctAnswer: string;
  explanation?: string;
}

export interface MiniTestPayload {
  title: string;
  description?: string;
  topicId?: number | null;
  questionIds?: number[];
}

export interface MediaPayload {
  mediaType: CreatorMedia["mediaType"];
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  fileSizeBytes?: number | null;
  altText?: string;
  transcript?: string;
}

type ListFilters = {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export const creatorService = {
  async getDashboard() {
    const response = await apiClient.get("/creator/dashboard");
    return response.data;
  },

  async getContentSummary() {
    const response = await apiClient.get("/creator/content-summary");
    return response.data;
  },

  async getTopicAnalytics(topicId: number) {
    const response = await apiClient.get(`/creator/topics/${topicId}/analytics`);
    return response.data;
  },

  async getMiniTestAnalytics(miniTestId: number) {
    const response = await apiClient.get(`/creator/mini-tests/${miniTestId}/analytics`);
    return response.data;
  },

  async getTopicCategories(): Promise<TopicCategory[]> {
    const response = await apiClient.get("/creator/topic-categories");
    return response.data;
  },

  async getTopicsPage(filters: ListFilters = {}): Promise<CreatorPage<CreatorTopic>> {
    const response = await apiClient.get("/creator/topics", { params: filters });
    return response.data;
  },

  async getTopics(filters: ListFilters = {}): Promise<CreatorTopic[]> {
    return (await this.getTopicsPage(filters)).data;
  },

  async createTopic(data: TopicPayload) {
    return (await apiClient.post("/creator/topics", data)).data;
  },

  async updateTopic(id: number, data: TopicPayload) {
    return (await apiClient.put(`/creator/topics/${id}`, data)).data;
  },

  async deleteTopic(id: number) {
    return (await apiClient.delete(`/creator/topics/${id}`)).data;
  },

  async submitTopicForReview(id: number) {
    return (await apiClient.post(`/creator/topics/${id}/submit-review`)).data;
  },

  async getWordsPage(filters: ListFilters = {}): Promise<CreatorPage<CreatorWord>> {
    const response = await apiClient.get("/creator/words", { params: filters });
    return response.data;
  },

  async getWords(filters: ListFilters = {}): Promise<CreatorWord[]> {
    return (await this.getWordsPage(filters)).data;
  },

  async createWord(data: WordPayload) {
    return (await apiClient.post("/creator/words", data)).data;
  },

  async updateWord(id: number, data: WordPayload) {
    return (await apiClient.put(`/creator/words/${id}`, data)).data;
  },

  async deleteWord(id: number) {
    return (await apiClient.delete(`/creator/words/${id}`)).data;
  },

  async submitWordForReview(id: number) {
    return (await apiClient.post(`/creator/words/${id}/submit-review`)).data;
  },

  async getQuestionsPage(filters: ListFilters = {}): Promise<CreatorPage<CreatorQuestion>> {
    const response = await apiClient.get("/creator/questions", { params: filters });
    return response.data;
  },

  async getQuestions(filters: ListFilters = {}): Promise<CreatorQuestion[]> {
    return (await this.getQuestionsPage(filters)).data;
  },

  async createQuestion(data: QuestionPayload) {
    return (await apiClient.post("/creator/questions", data)).data;
  },

  async updateQuestion(id: number, data: QuestionPayload) {
    return (await apiClient.put(`/creator/questions/${id}`, data)).data;
  },

  async deleteQuestion(id: number) {
    return (await apiClient.delete(`/creator/questions/${id}`)).data;
  },

  async submitQuestionForReview(id: number) {
    return (await apiClient.post(`/creator/questions/${id}/submit-review`)).data;
  },

  async getMiniTestsPage(filters: ListFilters = {}): Promise<CreatorPage<CreatorMiniTest>> {
    const response = await apiClient.get("/creator/mini-tests", { params: filters });
    return response.data;
  },

  async getMiniTests(filters: ListFilters = {}): Promise<CreatorMiniTest[]> {
    return (await this.getMiniTestsPage(filters)).data;
  },

  async createMiniTest(data: MiniTestPayload) {
    return (await apiClient.post("/creator/mini-tests", data)).data;
  },

  async updateMiniTest(id: number, data: MiniTestPayload) {
    return (await apiClient.put(`/creator/mini-tests/${id}`, data)).data;
  },

  async deleteMiniTest(id: number) {
    return (await apiClient.delete(`/creator/mini-tests/${id}`)).data;
  },

  async addMiniTestItem(miniTestId: number, questionId: number) {
    return (await apiClient.post(`/creator/mini-tests/${miniTestId}/items`, { questionId })).data;
  },

  async removeMiniTestItem(miniTestId: number, questionId: number) {
    return (await apiClient.delete(`/creator/mini-tests/${miniTestId}/items/${questionId}`)).data;
  },

  async submitMiniTestForReview(id: number) {
    return (await apiClient.post(`/creator/mini-tests/${id}/submit-review`)).data;
  },

  async getMedia(): Promise<CreatorMedia[]> {
    return (await apiClient.get("/creator/media")).data;
  },

  async createMedia(data: MediaPayload) {
    return (await apiClient.post("/creator/media", data)).data;
  },

  async deleteMedia(id: number) {
    return (await apiClient.delete(`/creator/media/${id}`)).data;
  },
};
