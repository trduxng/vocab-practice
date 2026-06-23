# 📋 KẾ HOẠCH PHÂN CHIA CÔNG VIỆC & PHÁC THẢO BÁO CÁO HỆ THỐNG VOCABOOST
*(Được xây dựng dựa trên mẫu `Baocao_CNPM.docx` và tài liệu hệ thống hiện tại)*

Để tối ưu hóa thời gian và công sức viết báo cáo lớn này, công việc được chia đều thành **3 Phần độc lập** tương ứng với 3 vai trò phổ biến trong nhóm phát triển phần mềm:
1. **Phần 1: Phân tích & Đặc tả yêu cầu hệ thống (Vai trò BA / PM)**
2. **Phần 2: Thiết kế giao diện & Trải nghiệm UI/UX (Vai trò Frontend Developer / Designer)**
3. **Phần 3: Thiết kế Cơ sở dữ liệu & Kiến trúc kỹ thuật (Vai trò Backend Developer / DB Engineer / QA)**

---

## 🗺️ PHÂN CHIA CHI TIẾT (WBS) & TIẾN ĐỘ

| Phần | Nội dung chính | Người thực hiện | Tài liệu tham khảo có sẵn |
| :--- | :--- | :--- | :--- |
| **Phần 1** | I. GIỚI THIỆU<br>II. TỔNG QUAN HỆ THỐNG<br>III. ĐẶC TẢ USE-CASES | **BA / PM** | `MucLuc_BaoCao_CNPM.md`<br>`system_documentation.md` (Phần IV)<br>`quytrinhnghiepvu.txt` |
| **Phần 2** | IV. THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG (UI/UX) | **Frontend / Designer** | Màn hình Figma / Screenshot thực tế<br>`system_documentation.md` (Phần III) |
| **Phần 3** | V. THIẾT KẾ CƠ SỞ DỮ LIỆU<br>VI. KIẾN TRÚC KỸ THUẬT & KIỂM THỬ | **Backend / DB / QA** | `system_documentation.md` (Phần II, V)<br>`abouttable.md` |

---

# 📝 NỘI DUNG PHÁC THẢO CHI TIẾT CHO TỪNG PHẦN

Dưới đây là phần nội dung đã được soạn thảo sẵn (Draft) với đầy đủ thông số kỹ thuật thực tế của hệ thống VocaBoost để các thành viên sử dụng trực tiếp khi viết báo cáo.

---

## 👤 PHẦN 1: PHÂN TÍCH & ĐẶC TẢ YÊU CẦU HỆ THỐNG (Dành cho BA/PM)

### I. GIỚI THIỆU
* **1.1. Mục đích tài liệu:** Đặc tả yêu cầu phần mềm (SRS v1.0.0) cho hệ thống học từ vựng cá nhân hóa VocaBoost. Tài liệu xác định rõ các yêu cầu chức năng, phi chức năng, luồng nghiệp vụ và là cơ sở nghiệm nghiệm thu hệ thống.
* **1.2. Phạm vi tài liệu:** Áp dụng cho toàn bộ dự án VocaBoost bao gồm: Web App Client (Học viên), Web App Portal (Biên tập viên) và Dashboard Administration (Quản trị viên).
* **1.3. Định nghĩa thuật ngữ và viết tắt:**
  * **Spaced Repetition (Lặp lại ngắt quãng):** Thuật toán học tập dựa trên biểu đồ quên lãng Ebbinghaus, tự động lên lịch ôn tập từ vựng dựa trên mức độ ghi nhớ.
  * **RBAC (Role-Based Access Control):** Kiểm soát truy cập dựa trên vai trò.
  * **JWT (JSON Web Token):** Mã xác thực trạng thái phiên làm việc không trạng thái (stateless).
  * **Creator (Content Creator):** Biên tập viên chịu trách nhiệm soạn thảo từ vựng, câu hỏi.
* **1.4. Vai trò và trách nhiệm:** Phân công chi tiết nhóm phát triển (PM, BA, Dev, QA) trong việc hoàn thiện báo cáo và xây dựng code.

### II. TỔNG QUAN HỆ THỐNG VOCABOOST
* **2.1. Phát biểu bài toán:** Học từ vựng tiếng Anh (luyện thi TOEIC) theo cách truyền thống thường bị rơi rụng kiến thức nhanh chóng (nhồi nhét ngắn hạn). VocaBoost ra đời giải quyết bài toán ghi nhớ dài hạn bằng cách kết hợp Spaced Repetition và các Mini Test thực tế.
* **2.2. Mục tiêu hệ thống:**
  * **Đối với Học viên:** Tăng 200% hiệu quả ghi nhớ từ vựng thông qua thuật toán Flashcard thông minh; đo lường chính xác tiến trình học.
  * **Đối với Biên tập viên (Content Creator):** Cung cấp giao diện CRUD trực quan để xây dựng ngân hàng từ vựng, ví dụ, câu hỏi và đề thi thử ở trạng thái Nháp (Draft).
  * **Đối với Quản trị viên (Admin):** Kiểm duyệt chặt chẽ (Approve/Reject) các nội dung do Creator biên soạn trước khi xuất bản công khai.
* **2.3. Phạm vi hệ thống:** Gồm 4 phân hệ chính:
  1. Phân hệ Học tập lõi (Core Learning - Học từ, Luyện Flashcards).
  2. Phân hệ Quản lý nội dung (Content Management cho Creator).
  3. Phân hệ Kiểm duyệt hệ thống (Admin Moderation).
  4. Phân hệ Trò chơi hóa & Thành tích (Gamification & Achievements).
* **2.4. Đối tượng sử dụng (Actors):**
  * **Học viên (Learner):** Đăng ký tự do, học tập, ôn luyện, làm bài kiểm tra, xem tiến độ.
  * **Biên tập viên (Content Creator):** Được cấp tài khoản, soạn thảo dữ liệu, gửi kiểm duyệt.
  * **Quản trị viên (Admin):** Quản lý hệ thống, duyệt bài của Creator, quản lý tài khoản Học viên.
* **2.5. Sơ đồ phân rã chức năng (FDD - Functional Decomposition Diagram):**
  * **Hệ thống VocaBoost**
    * *Quản lý Tài khoản & Phân quyền:* Đăng nhập, Đăng ký, Đổi mật khẩu, Cập nhật Profile.
    * *Phân hệ Học viên:* Học từ mới, Ôn tập Spaced Repetition, Làm Mini Test, Xem lịch sử thi, Thống kê học tập, Nhận huy hiệu.
    * *Phân hệ Creator:* CRUD Topic, CRUD Word & Example, CRUD Question, Tạo Mini Test, Quản lý Media Assets, Gửi duyệt bài viết.
    * *Phân hệ Admin:* Dashboard Analytics, Duyệt bài viết (Approve/Reject + Log), Quản lý Topic Categories, Khóa/Mở khóa học viên.

* **2.6. Biểu đồ hoạt động tổng quát (Activity Diagrams):**
  *(BA vẽ biểu đồ dựa trên luồng nghiệp vụ sau)*
  * **Luồng Học viên:** Đăng nhập $\rightarrow$ Vào Practice $\rightarrow$ Lấy 15 flashcards đến hạn ôn tập $\rightarrow$ Lật thẻ/Trả lời $\rightarrow$ Hệ thống chấm điểm tự động qua Stored Procedure $\rightarrow$ Cập nhật tiến độ lưu trữ $\rightarrow$ Kết thúc.
  * **Luồng Creator & Admin Moderation:** Creator tạo nội dung (Trạng thái `Draft`) $\rightarrow$ Gửi yêu cầu duyệt (`Pending Review`) $\rightarrow$ Admin xem danh sách chờ $\rightarrow$ Admin Approve (Chuyển trạng thái sang `Published`, hiển thị cho học viên) hoặc Reject (Yêu cầu sửa đổi kèm lý do, chuyển về trạng thái `Rejected` gửi lại cho Creator).

### III. ĐẶC TẢ YÊU CẦU CHỨC NĂNG (SYSTEM USE-CASES)
*(Mô tả chi tiết các Use-case cốt lõi)*
* **UC 007: Luyện tập Flashcard Spaced Repetition (Learner)**
  * **Actor:** Học viên (Learner)
  * **Mô tả:** Học viên ôn luyện các từ vựng đến hạn ôn tập dựa trên thuật toán lặp lại ngắt quãng.
  * **Luồng cơ bản:**
    1. Học viên nhấn "Luyện tập".
    2. Hệ thống truy vấn 15 từ cần ôn (lọc theo `NextReviewDate <= Now` hoặc chưa từng học).
    3. Học viên trả lời/chọn mức độ nhớ (Easy, Medium, Hard).
    4. Hệ thống gọi stored procedure `usp_SubmitQuestionAttempt` để tự động chấm và lưu kết quả.
    5. Cập nhật `UserWordProgress` (MasteryLevel tăng/giảm, NextReviewDate dời tương ứng).
* **UC 018: Gửi nội dung yêu cầu phê duyệt (Content Creator)**
  * **Actor:** Biên tập viên
  * **Mô tả:** Chuyển trạng thái các Topic, Word, Question, Test từ `Draft` sang `Pending` để chờ Admin kiểm duyệt.
* **UC 022: Duyệt và phê duyệt nội dung (Admin)**
  * **Actor:** Quản trị viên
  * **Mô tả:** Admin duyệt các bài viết chờ duyệt. Nếu từ chối, nhập lý do từ chối để lưu vào `ContentReviewLogs`.

---

## 🎨 PHẦN 2: THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG UI/UX (Dành cho Frontend)

Thành viên đảm nhận phần này cần chụp ảnh màn hình giao diện ứng dụng thực tế hoặc vẽ mockup. Dưới đây là mô tả chi tiết bố cục giao diện của 3 Actor để viết tài liệu thuyết minh:

### 4.1. Giao diện Đăng nhập/Đăng ký & Landing Page
* **Landing Page:** Thiết kế hiện đại, responsive. Gồm 7 phần:
  1. *Navbar:* Logo VocaBoost, các liên kết nhanh (Khóa học, Tính năng, Bảng giá) và nút Đăng nhập/Đăng ký.
  2. *Hero Section:* Slogan thu hút, hình ảnh minh họa sinh động, nút kêu gọi hành động (Call-to-Action - CTA) "Bắt đầu học miễn phí".
  3. *Features:* Hiển thị 3 thế mạnh (Spaced Repetition, Thống kê chi tiết, Mini Test đa dạng).
  4. *Courses:* Danh sách các chủ đề từ vựng mẫu.
  5. *How It Works:* 3 bước đơn giản (Đăng ký $\rightarrow$ Học từ vựng $\rightarrow$ Nhớ sâu).
  6. *Achievements & Gamification:* Giới thiệu hệ thống huy hiệu và bảng thành tích.
  7. *Footer:* Bản quyền và thông tin liên hệ.
* **Giao diện Đăng nhập/Đăng ký:** Form tối giản, bo góc mượt mà, có validate lỗi thời gian thực bằng thư viện **Zod** (thông báo lỗi màu đỏ dưới từng ô nhập liệu).

### 4.2. Giao diện dành cho Học viên (Student Interface)
* **Dashboard:** Bố cục dạng lưới (Grid layout) hiện đại:
  * *Hàng 1:* Các thẻ số liệu (Stats cards) hiển thị số từ đã thuộc, tỷ lệ chính xác (%), số bài test đã làm.
  * *Hàng 2:* Biểu đồ xu hướng học tập hàng tuần (Line Chart) biểu diễn số lượt trả lời câu hỏi mỗi ngày.
  * *Hàng 3:* Danh sách 5 từ vựng yếu cần ôn tập gấp (`MasteryLevel < 3`) và khu vực trưng bày Huy hiệu đạt được.
* **Màn hình luyện tập Flashcard:** Thiết kế tập trung (Focus mode), loại bỏ các thành phần gây xao nhãng. Thẻ từ vựng có hiệu ứng xoay lật 3D mượt mà khi nhấn chọn. Giao diện hiển thị từ, loại từ, phát âm âm thanh, câu ví dụ, và 4 nút chọn đáp án trắc nghiệm hoặc nhập liệu điền từ.

### 4.3. Giao diện dành cho Biên tập viên (Content Creator Interface)
* **Dashboard Creator:** Thống kê tổng số Topic, Word, Question do chính Creator đó tạo ra; số bài viết được duyệt và số bài viết bị từ chối.
* **Trang quản lý nội dung dạng bảng (Data Table):** Tích hợp bộ lọc trạng thái chuyên sâu (Bản nháp - Draft, Chờ duyệt - Pending, Bị từ chối - Rejected).
* **Form CRUD từ vựng và câu hỏi:** Tích hợp đa phương tiện. Cho phép nhập trực tiếp ví dụ minh họa và có nút upload File âm thanh/hình ảnh (`creator/media`).

### 4.4. Giao diện dành cho Quản trị viên (Admin Interface)
* **Dashboard Analytics:** Biểu đồ tròn biểu diễn tỷ lệ phân bố loại từ (Word Distribution). Biểu đồ cột biểu thị tần suất học tập toàn hệ thống.
* **Trang kiểm duyệt nội dung (Content Moderation Review):** Giao diện chia làm 2 cột: Cột trái hiển thị thông tin chi tiết nội dung cần duyệt (từ vựng, nghĩa, ví dụ, câu hỏi đính kèm). Cột phải là hộp thoại kiểm duyệt gồm Nút **Approve** (màu xanh lá) và **Reject** (màu đỏ). Khi chọn Reject, một trường nhập văn bản (Textarea) tự động hiện ra yêu cầu nhập lý do từ chối.

---

## 💻 PHẦN 3: THIẾT KẾ CƠ SỞ DỮ LIỆU & KIẾN TRÚC KỸ THUẬT (Dành cho Backend/DB)

### V. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)
* **5.1. Sơ đồ ERD:** Hệ thống bao gồm **14 bảng quan hệ** chặt chẽ để đảm bảo tính toàn vẹn dữ liệu.
* **5.2. Đặc tả chi tiết cấu trúc các bảng:**

#### 1. Bảng `Users`
* Lưu thông tin tài khoản người dùng hệ thống.
* *Các cột chính:* `UserID` (PK, int, identity), `FullName` (nvarchar(100)), `Email` (varchar(100), unique), `PasswordHash` (varchar(255)), `RoleID` (FK), `IsActive` (bit, default 1), `CreatedAt` (datetime).

#### 2. Bảng `Roles` & `Permissions` & `RolePermissions`
* Triển khai hệ thống phân quyền RBAC.
* *Roles:* `RoleID` (PK), `RoleName` (Learner, ContentCreator, Admin).
* *Permissions:* `PermissionID` (PK), `PermissionCode` (MANAGE_WORDS, MANAGE_QUESTIONS, VIEW_DASHBOARD...).
* *RolePermissions:* `RoleID` (FK), `PermissionID` (FK).

#### 3. Bảng `Words`
* Lưu thông tin cốt lõi của từ vựng.
* *Các cột chính:* `WordID` (PK), `Term` (nvarchar(100)), `Meaning` (nvarchar(255)), `Phonetic` (nvarchar(100)), `AudioURL` (varchar(500)), `ImageURL` (varchar(500)), `PartOfSpeechId` (FK), `CreatedBy` (FK Users), `Status` (nvarchar(20) - Draft/Pending/Published/Rejected).

#### 4. Bảng `PartOfSpeeches` & `Topics` & `TopicCategories`
* Phân loại từ vựng và chủ đề học tập.
* *Topics:* Có cột `Status` (Draft/Pending/Published/Rejected) để kiểm duyệt chủ đề.

#### 5. Bảng `ExampleSentences`
* Lưu câu ví dụ. Liên kết FK tới `Words` với thiết lập `ON DELETE CASCADE` (xóa từ vựng sẽ tự động xóa câu ví dụ tương ứng).

#### 6. Bảng `Questions`
* Ngân hàng câu hỏi.
* *Các cột chính:* `QuestionID` (PK), `WordID` (FK), `QuestionType` (MCQ, FillBlank, Dictation, FlashcardCheck), `QuestionText` (nvarchar(max)), `CorrectAnswer` (nvarchar(255)), `AnswerOptions` (nvarchar(max) - lưu mảng JSON các lựa chọn).

#### 7. Bảng `MiniTests` & `MiniTestItems`
* Quản lý đề thi ngắn. `MiniTestItems` lưu trữ ánh xạ nhiều-nhiều giữa đề thi và ngân hàng câu hỏi kèm theo cột `DisplayOrder` (thứ tự câu hỏi hiển thị).

#### 8. Bảng `ExerciseAttempts`
* Lưu lịch sử làm bài tập và làm bài thi thử của Học viên phục vụ chấm điểm và phân tích thống kê.

#### 9. Bảng `UserWordProgress`
* Bảng trung tâm điều phối thuật toán Spaced Repetition cho từng cặp (Học viên - Từ vựng).
* *Các cột chính:* `ProgressID` (PK), `UserID` (FK), `WordID` (FK), `MasteryLevel` (int, mức độ thuộc từ từ 1-5), `NextReviewDate` (datetime, thời gian hiển thị lại từ), `MemoryStatus` (nvarchar(20) - Learning/Mastered/Lapsed).

#### 10. Bảng `ContentReviewLogs`
* Nhật ký ghi nhận lịch sử duyệt bài của Admin. Lưu trữ `AdminID`, `TargetType` (Topic/Word/MiniTest), `TargetID`, `Action` (Approve/Reject), `Reason` (Lý do từ chối), `CreatedAt`.

* **5.3. Thiết kế Stored Procedures và Views nghiệp vụ:**
  * **Stored Procedure `usp_SubmitQuestionAttempt`:**
    * *Đầu vào:* `@UserID`, `@QuestionID`, `@SubmittedAnswer`.
    * *Logic xử lý:* So sánh `@SubmittedAnswer` với `CorrectAnswer` trong bảng `Questions`.
      * Ghi nhận lịch sử vào `ExerciseAttempts`.
      * Truy vấn trạng thái học tập cũ từ `UserWordProgress`. Nếu trả lời ĐÚNG: Tăng `MasteryLevel` lên 1 đơn vị (tối đa 5), tính toán dời ngày `NextReviewDate = CurrentDate + (MasteryLevel * 2 ngày)`. Nếu trả lời SAI: Đặt `MasteryLevel = 1` (học lại từ đầu), đặt `MemoryStatus = 'Lapsed'` và `NextReviewDate = CurrentDate` (hiển thị ôn tập ngay lập tức).
  * **View `vw_ContentCreatorContentSummary`:** Tổng hợp số liệu biên soạn (Số lượng từ, câu hỏi, chủ đề) nhóm theo từng Biên tập viên.
  * **View `vw_TopicLearningAnalytics`:** Thống kê hiệu suất ghi nhớ trung bình của học viên theo từng Chủ đề.

### VI. KIẾN TRÚC KỸ THUẬT VÀ CÁC YÊU CẦU PHI CHỨC NĂNG
* **6.1. Kiến trúc phân tầng ứng dụng:**
  * **Presentation Layer:** Next.js (React Framework, TypeScript, TailwindCSS).
  * **API Service Layer:** RESTful API viết bằng Node.js / Express.js.
  * **Database Layer:** Microsoft SQL Server.
* **6.2. Giải pháp kỹ thuật nổi bật:**
  1. *Xác thực bảo mật:* Triển khai JWT không trạng thái (stateless Session). Kết hợp Middleware xác thực `verifyToken` và phân quyền RBAC dựa trên quyền lưu trữ trong JWT. Thiết lập kiểm tra generic ownership (chỉ Creator tạo ra nội dung mới có quyền sửa nội dung đó ở trạng thái Draft).
  2. *Kiểm soát dữ liệu bằng Zod:* Đảm bảo tính toàn vẹn dữ liệu ngay từ cổng vào API. Mọi request body đều đi qua middleware validator của Zod trước khi vào Controller.
  3. *Tối ưu kết nối Database:* Áp dụng mẫu thiết kế **Singleton** để khởi tạo duy nhất một `ConnectionPool` kết nối SQL Server, tái sử dụng kết nối, ngăn chặn rò rỉ bộ nhớ (connection leaks).
* **6.3. Yêu cầu phi chức năng:**
  * *Bảo mật:* Băm mật khẩu người dùng bằng thuật toán mạnh `Bcrypt` trước khi lưu vào DB. Chống SQL Injection bằng cách sử dụng Parameterized Queries hoặc Prepared Statements trong Express.js.
  * *Hiệu năng:* Phân trang API đầu ra (`page`, `limit`) cho danh sách từ vựng dài. Tối ưu index các cột thường xuyên tìm kiếm và liên kết bảng như `Email`, `NextReviewDate`, `UserID`, `WordID`.
* **6.4. Kế hoạch kiểm thử:**
  * *Kiểm thử đơn vị (Unit Test):* Kiểm thử các hàm tính toán thuật toán Spaced Repetition, kiểm tra tính đúng đắn của logic chấm bài.
  * *Kiểm thử tích hợp (Integration Test):* Mô phỏng luồng Creator gửi bài $\rightarrow$ Admin từ chối duyệt $\rightarrow$ Creator chỉnh sửa và gửi lại $\rightarrow$ Admin chấp thuận $\rightarrow$ Học viên nhận được từ mới.

---

## 🚀 HƯỚNG DẪN RÁP BÁO CÁO VÀO MẪU WORD

1. **Bước 1:** Thành viên BA/PM mở file `Baocao_CNPM.docx`, sao chép cấu trúc mục lục từ `MucLuc_BaoCao_CNPM.md`.
2. **Bước 2:** Mỗi thành viên phụ trách phần của mình (như đã chia ở trên), sử dụng thông tin phác thảo chi tiết trong tài liệu này để điền vào các mục tương ứng trong Word.
3. **Bước 3:** Chèn các hình vẽ thiết kế:
   * BA chèn sơ đồ FDD và sơ đồ Use-case vẽ bằng công cụ Draw.io (đã có sẵn file thiết kế `.drawio` trong thư mục `document/`).
   * Frontend chụp ảnh giao diện thực tế của ứng dụng VocaBoost để chèn vào phần IV.
   * Backend xuất sơ đồ database ERD từ SQL Server hoặc vẽ lại bằng Draw.io để chèn vào phần V.
4. **Bước 4:** Rà soát định dạng Word (Font chữ Times New Roman, cỡ chữ 13, giãn dòng 1.5 line, căn lề chuẩn) và xuất bản báo cáo.
