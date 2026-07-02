# 🚀 VocaBoost: Nền Tảng Học Từ Vựng Thông Minh (SRS)

**VocaBoost** là giải pháp Web Full-stack toàn diện giúp tối ưu hóa việc ghi nhớ từ vựng tiếng Anh. Ứng dụng kết hợp giữa giao diện hiện đại và thuật toán **Spaced Repetition System (SRS)** để đảm bảo người học đạt hiệu quả cao nhất trong thời gian ngắn nhất.

---

## 🌟 Tính Năng Cốt Lõi

### 1. Phân Hệ Người Học (Student Experience)
- **Vòng Lặp SRS:** Học qua Flashcard thông minh, tích hợp nút Nhớ/Quên đồng bộ thời gian thực với Database.
- **Audio Engine:** Tích hợp phát âm (Text-to-Speech) chuẩn xác cho từng từ vựng.
- **Luyện Tập Đa Dạng:** Hỗ trợ bài tập trắc nghiệm (MCQ) và điền từ (Fill-in-the-blank) với Timer áp lực.
- **Hệ Thống Mini Test:** Bài thi tổng hợp 10 phút, tự động chấm điểm và lưu lịch sử chi tiết.
- **Review Mode:** Xem lại kết quả thi, phân tích câu sai và giải thích định nghĩa ngay lập tức.
- **Gamification:** Chuỗi Streak, hệ thống XP/Level và Huy hiệu (Achievements) thúc đẩy động lực.

### 2. Phân Hệ Quản Trị (Admin Control)
- **Content Management:** Quản lý Từ vựng, Câu hỏi và Chủ đề theo kiến trúc Full CRUD.
- **Test Designer:** Giao diện thiết kế bài thi linh hoạt, gán câu hỏi vào Mini Test chỉ với vài cú click.
- **Student Management:** Theo dõi tiến độ, tỉ lệ thuộc bài và quản lý trạng thái tài khoản học viên.
- **Real-time Analytics:** Biểu đồ xu hướng đăng ký và phân bổ dữ liệu trực quan (Recharts).

---

## 🛠️ Stack Công Nghệ

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Lucide Icons, Recharts, Sonner Toast |
| **Backend (Admin/Creator)** | Node.js, Express.js, JWT, Bcrypt, Zod Validation |
| **Backend (User/Learner)** | Go (Gin), `jmoiron/sqlx`, `golang-jwt`, `go-mssqldb` |
| **Database** | SQL Server (MSSQL), Raw SQL Queries, Stored Procedures |
| **DevOps** | Docker, Docker Compose, Deployment Guide (Vercel/Render) |

---

## 🚀 Hướng Dẫn Vận Hành Nhanh

### 1. Yêu Cầu Cơ Bản
- Node.js (v18.x trở lên)
- Go 1.21+ (cho backend user role)
- SQL Server Express + **SQL Server Browser Service** đã bật

### 2. Thiết Lập Database
- Tạo database `VocabPractice`.
- Chạy script khởi tạo: `Database/prototype_database.sql`.
- Chạy dữ liệu mẫu: `Database/seed_data_final.sql`.

### 3. Cài Đặt & Khởi Chạy
**Backend (Full — Express auto-spawn Go):**
```bash
cd backend
npm install
# Tạo file .env dựa trên .env.example
npm start        # Build Go + start Express (proxy /api/user/* → Go:3002)
```

**Backend (Go riêng — dev mode):**
```bash
cd backend
npm run dev:go   # Chạy Go server độc lập port 3002
```

**Frontend:**
```bash
cd frontend
npm install
# Cấu hình NEXT_PUBLIC_API_URL trong .env.local
npm run dev
```

---

## 🧠 Kiến Trúc Microservices (User Role)

```text
Frontend (Next.js)
  │
  ├── /api/user/* ────────── Go Server (port 3002 — Gin + sqlx)
  ├── /api/admin/* ───────── Express (port 3001 — Node.js)
  └── /api/creator/* ─────── Express (port 3001 — Node.js)
```

Express đóng vai trò **API Gateway**: tiếp nhận toàn bộ request từ frontend (port 3001), tự động proxy `/api/user/*` sang Go server (port 3002). Khi start, Express tự động spawn tiến trình Go — chỉ cần 1 lệnh duy nhất.

### Go Backend (Phân hệ người học)

**Cấu trúc project:**
```text
backend/user-go/
├── cmd/server/main.go          # Entrypoint + route registration
├── internal/
│   ├── config/                 # Config (.env)
│   ├── model/                  # Data models (json + db tags)
│   ├── repository/             # SQL queries (sqlx SelectContext/GetContext)
│   ├── service/                # Business logic (SRS, Gamification, Analytics)
│   ├── handler/                # Gin HTTP handlers
│   └── middleware/             # JWT auth + CORS
├── go.mod
└── go.sum
```

**Tính năng đã chuyển đổi (Go):**
- SRS Engine (spaced repetition algorithm)
- Flashcards & Smart Review Queue
- Progress Analytics & Activity Heatmap
- Mini Test (lấy đề, nộp bài, lịch sử)
- Gamification (XP, Level, Streak, Achievements)
- Vocabulary Notebook (sổ tay từ vựng)
- Learning Path (lộ trình TOEIC)
- Notifications
- Dashboard & Mastery Timeline
- Change Password & Content Reports

---

## 📂 Sơ Đồ Cấu Trúc Dự Án

```text
.
├── backend/
│   ├── src/                    # Admin & Creator API (Express)
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middlewares/
│   ├── user-go/                # User/Learner API (Go + Gin)
│   │   └── internal/
│   │       ├── handler/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── model/
│   │       └── middleware/
│   ├── index.js                # Express server (with proxy → Go)
│   └── package.json
├── frontend/                   # Web Application (Next.js)
│   ├── src/app/user/
│   ├── src/app/admin/
│   └── src/services/
├── Database/                   # SQL Scripts & Diagrams
└── docker-compose.yml
```

---

## 📜 Trạng Thái Dự Án
Dự án đã hoàn thành **70% Giai đoạn**. Phân hệ người học (user role) đã được chuyển hoàn toàn sang Go với kiến trúc 3-layer (handler → service → repository), sử dụng `sqlx` để giảm boilerplate và `EnsureSchema` tự động khi start server.
