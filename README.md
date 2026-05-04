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
| **Backend** | Node.js, Express.js, JWT, Bcrypt, Zod Validation |
| **Database** | SQL Server (MSSQL), Raw SQL Queries, Stored Procedures |
| **DevOps** | Docker, Docker Compose, Deployment Guide (Vercel/Render) |

---

## 🚀 Hướng Dẫn Vận Hành Nhanh

### 1. Yêu Cầu Cơ Bản
- Node.js (v18.x trở lên).
- SQL Server Express + **SQL Server Browser Service** đã bật.

### 2. Thiết Lập Database
- Tạo database `VocabPractice`.
- Chạy script khởi tạo: `Database/prototype_database.sql`.
- Chạy dữ liệu mẫu: `Database/seed_data_final.sql`.

### 3. Cài Đặt & Khởi Chạy
**Backend:**
```bash
cd backend
npm install
# Tạo file .env dựa trên .env.example
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
# Cấu hình NEXT_PUBLIC_API_URL trong .env.local
npm run dev
```

---

## 📂 Sơ Đồ Cấu Trúc Dự Án

```text
.
├── backend/                # Server API (Express)
│   ├── src/config/         # Cấu hình DB & Security
│   ├── src/controllers/    # Xử lý Request/Response
│   ├── src/services/       # Logic nghiệp vụ & Query SQL
│   └── src/middlewares/    # Auth & Zod Validation
├── frontend/               # Web Application (Next.js)
│   ├── src/app/user/       # Portal cho học viên
│   ├── src/app/admin/      # Portal cho quản trị viên
│   └── src/services/       # API Clients
├── Database/               # SQL Scripts & Diagrams
└── docker-compose.yml      # Cấu hình triển khai Docker
```

---

## 📜 Trạng Thái Dự Án
Dự án đã hoàn thành **70% Giai đoạn**. Mọi tính năng bảo mật, tối ưu hóa database và giao diện người dùng đã được kiểm thử và sẵn sàng vận hành.

<!-- **Phát triển bởi:** Gemini CLI & Team.
**Tagline:** *Learn Faster, Remember Longer.* -->
