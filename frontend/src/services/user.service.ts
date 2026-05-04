// vocab-practice/frontend/src/services/user.service.ts
import apiClient from "../lib/api-client";

export interface Flashcard {
  wordId: number;
  term: string;
  meaning: string;
  phonetic: string;
  audioUk?: string;
  audioUs?: string;
  questionId: number;
  questionType: string;
  questionText: string;
  optionsJson: string;
  masteryLevel: number;
  memoryStatus: string;
  nextReviewDate: string;
}

export interface SubmitAnswerRequest {
  questionId: number;
  submittedAnswer: string;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  scoreAwarded: number;
  masteryLevel: number;
  easeFactor: number;
  repetitionCount: number;
  memoryStatus: string;
  nextReviewDate: string;
  correctAnswer?: string;
}

export interface UserProgress {
  totalLearned: number;
  accuracy: number;
  streak: number;
  correct: number;
  wrong: number;
  weakWords: { word: string; meaning: string }[];
}

export const userService = {
  async getDueFlashcards(limit: number = 20): Promise<Flashcard[]> {
    const response = await apiClient.get("/user/flashcards", {
      params: { limit },
    });
    return response.data;
  },

  async submitAnswer(data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const response = await apiClient.post("/user/submit-answer", data);
    return response.data.data || response.data;
  },

  // Gọi API progress thật
  async getProgress(): Promise<UserProgress> {
    const response = await apiClient.get("/progress");
    return response.data;
  },
};
