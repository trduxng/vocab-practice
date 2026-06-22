// vocab-practice/frontend/src/services/categories.service.ts
import apiClient from "../lib/api-client";

export const categoriesService = {
  async getPartOfSpeeches() {
    const response = await apiClient.get("/categories/part-of-speeches");
    return response.data;
  },


};
