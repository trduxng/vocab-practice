# Phân tích UX/UI: Tính năng Import Từ Vựng & Chủ Đề từ Anki

Tài liệu này trình bày kết quả nghiên cứu trải nghiệm người dùng (UX) và đề xuất giao diện (UI) cho tính năng nhập dữ liệu từ ứng dụng Anki dành cho giáo viên (Content Creator).

---

## 1. Mục tiêu (Objectives)
Giúp giáo viên nhanh chóng đưa dữ liệu học tập sẵn có từ các bộ thẻ (decks) Anki vào hệ thống VocaBoost mà không mất công nhập tay, đồng thời giữ nguyên được các thành phần quan trọng như âm thanh, hình ảnh và phân loại.

---

## 2. Quy trình người dùng đề xuất (Optimized User Flow)

Hệ thống nên sử dụng mô hình **Wizard (Từng bước)** để đảm bảo tính chính xác của dữ liệu:

### Bước 1: Khởi tạo & Tải lên (Trigger & Upload)
- **Hành động:** Người dùng click `[Nhập từ Anki]` tại trang Quản lý Chủ đề hoặc Từ vựng.
- **Định dạng hỗ trợ:** `.apkg` (Anki Package), `.csv`, `.txt`.
- **Hỗ trợ người dùng:** Hiển thị link hướng dẫn "Cách xuất file chuẩn từ Anki".

### Bước 2: Khớp trường dữ liệu (Field Mapping)
- **Hành động:** Hệ thống liệt kê danh sách các "Mặt thẻ" (Fields) tìm thấy trong file.
- **Thao tác:** Người dùng chọn mapping các trường Anki vào cấu trúc VocaBoost.
  - *Ví dụ:* `Front` -> `Term`, `Back` -> `Meaning`, `Audio` -> `AudioUrl`.
- **Live Preview:** Hiển thị 3 dòng dữ liệu thực tế đầu tiên ngay bên cạnh các ô chọn để người dùng kiểm tra độ chính xác.

### Bước 3: Xem trước & Xử lý xung đột (Preview & Conflict Resolution)
- **Hành động:** Hiển thị toàn bộ danh sách dưới dạng bảng (Data Table).
- **Validation:** 
  - **Màu đỏ:** Dòng lỗi (thiếu thông tin bắt buộc). Cho phép sửa trực tiếp (Inline Edit).
  - **Màu vàng:** Dòng trùng lặp (đã tồn tại trong hệ thống). Cho phép chọn: *Bỏ qua / Ghi đè / Giữ cả hai*.
- **Media Preview:** Cho phép nghe thử audio và xem thumbnail ảnh đã trích xuất từ file `.apkg`.

### Bước 4: Thực thi & Báo cáo (Execution & Feedback)
- **Hành động:** Nhấn `[Xác nhận Nhập]`. Hiển thị thanh tiến trình (Progress Bar).
- **Kết quả:** Hiển thị thông báo tổng kết số lượng nhập thành công/lỗi.

---

## 3. Các điểm đau (Pain Points) & Giải pháp

| Rủi ro / Pain Point | Mức độ | Giải pháp đề xuất |
| :--- | :--- | :--- |
| **Mất file Media khi dùng .apkg** | **Nghiêm trọng** | Backend giải nén ZIP, trích xuất folder `collection.media`, upload lên Cloud Storage và gán URL mới vào DB. |
| **Mã HTML rác từ Anki** | **Trung bình** | Tự động làm sạch (Sanitize) HTML, chỉ giữ lại Plain Text hoặc Markdown cơ bản. |
| **Định dạng Cloze Deletion** | **Trung bình** | Nhận diện thẻ điền từ `{{c1::...}}` và gợi ý chuyển đổi sang dạng câu hỏi điền vào chỗ trống. |
| **File quá lớn (Timeout)** | **Thấp** | Sử dụng cơ chế Upload Multipart và xử lý hàng đợi (Background Job) cho các file > 20MB. |

---

## 4. Giao diện (UI) gợi ý

### Cấu trúc màn hình Preview (Bước 3):
1. **Top Bar:** 
   - Stepper hiển thị tiến trình (1-2-3-4).
   - Nút `[Đóng]`.
   - Badge thống kê: `150 Hợp lệ` | `5 Trùng` | `2 Lỗi`.
2. **Main Table:**
   - Cột 1: Checkbox chọn (mặc định chọn các dòng Hợp lệ).
   - Cột 2: Thuật ngữ (Term).
   - Cột 3: Ý nghĩa (Meaning).
   - Cột 4: Media (Icon loa nghe thử / Icon ảnh).
   - Cột 5: Trạng thái (Icon cảnh báo nếu có lỗi).
3. **Bottom Bar:**
   - Nút `[Quay lại bước mapping]`.
   - Nút `[Nhập X dòng đã chọn]` (Màu nổi bật).

---

## 5. Kịch bản tích hợp hệ thống

### Kịch bản A: Nhập bộ khóa học hoàn chỉnh
- **Vị trí:** `/creator/topics`
- **Logic:** Lấy tên Deck Anki làm Tên Chủ đề mới. Toàn bộ từ vựng được tự động gán vào Chủ đề này.

### Kịch bản B: Bổ sung từ vựng vào ngân hàng
- **Vị trí:** `/creator/words`
- **Logic:** Cho phép giáo viên chọn một Chủ đề đích (Target Topic) hoặc để trống để đưa vào kho từ vựng tự do.

---
*Tài liệu được khởi tạo bởi Gemini CLI - UX Researcher Subagent.*
