# 🚀 VocaBoost — Học Từ Vựng TOEIC Thông Minh (SRS)

**VocaBoost** là nền tảng web full-stack giúp tối ưu hóa việc ghi nhớ từ vựng tiếng Anh cho kỳ thi TOEIC. Ứng dụng kết hợp giao diện hiện đại với thuật toán **Spaced Repetition System (SRS)** cùng cơ chế gamification (XP, Streak, Huy hiệu) để tối đa hiệu quả học tập.

---

## 🧩 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────┐
│                  Frontend                        │
│         Next.js 16 (App Router)                  │
│     Tailwind CSS 4 + shadcn/ui + Recharts       │
└──────────────────┬──────────────────────────────┘
                   │  REST API (Axios)
                   ▼
┌─────────────────────────────────────────────────┐
│                Backend                            │
│        Express.js + JWT Auth + Zod               │
│     Services → Controllers → Routes              │
└──────────────────┬──────────────────────────────┘
                   │  mssql (Tedious)
                   ▼
┌─────────────────────────────────────────────────┐
│           Database (SQL Server)                   │
│         ToeicVocabularyPlatform                   │
│     Tables: Users, Words, Topics, Questions,     │
│     MiniTests, UserWordProgress + gamification   │
└─────────────────────────────────────────────────┘
```

---

## 🌟 Tính Năng Theo Vai Trò

### 👤 Người Học (Learner)

| Tính năng | Mô tả |
|-----------|-------|
| **Học theo SRS** | Flashcard thông minh với 4 mức độ nhớ (Again/Hard/Good/Easy), tự động lên lịch ôn tập |
| **Lộ trình TOEIC** | 4 cấp độ (300 → 500 → 700 → 900) với topic được phân bổ theo trình độ |
| **Luyện tập** | Chế độ học từ mới / ôn tập từ đã học / luyện tập từ sai |
| **Bài kiểm tra** | Mini test tổng hợp, tự động chấm điểm, xem lại lịch sử chi tiết |
| **Dashboard** | Thống kê tiến độ, biểu đồ hoạt động, từ vựng đã học, streak, XP |
| **Gamification** | XP, Level, Achievement/Huy hiệu, Daily Streak |
| **Sổ tay từ vựng** | Ghi chú cá nhân cho từng từ, đánh dấu yêu thích |
| **Báo cáo nội dung** | Báo cáo lỗi từ vựng/câu hỏi cho admin |
| **Thông báo** | Nhắc nhở học tập trong ứng dụng |

### 🛠️ Quản Trị Viên (Admin)

| Tính năng | Mô tả |
|-----------|-------|
| **Dashboard** | Thống kê tổng quan: user, từ vựng, câu hỏi, lượt làm bài |
| **Quản lý từ vựng** | CRUD từ vựng, import CSV, gán chủ đề, câu ví dụ |
| **Quản lý câu hỏi** | CRUD câu hỏi theo từng từ vựng, nhiều dạng (MCQ, điền từ) |
| **Quản lý chủ đề** | CRUD chủ đề, danh mục chủ đề, gán từ vựng |
| **Quản lý bài kiểm tra** | Tạo/chỉnh sửa mini test, gán câu hỏi, publish |
| **Quản lý người dùng** | CRUD user, khóa/mở, đổi vai trò (Admin/Learner/ContentCreator) |
| **Duyệt nội dung** | Xét duyệt/từ chối/lưu trữ nội dung từ Content Creator |
| **Phân tích** | Biểu đồ accuracy, topic phổ biến, câu hỏi khó |
| **Báo cáo** | Quản lý báo cáo lỗi từ người học |
| **Nhật ký hệ thống** | Audit logs chi tiết mọi hành động quản trị |
| **Thông báo** | Gửi thông báo hàng loạt, tạo reminder học tập |

### ✍️ Biên Tập Viên (Content Creator)

| Tính năng | Mô tả |
|-----------|-------|
| **Dashboard** | Thống kê nội dung đã tạo (topic, word, question, mini test) |
| **Quản lý nội dung** | CRUD topics, words, questions, mini tests — tự động tạo ở trạng thái Draft |
| **Gửi duyệt** | Gửi nội dung cho admin xét duyệt (PendingReview) |
| **Phân tích** | Xem thống kê hiệu quả nội dung do mình tạo |

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **UI Components** | shadcn/ui (Base UI), Lucide Icons, Framer Motion |
| **Charts** | Recharts |
| **Form/Validation** | React Hook Form, Zod |
| **Notifications** | Sonner Toast |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express 5 |
| **Auth** | JWT (jsonwebtoken), Bcrypt |
| **Validation** | Zod |
| **Database** | SQL Server (mssql/msnodesqlv8) |
| **ORM** | Raw SQL queries + Stored Procedures |

---

## 📂 Cấu Trúc Dự Án

```
vocab-practice/
├── backend/
│   └── src/
│       ├── config/           # DB connection, health check
│       ├── controllers/      # Request handlers
│       │   ├── auth.controller.js
│       │   ├── admin.controller.js
│       │   ├── user.controller.js
│       │   ├── creator.controller.js
│       │   ├── categories.controller.js
│       │   ├── gamification.controller.js
│       │   ├── learning-path.controller.js
│       │   └── ai.controller.js
│       ├── services/         # Business logic + SQL queries
│       │   ├── auth.service.js
│       │   ├── admin.service.js
│       │   ├── user.service.js
│       │   ├── creator.service.js
│       │   ├── categories.service.js
│       │   ├── gamification.service.js
│       │   ├── learning-path.service.js
│       │   ├── report.service.js
│       │   └── ai.service.js
│       ├── middlewares/      # Auth, validation, error handler
│       ├── routes/           # API route definitions
│       │   ├── auth.routes.js       # POST /api/auth/register, /login
│       │   ├── user.routes.js       # GET/POST /api/user/*
│       │   ├── admin.routes.js      # GET/POST /api/admin/*
│       │   ├── creator.routes.js    # GET/POST /api/creator/*
│       │   ├── categories.routes.js # GET /api/categories/*
│       │   └── ai.routes.js         # POST /api/ai/word-suggestions
│       └── index.js          # Express app entry point
├── frontend/
│   └── src/
│       ├── app/              # Next.js App Router pages
│       │   ├── page.tsx           # Landing page
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   ├── user/              # Learner pages
│       │   │   ├── dashboard/
│       │   │   ├── learn/
│       │   │   ├── practice/
│       │   │   ├── courses/       # Learning path / lộ trình
│       │   │   ├── progress/
│       │   │   ├── settings/
│       │   │   ├── achievements/
│       │   │   ├── minitests/
│       │   │   ├── notebook/
│       │   │   └── layout.tsx
│       │   ├── admin/             # Admin pages
│       │   │   ├── dashboard/
│       │   │   ├── words/
│       │   │   ├── questions/
│       │   │   ├── minitests/
│       │   │   ├── courses/       # Topics management
│       │   │   ├── topic-categories/
│       │   │   ├── students/
│       │   │   ├── content-review/
│       │   │   ├── analytics/
│       │   │   ├── reports/
│       │   │   ├── audit-logs/
│       │   │   ├── notifications/
│       │   │   └── layout.tsx
│       │   ├── creator/           # Content Creator pages
│       │   │   ├── dashboard/
│       │   │   ├── topics/
│       │   │   ├── words/
│       │   │   ├── questions/
│       │   │   ├── mini-tests/
│       │   │   ├── media/
│       │   │   ├── drafts/
│       │   │   ├── pending/
│       │   │   ├── rejected/
│       │   │   ├── analytics/
│       │   │   └── layout.tsx
│       │   └── context/      # AuthContext
│       ├── components/       # Reusable UI components
│       │   ├── ui/           # shadcn/ui components
│       │   ├── shared/       # Sidebar, Topbar
│       │   ├── user/         # Learner-specific components
│       │   └── admin/        # Admin-specific components
│       ├── services/         # API client calls
│       ├── modules/          # Auth types, permissions
│       ├── hooks/            # Custom hooks
│       └── lib/              # Utilities, api-client, validations
├── Database/                 # SQL migrations & seed scripts
├── docker-compose.yml
├── DEPLOY_GUIDE.md
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Yêu Cầu
- **Node.js** v18+ (khuyến nghị v20+)
- **SQL Server** (Express/Developer/Standard)
- **SQL Server Browser Service** bật (cho kết nối instance name)

### 1. Database

```bash
# Tạo database ToeicVocabularyPlatform trên SQL Server
# Chạy các file migration theo thứ tự:
Database/migration_dynamic_permissions.sql
Database/migration_gamification.sql
Database/migration_learning_path.sql
Database/migration_content_reports.sql
Database/migration_notifications.sql
Database/migration_user_daily_goal.sql
Database/migration_learner_xp_streak.sql
Database/migration_after_full_query_gen_used_with_topic_categories_FIXED.sql

# Seed dữ liệu mẫu:
Database/seed_data_final.sql
Database/seed_vocabulary_learning_720.sql
```

### 2. Backend

```bash
cd backend
npm install

# Tạo file .env với nội dung:
PORT=3001
JWT_SECRET=your_jwt_secret_key_here
DB_SERVER=localhost\\SQLEXPRESS
DB_DATABASE=ToeicVocabularyPlatform
DB_USER=sa
DB_PASSWORD=your_password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
NODE_ENV=development

npm run dev   # Chạy ở http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install

# Tạo file .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001/api

npm run dev   # Chạy ở http://localhost:3000
```

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/register` | Đăng ký tài khoản |
| POST | `/login` | Đăng nhập |

### User (`/api/user`) — yêu cầu token
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/flashcards` | Lấy danh sách flashcards cần ôn |
| POST | `/submit-answer` | Gửi câu trả lời (SRS) |
| GET | `/stats` | Thống kê học tập |
| GET | `/gamification/profile` | Thông tin XP, Level, Achievements |
| POST | `/gamification/practice-complete` | Hoàn thành buổi luyện tập |
| PUT | `/gamification/achievements/seen` | Đánh dấu đã xem huy hiệu |
| GET | `/learning-path` | Lộ trình TOEIC |
| GET | `/topics/:topicId/words` | Từ vựng theo chủ đề |
| GET | `/progress/analytics` | Phân tích tiến độ chi tiết |
| GET | `/activity/heatmap` | Biểu đồ nhiệt hoạt động |
| GET | `/goals/daily-progress` | Tiến độ mục tiêu hôm nay |
| GET | `/goals/daily-goal` | Cài đặt mục tiêu |
| PUT | `/goals/daily-goal` | Cập nhật mục tiêu |
| PUT | `/goals/srs-config` | Cập nhật SRS limit |
| GET | `/review/smart-queue` | Hàng đợi ôn tập thông minh |
| GET | `/review/mistakes` | Từ sai cần ôn lại |
| GET | `/review/session-summary` | Tổng kết buổi học |
| GET | `/notebook` | Sổ tay từ vựng |
| POST | `/notebook` | Thêm vào sổ tay |
| PUT | `/notebook/:id` | Cập nhật sổ tay |
| DELETE | `/notebook/:id` | Xóa khỏi sổ tay |
| GET | `/notifications` | Thông báo |
| PUT | `/notifications/:id/read` | Đánh dấu đã đọc |
| PUT | `/notifications/read-all` | Đánh dấu tất cả đã đọc |
| GET | `/minitests` | Danh sách bài kiểm tra |
| GET | `/minitests/:id` | Chi tiết bài kiểm tra |
| POST | `/minitests/:id/submit` | Nộp bài kiểm tra |
| GET | `/minitests/history` | Lịch sử làm bài |
| POST | `/reports` | Báo cáo lỗi nội dung |

### Admin (`/api/admin`) — yêu cầu quyền Admin
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/stats` | Dashboard stats |
| GET | `/students` | Danh sách người dùng |
| POST | `/students` | Tạo user |
| PUT | `/students/:id` | Cập nhật user |
| DELETE | `/students/:id` | Xóa user |
| PATCH | `/students/:id/toggle` | Khóa/Mở user |
| PATCH | `/students/:id/role` | Đổi vai trò |
| GET | `/topics` | Danh sách chủ đề |
| POST | `/topics` | Tạo chủ đề |
| PUT | `/topics/:id` | Cập nhật chủ đề |
| DELETE | `/topics/:id` | Xóa/Lưu trữ chủ đề |
| GET | `/topic-categories` | Danh mục chủ đề |
| POST | `/topic-categories` | Tạo danh mục |
| PUT | `/topic-categories/:id` | Cập nhật danh mục |
| DELETE | `/topic-categories/:id` | Tắt danh mục |
| GET | `/words` | Danh sách từ vựng |
| POST | `/words` | Tạo từ vựng |
| GET | `/words/:id` | Chi tiết từ vựng |
| PUT | `/words/:id` | Cập nhật từ vựng |
| DELETE | `/words/:id` | Xóa từ vựng |
| POST | `/words/bulk-import` | Import CSV |
| POST | `/words/import-preview` | Xem trước import |
| DELETE | `/words/:id/hard` | Xóa vĩnh viễn |
| GET | `/questions/:wordId` | Câu hỏi theo từ |
| POST | `/questions` | Tạo câu hỏi |
| PUT | `/questions/:id` | Cập nhật câu hỏi |
| DELETE | `/questions/:id` | Xóa câu hỏi |
| POST | `/questions/bulk-import` | Import CSV câu hỏi |
| GET | `/minitests` | Danh sách mini test |
| POST | `/minitests` | Tạo mini test |
| PUT | `/minitests/:id` | Cập nhật mini test |
| DELETE | `/minitests/:id` | Xóa mini test |
| PATCH | `/minitests/:id/publish` | Xuất bản |
| PATCH | `/minitests/:id/archive` | Lưu trữ |
| GET | `/analytics` | Phân tích hệ thống |
| GET | `/content-management` | Dữ liệu quản lý nội dung |
| PATCH | `/content-status` | Cập nhật trạng thái nội dung |
| GET | `/content-review/pending` | Nội dung chờ duyệt |
| POST | `/content-review/:type/:id/approve` | Duyệt |
| POST | `/content-review/:type/:id/reject` | Từ chối |
| POST | `/content-review/:type/:id/archive` | Lưu trữ |
| GET | `/content-review/:type/:id/logs` | Lịch sử duyệt |
| GET | `/reports` | Báo cáo lỗi |
| PATCH | `/reports/:id` | Xử lý báo cáo |
| GET | `/audit-logs` | Nhật ký hệ thống |
| GET | `/notifications` | Danh sách thông báo |
| POST | `/notifications` | Gửi thông báo |
| POST | `/notifications/daily-reminders` | Tạo reminder |

### Creator (`/api/creator`) — yêu cầu quyền ContentCreator
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/dashboard` | Thống kê dashboard |
| GET | `/content-summary` | Tổng quan nội dung |
| GET | `/topic-categories` | Danh mục chủ đề (read-only) |
| GET | `/topics` | Chủ đề của tôi |
| POST | `/topics` | Tạo chủ đề (Draft) |
| PUT | `/topics/:id` | Cập nhật |
| DELETE | `/topics/:id` | Xóa draft |
| POST | `/topics/:id/submit-review` | Gửi duyệt |
| GET | `/words` | Từ vựng của tôi |
| POST | `/words` | Tạo từ vựng (Draft) |
| PUT | `/words/:id` | Cập nhật |
| DELETE | `/words/:id` | Xóa draft |
| POST | `/words/:id/submit-review` | Gửi duyệt |
| GET | `/questions` | Câu hỏi của tôi |
| POST | `/questions` | Tạo câu hỏi (Draft) |
| PUT | `/questions/:id` | Cập nhật |
| DELETE | `/questions/:id` | Xóa draft |
| POST | `/questions/:id/submit-review` | Gửi duyệt |
| GET | `/mini-tests` | Mini test của tôi |
| POST | `/mini-tests` | Tạo mini test (Draft) |
| PUT | `/mini-tests/:id` | Cập nhật |
| DELETE | `/mini-tests/:id` | Xóa draft |
| POST | `/mini-tests/:id/items` | Thêm câu hỏi |
| DELETE | `/mini-tests/:id/items/:questionId` | Xóa câu hỏi |
| POST | `/mini-tests/:id/submit-review` | Gửi duyệt |
| GET | `/topics/:id/analytics` | Analytics theo topic |
| GET | `/mini-tests/:id/analytics` | Analytics theo mini test |

### Categories (`/api/categories`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/part-of-speeches` | Danh sách từ loại (public) |
| GET | `/topics` | Danh sách chủ đề (yêu cầu token) |

### AI (`/api/ai`) — yêu cầu quyền MANAGE_WORDS/MANAGE_QUESTIONS
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/word-suggestions` | Gợi ý nội dung từ vựng (OpenAI + Google Translate + Dictionary API) |

---

## 🔐 Tài Khoản Mẫu

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `tung@gmail.com` | `123456` |
| Learner | `phuc2011@gmail.com` | `123456` |
| Content Creator | `teacher@vocaboost.com` | (seed default) |

---

## 🗄️ Database Schema

Bảng chính:
- **Users** — Người dùng (có TotalXP, CurrentLevel, DailyGoal, RoleID)
- **Roles, Permissions, RolePermissions** — Phân quyền động
- **Topics, TopicCategories** — Chủ đề và danh mục chủ đề
- **Words** — Từ vựng (có PartOfSpeechID, ContentStatus)
- **WordTopics** — Liên kết từ vựng - chủ đề
- **PartOfSpeeches** — Từ loại
- **ExampleSentences** — Câu ví dụ
- **Questions** — Câu hỏi (MCQ, điền từ, ContentStatus)
- **MiniTests, MiniTestItems** — Bài kiểm tra và câu hỏi
- **MiniTestAttempts** — Lượt làm bài
- **ExerciseAttempts** — Lịch sử trả lời
- **UserWordProgress** — Tiến độ SRS của từng từ (MasteryLevel, EaseFactor, NextReviewDate...)
- **UserTopicEnrollments** — Đăng ký chủ đề
- **UserVocabularyNotebook** — Sổ tay từ vựng
- **UserXPEvents** — Lịch sử XP
- **Achievements, UserAchievements** — Huy hiệu
- **LearningPathLevels, LearningPathTopics** — Lộ trình TOEIC
- **ContentReports** — Báo cáo lỗi nội dung
- **ContentReviewLogs** — Lịch sử duyệt nội dung
- **AdminAuditLogs** — Nhật ký quản trị
- **Notifications** — Thông báo
- **MediaAssets, ContentMediaLinks** — Tài nguyên media

---

## ✅ Trạng Thái Dự Án

| Hạng mục | Trạng thái |
|----------|------------|
| Backend API | ✅ Hoàn thiện (21 files, pass `node --check`) |
| Frontend TypeScript | ✅ Pass `tsc --noEmit` (0 errors) |
| Landing Page | ✅ Hero, Features, Pricing, Testimonials, Footer |
| User Pages | ✅ Dashboard, Learn, Practice, Progress, Settings, Achievements, Notebook, MiniTests |
| Admin Pages | ✅ Dashboard, Words, Questions, MiniTests, Students, Courses, Content Review, Reports, Analytics, Audit Logs, Notifications |
| Creator Pages | ✅ Dashboard, Topics, Words, Questions, MiniTests, Drafts, Pending, Rejected, Media, Analytics |
| Gamification | ✅ XP, Level, Streak, Achievements |
| SRS Engine | ✅ 4 mức độ nhớ (Again/Hard/Good/Easy) |
| Learning Path | ✅ Lộ trình TOEIC 4 cấp độ |
| Auth & RBAC | ✅ JWT + Dynamic Permissions (3 roles) |
| AI Integration | ✅ OpenAI gợi ý từ vựng + Google Translate |
| Import CSV | ✅ Bulk import words/questions |
| Audit Logging | ✅ AdminAuditLogs + ContentReviewLogs |
| Docker | ✅ docker-compose.yml + Dockerfile |

---

## 📜 License

MIT
