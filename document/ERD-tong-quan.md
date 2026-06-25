# ERD Tổng quan — Hệ thống VocaBoost

> 29 tables, SQL Server. 6 nhóm: Core → Nội dung → Học tập → Mini Test → Gamification → Lộ trình

---

## 1. Core — Người dùng & Phân quyền

```mermaid
erDiagram
    Users {
        bigint UserID PK
        nvarchar FullName
        nvarchar Email UK
        nvarchar PasswordHash
        nvarchar UserRole "Learner | ContentCreator | Admin"
        bit IsActive
        int DailyGoal "default 20"
        int SRSReviewLimit "default 15"
        int TotalXP "default 0"
        int CurrentLevel "default 1"
        int RoleID FK
    }

    Roles {
        int RoleID PK
        nvarchar RoleName UK
    }

    Permissions {
        int PermissionID PK
        nvarchar PermissionCode UK
    }

    RolePermissions {
        int RoleID PK,FK
        int PermissionID PK,FK
    }

    Users ||--o{ Roles:"RoleID"
    Roles ||--o{ RolePermissions: ""
    Permissions ||--o{ RolePermissions: ""
```

---

## 2. Nội dung từ vựng

```mermaid
erDiagram
    Topics {
        bigint TopicID PK
        nvarchar TopicName UK
        nvarchar TopicCode UK
        nvarchar Description
        bigint CreatedByUserID FK
        bigint TopicCategoryID FK "nullable"
        nvarchar ContentStatus "Draft | PendingReview | Published | Rejected | Archived"
    }

    Words {
        bigint WordID PK
        nvarchar Term
        int PartOfSpeechID FK
        nvarchar Meaning
        nvarchar Phonetic
        nvarchar AudioUrlUK
        nvarchar AudioUrlUS
        tinyint DifficultyLevel "1-5"
        bigint CreatedByUserID FK
        nvarchar ContentStatus
    }

    PartOfSpeeches {
        int PartOfSpeechID PK
        nvarchar PartOfSpeechCode UK
        nvarchar PartOfSpeechName UK
    }

    WordTopics {
        bigint WordID PK,FK
        bigint TopicID PK,FK
    }

    ExampleSentences {
        bigint ExampleSentenceID PK
        bigint WordID FK
        nvarchar SentenceText
        nvarchar SentenceTranslation
    }

    TopicCategories {
        bigint TopicCategoryID PK
        nvarchar CategoryName
        nvarchar CategoryCode UK
        bit IsActive
    }

    Words ||--o{ WordTopics: ""
    Topics ||--o{ WordTopics: ""
    Words ||--o{ ExampleSentences: ""
    Words ||--o{ PartOfSpeeches: "PartOfSpeechID"
    Topics ||--o{ TopicCategories: "TopicCategoryID"
    Users ||--o{ Topics: "CreatedByUserID"
    Users ||--o{ Words: "CreatedByUserID"
```

---

## 3. Học tập & Luyện tập

```mermaid
erDiagram
    Questions {
        bigint QuestionID PK
        bigint WordID FK
        nvarchar QuestionType "MCQ | FillBlank | DragDrop | Dictation | FlashcardCheck"
        nvarchar QuestionText
        nvarchar OptionsJson "ISJSON"
        nvarchar CorrectAnswer
        nvarchar Explanation
        tinyint DifficultyLevel "1-5"
        bigint CreatedByUserID FK
        nvarchar ContentStatus
    }

    UserWordProgress {
        bigint UserWordProgressID PK
        bigint UserID FK
        bigint WordID FK
        tinyint MasteryLevel "0-10"
        decimal EaseFactor "1.30-3.50"
        int RepetitionCount
        int ConsecutiveWrong
        datetimeoffset NextReviewDate
        nvarchar MemoryStatus "New | Learning | Reviewing | Mastered | Lapsed"
    }

    ExerciseAttempts {
        bigint ExerciseAttemptID PK
        bigint UserID FK
        bigint QuestionID FK
        bigint WordID FK
        nvarchar SubmittedAnswer
        bit IsCorrect
        datetimeoffset AttemptedAt
    }

    UserTopicEnrollments {
        bigint UserTopicEnrollmentID PK
        bigint UserID FK
        bigint TopicID FK
        bit IsActive
    }

    UserVocabularyNotebook {
        bigint NotebookID PK
        bigint UserID FK
        bigint WordID FK
        nvarchar PersonalNote
        bit IsFavorite
    }

    Notifications {
        bigint NotificationID PK
        bigint UserID FK
        nvarchar Title
        nvarchar Message
        bit IsRead
    }

    Users ||--o{ UserWordProgress: ""
    Words ||--o{ UserWordProgress: ""
    Users ||--o{ ExerciseAttempts: ""
    Questions ||--o{ ExerciseAttempts: ""
    Words ||--o{ Questions: ""
    Users ||--o{ UserTopicEnrollments: ""
    Topics ||--o{ UserTopicEnrollments: ""
    Users ||--o{ UserVocabularyNotebook: ""
    Words ||--o{ UserVocabularyNotebook: ""
    Users ||--o{ Notifications: ""
    Users ||--o{ Questions: "CreatedByUserID"
```

---

## 4. Mini Test

```mermaid
erDiagram
    MiniTests {
        bigint MiniTestID PK
        bigint TopicID FK "nullable"
        nvarchar TestTitle
        int TotalQuestions
        bit IsPublished
        bigint CreatedByUserID FK
        nvarchar ContentStatus
    }

    MiniTestItems {
        bigint MiniTestID PK,FK
        bigint QuestionID PK,FK
        int DisplayOrder UK "tren 1 MiniTest"
    }

    MiniTestAttempts {
        bigint MiniTestAttemptID PK
        bigint MiniTestID FK
        bigint UserID FK
        datetimeoffset SubmittedAt "null = chua xong"
        int CorrectCount
        decimal Score "0-100"
    }

    MiniTests ||--o{ MiniTestItems: ""
    Questions ||--o{ MiniTestItems: ""
    MiniTests ||--o{ MiniTestAttempts: ""
    Users ||--o{ MiniTestAttempts: ""
    Topics ||--o{ MiniTests: "TopicID"
```

---

## 5. Gamification

```mermaid
erDiagram
    Achievements {
        int AchievementID PK
        nvarchar Code UK
        nvarchar Name
        nvarchar Description
        nvarchar Icon "emoji"
        nvarchar CriteriaType "WORDS_LEARNED | STREAK_DAYS | TEST_SCORE | LEVEL"
        int CriteriaValue "nguong kich hoat"
    }

    UserAchievements {
        bigint UserAchievementID PK
        bigint UserID FK
        int AchievementID FK
        datetimeoffset UnlockedAt
        datetimeoffset SeenAt "null = chua xem"
    }

    UserXPEvents {
        bigint XPEventID PK
        bigint UserID FK
        nvarchar EventType "LearnWord | PracticeComplete | MiniTestComplete | DailyLogin"
        int XPAmount "5 | 10 | 20"
        nvarchar SourceKey "dedup: learn-word:{wordId}:{date}"
    }

    Users ||--o{ UserAchievements: ""
    Achievements ||--o{ UserAchievements: ""
    Users ||--o{ UserXPEvents: ""
```

---

## 6. Lộ trình học tập

```mermaid
erDiagram
    LearningPathLevels {
        int LearningPathLevelID PK
        nvarchar LevelCode UK "TOEIC_300 | TOEIC_500 | TOEIC_700 | TOEIC_900"
        nvarchar LevelName
        int TargetScore
        int DisplayOrder UK
        nvarchar AccentKey "sky | emerald | amber | violet"
    }

    LearningPathTopics {
        bigint LearningPathTopicID PK
        int LearningPathLevelID FK
        bigint TopicID FK UK "1 topic chi 1 level"
        int DisplayOrder
        bit IsRequired "default 1"
    }

    LearningPathLevels ||--o{ LearningPathTopics: ""
    Topics ||--o{ LearningPathTopics: ""
```

---

## 7. Quản lý nội dung

```mermaid
erDiagram
    MediaAssets {
        bigint MediaAssetID PK
        bigint UploadedByUserID FK
        nvarchar MediaType "AudioUK | AudioUS | Image | ExampleAudio | QuestionAudio | QuestionImage"
        nvarchar FileUrl
        nvarchar AltText
        nvarchar Transcript
    }

    ContentMediaLinks {
        bigint ContentMediaLinkID PK
        bigint MediaAssetID FK
        nvarchar EntityType "Word | Question | ExampleSentence | Topic"
        bigint EntityID "polymorphic FK"
        int DisplayOrder
    }

    ContentReports {
        bigint ContentReportID PK
        bigint ReporterUserID FK
        nvarchar EntityType "Word | Question | Audio | General"
        bigint WordID FK "nullable"
        bigint QuestionID FK "nullable"
        nvarchar ReportType "WordIncorrect | AudioIssue | AnswerIncorrect | Typo | Other"
        nvarchar Description
        nvarchar Status "Open | InReview | Resolved | Rejected"
        nvarchar Priority "Low | Normal | High | Urgent"
    }

    ContentReviewLogs {
        bigint ContentReviewLogID PK
        nvarchar EntityType "Topic | Word | Question | MiniTest"
        bigint EntityID
        bigint ActionByUserID FK
        nvarchar OldStatus
        nvarchar NewStatus
        nvarchar Comment
    }

    AdminAuditLogs {
        bigint AdminAuditLogID PK
        bigint ActionByUserID
        nvarchar Action
        nvarchar EntityType
        nvarchar Details "JSON"
    }

    Users ||--o{ MediaAssets: "UploadedByUserID"
    MediaAssets ||--o{ ContentMediaLinks: ""
    Users ||--o{ ContentReports: "ReporterUserID"
    Words ||--o{ ContentReports: ""
    Questions ||--o{ ContentReports: ""
    Users ||--o{ ContentReviewLogs: "ActionByUserID"
```

---

## Tổng quan — Quan hệ chính

```mermaid
erDiagram
    Users ||--o{ UserWordProgress: ""
    Users ||--o{ ExerciseAttempts: ""
    Users ||--o{ UserAchievements: ""
    Users ||--o{ UserXPEvents: ""
    Users ||--o{ UserVocabularyNotebook: ""
    Users ||--o{ UserTopicEnrollments: ""
    Users ||--o{ Notifications: ""
    Users ||--o{ MiniTestAttempts: ""
    Users ||--o{ ContentReports: "reporter"
    Users ||--o{ Topics: "creator"
    Users ||--o{ Words: "creator"
    Users ||--o{ Questions: "creator"
    Users ||--o{ MiniTests: "creator"

    Words ||--o{ UserWordProgress: ""
    Words ||--o{ WordTopics: ""
    Words ||--o{ ExampleSentences: ""
    Words ||--o{ Questions: ""
    Words ||--o{ ExerciseAttempts: ""
    Words ||--o{ UserVocabularyNotebook: ""

    Topics ||--o{ WordTopics: ""
    Topics ||--o{ MiniTests: ""
    Topics ||--o{ UserTopicEnrollments: ""

    Questions ||--o{ MiniTestItems: ""
    Questions ||--o{ ExerciseAttempts: ""

    MiniTests ||--o{ MiniTestItems: ""
    MiniTests ||--o{ MiniTestAttempts: ""
```

---

## Chú thích

- `PK`: Primary Key
- `FK`: Foreign Key
- `UK`: Unique Key
- `||--o{`: 1-N relationship
- `||--||`: 1-1 relationship
- `}o--o{`: M-N relationship (qua bảng trung gian)

### XP Rewards

| Event | XP | SourceKey dedup |
|---|---|---|
| LearnWord | +5 | `learn-word:{wordId}:{YYYY-MM-DD}` |
| PracticeComplete | +10 | `practice:{sessionKey}` |
| MiniTestComplete | +20 | `mini-test-attempt:{attemptId}` |
| DailyLogin | +5 | `daily-login:{YYYY-MM-DD}` |

### SRS Memory Status

```
New → Learning → Reviewing → Mastered
  ↓ (sai)                                  (sai)
Lapsed ←─────────────────────────────────
```

### Content Review Workflow

```
Draft → PendingReview → Published
                      → Rejected → Draft
Any → Archived
```
