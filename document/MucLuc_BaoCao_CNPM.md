# 📋 MỤC LỤC CHI TIẾT BÁO CÁO HỆ THỐNG VOCABOOST
*(Được thiết kế đồng bộ theo cấu trúc chuẩn của mẫu `Baocao_CNPM.docx`)*

---

### **MỤC LỤC**

#### **I. GIỚI THIỆU**
* **1.1. Mục đích tài liệu** *(Đặc tả yêu cầu phần mềm SRS v1.0.0 cho hệ thống học từ vựng cá nhân hóa VocaBoost)*
* **1.2. Phạm vi tài liệu** *(Cơ sở cho thiết kế giao diện, phát triển API, kiểm thử và bàn giao hệ thống)*
* **1.3. Định nghĩa thuật ngữ và viết tắt** *(STT, Thuật ngữ viết tắt như JWT, RBAC, SRS, Spaced Repetition, BTV, QTV, mssql...)*
* **1.4. Vai trò và trách nhiệm** *(Phân công công việc nhóm phát triển và đối tác kiểm thử)*
* **1.5. Mô tả cấu trúc tài liệu**

#### **II. TỔNG QUAN HỆ THỐNG VOCABOOST**
* **2.1. Phát biểu bài toán** *(Nhu cầu học tập từ vựng tiếng Anh luyện thi TOEIC hiệu quả, ứng dụng thuật toán khoa học ngắt quãng thay vì học vẹt)*
* **2.2. Khảo sát các phần mềm liên quan**
* **2.3. 2.3. Cơ sở lý thuyết: Phương pháp Lặp lại ngắt quãng (Spaced Repetition) & Ôn tập chủ động (Active Recall)**
* **2.4. Mục tiêu hệ thống**
    * *2.4.1. Đối với Học viên (Tăng hiệu quả ghi nhớ sâu thông qua Spaced Repetition, đo lường tiến trình)*
    * *2.4.2. Đối với Biên tập viên (Xây dựng nội dung học tập trực quan, chất lượng)*
    * *2.4.3. Đối với Quản trị viên (Giám sát nội dung, phê duyệt chặt chẽ, quản lý tài khoản)*
* **2.5. Phạm vi hệ thống** *(Các phân hệ chính: Core Learning, Content Creation & Management, Admin Moderation, Gamification & Achievements)*
* **2.6. Đối tượng người sử dụng hệ thống (Actors)**
    * *2.6.1. Học viên (Learner)*
    * *2.6.2. Biên tập viên (Content Creator)*
    * *2.6.3. Quản trị viên (Admin)*
* **2.7. Sơ đồ phân rã chức năng hệ thống (Functional Decomposition Diagram - FDD)**
* **2.8. Biểu đồ hoạt động tổng quát của hệ thống (Activity Diagrams)**
    * *2.8.1. Biểu đồ hoạt động chung của hệ thống (Đăng ký, Đăng nhập, Phân quyền hệ thống)*
    * *2.8.2. Biểu đồ hoạt động phân hệ Học viên (Học từ mới, Ôn luyện Flashcard, Làm Mini Test, Xem thống kê & Huy hiệu)*
    * *2.8.3. Biểu đồ hoạt động phân hệ Biên tập viên (Tạo Topics/Words/Questions/Tests, Tải lên Media, Gửi duyệt bài viết)*
    * *2.8.4. Biểu đồ hoạt động phân hệ Quản trị viên (Duyệt nội dung Creator gửi, Quản lý tài khoản Học viên, Quản lý Topic Categories)*

#### **III. ĐẶC TẢ YÊU CẦU CHỨC NĂNG (SYSTEM USE-CASES)**
* **3.1. Biểu đồ Use-case tổng quan hệ thống VocaBoost**
* **3.2. Biểu đồ Use-case phân rã theo tác nhân**
    * *3.2.1. Phân rã Use-case của tác nhân "Học viên"*
    * *3.2.2. Phân rã Use-case của tác nhân "Biên tập viên (Content Creator)"*
    * *3.2.3. Phân rã Use-case của tác nhân "Quản trị viên (Admin)"*
* **3.3. Đặc tả chi tiết các Use-case**
    * **3.3.1. Các Use-cases dùng chung cho hệ thống**
        * *a. UC 001: Đăng nhập hệ thống*
        * *b. UC 002: Đăng ký tài khoản (Dành cho Học viên)*
        * *c. UC 003: Cập nhật thông tin cá nhân*
        * *d. UC 004: Thay đổi mật khẩu*
    * **3.3.2. Các Use-cases dành cho Học viên (Learner)**
        * *a. UC 005: Xem Dashboard học tập cá nhân*
        * *b. UC 006: Học từ vựng mới theo chủ đề (Learn)*
        * *c. UC 007: Luyện tập thông qua Flashcard Spaced Repetition (Practice)*
        * *d. UC 008: Tự động cập nhật tiến trình học từ vựng (UserWordProgress thông qua SP)*
        * *e. UC 009: Làm đề thi thử (Mini Test)*
        * *f. UC 010: Xem lịch sử kiểm tra và đáp án chi tiết*
        * *g. UC 011: Xem bảng thành tích học tập và Huy hiệu (Achievements & Gamification)*
    * **3.3.3. Các Use-cases dành cho Biên tập viên (Content Creator)**
        * *a. UC 012: Xem Dashboard & Báo cáo số liệu Content Creator*
        * *b. UC 013: Quản lý Chủ đề (Topics CRUD - Trạng thái Draft)*
        * *c. UC 014: Quản lý Từ vựng & Câu ví dụ đi kèm (Words & Examples CRUD - Trạng thái Draft)*
        * *d. UC 015: Quản lý Câu hỏi ôn luyện (Questions CRUD - Trạng thái Draft)*
        * *e. UC 016: Quản lý Đề kiểm tra ngắn (Mini Tests CRUD - Trạng thái Draft)*
        * *f. UC 017: Quản lý Tệp đa phương tiện (Upload & Quản lý Media Assets - Hình ảnh/Âm thanh)*
        * *g. UC 018: Gửi nội dung yêu cầu phê duyệt (Submit for Review)*
        * *h. UC 019: Xem danh sách nội dung: Bản nháp (Drafts), Đang chờ duyệt (Pending), Bị từ chối kèm lý do (Rejected)*
    * **3.3.4. Các Use-cases dành cho Quản trị viên (Admin)**
        * *a. UC 020: Xem Dashboard Analytics hệ thống (Thống kê toàn cục)*
        * *b. UC 021: Quản lý Danh mục chủ đề (Topic Categories CRUD)*
        * *c. UC 022: Duyệt và phê duyệt nội dung của Biên tập viên (Approve/Reject Content)*
        * *c. UC 023: Ghi nhận nhật ký lịch sử duyệt bài (ContentReviewLogs)*
        * *d. UC 024: Quản lý tài khoản Học viên (Xem danh sách, Khóa/Mở khóa tài khoản)*
        * *e. UC 025: Xem báo cáo phân tích hiệu suất (Word Distribution & Daily attempts trends)*

#### **IV. THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG (UI/UX DESIGN)**
* **4.1. Giao diện trang chủ (Landing Page) & Giao diện Đăng nhập/Đăng ký**
* **4.2. Giao diện dành cho Học viên (Student Interface)**
    * *4.2.1. Giao diện Dashboard Học viên (Lịch sử học, Tiến trình, Từ yếu)*
    * *4.2.2. Giao diện Học từ mới (Learn View)*
    * *4.2.3. Giao diện Luyện tập Flashcard (Interactive Practice)*
    * *4.2.4. Giao diện Làm bài Mini Test (Đề thi trắc nghiệm)*
    * *4.2.5. Giao diện Lịch sử & Chi tiết bài kiểm tra (History Detail)*
    * *4.2.6. Giao diện Huy hiệu & Thành tích (Achievements)*
* **4.3. Giao diện dành cho Biên tập viên (Content Creator Interface)**
    * *4.3.1. Giao diện Dashboard thống kê số lượng & Analytics cho Creator*
    * *4.3.2. Giao diện CRUD Topics (Dropdown chọn Topic Category)*
    * *4.3.3. Giao diện CRUD Words (Tích hợp nhập Example sentences trực tiếp)*
    * *4.3.4. Giao diện CRUD Questions & Giao diện tạo đề thi Mini Test*
    * *4.3.5. Giao diện quản lý Media Assets (Tải lên hình ảnh/âm thanh)*
    * *4.3.6. Các giao diện lọc nội dung theo trạng thái (Draft, Pending Review, Rejected)*
* **4.4. Giao diện dành cho Quản trị viên (Admin Interface)**
    * *4.4.1. Giao diện Dashboard Analytics & Biểu đồ xu hướng toàn hệ thống*
    * *4.4.2. Giao diện Duyệt nội dung (Content Moderation Review)*
    * *4.4.3. Giao diện quản lý Topic Categories (Admin CRUD)*
    * *4.4.4. Giao diện Quản lý Học viên (Toggle Active/Inactive)*

#### **V. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)**
* **5.1. Sơ đồ liên kết thực thể quan hệ (Entity Relationship Diagram - ERD)**
* **5.2. Đặc tả chi tiết cấu trúc các bảng (14 Tables)**
    * *5.2.1. Bảng Users (Thông tin người dùng)*
    * *5.2.2. Bảng Roles (Vai trò người dùng: Admin, Learner, ContentCreator)*
    * *5.2.3. Bảng Permissions & RolePermissions (Quản lý phân quyền RBAC)*
    * *5.2.4. Bảng Words & PartOfSpeeches (Từ vựng và Từ loại)*
    * *5.2.5. Bảng Topics & TopicCategories (Chủ đề học tập và danh mục chủ đề)*
    * *5.2.6. Bảng WordTopics (Ánh xạ Word - Topic)*
    * *5.2.7. Bảng ExampleSentences (Câu ví dụ minh họa)*
    * *5.2.8. Bảng Questions (Ngân hàng câu hỏi trắc nghiệm/điền từ/flashcard)*
    * *5.2.9. Bảng MiniTests & MiniTestItems (Cấu trúc đề kiểm tra)*
    * *5.2.10. Bảng ExerciseAttempts (Lịch sử làm bài tập & Mini Test của Học viên)*
    * *5.2.11. Bảng UserWordProgress (Theo dõi tiến độ học tập và Spaced Repetition của từng từ)*
    * *5.2.12. Bảng ContentReviewLogs (Nhật ký kiểm duyệt nội dung của Admin)*
* **5.3. Thiết kế Stored Procedures và Views nghiệp vụ**
    * *5.3.1. Stored Procedure `usp_SubmitQuestionAttempt` (Tự động chấm bài, cập nhật MasteryLevel, NextReviewDate)*
    * *5.3.2. View `vw_ContentCreatorContentSummary` (Tổng hợp nội dung theo BTV)*
    * *5.3.3. View `vw_TopicLearningAnalytics` (Báo cáo hiệu quả học tập theo chủ đề)*
    * *5.3.4. View `vw_MiniTestAnalytics` (Thống kê số lượt làm đề kiểm tra)*

#### **VI. KIẾN TRÚC KỸ THUẬT VÀ CÁC YÊU CẦU PHI CHỨC NĂNG**
* **6.1. Kiến trúc phân tầng ứng dụng** *(Next.js Frontend + Express.js Backend + SQL Server Database)*
* **6.2. Giải pháp kỹ thuật nổi bật**
    * *6.2.1. Xác thực & Bảo mật (JWT, generic ownership check, RBAC)*
    * *6.2.2. Kiểm soát và Ràng buộc dữ liệu phía Client & Server (Zod schemas)*
    * *6.2.3. Quản lý trạng thái ứng dụng phía Client (React Context & Local Storage)*
    * *6.2.4. Quản lý kết nối SQL Server tối ưu (MSSQL Connection Pool Singleton)*
* **6.3. Yêu cầu phi chức năng (Non-functional requirements)**
    * *6.3.1. Tính bảo mật (Bảo vệ thông tin người dùng, băm mật khẩu bằng Bcrypt)*
    * *6.3.2. Tính sẵn sàng & Hiệu năng hệ thống (Phân trang dữ liệu, tối ưu hóa các câu lệnh SQL)*
    * *6.3.3. Trải nghiệm người dùng (UX) (Giao diện đáp ứng - Responsive, thông báo lỗi rõ ràng)*
* **6.4. Kế hoạch kiểm thử & Triển khai thực tế**
