// ============================================================
// Shared TypeScript types for User (Learner) Module
// ============================================================

// ---------- Flashcard ----------
export interface Flashcard {
  questionId?: number;
  questionType?: string;
  questionText?: string;
  correctAnswer?: string;
  optionsJson?: string;
  phonetic?: string;
  meaning: string;
  term: string;
  audioUrlUK?: string;
  audioUrlUS?: string;
  imageUrl?: string;
  wordId: number;
  partOfSpeechName?: string;
  masteryLevel: number;
  memoryStatus: string;
}

// ---------- Practice Question ----------
export interface PracticeQuestion {
  questionId?: number;
  wordId: number;
  questionType?: "MCQ" | "Dictation" | "DragDrop" | "FillBlank" | string;
  questionText?: string;
  optionsJson?: string;
  correctAnswer?: string;
  term?: string;
  meaning?: string;
}

// ---------- Smart Review Queue ----------
export interface SmartReviewItem {
  wordId: number;
  term: string;
  phonetic?: string;
  meaning: string;
  audioUrlUK?: string;
  audioUrlUS?: string;
  partOfSpeechName?: string;
  masteryLevel: number;
  memoryStatus: string;
  lastReviewedAt?: string;
  nextReviewDate?: string;
  repetitionCount: number;
  consecutiveWrong: number;
  priorityScore: number;
}

// ---------- Mini Test ----------
export interface MiniTest {
  id: number;
  title: string;
  description?: string;
  topicName?: string;
  totalQuestions?: number;
}

export interface MiniTestQuestion {
  questionId: number;
  wordId?: number;
  questionText: string;
  questionType?: string;
  optionsJson?: string;
  correctAnswer: string;
  term?: string;
  meaning?: string;
}

export interface MiniTestAnswer {
  questionId?: number;
  wordId?: number;
  submittedAnswer: string;
  isCorrect: boolean;
}

export interface MiniTestResult {
  total: number;
  correct: number;
  score: number;
  results: { questionId?: number; wordId?: number; isCorrect: boolean }[];
}

export interface TestHistory {
  date: string;
  testId: number;
  testTitle: string;
  totalQuestions: number;
  correctAnswers: number;
}

export interface TestSessionDetail {
  questionText: string;
  questionType: string;
  correctAnswer: string;
  submittedAnswer?: string;
  isCorrect: boolean;
  term: string;
  meaning: string;
}

// ---------- Dashboard ----------
export interface DashboardStats {
  streak?: number;
  totalLearned?: number;
  accuracy?: number;
  correct?: number;
  wrong?: number;
  weakWords?: { word: string; meaning: string }[];
  recentAttempts?: { answer: string; isCorrect: boolean; date: string; term: string }[];
  dailyTrends?: { day: string; count: number }[];
  achievements?: Achievement[];
  masteryTimeline?: MasteryTimeline;
}

export interface MasteryTimeline {
  totalWords?: number;
  masteredWords?: number;
  completionPercentage?: number | string;
  estimatedDaysToMastery?: number | null;
  projectedCompletionDate?: string | null;
}

export interface Achievement {
  id: number;
  icon: string;
  label: string;
  unlocked: boolean;
}

// ---------- Heatmap ----------
export interface HeatmapEntry {
  date: string;
  count: number;
}

// ---------- Daily Goal ----------
export interface DailyGoalSetting {
  dailyGoal: number;
  srsReviewLimit: number;
}

export interface DailyProgress {
  todayCount: number;
}

// ---------- Notebook ----------
export interface NotebookEntry {
  notebookId: number;
  wordId: number;
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechName?: string;
  personalNote?: string;
  isFavorite: boolean;
  masteryLevel: number;
  addedAt: string;
  updatedAt: string;
}

// ---------- Paginated Response ----------
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------- Answer Submission ----------
export interface SubmitAnswerData {
  questionId?: number;
  wordId?: number;
  submittedAnswer?: string;
  isCorrect?: boolean;
  scoreAwarded?: number;
}
