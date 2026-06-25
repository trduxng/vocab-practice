import sys
sys.stdout.reconfigure(encoding='utf-8')

content = r"""# Đặc tả chi tiết các Use-case

## 3.1. Các Use-cases dùng chung cho hệ thống

### a. UC 001: Đăng nhập hệ thống

| Mã Use case | UC 001 | | Tên Usecase | Đăng nhập |
|---|---|---|---|---|
| Tác nhân | Tất cả (Learner, Content Creator, Admin) | | | |
| Mô tả | Tác nhân đăng nhập hệ thống để sử dụng các chức năng phù hợp với vai trò của mình | | | |
| Sự kiện kích hoạt | Kích vào nút đăng nhập trên giao diện | | | |
| Tiền điều kiện | Tác nhân đã có tài khoản trên hệ thống | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập email và mật khẩu | Kiểm tra các trường hợp lệ (Zod validation) | |
| | 2 | Yêu cầu đăng nhập | Kiểm tra email + mật khẩu, tạo JWT token 1 ngày | |
| | 3 | | Tự động award Daily Login XP (+5), trả token + gamification profile | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 2a | Hiển thị lỗi: Email hoặc mật khẩu không đúng | | |
| | 2b | Hiển thị lỗi: Tài khoản đã bị khóa (IsActive = 0) | | |
| | 2c | Hiển thị lỗi: Vượt quá số lần đăng nhập (rate limit 10/15ph) | | |
| Hậu điều kiện | Tác nhân đăng nhập được vào hệ thống với giao diện phù hợp vai trò | | | |

*Dữ liệu đầu vào:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | Email | Input email field | Có | Đúng định dạng email | learner@example.com |
| 2 | Mật khẩu | Input password field | Có | Ít nhất 6 ký tự | password123 |

### b. UC 002: Đăng ký tài khoản

| Mã Use case | UC 002 | | Tên Usecase | Đăng ký tài khoản |
|---|---|---|---|---|
| Tác nhân | Người dùng mới (Learner) | | | |
| Mô tả | Người dùng mới tạo tài khoản với role Learner, rate-limited 10 request/15 phút | | | |
| Sự kiện kích hoạt | Kích vào nút Đăng ký trên giao diện | | | |
| Tiền điều kiện | Người dùng chưa có tài khoản với email này | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập FullName, Email, Password | Kiểm tra dữ liệu hợp lệ | |
| | 2 | Yêu cầu đăng ký | Kiểm tra email đã tồn tại chưa | |
| | 3 | | Hash password (bcrypt), tạo user role Learner, IsActive=1 | |
| | 4 | | Gán permissions mặc định: VIEW_DASHBOARD, LEARN_VOCAB | |
| | 5 | | Tự động đăng nhập, trả token | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 2a | Hiển thị lỗi: Email đã được đăng ký | | |
| | 2b | Hiển thị lỗi: Vượt quá số lần đăng ký (rate limit) | | |
| Hậu điều kiện | Tài khoản mới được tạo, người dùng đăng nhập vào hệ thống | | | |

*Dữ liệu đầu vào:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|---|---|---|---|---|---|
| 1 | FullName | Input text field | Có | 2-100 ký tự | Nguyễn Văn A |
| 2 | Email | Input email field | Có | Đúng định dạng email | learner@example.com |
| 3 | Password | Input password field | Có | Ít nhất 6 ký tự | password123 |

### c. UC 003: Cập nhật thông tin cá nhân

| Mã Use case | UC 003 | | Tên Usecase | Cập nhật thông tin cá nhân |
|---|---|---|---|---|
| Tác nhân | Tất cả (Learner, Content Creator, Admin) | | | |
| Mô tả | Tác nhân thay đổi FullName | | | |
| Sự kiện kích hoạt | Click vào mục Settings / Profile | | | |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập FullName mới | Kiểm tra dữ liệu hợp lệ | |
| | 2 | Yêu cầu cập nhật (PUT /user/profile) | Cập nhật FullName trong CSDL | |
| | 3 | | Trả về {message, data: {id, fullName}} | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 1a | Hiển thị lỗi: FullName không hợp lệ | | |
| Hậu điều kiện | FullName được cập nhật | | | |

### d. UC 004: Đổi mật khẩu

| Mã Use case | UC 004 | | Tên Usecase | Đổi mật khẩu |
|---|---|---|---|---|
| Tác nhân | Tất cả | | | |
| Mô tả | Tác nhân thay đổi mật khẩu (chưa có trong codebase - tính năng tương lai) | | | |
| Sự kiện kích hoạt | Click vào mục Đổi mật khẩu trong Settings | | | |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập mật khẩu cũ, mật khẩu mới, xác nhận | Kiểm tra dữ liệu hợp lệ | |
| | 2 | Yêu cầu thay đổi | Kiểm tra mật khẩu cũ đúng, hash và lưu mật khẩu mới | |
| | 3 | | Thông báo thay đổi thành công | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 2a | Hiển thị lỗi: Mật khẩu cũ không đúng | | |
| | 2b | Hiển thị lỗi: Mật khẩu mới không trùng khớp | | |
| Hậu điều kiện | Mật khẩu mới được cập nhật | | | |

> **Ghi chú:** Chức năng này hiện chưa có trong codebase (không tìm thấy endpoint changePassword hay UI tương ứng). Cần phát triển thêm.

---

## 3.2. Các Use-cases dành cho Học viên (Learner)

### a. UC 005: Xem Dashboard học tập cá nhân

| Mã Use case | UC 005 | | Tên Usecase | Xem Dashboard học tập cá nhân |
|---|---|---|---|---|
| Tác nhân | Học viên (Learner) | | | |
| Mô tả | Xem tổng quan: thống kê học tập, gamification, heatmap, learning path | | | |
| Sự kiện kích hoạt | Đăng nhập hoặc kích vào Dashboard | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Yêu cầu Dashboard (GET /user/stats) | Truy vấn: totalLearned (MasteryLevel>=3), accuracy, weakWords top5, recent10, dailyTrends 7ngay | |
| | 2 | | + Gamification profile: XP, level, streak, todayXP | |
| | 3 | | + Mastery Timeline: %, estimated days | |
| | 4 | | + Calendar Heatmap (GET /user/activity/heatmap?year=YYYY) | |
| | 5 | | + Learning Path Roadmap (GET /user/learning-path) | |
| Hậu điều kiện | Học viên xem được dashboard tổng quan | | | |

### b. UC 006: Học từ vựng mới theo chủ đề

| Mã Use case | UC 006 | | Tên Usecase | Học từ vựng mới theo chủ đề |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Chọn chủ đề từ Learning Path, xem danh sách từ vựng kèm nghĩa, phiên âm, ví dụ | | | |
| Sự kiện kích hoạt | Kích Learn, chọn topic từ Learning Path | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Chọn topic | Hiển thị words (GET /user/topics/:topicId/words) kèm mastery, memory status | |
| | 2 | Xem chi tiết từng từ | | |
| Hậu điều kiện | Học viên xem được từ vựng theo chủ đề | | | |

### c. UC 007: Luyện tập Flashcard Spaced Repetition (SRS)

| Mã Use case | UC 007 | | Tên Usecase | Luyện tập Flashcard SRS |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Ôn tập flashcard với SRS, submit answer kèm reviewRating (Again/Hard/Good/Easy) | | | |
| Sự kiện kích hoạt | Kích Practice | | | |
| Tiền điều kiện | Học viên có từ trong UserWordProgress | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Kích Practice | Lấy flashcards đến hạn (GET /user/flashcards?limit=SRSReviewLimit) | |
| | 2 | Xem flashcard, trả lời / tự đánh giá | | |
| | 3 | Submit (POST /user/submit-answer) với reviewRating | Gọi SP usp_SubmitQuestionAttempt: cập nhật MasteryLevel, EaseFactor, NextReviewDate, MemoryStatus | |
| | 4 | Kết thúc session | POST /user/gamification/practice-complete, tặng +10 XP | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 1a | Thông báo: Hôm nay không có từ cần ôn | | |
| | 3a | Sai nhiều: MemoryStatus -> Lapsed | | |
| Hậu điều kiện | SRS cập nhật, XP tặng | | | |

### d. UC 008: Xem hàng chờ ôn tập thông minh

| Mã Use case | UC 008 | | Tên Usecase | Xem Smart Queue & Mistakes |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem danh sách ưu tiên 7 ngày, từ hay sai, session summary | | | |
| Sự kiện kích hoạt | Kích Smart Queue / Mistakes | | | |
| Tiền điều kiện | Học viên có từ trong UserWordProgress | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Smart Queue (GET /user/review/smart-queue) | priorityScore = overdue_hours * (3 nếu consecutiveWrong>0 else 1) | |
| | 2 | Mistakes (GET /user/review/mistakes) | Từ hay sai để ôn tập trọng tâm | |
| | 3 | Session Summary (GET /user/review/session-summary) | attempts, correct/wrong, XP, accuracy % | |
| Hậu điều kiện | Học viên thấy lịch ôn tập tối ưu | | | |

### e. UC 009: Quản lý mục tiêu hàng ngày

| Mã Use case | UC 009 | | Tên Usecase | Quản lý mục tiêu hàng ngày |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem/đặt Daily Goal (5-100), SRS Review Limit (5-50) | | | |
| Sự kiện kích hoạt | Vào Settings / Goals | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /user/goals/daily-goal | Hiển thị daily goal (default 20) | |
| | 2 | GET /user/goals/daily-progress | Số attempts hôm nay | |
| | 3 | PUT /user/goals/daily-goal | Lưu goal (5-100) | |
| | 4 | PUT /user/goals/srs-config | Lưu SRSReviewLimit (5-50) | |
| Hậu điều kiện | Cấu hình được cập nhật | | | |

### f. UC 010: Làm đề thi thử (Mini Test)

| Mã Use case | UC 010 | | Tên Usecase | Làm đề thi thử |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Làm bài kiểm tra ngắn, nộp bài, nhận kết quả chi tiết | | | |
| Sự kiện kích hoạt | Kích Mini Tests, chọn đề | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /user/minitests | Danh sách đề đã publish, phân trang | |
| | 2 | GET /user/minitests/:id | Hiển thị câu hỏi (không đáp án đúng) | |
| | 3 | Trả lời từng câu | | |
| | 4 | POST /user/minitests/:id/submit | Kiểm tra SubmittedAt, từ chối nếu đã nộp | |
| | 5 | | Batch-insert ExerciseAttempts, tạo MiniTestAttempt, tính score | |
| | 6 | | Cập nhật UserWordProgress, tặng +20 XP | |
| | 7 | | Trả kết quả chi tiết | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 4a | Từ chối: đã nộp bài trước đó | | |
| Hậu điều kiện | Kết quả thi lưu, XP cập nhật | | | |

### g. UC 011: Xem lịch sử kiểm tra

| Mã Use case | UC 011 | | Tên Usecase | Xem lịch sử kiểm tra |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem lịch sử bài kiểm tra và chi tiết đáp án | | | |
| Sự kiện kích hoạt | Kích Mini Tests / History | | | |
| Tiền điều kiện | Học viên đã làm ít nhất 1 bài | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /user/minitests/history | Phân trang, gộp theo ngày/test | |
| | 2 | GET /user/minitests/session-details?testId=X&date=Y | submitted, correct, isCorrect, word info | |
| Hậu điều kiện | Học viên xem được chi tiết | | | |

### h. UC 012: Xem thành tích và Huy hiệu (Gamification)

| Mã Use case | UC 012 | | Tên Usecase | Xem thành tích và huy hiệu |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem profile gamification: XP, Level, Streak, Achievements | | | |
| Sự kiện kích hoạt | Kích Achievements / Gamification Profile | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /user/gamification/profile | XP, level, level progress %, streak, today XP | |
| | 2 | | Danh sách achievements (locked/unlocked/seen), unseen count | |
| | 3 | Xem achievement mới | PUT /user/gamification/achievements/seen -> SeenAt | |
| Hậu điều kiện | Học viên xem được gamification | | | |

Các Achievement:

| Mã | Điều kiện | XP |
|---|---|---|
| FIRST_WORD | Học 1 từ | +10 |
| WORDS_100 | Mastery 100 từ | +50 |
| STREAK_7 | Streak 7 ngày | +30 |
| STREAK_30 | Streak 30 ngày | +100 |
| TEST_SCORE_90 | 90%+ Mini Test | +50 |
| LEVEL_5 | Level 5 | +75 |

Cơ chế XP: LearnWord=+5, PracticeComplete=+10, MiniTestComplete=+20, DailyLogin=+5
Level = floor(totalXP/100)+1

### i. UC 013: Quản lý sổ tay từ vựng (Notebook)

| Mã Use case | UC 013 | | Tên Usecase | Quản lý sổ tay từ vựng |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Thêm, xem, sửa ghi chú, gắn dấu yêu thích, xóa từ trong notebook | | | |
| Sự kiện kích hoạt | Kích Notebook | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /user/notebook | Paginated: term, meaning, phonetic, pos, mastery, note, favorite | |
| | 2 | POST /user/notebook | Thêm từ + note, auto-upsert | |
| | 3 | PUT /user/notebook/:id | Sửa note / favorite | |
| | 4 | DELETE /user/notebook/:id | Xóa | |
| | 5 | GET /user/notebook/check?wordId=X | Kiểm tra tồn tại | |
| Hậu điều kiện | Notebook cập nhật | | | |

### j. UC 014: Xem Progress Analytics

| Mã Use case | UC 014 | | Tên Usecase | Xem tiến trình học tập chi tiết |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Biểu đồ 365 ngày, tăng trưởng 12 tháng, topic mastery, retention | | | |
| Sự kiện kích hoạt | Kích Progress / Analytics | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /user/progress/analytics | Summary (activeDays, XP, streak), 365-day chart, 12-month growth, topic mastery, retention | |
| Hậu điều kiện | Học viên xem được analytics | | | |

### k. UC 015: Xem Learning Path

| Mã Use case | UC 015 | | Tên Usecase | Xem lộ trình học tập |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Roadmap 4 cấp độ TOEIC (300/500/700/900) với trạng thái | | | |
| Sự kiện kích hoạt | Kích Courses / Learning Path | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /user/learning-path | completion%, 4 levels, topics với activities (lesson/practice/miniTest): locked/available/completed | |
| Hậu điều kiện | Học viên xem roadmap | | | |

### l. UC 016: Quản lý thông báo

| Mã Use case | UC 016 | | Tên Usecase | Quản lý thông báo |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Xem và đánh dấu thông báo | | | |
| Sự kiện kích hoạt | Kích biểu tượng thông báo | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /user/notifications | unread trước, mới nhất trước, unread count | |
| | 2 | PUT /user/notifications/:id/read | Mark read | |
| | 3 | PUT /user/notifications/read-all | Bulk mark all read | |
| Hậu điều kiện | Thông báo cập nhật | | | |

### m. UC 017: Báo cáo lỗi nội dung

| Mã Use case | UC 017 | | Tên Usecase | Báo cáo lỗi nội dung |
|---|---|---|---|---|
| Tác nhân | Học viên | | | |
| Mô tả | Báo cáo lỗi từ vựng, câu hỏi, âm thanh,... | | | |
| Sự kiện kích hoạt | Kích nút Báo cáo | | | |
| Tiền điều kiện | Học viên đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Chọn entity (Word/Question/Audio/General) + type (WordIncorrect/AudioIssue/AnswerIncorrect/Typo/Other) + mô tả | POST /user/reports, lưu ContentReport | |
| Hậu điều kiện | Báo cáo được ghi nhận | | | |

---

## 3.3. Các Use-cases dành cho Biên tập viên (Content Creator)

### a. UC 018: Xem Dashboard Creator

| Mã Use case | UC 018 | | Tên Usecase | Xem Dashboard & Analytics Creator |
|---|---|---|---|---|
| Tác nhân | Content Creator | | | |
| Mô tả | Xem content summary, topic analytics, mini-test analytics | | | |
| Sự kiện kích hoạt | Đăng nhập role Creator | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /creator/dashboard | Content summary từ vw_ContentCreatorContentSummary | |
| | 2 | GET /creator/content-summary | Counts Topics/Words/Questions/MiniTests theo status | |
| | 3 | GET /creator/topics/:id/analytics | Learner engagement từ vw_TopicLearningAnalytics | |
| | 4 | GET /creator/mini-tests/:id/analytics | Performance từ vw_MiniTestAnalytics | |
| Hậu điều kiện | Creator xem báo cáo | | | |

### b. UC 019: Quản lý Chủ đề (Topics)

| Mã Use case | UC 019 | | Tên Usecase | Quản lý Chủ đề |
|---|---|---|---|---|
| Tác nhân | Content Creator | | | |
| Mô tả | CRUD chủ đề, gửi duyệt (chỉ quản lý chủ đề mình tạo) | | | |
| Sự kiện kích hoạt | Kích Topics | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /creator/topics | Topics của riêng creator, filter status | |
| | 2 | POST /creator/topics | Tạo, status Draft | |
| | 3 | PUT /creator/topics/:id | Cập nhật | |
| | 4 | DELETE /creator/topics/:id | Xóa (chỉ Draft) | |
| | 5 | POST /creator/topics/:id/submit-review | Draft/Rejected -> PendingReview, log ContentReviewLogs | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 4a | Từ chối xóa: không phải Draft | | |
| Hậu điều kiện | Chủ đề được quản lý | | | |

### c. UC 020: Quản lý Từ vựng (Words)

| Mã Use case | UC 020 | | Tên Usecase | Quản lý Từ vựng & Câu ví dụ |
|---|---|---|---|---|
| Tác nhân | Content Creator | | | |
| Mô tả | CRUD từ vựng kèm examples, bulk create, gửi duyệt | | | |
| Sự kiện kích hoạt | Kích Words | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /creator/words | Words của riêng creator, filter status | |
| | 2 | POST /creator/words | Tạo word + topics + examples, status Draft | |
| | 3 | POST /creator/words/bulk | Bulk import | |
| | 4 | PUT /creator/words/:id | Cập nhật | |
| | 5 | DELETE /creator/words/:id | Xóa (chỉ Draft) | |
| | 6 | POST /creator/words/:id/submit-review | Draft/Rejected -> PendingReview | |
| Hậu điều kiện | Từ vựng được quản lý | | | |

### d. UC 021: Quản lý Câu hỏi (Questions)

| Mã Use case | UC 021 | | Tên Usecase | Quản lý Câu hỏi ôn luyện |
|---|---|---|---|---|
| Tác nhân | Content Creator | | | |
| Mô tả | CRUD câu hỏi (MCQ, FillBlank, DragDrop, Dictation, FlashcardCheck, AudioRecognition), gửi duyệt | | | |
| Sự kiện kích hoạt | Kích Questions | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /creator/questions | Filter word/type/status | |
| | 2 | POST /creator/questions | Tạo, OptionsJson validation | |
| | 3 | PUT /creator/questions/:id | Cập nhật | |
| | 4 | DELETE /creator/questions/:id | Xóa (chỉ Draft) | |
| | 5 | POST /creator/questions/:id/submit-review | Draft/Rejected -> PendingReview | |
| Hậu điều kiện | Câu hỏi được quản lý | | | |

Loại câu hỏi: MCQ, FillBlank, DragDrop, Dictation, FlashcardCheck, AudioRecognition

### e. UC 022: Quản lý Đề kiểm tra (Mini Tests)

| Mã Use case | UC 022 | | Tên Usecase | Quản lý Đề kiểm tra ngắn |
|---|---|---|---|---|
| Tác nhân | Content Creator | | | |
| Mô tả | CRUD đề thi, thêm/bỏ câu hỏi, gửi duyệt (cần all questions Published) | | | |
| Sự kiện kích hoạt | Kích Mini Tests | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /creator/mini-tests | Filter status | |
| | 2 | POST /creator/mini-tests | Tạo với title, description, topicId | |
| | 3 | POST /creator/mini-tests/:id/items | Thêm question vào cuối | |
| | 4 | DELETE /creator/mini-tests/:id/items/:questionId | Detach question | |
| | 5 | PUT /creator/mini-tests/:id | Cập nhật metadata | |
| | 6 | DELETE /creator/mini-tests/:id | Xóa (chỉ Draft) | |
| | 7 | POST /creator/mini-tests/:id/submit-review | Kiểm tra questions Published, chuyển PendingReview | |
| Luồng sự kiện thay thế | STT | Hệ thống | | |
| | 7a | Từ chối: có câu hỏi chưa Published | | |
| Hậu điều kiện | Đề kiểm tra quản lý | | | |

### f. UC 023: Quản lý Media Assets

| Mã Use case | UC 023 | | Tên Usecase | Quản lý tệp đa phương tiện |
|---|---|---|---|---|
| Tác nhân | Content Creator | | | |
| Mô tả | Upload, xem, xóa hình ảnh và âm thanh | | | |
| Sự kiện kích hoạt | Kích Media | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /creator/media | Media của creator, filter type/search | |
| | 2 | POST /creator/media | Upload image/audio + alt text, transcript | |
| | 3 | DELETE /creator/media/:id | Xóa | |
| Hậu điều kiện | Media được quản lý | | | |

### g. UC 024: AI đề xuất nội dung từ vựng

| Mã Use case | UC 024 | | Tên Usecase | AI đề xuất nội dung từ vựng |
|---|---|---|---|---|
| Tác nhân | Content Creator | | | |
| Mô tả | Dùng OpenAI + Google Translate + DictionaryAPI để gợi ý nội dung từ vựng | | | |
| Sự kiện kích hoạt | Kích "AI Suggest" khi tạo/sửa từ | | | |
| Tiền điều kiện | Creator đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Nhập từ tiếng Anh | POST /api/ai/word-suggestions -> gọi combined API | |
| | 2 | | Trả về: meaning, phonetic, partOfSpeech, TOEIC examples | |
| | 3 | Điền vào form, chỉnh sửa, lưu | | |
| Hậu điều kiện | Từ vựng tạo với AI suggest | | | |

---

## 3.4. Các Use-cases dành cho Quản trị viên (Admin)

### a. UC 025: Xem Dashboard Analytics

| Mã Use case | UC 025 | | Tên Usecase | Xem Dashboard Analytics hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Thống kê toàn cục: tổng students/words/topics/attempts, biểu đồ, audit logs | | | |
| Sự kiện kích hoạt | Đăng nhập role Admin | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/stats | Tổng students, words, topics, attempts | |
| | 2 | GET /admin/analytics | 7-day registration, word distribution by POS | |
| | 3 | GET /admin/content-management | Content overview theo type/status | |
| | 4 | GET /admin/audit-logs | Phân trang, filter action/entityType/admin | |
| Hậu điều kiện | Admin xem tổng quan | | | |

### b. UC 026: Quản lý danh mục chủ đề (Topic Categories)

| Mã Use case | UC 026 | | Tên Usecase | Quản lý danh mục chủ đề |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD danh mục chủ đề | | | |
| Sự kiện kích hoạt | Kích Topic Categories | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/topic-categories | Tất cả categories | |
| | 2 | POST /admin/topic-categories | Tạo | |
| | 3 | PUT /admin/topic-categories/:id | Sửa | |
| | 4 | DELETE /admin/topic-categories/:id | Deactivate (soft delete) | |
| Hậu điều kiện | Danh mục quản lý | | | |

### c. UC 027: Duyệt và phê duyệt nội dung

| Mã Use case | UC 027 | | Tên Usecase | Duyệt và phê duyệt nội dung |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Phê duyệt/từ chối nội dung Creator gửi, archive, xem logs | | | |
| Sự kiện kích hoạt | Kích Content Review | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/content-review/pending | Topics/Words/Questions/MiniTests PendingReview, cũ nhất trước | |
| | 2 | POST /admin/content-review/:entityType/:entityId/approve | PendingReview -> Published, set PublishedAt, ReviewedBy, gửi notification | |
| | 3 | POST /admin/content-review/:entityType/:entityId/reject | -> Rejected, ghi lý do, gửi notification | |
| | 4 | POST /admin/content-review/:entityType/:entityId/archive | Any -> Archived | |
| | 5 | PATCH /admin/content-status | Direct set status kèm comment | |
| | 6 | GET /admin/content-review/:entityType/:entityId/logs | Audit trail | |
| Hậu điều kiện | Nội dung duyệt, Creator nhận thông báo | | | |

Quy trình: Draft -> PendingReview -> Published (hoặc Rejected -> Draft). Any -> Archived.

### d. UC 028: Quản lý tài khoản người dùng

| Mã Use case | UC 028 | | Tên Usecase | Quản lý tài khoản người dùng |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD users, khóa/mở, đổi role, xem tiến trình | | | |
| Sự kiện kích hoạt | Kích Students / Users | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/students | Phân trang, filter search/status/role | |
| | 2 | POST /admin/students | Tạo user | |
| | 3 | PUT /admin/students/:id | Sửa | |
| | 4 | PATCH /admin/students/:id/toggle | Khóa/Mở (toggle IsActive) | |
| | 5 | PATCH /admin/students/:id/role | Đổi role | |
| | 6 | GET /admin/students/:id/progress | Tiến trình học viên | |
| | 7 | DELETE /admin/students/:id | Chặn nếu có content, đề xuất deactivate | |
| Hậu điều kiện | Tài khoản quản lý | | | |

### e. UC 029: Quản lý từ vựng (Admin)

| Mã Use case | UC 029 | | Tên Usecase | Quản lý từ vựng toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Full CRUD words, hard delete, import CSV/JSON | | | |
| Sự kiện kích hoạt | Kích Words (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/words | Filter topicId, POS, status, search, sort | |
| | 2 | GET /admin/words/:id | Chi tiết + topics + examples + questions | |
| | 3 | POST /admin/words | Tạo | |
| | 4 | PUT /admin/words/:id | Sửa | |
| | 5 | DELETE /admin/words/:id | Soft delete (Archive) | |
| | 6 | DELETE /admin/words/:id/hard | Hard delete (cần MANAGE_SYSTEM_SETTINGS) | |
| | 7 | POST /admin/words/import-preview | Preview import | |
| | 8 | POST /admin/words/bulk-import | Import CSV/JSON | |
| Hậu điều kiện | Từ vựng quản lý | | | |

### f. UC 030: Quản lý câu hỏi (Admin)

| Mã Use case | UC 030 | | Tên Usecase | Quản lý câu hỏi toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD questions, bulk import CSV | | | |
| Sự kiện kích hoạt | Kích Questions (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/questions/:wordId | Phân trang, filter type/status/search | |
| | 2 | POST /admin/questions | Tạo | |
| | 3 | PUT /admin/questions/:id | Sửa | |
| | 4 | DELETE /admin/questions/:id | Xóa | |
| | 5 | POST /admin/questions/bulk-import | Import CSV | |
| Hậu điều kiện | Câu hỏi quản lý | | | |

### g. UC 031: Quản lý Mini Test (Admin)

| Mã Use case | UC 031 | | Tên Usecase | Quản lý Mini Test toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD, publish, archive | | | |
| Sự kiện kích hoạt | Kích Mini Tests (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/minitests | Filter search/topicId/status | |
| | 2 | POST /admin/minitests | Tạo | |
| | 3 | PUT /admin/minitests/:id | Sửa | |
| | 4 | DELETE /admin/minitests/:id | Xóa | |
| | 5 | PATCH /admin/minitests/:id/publish | Published + IsPublished | |
| | 6 | PATCH /admin/minitests/:id/archive | Archived | |
| Hậu điều kiện | Mini Test quản lý | | | |

### h. UC 032: Quản lý báo cáo lỗi

| Mã Use case | UC 032 | | Tên Usecase | Quản lý báo cáo lỗi |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Xem và xử lý báo cáo từ học viên | | | |
| Sự kiện kích hoạt | Kích Reports | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/reports | Open trước, mới trước, filter status/type/entity/priority | |
| | 2 | PATCH /admin/reports/:id | Đổi status, priority, admin response, ghi audit | |
| Hậu điều kiện | Báo cáo xử lý | | | |

### i. UC 033: Quản lý thông báo (Admin)

| Mã Use case | UC 033 | | Tên Usecase | Quản lý thông báo toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Xem, gửi announcement, tạo daily reminders | | | |
| Sự kiện kích hoạt | Kích Notifications (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/notifications | Filter type/channel/read | |
| | 2 | POST /admin/notifications | Broadcast to all users | |
| | 3 | POST /admin/notifications/daily-reminders | Nhắc học viên chưa hoàn thành mục tiêu | |
| Hậu điều kiện | Thông báo quản lý | | | |

### j. UC 034: Quản lý chủ đề (Admin)

| Mã Use case | UC 034 | | Tên Usecase | Quản lý chủ đề toàn hệ thống |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | CRUD topics, soft/hard delete | | | |
| Sự kiện kích hoạt | Kích Topics (Admin) | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/topics | Filter search/status/categoryId | |
| | 2 | POST /admin/topics | Tạo | |
| | 3 | PUT /admin/topics/:id | Sửa | |
| | 4 | DELETE /admin/topics/:id | Archive nếu có content, hard nếu rỗng | |
| Hậu điều kiện | Chủ đề quản lý | | | |

### k. UC 035: Xem Audit Logs

| Mã Use case | UC 035 | | Tên Usecase | Xem nhật ký lịch sử |
|---|---|---|---|---|
| Tác nhân | Admin | | | |
| Mô tả | Xem audit trail hành động Admin | | | |
| Sự kiện kích hoạt | Kích Audit Logs | | | |
| Tiền điều kiện | Admin đã đăng nhập | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | GET /admin/audit-logs | Phân trang, filter action/entityType/admin | |
| Hậu điều kiện | Admin xem lịch sử | | | |

### l. UC 036: Health Check

| Mã Use case | UC 036 | | Tên Usecase | Kiểm tra sức khỏe hệ thống |
|---|---|---|---|---|
| Tác nhân | DevOps / Hệ thống | | | |
| Mô tả | Kiểm tra server uptime và database connection | | | |
| Sự kiện kích hoạt | GET /api/health | | | |
| Tiền điều kiện | Không | | | |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống | |
| | 1 | Gửi request | Kiểm tra uptime + DB connection | |
| Hậu điều kiện | Trả về status | | | |
"""

with open('document/dactauser.md', 'w', encoding='utf-8') as f:
    f.write(content)

print('File created successfully!')
import os
print(f'Size: {os.path.getsize("document/dactauser.md")} bytes')
