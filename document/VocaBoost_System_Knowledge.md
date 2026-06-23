# VOCABOOST - COMPREHENSIVE SYSTEM KNOWLEDGE BASE
> Self-contained document for AI tools (NotebookLM, etc.) to fully understand the VocaBoost platform.
> Generated: 2026-05-31

---

## 1. SYSTEM OVERVIEW

**VocaBoost** is a web-based TOEIC vocabulary learning platform that uses **Spaced Repetition** (Ebbinghaus forgetting curve) to help Vietnamese learners memorize English vocabulary long-term. The system replaces traditional rote learning with scientifically-proven interval-based review scheduling.

### Tech Stack (3-Tier Architecture)
- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend:** Node.js + Express.js (RESTful API)
- **Database:** Microsoft SQL Server (14+ tables, Stored Procedures, Views)

### Three User Roles (RBAC)
| Role | Vietnamese Name | Purpose |
|------|----------------|---------|
| **Learner** | Học viên | Study vocabulary, practice flashcards, take mini tests, track progress |
| **ContentCreator** | Biên tập viên (BTV) | Create/manage vocabulary, questions, tests in Draft status. Submit for admin review |
| **Admin** | Quản trị viên (QTV) | Approve/reject creator content, manage users, view system analytics |

---

## 2. CORE ALGORITHMS

### 2.1 Spaced Repetition Engine
The system uses a stored procedure `usp_SubmitQuestionAttempt` that automatically:
1. Compares submitted answer with `CorrectAnswer` in Questions table
2. Records attempt in `ExerciseAttempts`
3. Updates `UserWordProgress`:
   - **Correct answer:** MasteryLevel +1 (max 5), NextReviewDate = Now + (MasteryLevel × 2 days)
   - **Wrong answer:** MasteryLevel reset to 1, MemoryStatus = 'Lapsed', NextReviewDate = Now (immediate re-review)

### 2.2 Flashcard Selection Algorithm
Query: SELECT TOP 15 from Questions JOIN Words LEFT JOIN UserWordProgress
- Filter: `NextReviewDate <= Now` OR never studied (NextReviewDate IS NULL)
- Sort: `MasteryLevel ASC, NEWID()` (prioritize weak words + randomize)

### 2.3 Content Moderation Workflow
```
Creator creates content (Status: Draft)
  → Creator submits for review (Status: PendingReview)
    → Admin reviews
      → Approve → Status: Published (visible to learners)
      → Reject → Status: Rejected + reason logged in ContentReviewLogs
        → Creator edits and resubmits
```

---

## 3. DATABASE SCHEMA (DBML)

```dbml
Table Users {
  UserID bigint [pk, increment]
  FullName nvarchar(200) [not null]
  Email nvarchar(255) [not null, unique]
  PasswordHash nvarchar(500) [not null]
  UserRole nvarchar(30) [not null, note: "Learner | ContentCreator | Admin"]
  IsActive bit [not null, default: 1]
  CreatedAt datetimeoffset [not null]
}

Table PartOfSpeeches {
  PartOfSpeechID int [pk, increment]
  PartOfSpeechCode nvarchar(20) [not null, unique, note: "n | v | adj | adv | prep"]
  PartOfSpeechName nvarchar(100) [not null, unique]
}

Table TopicCategories {
  TopicCategoryID int [pk, increment]
  CategoryName nvarchar(200) [not null, unique]
  Description nvarchar(500)
  SortOrder int [default: 0]
  IsActive bit [default: 1]
}

Table Topics {
  TopicID bigint [pk, increment]
  TopicName nvarchar(200) [not null, unique]
  TopicCode nvarchar(50) [not null, unique]
  Description nvarchar(1000)
  TopicCategoryID int [FK -> TopicCategories]
  Status nvarchar(20) [note: "Draft | PendingReview | Published | Rejected | Archived"]
  CreatedByUserID bigint [FK -> Users]
}

Table Words {
  WordID bigint [pk, increment]
  Term nvarchar(200) [not null]
  PartOfSpeechID int [FK -> PartOfSpeeches]
  Meaning nvarchar(1000) [not null]
  Phonetic nvarchar(255)
  AudioUrlUK nvarchar(1000)
  AudioUrlUS nvarchar(1000)
  ImageUrl nvarchar(1000)
  DifficultyLevel tinyint [default: 1, note: "1-5"]
  Status nvarchar(20) [note: "Draft | PendingReview | Published | Rejected | Archived"]
  CreatedByUserID bigint [FK -> Users]
  UNIQUE(Term, PartOfSpeechID)
}

Table ExampleSentences {
  ExampleSentenceID bigint [pk, increment]
  WordID bigint [FK -> Words, ON DELETE CASCADE]
  SentenceText nvarchar(2000) [not null]
  SentenceTranslation nvarchar(2000)
  AudioUrl nvarchar(1000)
}

Table WordTopics {
  WordID bigint [FK -> Words, ON DELETE CASCADE]
  TopicID bigint [FK -> Topics, ON DELETE CASCADE]
  PK(WordID, TopicID)
}

Table Questions {
  QuestionID bigint [pk, increment]
  WordID bigint [FK -> Words, ON DELETE CASCADE]
  QuestionType nvarchar(30) [note: "MCQ | FillBlank | DragDrop | Dictation | FlashcardCheck"]
  QuestionText nvarchar(2000) [not null]
  OptionsJson nvarchar(max) [note: "JSON array of answer options"]
  CorrectAnswer nvarchar(500) [not null]
  Explanation nvarchar(2000)
  DifficultyLevel tinyint [default: 1]
  Status nvarchar(20) [note: "Draft | PendingReview | Published"]
  CreatedByUserID bigint [FK -> Users]
}

Table UserWordProgress {
  UserWordProgressID bigint [pk, increment]
  UserID bigint [FK -> Users, ON DELETE CASCADE]
  WordID bigint [FK -> Words, ON DELETE CASCADE]
  MasteryLevel tinyint [default: 0, note: "0-10"]
  EaseFactor decimal(4,2) [default: 2.50]
  RepetitionCount int [default: 0]
  ConsecutiveCorrect int [default: 0]
  ConsecutiveWrong int [default: 0]
  NextReviewDate datetimeoffset
  MemoryStatus nvarchar(30) [note: "New | Learning | Reviewing | Mastered | Lapsed"]
  UNIQUE(UserID, WordID)
}

Table ExerciseAttempts {
  ExerciseAttemptID bigint [pk, increment]
  UserID bigint [FK -> Users, ON DELETE CASCADE]
  QuestionID bigint [FK -> Questions]
  WordID bigint [FK -> Words]
  SubmittedAnswer nvarchar(1000) [not null]
  IsCorrect bit [not null]
  ScoreAwarded decimal(5,2)
  AttemptedAt datetimeoffset [not null]
}

Table MiniTests {
  MiniTestID bigint [pk, increment]
  TopicID bigint [FK -> Topics, ON DELETE SET NULL]
  TestTitle nvarchar(255) [not null]
  Description nvarchar(1000)
  CreatedByUserID bigint [FK -> Users]
  TotalQuestions int [default: 0]
  IsPublished bit [default: 0]
}

Table MiniTestItems {
  MiniTestID bigint [FK -> MiniTests, ON DELETE CASCADE]
  QuestionID bigint [FK -> Questions]
  DisplayOrder int [not null]
  PK(MiniTestID, QuestionID)
}

Table ContentReviewLogs {
  LogID bigint [pk, increment]
  AdminUserID bigint [FK -> Users]
  EntityType nvarchar(50) [note: "Topic | Word | Question | MiniTest"]
  EntityID bigint
  Action nvarchar(20) [note: "Approve | Reject | Archive"]
  Reason nvarchar(1000)
  CreatedAt datetimeoffset
}

Table MediaFiles {
  MediaFileID bigint [pk, increment]
  FileName nvarchar(500)
  FileUrl nvarchar(1000)
  FileType nvarchar(50) [note: "image | audio"]
  UploadedByUserID bigint [FK -> Users]
}

Table UserTopicSubscriptions {
  UserID bigint [FK -> Users]
  TopicID bigint [FK -> Topics]
  IsActive bit [default: 1]
}

Table UserVocabularyNotebook {
  NotebookID bigint [pk, increment]
  UserID bigint [FK -> Users]
  WordID bigint [FK -> Words]
  PersonalNote nvarchar(1000)
  IsFavorite bit [default: 0]
}
```

### Database Views
- `vw_ContentCreatorContentSummary` - Aggregates content count (topics, words, questions) per Creator
- `vw_TopicLearningAnalytics` - Average mastery level per topic across all learners
- `vw_MiniTestAnalytics` - Test attempt counts, average scores per mini test
- `vw_TopicCategoryOverview` - Topic count per category with status breakdown

---

## 4. COMPLETE API REFERENCE

### 4.1 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new Learner account (fullName, email, password) |
| POST | `/login` | Login → returns JWT token + user info with permissions |

**JWT Payload:** `{id, fullName, role, permissions[]}` — expires in 1 day.
**Password:** Hashed with Bcrypt (salt rounds: 10).

### 4.2 Learner API (`/api/user`) — requires `verifyToken`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/flashcards` | Get 15 due flashcards (Spaced Repetition) |
| POST | `/submit-answer` | Submit answer → calls SP `usp_SubmitQuestionAttempt` |
| GET | `/stats` | Dashboard stats (mastery, accuracy, weak words, achievements) |
| GET | `/dashboard/mastery-timeline` | Mastery progression over time |
| GET | `/topics/:topicId/words` | Get words in a specific topic |
| GET | `/minitests` | List published mini tests |
| GET | `/minitests/:id` | Get test detail with questions |
| POST | `/minitests/:id/submit` | Batch submit minitest answers |
| GET | `/minitests/history` | Test history grouped by date |
| GET | `/minitests/session-details` | Detailed session review |
| PUT | `/profile` | Update user profile |
| GET | `/activity/heatmap` | Calendar activity heatmap data |
| GET | `/goals/daily-progress` | Daily learning goal progress |
| GET/PUT | `/goals/daily-goal` | Get/set daily word goal |
| PUT | `/goals/srs-config` | Configure SRS parameters |
| GET | `/review/smart-queue` | AI-prioritized review queue |
| GET | `/review/session-summary` | Post-session summary |
| GET | `/review/mistakes` | Mistake review queue |
| GET | `/notifications` | User notifications |
| PUT | `/notifications/:id/read` | Mark notification read |
| GET/POST/PUT/DELETE | `/notebook` | Vocabulary notebook CRUD |
| POST | `/reports` | Submit content report |

### 4.3 Content Creator API (`/api/creator`) — requires `verifyToken` + permissions
| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| GET | `/dashboard` | VIEW_DASHBOARD | Creator dashboard stats |
| GET | `/content-summary` | VIEW_CONTENT_ANALYTICS | Content analytics |
| GET | `/topic-categories` | — | Read-only dropdown data |
| GET/POST/PUT/DELETE | `/topics` | MANAGE_TOPICS | CRUD topics (own content only) |
| POST | `/topics/:id/submit-review` | SUBMIT_CONTENT_REVIEW | Submit topic for admin review |
| GET/POST/PUT/DELETE | `/words` | MANAGE_WORDS | CRUD words (own content only) |
| POST | `/words/:id/submit-review` | SUBMIT_CONTENT_REVIEW | Submit word for review |
| GET/POST/PUT/DELETE | `/questions` | MANAGE_QUESTIONS | CRUD questions |
| POST | `/questions/:id/submit-review` | SUBMIT_CONTENT_REVIEW | Submit question for review |
| GET/POST/PUT/DELETE | `/mini-tests` | MANAGE_TESTS | CRUD mini tests |
| POST | `/mini-tests/:id/submit-review` | SUBMIT_CONTENT_REVIEW | Submit test for review |

**Ownership Enforcement:** Creators can only edit/delete content they created, and only while Status = 'Draft'.

### 4.4 Admin API (`/api/admin`) — requires `verifyToken` + permissions
| Method | Endpoint | Permission |
|--------|----------|-----------|
| GET/POST/PUT/DELETE | `/topics` | MANAGE_TOPICS |
| GET/POST/PUT/DELETE | `/topic-categories` | MANAGE_TOPIC_CATEGORIES |
| GET/POST/PUT/DELETE | `/words` | MANAGE_WORDS |
| POST | `/words/import-preview` | MANAGE_WORDS |
| POST | `/words/bulk-import` | MANAGE_WORDS |
| DELETE | `/words/:id/hard` | MANAGE_SYSTEM_SETTINGS |
| GET/POST/PUT/DELETE | `/questions` | MANAGE_QUESTIONS |
| POST | `/questions/bulk-import` | MANAGE_QUESTIONS |
| GET/POST/PUT/DELETE | `/minitests` | MANAGE_TESTS |
| PATCH | `/minitests/:id/publish` | MANAGE_TESTS |
| GET | `/stats` | VIEW_DASHBOARD |
| GET/POST/PUT/DELETE/PATCH | `/students` | MANAGE_USERS |
| PATCH | `/students/:id/role` | MANAGE_USERS |
| GET | `/analytics` | VIEW_DASHBOARD |
| GET | `/content-management` | VIEW_DASHBOARD |
| PATCH | `/content-status` | MANAGE_SYSTEM_SETTINGS |
| GET | `/audit-logs` | VIEW_AUDIT_LOGS |
| GET/PATCH | `/reports` | MANAGE_REPORTS |
| GET/POST | `/notifications` | MANAGE_NOTIFICATIONS |

### 4.5 Content Review API (`/api/review`) — requires REVIEW_CONTENT
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pending` | List all pending content |
| POST | `/:entityType/:entityId/approve` | Approve content → Published |
| POST | `/:entityType/:entityId/reject` | Reject + reason → Rejected |
| POST | `/:entityType/:entityId/archive` | Archive content |
| GET | `/:entityType/:entityId/logs` | View review history |

### 4.6 Categories API (`/api/categories`)
| GET | `/part-of-speeches` | List all parts of speech |
| GET | `/topics` | List all published topics |

---

## 5. FRONTEND ARCHITECTURE

### 5.1 Project Structure
```
frontend/src/
├── app/
│   ├── page.tsx              # Landing page (7 sections: Navbar, Hero, Features, Courses, HowItWorks, Achievements, Footer)
│   ├── login/page.tsx        # Login form (Zod validation)
│   ├── register/page.tsx     # Registration form
│   ├── context/AuthContext.tsx # Global auth state (user, token, isAdmin, isCreator)
│   ├── user/                 # Learner pages (protected: isAuthenticated)
│   │   ├── dashboard/        # Stats cards, charts, weak words, achievements
│   │   ├── learn/            # Learn new vocabulary by topic
│   │   ├── practice/         # Flashcard practice (Spaced Repetition)
│   │   ├── minitests/        # Take tests, view history
│   │   ├── achievements/     # Badges and gamification
│   │   ├── notebook/         # Personal vocabulary notebook
│   │   ├── progress/         # Learning progress tracking
│   │   ├── courses/          # Browse topics/courses
│   │   └── settings/         # Profile settings, daily goal, SRS config
│   ├── creator/              # Content Creator pages (protected: isCreator)
│   │   ├── dashboard/        # Creator content analytics
│   │   ├── topics/           # CRUD topics
│   │   ├── words/            # CRUD words with examples
│   │   ├── questions/        # CRUD questions
│   │   ├── mini-tests/       # CRUD mini tests
│   │   ├── media/            # Upload/manage media assets
│   │   ├── drafts/           # View draft content
│   │   ├── pending/          # View pending review content
│   │   ├── rejected/         # View rejected content with reasons
│   │   ├── import/           # Bulk import tools
│   │   └── analytics/        # Content performance analytics
│   └── admin/                # Admin pages (protected: isAdmin)
│       ├── dashboard/        # System-wide analytics
│       ├── words/            # Manage all words
│       ├── questions/        # Manage all questions
│       ├── minitests/        # Manage all tests
│       ├── students/         # User management (CRUD, toggle active, change role)
│       ├── topic-categories/ # Manage topic categories
│       ├── content-review/   # Approve/reject creator content
│       ├── analytics/        # Charts: daily trends, word distribution
│       ├── audit-logs/       # System audit trail
│       ├── reports/          # User content reports
│       ├── notifications/    # Send announcements
│       └── courses/          # Course management
├── services/                 # API service modules
│   ├── auth.service.ts       # login, register, logout, getCurrentUser
│   ├── user.service.ts       # flashcards, stats, minitest, notebook, etc.
│   ├── admin.service.ts      # words, questions, students, analytics CRUD
│   ├── creator.service.ts    # creator-specific CRUD with ownership
│   └── categories.service.ts # topics, part-of-speeches
├── components/               # Shared UI components
│   ├── Sidebar.tsx           # Role-based navigation sidebar
│   └── Topbar.tsx            # Header with search, notifications, avatar
└── lib/
    ├── api-client.ts         # Axios instance with JWT interceptor
    └── validations.ts        # Zod schemas for client-side validation
```

### 5.2 Authentication Flow
```
User submits login form
→ Zod validates on client
→ auth.service.ts calls POST /api/auth/login
→ Server: validate → bcrypt.compare → query permissions → jwt.sign
→ Response: {token, user: {id, fullName, email, role, permissions[]}}
→ localStorage stores token + user
→ AuthContext updates state
→ Redirect: Admin→/admin/dashboard, Creator→/creator/dashboard, Learner→/user/dashboard
```

### 5.3 Route Protection
| Layout | Condition | Unauthorized Redirect |
|--------|-----------|----------------------|
| `/user/*` | `isAuthenticated` | → `/login` |
| `/creator/*` | `isAuthenticated + isCreator` | → `/login` |
| `/admin/*` | `isAuthenticated + isAdmin` | → `/login` or `/user/dashboard` |

---

## 6. BACKEND ARCHITECTURE

### 6.1 Middleware Pipeline
```
Request → helmet() → cors() → express.json() → Request Logger
  → Route Handler:
    → verifyToken (decode JWT, attach req.user)
    → checkPermission('PERMISSION_CODE') (verify permission in JWT)
    → validate(zodSchema) (validate req.body/params/query)
    → Controller (extract data, call Service)
    → Service (business logic, SQL queries)
    → Response
  → errorHandler (catch-all, log stack, return 500)
```

### 6.2 Key Backend Services
| Service | Responsibilities |
|---------|-----------------|
| `auth.service.js` | Register (hash password, assign Learner role), Login (verify, sign JWT) |
| `user.service.js` (40KB) | Flashcards, submit answer (calls SP), stats, achievements (8 badges), mini tests, notebook, daily goals, smart review, notifications |
| `admin.service.js` (93KB) | Full CRUD for all entities, bulk import (CSV), dashboard stats, student management, analytics, content management, audit logs, reports, notifications |
| `creator.service.js` (25KB) | Ownership-scoped CRUD, submit-for-review, creator dashboard, content analytics |
| `review.service.js` (8KB) | getPending, approve/reject/archive with ContentReviewLogs |
| `categories.service.js` | Read-only: getPartOfSpeeches, getTopics |
| `progress.service.js` | Learning progress calculations |
| `report.service.js` | Content reporting system |

### 6.3 Database Connection
- Singleton pattern: `ConnectionPool` with max 10 connections
- Config from `.env`: DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME
- Graceful shutdown on SIGTERM/SIGINT

---

## 7. GAMIFICATION & ACHIEVEMENTS

The system tracks 8 achievement badges based on learning metrics:
1. **First Steps** - Complete first exercise
2. **Word Collector** - Learn 50 words
3. **Vocabulary Master** - Master 100 words (MasteryLevel ≥ 3)
4. **Quiz Champion** - Complete 10 mini tests
5. **Streak Master** - 7-day learning streak
6. **Perfect Score** - 100% accuracy in a mini test
7. **Speed Learner** - Learn 20 words in one day
8. **Dedication** - 30 total learning sessions

---

## 8. SECURITY MEASURES

- **Password Hashing:** Bcrypt with 10 salt rounds
- **Authentication:** Stateless JWT (1-day expiry)
- **Authorization:** RBAC with granular permission codes stored in DB
- **SQL Injection Prevention:** Parameterized queries (mssql library prepared statements)
- **HTTP Security Headers:** Helmet.js middleware
- **CORS:** Configured for cross-origin frontend requests
- **Ownership Check:** Creators can only modify their own Draft content
- **Input Validation:** Zod schemas on both client and server

---

## 9. DATA FLOW EXAMPLES

### Flow 1: Learner Practices Flashcard
```
1. Learner opens /user/practice
2. Frontend calls GET /api/user/flashcards (Bearer token)
3. Backend queries 15 due words (NextReviewDate <= now, sorted by MasteryLevel ASC)
4. Learner answers question
5. Frontend calls POST /api/user/submit-answer {questionId, submittedAnswer}
6. Backend executes SP usp_SubmitQuestionAttempt:
   - Checks correctness
   - INSERT into ExerciseAttempts
   - UPDATE UserWordProgress (MasteryLevel, NextReviewDate, MemoryStatus)
7. Response: {isCorrect, correctAnswer, newMasteryLevel}
```

### Flow 2: Creator Publishes Content
```
1. Creator creates a Word (POST /api/creator/words) → Status: Draft
2. Creator reviews and submits (POST /api/creator/words/:id/submit-review) → Status: PendingReview
3. Admin sees pending item (GET /api/review/pending)
4. Admin approves (POST /api/review/word/:id/approve) → Status: Published
   - ContentReviewLogs entry created
   - Word now appears in learner queries
```

### Flow 3: Admin Creates Word with Topics & Examples (Transaction)
```
1. BEGIN TRANSACTION
2. INSERT into Words → get WordID
3. Loop: INSERT into WordTopics for each selected topic
4. Loop: INSERT into ExampleSentences for each example
5. COMMIT (or ROLLBACK on error)
```
