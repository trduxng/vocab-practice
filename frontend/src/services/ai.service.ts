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

export interface AiTopicSuggestion {
  topicName: string;
  topicCode: string;
  description?: string;
  keywords?: string[];
  suggestedWordCount?: number;
  suggestedWords?: { term: string; meaning?: string }[];
}

export interface AiQuestionSuggestion {
  wordId: number;
  questionType: string;
  questionText: string;
  optionsJson: string;
  correctAnswer: string;
  explanation?: string;
}

export interface AiMiniTestSuggestion {
  title: string;
  description?: string;
  questionCount?: number;
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

  async suggestTopicContent(data: {
    topicName: string;
    description?: string;
    targetWordCount?: number;
    topicCategoryId?: number;
  }) {
    const response = await apiClient.post('/ai/topic-suggestions', data);
    return response.data as AiTopicSuggestion;
  },

  async suggestQuestionContent(data: {
    wordId: number;
    term: string;
    meaning: string;
    questionType?: string;
    optionCount?: number;
  }) {
    const response = await apiClient.post('/ai/question-suggestions', data);
    return response.data as AiQuestionSuggestion;
  },

  async translateText(data: { text: string; source?: string; target?: string }) {
    const response = await apiClient.post('/ai/translate', data);
    return response.data as { translatedText?: string | null };
  },

  async lookupDictionary(data: { term: string }) {
    const response = await apiClient.post('/ai/dictionary', data);
    return response.data as {
      meaning?: string | null;
      phonetic?: string | null;
      partOfSpeech?: string | null;
      examples?: { sentence: string; meaning?: string }[];
    };
  },

  async suggestMiniTestContent(data: {
    topicName: string;
    description?: string;
    questionCount?: number;
    titleHint?: string;
  }) {
    const response = await apiClient.post('/ai/mini-test-suggestions', data);
    return response.data as AiMiniTestSuggestion;
  },
};
