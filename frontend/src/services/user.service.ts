// vocab-practice/frontend/src/services/user.service.ts
import apiClient from "../lib/api-client";

export const userService = {
  async getDueFlashcards() {
    const response = await apiClient.get("/user/flashcards");
    return response.data;
  },

  async submitAnswer(data: any) {
    const response = await apiClient.post("/user/submit-answer", data);
    return response.data;
  },
};
