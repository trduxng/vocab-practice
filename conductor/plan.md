# Kế hoạch Hoàn thiện Dự án Web Học Từ Vựng (Vocab-Practice)

Dựa trên quá trình kiểm tra mã nguồn (Backend Node.js, Frontend Next.js) và tài liệu quy trình, dự án hiện đang ở giai đoạn giữa Phase 1 và Phase 2. Dưới đây là kế hoạch chi tiết để hoàn thiện sản phẩm.

## 1. Mục tiêu (Objective)
Hoàn thiện MVP (Minimum Viable Product) của website luyện từ vựng. Đảm bảo người dùng có thể học, ôn tập qua thuật toán Spaced Repetition (SR) và Admin có thể quản lý nội dung.

## 2. Các giai đoạn thực thi (Execution Sequencing)

### Giai đoạn 1: Quản lý Nội dung (Admin Portal) - Ưu tiên Cao
**Mục tiêu:** Cung cấp giao diện để admin có thể thêm/sửa từ vựng và câu hỏi (Nguồn dữ liệu cho hệ thống).
*   **Backend:**
    *   Bổ sung API `DELETE /api/admin/words/:id` (Soft delete hoặc xóa ràng buộc).
    *   Cập nhật API `GET /api/admin/words` có hỗ trợ tìm kiếm (search by term) và lọc theo chủ đề.
    *   Bổ sung API CRUD cho `Questions` (Sửa, xóa câu hỏi).
*   **Frontend (`app/admin/courses` & `app/admin/students`):**
    *   Xây dựng UI Danh sách từ vựng (Data Table có phân trang, tìm kiếm).
    *   Xây dựng Form Thêm/Sửa từ vựng (Có chọn Topic, nhập Phiên âm, Câu ví dụ).
    *   Xây dựng UI quản lý Câu hỏi cho từng từ vựng.
*   **Verification:** Admin thêm thành công 1 từ vựng mới, gán vào topic và tạo 2 loại câu hỏi (MCQ, FillBlank).

### Giai đoạn 2: Luồng Học tập Cốt lõi (Core Learning Loop) - Ưu tiên Cao nhất
**Mục tiêu:** Người dùng có thể học từ mới và ôn tập thẻ ghi nhớ (Flashcards).
*   **Backend:**
    *   Kiểm tra và hoàn thiện Stored Procedure `usp_SubmitQuestionAttempt` đảm bảo tính toán `NextReviewDate` chính xác.
*   **Frontend (`app/user/learn` & `app/user/practice`):**
    *   Xây dựng UI Học từ vựng (Flashcard component: Hiển thị mặt trước/sau, phát âm thanh).
    *   Xây dựng UI Câu hỏi (MCQ Component, Fill In The Blank Component).
    *   Tích hợp API `getDueFlashcards` để lấy danh sách từ và `submitAnswer` để lưu kết quả.
*   **Verification:** Người dùng đăng nhập, thấy danh sách "Từ cần học hôm nay", học qua 5 thẻ và kết quả được ghi nhận vào DB.

### Giai đoạn 3: Dashboard & Tiến độ (User Analytics) - Ưu tiên Trung bình
**Mục tiêu:** Hiển thị tiến độ học tập thực tế thay vì dữ liệu cứng.
*   **Backend:**
    *   Viết API `GET /api/user/stats`: Lấy streak, số từ đã học, số từ cần ôn hôm nay.
    *   Viết API `GET /api/user/weekly-activity`: Lấy biểu đồ học tập 7 ngày.
*   **Frontend (`app/user/dashboard`):**
    *   Kết nối các component thống kê, biểu đồ tuần, danh hiệu với API mới.
*   **Verification:** Biểu đồ hoạt động và streak hiển thị đúng số lượng dựa trên lịch sử `ExerciseAttempts`.

### Giai đoạn 4: Dashboard Quản trị (Admin Analytics) - Ưu tiên Trung bình
**Mục tiêu:** Dashboard của Admin phản ánh dữ liệu thật.
*   **Backend:**
    *   Viết API tổng hợp số lượng User, Từ vựng, Thống kê hoạt động chung.
*   **Frontend (`app/admin/dashboard`):**
    *   Xóa mock data, kết nối hàm fetch với API backend.

### Giai đoạn 5: Mini-tests & Đánh giá (Tùy chọn/Mở rộng)
**Mục tiêu:** Cho phép người dùng làm bài kiểm tra tổng hợp.
*   **Backend:** API tạo mini-test ngẫu nhiên từ kho câu hỏi.
*   **Frontend:** Giao diện đếm ngược thời gian và nộp bài kiểm tra.

## 3. Tiêu chí Nghiệm thu (Verification Checklist)
*   [ ] Đăng ký/Đăng nhập hoạt động mượt mà, token được lưu và phân quyền đúng (Admin vs Learner).
*   [ ] Admin tạo được từ vựng, câu hỏi và dữ liệu lưu thành công vào SQL Server.
*   [ ] Người dùng học thẻ từ, bấm nộp bài không bị lỗi hệ thống. Tiến độ (UserWordProgress) cập nhật chính xác.
*   [ ] Giao diện Responsive trên cả Mobile và Desktop.
*   [ ] Không rò rỉ JWT hay thông tin nhạy cảm.

## 4. Đề xuất Thực hiện
Tôi sẽ bắt đầu từ **Giai đoạn 1 (Admin Portal)** để bơm dữ liệu vào hệ thống trước, sau đó chuyển sang **Giai đoạn 2 (Luồng Học tập)**. 

Xin vui lòng xác nhận kế hoạch này hoặc cho tôi biết nếu bạn muốn điều chỉnh độ ưu tiên!