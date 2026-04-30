# Tài liệu Quy trình Nghiệp vụ
# TOEIC Vocabulary Learning Platform

---

## 1. Tổng quan Hệ thống

TOEIC Vocabulary Learning Platform là nền tảng học từ vựng thông minh, giải quyết bài toán "học trước quên sau" bằng cách kết hợp nội dung đa phương tiện với thuật toán lặp lại ngắt quãng (Spaced Repetition). Hệ thống phục vụ 3 nhóm tác nhân: **Learner** (Người học), **Content Creator** (Biên tập viên nội dung) và **Admin** (Quản trị viên), mỗi nhóm có luồng nghiệp vụ riêng biệt nhưng liên kết chặt chẽ với nhau.

---

## 2. Sơ đồ Tổng thể Luồng Nghiệp vụ

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOEIC VOCABULARY PLATFORM                        │
│                                                                     │
│  [Content Creator]──────► Tạo Nội dung ──────► Ngân hàng Từ vựng  │
│                                │                       │            │
│                                ▼                       ▼            │
│  [Admin]────────────► Quản lý & Cấu hình    Ngân hàng Câu hỏi     │
│                                │                       │            │
│                                ▼                       ▼            │
│  [Learner]──────────► Học tập & Luyện tập ◄──── Spaced Repetition  │
│                                │                                    │
│                                ▼                                    │
│                      Báo cáo Tiến độ                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Quy trình Nghiệp vụ theo Tác nhân

---

### 3.1 Biên tập viên Nội dung (Content Creator)

**Mục tiêu:** Xây dựng và duy trì kho nội dung từ vựng đa phương tiện chất lượng cao.

#### BV-01: Quản lý Chủ đề (Topics)

```
[Content Creator]
    │
    ├─ 1. Tạo mới chủ đề (TopicName, TopicCode)
    │       VD: Economy / ECONOMY, Office / OFFICE
    │
    └─ 2. Gán từ vựng vào chủ đề (WordTopics)
            ▼
       [Bảng: Topics] ──M:N── [Bảng: WordTopics] ──M:N── [Bảng: Words]
```

**Ràng buộc dữ liệu:**
- `TopicName` và `TopicCode` phải là UNIQUE
- Một từ có thể thuộc nhiều chủ đề (M:N qua `WordTopics`)

---

#### BV-02: Tạo Từ vựng Đa phương tiện

```
[Content Creator]
    │
    ├─ 1. Nhập thông tin từ vựng:
    │       • Term (từ)
    │       • PartOfSpeechID (loại từ: n, v, adj, adv, prep)
    │       • Meaning (nghĩa tiếng Việt)
    │       • Phonetic (phiên âm IPA)
    │       • AudioUrlUK / AudioUrlUS (file âm thanh)
    │       • ImageUrl (hình ảnh minh họa)
    │       • DifficultyLevel (1–5)
    │
    ├─ 2. Thêm Câu ví dụ (ExampleSentences)
    │       • Câu ví dụ trong đề thi TOEIC thực tế
    │       • Bản dịch tiếng Việt
    │       • Audio câu (tuỳ chọn)
    │
    └─ 3. Phân loại vào Chủ đề (WordTopics)
            ▼
       [Bảng: Words] ──1:N── [Bảng: ExampleSentences]
```

---

#### BV-03: Soạn thảo Câu hỏi (Questions)

```
[Content Creator]
    │
    ├─ 1. Chọn từ vựng (WordID)
    │
    ├─ 2. Chọn dạng câu hỏi (QuestionType):
    │       • MCQ           → Trắc nghiệm 4 đáp án A/B/C/D
    │       • FillBlank     → Điền từ vào chỗ trống
    │       • DragDrop      → Kéo thả sắp xếp câu
    │       • Dictation     → Nghe viết lại từ
    │       • FlashcardCheck→ Tự đánh giá mức độ nhớ
    │
    ├─ 3. Nhập OptionsJson (JSON hợp lệ):
    │       Ví dụ MCQ:
    │       {
    │         "A": "economy",
    │         "B": "economic",
    │         "C": "economize",
    │         "D": "economist"
    │       }
    │       Ví dụ FillBlank:
    │       {
    │         "sentence": "The ___ report shows growth.",
    │         "hint": "Adjective form of economy"
    │       }
    │
    ├─ 4. Nhập CorrectAnswer và Explanation
    │
    └─ 5. Gán câu hỏi vào Mini-test (MiniTestItems)
            ▼
       [Bảng: Questions] ──CHECK ISJSON()=1── OptionsJson
```

---

#### BV-04: Tạo Mini-test

```
[Content Creator / Admin]
    │
    ├─ 1. Tạo bộ đề (MiniTests):
    │       • Liên kết với TopicID (tuỳ chọn)
    │       • Đặt tiêu đề, mô tả
    │       • IsPublished = 0 (bản nháp)
    │
    ├─ 2. Thêm câu hỏi (MiniTestItems):
    │       • Chọn QuestionID
    │       • Đặt DisplayOrder
    │
    ├─ 3. Xem trước và kiểm tra
    │
    └─ 4. Xuất bản: IsPublished = 1
            ▼
       [Bảng: MiniTests] ──M:N── [Bảng: MiniTestItems] ──> [Bảng: Questions]
```

---

### 3.2 Người học (Learner)

**Mục tiêu:** Học từ vựng hiệu quả, ghi nhớ sâu qua nhiều dạng bài, theo dõi tiến độ cá nhân.

#### BV-05: Đăng ký & Khởi tạo Hành trình Học tập

```
[Learner]
    │
    ├─ 1. Đăng ký tài khoản (UserRole = 'Learner')
    │
    ├─ 2. Chọn chủ đề muốn học (Topics)
    │
    ├─ 3. Hệ thống tạo bản ghi UserWordProgress
    │       • MemoryStatus = 'New'
    │       • MasteryLevel = 0
    │       • EaseFactor = 2.50 (mặc định)
    │       • NextReviewDate = NULL
    │
    └─ Sẵn sàng bắt đầu học
```

---

#### BV-06: Học Flashcard

```
[Learner]
    │
    ├─ 1. Chọn chủ đề hoặc danh sách từ
    │
    ├─ 2. Hệ thống truy vấn từ cần ôn:
    │       SELECT * FROM UserWordProgress
    │       WHERE UserID = @UserID
    │         AND (NextReviewDate <= SYSDATETIMEOFFSET()
    │              OR MemoryStatus = 'New')
    │
    ├─ 3. Hiển thị Flashcard:
    │       • Mặt trước: Từ (Term) + Phiên âm
    │       • Lật thẻ: Nghĩa + Câu ví dụ + Hình ảnh
    │       • Nút: Phát Audio UK / Audio US
    │
    ├─ 4. Người học tự đánh giá (FlashcardCheck):
    │       • "Nhớ được"  → IsCorrect = 1
    │       • "Chưa nhớ" → IsCorrect = 0
    │
    └─ 5. Gọi SP: usp_SubmitQuestionAttempt
            ▼
       Cập nhật MasteryLevel, EaseFactor, NextReviewDate
```

---

#### BV-07: Làm Bài tập Trắc nghiệm (Core Learning Loop)

```
[Learner]
    │
    ├─ 1. Chọn dạng bài (MCQ / FillBlank / DragDrop / Dictation)
    │
    ├─ 2. Hệ thống lấy câu hỏi:
    │       SELECT * FROM Questions WHERE WordID IN (danh sách từ cần ôn)
    │
    ├─ 3. Người học nộp câu trả lời
    │
    ├─ 4. Gọi SP: usp_SubmitQuestionAttempt(@UserID, @QuestionID, @Answer)
    │
    │   ┌─────────────────────────────────────────────────┐
    │   │  BEGIN TRANSACTION (ACID)                        │
    │   │                                                   │
    │   │  ① INSERT ExerciseAttempts (ghi log)             │
    │   │                                                   │
    │   │  ② Tính IsCorrect + ScoreAwarded                 │
    │   │                                                   │
    │   │  ③ Cập nhật UserWordProgress:                    │
    │   │     • MasteryLevel ↑ (đúng) / ↓ (sai)           │
    │   │     • EaseFactor   ↑ (đúng) / ↓ (sai)           │
    │   │     • ConsecutiveCorrect / ConsecutiveWrong       │
    │   │     • MemoryStatus: Learning/Reviewing/Mastered   │
    │   │                                                   │
    │   │  ④ Tính NextReviewDate (Spaced Repetition):      │
    │   │     Đúng:  interval = f(RepetitionCount, EaseFactor)│
    │   │     Sai:   NextReviewDate = NOW + 30 phút         │
    │   │                                                   │
    │   │  COMMIT / ROLLBACK                               │
    │   └─────────────────────────────────────────────────┘
    │
    └─ 5. Hiển thị kết quả: đúng/sai + giải thích (Explanation)
```

---

#### BV-08: Thuật toán Spaced Repetition (Chi tiết)

Hệ thống tự động lên lịch ôn tập dựa trên hiệu suất của người học:

```
Trạng thái MemoryStatus:

  New ──► Learning ──► Reviewing ──► Mastered
           │                │
           │                └──► Lapsed (trả về Learning)
           │
           └──► Lapsed (làm sai liên tục)

Công thức tính IntervalDays:
  RepetitionCount = 1  → 1 ngày
  RepetitionCount = 2  → 3 ngày
  RepetitionCount = 3  → 7 ngày
  RepetitionCount = 4  → 14 ngày
  RepetitionCount = 5  → 30 ngày
  RepetitionCount > 5  → RepetitionCount × EaseFactor × 10

Ngưỡng MasteryLevel:
  0–4   → MemoryStatus = 'Learning'
  5–7   → MemoryStatus = 'Reviewing'
  8–10  → MemoryStatus = 'Mastered'
  Làm sai → MemoryStatus = 'Lapsed', NextReviewDate = NOW + 30 phút
```

**Mapping sang bảng dữ liệu:**

| Cột (UserWordProgress) | Ý nghĩa | Thay đổi khi Đúng | Thay đổi khi Sai |
|---|---|---|---|
| `MasteryLevel` | Mức thuộc từ (0–10) | +1 (max 10) | -1 (min 0) |
| `EaseFactor` | Hệ số dễ (1.30–3.50) | +0.10 | -0.20 |
| `RepetitionCount` | Số lần ôn thành công | +1 | Reset = 0 |
| `ConsecutiveCorrect` | Chuỗi đúng liên tiếp | +1 | Reset = 0 |
| `ConsecutiveWrong` | Chuỗi sai liên tiếp | Reset = 0 | +1 |
| `MemoryStatus` | Trạng thái ghi nhớ | Tính lại | Lapsed |
| `NextReviewDate` | Lịch ôn tiếp theo | NOW + interval | NOW + 30 phút |

---

#### BV-09: Làm Mini-test

```
[Learner]
    │
    ├─ 1. Chọn Mini-test (theo Topic hoặc danh sách tổng hợp)
    │
    ├─ 2. Lấy danh sách câu hỏi:
    │       SELECT q.* FROM MiniTestItems mti
    │       JOIN Questions q ON mti.QuestionID = q.QuestionID
    │       WHERE mti.MiniTestID = @MiniTestID
    │       ORDER BY mti.DisplayOrder
    │
    ├─ 3. Làm lần lượt từng câu (gọi usp_SubmitQuestionAttempt cho mỗi câu)
    │
    ├─ 4. Xem kết quả tổng kết:
    │       • Điểm trung bình (AVG ScoreAwarded)
    │       • Số câu đúng / tổng số câu
    │       • Danh sách từ làm sai → ưu tiên ôn tập
    │
    └─ 5. UserWordProgress được cập nhật cho TẤT CẢ từ trong bài test
```

---

#### BV-10: Xem Báo cáo Tiến độ (Learning Dashboard)

```
[Learner]
    │
    ├─ Truy vấn UserWordProgress:
    │
    │   SELECT
    │     MemoryStatus,
    │     COUNT(*) AS WordCount,
    │     AVG(MasteryLevel) AS AvgMastery
    │   FROM UserWordProgress
    │   WHERE UserID = @UserID
    │   GROUP BY MemoryStatus
    │
    │   → Biểu đồ phân bố: New / Learning / Reviewing / Mastered / Lapsed
    │
    ├─ Truy vấn lịch sử học hàng ngày:
    │
    │   SELECT
    │     CAST(AttemptedAt AS DATE) AS StudyDate,
    │     COUNT(*) AS Attempts,
    │     SUM(CASE WHEN IsCorrect=1 THEN 1 ELSE 0 END) AS CorrectCount
    │   FROM ExerciseAttempts
    │   WHERE UserID = @UserID
    │   GROUP BY CAST(AttemptedAt AS DATE)
    │
    │   → Biểu đồ streak học tập theo ngày
    │
    └─ Truy vấn từ sắp đến hạn ôn:
        SELECT COUNT(*) FROM UserWordProgress
        WHERE UserID = @UserID
          AND NextReviewDate <= SYSDATETIMEOFFSET()
        → "Bạn có X từ cần ôn tập hôm nay"
```

---

### 3.3 Quản trị viên (Admin)

**Mục tiêu:** Vận hành hệ thống, quản lý nội dung, giám sát hiệu quả học tập toàn platform.

#### BV-11: Quản lý Tài khoản Người dùng

```
[Admin]
    │
    ├─ Xem danh sách Users (tất cả UserRole)
    ├─ Kích hoạt / Vô hiệu hoá tài khoản (IsActive = 0/1)
    ├─ Phân quyền: Learner → ContentCreator → Admin
    └─ Xem báo cáo tổng hợp tiến độ học tập của tất cả Learner
```

---

#### BV-12: Quản lý Ngân hàng Câu hỏi

```
[Admin]
    │
    ├─ Xem toàn bộ Questions (lọc theo WordID, QuestionType, DifficultyLevel)
    ├─ Chỉnh sửa / Xoá câu hỏi không đạt chất lượng
    ├─ Phê duyệt câu hỏi do Content Creator tạo
    └─ Thống kê tỷ lệ đúng/sai theo từng câu hỏi:
        SELECT q.QuestionID, q.QuestionText,
               COUNT(*) AS TotalAttempts,
               AVG(CAST(IsCorrect AS FLOAT))*100 AS CorrectRate
        FROM ExerciseAttempts ea JOIN Questions q ON ea.QuestionID = q.QuestionID
        GROUP BY q.QuestionID, q.QuestionText
        ORDER BY CorrectRate ASC  -- Câu hỏi khó nhất
```

---

#### BV-13: Cấu hình Hệ thống Nhắc nhở (Notification)

```
[Admin]
    │
    ├─ Truy vấn Learner có từ cần ôn hôm nay:
    │     SELECT DISTINCT UserID FROM UserWordProgress
    │     WHERE NextReviewDate <= SYSDATETIMEOFFSET()
    │
    ├─ Truy vấn Learner không học trong N ngày liên tiếp:
    │     SELECT u.UserID, u.Email, MAX(ea.AttemptedAt) AS LastStudy
    │     FROM Users u LEFT JOIN ExerciseAttempts ea ON u.UserID = ea.UserID
    │     WHERE u.UserRole = 'Learner'
    │     GROUP BY u.UserID, u.Email
    │     HAVING DATEDIFF(DAY, MAX(ea.AttemptedAt), SYSDATETIMEOFFSET()) >= N
    │
    └─ Kích hoạt gửi Email / Push Notification nhắc nhở học tập
```

---

#### BV-14: Xem Báo cáo Tổng thể Platform

```
[Admin]
    │
    ├─ Tổng số từ đã được học trên toàn hệ thống
    ├─ Phân bố MemoryStatus của tất cả người học
    ├─ Top từ vựng bị quên nhiều nhất (MemoryStatus = 'Lapsed' cao nhất)
    ├─ Mini-test có tỷ lệ hoàn thành thấp nhất
    └─ Thống kê nội dung:
        • Số từ theo từng chủ đề (Topics)
        • Số câu hỏi theo QuestionType
        • Câu hỏi thiếu audio / hình ảnh
```

---

## 4. Sơ đồ Luồng Dữ liệu Tổng hợp

```
Content Creator
    │
    ├──► Topics ◄──────────────────────────── MiniTests
    │       │                                      │
    │       └──────► WordTopics ◄────► Words       │
    │                                   │           │
    │                           ExampleSentences    │
    │                                   │           │
    │                              Questions ───────┘
    │                                   │         MiniTestItems
    │                                   │
    │                     ┌─────────────┴───────────────┐
    │                     ▼                             ▼
    │              [Learner học]               [Learner làm test]
    │                     │                             │
    │                     ▼                             ▼
    │           usp_SubmitQuestionAttempt ◄─────────────┘
    │                     │
    │         ┌───────────┴───────────┐
    │         ▼                       ▼
    │  ExerciseAttempts       UserWordProgress
    │  (Append-only log)      (Upsert + DATETIMEOFFSET)
    │                                 │
    │                    NextReviewDate (Spaced Repetition)
    │                                 │
    │         ┌───────────────────────┤
    │         ▼                       ▼
    │  Notification Engine     Learning Dashboard
    │  (Nhắc nhở học tập)      (Báo cáo tiến độ)
    │
    └──── [Admin giám sát toàn bộ]
```

---

## 5. Mapping Nghiệp vụ sang Schema Database

| Quy trình Nghiệp vụ | Bảng chính | Bảng liên quan | Stored Procedure |
|---|---|---|---|
| Tạo từ vựng | `Words` | `PartOfSpeeches`, `ExampleSentences` | — |
| Phân loại từ vào chủ đề | `WordTopics` | `Topics`, `Words` | — |
| Soạn câu hỏi | `Questions` | `Words` | — |
| Tạo bộ đề Mini-test | `MiniTests`, `MiniTestItems` | `Topics`, `Questions` | — |
| Học Flashcard | `UserWordProgress` | `Words`, `ExampleSentences` | `usp_SubmitQuestionAttempt` |
| Làm bài trắc nghiệm | `ExerciseAttempts` | `Questions`, `Words` | `usp_SubmitQuestionAttempt` |
| Tính lịch Spaced Rep | `UserWordProgress` | — | `usp_SubmitQuestionAttempt` |
| Xem tiến độ cá nhân | `UserWordProgress` | `ExerciseAttempts` | — |
| Quản lý tài khoản | `Users` | — | — |
| Nhắc nhở học tập | `UserWordProgress` | `Users` | — (Scheduled Job) |
| Báo cáo Admin | `ExerciseAttempts` | `UserWordProgress`, `Questions` | — |

---

## 6. Ràng buộc Nghiệp vụ Quan trọng

### 6.1 Tính toàn vẹn dữ liệu (Data Integrity)

- **UNIQUE(UserID, WordID)** trên `UserWordProgress`: mỗi người học chỉ có đúng một bản ghi tiến độ cho mỗi từ, tránh duplicate khi gọi đồng thời.
- **ISJSON(OptionsJson) = 1** trên `Questions`: đảm bảo metadata câu hỏi luôn là JSON hợp lệ bất kể dạng bài.
- **DATETIMEOFFSET** cho `NextReviewDate`, `CreatedAt`, `UpdatedAt`: chống sai lệch múi giờ khi người dùng học trên nhiều thiết bị, nhiều vùng địa lý.

### 6.2 Cascade Rules

| Hành động | Bảng Cha | Bảng Con | Rule |
|---|---|---|---|
| Xóa từ vựng | `Words` | `ExampleSentences`, `Questions`, `UserWordProgress`, `WordTopics` | CASCADE |
| Xóa người dùng | `Users` | `UserWordProgress`, `ExerciseAttempts` | CASCADE |
| Xóa chủ đề | `Topics` | `MiniTests.TopicID` | SET NULL |
| Xóa bộ đề | `MiniTests` | `MiniTestItems` | CASCADE |

### 6.3 ACID trong Stored Procedure

Quy trình "nộp câu trả lời" (`usp_SubmitQuestionAttempt`) phải đảm bảo:
- **Atomicity**: Ghi log + cập nhật tiến độ + tính NextReviewDate xảy ra cùng lúc hoặc không xảy ra gì cả.
- **Consistency**: EaseFactor không được nằm ngoài [1.30, 3.50]; MasteryLevel không được nằm ngoài [0, 10].
- **Isolation**: `UPDLOCK + HOLDLOCK` trên `UserWordProgress` chống race condition khi người học nộp bài đồng thời.
- **Durability**: `COMMIT TRAN` đảm bảo dữ liệu được ghi xuống đĩa, không mất khi hệ thống gặp sự cố.
