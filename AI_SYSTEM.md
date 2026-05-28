# VocaBoost — AI System Documentation

> A full-stack English vocabulary learning platform with SRS (Spaced Repetition System), role-based access control, and content workflow management.

**Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4 | Express 5 + Node.js | SQL Server (MSSQL) | Docker

---

## 1. Project Architecture

```
┌─────────────────────┐      ┌─────────────────────┐      ┌──────────────┐
│   Frontend          │      │   Backend           │      │   Database   │
│   Next.js 16        │─────▶│   Express 5 + Node  │─────▶│   SQL Server │
│   TypeScript        │ REST │   JavaScript        │ SQL  │   (MSSQL)    │
│   Tailwind + shadcn │      │   JWT Auth          │      │              │
└─────────────────────┘      └─────────────────────┘      └──────────────┘
```

**Ports:** Frontend = `:3000` | Backend = `:3001` | Database = `:1433`

**API Base URL:** `http://localhost:3001/api` (configured via `NEXT_PUBLIC_API_URL`)

---

## 2. Tech Stack

| Layer | Technology | Version/Notes |
|---|---|---|
| **Frontend Framework** | Next.js (App Router) | `^16.2.3` — uses React Compiler, Turbopack caching |
| **UI Components** | shadcn/ui with Base UI | Custom component primitives + manual `components.json` |
| **Styling** | Tailwind CSS 4 | `tw-animate-css`, `class-variance-authority`, `tailwind-merge` |
| **Icons** | Lucide React, Phosphor Icons | |
| **Charts** | Recharts | Admin/user analytics dashboards |
| **Forms** | react-hook-form + Zod | |
| **HTTP Client** | Axios | Singleton with interceptors for JWT |
| **Animation** | Framer Motion | `^12.38.0` |
| **Backend Framework** | Express 5 | `^5.2.1` |
| **Database Driver** | mssql / msnodesqlv8 | Supports both SQL auth + Windows auth |
| **Auth** | jsonwebtoken (JWT) + bcrypt | 1-day expiry |
| **Validation** | Zod (both FE + BE) | Shared validation schemas |
| **Security** | helmet, cors | |
| **Database** | SQL Server (MSSQL) | Raw SQL queries, stored procedures |
| **Container** | Docker + docker-compose | SQL Server 2022 Linux image |

---

## 3. Project Structure

```
/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── index.js            # Entry point — mounts routes, middleware, error handler
│   │   ├── config/
│   │   │   ├── db.js           # MSSQL connection pool (supports Windows + SQL auth)
│   │   │   ├── health-check.js # CLI diagnostic tool
│   │   │   └── integration-test.js # E2E API test script
│   │   ├── middlewares/
│   │   │   ├── auth.js         # JWT verify, permission checks, ownership check
│   │   │   ├── validate.js     # Zod schema validation middleware
│   │   │   └── errorHandler.js # Global error handler
│   │   ├── routes/             # 7 route files (auth, user, admin, creator, categories, progress, review)
│   │   ├── controllers/        # 7 controller files — thin layer between routes + services
│   │   └── services/           # 9 service files — business logic + SQL queries
│   ├── setup-test-users.js
│   └── test-phase5.js
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page (Hero, Features, Courses, Pricing, etc.)
│   │   │   ├── layout.tsx      # Root layout (AuthProvider + Toaster)
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Register page
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx # Global auth state (user, token, permissions)
│   │   │   ├── user/           # Learner portal (protected)
│   │   │   ├── admin/          # Admin portal (protected, permission-gated)
│   │   │   └── creator/        # Content Creator portal (protected)
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui primitives (~30 components)
│   │   │   ├── shared/         # Sidebar, Topbar, ReportDialog
│   │   │   ├── admin/          # ChartFrame, AdminPrimitives
│   │   │   ├── user/           # StudyReminder, CalendarHeatmap
│   │   │   └── *.tsx           # Landing page sections (Navbar, Hero, Features, etc.)
│   │   ├── services/           # 5 API service modules (auth, admin, user, creator, categories)
│   │   ├── lib/
│   │   │   ├── api-client.ts   # Axios instance with JWT interceptors
│   │   │   └── validations.ts  # Zod schemas for login/register forms
│   │   └── modules/
│   │       ├── auth/           # Permission system (types, utils, hooks, PermissionGate)
│   │       └── admin/          # DataTable component
│   └── proxy.ts                # Dev proxy configuration
├── Database/                   # SQL scripts
│   ├── prototype_database.sql  # Main schema
│   ├── full-latest-db.sql      # Latest full schema + seed
│   ├── seed_data_final.sql     # Comprehensive demo data
│   └── migration_*.sql         # Incremental migration scripts
├── docker-compose.yml          # MSSQL + Backend + Frontend
├── DEPLOY_GUIDE.md             # Deployment instructions
├── system_documentation.md     # Original Vietnamese system doc (older version)
└── README.md                   # Project README (Vietnamese)
```

---

## 4. Backend Architecture

### 4.1 Entry Point (`backend/src/index.js`)

- Initializes Express with helmet, cors, JSON parsing
- Request logger middleware (logs `[timestamp] METHOD /path`)
- Health check at `GET /api/health` (checks DB connectivity)
- Mounts 7 route groups under `/api/`
- Global error handler at the end
- Graceful shutdown on SIGTERM/SIGINT (closes DB pool)
- Handles `unhandledRejection` + `uncaughtException` to prevent crashes

### 4.2 Database Connection (`backend/src/config/db.js`)

- Uses `mssql` package with connection pooling (max 10)
- Supports **two auth modes** via `DB_AUTH` env var:
  - `"windows"` → uses `mssql/msnodesqlv8` with Windows Auth (Trusted_Connection)
  - Default → SQL Server authentication with user/password
- Supports SQL Server instances (`SERVER\INSTANCE` format)
- Exports `sql` (driver) and `poolPromise` (connected pool singleton)
- Auto-creates pool on import — all services import these to run queries

### 4.3 Middleware Layer

#### Auth Middleware (`middlewares/auth.js`)
| Function | Purpose |
|---|---|
| `verifyToken` | Decodes JWT from `Authorization: Bearer <token>`, attaches `req.user` |
| `checkPermission(code)` | Factory → checks `req.user.permissions` includes the code |
| `checkAnyPermission(codes)` | Factory → checks user has at least one of the listed permissions |
| `checkOwnership(table, idCol, paramName, ownerCol)` | Dynamic ownership check: system managers bypass; creators must own. Used by creator routes. |

**JWT Payload:** `{ id, fullName, role, permissions[] }` (1 day expiry)

#### Validation Middleware (`middlewares/validate.js`)
- Uses Zod to validate `req.body`, `req.query`, `req.params`
- `validate(schema)` → returns middleware that parses + sanitizes
- Defines schemas for: `register`, `login`, `createTopic`, `updateTopic`, `createWord`, `createQuestion`, `miniTest`, `contentStatus`, `createReport`, `updateReport`

#### Error Handler (`middlewares/errorHandler.js`)
- Catches unhandled errors → returns 500 with error message
- Stack trace logged to console only

### 4.4 API Routes

#### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new Learner (bcrypt hash) |
| POST | `/login` | No | Login → returns JWT + user with permissions |

#### User/Learner (`/api/user`) — requires `verifyToken`
| Method | Path | Description |
|---|---|---|
| GET | `/flashcards` | Get due flashcards (SRS) — supports `topicId` & `mode` params |
| GET | `/topics/:topicId/words` | Get words in a topic with progress |
| POST | `/submit-answer` | Submit answer (questionId or wordId) |
| GET | `/stats` | User stats (learned, accuracy, weak words, streak, achievements, daily trends) |
| GET | `/dashboard/mastery-timeline` | Mastery projection data |
| GET | `/minitests` | Published mini-tests (paginated, with loading skeleton) |
| GET | `/minitests/history` | Test attempt history (paginated, with detail dialog) |
| GET | `/minitests/session-details` | Detailed session results (testId + date) |
| GET | `/minitests/:id` | Mini-test questions |
| POST | `/minitests/:id/submit` | **Batch submit** — submit all answers in 1 transaction |
| PUT | `/profile` | Update fullName |
| POST | `/reports` | Submit content report |
| GET | `/activity/heatmap` | Yearly activity data for calendar heatmap |
| GET | `/goals/daily-progress` | Today's exercise count |
| GET | `/goals/daily-goal` | Get DailyGoal & SRSReviewLimit from `Users` table |
| PUT | `/goals/daily-goal` | Update DailyGoal (clamped 5–100) |
| PUT | `/goals/srs-config` | Update SRSReviewLimit (clamped 5–50) |
| GET | `/review/smart-queue` | Smart review queue (prioritized by urgency) |
| GET | `/notebook` | Vocabulary notebook (paginated, with CSV export) |
| GET | `/notebook/check` | Check if word is in notebook |
| POST | `/notebook` | Add notebook entry |
| PUT | `/notebook/:id` | Update notebook entry (note, favorite) |
| DELETE | `/notebook/:id` | Delete notebook entry |

#### Admin (`/api/admin`) — requires `verifyToken` + permissions
| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/topics` | MANAGE_TOPICS/WORDS | List topics (paginated, filterable) |
| POST | `/topics` | MANAGE_TOPICS/WORDS | Create topic |
| PUT | `/topics/:id` | MANAGE_TOPICS/WORDS | Update topic |
| DELETE | `/topics/:id` | MANAGE_TOPICS/WORDS | Delete or archive topic |
| GET | `/topic-categories` | MANAGE_TOPIC_CATEGORIES | List topic categories |
| POST | `/topic-categories` | MANAGE_TOPIC_CATEGORIES | Create category |
| PUT | `/topic-categories/:id` | MANAGE_TOPIC_CATEGORIES | Update category |
| DELETE | `/topic-categories/:id` | MANAGE_TOPIC_CATEGORIES | Disable category |
| GET | `/words` | MANAGE_WORDS | List words (paginated, filterable, sortable) |
| GET | `/words/:id` | MANAGE_WORDS | Word detail (with topics, examples, questions, audit logs) |
| POST | `/words` | MANAGE_WORDS | Create word (transactional: word + topics + examples) |
| PUT | `/words/:id` | MANAGE_WORDS | Update word |
| DELETE | `/words/:id` | MANAGE_WORDS | Soft-delete (archive) |
| DELETE | `/words/:id/hard` | MANAGE_SYSTEM_SETTINGS | Hard delete (full cascade) |
| POST | `/words/bulk-import` | MANAGE_WORDS | CSV/JSON bulk import |
| POST | `/words/import-preview` | MANAGE_WORDS | Preview import validation |
| GET | `/questions/:wordId` | MANAGE_QUESTIONS | Questions for a word (paginated) |
| POST | `/questions` | MANAGE_QUESTIONS | Create question |
| PUT | `/questions/:id` | MANAGE_QUESTIONS | Update question |
| DELETE | `/questions/:id` | MANAGE_QUESTIONS | Delete question |
| POST | `/questions/bulk-import` | MANAGE_QUESTIONS | CSV bulk import |
| GET | `/minitests` | MANAGE_TESTS | List mini-tests |
| POST | `/minitests` | MANAGE_TESTS | Create mini-test |
| PUT | `/minitests/:id` | MANAGE_TESTS | Update mini-test |
| DELETE | `/minitests/:id` | MANAGE_TESTS | Delete mini-test |
| PATCH | `/minitests/:id/publish` | MANAGE_TESTS | Publish |
| PATCH | `/minitests/:id/archive` | MANAGE_TESTS | Archive |
| GET | `/stats` | VIEW_DASHBOARD | Dashboard stats (users, words, attempts, growth, activity) |
| GET | `/students` | MANAGE_USERS | List students (paginated, filterable) |
| POST | `/students` | MANAGE_USERS | Create user |
| PUT | `/students/:id` | MANAGE_USERS | Update user |
| DELETE | `/students/:id` | MANAGE_USERS | Delete user |
| PATCH | `/students/:id/toggle` | MANAGE_USERS | Toggle active status |
| PATCH | `/students/:id/role` | MANAGE_USERS | Change role |
| GET | `/analytics` | VIEW_DASHBOARD | Analytics data (accuracy, popular quizzes, activity, word distribution) |
| GET | `/content-management` | VIEW_DASHBOARD | Content overview (all entities, statuses) |
| PATCH | `/content-status` | SYSTEM_SETTINGS | Update any content status |
| GET | `/audit-logs` | VIEW_AUDIT_LOGS | Admin action audit trail |
| GET | `/reports` | MANAGE_REPORTS | Content reports |
| PATCH | `/reports/:id` | MANAGE_REPORTS | Update report |
| GET | `/notifications` | MANAGE_NOTIFICATIONS | System notifications |
| POST | `/notifications` | MANAGE_NOTIFICATIONS | Send announcement |
| POST | `/notifications/daily-reminders` | MANAGE_NOTIFICATIONS | Generate daily reminders |

#### Content Creator (`/api/creator`) — requires `verifyToken` + permissions
| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/dashboard` | VIEW_DASHBOARD | Creator dashboard stats |
| GET | `/content-summary` | VIEW_CONTENT_ANALYTICS | Content counts by status |
| GET | `/topics/:id/analytics` | VIEW_CONTENT_ANALYTICS | Topic learning analytics |
| GET | `/mini-tests/:id/analytics` | VIEW_CONTENT_ANALYTICS | Mini-test analytics |
| GET | `/topic-categories` | (none) | Read-only categories for dropdown |
| CRUD | `/topics` | MANAGE_TOPICS | Topic CRUD (creators only see their own) |
| POST | `/topics/:id/submit-review` | SUBMIT_CONTENT_REVIEW | Submit for admin review |
| CRUD | `/words` | MANAGE_WORDS | Word CRUD (scoped to creator) |
| POST | `/words/:id/submit-review` | SUBMIT_CONTENT_REVIEW | Submit for review |
| CRUD | `/questions` | MANAGE_QUESTIONS | Question CRUD |
| POST | `/questions/:id/submit-review` | SUBMIT_CONTENT_REVIEW | Submit for review |
| CRUD | `/mini-tests` | MANAGE_TESTS | Mini-test CRUD |
| POST | `/mini-tests/:id/items` | MANAGE_TESTS | Add question to test |
| DELETE | `/mini-tests/:id/items/:qId` | MANAGE_TESTS | Remove question from test |
| POST | `/mini-tests/:id/submit-review` | SUBMIT_CONTENT_REVIEW | Submit for review |

#### Content Review (`/api/admin/content-review`) — requires `REVIEW_CONTENT`
| Method | Path | Description |
|---|---|---|
| GET | `/pending` | All pending content across all entity types |
| POST | `/:entityType/:entityId/approve` | Approve (PendingReview → Published) |
| POST | `/:entityType/:entityId/reject` | Reject (→ Rejected with reason) |
| POST | `/:entityType/:entityId/archive` | Archive (any → Archived) |
| GET | `/:entityType/:entityId/logs` | Review history |

#### Categories (`/api/categories`) — requires `verifyToken`
| Method | Path | Description |
|---|---|---|
| GET | `/part-of-speeches` | List parts of speech (Noun, Verb, etc.) |
| GET | `/topics` | List topics (with word counts, progress per user) |

#### Progress (`/api/progress`) — requires `verifyToken`
| Method | Path | Description |
|---|---|---|
| GET | `/` | Learning progress (learned, accuracy, streak, weak words) |
| GET | `/stats` | Mastery levels + weekly activity |

### 4.5 Service Layer

Key conventions:
- All services are **static classes** with static methods
- Every method is `async`, obtains DB pool via `const pool = await poolPromise`
- Raw SQL queries with parameterized inputs (prevents injection)
- Complex operations use **transactions** (`new sql.Transaction(pool)`)
- Pagination uses `OFFSET ... FETCH NEXT ... ROWS ONLY`
- All IDs use `sql.BigInt` type

#### Services Overview

| Service | Key Methods | Tables |
|---|---|---|
| **AuthService** | `register()`, `login()` | Users, Roles, RolePermissions, Permissions |
| **UserService** | `getDueFlashcards()`, `submitAnswer()`, `submitWordReview()`, `getUserStats()`, `getMiniTests()`, `getTestHistory()`, `getTestSessionDetails()`, `updateProfile()`, `getActivityHeatmap()`, `getDailyProgress()`, `getSmartReviewQueue()`, `getNotebook()`, `addNotebookEntry()`, `submitMiniTestBatch()` (transactional batch submit), `getDailyGoal()`, `updateDailyGoal()`, `updateSRSReviewLimit()` | Words, Questions, UserWordProgress, ExerciseAttempts, MiniTests, MiniTestItems, UserVocabularyNotebook, Users |
| **AdminService** | `getTopics()`, `createTopic()`, `getWords()`, `createWord()` (transactional), `getWordDetail()` (5 result sets), `bulkInsertWords()` (CSV parser + fuzzy field matching), `createQuestion()`, `getMiniTests()`, `getDashboardStats()`, `getStudents()`, `getAnalyticsData()`, `getContentManagementData()`, `getNotifications()`, `getAuditLogs()`, `sendAnnouncement()`, `createDailyReminders()`, `logAdminAction()`, `logContentReview()` | 15+ tables |
| **CreatorService** | `getMyTopics()`, `createTopic()` (Draft), `getMyWords()`, `createWord()` (Draft), `getMyQuestions()`, `getMyMiniTests()`, `submitForReview()`, `submitMiniTestForReview()` (validates all questions published) | Topics, Words, Questions, MiniTests, ContentReviewLogs |
| **ReviewService** | `getPendingContent()` (UNION of all entity types), `approve()`, `reject()`, `archive()`, `getReviewLogs()` | Topics, Words, Questions, MiniTests, ContentReviewLogs |
| **CategoriesService** | `getPartOfSpeeches()`, `getTopics()` (with progress stats) | PartOfSpeeches, Topics, Words, UserWordProgress |
| **ProgressService** | `getProgress()`, `getStats()` | UserWordProgress, ExerciseAttempts |
| **ReportService** | `createReport()`, `getReports()`, `updateReport()`, `ensureSchema()` | ContentReports, AdminAuditLogs |

### 4.6 Spaced Repetition System (SRS)

The SRS algorithm is implemented in `UserService.submitWordReview()` using a SQL MERGE statement:

**`UserWordProgress` table key columns:**
- `MasteryLevel` (0-10) — increases on correct, decreases on wrong
- `EaseFactor` (default 2.50)
- `RepetitionCount`
- `ConsecutiveCorrect` / `ConsecutiveWrong`
- `MemoryStatus` — New, Learning, Reviewing, Mastered, Lapsed
- `NextReviewDate` — calculated based on MasteryLevel
- `LastReviewedAt` / `LastScore`

**Review intervals:**
- MasteryLevel 0-1: 1 day
- MasteryLevel 2-4: 3 days
- MasteryLevel 5-7: 7 days
- MasteryLevel 8+: 14 days
- Wrong answer: NextReviewDate = now (immediate re-review)

**Flashcard selection query:**
- Filter: `NextReviewDate IS NULL OR NextReviewDate <= now`
- Order: `MasteryLevel ASC, NEWID()` — lowest mastery first, random among equals
- Limit: 15 cards

### 4.7 Content Workflow

Content entities (Topics, Words, Questions, MiniTests) follow a **status workflow**:

```
Draft → PendingReview → Published
                    ↘ Rejected → (edit) → Draft
Archived ← (any status)
```

- **Creators** create content in `Draft` status
- Creators submit for review → `PendingReview`
- **Admins** review via `/api/admin/content-review/` — approve (→ Published) or reject (→ Rejected)
- Admins can also directly create content in `Published` status
- Soft-delete sets status to `Archived`
- ContentReviewLogs tracks all status changes

---

## 5. Frontend Architecture

### 5.1 Key Design Patterns

- **Auth Context:** `AuthContext.tsx` wraps the entire app, provides `user`, `token`, `login()`, `logout()`, `isAuthenticated`, `isAdmin`, `isCreator`, `permissions`, `hasPermission()`
- **JWT Management:** Token stored in both `localStorage` and cookies; Axios interceptor auto-attaches `Bearer` header; auto-redirects to `/login` on 401
- **Route Protection:** Each role layout (user/admin/creator) checks auth + permissions, redirects on failure
- **Permission System:** `PermissionGate` component + `usePermissions` hook with `hasPermission`, `hasAnyPermission`, `hasAllPermissions`
- **API Layer:** 5 service modules (`auth.service.ts`, `admin.service.ts`, `user.service.ts`, `creator.service.ts`, `categories.service.ts`) all use shared `apiClient`

### 5.2 Route Structure (App Router)

```
/                                   → Landing page
/login                              → Login form
/register                           → Registration form

/user/*                             → Learner portal (auth required)
  /dashboard                        → Overview stats (daily goal synced from backend)
  /learn                            → New vocabulary learning
  /practice                         → Flashcard practice (SRS + Smart Review mode)
  /minitests                        → Available tests (with loading skeleton)
  /minitests/history                → Test history (with detail review dialog)
  /minitests/[id]                   → Take a test (batch submit + result review)
  /courses                          → Course/topic list
  /progress                         → Learning progress
  /achievements                     → Badges & XP
  /notebook                         → Vocabulary notebook (CSV export)
  /settings                         → Profile settings (daily goal + SRS config)

/admin/*                            → Admin portal (MANAGE_* permissions required)
  /dashboard                        → System overview stats
  /words                            → Vocabulary CRUD + bulk import
  /questions                        → Question management
  /minitests                        → Mini-test management
  /topic-categories                 → Topic category management
  /courses                          → Topic management
  /students                         → User management
  /analytics                        → Data analytics
  /content-review                   → Content approval workflow
  /reports                          → User-submitted reports
  /notifications                    → Announcements + reminders
  /audit-logs                       → Admin action audit trail

/creator/*                          → Creator portal (content creator)
  /dashboard                        → Creator stats
  /topics                           → Topic CRUD
  /words                            → Word CRUD
  /questions                        → Question CRUD
  /mini-tests                       → Mini-test CRUD
  /drafts                           → Draft content
  /pending                          → Submitted for review
  /rejected                         → Rejected content
  /media                            → Media management
  /analytics                        → Content performance
```

### 5.3 Key Frontend Components

#### UI Primitives (`components/ui/`)
~30 shadcn/ui-based components including: Button, Input, Card, Dialog, Sheet, Table, Dropdown, Tabs, Badge, Avatar, Calendar, Carousel, Chart, Progress, Skeleton, Tooltip, Accordion, etc.

#### Shared Components (`components/shared/`)
- **Sidebar** — Navigation sidebar, role-aware (student/admin/creator)
- **Topbar** — Top navigation bar (dark mode toggle, search UI placeholder, notifications bell)
- **ReportDialog** — User can report content issues

#### User Components (`components/user/`)
- **StudyReminder** — Daily study reminder widget
- **CalendarHeatmap** — Activity heatmap (GitHub-style)

#### Admin Components (`components/admin/`)
- **ChartFrame** — Wrapper for Recharts charts
- **AdminPrimitives** — Admin UI building blocks

#### Auth Module (`modules/auth/`)
- `PermissionGate` — Conditional rendering based on permissions
- `types/permissions.ts` — Permission code constants (MANAGE_WORDS, VIEW_DASHBOARD, etc.)
- `utils/permissions.ts` — `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`
- `hooks/usePermissions` — React hook wrapping auth context

#### User Module (`modules/user/types/index.ts`)
- **Shared types:** `Flashcard`, `PracticeQuestion`, `SmartReviewItem`, `MiniTest`, `MiniTestQuestion`, `MiniTestAnswer`, `MiniTestResult`, `TestHistory`, `TestSessionDetail`, `DashboardStats`, `MasteryTimeline`, `Achievement`, `HeatmapEntry`, `DailyGoalSetting`, `DailyProgress`, `NotebookEntry`, `PaginatedResponse<T>`, `SubmitAnswerData`

#### Admin Module (`modules/admin/`)
- `DataTable` — Reusable table with search, sort, pagination, selection, bulk actions

---

## 6. Database Schema

### Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| **Users** | All users | UserID, FullName, Email, PasswordHash, UserRole (Learner/ContentCreator/Admin), RoleID, IsActive, **DailyGoal** (int, default 20), **SRSReviewLimit** (int, default 15) |
| **Roles** | Role definitions | RoleID, RoleName (Admin/ContentCreator/Learner) |
| **Permissions** | Permission codes | PermissionID, PermissionCode (MANAGE_WORDS, VIEW_DASHBOARD, etc.) |
| **RolePermissions** | Role ↔ Permission mapping | RolePermissionID, RoleID, PermissionID |
| **Words** | Vocabulary items | WordID, Term, Meaning, Phonetic, PartOfSpeechID, ContentStatus, DifficultyLevel, AudioUrlUK, AudioUrlUS, ImageUrl, CreatedByUserID |
| **PartOfSpeeches** | Parts of speech | PartOfSpeechID, PartOfSpeechName, PartOfSpeechCode, Description |
| **Topics** | Topic categories | TopicID, TopicName, TopicCode, Description, TopicCategoryID, ContentStatus, CreatedByUserID |
| **TopicCategories** | Topic groupings | TopicCategoryID, CategoryName, CategoryCode, Description, IconUrl, DisplayOrder, IsActive |
| **WordTopics** | Word ↔ Topic mapping | WordTopicID, WordID, TopicID, AssignedAt |
| **ExampleSentences** | Word examples | ExampleSentenceID, WordID, SentenceText, SentenceTranslation |
| **Questions** | Exercise questions | QuestionID, WordID, QuestionType (MCQ/FillBlank/DragDrop/Dictation/FlashcardCheck/AudioRecognition), QuestionText, OptionsJson, CorrectAnswer, Explanation, ContentStatus, CreatedByUserID |
| **MiniTests** | Test collections | MiniTestID, TestTitle, Description, TopicID, TotalQuestions, IsPublished, ContentStatus, CreatedByUserID |
| **MiniTestItems** | Questions in a test | MiniTestItemID, MiniTestID, QuestionID, DisplayOrder |
| **ExerciseAttempts** | Answer history | ExerciseAttemptID, UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, AttemptedAt |
| **UserWordProgress** | SRS progress per user | UserWordProgressID, UserID, WordID, MasteryLevel (0-10), EaseFactor, RepetitionCount, ConsecutiveCorrect, ConsecutiveWrong, LastReviewedAt, NextReviewDate, LastScore, MemoryStatus |
| **UserVocabularyNotebook** | Personal word notebook | NotebookID, UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt |
| **ContentReports** | User-submitted reports | ContentReportID, ReporterUserID, EntityType, WordID, QuestionID, ReportType, Title, Description, Status, Priority, AdminResponse |
| **ContentReviewLogs** | Content status audit trail | ContentReviewLogID, EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment, CreatedAt |
| **AdminAuditLogs** | Admin action logs | AdminAuditLogID, ActionByUserID, Action, EntityType, EntityID, Details, CreatedAt |
| **Notifications** | System notifications | NotificationID, UserID, Title, Message, Type, DeliveryChannel, IsRead, ActionUrl, CreatedAt |

### Stored Procedures

| Procedure | Purpose |
|---|---|
| `usp_SubmitQuestionAttempt` | Submit answer → update UserWordProgress (MasteryLevel, NextReviewDate) |

### Views
- `vw_MasteryTimelineProjection` — Mastery projection with estimated completion dates
- `vw_ContentCreatorContentSummary` — Creator content statistics
- `vw_TopicLearningAnalytics` — Topic-level learning analytics
- `vw_MiniTestAnalytics` — Mini-test performance analytics

### Migration Files
- `migration_user_daily_goal.sql` — Adds `DailyGoal` (INT, DEFAULT 20) and `SRSReviewLimit` (INT, DEFAULT 15) columns to `Users` table

---

## 7. Authentication & Permissions

### Auth Flow
```
1. User logs in → POST /api/auth/login
2. Server validates credentials → bcrypt.compare()
3. Server fetches permissions via Roles → RolePermissions → Permissions
4. Server signs JWT: { id, fullName, role, permissions[] } (1 day expiry)
5. Frontend stores token in localStorage + cookie
6. Every API request: Axios interceptor attaches `Authorization: Bearer <token>`
7. Backend verifyToken decodes JWT → attaches req.user
8. checkPermission('MANAGE_WORDS') checks req.user.permissions
```

### Permission Codes
```
VIEW_DASHBOARD, MANAGE_USERS, MANAGE_ROLES, MANAGE_TOPICS,
MANAGE_TOPIC_CATEGORIES, MANAGE_WORDS, MANAGE_QUESTIONS, MANAGE_TESTS,
REVIEW_CONTENT, PUBLISH_CONTENT, MANAGE_REPORTS, MANAGE_NOTIFICATIONS,
VIEW_ANALYTICS, MANAGE_SYSTEM_SETTINGS, VIEW_AUDIT_LOGS, VIEW_CONTENT_ANALYTICS,
SUBMIT_CONTENT_REVIEW, LEARN_VOCAB
```

### Role Defaults
- **Learner**: `VIEW_DASHBOARD, LEARN_VOCAB`
- **ContentCreator**: Creator-specific permissions (MANAGE_TOPICS, MANAGE_WORDS, MANAGE_QUESTIONS, MANAGE_TESTS, VIEW_CONTENT_ANALYTICS, SUBMIT_CONTENT_REVIEW)
- **Admin**: Full access via all MANAGE_*, REVIEW_*, VIEW_* permissions

---

## 8. Key Data Flows

### Flashcard Practice Flow
```
User → /user/practice → GET /api/user/flashcards
  → UserService.getDueFlashcards()
  → SELECT TOP 15 Words + Questions WHERE NextReviewDate ≤ NOW
  → Returns: questionText, correctAnswer, term, meaning, phonetic, audio URLs, optionsJson
  → User answers → POST /api/user/submit-answer { questionId, submittedAnswer }
  → UserService.submitAnswer() → EXEC usp_SubmitQuestionAttempt
  → Updates MasteryLevel, NextReviewDate, MemoryStatus
```

### Content Creation Workflow
```
Creator → POST /api/creator/words → Creates as Draft
  → Creator edits content, then POST /api/creator/words/:id/submit-review
  → Status changes to PendingReview
  → Admin reviews via GET /api/admin/content-review/pending
  → Admin POST approves → Status = Published
  → Learners can now see this content
```

### Report Flow
```
Learner → POST /api/user/reports { reportType, entityType, wordId, description }
  → ReportService.createReport() → INSERT ContentReports (Status = 'Open')
  → Admin sees report in GET /api/admin/reports
  → Admin PATCH /api/admin/reports/:id { status: 'Resolved', adminResponse: 'Fixed' }
```

### MiniTest Batch Submit Flow
```
User → /user/minitests/[id] → Complete all questions → Click "Nộp bài"
  → POST /api/user/minitests/:id/submit { answers: [{ questionId, wordId, submittedAnswer, isCorrect }] }
  → UserService.submitMiniTestBatch()
  → BEGIN TRANSACTION
       For each answer:
         → INSERT INTO ExerciseAttempts
         → MERGE UserWordProgress (update SRS fields)
     COMMIT
  → Returns: { total, correct, score, results[] }
  → Frontend shows result summary + detailed review of each question (correct/incorrect + term + meaning)
```

### Daily Goal & SRS Config Flow
```
User → /user/settings → Sliders for Daily Goal (5-100) and SRS Review Limit (5-50)
  → GET /api/user/goals/daily-goal → { dailyGoal: 20, srsReviewLimit: 15 }
  → PUT /api/user/goals/daily-goal { dailyGoal: 30 } → Updates Users.DailyGoal
  → PUT /api/user/goals/srs-config { srsReviewLimit: 25 } → Updates Users.SRSReviewLimit

Dashboard renders:
  → Progress bar comparing todayCount (from /goals/daily-progress) vs dailyGoal
  → Goal value fetched from backend (synced across devices)
```

### Smart Review Queue Flow
```
User → /user/practice → Switch to "Ôn tập thông minh" mode
  → GET /api/user/review/smart-queue?limit=20
  → Prioritizes words by:
       - Overdue hours × consecutiveWrong multiplier
       - Lower MasteryLevel first
  → Returns: { wordId, term, meaning, masteryLevel, priorityScore, ... }
  → Frontend creates FillBlank questions from queue data + fetches questions for MCQ
  → User answers → updates SRS progress via submitWordReview() MERGE
```

### Notebook CSV Export Flow
```
User → /user/notebook → Click "Xuất CSV"
  → Frontend reads current notebook page data
  → Generates CSV string: Từ, Nghĩa, Phát âm, Từ loại, Ghi chú, Yêu thích, Độ thuộc
  → Creates Blob URL → triggers browser download
  → Purely client-side — no backend call needed
```

---

## 9. Development Setup

### Environment Variables

**Backend (.env):**
```
PORT=3001
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrongPassword123
DB_NAME=VocabPractice        # or ToeicVocabularyPlatform
DB_AUTH=sql                  # or "windows"
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Running Locally
```bash
# Database: Run SQL scripts
# 1. Create database: prototype_database.sql
# 2. Seed data: seed_data_final.sql

# Backend
cd backend
npm install
npm run dev          # nodemon

# Frontend
cd frontend
npm install
npm run dev          # next dev
```

### Docker
```bash
docker-compose up    # Starts MSSQL + Backend + Frontend
```

### Diagnostic Scripts
```bash
# Backend health check
node src/config/health-check.js

# Backend integration test
node src/config/integration-test.js
```

---

## 10. Project Conventions & Patterns

### Backend Patterns
- **Static service classes** — all methods are `static async`
- **Raw SQL** — no ORM; parameterized queries with `mssql` `input()` method
- **Transactional operations** — `new sql.Transaction(pool)` for multi-table writes
- **Controller → Service** — controllers extract request data, call services, return responses
- **Pagination** — consistent `normalizePagination()` + `paginate()` helpers in AdminService
- **Error handling** — known errors return specific status codes; unknown errors forwarded to `next(error)`
- **Admin audit logging** — `AdminService.logAdminAction()` records every admin operation
- **Content review logging** — `AdminService.logContentReview()` tracks status changes

### Frontend Patterns
- **shadcn/ui components** — customized via `components.json` with `base-lyra` style
- **Path aliases** — `@/` → project root, `@/components/` → components
- **Auth state** — React Context (`AuthContext`) with localStorage persistence
- **Permission gating** — `PermissionGate` component for conditional rendering
- **API calls** — 5 service modules, all through shared Axios instance
- **Pagination** — `PaginationMeta` type + `DataTable` component with search/sort/selection

### Naming Conventions
- **Files:** kebab-case (e.g., `auth.service.js`, `admin.routes.js`)
- **Classes:** PascalCase (e.g., `AuthService`, `AdminController`)
- **Methods:** camelCase (e.g., `getDueFlashcards`, `submitAnswer`)
- **DB columns:** PascalCase (e.g., `UserID`, `FullName`, `ContentStatus`) — SQL Server convention
- **API responses:** snake_case JSON keys (e.g., `questionId`, `totalLearned`)
- **Frontend TypeScript:** camelCase for JS, PascalCase for types/interfaces

### Important Notes
- Express 5 is used (`^5.2.1`) — has breaking changes from Express 4
- Next.js 16 with App Router — uses React Compiler, Turbopack
- React 19 — current stable version
- Tailwind CSS 4 is used — different config from v3 (CSS-based config, not JS)
- The frontend has a `proxy.ts` file for dev proxy configuration
- shadcn uses `base-lyra` style (not the default `new-york` or `default`)
