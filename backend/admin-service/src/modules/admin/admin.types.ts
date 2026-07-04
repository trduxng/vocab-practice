export type ContentStatus = 'Draft' | 'PendingReview' | 'Published' | 'Rejected' | 'Archived';
export type UserRole = 'Admin' | 'Learner' | 'ContentCreator';
export type AdminEntityType = 'Topic' | 'Word' | 'Question' | 'MiniTest';
export type AdminRow = Record<string, unknown>;
export type IdLike = string | number;

export interface TopicFilters {
  search?: string;
  status?: ContentStatus | string;
  categoryId?: IdLike;
}

export interface TopicPayload {
  name?: string;
  code?: string;
  description?: string | null;
  topicCategoryId?: IdLike | null;
  status?: ContentStatus;
}

export interface TopicCategoryPayload {
  name?: string;
  code?: string;
  description?: string | null;
  iconUrl?: string | null;
  displayOrder?: number | string;
  isActive?: boolean;
}

export interface WordFilters {
  topicId?: IdLike;
  partOfSpeechId?: IdLike;
  search?: string;
  status?: ContentStatus | string;
  missingExamples?: boolean | string;
  missingQuestions?: boolean | string;
  sortBy?: 'term' | 'createdAt' | 'updatedAt' | 'questionCount' | 'exampleCount' | string;
  sortDirection?: 'asc' | 'desc' | 'ASC' | 'DESC' | string;
}

export interface WordExamplePayload {
  sentence?: string;
  meaning?: string;
}

export interface WordPayload {
  term?: string;
  meaning?: string;
  phonetic?: string;
  partOfSpeechId?: IdLike;
  topicIds?: IdLike[];
  examples?: WordExamplePayload[];
  status?: ContentStatus;
}

export interface QuestionFilters {
  search?: string;
  type?: string;
  status?: ContentStatus | string;
}

export interface QuestionPayload {
  wordId?: IdLike;
  questionType?: string;
  questionText?: string;
  correctAnswer?: string;
  optionsJson?: string;
  explanation?: string;
  status?: ContentStatus;
}

export interface MiniTestFilters {
  search?: string;
  topicId?: IdLike;
  status?: ContentStatus | string;
}

export interface MiniTestPayload {
  title?: string;
  description?: string | null;
  topicId?: IdLike | null;
  questionIds?: IdLike[];
}

export interface StudentFilters {
  search?: string;
  status?: 'active' | 'banned' | string;
  role?: UserRole | string;
}

export interface UserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  entityType?: string;
  adminId?: IdLike;
}

export interface ReportFilters extends Record<string, string | number | boolean | null | undefined> {
  search?: string;
  status?: string;
  reportType?: string;
  entityType?: string;
  priority?: string;
}

export interface ReportUpdatePayload extends Record<string, string | number | boolean | null | undefined> {
  status?: string;
  priority?: string;
  adminResponse?: string;
}

export interface NotificationFilters {
  search?: string;
  type?: string;
  deliveryChannel?: string;
  isRead?: boolean | string;
}

export interface AnnouncementPayload {
  audience?: 'All users' | 'Learners' | 'Admins';
  title?: string;
  message?: string;
  deliveryChannel?: 'InApp' | 'Email' | 'PushNotification';
  actionUrl?: string | null;
}

export interface ContentStatusPayload {
  entityType: AdminEntityType;
  entityId: IdLike;
  status: ContentStatus;
  comment?: string | null;
}
