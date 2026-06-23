# ĐẶC TẢ CHI TIẾT CÁC USE-CASE - HỆ THỐNG VOCABOOST

*(Tài liệu được định dạng theo mẫu bảng chuẩn từ `vc_can_lam.docx`)*

---

## 3.3.1. Các Use-cases dùng chung cho hệ thống

### a. Đăng nhập hệ thống

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 001** |
| **Tên Usecase** | Đăng nhập hệ thống |
| **Tác nhân** | Tất cả người dùng (Học viên, Biên tập viên, Quản trị viên) |
| **Mô tả** | Tác nhân đăng nhập hệ thống để sử dụng các chức năng phù hợp với vai trò của mình. |
| **Sự kiện kích hoạt** | Kích vào nút đăng nhập trên giao diện. |
| **Tiền điều kiện** | Tác nhân đã có tài khoản trên hệ thống và tài khoản đang hoạt động (`IsActive = 1`). |
| **Hậu điều kiện** | Đăng nhập thành công, token JWT được lưu trữ tại Client và cấp quyền truy cập các Route tương ứng. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Nhập Email và Mật khẩu vào ô nhập liệu trên giao diện. | |
| 2 | Nhấn nút "Đăng nhập". | |
| 3 | | Kiểm tra định dạng dữ liệu đầu vào. |
| 4 | | Đối chiếu dữ liệu trong bảng `NguoiDung`. |
| 5 | | Xác định quyền hạn (`Quyen`) tương ứng thông qua vai trò (`VaiTro`) và chuyển hướng người dùng đến giao diện tương ứng. |

**3. Luồng sự kiện thay thế**

| STT | Hệ thống / Tác nhân |
| --- | --- |
| 2a | **Hệ thống:** Hiển thị thông báo lỗi yêu cầu nhập đầy đủ email và mật khẩu (nếu nhập thiếu thông tin). |
| 2b | **Hệ thống:** Hiển thị thông báo lỗi: "Tên đăng nhập hoặc mật khẩu không chính xác" (nếu sai thông tin tài khoản). |
| 2c | **Hệ thống:** Hiển thị thông báo: "Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin" (nếu tài khoản bị khóa). |

**4. Dữ liệu đầu vào**

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Email | Input text field | Có | Đúng định dạng email | user@gmail.com |
| 2 | Mật khẩu | Input text field (Password) | Có | Tối thiểu 6 ký tự | 123456 |

---

### b. Đăng ký tài khoản (Dành cho Học viên)

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 002** |
| **Tên Usecase** | Đăng ký tài khoản |
| **Tác nhân** | Người dùng vãng lai |
| **Mô tả** | Người dùng đăng ký tài khoản Học viên mới để có thể tham gia học tập từ vựng trên hệ thống. |
| **Sự kiện kích hoạt** | Kích vào nút "Đăng ký" tại trang đăng nhập. |
| **Tiền điều kiện** | Không |
| **Hậu điều kiện** | Tài khoản Học viên mới được tạo thành công trong hệ thống. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Nhập thông tin bắt buộc: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu. | |
| 2 | Nhấn nút "Đăng ký". | |
| 3 | | Kiểm tra tính hợp lệ của dữ liệu đầu vào. |
| 4 | | Kiểm tra xem email đã tồn tại hay chưa. |
| 5 | | Băm mật khẩu và lưu thông tin người dùng mới với vai trò là `Learner`. |
| 6 | | Hiển thị thông báo đăng ký thành công và chuyển hướng về trang Đăng nhập. |

**3. Luồng sự kiện thay thế**

| STT | Hệ thống / Tác nhân |
| --- | --- |
| 3a | **Hệ thống:** Hiển thị thông báo lỗi: "Email này đã được sử dụng trên hệ thống". |
| 3b | **Hệ thống:** Báo lỗi: "Mật khẩu xác nhận không trùng khớp". |

**4. Dữ liệu đầu vào**

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Họ tên | Input text field | Có | Chữ cái, có dấu cách | Nguyen Van A |
| 2 | Email | Input text field | Có | Đúng định dạng email | test@gmail.com |
| 3 | Mật khẩu | Input text (Password)| Có | Từ 6 ký tự trở lên | 123456 |
| 4 | Nhập lại mật khẩu| Input text (Password)| Có | Khớp với mật khẩu trên | 123456 |

---

### c. Cập nhật thông tin cá nhân

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 003** |
| **Tên Usecase** | Cập nhật thông tin cá nhân |
| **Tác nhân** | Tất cả người dùng |
| **Mô tả** | Tác nhân muốn thay đổi thông tin hồ sơ cho phù hợp với thông tin cá nhân hiện tại. |
| **Sự kiện kích hoạt** | Kích vào mục "Cấu hình" hoặc "Hồ sơ cá nhân" trên giao diện. |
| **Tiền điều kiện** | Tác nhân đã đăng nhập thành công vào hệ thống. |
| **Hậu điều kiện** | Dữ liệu cá nhân mới của người dùng được cập nhật thành công vào cơ sở dữ liệu. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Chọn mục cập nhật thông tin cá nhân. | |
| 2 | Điền thông tin thay đổi (Họ tên, Mục tiêu học, Giới hạn câu ôn tập). | |
| 3 | Nhấn nút "Lưu thay đổi". | |
| 4 | | Kiểm tra tính hợp lệ của dữ liệu. |
| 5 | | Cập nhật dữ liệu mới vào bảng `NguoiDung` và phản hồi thông báo thành công. |

**3. Luồng sự kiện thay thế**

| STT | Hệ thống / Tác nhân |
| --- | --- |
| 4a | **Hệ thống:** Báo lỗi dữ liệu không hợp lệ (nếu Họ tên rỗng hoặc mục tiêu là số âm). |

**4. Dữ liệu đầu vào**

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Họ tên | Input text field | Có | Chữ cái, không để trống | Tran Dung |
| 2 | Mục tiêu hàng ngày| Input number field | Không | Số nguyên dương | 20 |
| 3 | Giới hạn ôn tập | Input number field | Không | Số nguyên dương | 50 |

---

### d. Thay đổi mật khẩu

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 004** |
| **Tên Usecase** | Thay đổi mật khẩu |
| **Tác nhân** | Tất cả người dùng |
| **Mô tả** | Tác nhân muốn thay đổi mật khẩu đăng nhập hiện tại để bảo mật tài khoản. |
| **Sự kiện kích hoạt** | Click vào nút "Thay đổi mật khẩu" trong trang cấu hình tài khoản. |
| **Tiền điều kiện** | Tác nhân đã đăng nhập thành công vào hệ thống. |
| **Hậu điều kiện** | Mật khẩu mới được cập nhật vào cơ sở dữ liệu, yêu cầu sử dụng cho lần đăng nhập sau. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Nhập Mật khẩu cũ, Mật khẩu mới và Nhập lại mật khẩu mới. | |
| 2 | Nhấn nút "Cập nhật mật khẩu". | |
| 3 | | Đối chiếu mật khẩu cũ với mật khẩu hiện tại trong CSDL. |
| 4 | | Kiểm tra tính hợp lệ và sự trùng khớp của mật khẩu mới. |
| 5 | | Băm mật khẩu mới, lưu vào CSDL và thông báo thành công. |

**3. Luồng sự kiện thay thế**

| STT | Hệ thống / Tác nhân |
| --- | --- |
| 3a | **Hệ thống:** Hiển thị thông báo lỗi: "Mật khẩu cũ không đúng". |
| 4a | **Hệ thống:** Báo lỗi: "Mật khẩu mới không được trùng với mật khẩu cũ". |

**4. Dữ liệu đầu vào**

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Mật khẩu cũ | Input password | Có | | |
| 2 | Mật khẩu mới | Input password | Có | Tối thiểu 6 ký tự | 123456 |
| 3 | Nhập lại MK mới | Input password | Có | Khớp với mật khẩu mới | 123456 |

---

## 3.3.2. Các Use-cases dành cho Học viên (Learner)

### a. Xem Dashboard học tập cá nhân

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 005** |
| **Tên Usecase** | Xem Dashboard học tập cá nhân |
| **Tác nhân** | Học viên |
| **Mô tả** | Xem tổng quan tiến trình học tập cá nhân bao gồm Điểm XP, Cấp độ, tiến độ ngày, heatmap. |
| **Sự kiện kích hoạt** | Kích vào mục "Tổng quan" hoặc "Dashboard" trên sidebar. |
| **Tiền điều kiện** | Học viên đã đăng nhập thành công. |
| **Hậu điều kiện** | Dashboard hiển thị đầy đủ và trực quan dữ liệu. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Chọn xem Dashboard. | |
| 2 | | Lấy thông tin học tập của học viên từ CSDL. |
| 3 | | Tổng hợp số từ đã học, độ chính xác, số ngày học liên tiếp. |
| 4 | | Hiển thị biểu đồ xu hướng 7 ngày và Heatmap đóng góp. |
| 5 | | Hiển thị danh sách từ vựng yếu. |

*(Không có luồng thay thế và dữ liệu đầu vào bắt buộc)*

---

### b. Học từ vựng mới theo chủ đề (Learn)

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 006** |
| **Tên Usecase** | Học từ vựng mới theo chủ đề (Learn) |
| **Tác nhân** | Học viên |
| **Mô tả** | Học từ vựng mới trong chủ đề đã chọn bằng cách xem chi tiết, nghe phát âm và xem ví dụ. |
| **Sự kiện kích hoạt** | Kích chọn một chủ đề học tập cụ thể trên giao diện. |
| **Tiền điều kiện** | Học viên đã đăng ký chủ đề và chủ đề đã xuất bản. |
| **Hậu điều kiện** | Từ vựng được chuyển vào danh sách đang học để chuẩn bị ôn luyện ngắt quãng. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Chọn một chủ đề học tập. | |
| 2 | | Lấy danh sách từ vựng của chủ đề đó từ CSDL. |
| 3 | | Hiển thị giao diện học từ dạng slide/card (tiếng Anh, phiên âm, nghĩa, ảnh, ví dụ). |
| 4 | Kích chọn phát âm UK hoặc US. | Phát âm thanh tương ứng. |
| 5 | Lướt qua từ vựng tiếp theo. | Ghi nhận từ vào tiến trình với trạng thái `Learning`. |

---

### c. Luyện tập thông qua Flashcard Spaced Repetition (Practice)

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 007** |
| **Tên Usecase** | Luyện tập thông qua Flashcard Spaced Repetition |
| **Tác nhân** | Học viên |
| **Mô tả** | Ôn tập từ vựng dựa trên phương pháp lặp lại ngắt quãng (Spaced Repetition). |
| **Sự kiện kích hoạt** | Kích chọn chức năng "Luyện tập" hoặc "Ôn tập". |
| **Tiền điều kiện** | Đã đăng nhập và có từ vựng đến hạn ôn tập (`NextReviewDate` <= Hiện tại). |
| **Hậu điều kiện** | Tiến trình từ vựng được cập nhật lại theo thuật toán ôn tập ngắt quãng (SRS). |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Yêu cầu luyện tập. | |
| 2 | | Lấy danh sách tối đa 15 từ cần ôn tập (ưu tiên từ yếu, đến hạn). |
| 3 | | Hiển thị câu hỏi (Trắc nghiệm, Điền khuyết, Nghe, Flashcard). |
| 4 | Chọn/điền đáp án và nhấn nộp. | |
| 5 | | Hiển thị kết quả đúng/sai, giải thích và ghi nhận XP. |

---

### d. Tự động cập nhật tiến trình học từ vựng (UC 008)

*(Đây là Use-case nội bộ Hệ thống tự kích hoạt sau UC 007, không có giao diện đầu vào)*

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 008** |
| **Tên Usecase** | Tự động cập nhật tiến trình học từ vựng |
| **Tác nhân** | Hệ thống |
| **Mô tả** | Tự động tính toán lại mức độ ghi nhớ, độ thành thạo và ngày ôn tập tiếp theo. |
| **Sự kiện kích hoạt** | Học viên nộp câu trả lời luyện tập. |
| **Tiền điều kiện** | Không |
| **Hậu điều kiện** | CSDL ghi nhận chính xác tiến độ học tập và lịch ôn tiếp theo (SM-2 Algorithm). |

---

### e. Làm đề thi thử (Mini Test)

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 009** |
| **Tên Usecase** | Làm đề thi thử (Mini Test) |
| **Tác nhân** | Học viên |
| **Mô tả** | Học viên làm bài thi thử mini của một chủ đề để tự đánh giá năng lực tổng hợp. |
| **Sự kiện kích hoạt** | Chọn một bài Mini Test và nhấn "Bắt đầu làm bài". |
| **Tiền điều kiện** | Bài thi đã xuất bản, học viên đã đăng ký chủ đề. |
| **Hậu điều kiện** | Kết quả thi được lưu trữ. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Yêu cầu làm bài thi. | |
| 2 | | Tạo lượt ghi nhận làm bài mới với trạng thái chưa nộp. |
| 3 | | Hiển thị danh sách câu hỏi kèm đồng hồ đếm ngược. |
| 4 | Chọn các đáp án cho từng câu. | |
| 5 | Nhấn nút "Nộp bài". | |
| 6 | | Chấm điểm, lưu kết quả, hiển thị điểm số và thời gian. |

**3. Luồng sự kiện thay thế**

| STT | Hệ thống / Tác nhân |
| --- | --- |
| 5a | **Hệ thống:** Tự động khóa giao diện và nộp bài nếu hết thời gian đếm ngược. |

---

### f. Xem lịch sử kiểm tra và đáp án chi tiết

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 010** |
| **Tên Usecase** | Xem lịch sử kiểm tra và đáp án chi tiết |
| **Tác nhân** | Học viên |
| **Mô tả** | Xem danh sách bài thi đã làm và chi tiết câu đúng/sai. |
| **Sự kiện kích hoạt** | Kích chọn "Lịch sử thi". |
| **Tiền điều kiện** | Đã hoàn thành ít nhất 1 bài thi. |
| **Hậu điều kiện** | Học viên xem được chi tiết bài làm. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Truy cập trang Lịch sử. | |
| 2 | | Hiển thị danh sách các lượt thi. |
| 3 | Chọn 1 lượt thi cụ thể. | |
| 4 | | Tải lại danh sách câu hỏi, hiển thị đáp án học viên chọn, đáp án đúng và giải thích. |

---

### g. Xem bảng thành tích học tập và Huy hiệu

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 011** |
| **Tên Usecase** | Xem bảng thành tích học tập và Huy hiệu |
| **Tác nhân** | Học viên |
| **Mô tả** | Xem huy hiệu đã mở khóa dựa trên XP, từ vựng và chuỗi ngày. |
| **Sự kiện kích hoạt** | Kích chọn tab "Thành tích". |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Hiển thị bảng huy hiệu cá nhân. |

---

## 3.3.3. Các Use-cases dành cho Biên tập viên (Content Creator)

### a. Xem Dashboard & Báo cáo số liệu Content Creator

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 012** |
| **Tên Usecase** | Xem Dashboard & Báo cáo số liệu Content Creator |
| **Tác nhân** | Biên tập viên |
| **Mô tả** | Xem thống kê số lượng Chủ đề, Từ vựng, Bài thi do mình tạo và trạng thái kiểm duyệt. |
| **Sự kiện kích hoạt** | Truy cập trang chủ Creator. |
| **Tiền điều kiện** | Có quyền `VIEW_CONTENT_ANALYTICS`. |
| **Hậu điều kiện** | Hiển thị báo cáo trực quan. |

---

### b. Quản lý Chủ đề (Topics CRUD)

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 013** |
| **Tên Usecase** | Quản lý Chủ đề |
| **Tác nhân** | Biên tập viên |
| **Mô tả** | Thêm mới, xem, sửa, xóa chủ đề học tập. |
| **Sự kiện kích hoạt** | Chọn "Quản lý chủ đề". |
| **Tiền điều kiện** | Có quyền `MANAGE_TOPICS`. |
| **Hậu điều kiện** | Dữ liệu được lưu ở trạng thái Draft. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Chọn tạo mới chủ đề. | Hiển thị form tạo mới. |
| 2 | Nhập tên, mã chủ đề, mô tả và danh mục lớn. | |
| 3 | Nhấn "Lưu nháp". | Lưu vào CSDL trạng thái `Draft`. |

**3. Luồng sự kiện thay thế**

| STT | Hệ thống / Tác nhân |
| --- | --- |
| 3a | **Hệ thống:** Báo lỗi nếu mã chủ đề đã tồn tại. |

---

### c. Quản lý Từ vựng & Câu ví dụ đi kèm

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 014** |
| **Tên Usecase** | Quản lý Từ vựng & Câu ví dụ đi kèm |
| **Tác nhân** | Biên tập viên |
| **Mô tả** | Soạn thảo từ vựng, từ loại, nghĩa, phiên âm, media và ví dụ. |
| **Sự kiện kích hoạt** | Chọn mục "Quản lý từ vựng". |
| **Tiền điều kiện** | Có quyền `MANAGE_WORDS`. |
| **Hậu điều kiện** | Bản ghi từ vựng lưu ở trạng thái Draft. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Chọn thêm từ vựng mới. | |
| 2 | Nhập từ tiếng Anh, phiên âm, từ loại, nghĩa, độ khó, ảnh, audio. | |
| 3 | Soạn thảo các câu ví dụ (Anh, Việt, Audio). | |
| 4 | Chọn chủ đề liên kết. | |
| 5 | Nhấn "Lưu nháp". | Ghi dữ liệu đồng thời vào các bảng liên quan qua Transaction. |

---

### d. Quản lý Câu hỏi ôn luyện

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 015** |
| **Tên Usecase** | Quản lý Câu hỏi ôn luyện |
| **Tác nhân** | Biên tập viên |
| **Mô tả** | Soạn thảo câu hỏi trắc nghiệm, điền khuyết, nghe hiểu. |
| **Sự kiện kích hoạt** | Kích chọn "Quản lý câu hỏi". |
| **Tiền điều kiện** | Có quyền `MANAGE_QUESTIONS`. |
| **Hậu điều kiện** | Bản ghi câu hỏi nháp được tạo. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Chọn thêm câu hỏi mới. | |
| 2 | Chọn từ vựng mục tiêu, dạng câu hỏi. | |
| 3 | Nhập nội dung, đáp án JSON, giải thích. | |
| 4 | Nhấn "Lưu". | Lưu vào CSDL. |

---

### e. Quản lý Đề kiểm tra ngắn (Mini Tests CRUD)

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 016** |
| **Tên Usecase** | Quản lý Đề kiểm tra ngắn |
| **Tác nhân** | Biên tập viên |
| **Mô tả** | Tạo bài kiểm tra bằng cách gom các câu hỏi của chủ đề. |
| **Sự kiện kích hoạt** | Chọn "Quản lý Mini Test". |
| **Tiền điều kiện** | Có quyền `MANAGE_TESTS`. |
| **Hậu điều kiện** | Đề thi lưu nháp thành công. |

---

### f. Quản lý Tệp đa phương tiện (Upload Media)

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 017** |
| **Tên Usecase** | Quản lý Tệp đa phương tiện |
| **Tác nhân** | Biên tập viên, Quản trị viên |
| **Mô tả** | Tải lên hình ảnh, âm thanh minh họa. |
| **Sự kiện kích hoạt** | Chọn "Kho tài nguyên Media". |
| **Tiền điều kiện** | Có quyền `MANAGE_MEDIA`. |
| **Hậu điều kiện** | File tải lên thành công, lưu URL vào CSDL. |

---

### g. Gửi nội dung yêu cầu phê duyệt

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 018** |
| **Tên Usecase** | Gửi nội dung yêu cầu phê duyệt |
| **Tác nhân** | Biên tập viên |
| **Mô tả** | Gửi nội dung Draft/Rejected cho Admin duyệt. |
| **Sự kiện kích hoạt** | Nhấn "Gửi duyệt" tại dòng thông tin nội dung. |
| **Tiền điều kiện** | Là người tạo nội dung, có quyền `SUBMIT_CONTENT_REVIEW`. |
| **Hậu điều kiện** | Trạng thái chuyển sang `PendingReview`. |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Chọn nội dung muốn gửi. | |
| 2 | Bấm "Gửi duyệt". | Đổi trạng thái thành `PendingReview`, ghi log và báo Admin. |

---

### h. Xem danh sách nội dung theo trạng thái

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 019** |
| **Tên Usecase** | Xem danh sách nội dung theo trạng thái |
| **Tác nhân** | Biên tập viên |
| **Mô tả** | Lọc xem nội dung theo trạng thái: Draft, Pending, Rejected, Published. |
| **Sự kiện kích hoạt** | Truy cập "Nội dung của tôi". |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Hiển thị danh sách tương ứng. |

---

## 3.3.4. Các Use-cases dành cho Quản trị viên (Admin)

### a. Xem Dashboard Analytics hệ thống

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 020** |
| **Tên Usecase** | Xem Dashboard Analytics hệ thống |
| **Tác nhân** | Quản trị viên |
| **Mô tả** | Xem phân tích toàn hệ thống về học viên, nội dung, tương tác. |
| **Sự kiện kích hoạt** | Truy cập trang tổng quan Admin. |
| **Tiền điều kiện** | Có quyền `VIEW_GLOBAL_ANALYTICS`. |
| **Hậu điều kiện** | Hiển thị dữ liệu. |

---

### b. Quản lý Danh mục chủ đề

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 021** |
| **Tên Usecase** | Quản lý Danh mục chủ đề |
| **Tác nhân** | Quản trị viên |
| **Mô tả** | Thêm, sửa, xóa danh mục lớn (Categories). |
| **Sự kiện kích hoạt** | Chọn "Quản lý danh mục chủ đề". |
| **Tiền điều kiện** | Có quyền `MANAGE_TOPIC_CATEGORIES`. |
| **Hậu điều kiện** | Cập nhật CSDL. |

---

### c. Duyệt và phê duyệt nội dung

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 022** |
| **Tên Usecase** | Duyệt và phê duyệt nội dung |
| **Tác nhân** | Quản trị viên |
| **Mô tả** | Phê duyệt hoặc từ chối nội dung do Creator gửi lên. |
| **Sự kiện kích hoạt** | Chọn "Kiểm duyệt nội dung". |
| **Tiền điều kiện** | Có quyền `REVIEW_CONTENT`. |
| **Hậu điều kiện** | Trạng thái nội dung cập nhật (`Published` hoặc `Rejected`). |

**2. Luồng sự kiện chính (Thành công)**

| STT | Tác nhân | Hệ thống |
| --- | --- | --- |
| 1 | Xem danh sách nội dung `PendingReview`. | |
| 2 | Xem chi tiết nội dung. | |
| 3 | Quyết định Duyệt hoặc Từ chối (nhập lý do). | Cập nhật trạng thái và thông báo cho Creator. |

---

### d. Ghi nhận nhật ký lịch sử duyệt bài (UC 023)

*(Hệ thống tự động thực thi sau UC 022)*

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 023** |
| **Tên Usecase** | Ghi nhận nhật ký lịch sử duyệt bài |
| **Tác nhân** | Hệ thống |
| **Mô tả** | Lưu lại log kiểm duyệt (ID nội dung, ID Admin, trạng thái, lý do). |
| **Hậu điều kiện** | Bản ghi mới trong bảng `NhatKyDuyetNoiDung`. |

---

### e. Quản lý tài khoản Học viên

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 024** |
| **Tên Usecase** | Quản lý tài khoản Học viên |
| **Tác nhân** | Quản trị viên |
| **Mô tả** | Xem danh sách học viên, khóa/mở khóa tài khoản. |
| **Sự kiện kích hoạt** | Chọn "Quản lý học viên". |
| **Tiền điều kiện** | Có quyền `MANAGE_USERS`. |
| **Hậu điều kiện** | Trạng thái `IsActive` được thay đổi. |

---

### f. Xem báo cáo phân tích hiệu suất

**1. Thông tin chung**

| Thuộc tính | Nội dung |
| --- | --- |
| **Mã Use case** | **UC 025** |
| **Tên Usecase** | Xem báo cáo phân tích hiệu suất |
| **Tác nhân** | Quản trị viên |
| **Mô tả** | Phân bố từ vựng theo từ loại, xu hướng làm bài hàng ngày. |
| **Sự kiện kích hoạt** | Chọn "Thống kê & Báo cáo". |
| **Tiền điều kiện** | Có quyền `VIEW_GLOBAL_ANALYTICS`. |
| **Hậu điều kiện** | Hiển thị biểu đồ phân tích. |

---
*(Hết tài liệu)*
