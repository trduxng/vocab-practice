# Đặc tả chi tiết các Use-case

## 3.1. Các Use-cases dùng chung cho hệ thống

### a. UC 001: Đăng nhập hệ thống

| Mã Use case | UC 001 | | Tên Usecase | Đăng nhập |
|---|---|---|---|---|
| Tác nhân | Tất cả (Learner, Content Creator, Admin) | | | |
| Mô tả | Tác nhân đăng nhập hệ thống để sử dụng các chức năng phù hợp với vai trò của mình | | | |
| Sự kiện kích hoạt | Kích vào nút đăng nhập trên giao diện | | | |
| Tiền điều kiện | Tác nhân đã có tài khoản trên hệ thống | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập email và mật khẩu vào ô textbox trên giao diện | Kiểm tra các trường đăng nhập đã hợp lệ hay chưa | |
| | 2 | Yêu cầu đăng nhập | Kiểm tra email và mật khẩu có hợp lệ hay không | |
| | 3 | | Tạo JWT token (1 ngày hết hạn) và hiển thị giao diện tương ứng với vai trò | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 2a | Hiển thị thông báo lỗi: Email hoặc mật khẩu không đúng | | |
| | 2b | Hiển thị thông báo lỗi: Tài khoản đã bị khóa | | |
| Hậu điều kiện | Tác nhân đăng nhập được vào hệ thống với giao diện phù hợp vai trò | | | |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Email | Input email field | Có | Đúng định dạng email | learner@example.com |
| 2 | Mật khẩu | Input password field | Có | Mật khẩu ít nhất 6 kí tự | password123 |

---

### b. UC 002: Đăng ký tài khoản

| Mã Use case | UC 002 | | Tên Usecase | Đăng ký tài khoản |
|---|---|---|---|---|
| Tác nhân | Người dùng mới (Learner) | | | |
| Mô tả | Người dùng mới tạo tài khoản để sử dụng hệ thống, rate-limited 10 request/15 phút | | | |
| Sự kiện kích hoạt | Kích vào nút Đăng ký trên giao diện | | | |
| Tiền điều kiện | Người dùng chưa có tài khoản trên hệ thống | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập Họ tên, Email, Mật khẩu | Kiểm tra các trường dữ liệu hợp lệ | |
| | 2 | Yêu cầu đăng ký | Kiểm tra email đã tồn tại hay chưa | |
| | 3 | | Tạo tài khoản mới với role Learner, hash mật khẩu bằng bcrypt | |
| | 4 | | Tự động đăng nhập và chuyển đến Dashboard | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 2a | Hiển thị thông báo lỗi: Email đã được đăng ký | | |
| | 2b | Hiển thị thông báo lỗi: Vượt quá số lần đăng ký cho phép (rate limit) | | |
| Hậu điều kiện | Tài khoản mới được tạo, người dùng đăng nhập vào hệ thống | | | |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Họ tên | Input text field | Có | 2-100 ký tự | Nguyễn Văn A |
| 2 | Email | Input email field | Có | Đúng định dạng email | learner@example.com |
| 3 | Mật khẩu | Input password field | Có | Ít nhất 6 ký tự | password123 |

---

### c. UC 003: Cập nhật thông tin cá nhân

| Mã Use case | UC 003 | | Tên Usecase | Cập nhật thông tin cá nhân |
|---|---|---|---|---|
| Tác nhân | Tất cả (Learner, Content Creator, Admin) | | | |
| Mô tả | Tác nhân thay đổi thông tin cá nhân của mình | | | |
| Sự kiện kích hoạt | Click vào mục Cập nhật thông tin trên Profile | | | |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Điền thông tin muốn thay đổi | Kiểm tra thông tin nhập liệu | |
| | 2 | Yêu cầu cập nhật | Cập nhật dữ liệu và hiển thị thông báo thành công | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 1a | Hiển thị thông báo lỗi thông tin không đúng hoặc không đủ | | |
| | 2a | Thông báo lỗi hệ thống không thể cập nhật | | |
| Hậu điều kiện | Thông tin cá nhân được cập nhật trong CSDL | | | |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Họ tên | Input text field | Có | 2-100 ký tự | Nguyễn Văn A |
| 2 | Email | Input email field | Không | Đúng định dạng email | newemail@example.com |

---

### d. UC 004: Thay đổi mật khẩu

| Mã Use case | UC 004 | | Tên Usecase | Thay đổi mật khẩu |
|---|---|---|---|---|
| Tác nhân | Tất cả | | | |
| Mô tả | Tác nhân thay đổi mật khẩu cho phù hợp | | | |
| Sự kiện kích hoạt | Click vào mục Thay đổi mật khẩu trong Profile | | | |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập mật khẩu cũ, mật khẩu mới và xác nhận | Kiểm tra các trường hợp lệ | |
| | 2 | Yêu cầu thay đổi | Kiểm tra mật khẩu cũ đúng, cập nhật mật khẩu mới | |
| | 3 | | Hiển thị thông báo thay đổi thành công | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 2a | Hiển thị thông báo lỗi: Mật khẩu cũ không đúng | | |
| | 2b | Hiển thị thông báo lỗi: Mật khẩu mới không trùng khớp | | |
| Hậu điều kiện | Mật khẩu mới được cập nhật vào hệ thống | | | |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Mật khẩu cũ | Input password field | Có | Đúng mật khẩu hiện tại | oldpass123 |
| 2 | Mật khẩu mới | Input password field | Có | Ít nhất 6 ký tự | newpass123 |
| 3 | Xác nhận mật khẩu | Input password field | Có | Trùng khớp với mật khẩu mới | newpass123 |

---

## 3.2. Các Use-cases dành cho Học viên (Learner)

### a. UC 005: Xem Dashboard học tập cá nhân

| Mã Use case | UC 005 | | Tên Usecase | Xem Dashboard học tập cá nhân |
|---|---|---|---|---|
| Tác nhân | Học viên (Learner) | | | |
| Mô tả | Xem tổng quan tình hình học tập: số từ đã học, độ chính xác, từ yếu, xu hướng 7 ngày, XP, level, streak | | | |
| Sự kiện kích hoạt | Đăng nhập thành công hoặc kích vào Dashboard | | | |
| Tiền điều kiện | Học viên đã đăng nhập thành công | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Kích vào mục Dashboard | Truy vấn tổng hợp dữ liệu thống kê | |
| | 2 | | Hiển thị: số từ đã học (MasteryLevel >= 3), accuracy %, weak words top 5, recent 10 attempts, daily trends 7 ngày, XP, level, streak | |
| | 3 | | Hiển thị Mastery Timeline: completion %, estimated days to mastery | |
| | 4 | | Hiển thị Calendar Heatmap và Learning Path Roadmap | |
| Hậu điều kiện | Học viên xem được dashboard tổng quan | | | |

---

### b. UC 006: Học từ vựng mới theo chủ đề (Learn)

| Mã Use case | UC 006 | | Tên Usecase | Học từ vựng mới theo chủ đề |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Học viên chọn chủ đề và học các từ vựng mới trong chủ đề đó | | | |
| Sự kiện kích hoạt | Kích vào mục Học (Learn) và chọn chủ đề | | | |
| Tiền điều kiện | Học viên đã đăng nhập thành công | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Chọn chủ đề từ danh sách các chủ đề đã publish | Hiển thị danh sách từ vựng trong chủ đề với nghĩa, phiên âm, ví dụ | |
| | 2 | Tương tác với từng từ: xem nghĩa, nghe phát âm, xem câu ví dụ | Hiển thị chi tiết từ vựng | |
| | 3 | Kích nút "Đã học" hoặc chuyển sang từ tiếp theo | Ghi nhận lượt học, tặng +5 XP, cập nhật UserWordProgress | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 1a | Thông báo chủ đề không có từ vựng nào | | |
| Hậu điều kiện | Từ vựng được thêm vào tiến trình học SRS của học viên | | | |

---

### c. UC 007: Luyện tập Flashcard Spaced Repetition (Practice)

| Mã Use case | UC 007 | | Tên Usecase | Luyện tập Flashcard SRS |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Luyện tập với flashcard sử dụng thuật toán Spaced Repetition để tối ưu ghi nhớ | | | |
| Sự kiện kích hoạt | Kích vào mục Luyện tập (Practice) | | | |
| Tiền điều kiện | Học viên đã có từ vựng trong tiến trình học | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Kích vào Practice | Lấy danh sách flashcard đến hạn ôn tập (tối đa SRSReviewLimit), ưu tiên quá hạn trước | |
| | 2 | Xem từ và chọn đáp án / tự đánh giá | Hiển thị từng flashcard | |
| | 3 | Đánh giá mức độ nhớ (Again/Hard/Good/Easy) | Cập nhật thuật toán SRS: MasteryLevel, EaseFactor, NextReviewDate | |
| | 4 | | Tặng XP tương ứng, cập nhật MemoryStatus | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 1a | Thông báo: Hôm nay không có từ cần ôn tập | | |
| | 3a | Nếu sai nhiều lần: chuyển MemoryStatus sang Lapsed để ôn tập lại | | |
| Hậu điều kiện | Tiến trình SRS được cập nhật, XP được tặng | | | |

---

### d. UC 008: Xem hàng chờ ôn tập thông minh

| Mã Use case | UC 008 | | Tên Usecase | Xem hàng chờ ôn tập thông minh |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem danh sách các từ cần ôn tập trong 7 ngày tới, sắp xếp theo độ khẩn cấp | | | |
| Sự kiện kích hoạt | Kích vào mục Smart Queue trong Practice | | | |
| Tiền điều kiện | Học viên có từ vựng trong tiến trình học | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu xem Smart Queue | Tính urgency score từ overdue hours x consecutive wrong multiplier | |
| | 2 | | Hiển thị danh sách từ ưu tiên trong 7 ngày tới | |
| | 3 | | Hiển thị Mistake Review Queue cho các từ hay sai | |
| Hậu điều kiện | Học viên thấy được lịch ôn tập tối ưu | | | |

---

### e. UC 009: Quản lý mục tiêu hàng ngày

| Mã Use case | UC 009 | | Tên Usecase | Quản lý mục tiêu hàng ngày |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem và thiết lập mục tiêu học tập hàng ngày, cấu hình SRS | | | |
| Sự kiện kích hoạt | Kích vào mục Settings / Daily Goal | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem mục tiêu hiện tại | Hiển thị Daily Goal (mặc định 20) và Daily Progress | |
| | 2 | Thay đổi Daily Goal (5-100) | Lưu cấu hình mới | |
| | 3 | Cấu hình SRS Review Limit (5-50) | Lưu cấu hình SRS mới | |
| Hậu điều kiện | Cấu hình mục tiêu được cập nhật | | | |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Daily Goal | Number input | Có | 5-100 từ/ngày | 20 |
| 2 | SRS Review Limit | Number input | Có | 5-50 flashcard/ngày | 15 |

---

### f. UC 010: Làm đề thi thử (Mini Test)

| Mã Use case | UC 010 | | Tên Usecase | Làm đề thi thử |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Làm bài kiểm tra ngắn để đánh giá kiến thức | | | |
| Sự kiện kích hoạt | Kích vào mục Mini Test, chọn đề thi | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Chọn đề thi từ danh sách Mini Test đã publish | Hiển thị danh sách đề thi kèm số câu hỏi | |
| | 2 | Kích vào đề thi | Hiển thị các câu hỏi (không hiển thị đáp án đúng) | |
| | 3 | Trả lời lần lượt từng câu | Lưu kết quả tạm thời | |
| | 4 | Nộp bài | Batch-submit tất cả câu trả lời, kiểm tra trùng lặp | |
| | 5 | | Tính điểm, lưu ExerciseAttempts + MiniTestAttempt, tặng +20 XP | |
| | 6 | | Hiển thị kết quả và đáp án chi tiết | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 4a | Phát hiện đã làm bài thi này trước đó, thông báo không cho nộp lại | | |
| Hậu điều kiện | Kết quả bài thi được lưu, điểm số và XP được cập nhật | | | |

---

### g. UC 011: Xem lịch sử kiểm tra và đáp án chi tiết

| Mã Use case | UC 011 | | Tên Usecase | Xem lịch sử kiểm tra |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem lịch sử các bài kiểm tra đã làm và chi tiết từng câu trả lời | | | |
| Sự kiện kích hoạt | Kích vào mục Mini Test History | | | |
| Tiền điều kiện | Học viên đã có bài kiểm tra trong lịch sử | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu xem lịch sử | Hiển thị danh sách các bài đã làm theo ngày, phân trang | |
| | 2 | Chọn một bài để xem chi tiết | Hiển thị từng câu hỏi: câu trả lời đã chọn, đáp án đúng, đúng/sai | |
| Hậu điều kiện | Học viên xem được chi tiết kết quả | | | |

---

### h. UC 012: Xem bảng thành tích và Huy hiệu (Gamification)

| Mã Use case | UC 012 | | Tên Usecase | Xem thành tích và huy hiệu |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem thông tin gamification: XP, Level, Streak, Achievements | | | |
| Sự kiện kích hoạt | Kích vào mục Achievements / Gamification Profile | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu xem profile gamification | Hiển thị XP, Level, Level Progress %, Streak days | |
| | 2 | | Hiển thị danh sách Achievements (locked/unlocked/seen) | |
| | 3 | | Kiểm tra tự động mở khóa achievements mới | |
| | 4 | Xem achievement mới | Đánh dấu SeenAt khi học viên xem | |
| Hậu điều kiện | Học viên xem được thông tin gamification | | | |

Các Achievements trong hệ thống:

| Achievement | Điều kiện mở khóa | XP thưởng |
|---|---|---|
| FIRST_WORD | Học từ đầu tiên | +10 |
| WORDS_100 | Đạt 100 từ đã học | +50 |
| STREAK_7 | Streak 7 ngày | +30 |
| STREAK_30 | Streak 30 ngày | +100 |
| TEST_SCORE_90 | Đạt 90%+ trong bài kiểm tra | +50 |
| LEVEL_5 | Đạt Level 5 | +75 |

---

### i. UC 013: Quản lý sổ tay từ vựng (Vocabulary Notebook)

| Mã Use case | UC 013 | | Tên Usecase | Quản lý sổ tay từ vựng |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Quản lý sổ tay từ vựng cá nhân: thêm, xem, sửa, xóa từ yêu thích | | | |
| Sự kiện kích hoạt | Kích vào mục Notebook | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách từ trong Notebook | Hiển thị danh sách phân trang kèm ghi chú, favorite | |
| | 2 | Thêm từ mới vào Notebook | Lưu từ với ghi chú tùy chọn, auto-upsert | |
| | 3 | Sửa ghi chú / gắn dấu yêu thích | Cập nhật notebook entry | |
| | 4 | Xóa từ khỏi Notebook | Xóa entry | |
| Hậu điều kiện | Sổ tay từ vựng được cập nhật | | | |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Word ID | Integer | Có | ID từ vựng tồn tại | 42 |
| 2 | Ghi chú cá nhân | Textarea | Không | Tối đa 500 ký tự | Từ này hay gặp trong Part 5 |
| 3 | Yêu thích | Boolean | Không | true/false | true |

---

### j. UC 014: Xem tiến trình chi tiết và Analytics

| Mã Use case | UC 014 | | Tên Usecase | Xem tiến trình chi tiết |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem phân tích tiến trình học tập chi tiết: biểu đồ 365 ngày, tăng trưởng từ vựng, retention | | | |
| Sự kiện kích hoạt | Kích vào mục Progress / Analytics | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu xem Progress Analytics | Hiển thị biểu đồ hoạt động 365 ngày (heatmap) | |
| | 2 | | Hiển thị biểu đồ tăng trưởng từ vựng 12 tháng | |
| | 3 | | Hiển thị phân tích mastery theo từng chủ đề | |
| | 4 | | Hiển thị thống kê retention: correct rate, forgotten rate, review completion rate | |
| Hậu điều kiện | Học viên xem được toàn cảnh tiến trình học tập | | | |

---

### k. UC 015: Xem Learning Path Roadmap

| Mã Use case | UC 015 | | Tên Usecase | Xem lộ trình học tập |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem lộ trình theo cấp độ TOEIC (300/500/700/900) với các chủ đề và trạng thái | | | |
| Sự kiện kích hoạt | Kích vào mục Courses / Learning Path | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu xem Learning Path | Hiển thị Roadmap theo 4 cấp độ TOEIC | |
| | 2 | Kích vào level để xem chi tiết | Hiển thị các chủ đề trong level đó với trạng thái locked/available/completed | |
| | 3 | | Hiển thị 3 hoạt động cho mỗi chủ đề: Lesson/Practice/MiniTest kèm % hoàn thành | |
| Hậu điều kiện | Học viên thấy được lộ trình học tập đề xuất | | | |

---

### l. UC 016: Quản lý thông báo

| Mã Use case | UC 016 | | Tên Usecase | Quản lý thông báo |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem và quản lý thông báo trong hệ thống | | | |
| Sự kiện kích hoạt | Kích vào biểu tượng thông báo | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách thông báo | Hiển thị thông báo mới nhất, chưa đọc ở trên cùng, kèm unread count | |
| | 2 | Kích vào một thông báo | Đánh dấu đã đọc (read) | |
| | 3 | Kích "Đánh dấu tất cả đã đọc" | Bulk mark all as read | |
| Hậu điều kiện | Thông báo được cập nhật trạng thái | | | |

---

### m. UC 017: Báo cáo lỗi nội dung

| Mã Use case | UC 017 | | Tên Usecase | Báo cáo lỗi nội dung |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Báo cáo lỗi trong nội dung từ vựng, câu hỏi, âm thanh,... | | | |
| Sự kiện kích hoạt | Kích vào nút Báo cáo trên từ/câu hỏi | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Chọn loại lỗi (WordIncorrect/AudioIssue/AnswerIncorrect/Typo/Other) | Hiển thị form báo cáo | |
| | 2 | Nhập mô tả chi tiết | Ghi nhận báo cáo vào ContentReports | |
| | 3 | Gửi báo cáo | Thông báo gửi thành công | |
| Hậu điều kiện | Báo cáo được lưu để Admin xử lý | | | |

---

## 3.3. Các Use-cases dành cho Biên tập viên (Content Creator)

### a. UC 018: Xem Dashboard Content Creator

| Mã Use case | UC 018 | | Tên Usecase | Xem Dashboard & Báo cáo số liệu |
|---|---|---|---|---|
| Tác nhân | Biên tập viên (Content Creator) | | | |
| Mô tả | Xem tổng quan nội dung đã tạo theo trạng thái và tương tác người học | | | |
| Sự kiện kích hoạt | Đăng nhập với vai trò Creator | | | |
| Tiền điều kiện | Tác nhân đã đăng nhập với role Content Creator | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu xem Dashboard | Hiển thị content summary (Draft/Pending/Published/Rejected/Archived) cho Topics, Words, Questions, MiniTests | |
| | 2 | | Hiển thị topic analytics: số học viên, lượt tương tác | |
| | 3 | | Hiển thị mini-test analytics: lượt làm bài, điểm trung bình | |
| Hậu điều kiện | Creator xem được báo cáo tổng quan | | | |

---

### b. UC 019: Quản lý Chủ đề (Topics CRUD)

| Mã Use case | UC 019 | | Tên Usecase | Quản lý Chủ đề |
|---|---|---|---|---|
| Tác nhân | Biên tập viên | | | |
| Mô tả | Thêm, sửa, xóa, gửi duyệt các chủ đề từ vựng | | | |
| Sự kiện kích hoạt | Kích vào mục Topics | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách chủ đề | Hiển thị danh sách chủ đề đã tạo, phân trang, lọc theo status | |
| | 2 | Tạo chủ đề mới | Tạo topic với status Draft | |
| | 3 | Sửa thông tin chủ đề | Cập nhật topic | |
| | 4 | Xóa chủ đề (chỉ khi Draft) | Xóa topic | |
| | 5 | Gửi yêu cầu phê duyệt | Chuyển status Draft/Rejected -> PendingReview, ghi log | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 4a | Từ chối xóa: chủ đề không ở trạng thái Draft | | |
| | 5a | Yêu cầu nhập đủ thông tin bắt buộc trước khi gửi duyệt | | |
| Hậu điều kiện | Chủ đề được tạo/cập nhật/gửi duyệt theo yêu cầu | | | |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Tên chủ đề | Input text field | Có | 2-200 ký tự | Business English |
| 2 | Mô tả | Textarea | Không | Tối đa 1000 ký tự | Từ vựng thương mại |
| 3 | Category ID | Combobox | Có | ID danh mục tồn tại | 1 |
| 4 | Difficulty Level | Select | Không | 1-5 | 2 |

---

### c. UC 020: Quản lý Từ vựng (Words CRUD)

| Mã Use case | UC 020 | | Tên Usecase | Quản lý Từ vựng |
|---|---|---|---|---|
| Tác nhân | Biên tập viên | | | |
| Mô tả | Thêm, sửa, xóa, gửi duyệt từ vựng kèm câu ví dụ | | | |
| Sự kiện kích hoạt | Kích vào mục Words | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách từ vựng | Hiển thị danh sách phân trang, lọc theo status | |
| | 2 | Tạo từ mới | Tạo word với status Draft, kèm topics và examples | |
| | 3 | Import bulk từ vựng | Xử lý nhập hàng loạt | |
| | 4 | Sửa từ vựng | Cập nhật word | |
| | 5 | Xóa từ (chỉ khi Draft) | Xóa word | |
| | 6 | Gửi yêu cầu phê duyệt | Chuyển status Draft/Rejected -> PendingReview | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 2a | Validation lỗi: từ đã tồn tại | | |
| Hậu điều kiện | Từ vựng được tạo/cập nhật/gửi duyệt | | | |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Term | Input text field | Có | 1-100 ký tự | negotiate |
| 2 | Meaning | Input text field | Có | Tiếng Việt | đàm phán |
| 3 | Phonetic | Input text field | Không | Phiên âm IPA | /nɪˈɡoʊʃieɪt/ |
| 4 | Part of Speech | Combobox | Có | Noun/Verb/Adj/Adv/Prep | Verb |
| 5 | Topics | Multi-select | Có | Chọn 1+ chủ đề | Business English |
| 6 | Example Sentences | JSON array | Không | Câu ví dụ + dịch | {"en":"...","vi":"..."} |

---

### d. UC 021: Quản lý Câu hỏi (Questions CRUD)

| Mã Use case | UC 021 | | Tên Usecase | Quản lý Câu hỏi ôn luyện |
|---|---|---|---|---|
| Tác nhân | Biên tập viên | | | |
| Mô tả | Thêm, sửa, xóa, gửi duyệt câu hỏi với nhiều loại: MCQ, FillBlank, DragDrop, Dictation, FlashcardCheck | | | |
| Sự kiện kích hoạt | Kích vào mục Questions | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách câu hỏi | Hiển thị danh sách phân trang, lọc theo word, type, status | |
| | 2 | Tạo câu hỏi mới | Tạo question với status Draft, kiểm tra OptionsJson | |
| | 3 | Sửa câu hỏi | Cập nhật question | |
| | 4 | Xóa câu hỏi (chỉ khi Draft) | Xóa question | |
| | 5 | Gửi yêu cầu phê duyệt | Chuyển status Draft/Rejected -> PendingReview | |
| Hậu điều kiện | Câu hỏi được tạo/cập nhật/gửi duyệt | | | |

---

### e. UC 022: Quản lý Đề kiểm tra (Mini Tests CRUD)

| Mã Use case | UC 022 | | Tên Usecase | Quản lý Đề kiểm tra ngắn |
|---|---|---|---|---|
| Tác nhân | Biên tập viên | | | |
| Mô tả | Tạo, sửa, xóa đề kiểm tra, thêm/bỏ câu hỏi vào đề, gửi duyệt | | | |
| Sự kiện kích hoạt | Kích vào mục Mini Tests | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách đề thi | Hiển thị danh sách phân trang | |
| | 2 | Tạo đề thi mới | Tạo MiniTest với title, description, topic | |
| | 3 | Thêm câu hỏi vào đề | Thêm question vào MiniTestItems | |
| | 4 | Bỏ câu hỏi khỏi đề | Xóa question khỏi MiniTestItems | |
| | 5 | Sửa thông tin đề thi | Cập nhật metadata | |
| | 6 | Xóa đề thi (chỉ khi Draft) | Xóa MiniTest | |
| | 7 | Gửi yêu cầu phê duyệt | Kiểm tra tất cả questions đã Published, chuyển status | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 7a | Từ chối gửi duyệt: có câu hỏi chưa được publish | | |
| Hậu điều kiện | Đề kiểm tra được quản lý theo yêu cầu | | | |

---

### f. UC 023: Quản lý Media Assets

| Mã Use case | UC 023 | | Tên Usecase | Quản lý tệp đa phương tiện |
|---|---|---|---|---|
| Tác nhân | Biên tập viên | | | |
| Mô tả | Upload, xem, xóa các tệp hình ảnh, âm thanh | | | |
| Sự kiện kích hoạt | Kích vào mục Media | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem thư viện media | Hiển thị danh sách media phân trang, lọc theo type/search | |
| | 2 | Upload file (hình ảnh/âm thanh) | Lưu file, tạo MediaAsset record với alt text, transcript tùy chọn | |
| | 3 | Xóa media | Xóa MediaAsset | |
| Hậu điều kiện | Media được upload/xóa trong thư viện | | | |

---

### g. UC 024: Sử dụng AI đề xuất nội dung từ vựng

| Mã Use case | UC 024 | | Tên Usecase | AI đề xuất nội dung từ vựng |
|---|---|---|---|---|
| Tác nhân | Biên tập viên | | | |
| Mô tả | Sử dụng AI (OpenAI + Google Translate + DictionaryAPI) để tạo gợi ý nội dung cho từ vựng | | | |
| Sự kiện kích hoạt | Kích nút "AI Suggest" khi tạo/sửa từ vựng | | | |
| Tiền điều kiện | Creator đã đăng nhập, nhập từ khóa cần tra | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập từ khóa tiếng Anh | Gửi request đến AI service | |
| | 2 | | AI trả về: meaning, phonetic, part of speech, TOEIC examples | |
| | 3 | | Điền tự động vào form tạo từ vựng | |
| | 4 | Xem lại và chỉnh sửa nếu cần | | |
| | 5 | Lưu từ vựng | Tạo word với dữ liệu từ AI | |
| Hậu điều kiện | Từ vựng được tạo với nội dung gợi ý từ AI | | | |

---

## 3.4. Các Use-cases dành cho Quản trị viên (Admin)

### a. UC 025: Xem Dashboard Analytics hệ thống

| Mã Use case | UC 025 | | Tên Usecase | Xem Dashboard Analytics |
|---|---|---|---|---|
| Tác nhân | Quản trị viên (Admin) | | | |
| Mô tả | Xem thống kê toàn cục hệ thống | | | |
| Sự kiện kích hoạt | Đăng nhập với vai trò Admin | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu Dashboard | Hiển thị tổng số học viên, từ vựng, chủ đề, lượt luyện tập | |
| | 2 | | Hiển thị biểu đồ đăng ký 7 ngày, word distribution by part of speech | |
| | 3 | | Hiển thị content management overview (tất cả content theo status) | |
| | 4 | | Hiển thị audit logs phân trang | |
| Hậu điều kiện | Admin xem được tổng quan hệ thống | | | |

---

### b. UC 026: Quản lý danh mục chủ đề (Topic Categories CRUD)

| Mã Use case | UC 026 | | Tên Usecase | Quản lý danh mục chủ đề |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Quản lý các danh mục chủ đề (Business, Travel, Daily Life,...) | | | |
| Sự kiện kích hoạt | Kích vào mục Topic Categories | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách categories | Hiển thị tất cả categories | |
| | 2 | Tạo category mới | Tạo category | |
| | 3 | Sửa category | Cập nhật | |
| | 4 | Xóa category | Deactivate (soft delete) | |
| Hậu điều kiện | Topic categories được quản lý | | | |

---

### c. UC 027: Duyệt và phê duyệt nội dung

| Mã Use case | UC 027 | | Tên Usecase | Duyệt và phê duyệt nội dung |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Xem, phê duyệt hoặc từ chối nội dung do Creator gửi lên | | | |
| Sự kiện kích hoạt | Kích vào mục Content Review | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách nội dung chờ duyệt | Hiển thị tất cả content PendingReview, nhóm theo type, cũ nhất trước | |
| | 2 | Chọn một nội dung để xem chi tiết | Hiển thị thông tin chi tiết | |
| | 3a | Phê duyệt nội dung | Chuyển PendingReview -> Published, set PublishedAt, ReviewedBy, gửi thông báo cho Creator | |
| | 3b | Từ chối kèm lý do | Chuyển PendingReview -> Rejected, ghi lý do, gửi thông báo cho Creator | |
| | 3c | Archive nội dung | Chuyển bất kỳ status -> Archived | |
| | 4 | Xem lịch sử duyệt | Hiển thị audit trail các lần thay đổi status | |
| Hậu điều kiện | Nội dung được cập nhật trạng thái, Creator nhận thông báo | | | |

Quy trình duyệt nội dung:

```
Draft -> PendingReview -> Published
                       -> Rejected -> Draft (chỉnh sửa lại)
Any status -> Archived
```

---

### d. UC 028: Quản lý tài khoản học viên

| Mã Use case | UC 028 | | Tên Usecase | Quản lý tài khoản học viên |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Xem danh sách, tạo, sửa, khóa/mở khóa, đổi role tài khoản | | | |
| Sự kiện kích hoạt | Kích vào mục Students / Users | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách người dùng | Hiển thị danh sách phân trang, lọc theo search/status/role | |
| | 2 | Tạo người dùng mới | Tạo user với role chỉ định | |
| | 3 | Sửa thông tin user | Cập nhật profile | |
| | 4 | Khóa/Mở khóa tài khoản | Toggle active status | |
| | 5 | Đổi role người dùng | Cập nhật role | |
| | 6 | Xem chi tiết tiến trình học viên | Hiển thị words learned, accuracy, progress | |
| | 7 | Xóa người dùng | Chặn xóa nếu user có nội dung, đề xuất deactivation | |
| Hậu điều kiện | Tài khoản được quản lý theo yêu cầu | | | |

---

### e. UC 029: Quản lý từ vựng toàn hệ thống (Admin)

| Mã Use case | UC 029 | | Tên Usecase | Quản lý từ vựng toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD từ vựng, import hàng loạt từ CSV/JSON, xem chi tiết từ | | | |
| Sự kiện kích hoạt | Kích vào mục Words (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách từ | Hiển thị với filters: topicId, partOfSpeechId, status, search, sort | |
| | 2 | Xem chi tiết từ | Hiển thị topics, examples, questions | |
| | 3 | Tạo từ mới | Tạo word với topics, examples | |
| | 4 | Sửa từ | Cập nhật | |
| | 5 | Xóa mềm từ | Archive word | |
| | 6 | Xóa cứng từ (cần SYSTEM_SETTINGS permission) | Xóa vĩnh viễn | |
| | 7 | Preview import | Xem trước dữ liệu import | |
| | 8 | Bulk import từ CSV/JSON | Import hàng loạt | |
| Hậu điều kiện | Từ vựng được quản lý | | | |

---

### f. UC 030: Quản lý câu hỏi toàn hệ thống (Admin)

| Mã Use case | UC 030 | | Tên Usecase | Quản lý câu hỏi toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD câu hỏi, import CSV hàng loạt | | | |
| Sự kiện kích hoạt | Kích vào mục Questions (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách câu hỏi theo word | Hiển thị phân trang, filter | |
| | 2 | Tạo câu hỏi | Tạo với các type: MCQ, FillBlank, DragDrop, Dictation, FlashcardCheck | |
| | 3 | Sửa câu hỏi | Cập nhật | |
| | 4 | Xóa câu hỏi | Xóa | |
| | 5 | Bulk import CSV | Import hàng loạt | |
| Hậu điều kiện | Câu hỏi được quản lý | | | |

---

### g. UC 031: Quản lý Mini Test toàn hệ thống (Admin)

| Mã Use case | UC 031 | | Tên Usecase | Quản lý Mini Test toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD, publish, archive đề kiểm tra | | | |
| Sự kiện kích hoạt | Kích vào mục Mini Tests (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách Mini Tests | Hiển thị phân trang, filters | |
| | 2 | Tạo Mini Test | Tạo mới | |
| | 3 | Sửa Mini Test | Cập nhật | |
| | 4 | Xóa Mini Test | Xóa | |
| | 5 | Publish Mini Test | Set status Published + IsPublished flag | |
| | 6 | Archive Mini Test | Set status Archived | |
| Hậu điều kiện | Mini Test được quản lý | | | |

---

### h. UC 032: Quản lý báo cáo lỗi nội dung

| Mã Use case | UC 032 | | Tên Usecase | Quản lý báo cáo lỗi |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Xem và xử lý các báo cáo lỗi do học viên gửi lên | | | |
| Sự kiện kích hoạt | Kích vào mục Reports | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách báo cáo | Hiển thị phân trang, filter theo status/type/entity/priority, Open trước, mới nhất trước | |
| | 2 | Chọn báo cáo để xử lý | Hiển thị chi tiết báo cáo | |
| | 3 | Thay đổi trạng thái (Open/InReview/Resolved/Rejected) | Cập nhật report, ghi audit log | |
| | 4 | Nhập phản hồi | Gửi phản hồi cho người báo cáo | |
| Hậu điều kiện | Báo cáo được xử lý và cập nhật | | | |

---

### i. UC 033: Quản lý thông báo toàn hệ thống

| Mã Use case | UC 033 | | Tên Usecase | Quản lý thông báo |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Xem thông báo, gửi thông báo toàn hệ thống, tạo nhắc nhở hàng ngày | | | |
| Sự kiện kích hoạt | Kích vào mục Notifications (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem tất cả thông báo | Hiển thị phân trang, filter theo type/channel/read status | |
| | 2 | Gửi announcement | Broadcast notification đến tất cả users | |
| | 3 | Tạo daily reminders | Tạo thông báo nhắc học cho học viên chưa hoàn thành mục tiêu | |
| Hậu điều kiện | Thông báo được gửi/quản lý | | | |

---

### j. UC 034: Quản lý chủ đề toàn hệ thống (Admin)

| Mã Use case | UC 034 | | Tên Usecase | Quản lý chủ đề toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD chủ đề, archive/delete | | | |
| Sự kiện kích hoạt | Kích vào mục Topics (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Xem danh sách chủ đề | Hiển thị phân trang, search, filter theo status/categoryId | |
| | 2 | Tạo chủ đề | Tạo mới | |
| | 3 | Sửa chủ đề | Cập nhật | |
| | 4 | Xóa/Archive chủ đề | Soft-delete: archive nếu có content, hard delete nếu rỗng | |
| Hậu điều kiện | Chủ đề được quản lý | | | |

---

### k. UC 035: Quản lý Audit Logs

| Mã Use case | UC 035 | | Tên Usecase | Xem nhật ký lịch sử |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Xem lịch sử hành động của Admin trong hệ thống | | | |
| Sự kiện kích hoạt | Kích vào mục Audit Logs | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu xem audit logs | Hiển thị danh sách phân trang, filter theo action/entityType/admin | |
| Hậu điều kiện | Admin xem được lịch sử thao tác | | | |

---

### l. UC 036: Kiểm tra sức khỏe hệ thống

| Mã Use case | UC 036 | | Tên Usecase | Health Check |
|---|---|---|---|---|
| Tác nhân | Hệ thống / Admin | | | |
| Mô tả | Kiểm tra trạng thái hoạt động của server và database | | | |
| Sự kiện kích hoạt | Gọi endpoint /api/health | | | |
| Tiền điều kiện | Không | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Gửi request health check | Kiểm tra server uptime và database connection | |
| | 2 | | Trả về status OK hoặc lỗi | |
| Hậu điều kiện | Hệ thống trả về trạng thái hoạt động | | | |
