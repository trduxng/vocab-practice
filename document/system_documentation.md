# 📋 KẾ HOẠCH & MÔ TẢ HỆ THỐNG VOCABOOST

## I. TỔNG QUAN KIẾN TRÚC

**Mô hình 3 tầng:** Next.js (Frontend) → Express.js (Backend REST API) → SQL Server (Database)

```
Frontend (Next.js + TypeScript)     Backend (Express.js)          Database (SQL Server)
┌─────────────────────────┐    ┌──────────────────────────┐    ┌────────────────────┐
│ Pages (App Router)      │    │ Routes                   │    │ 24 Tables          │
│   ↓                     │    │   ↓                      │    │ 4 Views + 1 SP     │
│ Services (API calls)    │───>│ Middlewares (Auth+Valid)  │    │                    │
│   ↓                     │HTTP│   ↓                      │    │                    │
│ API Client (Axios)      │───>│ Controllers              │    │                    │
│   ↓                     │    │   ↓                      │    │                    │
│ AuthContext (State)      │    │ Services (SQL queries)   │───>│ Tables + SP        │
└─────────────────────────┘    └──────────────────────────┘    └────────────────────┘
```

---

## II. BACKEND – CHI TIẾT TỪNG FILE VÀ HÀM

### 1. `src/index.js` – Điểm khởi đầu server

**Chức năng:** Khởi tạo Express app, gắn middleware, mount routes, xử lý shutdown.

| Thành phần                                     | Tác dụng                        | Liên kết                           |
| ---------------------------------------------- | ------------------------------- | ---------------------------------- |
| `require('dotenv').config()`                   | Load biến môi trường từ `.env`  | Tất cả file đều dùng `process.env` |
| `helmet()`                                     | Bảo mật HTTP headers            | Tự động áp dụng cho mọi request    |
| `cors({origin: true})`                         | Cho phép cross-origin requests  | Frontend gọi API từ port khác      |
| `express.json()`                               | Parse JSON body                 | Controllers nhận `req.body`        |
| Request Logger                                 | Log `[timestamp] METHOD /path`  | Debug & monitoring                 |
| `GET /api/health`                              | Kiểm tra DB connection          | Dùng `poolPromise` từ `db.js`      |
| `app.use('/api/auth', authRoutes)`             | Mount auth routes               | → `routes/auth.routes.js`          |
| `app.use('/api/categories', categoriesRoutes)` | Mount categories routes         | → `routes/categories.routes.js`    |
| `app.use('/api/admin', adminRoutes)`           | Mount admin routes              | → `routes/admin.routes.js`         |
| `app.use('/api/user', userRoutes)`             | Mount user routes               | → `routes/user.routes.js`          |
| `app.use(errorHandler)`                        | Bắt lỗi cuối cùng               | → `middlewares/errorHandler.js`    |
| `gracefulShutdown()`                           | Đóng DB pool khi SIGTERM/SIGINT | → `config/db.js` poolPromise       |

---

### 2. `src/config/db.js` – Kết nối Database

**Chức năng:** Tạo connection pool singleton tới SQL Server.

- Đọc `DB_SERVER`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` từ `.env`
- Parse instance name từ `DB_SERVER` (VD: `DESKTOP\\SQLEXPRESS`)
- Tạo `ConnectionPool` với max 10 connections
- Export: `sql` (thư viện mssql) + `poolPromise` (pool đã kết nối)

**Tác dụng với file khác:** Mọi Service file đều `require('./config/db')` để lấy `poolPromise` truy vấn DB.

---

### 3. `src/middlewares/` – 3 Middleware

#### 3a. `auth.js` – Xác thực & Phân quyền

| Hàm                           | Input                                | Output                                   | Tác dụng                                   |
| ----------------------------- | ------------------------------------ | ---------------------------------------- | ------------------------------------------ |
| `verifyToken(req, res, next)` | Header `Authorization: Bearer <jwt>` | Gắn `req.user = {id, role, permissions}` | Được gọi ở đầu mọi route cần đăng nhập     |
| `verifyAdmin(req, res, next)` | `req.user.role`                      | 403 nếu không phải Admin                 | Dự phòng, hiện dùng `checkPermission` thay |
| `checkPermission(code)`       | `req.user.permissions[]`             | 403 nếu không có permission code         | Bảo vệ từng route admin cụ thể             |

**Chuỗi middleware admin:** `verifyToken` → `checkPermission('MANAGE_WORDS')` → Controller

#### 3b. `validate.js` – Kiểm tra dữ liệu đầu vào (Zod)

| Schema                   | Dùng ở route            | Kiểm tra                                        |
| ------------------------ | ----------------------- | ----------------------------------------------- |
| `schemas.register`       | `POST /auth/register`   | fullName ≥2, email hợp lệ, password ≥6          |
| `schemas.login`          | `POST /auth/login`      | email hợp lệ, password ≥1                       |
| `schemas.createWord`     | `POST /admin/words`     | term + meaning không rỗng, partOfSpeechId là số |
| `schemas.createQuestion` | `POST /admin/questions` | wordId số, questionType enum, questionText ≥5   |

**Hàm `validate(schema)`:** Factory function trả về middleware gọi `schema.parse({body, query, params})`. Nếu lỗi → trả 400.

#### 3c. `errorHandler.js` – Bắt lỗi toàn cục

- Nhận error từ `next(error)` trong controllers
- Log `err.stack` ra console
- Trả `500 {message: err.message}`

---

### 4. `src/routes/` – 4 Route Files

#### `auth.routes.js`

```
POST /api/auth/register  → validate(register) → AuthController.register
POST /api/auth/login     → validate(login)    → AuthController.login
```

#### `categories.routes.js` (tất cả cần verifyToken)

```
GET /api/categories/part-of-speeches → CategoriesController.getPartOfSpeeches
GET /api/categories/topics           → CategoriesController.getTopics
```

#### `admin.routes.js` (tất cả cần verifyToken + checkPermission/checkAnyPermission)

```
// Topics & Categories
GET    /api/admin/topics              [MANAGE_TOPICS, MANAGE_WORDS]            → getTopics
POST   /api/admin/topics              [MANAGE_TOPICS, MANAGE_WORDS] + validate → createTopic
PUT    /api/admin/topics/:id          [MANAGE_TOPICS, MANAGE_WORDS] + validate → updateTopic
DELETE /api/admin/topics/:id          [MANAGE_TOPICS, MANAGE_WORDS]            → deleteTopic
GET    /api/admin/topic-categories    [MANAGE_TOPIC_CATEGORIES...]             → getTopicCategories
POST   /api/admin/topic-categories    [MANAGE_TOPIC_CATEGORIES...] + validate  → createTopicCategory
PUT    /api/admin/topic-categories/:id [MANAGE_TOPIC_CATEGORIES...] + validate  → updateTopicCategory
DELETE /api/admin/topic-categories/:id [MANAGE_TOPIC_CATEGORIES...]            → deleteTopicCategory

// Words
GET    /api/admin/words              [MANAGE_WORDS]                            → getWords
POST   /api/admin/words              [MANAGE_WORDS] + validate                 → createWord
GET    /api/admin/words/:id          [MANAGE_WORDS]                            → getWordDetail
PUT    /api/admin/words/:id          [MANAGE_WORDS] + validate                 → updateWord
DELETE /api/admin/words/:id          [MANAGE_WORDS]                            → deleteWord (soft archive)
DELETE /api/admin/words/:id/hard     [MANAGE_SYSTEM_SETTINGS]                  → hardDeleteWord
POST   /api/admin/words/import-preview [MANAGE_WORDS]                          → previewWordImport
POST   /api/admin/words/bulk-import  [MANAGE_WORDS]                            → bulkImportWords

// Questions
GET    /api/admin/questions/:wordId  [MANAGE_QUESTIONS]                        → getQuestionsByWord
POST   /api/admin/questions          [MANAGE_QUESTIONS] + validate             → createQuestion
PUT    /api/admin/questions/:id      [MANAGE_QUESTIONS] + validate             → updateQuestion
DELETE /api/admin/questions/:id      [MANAGE_QUESTIONS]                        → deleteQuestion
POST   /api/admin/questions/bulk-import [MANAGE_QUESTIONS]                     → bulkImportQuestions

// Mini Tests
GET    /api/admin/minitests          [MANAGE_TESTS]                            → getMiniTests
POST   /api/admin/minitests          [MANAGE_TESTS] + validate                 → createMiniTest
PUT    /api/admin/minitests/:id      [MANAGE_TESTS] + validate                 → updateMiniTest
DELETE /api/admin/minitests/:id      [MANAGE_TESTS]                            → deleteMiniTest
PATCH  /api/admin/minitests/:id/publish [MANAGE_TESTS]                         → publishMiniTest
PATCH  /api/admin/minitests/:id/archive [MANAGE_TESTS]                         → archiveMiniTest

// Users & Students Management
GET    /api/admin/students           [MANAGE_USERS]                            → getStudents
POST   /api/admin/students           [MANAGE_USERS]                            → createUser
PUT    /api/admin/students/:id       [MANAGE_USERS]                            → updateUser
DELETE /api/admin/students/:id       [MANAGE_USERS]                            → deleteUser
PATCH  /api/admin/students/:id/toggle [MANAGE_USERS]                           → toggleStudentStatus
PATCH  /api/admin/students/:id/role   [MANAGE_USERS]                           → updateUserRole

// Analytics, Content & Logs
GET    /api/admin/stats              [VIEW_DASHBOARD]                          → getStats
GET    /api/admin/analytics          [VIEW_DASHBOARD]                          → getAnalytics
GET    /api/admin/content-management [VIEW_DASHBOARD]                          → getContentManagement
PATCH  /api/admin/content-status     [MANAGE_SYSTEM_SETTINGS, MANAGE_TOPICS...]→ updateContentStatus
GET    /api/admin/audit-logs         [VIEW_AUDIT_LOGS, MANAGE_SYSTEM...]       → getAuditLogs
GET    /api/admin/reports            [MANAGE_REPORTS, MANAGE_SYSTEM...]        → getReports
PATCH  /api/admin/reports/:id        [MANAGE_REPORTS, MANAGE_SYSTEM...]        → updateReport

// Notifications
GET    /api/admin/notifications      [MANAGE_NOTIFICATIONS]                    → getNotifications
POST   /api/admin/notifications      [MANAGE_NOTIFICATIONS]                    → sendAnnouncement
POST   /api/admin/notifications/daily-reminders [MANAGE_NOTIFICATIONS]          → createDailyReminders
```

#### `user.routes.js` (tất cả cần verifyToken)

```
// Learning & Review
POST /api/user/submit-answer              → submitAnswer (Stored Procedure)
GET  /api/user/flashcards                 → getFlashcards
GET  /api/user/stats                      → getStats
GET  /api/user/dashboard/mastery-timeline  → getMasteryTimeline
GET  /api/user/topics/:topicId/words       → getTopicWords
GET  /api/user/review/smart-queue         → getSmartReviewQueue (SRS Queue)
GET  /api/user/review/session-summary     → getSessionSummary
GET  /api/user/review/mistakes            → getMistakeReviewQueue

// Mini Tests
GET  /api/user/minitests                  → getMiniTests
GET  /api/user/minitests/history          → getTestHistory
GET  /api/user/minitests/session-details  → getTestSessionDetails
GET  /api/user/minitests/:id              → getMiniTestDetails
POST /api/user/minitests/:id/submit       → submitMiniTest

// User Goals & SRS Config
GET  /api/user/activity/heatmap           → getActivityHeatmap
GET  /api/user/goals/daily-progress       → getDailyProgress
GET  /api/user/goals/daily-goal           → getDailyGoal
PUT  /api/user/goals/daily-goal           → updateDailyGoal
PUT  /api/user/goals/srs-config           → updateSRSConfig

// Notifications
GET  /api/user/notifications              → getNotifications
PUT  /api/user/notifications/:id/read     → markNotificationRead
PUT  /api/user/notifications/read-all     → markAllNotificationsRead

// Sổ tay từ vựng (Vocabulary Notebook)
GET    /api/user/notebook                 → getNotebook
GET    /api/user/notebook/check           → checkNotebookEntry
POST   /api/user/notebook                 → addNotebookEntry
PUT    /api/user/notebook/:id             → updateNotebookEntry
DELETE /api/user/notebook/:id             → deleteNotebookEntry

// Reports
POST /api/user/reports                    → createReport + validate
```

---

### 5. `src/controllers/` – 4 Controller Files

**Vai trò chung:** Nhận request → trích xuất data → gọi Service → trả response JSON.

#### `auth.controller.js`

| Hàm                        | Nhận từ                                 | Gọi Service              | Trả về              |
| -------------------------- | --------------------------------------- | ------------------------ | ------------------- |
| `register(req, res, next)` | `req.body: {fullName, email, password}` | `AuthService.register()` | 201 + user info     |
| `login(req, res, next)`    | `req.body: {email, password}`           | `AuthService.login()`    | 200 + {token, user} |

#### `categories.controller.js`

| Hàm                                 | Gọi Service                             | Trả về                                |
| ----------------------------------- | --------------------------------------- | ------------------------------------- |
| `getPartOfSpeeches(req, res, next)` | `CategoriesService.getPartOfSpeeches()` | 200 + [{id, name, description}]       |
| `getTopics(req, res, next)`         | `CategoriesService.getTopics()`         | 200 + [{id, name, code, description}] |

#### `admin.controller.js`

| Hàm                   | Input đặc biệt               | Gọi Service                                  | Trả về            |
| --------------------- | ---------------------------- | -------------------------------------------- | ----------------- |
| `getWords`            | `req.query: {page, limit}`   | `AdminService.getWords(page, limit)`         | 200 + words[]     |
| `createWord`          | `req.user.id` + `req.body`   | `AdminService.createWord(data, adminId)`     | 201 + {id, term}  |
| `updateWord`          | `req.params.id` + `req.body` | `AdminService.updateWord(id, data)`          | 200 hoặc 404      |
| `deleteWord`          | `req.params.id`              | `AdminService.deleteWord(id)`                | 200               |
| `getQuestionsByWord`  | `req.params.wordId`          | `AdminService.getQuestionsByWord(wordId)`    | 200 + questions[] |
| `createQuestion`      | `req.user.id` + `req.body`   | `AdminService.createQuestion(data, adminId)` | 201               |
| `getMiniTests`        | –                            | `AdminService.getMiniTests()`                | 200 + tests[]     |
| `createMiniTest`      | `req.user.id` + `req.body`   | `AdminService.createMiniTest(data, adminId)` | 201               |
| `getStats`            | –                            | `AdminService.getDashboardStats()`           | 200 + stats       |
| `getStudents`         | –                            | `AdminService.getStudents()`                 | 200 + students[]  |
| `toggleStudentStatus` | `req.params.id`              | `AdminService.toggleUserStatus(id)`          | 200               |
| `getAnalytics`        | –                            | `AdminService.getAnalyticsData()`            | 200 + analytics   |

#### `user.controller.js`

| Hàm                     | Input đặc biệt                                           | Gọi Service                            |
| ----------------------- | -------------------------------------------------------- | -------------------------------------- |
| `submitAnswer`          | `req.user.id`, `req.body: {questionId, submittedAnswer}` | `UserService.submitAnswer()`           |
| `getFlashcards`         | `req.user.id`                                            | `UserService.getDueFlashcards(userId)` |
| `getStats`              | `req.user.id`                                            | `UserService.getUserStats(userId)`     |
| `getMiniTests`          | –                                                        | `UserService.getMiniTests()`           |
| `getMiniTestDetails`    | `req.params.id`                                          | `UserService.getMiniTestDetails(id)`   |
| `updateProfile`         | `req.user.id`, `req.body.fullName`                       | `UserService.updateProfile()`          |
| `getTestHistory`        | `req.user.id`                                            | `UserService.getTestHistory(userId)`   |
| `getTestSessionDetails` | `req.user.id`, `req.query: {testId, date}`               | `UserService.getTestSessionDetails()`  |

---

### 6. `src/services/` – 4 Service Files (Business Logic)

#### `auth.service.js`

**`register(fullName, email, password)`**

1. Query `Users` kiểm tra email trùng → throw nếu trùng
2. `bcrypt.hash(password, 10)` → hash password
3. Lấy `RoleID` của role `Learner` từ bảng `Roles`
4. INSERT vào `Users` với OUTPUT lấy UserID
5. Trả `{id, fullName, email, role: 'Learner', permissions}`

**`login(email, password)`**

1. Query `Users JOIN Roles` theo email + IsActive = 1
2. `bcrypt.compare()` so sánh password
3. Query `RolePermissions JOIN Permissions` lấy permission codes
4. `jwt.sign({id, fullName, role, permissions}, secret, {expiresIn: '1d'})`
5. Trả `{token, user: {id, fullName, email, role, permissions}}`

**Tables:** `Users`, `Roles`, `RolePermissions`, `Permissions`

#### `categories.service.js`

| Hàm                   | SQL Query                      | Table            |
| --------------------- | ------------------------------ | ---------------- |
| `getPartOfSpeeches()` | `SELECT * FROM PartOfSpeeches` | `PartOfSpeeches` |
| `getTopics()`         | `SELECT * FROM Topics`         | `Topics`         |

#### `admin.service.js`

**`getWords(page, limit)`** – Lấy từ vựng phân trang

- Query chính: `Words LEFT JOIN PartOfSpeeches` + OFFSET/FETCH
- Với mỗi word, query thêm: `WordTopics JOIN Topics` + `ExampleSentences`
- Tables: `Words`, `PartOfSpeeches`, `WordTopics`, `Topics`, `ExampleSentences`

**`createWord(data, adminId)`** – Tạo từ vựng (Transaction)

1. BEGIN TRANSACTION
2. INSERT `Words` → lấy wordId
3. Loop INSERT `WordTopics` cho mỗi topicId
4. Loop INSERT `ExampleSentences` cho mỗi example
5. COMMIT (hoặc ROLLBACK nếu lỗi)

**`updateWord(wordId, data)`** – UPDATE `Words` (term, meaning, phonetic, partOfSpeechId)

**`deleteWord(wordId)`** – Transaction DELETE `Words` (CASCADE xóa WordTopics, ExampleSentences)

**`getQuestionsByWord(wordId)`** – SELECT từ `Questions` WHERE WordID

**`createQuestion(data, adminId)`** – INSERT `Questions` (MCQ/FillBlank/Dictation/FlashcardCheck)

**`getMiniTests()`** – SELECT `MiniTests LEFT JOIN Topics` ORDER BY CreatedAt DESC

**`createMiniTest(data, adminId)`** – Transaction:

1. INSERT `MiniTests` → lấy testId
2. Loop INSERT `MiniTestItems` (questionId + displayOrder)

**`getDashboardStats()`** – 4 COUNT queries: Users(Learner), Words, Topics, ExerciseAttempts

**`getStudents()`** – SELECT Users(Learner) + subquery đếm masteredWords, totalWords từ `UserWordProgress`

**`toggleUserStatus(userId)`** – UPDATE `Users SET IsActive = CASE WHEN 1 THEN 0 ELSE 1`

**`getAnalyticsData()`** – 2 queries:

- Daily trends: COUNT ExerciseAttempts GROUP BY date (7 ngày)
- Word distribution: COUNT Words GROUP BY PartOfSpeech

#### `user.service.js`

**`getDueFlashcards(userId)`** – Spaced Repetition

- SELECT TOP 15 từ `Questions JOIN Words LEFT JOIN UserWordProgress`
- WHERE: `NextReviewDate IS NULL OR NextReviewDate <= now`
- ORDER BY: `MasteryLevel ASC, NEWID()` (ưu tiên từ yếu + random)

**`submitAnswer({userId, questionId, submittedAnswer})`**

- Gọi stored procedure `usp_SubmitQuestionAttempt`
- SP tự động: kiểm tra đáp án, cập nhật `ExerciseAttempts`, cập nhật `UserWordProgress` (MasteryLevel, NextReviewDate, MemoryStatus)

**`getUserStats(userId)`** – Tổng hợp 5 queries:

1. Tổng từ đã học (MasteryLevel ≥ 3)
2. Accuracy (% đúng) + correct/wrong counts
3. Top 5 weak words (MasteryLevel < 3 hoặc MemoryStatus = 'Lapsed')
4. 10 recent attempts
5. Daily trends 7 ngày
6. Tính 8 achievements dựa trên dữ liệu trên

**`getMiniTests()`** – SELECT MiniTests WHERE IsPublished = 1

**`getMiniTestDetails(testId)`** – SELECT Questions qua MiniTestItems ORDER BY DisplayOrder

**`updateProfile(userId, fullName)`** – UPDATE Users SET FullName

**`getTestHistory(userId)`** – GROUP BY date + testTitle từ ExerciseAttempts JOIN MiniTestItems

**`getTestSessionDetails(userId, testId, date)`** – Chi tiết từng câu hỏi + đáp án đã nộp

---

## III. FRONTEND – CHI TIẾT TỪNG FILE

### 1. `src/lib/api-client.ts`

- Axios instance với `baseURL = http://localhost:3001/api`
- **Request interceptor:** Tự gắn `Bearer token` từ localStorage
- **Response interceptor:** Nếu 401 → xóa token/user khỏi localStorage
- **Tác dụng:** Tất cả 4 frontend services đều import file này

### 2. `src/lib/validations.ts`

- `loginSchema`: email + password (Zod)
- `registerSchema`: fullName + email + password (Zod)
- Export types: `LoginFormValues`, `RegisterFormValues`
- **Tác dụng:** Dùng ở trang Login và Register để validate form client-side

### 3. `src/app/context/AuthContext.tsx`

- React Context quản lý trạng thái authentication toàn app
- State: `user`, `token`, `loading`
- `login(data)`: gọi `authService.login()` → set state
- `logout()`: xóa localStorage → redirect `/login`
- Computed: `isAuthenticated`, `isAdmin`
- **Tác dụng:** Wrap ở `RootLayout` → mọi page truy cập qua hook `useAuth()`

### 4. Frontend Services (4 files)

| Service                 | Hàm                                                                             | Gọi API                               |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------- |
| `auth.service.ts`       | `register(data)`                                                                | POST `/auth/register`                 |
|                         | `login(data)`                                                                   | POST `/auth/login` + lưu localStorage |
|                         | `logout()`                                                                      | Xóa localStorage                      |
|                         | `getCurrentUser()`                                                              | Đọc localStorage                      |
| `admin.service.ts`      | `getWords`, `createWord`, `updateWord`, `deleteWord`                            | CRUD `/admin/words`                   |
|                         | `getQuestionsByWord`, `createQuestion`                                          | `/admin/questions`                    |
|                         | `getStats`, `getStudents`, `toggleStudentStatus`, `getAnalytics`                | `/admin/*`                            |
| `user.service.ts`       | `getDueFlashcards`, `submitAnswer`, `getStats`                                  | `/user/*`                             |
|                         | `getMiniTests`, `getMiniTestDetails`, `getTestHistory`, `getTestSessionDetails` | `/user/minitests/*`                   |
|                         | `updateProfile`                                                                 | PUT `/user/profile`                   |
| `categories.service.ts` | `getPartOfSpeeches`, `getTopics`                                                | `/categories/*`                       |

### 5. Shared Components

**`Sidebar.tsx`** – Navigation sidebar

- Nhận prop `role: 'admin' | 'student'` → hiển thị menu tương ứng
- Admin: 7 links (Tổng quan, Từ vựng, Câu hỏi, Học viên, Khóa học, Thống kê, Cài đặt)
- Student: 9 links (Tổng quan, Khóa học, Học từ, Luyện tập, Mini Tests, Lịch sử, Thành tích, Tiến độ, Cài đặt)
- Collapsible, highlight active link, logout button

**`Topbar.tsx`** – Header bar

- Nhận `title`, `subtitle`, `role`, `userName`
- Hiển thị: search bar, notification bell, user avatar

### 6. Layouts – Bảo vệ Route

| Layout | File                   | Điều kiện truy cập            | Redirect                          |
| ------ | ---------------------- | ----------------------------- | --------------------------------- |
| Root   | `app/layout.tsx`       | Không                         | Wrap `AuthProvider` + `Toaster`   |
| User   | `app/user/layout.tsx`  | `isAuthenticated`             | → `/login`                        |
| Admin  | `app/admin/layout.tsx` | `isAuthenticated` + `isAdmin` | → `/login` hoặc `/user/dashboard` |

### 7. Cấu trúc Pages

```
app/
├── page.tsx           → Landing (Navbar, Hero, Features, Courses, HowItWorks, Testimonials, Pricing, Footer)
├── login/page.tsx     → Form đăng nhập → authService.login() → redirect theo role
├── register/page.tsx  → Form đăng ký → authService.register() → redirect /login
├── user/
│   ├── dashboard/     → Stats cards, achievements, weak words, daily trends
│   ├── learn/         → Học từ vựng mới
│   ├── practice/      → Luyện flashcard (Spaced Repetition) → submitAnswer
│   ├── minitests/     → Danh sách test → làm bài → submitAnswer
│   │   ├── [id]/      → Chi tiết 1 test (dynamic route)
│   │   └── history/   → Lịch sử + xem lại chi tiết phiên
│   ├── courses/       → Khóa học
│   ├── progress/      → Tiến độ học tập
│   ├── achievements/  → Huy hiệu
│   └── settings/      → Cài đặt (updateProfile)
├── admin/
│   ├── dashboard/     → Stats overview (totalStudents, totalWords, totalTopics, totalAttempts)
│   ├── words/         → CRUD từ vựng (bảng + form dialog)
│   ├── questions/     → CRUD câu hỏi
│   ├── minitests/     → Tạo/quản lý Mini Test
│   ├── students/      → Quản lý học viên (toggle active/inactive)
│   ├── courses/       → Quản lý khóa học
│   ├── analytics/     → Biểu đồ xu hướng + phân bố từ
│   └── settings/      → Cài đặt hệ thống
```

---

## IV. LUỒNG HOẠT ĐỘNG CHÍNH

### Luồng 1: Đăng nhập

```
User nhập email/password
  → validations.ts validate (client)
  → auth.service.ts login()
  → api-client.ts POST /api/auth/login
  → auth.routes.js → validate middleware (server)
  → auth.controller.js login()
  → auth.service.js login()
    → DB: SELECT Users JOIN Roles
    → bcrypt.compare()
    → DB: SELECT Permissions
    → jwt.sign()
  → Response {token, user}
  → localStorage lưu token + user
  → AuthContext cập nhật state
  → Redirect /user/dashboard hoặc /admin/dashboard
```

### Luồng 2: Học Flashcard

```
User vào /user/practice
  → user.service.ts getDueFlashcards()
  → api-client.ts GET /api/user/flashcards (Bearer token)
  → auth.js verifyToken → req.user
  → user.controller.js getFlashcards()
  → user.service.js getDueFlashcards(userId)
    → DB: SELECT TOP 15 Questions JOIN Words LEFT JOIN UserWordProgress
           WHERE NextReviewDate <= now ORDER BY MasteryLevel ASC
  → Response flashcards[]
  → UI hiển thị câu hỏi

User trả lời
  → user.service.ts submitAnswer({questionId, submittedAnswer})
  → POST /api/user/submit-answer
  → user.service.js submitAnswer()
    → DB: EXEC usp_SubmitQuestionAttempt
      → Kiểm tra đáp án đúng/sai
      → INSERT ExerciseAttempts
      → UPDATE UserWordProgress (MasteryLevel, NextReviewDate)
```

### Luồng 3: Admin tạo từ vựng

**Route:** `POST /api/admin/words`
**Permission:** `MANAGE_WORDS`
**Default ContentStatus:** `Published` (Admin bypass review)

```
1. Frontend: Admin điền form
   ├─ term (bắt buộc, min 1 ký tự)
   ├─ meaning (bắt buộc, min 1 ký tự)
   ├─ phonetic (tùy chọn)
   ├─ partOfSpeechId (bắt buộc, int > 0)
   ├─ topicIds[] (tùy chọn, mảng int > 0)
   ├─ status (tùy chọn, enum: Draft|PendingReview|Published|Rejected|Archived)
   └─ examples[] (tùy chọn, mảng {sentence, meaning?})

2. admin.service.ts → createWord(data)
   → POST /api/admin/words (Axios + JWT Bearer token)

3. Backend Middleware Chain:
   → auth.js verifyToken (decode JWT, gán req.user)
   → auth.js checkPermission('MANAGE_WORDS')
       └─ Query RolePermissions + Permissions WHERE RoleID = user.roleId
   → validate.js schemas.createWord (Zod parse body/query/params)

4. admin.controller.js createWord(req, res, next)
   → adminId = req.user.id
   → AdminService.createWord(req.body, adminId)

5. admin.service.js createWord(wordData, adminId)
   ├─ assertContentStatus(status) – validate enum
   ├─ Normalize topicIds: deduplicate, filter NaN
   ├─ Filter valid examples (sentence không rỗng)
   │
   ├─ BEGIN TRANSACTION
   │   ├─ INSERT Words (Term, Meaning, Phonetic, PartOfSpeechID,
   │   │                ContentStatus, CreatedByUserID)
   │   │   → OUTPUT inserted.WordID AS id
   │   │
   │   ├─ LOOP INSERT WordTopics (WordID, TopicID, AssignedAt)
   │   │   → Mỗi topicId = 1 request riêng trong transaction
   │   │
   │   └─ LOOP INSERT ExampleSentences (WordID, SentenceText,
   │       SentenceTranslation, CreatedAt, UpdatedAt)
   │
   ├─ COMMIT TRANSACTION
   ├─ logAdminAction(adminId, 'CREATE_WORD', 'Word', wordId, {term, topicIds})
   │   → INSERT AdminAuditLogs
   └─ Return {id, term, meaning}

6. Response: 201 {message: "Tạo từ vựng thành công", data: {id, term, meaning}}
   Error: 400 (validation) | 401 (unauthorized) | 403 (forbidden) | 500 (server)
```

**So sánh Admin vs ContentCreator:**

| Khía cạnh        | Admin (`/api/admin/words`)       | Creator (`/api/creator/words`)         |
| ---------------- | -------------------------------- | -------------------------------------- |
| Default Status   | `Published` (bypass review)      | `Draft` (phải submit review)           |
| Ownership Filter | Xem/sửa tất cả words            | Chỉ xem/sửa words do mình tạo         |
| Audit Log        | `AdminAuditLogs`                 | Không ghi audit log riêng              |
| Delete           | Soft delete (Archive) + Hard delete | Chỉ xóa Draft của mình             |

### Luồng 4: Xem thống kê User

```
User vào /user/dashboard
  → user.service.ts getStats()
  → GET /api/user/stats
  → user.service.js getUserStats(userId)
    → 5 queries: totalLearned, accuracy, weakWords, recentAttempts, dailyTrends
    → Tính achievements (8 huy hiệu)
  → UI render: stats cards, biểu đồ, danh sách từ yếu
```

---

## V. DATABASE – 24 TABLES + 4 VIEWS + 1 STORED PROCEDURE

### 5.1. Nhóm RBAC (Role-Based Access Control) – 4 bảng

| #   | Table             | Mục đích                                                 | FK chính               |
| --- | ----------------- | -------------------------------------------------------- | ---------------------- |
| 1   | `Users`           | Người dùng (+ DailyGoal, SRSReviewLimit, TotalXP, Level) | → Roles.RoleID         |
| 2   | `Roles`           | 3 vai trò: Admin, Learner, ContentCreator                | –                      |
| 3   | `Permissions`     | 19 mã quyền (xem bảng chi tiết bên dưới)                 | –                      |
| 4   | `RolePermissions` | Mapping Role ↔ Permission (many-to-many)                 | → Roles, → Permissions |

**Chi tiết cột mở rộng `Users`:**

| Cột              | Kiểu           | Mô tả                               | Default |
| ---------------- | -------------- | ----------------------------------- | ------- |
| `DailyGoal`      | `int`          | Mục tiêu từ vựng/ngày               | 20      |
| `SRSReviewLimit` | `int`          | Giới hạn flashcard ôn tập/phiên     | 15      |
| `TotalXP`        | `int`          | Điểm kinh nghiệm tích lũy           | 0       |
| `CurrentLevel`   | `int`          | Cấp độ người dùng                   | 1       |
| `UserRole`       | `nvarchar(30)` | CHECK: Admin/Learner/ContentCreator | –       |

**19 Permission Codes:**

| ID  | Code                    | Mô tả                                    | Admin | Learner | Creator |
| --- | ----------------------- | ---------------------------------------- | :---: | :-----: | :-----: |
| 1   | VIEW_DASHBOARD          | Xem dashboard                            |  ✅   |   ✅    |   ✅    |
| 2   | MANAGE_WORDS            | Quản lý từ vựng                          |  ✅   |         |   ✅    |
| 3   | MANAGE_QUESTIONS        | Quản lý câu hỏi                          |  ✅   |         |   ✅    |
| 4   | MANAGE_TESTS            | Quản lý bài thi                          |  ✅   |         |   ✅    |
| 5   | MANAGE_USERS            | Quản lý người dùng                       |  ✅   |         |         |
| 6   | LEARN_VOCAB             | Học từ vựng                              |  ✅   |   ✅    |   ✅    |
| 7   | MANAGE_TOPIC_CATEGORIES | Quản lý danh mục chủ đề                  |  ✅   |         |         |
| 8   | ENROLL_TOPICS           | Đăng ký bộ từ vựng                       |  ✅   |   ✅    |         |
| 9   | MANAGE_NOTEBOOK         | Quản lý sổ tay từ vựng cá nhân           |  ✅   |   ✅    |         |
| 10  | MANAGE_TOPICS           | Quản lý bộ từ vựng / chủ đề              |  ✅   |         |   ✅    |
| 11  | MANAGE_MEDIA            | Quản lý tệp âm thanh và hình ảnh         |  ✅   |         |   ✅    |
| 12  | SUBMIT_CONTENT_REVIEW   | Gửi nội dung để duyệt                    |  ✅   |         |   ✅    |
| 13  | REVIEW_CONTENT          | Duyệt / từ chối / lưu trữ nội dung       |  ✅   |         |         |
| 14  | PUBLISH_OWN_CONTENT     | Xuất bản nội dung do mình tạo            |  ✅   |         |         |
| 15  | VIEW_CONTENT_ANALYTICS  | Xem phân tích hiệu quả nội dung mình tạo |  ✅   |         |   ✅    |
| 16  | VIEW_GLOBAL_ANALYTICS   | Xem phân tích toàn cục                   |  ✅   |         |         |
| 17  | MANAGE_SYSTEM_SETTINGS  | Quản lý cấu hình hệ thống                |  ✅   |         |         |
| 18  | MANAGE_NOTIFICATIONS    | Quản lý thông báo                        |  ✅   |         |         |
| 19  | MANAGE_REPORTS          | Quản lý báo cáo phản hồi từ người học    |  ✅   |         |         |

---

### 5.2. Nhóm Nội dung học tập (Content) – 8 bảng

| #   | Table              | Mục đích                                                  | FK chính                                            |
| --- | ------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| 5   | `TopicCategories`  | Danh mục chủ đề (TOEIC Business, Daily Life...)           | → Users(CreatedBy)                                  |
| 6   | `Topics`           | Chủ đề/bộ từ vựng (+ ContentStatus, ReviewedBy)           | → TopicCategories, → Users(CreatedBy, ReviewedBy)   |
| 7   | `Words`            | Từ vựng (+ AudioUrl, ImageUrl, DifficultyLevel)           | → PartOfSpeeches, → Users(CreatedBy, ReviewedBy)    |
| 8   | `PartOfSpeeches`   | Loại từ (n, v, adj, adv, prep)                            | –                                                   |
| 9   | `WordTopics`       | Mapping Word ↔ Topic (composite PK)                       | → Words (CASCADE), → Topics (CASCADE)               |
| 10  | `ExampleSentences` | Câu ví dụ (+ SentenceTranslation, AudioUrl)               | → Words (CASCADE)                                   |
| 11  | `Questions`        | Câu hỏi (MCQ/FillBlank/Dictation/DragDrop/FlashcardCheck) | → Words (CASCADE), → Users(CreatedBy, ReviewedBy)   |
| 12  | `MiniTests`        | Bộ đề kiểm tra (+ ContentStatus, ReviewedBy)              | → Topics (SET NULL), → Users(CreatedBy, ReviewedBy) |

**Content Workflow Lifecycle** (áp dụng cho Words, Questions, Topics, MiniTests):

```
Draft → PendingReview → Published
                      → Rejected → Draft (sửa lại)
Published → Archived
```

CHECK constraint: `ContentStatus IN ('Draft', 'PendingReview', 'Published', 'Rejected', 'Archived')`

**Chi tiết cột mở rộng trên `Words`:**

| Cột                | Kiểu             | Mô tả                |
| ------------------ | ---------------- | -------------------- |
| `AudioUrlUK`       | `nvarchar(1000)` | URL phát âm British  |
| `AudioUrlUS`       | `nvarchar(1000)` | URL phát âm American |
| `ImageUrl`         | `nvarchar(1000)` | URL hình minh họa    |
| `DifficultyLevel`  | `tinyint`        | 1-5 (mặc định 1)     |
| `ContentStatus`    | `nvarchar(30)`   | Trạng thái nội dung  |
| `ReviewedByUserID` | `bigint`         | Người duyệt          |
| `ReviewedAt`       | `datetimeoffset` | Thời điểm duyệt      |
| `PublishedAt`      | `datetimeoffset` | Thời điểm xuất bản   |

---

### 5.3. Nhóm Kiểm tra & Luyện tập – 3 bảng

| #   | Table              | Mục đích                         | FK chính                                 |
| --- | ------------------ | -------------------------------- | ---------------------------------------- |
| 13  | `MiniTestItems`    | Câu hỏi trong test + thứ tự      | → MiniTests (CASCADE), → Questions       |
| 14  | `MiniTestAttempts` | Phiên làm bài test (score, time) | → MiniTests (CASCADE), → Users (CASCADE) |
| 15  | `ExerciseAttempts` | Lịch sử trả lời từng câu hỏi     | → Users (CASCADE), → Questions, → Words  |

**Cột mở rộng `ExerciseAttempts`:**

| Cột                    | Kiểu            | Mô tả                         |
| ---------------------- | --------------- | ----------------------------- |
| `ClientTimeZoneOffset` | `nvarchar(10)`  | Timezone offset từ client     |
| `AttemptMetadataJson`  | `nvarchar(max)` | JSON metadata (CHECK: ISJSON) |
| `ScoreAwarded`         | `decimal(5,2)`  | Điểm (CHECK: 0-100)           |

**Cột `MiniTestAttempts`:**

| Cột              | Kiểu             | Mô tả                               |
| ---------------- | ---------------- | ----------------------------------- |
| `StartedAt`      | `datetimeoffset` | Thời điểm bắt đầu                   |
| `SubmittedAt`    | `datetimeoffset` | Thời điểm nộp bài (NULL = chưa nộp) |
| `TotalQuestions` | `int`            | Tổng số câu hỏi                     |
| `CorrectCount`   | `int`            | Số câu đúng                         |
| `Score`          | `decimal(5,2)`   | Điểm % (CHECK: 0-100)               |

---

### 5.4. Nhóm Tiến độ học tập & Cá nhân hóa – 3 bảng

| #   | Table                    | Mục đích                                 | FK chính                              |
| --- | ------------------------ | ---------------------------------------- | ------------------------------------- |
| 16  | `UserWordProgress`       | Tiến độ SRS từng từ (SM-2 variant)       | → Users (CASCADE), → Words (CASCADE)  |
| 17  | `UserTopicEnrollments`   | Đăng ký bộ từ vựng                       | → Users (CASCADE), → Topics (CASCADE) |
| 18  | `UserVocabularyNotebook` | Sổ tay từ vựng cá nhân (note, yêu thích) | → Users (CASCADE), → Words (CASCADE)  |

**Chi tiết `UserWordProgress` (Spaced Repetition):**

| Cột                  | Kiểu             | CHECK / Default                        | Mô tả                              |
| -------------------- | ---------------- | -------------------------------------- | ---------------------------------- |
| `MasteryLevel`       | `tinyint`        | 0-10, default 0                        | Mức độ thành thạo                  |
| `EaseFactor`         | `decimal(4,2)`   | 1.30-3.50, default 2.50                | Hệ số dễ (SM-2)                    |
| `RepetitionCount`    | `int`            | ≥0, default 0                          | Số lần ôn tập thành công liên tiếp |
| `ConsecutiveCorrect` | `int`            | ≥0, default 0                          | Chuỗi đúng liên tiếp               |
| `ConsecutiveWrong`   | `int`            | ≥0, default 0                          | Chuỗi sai liên tiếp                |
| `MemoryStatus`       | `nvarchar(30)`   | New/Learning/Reviewing/Mastered/Lapsed | Trạng thái ghi nhớ                 |
| `NextReviewDate`     | `datetimeoffset` | –                                      | Ngày ôn tập tiếp theo              |

---

### 5.5. Nhóm Media & Content Management – 2 bảng

| #   | Table               | Mục đích                                       | FK chính                |
| --- | ------------------- | ---------------------------------------------- | ----------------------- |
| 19  | `MediaAssets`       | Kho tệp media (audio, image) do creator upload | → Users(UploadedBy)     |
| 20  | `ContentMediaLinks` | Gắn media vào entity (Word/Question/Topic...)  | → MediaAssets (CASCADE) |

**MediaType CHECK:** `AudioUK`, `AudioUS`, `Image`, `ExampleAudio`, `QuestionAudio`, `QuestionImage`

---

### 5.6. Nhóm Audit, Review & Notifications – 4 bảng

| #   | Table               | Mục đích                                         | FK chính                                            |
| --- | ------------------- | ------------------------------------------------ | --------------------------------------------------- |
| 21  | `ContentReviewLogs` | Lịch sử duyệt nội dung (status change + comment) | → Users(ActionBy)                                   |
| 22  | `ContentReports`    | Báo cáo lỗi nội dung từ người học                | → Users(Reporter, ResolvedBy), → Words, → Questions |
| 23  | `AdminAuditLogs`    | Log hành động admin (DELETE, UPDATE_STATUS...)   | → Users(ActionBy)                                   |
| 24  | `Notifications`     | Thông báo cho người dùng                         | → Users                                             |

**ContentReports Status Flow:** `Open → InReview → Resolved / Rejected`

**ReportType CHECK:** `WordIncorrect`, `AudioIssue`, `AnswerIncorrect`, `Typo`, `Other`

**Priority CHECK:** `Low`, `Normal`, `High`, `Urgent`

---

### 5.7. Database Views – 4 Views Analytics

| View                              | Mục đích                                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `vw_TopicLearningAnalytics`       | Phân tích học tập theo Topic: enrolled learners, avg mastery, mastered/lapsed records                |
| `vw_MiniTestAnalytics`            | Phân tích MiniTest: total attempts, avg/min/max score, submitted vs unfinished                       |
| `vw_TopicCategorySummary`         | Tổng hợp TopicCategory: total/published/draft/pending topics                                         |
| `vw_ContentCreatorContentSummary` | Tổng hợp nội dung theo ContentCreator: topics/words/questions/minitests + published/pending/rejected |

---

### 5.8. Stored Procedure

**`usp_SubmitQuestionAttempt`** – ACID-compliant question submission

**Input Parameters:**

| Tham số                 | Kiểu             | Mô tả                      |
| ----------------------- | ---------------- | -------------------------- |
| `@UserID`               | `BIGINT`         | ID người dùng              |
| `@QuestionID`           | `BIGINT`         | ID câu hỏi                 |
| `@SubmittedAnswer`      | `NVARCHAR(1000)` | Đáp án nộp                 |
| `@ClientTimeZoneOffset` | `NVARCHAR(10)`   | Timezone offset (optional) |
| `@AttemptMetadataJson`  | `NVARCHAR(MAX)`  | Metadata JSON (optional)   |

**Logic xử lý:**

1. Validate JSON input (nếu có)
2. Lấy thông tin Question (WordID, CorrectAnswer, QuestionType)
3. Kiểm tra User tồn tại và IsActive
4. So sánh đáp án (case-insensitive, trim)
5. UPSERT `UserWordProgress` (UPDLOCK + HOLDLOCK tránh race condition)
6. INSERT `ExerciseAttempts` (log lịch sử)
7. Tính toán SRS metrics:
   - **Đúng:** MasteryLevel+1 (max 10), EaseFactor+0.10 (max 3.50), reset ConsecutiveWrong
   - **Sai:** MasteryLevel-1 (min 0), EaseFactor-0.20 (min 1.30), reset RepetitionCount
8. Tính `NextReviewDate`:
   - Sai: +30 phút → MemoryStatus = 'Lapsed'
   - Đúng: interval tăng dần (1→3→7→14→30 ngày, sau đó `rep × ease × 10`)
   - MemoryStatus: ≥8 = Mastered, ≥5 = Reviewing, else = Learning
9. UPDATE `UserWordProgress`
10. RETURN result set cho application layer

---

## VI. KẾ HOẠCH PHÁT TRIỂN THEO GIAI ĐOẠN

### GĐ 1: Nền tảng ✅

- Database Schema (24 tables + 4 views + 1 SP)
- Kết nối DB (mssql connection pool)
- JWT Authentication + RBAC (3 roles, 19 permissions)
- Zod Validation + Error handling
- API Client + AuthContext

### GĐ 2: Core Features ✅

- CRUD Words (kèm Topics + Examples, transaction)
- CRUD Questions (5 loại câu hỏi: MCQ, FillBlank, Dictation, DragDrop, FlashcardCheck)
- Flashcard với Spaced Repetition (SM-2 variant)
- Submit & chấm bài tự động (Stored Procedure ACID-compliant)

### GĐ 3: Testing & Quản lý ✅

- Mini Test (tạo, làm bài, lịch sử, MiniTestAttempts)
- Quản lý học viên (list, toggle status)
- Dashboard Admin + User

### GĐ 4: Analytics & Gamification ✅

- User Stats (accuracy, weak words, daily trends)
- Admin Analytics (daily activity, word distribution)
- Achievement system (8 huy hiệu)
- Landing page (7 sections)
- TopicCategories (nhóm chủ đề)
- UserTopicEnrollments (đăng ký bộ từ)

### GĐ 5: Content Creator & Review Workflow ✅

- Role ContentCreator (biên tập viên / giáo viên)
- Content Lifecycle: Draft → PendingReview → Published/Rejected → Archived
- ContentReviewLogs (lịch sử duyệt nội dung)
- AdminAuditLogs (log hành động admin)
- ContentReports (báo cáo lỗi nội dung từ learner)

### GĐ 6: Media & Cá nhân hóa ✅

- MediaAssets + ContentMediaLinks (quản lý audio/image)
- UserVocabularyNotebook (sổ tay từ vựng cá nhân)
- Notifications system
- 4 Database Views (analytics tổng hợp)
- XP & Level system (TotalXP, CurrentLevel)

### GĐ 7: Tối ưu & Mở rộng 🔲

- Batch query thay N+1 trong getWords()
- Redis caching
- WebSocket real-time notifications
- Unit tests + CI/CD
- Docker deployment
