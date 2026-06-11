Dựa trên toàn bộ cấu trúc mã nguồn, các file cấu hình (`package.json`), và hệ thống tài liệu trong dự án, dưới đây là **bức tranh toàn cảnh và chi tiết nhất** về tất cả các công nghệ, thư viện, và mảng kiến thức được áp dụng trong dự án **VocaBoost (web_hoc_tu_vung)**:

---

### 1. Kiến thức Frontend (Giao diện & Trải nghiệm người dùng)
Dự án sử dụng hệ sinh thái React hiện đại nhất với TypeScript:
*   **Next.js 15 & React 19:** Sử dụng kiến trúc **App Router** (`src/app`), Server Components và Client Components. Xử lý routing, layout lồng nhau (nested layouts) và tối ưu hóa SEO/Hiệu suất.
*   **TypeScript:** (Bắt buộc) Định nghĩa kiểu dữ liệu chặt chẽ cho toàn bộ frontend.
*   **Tailwind CSS (v4) & PostCSS:** Utility-first CSS framework để style giao diện nhanh chóng, kết hợp với `tailwind-merge` và `clsx` để quản lý các class động.
*   **Shadcn UI & Base UI (`@base-ui/react`):** Xây dựng các component UI (nút, modal, dropdown...) có thể tùy chỉnh cao, đảm bảo khả năng truy cập (Accessibility).
*   **Quản lý Form & Validation:** 
    *   `react-hook-form`: Quản lý state của các form phức tạp (đăng nhập, tạo câu hỏi, bài test).
    *   `@hookform/resolvers` + `zod`: Validate dữ liệu form ngay tại frontend trước khi gửi lên server.
*   **Hiệu ứng & Đồ họa (Animations):**
    *   `framer-motion`: Tạo hiệu ứng chuyển cảnh mượt mà (đặc biệt cho lật Flashcard, chuyển trang).
    *   `tw-animate-css`: Hỗ trợ thêm các animation từ Tailwind.
*   **Trực quan hóa dữ liệu (Data Visualization):**
    *   `recharts`: Vẽ các biểu đồ (đường, cột, tròn) trên Dashboard của Admin/User để báo cáo tiến độ học và thống kê hệ thống.
*   **Thư viện UI/UX bổ trợ khác:**
    *   `sonner`: Hiển thị thông báo (toast notifications) đẹp mắt.
    *   `lucide-react` & `@phosphor-icons/react`: Hệ thống icon đồng nhất.
    *   `embla-carousel-react`: Tạo các slider/carousel (có thể dùng cho danh sách chủ đề học).
    *   `react-day-picker` & `date-fns`: Quản lý và chọn ngày tháng (Calendar).
    *   `xlsx`: Hỗ trợ xuất/nhập dữ liệu Excel (Dành cho Admin import/export danh sách từ vựng).

### 2. Kiến thức Backend (Server & API)
Backend được xây dựng theo kiến trúc phân tầng (Layered Architecture: Route -> Controller -> Service -> DB):
*   **Node.js & Express.js (v5.x):** Xây dựng RESTful API xử lý các luồng dữ liệu.
*   **Kiến trúc mã nguồn (Pattern):** Áp dụng mô hình **MVC** (Model-View-Controller) hoặc **Controller-Service Pattern** (phân tách rõ logic xử lý HTTP request và logic nghiệp vụ).
*   **Bảo mật & Xác thực (Security/Auth):**
    *   `jsonwebtoken` (JWT): Tạo và xác thực token cho phiên đăng nhập.
    *   `bcrypt` (v6): Băm (hash) mật khẩu người dùng trước khi lưu vào database.
    *   `helmet`: Cấu hình các HTTP headers an toàn.
    *   `cors`: Xử lý chính sách chia sẻ tài nguyên chéo nguồn gốc (Cross-Origin Resource Sharing).
*   **Validation Backend:**
    *   `zod`: Kiểm tra tính hợp lệ của dữ liệu đầu vào (Body, Params, Query) ở phía server, đồng bộ schema với Frontend.

### 3. Kiến thức Cơ sở dữ liệu (Database)
Dự án sử dụng Hệ quản trị CSDL quan hệ của Microsoft:
*   **SQL Server (MSSQL):** 
    *   Sử dụng thư viện `mssql` và `msnodesqlv8` để kết nối Node.js với SQL Server.
*   **Ngôn ngữ T-SQL (Transact-SQL):** 
    *   Sử dụng Raw SQL và **Stored Procedures** (Thủ tục lưu trữ) thay vì ORM. Kiến thức về `JOIN`, `GROUP BY`, `Subqueries`, và các hàm xử lý chuỗi/thời gian.
*   **Database Design (Thiết kế CSDL):**
    *   Hiểu về chuẩn hóa dữ liệu (Normalization), thiết lập Khóa chính (PK), Khóa ngoại (FK), và Ràng buộc (Constraints).
    *   Sử dụng **DBML** (`TOEIC_Schema_dbdiagram.dbml`) để thiết kế lược đồ CSDL.
*   **Xử lý JSON trong SQL:** Bảng `CauHoi` sử dụng JSON để lưu trữ linh hoạt các lựa chọn (`OptionsJson`), đòi hỏi kiến thức truy xuất JSON trong SQL Server.

### 4. Kiến thức Nghiệp vụ & Thuật toán (Domain Logic)
Đây là "bộ não" của hệ thống học tập:
*   **Thuật toán Spaced Repetition System (SRS - Lặp lại ngắt quãng):**
    *   Kiến thức về cách bộ não con người quên thông tin (Đường cong quên lãng Ebbinghaus).
    *   Toán học đằng sau việc tính toán *Ngày ôn tập tiếp theo*, *Hệ số dễ nhớ (Ease Factor)*, và *Mức độ thành thạo* dựa trên đánh giá của người học (Nhớ/Quên).
*   **Role-Based Access Control (RBAC):** Kiến thức phân quyền hệ thống chi tiết (Người học, Biên tập viên, Quản trị viên).
*   **Quy trình Phê duyệt Nội dung (Content Approval Workflow):** Logic chuyển trạng thái (Nháp -> Chờ duyệt -> Đã xuất bản -> Bị từ chối).

### 5. Kiến thức DevOps & Vận hành (Deployment)
*   **Docker & Containerization:** 
    *   Viết `Dockerfile` cho Frontend và Backend.
    *   Cấu hình `docker-compose.yml` để chạy đồng thời nhiều service (DB, Web, API) trong môi trường local hoặc production.
*   **Quản lý biến môi trường:** Sử dụng `.env` để bảo mật các thông tin nhạy cảm (Chuỗi kết nối DB, JWT Secret, API URLs).

### 6. Kỹ nghệ phần mềm (Software Engineering)
Dự án được làm rất bài bản về mặt tài liệu, yêu cầu các kiến thức:
*   **Phân tích thiết kế hệ thống:**
    *   Biết đọc và viết tài liệu **SRS (Software Requirements Specification)**.
    *   Thiết kế biểu đồ UML: Use Case, Activity Diagram, ERD (Entity Relationship Diagram) sử dụng Draw.io.
    *   Mô hình hóa quy trình nghiệp vụ (Business Process Modeling) cho mảng TOEIC.

### 7. AI & Tự động hóa workflows (Agentic AI)
Dự án này sử dụng rất mạnh các công cụ AI (minh chứng qua các thư mục `Agent`, `.gemini`, `CLAUDE.md`):
*   **Prompt Engineering:** Kỹ năng viết prompt để tạo ra các script SQL (`full_query_gen`), tạo data mẫu (`seed_data`), hoặc sinh cấu trúc code.
*   **Agentic Workflows:** Ứng dụng Gemini CLI / Claude để phân tích lỗi (`BUG_REPORT_AND_FIXES.md`), lên kế hoạch (`PROJECT_PLAN.md`), và review mã nguồn tự động.

**Tổng kết:** Dự án này là một hệ thống mức độ **Trung bình - Khó**, đòi hỏi một lập trình viên Full-stack thực thụ có kiến thức từ việc thiết kế UI mượt mà (Next.js/Framer), xử lý logic API an toàn (Express/JWT), tối ưu hóa truy vấn CSDL phức tạp (SQL Server), cho đến thấu hiểu thuật toán đặc thù (SRS).
