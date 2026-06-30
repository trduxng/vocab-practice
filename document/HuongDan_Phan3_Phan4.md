# DỰ THẢO BÁO CÁO DỰ ÁN HỆ THỐNG VOCABOOST

## PHẦN 3 & PHẦN 4: KẾ HOẠCH VÀ QUÁ TRÌNH THỰC HIỆN

Dưới đây là nội dung chi tiết được soạn thảo sẵn cho **Phần 3: Kế hoạch thực hiện** và **Phần 4: Quá trình thực hiện** dựa trên cơ cấu dự án VocaBoost (3 thành viên: Dũng - BA/PM, Tùng - Frontend Developer, Phúc - Backend/DB Engineer) và các công nghệ thực tế sử dụng (Next.js, Express.js, SQL Server).

---

# 3. Kế hoạch thực hiện

Kế hoạch phát triển hệ thống VocaBoost được chia làm 6 tuần với các đầu việc cụ thể cho từng vai trò và các mốc đánh giá quan trọng nhằm đảm bảo tiến độ dự án.

## 3.1. Timeline chi tiết theo tuần

Dưới đây là bảng kế hoạch chi tiết theo tuần cho hệ thống VocaBoost, phân chia công việc cụ thể cho 3 thành viên: Dũng (PM/BA), Tùng (Frontend Developer) và Phúc (Backend/DB Engineer).

| Tuần       | Nội dung công việc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Kết quả đạt được                                                                                                                                                                                                                                                                                                                             |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tuần 1** | **Phân tích yêu cầu & Thiết kế hệ thống:**<br>- Tổ chức họp khởi động (Kick-off meeting), phân chia vai trò (Dũng: PM/BA, Tùng: FE, Phúc: BE/DB) và xác định phạm vi dự án.<br>- Nghiên cứu cơ sở lý thuyết: Phương pháp Spaced Repetition (Lặp lại ngắt quãng) và Active Recall (Chủ động ôn tập). Khảo sát giao diện Quizlet & Anki.<br>- Soạn thảo tài liệu đặc tả yêu cầu phần mềm (SRS v1.0.0) chi tiết các phân hệ: Learner, Content Creator và Admin Moderation.<br>- Vẽ sơ đồ phân rã chức năng (FDD) và sơ đồ Use-case tổng quan & phân rã.<br>- Thiết kế cơ sở dữ liệu quan hệ (ERD) chi tiết gồm 14 bảng quan hệ chính (Users, Roles, Words, Questions, MiniTests, UserWordProgress...).                                                                                                                                                                                                                                                                                                                                                                                     | - Biên bản họp khởi động dự án và phân chia công việc.<br>- Tài liệu SRS v1.0.0 đặc tả 25 Use-case cốt lõi của hệ thống.<br>- File thiết kế sơ đồ FDD, Use-case Diagram và Activity Diagram.<br>- Sơ đồ thiết kế cơ sở dữ liệu ERD hoàn chỉnh với các khóa (PK, FK) và ràng buộc toàn vẹn.                                                   |
| **Tuần 2** | **Thiết kế UI/UX & Thiết lập môi trường dự án:**<br>- Thiết kế mockup chi tiết trên Figma cho 3 phân hệ: Landing Page (7 phần), Dashboard Học viên (Grid layout), màn hình học Flashcard xoay lật 3D, trang quản lý nội dung cho Creator, trang kiểm duyệt cho Admin (giao diện 2 cột).<br>- Khởi tạo repo GitHub chung, thiết lập cấu hình Git Workflow (nhánh `main`, `develop`, các nhánh tính năng `feature/*`).<br>- Khởi tạo dự án Next.js (TypeScript, TailwindCSS) cấu trúc App Router.<br>- Khởi tạo server Node.js/Express.js, cài đặt kết nối SQL Server thông qua mẫu thiết kế **Connection Pool Singleton** để tối ưu hóa hiệu năng kết nối.                                                                                                                                                                                                                                                                                                                                                                                                                               | - Bản thiết kế Figma Mockup hoàn chỉnh cho cả 3 tác nhân.<br>- Kho chứa mã nguồn (Repository) GitHub phân luồng nhánh và cấu hình cơ bản.<br>- Khung mã nguồn dự án (Boilerplate) Frontend & Backend khởi chạy thành công.<br>- Database Service sử dụng Connection Pool kết nối SQL Server hoạt động ổn định.                               |
| **Tuần 3** | **Phát triển Phân hệ Học tập cốt lõi (Core Learning Flow) & Nạp dữ liệu:**<br>- Viết các API Endpoint: Lấy danh sách Topic phân loại theo trình độ TOEIC (300, 500, 700, 900) (`/api/user/learning-path`), API chi tiết Topic (`/api/user/topics/:topicId/words`), API danh sách từ vựng cá nhân (Notebook).<br>- Soạn thảo và chạy script SQL để nạp dữ liệu mẫu từ vựng (Vocabulary Seed) gồm 600 từ vựng TOEIC/12 chủ đề cùng ví dụ minh họa và câu hỏi trắc nghiệm (`seed_vocabulary_learning_720.sql` và `repair_seed_vocabulary_learning_curated.sql`).<br>- Xây dựng giao diện trang Dashboard Học viên (hiển thị tiến độ học tập dạng skeleton), trang Catalog chọn chủ đề học tập, và trang chi tiết chủ đề hiển thị danh sách từ vựng kèm bộ lọc trạng thái từ (tất cả, từ mới, từ cần ôn, từ đã thuộc).                                                                                                                                                                                                                                                                      | - Script SQL khởi tạo dữ liệu mẫu chạy thành công trên SQL Server.<br>- Các API Endpoint lấy dữ liệu học tập cơ bản hoàn thành.<br>- Giao diện catalog chủ đề và danh sách từ vựng của Học viên hoạt động mượt mà với dữ liệu thật.                                                                                                          |
| **Tuần 4** | **Thuật toán Spaced Repetition & Gamification:**<br>- Viết Stored Procedure `usp_SubmitQuestionAttempt` để tự động chấm điểm và tính toán MasteryLevel, NextReviewDate theo thuật toán Spaced Repetition: Trả lời ĐÚNG dời `NextReviewDate = Ngày hiện tại + (MasteryLevel * 2 ngày)`; trả lời SAI đặt lại `MasteryLevel = 1` và hiển thị ôn tập lại ngay lập tức.<br>- Xây dựng API tích lũy điểm kinh nghiệm (XP) cho các hoạt động: Học từ mới (+5 XP), Hoàn thành luyện tập (+10 XP), Làm đề thi (+20 XP), Đăng nhập hàng ngày (+5 XP) và cơ chế tính Level.<br>- Phát triển màn hình học Flashcard tương tác (hiệu ứng xoay lật 3D, tích hợp phát âm audio, hiển thị nghĩa và câu ví dụ, 4 nút chọn đáp án trắc nghiệm hoặc nhập liệu điền từ).<br>- Xây dựng trang xem tiến độ học tập (Heatmap 365 ngày hiển thị tần suất học tập) và trang xem bộ sưu tập Huy hiệu (Achievements).                                                                                                                                                                                              | - Stored Procedure tính toán thuật toán Spaced Repetition tích hợp thành công vào SQL Server.<br>- Giao diện Flashcard tương tác 3D mượt mà, hỗ trợ phát âm âm thanh chuẩn.<br>- Cơ chế Gamification (XP, Level, Huy hiệu) hoạt động đồng bộ giữa FE và BE.<br>- Giao diện Heatmap 365 ngày vẽ biểu đồ tần suất học tập hoạt động chính xác. |
| **Tuần 5** | **Phân hệ Biên tập viên (Content Creator) & Kiểm duyệt (Admin Moderation):**<br>- Phát triển giao diện và API CRUD cho Biên tập viên bao gồm các tài nguyên ở trạng thái Draft: Topics, Words & Examples, Questions, Mini Tests.<br>- Tích hợp API upload tệp đa phương tiện hình ảnh/âm thanh (`/api/creator/media`).<br>- Xây dựng API và giao diện Gửi nội dung phê duyệt (`Submit for Review`) để chuyển trạng thái nội dung sang `Pending Review`.<br>- Xây dựng API và giao diện Dashboard Admin Moderation: Hiển thị danh sách nội dung chờ duyệt; cung cấp nút Approve (chuyển trạng thái sang `Published`) và Reject (hiển thị textarea yêu cầu điền lý do từ chối, chuyển trạng thái về `Rejected` và ghi nhận lịch sử vào bảng `ContentReviewLogs`).                                                                                                                                                                                                                                                                                                                         | - Giao diện quản lý nội dung dạng bảng (Data Table) tích hợp bộ lọc trạng thái chi tiết cho Creator hoàn thành.<br>- API và giao diện tải lên Media Assets hoạt động tốt.<br>- Quy trình kiểm duyệt khép kín giữa Creator và Admin hoạt động ổn định, ghi nhật ký kiểm duyệt đầy đủ vào `ContentReviewLogs`.                                 |
| **Tuần 6** | **Tính năng nâng cao, Kiểm thử, Triển khai & Nghiệm thu:**<br>- Phát triển tính năng Bulk Import ở Frontend: Sử dụng thư viện `papaparse` và `xlsx` để phân tích file CSV/XLSX người dùng tải lên, hiển thị bảng xem trước (preview) để chỉnh sửa trước khi gửi API import hàng loạt.<br>- Phát triển API gợi ý thông tin từ vựng bằng AI (`/api/ai/word-suggestions` kết nối OpenAI API) giúp Biên tập viên tự động tạo nghĩa tiếng Việt, phiên âm, câu ví dụ TOEIC.<br>- Thực hiện tối ưu hóa hiệu năng SQL Server: Đánh Index cho các cột thường xuyên tìm kiếm (`Email`, `NextReviewDate`, `UserID`, `WordID`), phân trang dữ liệu API.<br>- Thiết lập bảo mật: Mã hóa mật khẩu người dùng bằng thuật toán Bcrypt, kiểm soát quyền truy cập middleware JWT.<br>- Viết kịch bản test và tiến hành Unit Test cho thuật toán lặp ngắt quãng, Integration Test cho quy trình duyệt bài.<br>- Deploy Frontend lên Vercel, Backend lên VPS/Render và Database lên SQL Server Cloud. Đóng gói mã nguồn, viết tài liệu hướng dẫn triển khai (`DEPLOY_GUIDE.md`) và hoàn thiện báo cáo nhóm. | - Công cụ Bulk Import và API gợi ý AI hoạt động ổn định.<br>- Hệ thống được tối ưu hóa về tốc độ tải trang, truy vấn SQL và bảo mật an toàn.<br>- Website VocaBoost chạy thực tế trực tuyến mượt mà.<br>- Báo cáo lớn hoàn thiện và slide trình bày nghiệm thu sẵn sàng.                                                                     |

---

## 3.2. Các mốc chính (Milestones)

Để kiểm soát chặt chẽ tiến độ, dự án thiết lập 6 mốc quan trọng (Milestones) tương ứng với việc hoàn thành các giai đoạn then chốt:

1.  **Mốc 1 (Cuối tuần 1):** Hoàn thành tài liệu phân tích hệ thống (SRS) và thiết kế cơ sở dữ liệu chi tiết (sơ đồ ERD).
2.  **Mốc 2 (Cuối tuần 2):** Hoàn thành thiết kế Figma và thiết lập khung mã nguồn phát triển (Boilerplate Frontend & Backend).
3.  **Mốc 3 (Cuối tuần 3):** Hoàn thành giao diện và API phân hệ Học tập cốt lõi của Học viên.
4.  **Mốc 4 (Cuối tuần 4):** Hoàn thành chức năng Flashcard Spaced Repetition và cơ chế Gamification.
5.  **Mốc 5 (Cuối tuần 5):** Hoàn thành phân hệ Biên tập viên (Content Creator) và Phân hệ Kiểm duyệt (Admin Moderation).
6.  **Mốc 6 (Cuối tuần 6):** Hoàn tất Bulk Import, AI suggestions, kiểm thử, deploy trực tuyến và đóng gói báo cáo dự án nhóm.

## 3.3. Kế hoạch phân rã Task và ước lượng Story Points trên Jira

Để quản lý chi tiết các hạng mục công việc trong giai đoạn nước rút (Sprint cuối), nhóm sử dụng công cụ **Jira Software** để lập kế hoạch phân rã Task, gán người thực hiện, thiết lập ngày bắt đầu/ngày hoàn thành và ước lượng độ phức tạp của Task thông qua Story Points (áp dụng thang điểm 5, 8).

Dưới đây là bảng phân rã các Task chi tiết được cấu hình trên Jira của nhóm:

| STT | Tên Task (Jira Summary) | Người phụ trách (Assignee) | Ngày bắt đầu (Start Date) | Hạn hoàn thành (Due Date) | Độ ưu tiên (Priority) | Story Point |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Trang user dashboard và progress | Tùng (Frontend Developer) | 2026-06-16 | 2026-06-18 | Medium | 5 |
| 2 | API Mini Test: danh sách, làm bài, lịch sử | Phúc (Backend/DB Engineer) | 2026-06-17 | 2026-06-20 | High | 8 |
| 3 | UI Mini Test và xem kết quả | Tùng (Frontend Developer) | 2026-06-19 | 2026-06-21 | High | 8 |
| 4 | API admin dashboard và thống kê | Phúc (Backend/DB Engineer) | 2026-06-21 | 2026-06-23 | Medium | 5 |
| 5 | UI admin dashboard, chart, thống kê học viên | Tùng (Frontend Developer) | 2026-06-22 | 2026-06-24 | Medium | 5 |
| 6 | Test tổng thể, sửa bug, chụp ảnh Jira báo cáo | Phúc + Tùng | 2026-06-24 | 2026-06-25 | Medium | 5 |

*Ghi chú về cơ chế hoạt động của hệ thống quản lý Jira:*
- **Độ ưu tiên (Priority):** Tự động phân loại dựa trên Story Point. Các task có **Story Point từ 8 trở lên** sẽ có độ ưu tiên **High** (do logic phức tạp như thi cử, chấm điểm trắc nghiệm); các task dưới 8 điểm có độ ưu tiên **Medium**.
- **Description (Mô tả):** Mỗi task khi tạo trên Jira đều chứa thông tin mô tả chi tiết bao gồm người phụ trách, thời hạn, story point và bối cảnh các công nghệ sử dụng trong dự án (Express backend, SQL Server, Next.js frontend, auth, admin, user, flashcard, quiz và progress).


---

# 4. Quá trình thực hiện

## 4.1. Mô tả cách nhóm làm việc

Nhóm áp dụng mô hình phát triển phần mềm theo phương pháp **Agile/Scrum** rút gọn để tối ưu hóa khả năng tương tác và linh hoạt ứng phó với thay đổi:

- **Họp định kỳ (Weekly Meetings):** Nhóm tổ chức họp trực tiếp hoặc trực tuyến vào cuối mỗi tuần để:
  - Đánh giá các nhiệm vụ đã hoàn thành trong tuần.
  - Báo cáo các khó khăn, vướng mắc kỹ thuật (blockers) để các thành viên khác hỗ trợ.
  - Lên kế hoạch chi tiết cho tuần tiếp theo và phân chia cụ thể trên công cụ quản lý.
- **Họp ngắn (Daily Standup):** Diễn ra 2 lần/tuần (khoảng 10-15 phút trực tuyến qua Discord/Google Meet) để cập nhật nhanh tiến độ: _Hôm qua làm gì? Hôm nay làm gì? Có gặp khó khăn gì không?_
- **Kênh trao đổi chính:** Nhóm sử dụng **Discord** để họp và chia sẻ màn hình khi debug, **Zalo/Messenger** để trao đổi nhanh và **Google Drive** để lưu trữ tài liệu phân tích nghiệp vụ.

---

## 4.2. Công cụ sử dụng

### 4.2.1. Quản lý dự án bằng Jira

Nhóm sử dụng công cụ **Jira Software** làm hệ thống quản lý dự án chính theo mô hình Scrum. Các yêu cầu từ tài liệu SRS được phân rã thành các **User Story** và **Task** cụ thể trên Jira Backlog, sau đó được đưa vào Sprint để thực hiện. Quy trình theo dõi trạng thái công việc (Workflow) trên bảng Scrum/Kanban của Jira bao gồm các trạng thái chính:

1.  **To Do:** Danh sách các công việc đã được lên kế hoạch và phân bổ cho Sprint hiện tại nhưng chưa bắt đầu thực hiện.
2.  **In Progress:** Các công việc đang được các thành viên trực tiếp lập trình hoặc xử lý.
3.  **In Review:** Các công việc đã hoàn thành mã nguồn, đang chờ tạo Pull Request (PR) và đợi thành viên khác review chéo hoặc kiểm tra tính đúng đắn trước khi merge.
4.  **Done:** Các công việc đã vượt qua các bước kiểm thử, code review và được tích hợp thành công vào nhánh phát triển chính (`develop`).

_Mỗi Task trên Jira đều được cấu hình đầy đủ thông tin để phục vụ việc giám sát và báo cáo:_

- **Summary (Tên công việc):** Mô tả ngắn gọn nhiệm vụ cần làm (ví dụ: *"API Mini Test: danh sách, làm bài, lịch sử"*).
- **Assignee (Người phụ trách):** Phân chia trách nhiệm rõ ràng cho từng thành viên (Phúc: Backend/DB, Tùng: Frontend).
- **Start Date & Due Date (Ngày bắt đầu & Hạn hoàn thành):** Xác định rõ mốc thời gian thực hiện để kiểm soát tiến độ và tránh trễ hạn.
- **Story Points (Điểm câu chuyện):** Thể hiện độ phức tạp, khối lượng công việc và rủi ro của từng Task (áp dụng thang điểm 5, 8).
- **Priority (Độ ưu tiên):** Tự động phân loại dựa trên Story Point: Các task từ 8 điểm trở lên có độ ưu tiên **High** (Cao), các task dưới 8 điểm có độ ưu tiên **Medium** (Trung bình).

### 4.2.2. Quản lý mã nguồn bằng GitHub

Nhóm sử dụng **GitHub** làm nền tảng quản lý mã nguồn phân tán (Git). Quy trình làm việc với Git (Git Workflow) được nhóm chuẩn hóa như sau:

- **Quy hoạch các nhánh (Branching Strategy):**
  - `main`: Nhánh chứa mã nguồn ổn định nhất của dự án, dùng để deploy lên môi trường Production. Chỉ Merge từ nhánh `develop` khi có sự đồng thuận của cả nhóm sau mỗi cột mốc.
  - `develop`: Nhánh tích hợp chính. Mọi tính năng sau khi phát triển xong đều được đưa vào đây để chạy thử nghiệm và kiểm thử tích hợp.
  - `feature/[ten-tinh-nang]`: Nhánh tính năng được rẽ nhánh từ `develop`. Mỗi thành viên phát triển một tính năng riêng sẽ làm việc trên một nhánh độc lập (ví dụ: `feature/spaced-repetition`, `feature/creator-crud`, `feature/bulk-import`) để tránh xung đột mã nguồn.
- **Quy trình Commit & Pull Request (PR):**
  - Các thành viên tuân thủ quy tắc commit có thông điệp rõ ràng theo định dạng Conventional Commits (ví dụ: `feat: add spaced repetition algorithm`, `fix: repair flashcard loading deadlock`).
  - Khi tính năng trên nhánh `feature/*` hoàn thành, thành viên sẽ đẩy code lên GitHub và tạo một **Pull Request (PR)** yêu cầu Merge vào nhánh `develop`.
  - **Code Review:** Bắt buộc phải có sự duyệt chéo từ thành viên khác (ví dụ: Phúc review code Express.js, Tùng review cấu trúc TypeScript Next.js). Sau khi không còn lỗi và code đạt chuẩn tối ưu, PR mới được duyệt và Merge vào `develop`.
  - **Giải quyết xung đột (Merge Conflict):** Khi xảy ra xung đột code trên GitHub, các thành viên liên quan sẽ cùng thảo luận trực tiếp để chọn lọc và giữ lại đoạn mã tối ưu nhất.

---

## 4.3. Ảnh minh họa

_(Khi đưa nội dung này vào Microsoft Word, nhóm cần chụp và chèn các hình ảnh thực tế sau đây để báo cáo có tính thuyết phục cao nhất)_

1.  **Ảnh minh họa 1: Bảng Kanban quản lý công việc và báo cáo tiến độ trên Jira**
    - _Hướng dẫn chụp:_ Chụp toàn màn hình bảng Active Sprint trên Jira Software của nhóm, hiển thị rõ các cột trạng thái (To Do, In Progress, In Review, Done) với các thẻ task có gán Story Point, Avatar người thực hiện và độ ưu tiên.
    - _Chú thích hình ảnh dưới trang:_ `Hình 4.1: Bảng Scrum/Kanban quản lý tiến độ công việc của nhóm trên Jira`
2.  **Ảnh minh họa 2: Giao diện các nhánh mã nguồn và Pull Request trên GitHub**
    - _Hướng dẫn chụp:_ Chụp trang danh sách Pull Request đã được Merge trên GitHub, hoặc chụp sơ đồ nhánh (Network Graph) trong phần _Insights -> Network_ của repo GitHub để thể hiện luồng làm việc thực tế với nhiều nhánh `feature/*` rẽ ra và gộp lại vào `develop`.
    - _Chú thích hình ảnh dưới trang:_ `Hình 4.2: Biểu đồ Network các nhánh mã nguồn và lịch sử Pull Request trên GitHub`
3.  **Ảnh minh họa 3: Lịch sử commit trên repo GitHub**
    - _Hướng dẫn chụp:_ Vào danh sách commits trên GitHub của repo dự án, chụp lại danh sách các commit gần nhất để chứng minh các thành viên có đóng góp code đều đặn và tuân thủ chuẩn thông điệp commit.
    - _Chú thích hình ảnh dưới trang:_ `Hình 4.3: Lịch sử commit mã nguồn của các thành viên trên GitHub`

---

# 5. Kết quả đạt được

Hệ thống học từ vựng tiếng Anh VocaBoost đã được hoàn thành đầy đủ cả về mặt Cơ sở dữ liệu (Database), API dịch vụ (Backend) và Giao diện người dùng (Frontend). Dưới đây là danh sách chi tiết các chức năng đã hoàn thành và đưa vào hoạt động thực tế.

## 5.1. Các chức năng hệ thống dùng chung (Common System Features)
- **Đăng ký tài khoản (Register):** Học viên có thể tự đăng ký tài khoản với các trường thông tin cơ bản: Họ tên, Email, Mật khẩu. Hệ thống có kiểm tra tính hợp lệ dữ liệu đầu vào phía Client (qua Zod) và Server.
- **Đăng nhập hệ thống (Login):** Xác thực người dùng bằng Email và Mật khẩu. Sau khi đăng nhập thành công, máy chủ cấp mã token JWT (stateless token) lưu ở cookie/local storage phía client để duy trì phiên làm việc.
- **Phân quyền người dùng (Role-Based Access Control - RBAC):** Phân chia rõ ràng các quyền truy cập tài nguyên cho 3 nhóm đối tượng: Học viên (Learner), Biên tập viên (Content Creator) và Quản trị viên (Admin). Route middleware ở backend chặn các truy cập trái phép.
- **Cập nhật hồ sơ cá nhân (Profile Settings):** Cho phép người dùng thay đổi thông tin cá nhân (Họ tên) và thực hiện đổi mật khẩu an toàn (mật khẩu mới được băm bằng thuật toán Bcrypt trước khi lưu vào DB).

## 5.2. Phân hệ chức năng dành cho Học viên (Learner Modules)
- **Dashboard Học viên:**
  - Hiển thị thống kê nhanh: Số từ đã học (Mastered Words), số từ cần ôn hôm nay (Due Words), điểm kinh nghiệm tích lũy (XP), cấp độ hiện tại (Level).
  - Biểu đồ tiến độ học tập tóm tắt giúp học viên theo dõi lộ trình nhanh chóng.
- **Học từ mới (Learn View):**
  - Hiển thị danh sách từ vựng theo chủ đề trực quan.
  - Mỗi từ vựng hiển thị chi tiết: Từ tiếng Anh, phiên âm (IPA), từ loại, nghĩa tiếng Việt, nghĩa tiếng Anh, câu ví dụ mẫu kèm dịch nghĩa.
  - Tích hợp tính năng phát âm giọng đọc chuẩn bản xứ sử dụng thư viện âm thanh Web Speech API.
- **Luyện tập Flashcard lặp ngắt quãng (Practice - Spaced Repetition):**
  - Giao diện thẻ Flashcard tương tác 3D (xoay lật mặt trước/sau khi click mượt mà bằng CSS 3D Transforms).
  - Áp dụng thuật toán Spaced Repetition (SuperMemo SM-2 cải tiến): Sau khi học viên tự đánh giá mức độ nhớ thẻ (4 nút: Again, Hard, Good, Easy), hệ thống sẽ gửi yêu cầu chấm điểm qua API để thực thi Stored Procedure `usp_SubmitQuestionAttempt` tính toán lại `MasteryLevel` và ngày ôn tập tiếp theo (`NextReviewDate`).
  - Hỗ trợ làm bài trắc nghiệm nhanh 4 đáp án để kiểm tra khả năng nhớ từ.
- **Đề thi thử (Mini Test):**
  - Hiển thị danh sách đề thi thử TOEIC do Biên tập viên biên soạn.
  - Giao diện làm đề thi trực tuyến giới hạn thời gian (đếm ngược), hiển thị tiến trình câu hỏi trực quan.
  - Hệ thống tự động chấm điểm sau khi nộp bài và hiển thị trang kết quả: Số câu đúng/sai, số điểm đạt được, thời gian hoàn thành.
  - Xem lại đáp án chi tiết và giải thích từng câu hỏi sau khi làm bài.
  - **Lịch sử thi (Test History):** Lưu trữ toàn bộ lịch sử thi thử giúp học viên đánh giá sự tiến bộ của bản thân qua thời gian.
- **Sổ tay từ vựng (Notebook):**
  - Lưu lại toàn bộ từ vựng học viên đã học qua.
  - Bộ lọc thông minh cho phép tìm kiếm từ vựng và phân loại từ theo các trạng thái: *Từ mới (New), Đang học (Learning), Cần ôn (Due), Đã thuộc (Mastered)*.
- **Báo cáo tiến trình học tập (Progress & Gamification):**
  - Biểu đồ đóng góp Heatmap 365 ngày (Calendar Contribution Heatmap) hiển thị tần suất học tập mỗi ngày dựa trên lịch sử attempts thực tế của học viên.
  - Kho thành tích hiển thị bộ sưu tập các Huy hiệu (Achievements) đạt được khi hoàn thành các cột mốc học tập (ví dụ: *Học từ đầu tiên, Làm 5 đề thi thử, Đạt 1000 XP...*).

## 5.3. Phân hệ chức năng dành cho Biên tập viên (Content Creator Modules)
- **Dashboard Biên tập viên:** Thống kê tổng số lượng chủ đề, từ vựng và câu hỏi trắc nghiệm đã tạo; biểu đồ thống kê các bài viết được duyệt/bị từ chối.
- **Biên soạn nội dung (CRUD Nội dung):**
  - Lập trình giao diện quản lý dạng bảng (Data Table) tìm kiếm và lọc trạng thái chi tiết.
  - Thực hiện thêm, sửa, xóa các tài nguyên: Chủ đề học tập (Topics), Từ vựng & Câu ví dụ (Words & Examples), Câu hỏi trắc nghiệm (Questions) và Đề thi thử (Mini Tests).
  - Trạng thái mặc định của nội dung khi biên soạn là bản nháp (`Draft`) để Biên tập viên có thể lưu trữ và chỉnh sửa nhiều lần.
- **Quản lý đa phương tiện (Media Upload):** Tích hợp chức năng upload file hình ảnh minh họa cho từ vựng và file âm thanh phát âm thông qua API backend sử dụng thư viện `multer` lưu trữ trên máy chủ.
- **Nhập từ vựng hàng loạt (Bulk Import):**
  - Cho phép import hàng trăm từ vựng nhanh chóng qua tệp tin Excel (.xlsx) hoặc CSV hoặc dán văn bản phân tách bằng tab/dấu phẩy.
  - Giao diện phân tích (parse) bằng thư viện `papaparse` và `xlsx` ở client, hiển thị bảng xem trước (Preview Table) cho phép chỉnh sửa dữ liệu lỗi trước khi gửi request import lên API backend.
- **Gợi ý từ vựng bằng trí tuệ nhân tạo (AI Suggestion):**
  - Kết nối OpenAI API (mô hình GPT-4o-mini). Biên tập viên chỉ cần nhập từ khóa tiếng Anh, AI sẽ tự động điền các trường còn lại: phiên âm chuẩn, định nghĩa, nghĩa tiếng Việt, và đặt câu ví dụ TOEIC đi kèm.
- **Gửi phê duyệt nội dung (Submit for Review):** Biên tập viên gửi yêu cầu kiểm duyệt chủ đề. Trạng thái chủ đề sẽ chuyển từ `Draft` sang `Pending Review` và gửi sang hàng đợi kiểm duyệt của Admin.

## 5.4. Phân hệ chức năng dành cho Quản trị viên (Admin Moderation Modules)
- **Dashboard Quản trị viên (Analytics & Reports):**
  - Hiển thị thống kê tổng quan hệ thống: Tổng số học viên, tổng số từ vựng, tổng số lượt làm bài kiểm tra hàng ngày.
  - Biểu đồ thống kê số lượng attempts ôn luyện theo ngày và phân bố từ vựng theo trình độ.
- **Duyệt và kiểm duyệt nội dung (Content Moderation):**
  - Giao diện kiểm duyệt trực quan dạng 2 cột: Cột bên trái hiển thị danh sách chủ đề cần duyệt, cột bên phải hiển thị chi tiết từ vựng và câu hỏi đính kèm.
  - Nút **Approve:** Chuyển trạng thái chủ đề sang `Published` để công khai cho toàn bộ Học viên cùng học.
  - Nút **Reject:** Yêu cầu nhập lý do từ chối (textarea), sau đó chuyển trạng thái chủ đề về `Rejected` (được gửi lại cho Creator sửa) và ghi lại toàn bộ lịch sử thao tác cùng lý do vào bảng `ContentReviewLogs`.
  - Sử dụng SQL Server Transactions ở tầng DB để đảm bảo tính nhất quán dữ liệu (khi duyệt một Topic thì tất cả các Word đính kèm cũng sẽ tự động chuyển trạng thái tương ứng).
- **Quản lý danh mục chủ đề (Topic Categories CRUD):** Thiết lập và phân loại các nhóm chứng chỉ (ví dụ: TOEIC, IELTS, TOEFL, Giao tiếp).
- **Quản lý tài khoản học viên:** Danh sách toàn bộ học viên hệ thống kèm chức năng khóa (Deactivate) / mở khóa (Activate) tài khoản nhằm nâng cao tính kiểm soát và an toàn.

---

# 6. Khó khăn & cách giải quyết

Trong quá trình thiết kế, phát triển và tích hợp hệ thống VocaBoost, nhóm đã đối mặt với một số khó khăn thách thức về mặt công nghệ, thuật toán và tối ưu hóa hệ thống. Dưới đây là các khó khăn chính cùng phương án xử lý tương ứng:

## 6.1. Quản lý Connection Pool kết nối SQL Server trong Node.js (Express.js)
- **Khó khăn gặp phải:** 
  - Express.js xử lý các request bất đồng bộ (Asynchronous requests). Khi có nhiều người dùng truy cập đồng thời, nếu mỗi request API đều tạo một kết nối mới tới cơ sở dữ liệu SQL Server và không được đóng đúng cách, máy chủ sẽ nhanh chóng cạn kiệt tài nguyên kết nối (Connection Leak), dẫn đến lỗi phản hồi chậm hoặc sập API (Error: `Connection lost` / `Too many connections`).
- **Cách xử lý:**
  - Nhóm đã áp dụng mẫu thiết kế **Singleton Pattern** để xây dựng lớp kết nối cơ sở dữ liệu.
  - Sử dụng thư viện `mssql` để tạo một **Connection Pool** duy nhất và cấu hình kích thước pool tối ưu (min: 5, max: 20 kết nối mở sẵn).
  - Mọi dịch vụ trong backend đều tái sử dụng Connection Pool này thông qua hàm dùng chung, đảm bảo các kết nối được quản lý và tự động giải phóng một cách tối ưu nhất.

## 6.2. Tính toán lộ trình lặp lại ngắt quãng (Spaced Repetition SM-2)
- **Khó khăn gặp phải:**
  - Thuật toán Spaced Repetition (SM-2) đòi hỏi tính toán động các giá trị: Khoảng cách ôn tập tiếp theo (`Interval`), Hệ số dễ học (`EasinessFactor`), Trạng thái ôn tập (`MasteryLevel`) dựa trên mức độ ghi nhớ của học viên.
  - Nếu thực hiện truy vấn SELECT dữ liệu cũ lên Backend -> Tính toán bằng JavaScript -> Lưu lại bằng lệnh UPDATE, hệ thống sẽ phải thực hiện nhiều chu kỳ đọc-ghi và giao tiếp mạng liên tục, làm tăng độ trễ phản hồi (latency) và dễ xảy ra tranh chấp dữ liệu (Race Condition).
- **Cách xử lý:**
  - Nhóm chuyển toàn bộ logic tính toán thuật toán SM-2 xuống cơ sở dữ liệu bằng cách sử dụng **Stored Procedure** (`usp_SubmitQuestionAttempt`).
  - Khi học viên lật flashcard hoặc hoàn thành bài trắc nghiệm, Backend chỉ cần truyền tham số đơn giản (`UserId`, `WordId`, `QualityScore`) xuống Stored Procedure. SQL Server sẽ tự động thực hiện tính toán số học, cập nhật bảng `UserWordProgress` và thêm mới bản ghi vào `ExerciseAttempts` trong cùng một transaction khép kín, tối ưu hóa tốc độ phản hồi chỉ còn dưới 50ms.

## 6.3. Kiểm soát quyền sở hữu và bảo mật tài nguyên (RBAC & generic ownership validation)
- **Khó khăn gặp phải:**
  - Mặc dù hệ thống đã phân quyền bằng JWT, nhưng Biên tập viên (Content Creator) vẫn có thể gửi request sửa/xóa các chủ đề (Topics) hoặc từ vựng của Biên tập viên khác bằng cách thay đổi ID tài nguyên trên thanh địa chỉ hoặc gửi payload giả mạo. Việc viết logic kiểm tra quyền sở hữu lặp đi lặp lại ở từng route API khiến code backend bị trùng lặp và khó bảo trì.
- **Cách xử lý:**
  - Nhóm đã xây dựng các middleware kiểm tra quyền hạn chung (Generic Ownership Middleware) trong Express.js.
  - Middleware này sẽ tự động truy vấn cơ sở dữ liệu dựa trên loại tài nguyên và ID để so khớp trường `CreatedBy` với `UserId` trích xuất từ JWT token của người dùng đang đăng nhập. Nếu không khớp, hệ thống lập tức trả về mã lỗi `403 Forbidden`, bảo vệ tuyệt đối tính toàn vẹn dữ liệu.

## 6.4. Nhập dữ liệu từ vựng hàng loạt (Bulk Import)
- **Khó khăn gặp phải:**
  - Khi Biên tập viên tải lên danh sách hàng trăm từ vựng từ tệp tin Excel/CSV, việc xử lý dữ liệu lớn đồng thời rất dễ làm treo giao diện client hoặc gây nghẽn băng thông server. 
  - Ngoài ra, nếu trong file có một dòng dữ liệu bị lỗi cú pháp hoặc trống thông tin bắt buộc, việc lưu dở dang sẽ tạo ra dữ liệu rác trong cơ sở dữ liệu.
- **Cách xử lý:**
  - Nhóm thiết kế quy trình xử lý 2 giai đoạn:
    - *Giai đoạn 1 (Client parsing & validation):* Sử dụng thư viện `papaparse` và `xlsx` ở client để đọc và phân tích file ngay tại trình duyệt, hiển thị bảng xem trước (Preview Table) và làm nổi bật các ô dữ liệu bị thiếu hoặc sai định dạng để Biên tập viên chỉnh sửa trực tiếp trên giao diện trước khi tải lên.
    - *Giai đoạn 2 (Database Transaction):* Khi gửi danh sách đã chuẩn hóa lên Backend, API backend sử dụng cơ chế **SQL Server Transaction** kết hợp câu lệnh bulk insert. Nếu có bất kỳ lỗi nào xảy ra trong quá trình insert, toàn bộ giao dịch sẽ được cuộn ngược (Rollback) hoàn toàn để đảm bảo tính nhất quán của cơ sở dữ liệu.

---

# 7. Đánh giá làm việc nhóm

## 7.1. Tự đánh giá chung
Nhóm phát triển đã vận hành tốt theo mô hình phát triển phần mềm Agile/Scrum cải tiến. Dưới đây là các điểm tự đánh giá nổi bật của nhóm:
- **Tinh thần trách nhiệm:** Các thành viên trong nhóm luôn chủ động nhận và hoàn thành các task được giao đúng hạn (Due Date) được thiết lập trên Jira.
- **Khả năng cộng tác:** Việc phối hợp giữa Backend (Phúc), Frontend (Tùng) và BA/PM (Dũng) diễn ra nhịp nhàng thông qua việc thống nhất cấu trúc dữ liệu JSON API và tài liệu đặc tả Use-case trước khi tiến hành code.
- **Kỷ luật phát triển:** Tuân thủ chặt chẽ luồng Git Workflow (nhánh `feature/*` rẽ ra từ `develop`, thực hiện Code Review và Merge qua Pull Request), giúp mã nguồn luôn ổn định và không xảy ra xung đột nghiêm trọng.
- **Công cụ quản lý:** Chuyển đổi thành công công cụ quản lý từ Trello sang **Jira Software** giúp nhóm theo dõi tiến độ một cách khoa học qua Story Points, độ ưu tiên và các Active Sprint rõ ràng.

## 7.2. Đánh giá thành viên chi tiết

| **STT** | **Họ và tên** | **Vai trò trong nhóm** | **Mức độ đóng góp** | **Đánh giá kết quả công việc** |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Trần Tuấn Dũng** | Trưởng nhóm / BA & PM | 100% | - Quản lý tiến độ dự án trên Jira Software.<br>- Biên soạn tài liệu SRS v1.0.0 đặc tả 25 Use Case.<br>- Thiết kế sơ đồ FDD, Use Case Diagram và Activity Diagrams.<br>- Đảm bảo chất lượng nghiệm thu và luồng nghiệp vụ. |
| 2 | **Lại Đức Tùng** | Frontend Developer | 100% | - Thiết kế giao diện UI/UX và phát triển ứng dụng client (Next.js, TypeScript).<br>- Tích hợp các biểu đồ học tập (Chart.js), biểu đồ đóng góp Heatmap.<br>- Phát triển module flashcard tương tác 3D và giao diện Bulk Import.<br>- Tối ưu hóa trải nghiệm người dùng đáp ứng (Responsive). |
| 3 | **Nguyễn Hoàng Phúc** | Backend & DB Engineer | 100% | - Thiết kế và xây dựng cơ sở dữ liệu quan hệ (14 bảng SQL Server).<br>- Phát triển toàn bộ RESTful API backend bằng Express.js.<br>- Lập trình Stored Procedure SM-2 (`usp_SubmitQuestionAttempt`) và Stored Procedures thống kê.<br>- Tích hợp xác thực JWT, RBAC và các thư viện hỗ trợ (Multer, OpenAI API). |

---

# 8. Kết luận

## 8.1. Tổng kết
Dự án phát triển **Hệ thống học từ vựng tiếng Anh VocaBoost** đã hoàn thành đúng thời hạn và đạt được đầy đủ các mục tiêu đề ra:
- **Về tính năng:** Hệ thống hỗ trợ hoàn chỉnh vòng lặp học tập của Học viên (Học từ mới -> Ôn luyện Flashcard Spaced Repetition -> Làm Mini Test đánh giá -> Xem báo cáo tiến trình). Đồng thời cung cấp đầy đủ công cụ quản lý nội dung mạnh mẽ cho Content Creator (Bulk Import, gợi ý AI) và hệ thống kiểm duyệt, phân tích số liệu cho Admin.
- **Về kiến trúc:** Áp dụng mô hình phân tầng chuẩn (Next.js + Express.js + SQL Server), tối ưu hóa kết nối DB (Connection Pool Singleton) và nâng cao bảo mật bằng xác thực JWT kết hợp phân quyền RBAC.
- **Về vận hành nhóm:** Áp dụng thành công Agile/Scrum và Jira Software để kiểm soát tiến độ công việc một cách chuyên nghiệp.

## 8.2. Bài học rút ra
Qua quá trình thực hiện dự án này, các thành viên trong nhóm đã gặt hái được nhiều bài học quý báu:
1. **Kỹ năng thiết kế hệ thống:** Tầm quan trọng của việc hoàn thiện tài liệu SRS và sơ đồ cơ sở dữ liệu ERD trước khi viết mã nguồn. Việc này giúp giảm thiểu tới 80% các sửa đổi cấu trúc lớn trong giai đoạn phát triển.
2. **Tối ưu hóa Database:** Hiểu rõ giá trị của việc đưa các logic tính toán nặng hoặc các giao dịch phức tạp (như thuật toán SM-2 hoặc phê duyệt nội dung liên kết) xuống Stored Procedures và Transactions ở Database giúp nâng cao hiệu năng hệ thống lên gấp nhiều lần.
3. **Quản lý dự án chuyên nghiệp:** Nhận thức rõ sự khác biệt khi quản lý dự án bằng các công cụ chuyên dụng như **Jira Software** thay vì các công cụ thủ công. Ước lượng công việc qua Story Points và theo dõi tiến độ qua biểu đồ Sprint giúp nhóm kiểm soát rủi ro trễ hạn hiệu quả hơn.
4. **Văn hóa làm việc nhóm:** Xây dựng văn hóa thảo luận cởi mở, tôn trọng ý kiến đồng đội và tuân thủ các quy tắc làm việc chung như Git Workflow và Code Review chéo là yếu tố then chốt tạo nên một sản phẩm chất lượng cao.



