export const PERMISSIONS = {
  viewDashboard: "VIEW_DASHBOARD",
  manageUsers: "MANAGE_USERS",
  manageRoles: "MANAGE_ROLES",
  manageTopics: "MANAGE_TOPICS",
  manageTopicCategories: "MANAGE_TOPIC_CATEGORIES",
  manageWords: "MANAGE_WORDS",
  manageQuestions: "MANAGE_QUESTIONS",
  manageTests: "MANAGE_TESTS",
  reviewContent: "REVIEW_CONTENT",
  publishContent: "PUBLISH_CONTENT",
  manageReports: "MANAGE_REPORTS",
  manageNotifications: "MANAGE_NOTIFICATIONS",
  viewAnalytics: "VIEW_ANALYTICS",
  manageSystemSettings: "MANAGE_SYSTEM_SETTINGS",
  viewAuditLogs: "VIEW_AUDIT_LOGS",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | string;

export const ADMIN_ACCESS_PERMISSIONS: PermissionCode[] = [
  PERMISSIONS.viewDashboard,
  PERMISSIONS.manageUsers,
  PERMISSIONS.manageTopics,
  PERMISSIONS.manageWords,
  PERMISSIONS.manageQuestions,
  PERMISSIONS.manageTests,
  PERMISSIONS.reviewContent,
  PERMISSIONS.manageNotifications,
  PERMISSIONS.manageSystemSettings,
  PERMISSIONS.viewAuditLogs,
];
