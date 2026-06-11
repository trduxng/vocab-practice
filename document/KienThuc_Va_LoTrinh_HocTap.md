# Kiến Thức và Lộ Trình Học Tập Dự Án VocaBoost

Dựa trên toàn bộ cấu trúc mã nguồn, các file cấu hình (`package.json`), và hệ thống tài liệu trong dự án, dưới đây là bức tranh toàn cảnh về tất cả các công nghệ, thư viện, mảng kiến thức được áp dụng, kèm theo lộ trình để bạn có thể học và thành thạo.

---

## Phần 1: Toàn Bộ Các Công Nghệ Kiến Thức Có Trong Dự Án

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

---

## Phần 2: Lộ Trình Học Tập Để Thành Thạo Xây Dựng Dự Án Này

Để xây dựng và làm chủ dự án **VocaBoost** từ con số 0, bạn cần một lộ trình học tập có hệ thống, đi từ nền tảng đến kiến trúc nâng cao. Dưới đây là lộ trình chia thành **5 Giai đoạn**, thiết kế đặc biệt cho stack công nghệ của dự án này.

### Giai đoạn 1: Nền tảng Core & Database (2 - 3 Tuần)
*Mục tiêu: Hiểu cách dữ liệu được lưu trữ, tổ chức và truy vấn trước khi viết bất kỳ dòng code logic nào.*

1.  **Thiết kế CSDL Quan hệ (RDBMS):**
    *   **Khái niệm:** Bảng, Khóa chính (PK), Khóa ngoại (FK), Các dạng chuẩn hóa (1NF, 2NF, 3NF).
    *   **Thực hành:** Đọc hiểu file `TOEIC_Schema_dbdiagram.dbml` trong dự án. Hiểu tại sao cần bảng trung gian (VD: `TuVungChuDe`, `QuyenVaiTro`).
2.  **SQL Server (T-SQL) Thực chiến:**
    *   Cài đặt SQL Server Express và SQL Server Management Studio (SSMS).
    *   Viết thành thạo các lệnh CRUD: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
    *   **Nâng cao:** Học cách dùng `JOIN` (INNER, LEFT) để nối dữ liệu từ 3-4 bảng (VD: Lấy tiến độ học của 1 User trong 1 Chủ đề).
    *   Học cách viết và chạy **Stored Procedures** cơ bản (dự án này dùng nhiều stored procedures).
3.  **Xử lý JSON trong SQL Server (Quan trọng):**
    *   Học hàm `JSON_VALUE`, `OPENJSON` vì dự án dùng JSON để lưu đáp án câu hỏi (`OptionsJson`).

### Giai đoạn 2: Backend API với Node.js & Express (3 - 4 Tuần)
*Mục tiêu: Xây dựng máy chủ xử lý dữ liệu, giao tiếp với Database và bảo mật.*

1.  **Node.js & Express Cơ bản:**
    *   Khởi tạo dự án, tạo server chạy trên 1 port.
    *   Hiểu về Routing (GET, POST, PUT, DELETE) và vòng đời của một Request-Response.
2.  **Kết nối Database:**
    *   Sử dụng thư viện `mssql` hoặc `msnodesqlv8` để kết nối Node.js với SQL Server.
    *   Thực hành: Viết API lấy danh sách Chủ đề từ Database trả về định dạng JSON.
3.  **Cấu trúc thư mục (Architecture):**
    *   Học mô hình **Controller-Service-Route**:
        *   `Routes`: Định nghĩa đường dẫn.
        *   `Controllers`: Nhận request, trả về response.
        *   `Services`: Nơi viết câu lệnh SQL, xử lý logic kinh doanh.
4.  **Bảo mật & Validation:**
    *   **Zod:** Học cách viết schema kiểm tra dữ liệu đầu vào (VD: Kiểm tra email hợp lệ, password > 6 ký tự).
    *   **Bcrypt:** Cách băm (hash) mật khẩu trước khi lưu vào DB.
    *   **JWT (JSON Web Token):** Hiểu cơ chế cấp phát Token khi login và viết Middleware `auth.js` để bảo vệ các API riêng tư.

### Giai đoạn 3: Thuật toán & Nghiệp vụ đặc thù (1 - 2 Tuần)
*Mục tiêu: Lập trình "bộ não" của ứng dụng học từ vựng.*

1.  **Thuật toán Spaced Repetition (SRS):**
    *   Nghiên cứu công thức gốc của **SuperMemo-2 (SM-2)**.
    *   Hiểu các biến số: `Mức thành thạo` (0-5), `Hệ số dễ nhớ` (Ease Factor - bắt đầu bằng 2.5), `Số ngày lặp lại` (Interval).
    *   **Thực hành:** Viết một function bằng JavaScript nhận đầu vào là (chất lượng câu trả lời, trạng thái hiện tại) và trả về (trạng thái mới, ngày ôn tập tiếp theo).
2.  **Logic phân quyền (RBAC - Role Based Access Control):**
    *   Xây dựng logic kiểm tra quyền: Phân biệt `NguoiHoc` (chỉ xem, làm bài), `BienTapVien` (tạo nội dung), `QuanTriVien` (duyệt nội dung).

### Giai đoạn 4: Frontend với Next.js 15 & React 19 (4 - 5 Tuần)
*Mục tiêu: Xây dựng giao diện hiện đại, tương tác với API và quản lý trạng thái.*

1.  **TypeScript Cơ bản:**
    *   Khai báo Type/Interface cho Props, State và Response từ API.
2.  **Next.js App Router (Bắt buộc):**
    *   Hiểu cấu trúc `app/`, cách tạo trang (`page.tsx`), bố cục (`layout.tsx`).
    *   Phân biệt **Server Components** (mặc định) và **Client Components** (dùng khi có tương tác người dùng `useState`, `onClick`).
3.  **Tailwind CSS & Shadcn UI:**
    *   Học cách style bằng utility classes của Tailwind.
    *   Cài đặt và sử dụng các component của Shadcn UI (Button, Form, Table, Dialog).
4.  **Tương tác Form & Gọi API:**
    *   Sử dụng `react-hook-form` + `zod` resolver để tạo form Đăng nhập/Đăng ký.
    *   Dùng `axios` (hoặc `fetch` api) để gọi API từ Backend. Xử lý lưu JWT token vào LocalStorage/Cookies.
5.  **Giao diện Tương tác cao (Animation & Charts):**
    *   **Framer Motion:** Tạo hiệu ứng lật thẻ Flashcard 3D.
    *   **Recharts:** Vẽ biểu đồ cột/đường trong trang Dashboard Admin để hiển thị số liệu.

### Giai đoạn 5: DevOps & Hoàn thiện (1 - 2 Tuần)
*Mục tiêu: Đóng gói và triển khai ứng dụng thực tế.*

1.  **Docker Cơ bản:**
    *   Hiểu khái niệm Image và Container.
    *   Đọc và viết `Dockerfile` cho ứng dụng Node.js/Next.js.
    *   Sử dụng `docker-compose.yml` để chạy đồng thời cả Frontend, Backend và Database chỉ với 1 câu lệnh.
2.  **Testing (Tùy chọn nhưng khuyến cấp):**
    *   Sử dụng Postman để tự động hóa việc test API.
    *   Viết một vài Unit Test đơn giản cho thuật toán SRS.

### Mẹo để học hiệu quả dự án này:

1.  **Đừng học chay:** Vừa học vừa đọc code có sẵn trong dự án. Xem cách thư mục `backend/src/services` hoặc `frontend/src/app` được tổ chức.
2.  **Chia nhỏ (Divide & Conquer):**
    *   Đừng cố làm toàn bộ. Hãy bắt đầu bằng tính năng nhỏ nhất: **Hiển thị danh sách Chủ đề**.
    *   *Bước 1:* Viết câu SQL `SELECT * FROM ChuDe`.
    *   *Bước 2:* Viết API GET `/api/topics` trả về danh sách đó.
    *   *Bước 3:* Làm trang Next.js gọi API và hiển thị ra màn hình bằng Tailwind.
3.  **Đọc tài liệu nội bộ:** Hãy tận dụng tối đa thư mục `document/` và `Agent/` trong dự án. Đây là mỏ vàng giải thích tại sao mọi thứ được xây dựng như vậy.
