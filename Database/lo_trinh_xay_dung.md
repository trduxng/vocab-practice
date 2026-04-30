Dựa trên schema đã thiết kế và quy trình nghiệp vụ, đây là lộ trình xây dựng theo thứ tự ưu tiên — từ **nền tảng bắt buộc** đến **tính năng nâng cao**.

***

## Nguyên tắc ưu tiên

Ba tiêu chí quyết định thứ tự: **Dependency** (cái nào phải có trước thì cái kia mới chạy được), **Business Value** (tính năng nào tạo ra giá trị cốt lõi cho người dùng sớm nhất), và **Risk** (cái nào phức tạp nhất thì làm sớm để phát hiện vấn đề).

***

## Phase 1 — Nền tảng (Tuần 1–3)

**Mục tiêu:** Hệ thống có thể chạy được, người dùng đăng nhập và xem từ vựng.

### 1.1 Database & Infrastructure
Tạo toàn bộ schema T-SQL đã thiết kế theo đúng thứ tự dependency:

```
1. PartOfSpeeches   (không phụ thuộc gì)
2. Users            (không phụ thuộc gì)
3. Topics           (phụ thuộc Users)
4. Words            (phụ thuộc Users, PartOfSpeeches)
5. ExampleSentences (phụ thuộc Words)
6. WordTopics       (phụ thuộc Words, Topics)
7. Questions        (phụ thuộc Words, Users)
8. UserWordProgress (phụ thuộc Users, Words)
9. ExerciseAttempts (phụ thuộc Users, Questions, Words)
10. MiniTests       (phụ thuộc Topics, Users)
11. MiniTestItems   (phụ thuộc MiniTests, Questions)
```

### 1.2 Authentication API
- `POST /auth/register` — tạo user, hash password (bcrypt)
- `POST /auth/login` — trả về JWT chứa `UserID + UserRole`
- Middleware xác thực JWT cho tất cả endpoint phía sau

### 1.3 Seed Data
Insert dữ liệu mẫu để team có thể test ngay:
- 5 `PartOfSpeeches`
- 10 `Topics` (Economy, Office, Travel, Finance, HR...)
- 50–100 `Words` với đủ audio, ảnh, câu ví dụ
- 200+ `Questions` (mix MCQ + FillBlank)

**Lý do ưu tiên cao nhất:** Không có Phase 1, không có gì để xây tiếp.

***

## Phase 2 — Core Learning Loop (Tuần 4–7)

**Mục tiêu:** Người học có thể học và lưu tiến độ — đây là giá trị cốt lõi của toàn sản phẩm.

### 2.1 Content Creator Portal
| Tính năng | Bảng liên quan | Độ phức tạp |
|---|---|---|
| CRUD từ vựng + upload audio/ảnh | `Words`, `ExampleSentences` | Trung bình |
| Gán từ vào chủ đề | `WordTopics` | Thấp |
| Soạn câu hỏi với OptionsJson | `Questions` | Trung bình |

### 2.2 Flashcard Engine
- API lấy từ cần học: ưu tiên `MemoryStatus = 'New'` trước, rồi đến `NextReviewDate <= NOW`
- Hiển thị: Term → lật thẻ → Meaning + Phonetic + Audio + ExampleSentences
- Nút tự đánh giá: "Nhớ được" / "Chưa nhớ" → gọi `usp_SubmitQuestionAttempt`

### 2.3 Stored Procedure ACID
Đây là **rủi ro kỹ thuật cao nhất** — phải làm sớm và test kỹ:
- `usp_SubmitQuestionAttempt` đã có sẵn trong DDL
- Viết unit test cho tất cả nhánh: đúng/sai, race condition, rollback
- Test đặc biệt: 2 request đồng thời cùng `UserID + WordID` → chỉ được 1 INSERT vào `UserWordProgress`

### 2.4 Spaced Repetition Scheduler
- Sau mỗi lần nộp bài, `NextReviewDate` được tính và ghi vào `UserWordProgress`
- API "Từ cần ôn hôm nay": `WHERE NextReviewDate <= SYSDATETIMEOFFSET()`

**Lý do:** Đây là lý do hệ thống tồn tại — nếu Spaced Repetition không hoạt động đúng, toàn bộ sản phẩm mất giá trị.

***

## Phase 3 — Assessment & Reporting (Tuần 8–10)

**Mục tiêu:** Người học biết mình đang ở đâu, Admin biết hệ thống đang chạy thế nào.

### 3.1 Bài tập trắc nghiệm đa dạng
Xây lần lượt theo độ phức tạp tăng dần:

```
MCQ (dễ nhất)  →  FillBlank  →  DragDrop  →  Dictation (khó nhất)
```

Mỗi `QuestionType` cần một UI component riêng đọc `OptionsJson` theo cấu trúc tương ứng.

### 3.2 Mini-test
- API lấy câu hỏi theo `MiniTestID` + `DisplayOrder`
- Chạy tuần tự, gọi `usp_SubmitQuestionAttempt` cho mỗi câu
- Tổng kết cuối: điểm, danh sách từ sai → đẩy vào hàng ôn tập ưu tiên

### 3.3 Learning Dashboard
Ba truy vấn cần thiết:

```sql
-- Widget 1: Phân bố trạng thái ghi nhớ
SELECT MemoryStatus, COUNT(*) AS WordCount
FROM UserWordProgress WHERE UserID = @UserID
GROUP BY MemoryStatus;

-- Widget 2: Streak học tập theo ngày
SELECT CAST(AttemptedAt AS DATE) AS StudyDate,
       COUNT(*) AS Attempts,
       SUM(CAST(IsCorrect AS INT)) AS CorrectCount
FROM ExerciseAttempts WHERE UserID = @UserID
GROUP BY CAST(AttemptedAt AS DATE);

-- Widget 3: Số từ cần ôn hôm nay
SELECT COUNT(*) FROM UserWordProgress
WHERE UserID = @UserID
  AND NextReviewDate <= SYSDATETIMEOFFSET();
```

***

## Phase 4 — Admin & Notification (Tuần 11–12)

**Mục tiêu:** Hệ thống tự vận hành, Admin không cần can thiệp thủ công mỗi ngày.

### 4.1 Admin Portal
- Quản lý `Users`: kích hoạt/vô hiệu hoá, đổi role
- Thống kê câu hỏi: tỷ lệ đúng/sai theo `QuestionID` → phát hiện câu hỏi quá khó/quá dễ
- Báo cáo nội dung: từ nào bị Lapsed nhiều nhất

### 4.2 Notification Engine
Chạy như một **Scheduled Job** (SQL Server Agent Job hoặc background service):

```
Mỗi ngày lúc 7:00 sáng:
  ① Truy vấn UserID có NextReviewDate <= NOW
  ② Truy vấn UserID không học trong 3 ngày
  ③ Gửi Email / Push Notification
```

***

## Phase 5 — Mở rộng (Sau tuần 12)

Các tính năng không bắt buộc nhưng tăng giá trị sản phẩm đáng kể:

| Tính năng | Mô tả | Bảng cần thêm |
|---|---|---|
| OAuth (Google login) | Đăng nhập bằng tài khoản Google | `ExternalLogins` |
| Achievement / Badge | Huy hiệu khi đạt mốc từ vựng | `Achievements`, `UserAchievements` |
| Leaderboard | Bảng xếp hạng theo chủ đề | Query tổng hợp `UserWordProgress` |
| Mở rộng IELTS / JLPT | Thêm chứng chỉ khác | Thêm cột `CertificateType` vào `Topics` |
| Spaced Rep nâng cao (SM-2) | Thuật toán SuperMemo chính thức | Sửa logic trong SP, không đổi schema |

***

## Tóm tắt lộ trình

```
Phase 1 (T1–3)   │ Schema + Auth + Seed data
Phase 2 (T4–7)   │ Flashcard + Spaced Repetition + ACID SP  ← ƯU TIÊN CAO NHẤT
Phase 3 (T8–10)  │ Bài tập + Mini-test + Dashboard
Phase 4 (T11–12) │ Admin portal + Notification
Phase 5 (T12+)   │ OAuth + Badge + Mở rộng chứng chỉ
```

**Điểm mấu chốt:** Phase 2 là trọng tâm — nếu Flashcard và `usp_SubmitQuestionAttempt` chạy đúng và ổn định, phần còn lại chỉ là xây thêm tính năng trên nền đã vững.