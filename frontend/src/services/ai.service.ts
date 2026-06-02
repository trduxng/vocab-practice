import apiClient from '../lib/api-client';

export interface AiWordExample {
  sentence: string;
  meaning?: string;
}

export interface AiWordSuggestion {
  term: string;
  meaning?: string;
  phonetic?: string;
  partOfSpeech?: string;
  examples: AiWordExample[];
  sources?: {
    ai?: string | null;
    translate?: string | null;
    dictionary?: string | null;
  };
}

export const aiService = {
  async suggestWordContent(data: {
    term: string;
    meaning?: string;
    partOfSpeech?: string;
    exampleCount?: number;
  }) {
    const response = await apiClient.post('/ai/word-suggestions', data);
    return response.data as AiWordSuggestion;
  },
};
