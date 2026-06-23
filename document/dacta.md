# 3.3. Đặc tả chi tiết các Use-case

### 3.3.1. Các Use-cases dùng chung cho hệ thống

#### UC 001: Đăng nhập hệ thống
- **Mã Use case:** UC 001
- **Tên Usecase:** Đăng nhập hệ thống
- **Tác nhân:** Tất cả người dùng (Học viên, Biên tập viên, Quản trị viên)
- **Mô tả:** Tác nhân đăng nhập hệ thống để sử dụng các chức năng phù hợp với vai trò của mình.
- **Sự kiện kích hoạt:** Kích vào nút đăng nhập trên giao diện.
- **Tiền điều kiện:** Tác nhân đã có tài khoản trên hệ thống và tài khoản đang hoạt động (`IsActive = 1`).
- **Luồng sự kiện chính (Thành công):**
  1. Người dùng nhập Email và Mật khẩu vào ô nhập liệu trên giao diện.
  2. Người dùng nhấn nút "Đăng nhập".
  3. Hệ thống kiểm tra định dạng dữ liệu đầu vào.
  4. Hệ thống đối chiếu dữ liệu trong bảng `NguoiDung`.
  5. Hệ thống xác định quyền hạn (`Quyen`) tương ứng thông qua vai trò (`VaiTro`) và chuyển hướng người dùng đến giao diện tương ứng (Admin Dashboard, Creator Dashboard hoặc Learner Dashboard).
- **Luồng sự kiện thay thế:**
  - **2a. Nhập thiếu thông tin:** Hiển thị thông báo lỗi yêu cầu nhập đầy đủ email và mật khẩu.
  - **2b. Sai thông tin tài khoản:** Hiển thị thông báo lỗi: "Tên đăng nhập hoặc mật khẩu không chính xác".
  - **2c. Tài khoản bị khóa:** Hiển thị thông báo: "Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin".
- **Hậu điều kiện:** Đăng nhập thành công, token JWT được lưu trữ tại Client và cấp quyền truy cập các Route tương ứng.
- **Dữ liệu đầu vào:**
  - Email (Bắt buộc, đúng định dạng email).
  - Mật khẩu (Bắt buộc, tối thiểu 6 ký tự).

#### UC 002: Đăng ký tài khoản (Dành cho Học viên)
- **Mã Use case:** UC 002
- **Tên Usecase:** Đăng ký tài khoản (Dành cho Học viên)
- **Tác nhân:** Người dùng vãng lai (Chưa có tài khoản)
- **Mô tả:** Người dùng đăng ký tài khoản Học viên mới để có thể tham gia học tập từ vựng trên hệ thống.
- **Sự kiện kích hoạt:** Kích vào nút "Đăng ký" tại trang đăng nhập.
- **Tiền điều kiện:** Không.
- **Luồng sự kiện chính (Thành công):**
  1. Người dùng nhập các thông tin bắt buộc gồm: Họ tên, Email, Mật khẩu và Xác nhận mật khẩu.
  2. Người dùng nhấn nút "Đăng ký".
  3. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào.
  4. Hệ thống kiểm tra xem email đã tồn tại trong bảng `NguoiDung` hay chưa.
  5. Hệ thống tiến hành băm mật khẩu (`bcrypt.hash`) và lưu thông tin người dùng mới vào bảng `NguoiDung` với vai trò mặc định là Học viên (`Learner`).
  6. Hệ thống hiển thị thông báo đăng ký thành công và tự động chuyển hướng người dùng về trang Đăng nhập.
- **Luồng sự kiện thay thế:**
  - **3a. Email đã tồn tại:** Hệ thống hiển thị thông báo lỗi: "Email này đã được sử dụng trên hệ thống".
  - **3b. Mật khẩu xác nhận không khớp:** Hệ thống báo lỗi: "Mật khẩu xác nhận không trùng khớp".
- **Hậu điều kiện:** Tài khoản Học viên mới được tạo thành công trong hệ thống.
- **Dữ liệu đầu vào:**
  - Họ tên (Bắt buộc, chữ cái có dấu cách).
  - Email (Bắt buộc, đúng định dạng email).
  - Mật khẩu (Bắt buộc, từ 6 ký tự trở lên).
  - Nhập lại mật khẩu (Bắt buộc, khớp với mật khẩu).

#### UC 003: Cập nhật thông tin cá nhân
- **Mã Use case:** UC 003
- **Tên Usecase:** Cập nhật thông tin cá nhân
- **Tác nhân:** Tất cả người dùng
- **Mô tả:** Tác nhân muốn thay đổi thông tin hồ sơ cho phù hợp với thông tin cá nhân hiện tại.
- **Sự kiện kích hoạt:** Kích vào mục "Cấu hình" hoặc "Hồ sơ cá nhân" trên giao diện.
- **Tiền điều kiện:** Tác nhân đã đăng nhập thành công vào hệ thống.
- **Luồng sự kiện chính (Thành công):**
  1. Người dùng chọn cập nhật thông tin cá nhân.
  2. Người dùng điền thông tin muốn thay đổi (Họ tên, Mục tiêu học từ vựng mỗi ngày `DailyGoal`, Giới hạn câu ôn tập `SRSReviewLimit`).
  3. Người dùng nhấn nút "Lưu thay đổi".
  4. Hệ thống kiểm tra tính hợp lệ của dữ liệu.
  5. Hệ thống cập nhật dữ liệu mới vào bảng `NguoiDung` và phản hồi thông báo thành công.
- **Luồng sự kiện thay thế:**
  - **4a. Lỗi nhập liệu:** Ví dụ Họ tên rỗng hoặc các mục tiêu số là số âm, hệ thống báo lỗi dữ liệu không hợp lệ.
- **Hậu điều kiện:** Dữ liệu cá nhân mới của người dùng được cập nhật thành công vào cơ sở dữ liệu.
- **Dữ liệu đầu vào:**
  - Họ tên (Bắt buộc).
  - Mục tiêu từ vựng hàng ngày `DailyGoal` (Không bắt buộc, kiểu số dương).
  - Giới hạn ôn tập `SRSReviewLimit` (Không bắt buộc, kiểu số dương).

#### UC 004: Thay đổi mật khẩu
- **Mã Use case:** UC 004
- **Tên Usecase:** Thay đổi mật khẩu
- **Tác nhân:** Tất cả người dùng
- **Mô tả:** Tác nhân muốn thay đổi mật khẩu đăng nhập hiện tại để bảo mật tài khoản.
- **Sự kiện kích hoạt:** Click vào nút "Thay đổi mật khẩu" trong trang cấu hình tài khoản.
- **Tiền điều kiện:** Tác nhân đã đăng nhập thành công vào hệ thống.
- **Luồng sự kiện chính (Thành công):**
  1. Người dùng nhập Mật khẩu cũ, Mật khẩu mới và Nhập lại mật khẩu mới.
  2. Người dùng nhấn nút "Cập nhật mật khẩu".
  3. Hệ thống đối chiếu mật khẩu cũ với mật khẩu hiện tại trong cơ sở dữ liệu.
  4. Hệ thống kiểm tra tính hợp lệ và sự trùng khớp của mật khẩu mới.
  5. Hệ thống băm mật khẩu mới và lưu vào bảng `NguoiDung`, sau đó hiển thị thông báo đổi mật khẩu thành công.
- **Luồng sự kiện thay thế:**
  - **3a. Mật khẩu cũ không chính xác:** Hệ thống hiển thị thông báo lỗi: "Mật khẩu cũ không đúng".
  - **4a. Mật khẩu mới trùng mật khẩu cũ:** Báo lỗi: "Mật khẩu mới không được trùng với mật khẩu cũ".
- **Hậu điều kiện:** Mật khẩu mới được cập nhật vào cơ sở dữ liệu, người dùng cần sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.
- **Dữ liệu đầu vào:**
  - Mật khẩu cũ (Bắt buộc).
  - Mật khẩu mới (Bắt buộc, tối thiểu 6 ký tự).
  - Nhập lại mật khẩu mới (Bắt buộc, phải khớp với mật khẩu mới).

---

### 3.3.2. Các Use-cases dành cho Học viên (Learner)

#### UC 005: Xem Dashboard học tập cá nhân
- **Mã Use case:** UC 005
- **Tên Usecase:** Xem Dashboard học tập cá nhân
- **Tác nhân:** Học viên
- **Mô tả:** Học viên xem tổng quan tiến trình học tập cá nhân bao gồm: Điểm kinh nghiệm (TotalXP), Cấp độ (CurrentLevel), tiến độ mục tiêu ngày, heatmap hoạt động và danh sách các từ vựng đang yếu.
- **Sự kiện kích hoạt:** Kích vào mục "Tổng quan" hoặc "Dashboard" trên sidebar.
- **Tiền điều kiện:** Học viên đã đăng nhập thành công vào hệ thống.
- **Luồng sự kiện chính (Thành công):**
  1. Hệ thống lấy thông tin học tập của học viên từ bảng `NguoiDung`, `TienDoTuVungNguoiDung`, và `LanLamBaiTap`.
  2. Hệ thống tổng hợp số từ đã học, độ chính xác làm bài trung bình, số ngày học liên tiếp (Streak).
  3. Hệ thống hiển thị biểu đồ xu hướng học tập 7 ngày gần nhất và Heatmap đóng góp hoạt động.
  4. Hệ thống hiển thị danh sách 5 từ vựng đang có mức độ ghi nhớ yếu nhất (`MasteryLevel` < 3 hoặc `MemoryStatus = 'Lapsed'`).
- **Hậu điều kiện:** Dashboard hiển thị đầy đủ và trực quan dữ liệu của học viên.

#### UC 006: Học từ vựng mới theo chủ đề (Learn)
- **Mã Use case:** UC 006
- **Tên Usecase:** Học từ vựng mới theo chủ đề
- **Tác nhân:** Học viên
- **Mô tả:** Học viên học các từ vựng mới trong chủ đề đã chọn bằng cách xem chi tiết từ, nghe phát âm và xem ví dụ.
- **Sự kiện kích hoạt:** Kích chọn một chủ đề học tập cụ thể trên giao diện.
- **Tiền điều kiện:** Học viên đã đăng ký chủ đề đó (`DangKyChuDeNguoiDung`) và chủ đề ở trạng thái đã xuất bản (`DaXuatBan`).
- **Luồng sự kiện chính (Thành công):**
  1. Học viên chọn một chủ đề học tập.
  2. Hệ thống lấy danh sách từ vựng của chủ đề đó từ bảng `TuVung` thông qua bảng mapping `TuVungChuDe`.
  3. Hệ thống hiển thị giao diện học từ dạng slide/card. Với mỗi từ, hiển thị: từ tiếng Anh, phiên âm, từ loại, nghĩa tiếng Việt, hình ảnh minh họa và câu ví dụ kèm dịch nghĩa.
  4. Học viên kích chọn phát âm UK hoặc US để nghe phát âm chuẩn (audio lấy từ bảng `TepMedia`).
  5. Khi học viên lướt qua từ vựng, hệ thống ghi nhận từ này vào bảng tiến trình `TienDoTuVungNguoiDung` với trạng thái `MemoryStatus = 'Learning'`.
- **Hậu điều kiện:** Từ vựng được chuyển vào danh sách đang học của học viên để chuẩn bị ôn luyện ngắt quãng.

#### UC 007: Luyện tập thông qua Flashcard Spaced Repetition (Practice)
- **Mã Use case:** UC 007
- **Tên Usecase:** Luyện tập thông qua Flashcard Spaced Repetition
- **Tác nhân:** Học viên
- **Mô tả:** Ôn tập các từ vựng cần học lại dựa trên phương pháp lặp lại ngắt quãng (Spaced Repetition) thông qua các dạng câu hỏi ôn tập.
- **Sự kiện kích hoạt:** Kích chọn chức năng "Luyện tập" hoặc "Ôn tập" trên giao diện.
- **Tiền điều kiện:** Học viên đã đăng nhập và có các từ vựng đến hạn ôn tập (`NextReviewDate` nhỏ hơn hoặc bằng thời điểm hiện tại).
- **Luồng sự kiện chính (Thành công):**
  1. Học viên yêu cầu luyện tập.
  2. Hệ thống lấy danh sách tối đa 15 từ vựng cần ôn tập từ bảng `TienDoTuVungNguoiDung` của học viên (ưu tiên từ yếu và đến hạn).
  3. Hệ thống hiển thị câu hỏi ôn tập dưới các dạng: Trắc nghiệm nghĩa, Điền khuyết từ, Nghe từ nhập nghĩa, hoặc lật thẻ Flashcard tự đánh giá.
  4. Học viên chọn hoặc điền đáp án và nhấn nộp bài cho từng câu.
  5. Hệ thống hiển thị kết quả đúng/sai ngay lập tức cùng với phần giải thích từ vựng và ghi nhận XP cho học viên.
- **Hậu điều kiện:** Tiến trình từ vựng của học viên được cập nhật lại theo thuật toán ôn tập ngắt quãng (SRS).

#### UC 008: Tự động cập nhật tiến trình học từ vựng (UserWordProgress thông qua SP)
- **Mã Use case:** UC 008
- **Tên Usecase:** Tự động cập nhật tiến trình học từ vựng
- **Tác nhân:** Hệ thống
- **Mô tả:** Hệ thống tự động tính toán lại mức độ ghi nhớ, độ thành thạo và ngày ôn tập tiếp theo của từ vựng ngay khi học viên trả lời câu hỏi luyện tập.
- **Sự kiện kích hoạt:** Học viên nộp câu trả lời cho một câu hỏi luyện tập (UC 007).
- **Tiền điều kiện:** Không.
- **Luồng sự kiện chính (Thành công):**
  1. Hệ thống nhận thông tin gồm: `UserID`, `QuestionID`, `SubmittedAnswer` từ client.
  2. Hệ thống thực thi Stored Procedure `usp_SubmitQuestionAttempt` trong database để xử lý giao dịch an toàn (ACID).
  3. SP so sánh đáp án nộp lên với đáp án đúng trong bảng `CauHoi`.
  4. SP tính toán các chỉ số mới:
     - **Nếu trả lời Đúng:** Tăng `MasteryLevel` lên 1 đơn vị (tối đa 10), tăng hệ số dễ `EaseFactor` thêm 0.10, cập nhật trạng thái `MemoryStatus` tương ứng và tính toán kéo dài ngày ôn tiếp theo `NextReviewDate` dựa trên thuật toán SM-2.
     - **Nếu trả lời Sai:** Giảm `MasteryLevel` đi 1 đơn vị, giảm hệ số dễ `EaseFactor` đi 0.20, cập nhật trạng thái thành `Lapsed` (bị quên) và lên lịch ôn tập lại sau 30 phút.
  5. SP thực hiện UPSERT (Cập nhật hoặc Thêm mới) thông tin vào bảng `TienDoTuVungNguoiDung` và ghi nhận một bản ghi lịch sử vào `LanLamBaiTap`.
- **Hậu điều kiện:** Cơ sở dữ liệu ghi nhận chính xác tiến độ học tập và lịch ôn tập tiếp theo của học viên.

#### UC 009: Làm đề thi thử (Mini Test)
- **Mã Use case:** UC 009
- **Tên Usecase:** Làm đề thi thử (Mini Test)
- **Tác nhân:** Học viên
- **Mô tả:** Học viên làm bài thi thử mini (gồm các câu hỏi trắc nghiệm, điền từ) của một chủ đề để tự đánh giá năng lực tổng hợp.
- **Sự kiện kích hoạt:** Học viên chọn một bài Mini Test từ danh sách và nhấn "Bắt đầu làm bài".
- **Tiền điều kiện:** Bài thi đã được xuất bản (`DaXuatBan`) và học viên đã đăng ký chủ đề tương ứng.
- **Luồng sự kiện chính (Thành công):**
  1. Học viên yêu cầu làm bài thi.
  2. Hệ thống tạo một lượt ghi nhận làm bài mới trong bảng `LanLamBaiKiemTraNho` với trạng thái chưa nộp.
  3. Hệ thống hiển thị danh sách các câu hỏi của bài thi (truy xuất từ bảng `CauHoi` qua bảng mapping `CauHoiBaiKiemTraNho`) kèm đồng hồ đếm ngược.
  4. Học viên chọn các đáp án cho từng câu hỏi.
  5. Học viên bấm nút "Nộp bài".
  6. Hệ thống chấm điểm, đếm số câu đúng, lưu kết quả nộp bài vào bảng `LanLamBaiKiemTraNho` và hiển thị kết quả tổng quan (Điểm số %, số câu đúng/sai, thời gian hoàn thành).
- **Luồng sự kiện thay thế:**
  - **5a. Hết thời gian làm bài:** Hệ thống tự động khóa giao diện làm bài, tiến hành tự động nộp bài với các câu trả lời hiện tại của học viên.
- **Hậu điều kiện:** Kết quả lượt thi được lưu trữ để phục vụ phân tích học tập.

#### UC 010: Xem lịch sử kiểm tra và đáp án chi tiết
- **Mã Use case:** UC 010
- **Tên Usecase:** Xem lịch sử kiểm tra và đáp án chi tiết
- **Tác nhân:** Học viên
- **Mô tả:** Học viên xem lại danh sách các bài thi Mini Test đã từng thực hiện và xem chi tiết đáp án của từng câu hỏi để ôn tập lại lỗi sai.
- **Sự kiện kích hoạt:** Kích chọn "Lịch sử thi" hoặc biểu tượng xem lại tại danh sách bài kiểm tra.
- **Tiền điều kiện:** Học viên đã đăng nhập và đã từng hoàn thành ít nhất một lượt làm bài Mini Test.
- **Luồng sự kiện chính (Thành công):**
  1. Học viên truy cập trang Lịch sử.
  2. Hệ thống truy vấn các lượt thi tương ứng từ bảng `LanLamBaiKiemTraNho` và hiển thị dạng danh sách (gồm tiêu đề bài thi, điểm số, thời gian làm).
  3. Học viên chọn một lượt thi cụ thể để xem chi tiết.
  4. Hệ thống tải lại danh sách các câu hỏi trong lượt thi đó, hiển thị rõ câu trả lời học viên đã chọn, đáp án đúng của hệ thống và giải thích lý do tại sao đúng/sai.
- **Hậu điều kiện:** Học viên xem được chi tiết bài làm của mình.

#### UC 011: Xem bảng thành tích học tập và Huy hiệu (Achievements & Gamification)
- **Mã Use case:** UC 011
- **Tên Usecase:** Xem bảng thành tích học tập và Huy hiệu
- **Tác nhân:** Học viên
- **Mô tả:** Xem các huy hiệu thành tích học tập cá nhân đã mở khóa dựa trên điểm kinh nghiệm, số lượng từ đã học và chuỗi ngày duy trì học tập.
- **Sự kiện kích hoạt:** Kích chọn tab "Thành tích" hoặc "Huy hiệu" trên giao diện.
- **Tiền điều kiện:** Học viên đã đăng nhập thành công.
- **Luồng sự kiện chính (Thành công):**
  1. Học viên mở trang Thành tích.
  2. Hệ thống kiểm tra dữ liệu `TotalXP`, số từ đã đạt mức thành thạo (`MasteryLevel >= 8`), số lượt hoàn thành bài tập từ các bảng liên quan.
  3. Hệ thống hiển thị danh sách các huy hiệu có trong game. Các huy hiệu đã đạt điều kiện sẽ sáng lên (Active), các huy hiệu chưa đạt điều kiện sẽ hiển thị mờ kèm yêu cầu còn thiếu (Locked).
- **Hậu điều kiện:** Hiển thị thành công bảng huy hiệu cá nhân.

---

### 3.3.3. Các Use-cases dành cho Biên tập viên (Content Creator)

#### UC 012: Xem Dashboard & Báo cáo số liệu Content Creator
- **Mã Use case:** UC 012
- **Tên Usecase:** Xem Dashboard & Báo cáo số liệu Content Creator
- **Tác nhân:** Biên tập viên (Content Creator)
- **Mô tả:** Xem số lượng thống kê các nội dung học thuật (Chủ đề, Từ vựng, Câu hỏi, Bài thi) do mình tạo ra và trạng thái kiểm duyệt hiện tại của chúng.
- **Sự kiện kích hoạt:** Biên tập viên đăng nhập và truy cập trang chủ Creator.
- **Tiền điều kiện:** Tài khoản có quyền `VIEW_CONTENT_ANALYTICS`.
- **Luồng sự kiện chính (Thành công):**
  1. Hệ thống truy vấn từ view `vw_ContentCreatorContentSummary` lọc theo `CreatedByUserID` là ID của biên tập viên hiện tại.
  2. Hệ thống hiển thị các thẻ thống kê số lượng và biểu đồ tròn biểu thị tỷ lệ nội dung: Đang soạn (Draft), Chờ duyệt (Pending), Bị từ chối (Rejected) và Đã xuất bản (Published).
- **Hậu điều kiện:** Hiển thị giao diện báo cáo trực quan cho biên tập viên.

#### UC 013: Quản lý Chủ đề (Topics CRUD - Trạng thái Draft)
- **Mã Use case:** UC 013
- **Tên Usecase:** Quản lý Chủ đề (Topics CRUD)
- **Tác nhân:** Biên tập viên
- **Mô tả:** Thực hiện thêm mới, xem danh sách, chỉnh sửa hoặc xóa các chủ đề học tập từ vựng.
- **Sự kiện kích hoạt:** Chọn chức năng "Quản lý chủ đề" tại trang biên tập viên.
- **Tiền điều kiện:** Biên tập viên có quyền `MANAGE_TOPICS`.
- **Luồng sự kiện chính (Thành công):**
  - **Tạo mới chủ đề:**
    1. Chọn tạo mới chủ đề.
    2. Nhập tên chủ đề, mã chủ đề, mô tả và chọn danh mục lớn (Topic Category).
    3. Chọn "Lưu nháp". Hệ thống lưu dữ liệu vào bảng `ChuDe` với trạng thái mặc định `ContentStatus = 'Draft'`.
  - **Chỉnh sửa chủ đề:** Biên tập viên chỉ có thể sửa thông tin của các chủ đề do chính mình tạo ra đang ở trạng thái `Draft` hoặc `Rejected`.
  - **Xóa chủ đề:** Chỉ cho phép xóa các chủ đề ở trạng thái `Draft` hoặc `Rejected` chưa được xuất bản.
- **Luồng sự kiện thay thế:**
  - **3a. Trùng mã chủ đề:** Báo lỗi mã chủ đề đã tồn tại trong hệ thống.
- **Hậu điều kiện:** Dữ liệu chủ đề được lưu vào bảng `ChuDe`.

#### UC 014: Quản lý Từ vựng & Câu ví dụ đi kèm (Words & Examples CRUD - Trạng thái Draft)
- **Mã Use case:** UC 014
- **Tên Usecase:** Quản lý Từ vựng & Câu ví dụ đi kèm
- **Tác nhân:** Biên tập viên
- **Mô tả:** Soạn thảo, cập nhật, xóa các từ vựng kèm theo từ loại, nghĩa tiếng Việt, phiên âm, audio và các câu ví dụ đi kèm trong ngữ cảnh thực tế.
- **Sự kiện kích hoạt:** Chọn mục "Quản lý từ vựng" trên giao diện biên tập viên.
- **Tiền điều kiện:** Biên tập viên có quyền `MANAGE_WORDS`.
- **Luồng sự kiện chính (Thành công):**
  1. Biên tập viên click chọn thêm từ vựng mới.
  2. Nhập các thông tin từ vựng: Từ tiếng Anh, phiên âm, chọn từ loại, nghĩa, độ khó (1-5), link ảnh minh họa và audio phát âm.
  3. Soạn thảo các câu ví dụ đi kèm (gồm câu tiếng Anh, bản dịch nghĩa tiếng Việt, audio ví dụ).
  4. Gắn từ vựng vào một hoặc nhiều chủ đề (Topics).
  5. Nhấn "Lưu nháp". Hệ thống thực hiện ghi dữ liệu đồng thời vào các bảng `TuVung`, `CauViDu`, và `TuVungChuDe` trong một Transaction với trạng thái `ContentStatus = 'Draft'`.
- **Hậu điều kiện:** Bản ghi từ vựng mới được lưu ở trạng thái Draft chờ gửi duyệt.

#### UC 015: Quản lý Câu hỏi ôn luyện (Questions CRUD - Trạng thái Draft)
- **Mã Use case:** UC 015
- **Tên Usecase:** Quản lý Câu hỏi ôn luyện
- **Tác nhân:** Biên tập viên
- **Mô tả:** Soạn thảo các câu hỏi luyện tập phục vụ bài tập ôn tập ngắt quãng và bài kiểm tra nhỏ.
- **Sự kiện kích hoạt:** Kích chọn "Quản lý câu hỏi" trên giao diện quản trị nội dung.
- **Tiền điều kiện:** Biên tập viên có quyền `MANAGE_QUESTIONS`.
- **Luồng sự kiện chính (Thành công):**
  1. Biên tập viên chọn thêm câu hỏi mới.
  2. Chọn từ vựng mục tiêu mà câu hỏi này hướng tới (Word ID).
  3. Chọn dạng câu hỏi (Trắc nghiệm, Điền khuyết, Nghe hiểu).
  4. Nhập nội dung câu hỏi, danh sách các đáp án lựa chọn (dạng JSON), đáp án đúng và phần giải thích chi tiết tại sao đúng.
  5. Chọn "Lưu". Hệ thống tạo bản ghi trong bảng `CauHoi` dưới trạng thái `ContentStatus = 'Draft'`.
- **Hậu điều kiện:** Bản ghi câu hỏi nháp được tạo thành công trong hệ thống.

#### UC 016: Quản lý Đề kiểm tra ngắn (Mini Tests CRUD - Trạng thái Draft)
- **Mã Use case:** UC 016
- **Tên Usecase:** Quản lý Đề kiểm tra ngắn
- **Tác nhân:** Biên tập viên
- **Mô tả:** Tạo và thiết lập bài kiểm tra ngắn (Mini Test) bằng cách gom các câu hỏi trắc nghiệm/điền từ của chủ đề.
- **Sự kiện kích hoạt:** Chọn chức năng "Quản lý Mini Test".
- **Tiền điều kiện:** Biên tập viên có quyền `MANAGE_TESTS`.
- **Luồng sự kiện chính (Thành công):**
  1. Biên tập viên chọn thêm mới bài thi.
  2. Nhập tiêu đề bài thi, mô tả, thời gian làm bài (phút) và chọn chủ đề liên kết.
  3. Lựa chọn các câu hỏi từ danh sách câu hỏi có sẵn thuộc chủ đề đó và sắp xếp thứ tự hiển thị.
  4. Hệ thống lưu thông tin vào bảng `BaiKiemTraNho` và bảng mapping `CauHoiBaiKiemTraNho` với trạng thái `ContentStatus = 'Draft'`.
- **Hậu điều kiện:** Đề thi mới được lưu trữ ở trạng thái bản nháp.

#### UC 017: Quản lý Tệp đa phương tiện (Upload & Quản lý Media Assets - Hình ảnh/Âm thanh)
- **Mã Use case:** UC 017
- **Tên Usecase:** Quản lý Tệp đa phương tiện
- **Tác nhân:** Biên tập viên, Quản trị viên
- **Mô tả:** Tải lên hệ thống các tệp audio phát âm (UK/US) và hình ảnh minh họa cho từ vựng, câu hỏi.
- **Sự kiện kích hoạt:** Kích chọn chức năng "Kho tài nguyên Media" trên giao diện.
- **Tiền điều kiện:** Có quyền `MANAGE_MEDIA`.
- **Luồng sự kiện chính (Thành công):**
  1. Người dùng chọn tải lên một hoặc nhiều tệp hình ảnh/âm thanh từ máy tính.
  2. Hệ thống kiểm tra dung lượng và định dạng tệp (ví dụ .mp3, .png, .jpg).
  3. Hệ thống tải tệp lên thư mục lưu trữ và ghi nhận bản ghi mới vào bảng `TepMedia` (gồm tên tệp, loại tệp, đường dẫn URL, người upload).
  4. Người dùng có thể liên kết tệp media này với từ vựng hoặc ví dụ thông qua bảng mapping `LienKetMediaNoiDung`.
- **Hậu điều kiện:** File media được tải lên hệ thống thành công và sẵn sàng để sử dụng.

#### UC 018: Gửi nội dung yêu cầu phê duyệt (Submit for Review)
- **Mã Use case:** UC 018
- **Tên Usecase:** Gửi nội dung yêu cầu phê duyệt
- **Tác nhân:** Biên tập viên
- **Mô tả:** Biên tập viên gửi các nội dung (Chủ đề, Từ vựng, Câu hỏi, Đề thi) đang ở trạng thái Draft hoặc Rejected cho Admin phê duyệt để xuất bản lên hệ thống học.
- **Sự kiện kích hoạt:** Click nút "Gửi duyệt" bên cạnh dòng thông tin nội dung.
- **Tiền điều kiện:** Người gửi là người tạo nội dung đó và nội dung đang ở trạng thái `Draft` hoặc `Rejected`. Có quyền `SUBMIT_CONTENT_REVIEW`.
- **Luồng sự kiện chính (Thành công):**
  1. Biên tập viên chọn nội dung muốn gửi duyệt.
  2. Bấm nút "Gửi duyệt".
  3. Hệ thống đổi trạng thái nội dung thành `PendingReview` (Chờ duyệt).
  4. Hệ thống ghi một bản ghi log trạng thái vào bảng `NhatKyDuyetNoiDung` và tạo thông báo cho Admin.
- **Hậu điều kiện:** Trạng thái của nội dung chuyển sang PendingReview, biên tập viên tạm thời không thể chỉnh sửa nội dung này trừ khi bị từ chối hoặc Admin trả lại.

#### UC 019: Xem danh sách nội dung: Bản nháp (Drafts), Đang chờ duyệt (Pending), Bị từ chối kèm lý do (Rejected)
- **Mã Use case:** UC 019
- **Tên Usecase:** Xem danh sách nội dung theo trạng thái
- **Tác nhân:** Biên tập viên
- **Mô tả:** Biên tập viên lọc xem danh sách các nội dung mình đã tạo theo từng trạng thái để theo dõi tiến độ duyệt bài và sửa đổi các bài bị từ chối.
- **Sự kiện kích hoạt:** Truy cập trang "Nội dung của tôi" trên giao diện Creator.
- **Tiền điều kiện:** Đã đăng nhập vai trò Content Creator.
- **Luồng sự kiện chính (Thành công):**
  1. Biên tập viên mở danh sách nội dung.
  2. Chọn tab trạng thái tương ứng (Drafts, Pending, Rejected, Published).
  3. Đối với các nội dung bị từ chối (`Rejected`), hệ thống sẽ hiển thị kèm theo lý do từ chối và ý kiến phản hồi của Admin (lấy từ bảng `NhatKyDuyetNoiDung`).
- **Hậu điều kiện:** Hiển thị danh sách nội dung chính xác theo trạng thái đã lọc.

---

### 3.3.4. Các Use-cases dành cho Quản trị viên (Admin)

#### UC 020: Xem Dashboard Analytics hệ thống (Thống kê toàn cục)
- **Mã Use case:** UC 020
- **Tên Usecase:** Xem Dashboard Analytics hệ thống
- **Tác nhân:** Quản trị viên (Admin)
- **Mô tả:** Xem các số liệu phân tích toàn hệ thống về học viên, giáo viên, nội dung và lượt tương tác học tập.
- **Sự kiện kích hoạt:** Admin đăng nhập và truy cập trang tổng quan hệ thống.
- **Tiền điều kiện:** Có quyền `VIEW_GLOBAL_ANALYTICS`.
- **Luồng sự kiện chính (Thành công):**
  1. Hệ thống thực hiện truy vấn tổng hợp dữ liệu toàn bộ hệ thống.
  2. Hiển thị các chỉ số: Tổng số Học viên, Tổng số Biên tập viên, Tổng số Từ vựng đã xuất bản, Tổng số lượt làm bài kiểm tra.
  3. Hiển thị các biểu đồ: Biểu đồ đường biểu diễn xu hướng làm bài kiểm tra hàng ngày, biểu đồ cột biểu diễn phân phối từ vựng theo từ loại và chủ đề.
- **Hậu điều kiện:** Dashboard hiển thị đầy đủ và trực quan dữ liệu toàn cục.

#### UC 021: Quản lý Danh mục chủ đề (Topic Categories CRUD)
- **Mã Use case:** UC 021
- **Tên Usecase:** Quản lý Danh mục chủ đề
- **Tác nhân:** Quản trị viên
- **Mô tả:** Thực hiện thêm, sửa, xóa các danh mục lớn của chủ đề (Topic Categories) để phân nhóm chủ đề TOEIC.
- **Sự kiện kích hoạt:** Kích chọn "Quản lý danh mục chủ đề" trên giao diện Admin.
- **Tiền điều kiện:** Admin có quyền `MANAGE_TOPIC_CATEGORIES`.
- **Luồng sự kiện chính (Thành công):**
  - **Thêm danh mục:** Nhập tên danh mục, mô tả và lưu vào bảng `DanhMucChuDe`.
  - **Sửa danh mục:** Chọn danh mục, sửa thông tin và cập nhật.
  - **Xóa danh mục:** Admin chỉ được phép xóa danh mục khi danh mục đó trống (không chứa bất kỳ chủ đề nào bên trong).
- **Hậu điều kiện:** Thay đổi được lưu vào cơ sở dữ liệu.

#### UC 022: Duyệt và phê duyệt nội dung của Biên tập viên (Approve/Reject Content)
- **Mã Use case:** UC 022
- **Tên Usecase:** Duyệt và phê duyệt nội dung
- **Tác nhân:** Quản trị viên
- **Mô tả:** Xem xét các yêu cầu phê duyệt nội dung học tập do Biên tập viên gửi lên và đưa ra quyết định duyệt hoặc từ chối.
- **Sự kiện kích hoạt:** Admin chọn mục "Kiểm duyệt nội dung".
- **Tiền điều kiện:** Admin có quyền `REVIEW_CONTENT`.
- **Luồng sự kiện chính (Thành công):**
  1. Admin xem danh sách các nội dung ở trạng thái `PendingReview`.
  2. Admin chọn xem chi tiết một chủ đề, từ vựng hoặc bài thi.
  3. Admin đưa ra quyết định:
     - **Nếu đồng ý (Phê duyệt):** Hệ thống đổi trạng thái nội dung thành `DaXuatBan` (Published) và cập nhật thời gian xuất bản. Nội dung chính thức xuất hiện trên ứng dụng của học viên.
     - **Nếu không đồng ý (Từ chối):** Admin nhập phản hồi/lý do từ chối (ví dụ: "Sai chính tả câu ví dụ 2"). Hệ thống chuyển trạng thái nội dung thành `BiTuChoi` (Rejected) và trả về cho biên tập viên sửa đổi.
- **Hậu điều kiện:** Trạng thái nội dung được cập nhật chính xác trong cơ sở dữ liệu.

#### UC 023: Ghi nhận nhật ký lịch sử duyệt bài (ContentReviewLogs)
- **Mã Use case:** UC 023
- **Tên Usecase:** Ghi nhận nhật ký lịch sử duyệt bài
- **Tác nhân:** Hệ thống
- **Mô tả:** Hệ thống tự động ghi nhận lại nhật ký kiểm duyệt bài mỗi khi Admin thực hiện phê duyệt hoặc từ chối một nội dung để đảm bảo tính minh bạch.
- **Sự kiện kích hoạt:** Admin nhấn nút Phê duyệt hoặc Từ chối nội dung (UC 022).
- **Tiền điều kiện:** Không.
- **Luồng sự kiện chính (Thành công):**
  1. Hệ thống tự động lấy thông tin: ID của nội dung được duyệt, ID của Admin thực hiện, thời gian thực hiện, trạng thái trước và sau khi duyệt.
  2. Hệ thống lưu các thông tin này kèm theo nội dung phản hồi (nếu bị từ chối) vào bảng `NhatKyDuyetNoiDung`.
- **Hậu điều kiện:** Nhật ký duyệt bài được cập nhật thành công vào cơ sở dữ liệu.

#### UC 024: Quản lý tài khoản Học viên (Xem danh sách, Khóa/Mở khóa tài khoản)
- **Mã Use case:** UC 024
- **Tên Usecase:** Quản lý tài khoản Học viên
- **Tác nhân:** Quản trị viên
- **Mô tả:** Admin xem danh sách học viên, theo dõi tiến độ học tập cơ bản của học viên và có quyền khóa hoặc mở khóa tài khoản người dùng.
- **Sự kiện kích hoạt:** Kích chọn mục "Quản lý học viên" trên thanh điều hướng Admin.
- **Tiền điều kiện:** Admin có quyền `MANAGE_USERS`.
- **Luồng sự kiện chính (Thành công):**
  1. Admin mở trang quản lý người dùng học viên.
  2. Hệ thống hiển thị danh sách tài khoản học viên (phân trang) cùng các thông tin: Họ tên, email, ngày tạo, trạng thái hoạt động.
  3. Admin có thể click nút "Khóa tài khoản" hoặc "Mở khóa tài khoản".
  4. Hệ thống cập nhật trường trạng thái hoạt động `IsActive` của người học trong bảng `NguoiDung` (bằng 0 là Khóa, bằng 1 là Mở khóa).
- **Hậu điều kiện:** Trạng thái hoạt động của tài khoản được cập nhật và áp dụng ngay lập tức cho lần đăng nhập tiếp theo của học viên.

#### UC 025: Xem báo cáo phân tích hiệu suất (Word Distribution & Daily attempts trends)
- **Mã Use case:** UC 025
- **Tên Usecase:** Xem báo cáo phân tích hiệu suất
- **Tác nhân:** Quản trị viên (Admin)
- **Mô tả:** Xem báo cáo chi tiết về tỷ lệ phân bố từ vựng theo từ loại và biểu đồ xu hướng số lượng lượt làm bài của học viên hàng ngày.
- **Sự kiện kích hoạt:** Kích chọn mục "Thống kê & Báo cáo" hoặc "Analytics" trên sidebar Admin.
- **Tiền điều kiện:** Admin có quyền `VIEW_GLOBAL_ANALYTICS`.
- **Luồng sự kiện chính (Thành công):**
  1. Admin truy cập trang Analytics.
  2. Hệ thống truy vấn số lượng từ vựng của mỗi từ loại từ bảng `TuVung` JOIN `TuLoai` và vẽ biểu đồ tròn hiển thị tỉ lệ phân bổ.
  3. Hệ thống đếm tổng số lượt làm bài tập (`LanLamBaiTap`) và làm bài kiểm tra (`LanLamBaiKiemTraNho`) theo từng ngày trong khoảng thời gian đã chọn, hiển thị dạng biểu đồ đường.
- **Hậu điều kiện:** Hiển thị thành công biểu đồ và bảng dữ liệu báo cáo hiệu suất.
