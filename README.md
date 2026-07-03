# 🚀 VocaBoost: Nền Tảng Học Từ Vựng Thông Minh (SRS)

**VocaBoost** là giải pháp Web Full-stack toàn diện giúp tối ưu hóa việc ghi nhớ từ vựng tiếng Anh. Ứng dụng kết hợp giữa giao diện hiện đại và thuật toán **Spaced Repetition System (SRS)** để đảm bảo người học đạt hiệu quả cao nhất trong thời gian ngắn nhất.

> **Dự án tích hợp nhóm** — 3 thành viên, 3 ngôn ngữ (Go 🟢, Node.js 🟡, TypeScript 🔵)

---

## 🌟 Tính Năng Cốt Lõi

### 1. Phân Hệ Người Học (Student Experience)
- **Vòng Lặp SRS:** Học qua Flashcard thông minh, tích hợp nút Nhớ/Quên đồng bộ thời gian thực với Database.
- **Audio Engine:** Tích hợp phát âm (Text-to-Speech) chuẩn xác cho từng từ vựng.
- **Luyện Tập Đa Dạng:** Hỗ trợ bài tập trắc nghiệm (MCQ), Drag & Drop, điền từ (Fill-in-the-blank) với Timer áp lực.
- **Hệ Thống Mini Test:** Bài thi tổng hợp 10 phút, tự động chấm điểm và lưu lịch sử chi tiết.
- **Review Mode:** Xem lại kết quả thi, phân tích câu sai và giải thích định nghĩa ngay lập tức.
- **Gamification:** Chuỗi Streak, hệ thống XP/Level và Huy hiệu (Achievements) thúc đẩy động lực.
- **Dashboard:** Biểu đồ XP trend, Activity Heatmap, Weekly Activity, Achievement Preview.

### 2. Phân Hệ Quản Trị (Admin Control)
- **Content Management:** Quản lý Từ vựng, Câu hỏi và Chủ đề theo kiến trúc Full CRUD.
- **Test Designer:** Giao diện thiết kế bài thi linh hoạt, gán câu hỏi vào Mini Test chỉ với vài cú click.
- **Student Management:** Theo dõi tiến độ, tỉ lệ thuộc bài và quản lý trạng thái tài khoản học viên.
- **Real-time Analytics:** Biểu đồ xu hướng đăng ký và phân bổ dữ liệu trực quan (Recharts).

### 3. Phân Hệ Người Tạo Nội Dung (Creator)
- **Topic Management:** Tạo và quản lý chủ đề từ vựng.
- **Content Review:** Quy trình kiểm duyệt nội dung trước khi xuất bản.
- **Academic Reports:** Thống kê học thuật chi tiết.

---

## 🛠️ Stack Công Nghệ & Phân Công Nhóm

| Thành viên | Ngôn ngữ | Phụ trách | Công nghệ |
|:---|:---|:---|---|
| **Trần Dũng** 🔵 | TypeScript / JS | Express Gateway + Frontend | Next.js, Tailwind, Recharts, Express |
| **Phúc** 🟢 | **Go** | **User/Learner Microservice** | **Gin, sqlx, go-mssqldb** |
| **Tùng** 🟡 | JavaScript | Admin/Creator API | Node.js, Express, Zod |

| Thành phần | Công nghệ |
|:---|:---|
| **Frontend** | Next.js 15 (App Router), Tailwind CSS v4, Lucide Icons, Recharts, Sonner Toast, Framer Motion |
| **Database** | SQL Server (MSSQL) — `go-mssqldb` + `mssql` (Node) |
| **DevOps** | Docker, Docker Compose |

---

## 🏗️ Kiến Trúc Hệ Thống

### Monolithic Deployment — 1 Gateway + 1 Backend Service

```text
npm start  (backend/)
  │
  ├── Express (port 3001) ←── JS (trưởng nhóm) + TS (member)
  │     │
  │     ├── /api/auth/*        → Express
  │     ├── /api/admin/*       → Express (JS/TS)
  │     ├── /api/categories/*  → Express
  │     ├── /api/creator/*     → Express
  │     ├── /api/ai/*          → Express
  │     └── /api/user/*   ──── → proxy → Go (port 3002) ← BẠN 🟢
  │
  └── Go subprocess (port 3002) ←── user-go/
        └── user, progress, gamification, flashcards, minitests, notebook, notifications...
```

Express auto-spawn tiến trình Go khi khởi động — chỉ cần **1 lệnh duy nhất** để chạy cả backend.

### Go Backend — Cấu Trúc 3 Layer

```text
backend/user-go/
├── cmd/server/main.go          # Entrypoint + route registration
├── internal/
│   ├── config/                 # Config (JWT, DB, Port from .env)
│   ├── model/                  # Data models (json + db tags)
│   ├── repository/             # SQL queries (sqlx)
│   ├── service/                # Business logic (SRS, Gamification, Analytics)
│   ├── handler/                # Gin HTTP handlers (10 files)
│   └── middleware/             # JWT auth + CORS
├── go.mod
└── go.sum
```

#### Go API Endpoints (34 endpoints)

| Nhóm | Endpoint | Handler |
|:---|:---|---|
| **Flashcard** | `GET /flashcards`, `GET /topics/:topicId/words`, `GET /goals/daily-progress`, `GET /review/smart-queue`, `GET /review/mistakes` | `flashcardHandler` |
| **Practice** | `POST /submit-answer` | `practiceHandler` |
| **Progress** | `GET /stats`, `GET /progress/analytics`, `GET /activity/heatmap`, `GET /dashboard/mastery-timeline`, `GET /review/session-summary` | `progressHandler` |
| **Mini Test** | `GET /minitests`, `GET /minitests/history`, `GET /minitests/session-details`, `GET /minitests/:id`, `POST /minitests/:id/submit` | `minitestHandler` |
| **Gamification** | `GET /gamification/profile`, `POST /gamification/practice-complete`, `PUT /gamification/achievements/seen` | `gamificationHandler` |
| **Learning Path** | `GET /learning-path` | `learningPathHandler` |
| **User** | `PUT /profile`, `GET /goals/daily-goal`, `PUT /goals/daily-goal`, `PUT /goals/srs-config`, `POST /reports` | `userHandler` |
| **Notebook** | `GET /notebook`, `POST /notebook`, `PUT /notebook/:id`, `DELETE /notebook/:id`, `GET /notebook/check` | `notebookHandler` |
| **Notification** | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` | `notificationHandler` |

---

## 🚀 Hướng Dẫn Vận Hành

### 1. Yêu Cầu Cơ Bản
- **Node.js** v18.x+
- **Go** 1.21+
- **SQL Server** + SQL Server Browser Service đã bật

### 2. Thiết Lập Database
```bash
# Tạo database ToeicVocabularyPlatform
# Chạy migration script (xem thư mục Database/)
```

### 3. Cấu Hình .env

```env
# backend/.env
PORT=3001
DB_SERVER=127.0.0.1
DB_PORT=1434
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=ToeicVocabularyPlatform
JWT_SECRET=your_jwt_secret
GO_PORT=3002
```

### 4. Khởi Chạy

**Backend (Full — Build Go + Start Express, 1 lệnh duy nhất):**
```bash
cd backend
npm install
npm start
# Express :3001 tự động spawn Go :3002
# Kiểm tra: curl http://localhost:3001/api/health
```

**Backend (Dev mode — Go riêng):**
```bash
cd backend
npm run dev:go   # Go server độc lập port 3002
# Terminal 2: npm run dev  # Express với nodemon + proxy
```

**Frontend:**
```bash
cd frontend
npm install
# Cấu hình NEXT_PUBLIC_API_URL trong .env.local
npm run dev
```

---

## 📂 Cấu Trúc Dự Án

```text
.
├── backend/
│   ├── src/                    # Express API Gateway (JS + TS)
│   │   ├── controllers/        # admin, auth, categories, creator, review, ai
│   │   ├── services/           # admin, auth, categories, creator, review, ai, gamification
│   │   ├── routes/             # admin, auth, categories, creator, review, ai
│   │   └── middlewares/        # auth, errorHandler, rateLimiter, upload, validate
│   ├── user-go/                # User/Learner API (Go + Gin) 🟢
│   │   └── internal/
│   │       ├── handler/        # 10 handlers
│   │       ├── service/        # analytics, gamification, srs
│   │       ├── repository/     # 11 repos
│   │       ├── model/          # 9 models
│   │       └── middleware/     # JWT auth, CORS
│   ├── Database/               # SQL Scripts & Migrations
│   ├── index.js                # Express server (auto-spawn Go + proxy)
│   └── package.json            # Scripts: start, dev, build:go
├── frontend/                   # Next.js 15 (TypeScript)
│   ├── src/app/
│   │   ├── user/               # Dashboard, Learn, Practice, MiniTests...
│   │   ├── admin/              # Admin dashboard, analytics
│   │   └── creator/            # Creator dashboard
│   └── src/services/           # API client services (user, auth, admin...)
└── docker-compose.yml
```

---

## ✅ Health Check

Express cung cấp endpoint `/api/health` kiểm tra trạng thái toàn hệ thống:

```json
{
  "uptime": 123.45,
  "message": "OK",
  "timestamp": 1712345678901,
  "db": "Connected",
  "go": "Healthy"
}
```

Trả về `503` nếu DB mất kết nối hoặc Go service không chạy.

---

## 🔧 Fixes & Improvements

- **Content-Length fix**: Proxy tính lại `content-length` chính xác khi re-stringify body để tránh lỗi Go đọc sai request body.
- **Go Health Check**: `/api/health` kiểm tra Go service qua HTTP GET `/health` với timeout 3s.
- **EnsureSchema tự động**: Go tự động tạo schema khi start nếu chưa tồn tại.
- **Graceful Shutdown**: Express kill Go process khi nhận SIGTERM/SIGINT.

---

## 📜 Trạng Thái Dự Án

✅ **Backend Go (user-go):** 10 handlers, 3 services, 11 repositories — hoàn chỉnh  
✅ **Express Gateway:** Proxy user → Go, các route JS/TS giữ nguyên  
✅ **Frontend:** 0 lỗi TypeScript, 34 API calls khớp hoàn toàn với Go endpoints  
✅ **Health Check:** DB + Go service monitoring  
⏳ **Merge vào main:** Đang chờ Pull Request  
