// vocab-practice/frontend/src/services/admin.service.ts
import apiClient from "../lib/api-client";

interface CreateWordData {
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechId: number;
  topicIds?: number[];
  examples?: Array<{
    sentence: string;
    meaning?: string;
  }>;
}

interface UpdateWordData {
  term?: string;
  meaning?: string;
  phonetic?: string;
  partOfSpeechId?: number;
}

interface CreateQuestionData {
  wordId: number;
  questionType: string;
  questionText: string;
  optionsJson: string;
  correctAnswer: string;
  explanation?: string;
}

export const adminService = {
  async getWords(page = 1, limit = 20) {
    const response = await apiClient.get("/admin/words", {
      params: { page, limit },
    });
    return response.data;
  },

  async createWord(data: CreateWordData) {
    const response = await apiClient.post("/admin/words", data);
    return response.data;
  },

  async updateWord(id: number, data: UpdateWordData) {
    const response = await apiClient.put(`/admin/words/${id}`, data);
    return response.data;
  },

  async createQuestion(data: CreateQuestionData) {
    const response = await apiClient.post("/admin/questions", data);
    return response.data;
  },
};
