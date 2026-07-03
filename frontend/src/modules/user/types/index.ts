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
  repetitionCount?: number;
  exampleSentence?: string;
  exampleMeaning?: string;
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
  xpEarned?: number;
  gamification?: GamificationReward;
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
  totalXP?: number;
  currentLevel?: number;
  currentLevelXP?: number;
  xpForNextLevel?: number;
  xpToNextLevel?: number;
  levelProgress?: number;
  todayXP?: number;
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
  code?: string;
  icon: string;
  label: string;
  description?: string;
  unlocked: boolean;
  unlockedAt?: string;
  seen?: boolean;
  criteriaType?: string;
  progress?: number;
  target?: number;
  progressPercentage?: number;
}

// ---------- Heatmap ----------
export interface HeatmapEntry {
  date: string;
  count: number;
  xpEarned?: number;
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

export interface TopicWord {
  wordId: number;
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechName?: string;
  masteryLevel: number;
  memoryStatus: string;
  repetitionCount: number;
  lastReviewedAt?: string;
  nextReviewDate?: string;
  notebookId?: number;
  isInNotebook: boolean;
  exampleSentence?: string;
  exampleMeaning?: string;
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
  reviewRating?: ReviewRating;
  activityType?: "LearnWord";
}

export type ReviewRating = "Again" | "Hard" | "Good" | "Easy";

export interface ReviewFeedback {
  xpGained: number;
  nextReviewDate?: string;
  reviewRating?: ReviewRating;
  memoryStatus?: string;
  masteryLevel?: number;
  gamification?: GamificationReward | null;
}

export interface GamificationReward {
  xpEventId: number;
  xpGained: number;
  eventType: "LearnWord" | "PracticeComplete" | "MiniTestComplete" | "DailyLogin";
  awarded: boolean;
  totalXP: number;
  currentLevel: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  nextLevelTotalXP: number;
  levelProgress: number;
  unlockedAchievements: Achievement[];
}

export interface GamificationProfile {
  totalXP: number;
  todayXP: number;
  currentLevel: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  nextLevelTotalXP: number;
  levelProgress: number;
  wordsLearned: number;
  streak: number;
  achievements: Achievement[];
  unseenAchievements: Achievement[];
}

// ---------- Progress Analytics ----------
export interface ProgressActivityDay {
  date: string;
  count: number;
  xpEarned: number;
}

export interface VocabularyGrowthPoint {
  date: string;
  learnedWords: number;
  masteredWords: number;
}

export interface TopicMasteryProgress {
  topicId: number;
  topicName: string;
  totalWords: number;
  learnedWords: number;
  masteredWords: number;
  averageMastery: number;
  completionPercentage: number;
}

export interface RetentionStatistics {
  correctAnswerRate: number;
  forgottenWordRate: number;
  reviewCompletionRate: number;
  totalAnswers: number;
  correctAnswers: number;
  learnedWords: number;
  forgottenWords: number;
  upToDateWords: number;
}

export interface ProgressAnalytics {
  summary: {
    activeDays: number;
    totalXP: number;
    currentStreak: number;
    learnedWords: number;
    masteredWords: number;
  };
  activity: ProgressActivityDay[];
  vocabularyGrowth: VocabularyGrowthPoint[];
  topicMastery: TopicMasteryProgress[];
  retention: RetentionStatistics;
}

// ---------- Learning Path ----------
export type LearningPathStatus = "locked" | "available" | "completed";

export interface LearningPathActivity {
  type: "lesson" | "practice" | "miniTest";
  title: string;
  description: string;
  status: LearningPathStatus;
  route: string;
  configured: boolean;
}

export interface LearningPathTopic {
  pathTopicId: number;
  topicId: number;
  title: string;
  code?: string;
  description?: string;
  status: LearningPathStatus;
  completionPercentage: number;
  totalWords: number;
  learnedWords: number;
  masteredWords: number;
  activities: LearningPathActivity[];
}

export interface LearningPathLevel {
  id: number;
  code: string;
  title: string;
  targetScore: number;
  description?: string;
  displayOrder: number;
  accentKey: string;
  status: LearningPathStatus;
  completionPercentage: number;
  completedTopics: number;
  totalTopics: number;
  topics: LearningPathTopic[];
}

export interface LearningPathLessonPreview {
  topicId: number;
  title: string;
  route: string;
  status: LearningPathStatus;
  completionPercentage: number;
}

export interface LearningPathRoadmap {
  completionPercentage: number;
  completedTopics: number;
  totalTopics: number;
  currentPosition: {
    levelTitle?: string;
    topicId: number;
    topicTitle: string;
    topicStatus: LearningPathStatus;
    activityTitle: string;
    activityRoute: string;
    completionPercentage: number;
  } | null;
  currentLesson: LearningPathLessonPreview | null;
  nextLesson: LearningPathLessonPreview | null;
  levels: LearningPathLevel[];
}
