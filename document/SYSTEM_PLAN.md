# 📋 KẾ HOẠCH & MÔ TẢ HỆ THỐNG VOCABOOST

## I. TỔNG QUAN KIẾN TRÚC

**Mô hình 3 tầng:** Next.js (Frontend) → Express.js (Backend REST API) → SQL Server (Database)

```
Frontend (Next.js + TypeScript)     Backend (Express.js)          Database (SQL Server)
┌─────────────────────────┐    ┌──────────────────────────┐    ┌────────────────────┐
│ Pages (App Router)      │    │ Routes                   │    │ 14 Tables          │
│   ↓                     │    │   ↓                      │    │ 1 Stored Procedure │
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

#### `admin.routes.js` (tất cả cần verifyToken + checkPermission)

```
GET    /api/admin/words              [MANAGE_WORDS]     → getWords
POST   /api/admin/words              [MANAGE_WORDS]     → createWord
PUT    /api/admin/words/:id          [MANAGE_WORDS]     → updateWord
DELETE /api/admin/words/:id          [MANAGE_WORDS]     → deleteWord
GET    /api/admin/questions/:wordId  [MANAGE_QUESTIONS] → getQuestionsByWord
POST   /api/admin/questions          [MANAGE_QUESTIONS] → createQuestion
GET    /api/admin/minitests          [MANAGE_TESTS]     → getMiniTests
POST   /api/admin/minitests          [MANAGE_TESTS]     → createMiniTest
GET    /api/admin/stats              [VIEW_DASHBOARD]   → getStats
GET    /api/admin/students           [MANAGE_USERS]     → getStudents
PATCH  /api/admin/students/:id/toggle[MANAGE_USERS]     → toggleStudentStatus
GET    /api/admin/analytics          [VIEW_DASHBOARD]   → getAnalytics
```

#### `user.routes.js` (tất cả cần verifyToken)

```
POST /api/user/submit-answer              → submitAnswer
GET  /api/user/flashcards                 → getFlashcards
GET  /api/user/stats                      → getStats
GET  /api/user/minitests                  → getMiniTests
GET  /api/user/minitests/history          → getTestHistory
GET  /api/user/minitests/session-details  → getTestSessionDetails
GET  /api/user/minitests/:id              → getMiniTestDetails
PUT  /api/user/profile                    → updateProfile
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

```
Admin điền form (term, meaning, phonetic, topics, examples)
  → admin.service.ts createWord(data)
  → POST /api/admin/words
  → auth.js verifyToken
  → auth.js checkPermission('MANAGE_WORDS')
  → validate.js schemas.createWord
  → admin.controller.js createWord()
  → admin.service.js createWord(data, adminId)
    → BEGIN TRANSACTION
    → INSERT Words → get wordId
    → loop INSERT WordTopics
    → loop INSERT ExampleSentences
    → COMMIT
  → Response {id, term, meaning}
```

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

## V. DATABASE – 14 TABLES

| #   | Table              | Mục đích                                   | FK chính                             |
| --- | ------------------ | ------------------------------------------ | ------------------------------------ |
| 1   | `Users`            | Người dùng                                 | → Roles.RoleID                       |
| 2   | `Roles`            | Vai trò (Admin, Learner, ContentCreator)   | –                                    |
| 3   | `Permissions`      | Mã quyền (MANAGE_WORDS, VIEW_DASHBOARD...) | –                                    |
| 4   | `RolePermissions`  | Mapping Role ↔ Permission                  | → Roles, → Permissions               |
| 5   | `Words`            | Từ vựng (term, meaning, phonetic)          | → PartOfSpeeches, → Users(CreatedBy) |
| 6   | `PartOfSpeeches`   | Loại từ (Noun, Verb, Adj...)               | –                                    |
| 7   | `Topics`           | Chủ đề (Business, Travel...)               | –                                    |
| 8   | `WordTopics`       | Mapping Word ↔ Topic                       | → Words, → Topics                    |
| 9   | `ExampleSentences` | Câu ví dụ cho từ                           | → Words (CASCADE)                    |
| 10  | `Questions`        | Câu hỏi (MCQ, FillBlank, Dictation)        | → Words, → Users(CreatedBy)          |
| 11  | `MiniTests`        | Bộ đề kiểm tra                             | → Topics, → Users(CreatedBy)         |
| 12  | `MiniTestItems`    | Câu hỏi trong test + thứ tự                | → MiniTests, → Questions             |
| 13  | `ExerciseAttempts` | Lịch sử làm bài                            | → Users, → Questions, → Words        |
| 14  | `UserWordProgress` | Tiến độ học từng từ                        | → Users, → Words                     |

**Stored Procedure:** `usp_SubmitQuestionAttempt` – Xử lý nộp bài + cập nhật tiến độ tự động.

---

## VI. KẾ HOẠCH PHÁT TRIỂN THEO GIAI ĐOẠN

### GĐ 1: Nền tảng ✅

- Database Schema (14 tables + SP)
- Kết nối DB (mssql connection pool)
- JWT Authentication + RBAC
- Zod Validation + Error handling
- API Client + AuthContext

### GĐ 2: Core Features ✅

- CRUD Words (kèm Topics + Examples, transaction)
- CRUD Questions (4 loại câu hỏi)
- Flashcard với Spaced Repetition
- Submit & chấm bài tự động (SP)

### GĐ 3: Testing & Quản lý ✅

- Mini Test (tạo, làm bài, lịch sử)
- Quản lý học viên (list, toggle status)
- Dashboard Admin + User

### GĐ 4: Analytics & Gamification ✅

- User Stats (accuracy, weak words, daily trends)
- Admin Analytics (daily activity, word distribution)
- Achievement system (8 huy hiệu)
- Landing page (7 sections)

### GĐ 5: Tối ưu & Mở rộng 🔲

- Batch query thay N+1 trong getWords()
- Redis caching
- Image/Audio upload cho từ vựng
- WebSocket real-time notifications
- Unit tests + CI/CD
- Docker deployment
