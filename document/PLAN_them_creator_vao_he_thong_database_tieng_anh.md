# PLAN: Thêm Creator / Content Creator vào hệ thống cho database tiếng Anh

## 1. Mục tiêu

Mục tiêu là bổ sung hoặc hoàn thiện nhóm người dùng **Creator / Content Creator / Teacher** trong hệ thống luyện tập từ vựng TOEIC đang dùng database tiếng Anh.

Trong database tiếng Anh, Creator nên được biểu diễn bằng role:

```text
ContentCreator
```

Tên hiển thị trên giao diện tiếng Việt có thể là:

```text
Biên tập viên / Giáo viên
```

Creator chịu trách nhiệm xây dựng nội dung học tập:

- Tạo và quản lý `TopicCategories`.
- Tạo và quản lý `Topics`.
- Tạo và quản lý `Words`.
- Tạo và quản lý `ExampleSentences`.
- Tạo và quản lý `Questions`.
- Tạo và quản lý `MiniTests`.
- Upload và liên kết media qua `MediaAssets`, `ContentMediaLinks`.
- Gửi nội dung chờ duyệt.
- Xem thống kê hiệu quả nội dung mình tạo.

---

## 2. Phạm vi áp dụng

Tài liệu này áp dụng cho bản database tiếng Anh có các bảng chính:

```text
Users
Roles
Permissions
RolePermissions
TopicCategories
Topics
PartOfSpeeches
Words
ExampleSentences
WordTopics
Questions
MiniTests
MiniTestItems
UserWordProgress
ExerciseAttempts
UserTopicEnrollments
UserVocabularyNotebook
ContentReviewLogs
MediaAssets
ContentMediaLinks
MiniTestAttempts
```

Các tên bảng, tên cột, enum và permission code trong database vẫn giữ tiếng Anh.

Frontend có thể hiển thị tiếng Việt, nhưng backend/database dùng tên tiếng Anh để khớp schema hiện tại.

---

## 3. Nguyên tắc thiết kế

## 3.1. Không tạo bảng tài khoản riêng cho Creator

Không tạo các bảng riêng kiểu:

```text
CreatorAccounts
TeacherAccounts
ContentCreatorUsers
```

Thay vào đó, dùng chung bảng:

```text
Users
```

và phân biệt bằng:

```text
Users.UserRole = 'ContentCreator'
Users.RoleID -> Roles.RoleID
```

Lý do:

- Learner, ContentCreator và Admin đều là user của hệ thống.
- Tất cả đều có thông tin đăng nhập giống nhau: email, password hash, trạng thái hoạt động.
- Dùng chung `Users` giúp authentication đơn giản.
- Phân quyền nên nằm ở `Roles`, `Permissions`, `RolePermissions`.
- Dễ mở rộng thêm role mới trong tương lai.

---

## 3.2. Creator là một role, không phải một loại tài khoản riêng

Mô hình đúng:

```text
Users
    -> Roles
        -> RolePermissions
            -> Permissions
```

Ví dụ:

```text
Users.Email = teacher@vocaboost.com
Users.UserRole = ContentCreator
Roles.RoleName = ContentCreator
Permissions = MANAGE_WORDS, MANAGE_QUESTIONS, MANAGE_TESTS, ...
```

---

## 4. Vai trò Creator trong hệ thống

## 4.1. Tên role

Trong database tiếng Anh dùng:

```text
ContentCreator
```

Không nên đổi thành tiếng Việt trong bản database tiếng Anh.

Frontend label:

```text
Biên tập viên / Giáo viên
```

---

## 4.2. Creator được phép làm gì?

| Chức năng | Permission đề xuất |
|---|---|
| Xem dashboard | `VIEW_DASHBOARD` |
| Quản lý danh mục chủ đề | `MANAGE_TOPIC_CATEGORIES` |
| Quản lý chủ đề | `MANAGE_TOPICS` |
| Quản lý từ vựng | `MANAGE_WORDS` |
| Quản lý câu hỏi | `MANAGE_QUESTIONS` |
| Quản lý mini test | `MANAGE_TESTS` |
| Quản lý media | `MANAGE_MEDIA` |
| Gửi nội dung chờ duyệt | `SUBMIT_CONTENT_REVIEW` |
| Xem phân tích nội dung của mình | `VIEW_CONTENT_ANALYTICS` |
| Preview nội dung học | `LEARN_VOCAB` |

---

## 4.3. Creator không nên được phép làm gì?

| Chức năng | Lý do |
|---|---|
| Quản lý user | Thuộc quyền Admin |
| Gán role/permission | Thuộc quyền Admin |
| Duyệt nội dung toàn hệ thống | Nên để Admin kiểm soát chất lượng |
| Xem analytics toàn cục | Thuộc quyền Admin |
| Khóa/mở khóa tài khoản | Thuộc quyền Admin |

Creator không nên có các permission:

```text
MANAGE_USERS
REVIEW_CONTENT
VIEW_GLOBAL_ANALYTICS
MANAGE_SYSTEM_SETTINGS
```

Trừ khi hệ thống muốn Creator kiêm nhiệm kiểm duyệt.

---

## 5. So sánh vai trò

| Chức năng | Learner | ContentCreator | Admin |
|---|---:|---:|---:|
| Đăng nhập | Có | Có | Có |
| Chọn topic học | Có | Có thể preview | Có |
| Học từ vựng | Có | Có thể preview | Có |
| Làm mini test | Có | Có thể preview | Có |
| Quản lý notebook | Có | Không bắt buộc | Không bắt buộc |
| Tạo topic category | Không | Có thể có | Có |
| Tạo topic | Không | Có | Có |
| Tạo word | Không | Có | Có |
| Tạo example sentence | Không | Có | Có |
| Tạo question | Không | Có | Có |
| Tạo mini test | Không | Có | Có |
| Upload media | Không | Có | Có |
| Gửi duyệt nội dung | Không | Có | Có |
| Duyệt nội dung | Không | Không nên | Có |
| Quản lý user | Không | Không | Có |
| Xem analytics nội dung của mình | Không | Có | Có |
| Xem analytics toàn cục | Không | Không | Có |

---

## 6. Thay đổi database cần có

## 6.1. Kiểm tra role `ContentCreator`

Database cần có role:

```sql
SELECT *
FROM dbo.Roles
WHERE RoleName = N'ContentCreator';
```

Nếu chưa có thì thêm:

```sql
IF NOT EXISTS (
    SELECT 1 FROM dbo.Roles WHERE RoleName = N'ContentCreator'
)
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES (N'ContentCreator', N'Biên tập viên / Giáo viên quản lý nội dung học tập');
END;
GO
```

---

## 6.2. Kiểm tra permission cho Creator

Các permission nên có:

```text
VIEW_DASHBOARD
LEARN_VOCAB
MANAGE_TOPIC_CATEGORIES
MANAGE_TOPICS
MANAGE_WORDS
MANAGE_QUESTIONS
MANAGE_TESTS
MANAGE_MEDIA
SUBMIT_CONTENT_REVIEW
VIEW_CONTENT_ANALYTICS
```

SQL bổ sung permission nếu thiếu:

```sql
INSERT INTO dbo.Permissions (PermissionCode, Description)
SELECT v.PermissionCode, v.Description
FROM (
    VALUES
    (N'VIEW_DASHBOARD', N'Xem dashboard'),
    (N'LEARN_VOCAB', N'Học / preview từ vựng'),
    (N'MANAGE_TOPIC_CATEGORIES', N'Quản lý danh mục chủ đề'),
    (N'MANAGE_TOPICS', N'Quản lý chủ đề'),
    (N'MANAGE_WORDS', N'Quản lý từ vựng'),
    (N'MANAGE_QUESTIONS', N'Quản lý câu hỏi'),
    (N'MANAGE_TESTS', N'Quản lý bài kiểm tra nhỏ'),
    (N'MANAGE_MEDIA', N'Quản lý audio và hình ảnh'),
    (N'SUBMIT_CONTENT_REVIEW', N'Gửi nội dung chờ duyệt'),
    (N'VIEW_CONTENT_ANALYTICS', N'Xem phân tích nội dung mình tạo')
) AS v(PermissionCode, Description)
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Permissions p
    WHERE p.PermissionCode = v.PermissionCode
);
GO
```

---

## 6.3. Gán permission cho role `ContentCreator`

```sql
DECLARE @ContentCreatorRoleID INT;

SELECT @ContentCreatorRoleID = RoleID
FROM dbo.Roles
WHERE RoleName = N'ContentCreator';

IF @ContentCreatorRoleID IS NULL
BEGIN
    THROW 51001, N'Role ContentCreator does not exist.', 1;
END;

INSERT INTO dbo.RolePermissions (RoleID, PermissionID)
SELECT @ContentCreatorRoleID, p.PermissionID
FROM dbo.Permissions p
WHERE p.PermissionCode IN (
    N'VIEW_DASHBOARD',
    N'LEARN_VOCAB',
    N'MANAGE_TOPIC_CATEGORIES',
    N'MANAGE_TOPICS',
    N'MANAGE_WORDS',
    N'MANAGE_QUESTIONS',
    N'MANAGE_TESTS',
    N'MANAGE_MEDIA',
    N'SUBMIT_CONTENT_REVIEW',
    N'VIEW_CONTENT_ANALYTICS'
)
AND NOT EXISTS (
    SELECT 1
    FROM dbo.RolePermissions rp
    WHERE rp.RoleID = @ContentCreatorRoleID
      AND rp.PermissionID = p.PermissionID
);
GO
```

---

## 6.4. Cập nhật user thành Creator

Nếu đã có tài khoản giáo viên nhưng đang là Learner, cập nhật như sau:

```sql
DECLARE @ContentCreatorRoleID INT;

SELECT @ContentCreatorRoleID = RoleID
FROM dbo.Roles
WHERE RoleName = N'ContentCreator';

UPDATE dbo.Users
SET UserRole = N'ContentCreator',
    RoleID = @ContentCreatorRoleID,
    UpdatedAt = SYSDATETIMEOFFSET()
WHERE Email = N'teacher@example.com';
GO
```

Nếu muốn tạo user Creator mẫu:

```sql
DECLARE @ContentCreatorRoleID INT;

SELECT @ContentCreatorRoleID = RoleID
FROM dbo.Roles
WHERE RoleName = N'ContentCreator';

IF NOT EXISTS (
    SELECT 1 FROM dbo.Users WHERE Email = N'teacher@vocaboost.com'
)
BEGIN
    INSERT INTO dbo.Users
    (
        FullName,
        Email,
        PasswordHash,
        UserRole,
        RoleID,
        IsActive
    )
    VALUES
    (
        N'Content Creator Teacher',
        N'teacher@vocaboost.com',
        N'CHANGE_ME_HASH',
        N'ContentCreator',
        @ContentCreatorRoleID,
        1
    );
END;
GO
```

---

## 7. Các bảng nội dung Creator sẽ thao tác

## 7.1. `TopicCategories`

Creator dùng bảng này để tạo nhóm chủ đề lớn.

Ví dụ:

```text
Business English
Travel English
TOEIC Skills
Daily Life
```

Quan hệ chính:

```text
TopicCategories.TopicCategoryID -> Topics.TopicCategoryID
```

Khuyến nghị:

- Nếu muốn kiểm soát chặt, chỉ Admin được quản lý `TopicCategories`.
- Nếu muốn Creator chủ động xây dựng nội dung, cho Creator quyền `MANAGE_TOPIC_CATEGORIES`.

---

## 7.2. `Topics`

Creator dùng bảng này để tạo bộ từ vựng theo chủ đề.

Ví dụ:

```text
Economy
Office
Airport
Hotel
```

Các cột cần quan tâm:

```text
TopicID
TopicCategoryID
TopicName
TopicCode
Description
CreatedByUserID
ContentStatus
ReviewedByUserID
ReviewedAt
PublishedAt
```

Quan hệ chính:

```text
Topics.TopicCategoryID -> TopicCategories.TopicCategoryID
Topics.CreatedByUserID -> Users.UserID
```

---

## 7.3. `Words`

Creator dùng bảng này để tạo từ vựng.

Các cột cần quan tâm:

```text
WordID
WordText
VietnameseMeaning
Pronunciation
PartOfSpeechID
AudioUrlUK
AudioUrlUS
ImageUrl
DifficultyLevel
CreatedByUserID
ContentStatus
```

Quan hệ chính:

```text
Words.PartOfSpeechID -> PartOfSpeeches.PartOfSpeechID
Words.CreatedByUserID -> Users.UserID
Words.WordID -> ExampleSentences.WordID
Words.WordID -> Questions.WordID
Words.WordID -> WordTopics.WordID
```

---

## 7.4. `ExampleSentences`

Creator dùng bảng này để thêm câu ví dụ cho từ vựng.

Quan hệ chính:

```text
ExampleSentences.WordID -> Words.WordID
```

Mục đích:

- Giúp Learner hiểu từ trong ngữ cảnh.
- Có thể gắn audio qua `AudioUrl` hoặc qua `MediaAssets` + `ContentMediaLinks`.

---

## 7.5. `WordTopics`

Creator dùng bảng này để gắn từ vựng vào chủ đề.

Quan hệ chính:

```text
WordTopics.WordID -> Words.WordID
WordTopics.TopicID -> Topics.TopicID
```

Mục đích:

- Một word có thể thuộc nhiều topic.
- Một topic có nhiều word.

Ví dụ:

```text
reservation -> Travel
reservation -> Business English
```

---

## 7.6. `Questions`

Creator dùng bảng này để tạo câu hỏi luyện tập.

Các cột cần quan tâm:

```text
QuestionID
WordID
QuestionType
QuestionText
OptionsJson
CorrectAnswer
Explanation
DifficultyLevel
CreatedByUserID
ContentStatus
```

Quan hệ chính:

```text
Questions.WordID -> Words.WordID
Questions.CreatedByUserID -> Users.UserID
Questions.QuestionID -> MiniTestItems.QuestionID
Questions.QuestionID -> ExerciseAttempts.QuestionID
```

---

## 7.7. `MiniTests`

Creator dùng bảng này để tạo bài kiểm tra nhỏ.

Các cột cần quan tâm:

```text
MiniTestID
TopicID
TestTitle
Description
CreatedByUserID
TotalQuestions
IsPublished
ContentStatus
```

Quan hệ chính:

```text
MiniTests.TopicID -> Topics.TopicID
MiniTests.CreatedByUserID -> Users.UserID
MiniTests.MiniTestID -> MiniTestItems.MiniTestID
MiniTests.MiniTestID -> MiniTestAttempts.MiniTestID
```

---

## 7.8. `MiniTestItems`

Creator dùng bảng này để gắn câu hỏi vào mini test.

Quan hệ chính:

```text
MiniTestItems.MiniTestID -> MiniTests.MiniTestID
MiniTestItems.QuestionID -> Questions.QuestionID
```

Mục đích:

- Một mini test có nhiều questions.
- Một question có thể xuất hiện trong nhiều mini tests.
- `DisplayOrder` quyết định thứ tự câu hỏi.

---

## 7.9. `MediaAssets`

Creator dùng bảng này để upload audio/hình ảnh.

Các loại media:

```text
AudioUK
AudioUS
Image
ExampleAudio
QuestionAudio
QuestionImage
```

Quan hệ chính:

```text
MediaAssets.UploadedByUserID -> Users.UserID
MediaAssets.MediaAssetID -> ContentMediaLinks.MediaAssetID
```

---

## 7.10. `ContentMediaLinks`

Creator dùng bảng này để gắn media vào nội dung.

Quan hệ chính:

```text
ContentMediaLinks.MediaAssetID -> MediaAssets.MediaAssetID
```

Liên kết logic qua:

```text
EntityType
EntityID
```

Ví dụ:

```text
EntityType = Word
EntityID = 10
MediaAssetID = 5
```

Nghĩa là file media ID 5 được gắn vào word ID 10.

---

## 8. Workflow nội dung cho Creator

Các bảng nội dung nên dùng `ContentStatus`:

```text
Draft
PendingReview
Published
Rejected
Archived
```

Ý nghĩa:

| Trạng thái | Ý nghĩa |
|---|---|
| `Draft` | Creator đang soạn nội dung |
| `PendingReview` | Creator đã gửi Admin duyệt |
| `Published` | Nội dung đã được duyệt và hiển thị cho Learner |
| `Rejected` | Nội dung bị từ chối, cần sửa |
| `Archived` | Nội dung ngừng sử dụng nhưng giữ lịch sử |

---

## 9. Luồng nghiệp vụ Creator

## 9.1. Luồng tạo nội dung

```text
Creator đăng nhập
    -> Vào dashboard Creator
        -> Tạo TopicCategory
            -> Tạo Topic
                -> Tạo Word
                    -> Thêm ExampleSentence
                        -> Tạo Question
                            -> Tạo MiniTest
                                -> Gắn Question vào MiniTest
                                    -> Gửi duyệt
                                        -> Admin duyệt
                                            -> Learner nhìn thấy nội dung
```

---

## 9.2. Luồng gửi duyệt

```text
Creator hoàn thiện nội dung
    -> Bấm Submit for Review
        -> Hệ thống đổi ContentStatus = PendingReview
            -> Ghi log vào ContentReviewLogs
                -> Admin thấy nội dung trong hàng chờ duyệt
```

---

## 9.3. Luồng nội dung bị từ chối

```text
Admin reject nội dung
    -> ContentStatus = Rejected
        -> ContentReviewLogs lưu lý do
            -> Creator xem lý do
                -> Creator sửa nội dung
                    -> Creator gửi duyệt lại
```

---

## 9.4. Luồng xuất bản

```text
Admin approve nội dung
    -> ContentStatus = Published
        -> PublishedAt = thời điểm duyệt
            -> ReviewedByUserID = Admin.UserID
                -> Nội dung hiển thị cho Learner
```

---

## 10. Rule ownership cho Creator

Creator nên chỉ thao tác với nội dung do mình tạo.

Các bảng cần kiểm tra ownership:

```text
Topics.CreatedByUserID
Words.CreatedByUserID
Questions.CreatedByUserID
MiniTests.CreatedByUserID
MediaAssets.UploadedByUserID
```

Rule backend:

```text
Nếu current user là Admin:
    Cho phép thao tác toàn bộ

Nếu current user là ContentCreator:
    Chỉ cho phép thao tác khi record.CreatedByUserID = currentUser.UserID
    hoặc record.UploadedByUserID = currentUser.UserID

Nếu current user là Learner:
    Không cho phép thao tác quản lý nội dung
```

---

## 11. API backend cần có

## 11.1. API authentication

Không cần API login riêng cho Creator.

Creator dùng chung:

```text
POST /api/auth/login
```

Response nên có:

```json
{
  "userID": 10,
  "email": "teacher@vocaboost.com",
  "userRole": "ContentCreator",
  "permissions": [
    "MANAGE_TOPICS",
    "MANAGE_WORDS",
    "MANAGE_QUESTIONS",
    "MANAGE_TESTS"
  ]
}
```

---

## 11.2. API Creator dashboard

```text
GET /api/creator/dashboard
GET /api/creator/content-summary
GET /api/creator/topics/:id/analytics
GET /api/creator/mini-tests/:id/analytics
```

---

## 11.3. API quản lý TopicCategories

```text
GET    /api/topic-categories
POST   /api/topic-categories
PUT    /api/topic-categories/:id
DELETE /api/topic-categories/:id
```

Permission:

```text
MANAGE_TOPIC_CATEGORIES
```

---

## 11.4. API quản lý Topics

```text
GET    /api/topics
POST   /api/topics
PUT    /api/topics/:id
DELETE /api/topics/:id
POST   /api/topics/:id/submit-review
```

Permission:

```text
MANAGE_TOPICS
SUBMIT_CONTENT_REVIEW
```

---

## 11.5. API quản lý Words

```text
GET    /api/words
POST   /api/words
PUT    /api/words/:id
DELETE /api/words/:id
POST   /api/words/:id/submit-review
```

Permission:

```text
MANAGE_WORDS
SUBMIT_CONTENT_REVIEW
```

---

## 11.6. API quản lý Questions

```text
GET    /api/questions
POST   /api/questions
PUT    /api/questions/:id
DELETE /api/questions/:id
POST   /api/questions/:id/submit-review
```

Permission:

```text
MANAGE_QUESTIONS
SUBMIT_CONTENT_REVIEW
```

---

## 11.7. API quản lý MiniTests

```text
GET    /api/mini-tests
POST   /api/mini-tests
PUT    /api/mini-tests/:id
DELETE /api/mini-tests/:id
POST   /api/mini-tests/:id/items
DELETE /api/mini-tests/:id/items/:questionId
POST   /api/mini-tests/:id/submit-review
```

Permission:

```text
MANAGE_TESTS
SUBMIT_CONTENT_REVIEW
```

---

## 11.8. API quản lý Media

```text
GET    /api/media-assets
POST   /api/media-assets/upload
DELETE /api/media-assets/:id
POST   /api/media-assets/:id/link
DELETE /api/content-media-links/:id
```

Permission:

```text
MANAGE_MEDIA
```

---

## 11.9. API Admin duyệt nội dung

```text
GET  /api/admin/content-review/pending
POST /api/admin/content-review/:entityType/:entityId/approve
POST /api/admin/content-review/:entityType/:entityId/reject
POST /api/admin/content-review/:entityType/:entityId/archive
```

Permission:

```text
REVIEW_CONTENT
```

---

## 12. Frontend cần thêm

## 12.1. Dashboard Creator

Menu gợi ý:

```text
Creator Dashboard
Topic Categories
Topics
Words
Example Sentences
Questions
Mini Tests
Media Assets
My Drafts
Pending Review
Rejected Content
Content Analytics
```

Label tiếng Việt có thể hiển thị:

```text
Dashboard biên tập viên
Danh mục chủ đề
Chủ đề
Từ vựng
Câu ví dụ
Câu hỏi
Bài kiểm tra nhỏ
Media
Bản nháp của tôi
Đang chờ duyệt
Nội dung bị từ chối
Thống kê nội dung
```

---

## 12.2. Ẩn/hiện menu theo permission

Frontend nên kiểm tra permission thay vì hard-code role.

Ví dụ:

```text
Có MANAGE_WORDS -> hiện menu Words
Có MANAGE_QUESTIONS -> hiện menu Questions
Có MANAGE_TESTS -> hiện menu Mini Tests
Có REVIEW_CONTENT -> hiện menu Admin Review
```

---

## 12.3. Form Creator cần có

### TopicCategory form

Field:

```text
CategoryName
CategoryCode
Description
IconUrl
DisplayOrder
IsActive
```

### Topic form

Field:

```text
TopicCategoryID
TopicName
TopicCode
Description
DisplayOrder
ContentStatus
```

### Word form

Field:

```text
WordText
VietnameseMeaning
Pronunciation
PartOfSpeechID
AudioUrlUK
AudioUrlUS
ImageUrl
DifficultyLevel
TopicIDs
ContentStatus
```

### ExampleSentence form

Field:

```text
WordID
SentenceText
VietnameseTranslation
AudioUrl
```

### Question form

Field:

```text
WordID
QuestionType
QuestionText
OptionsJson
CorrectAnswer
Explanation
DifficultyLevel
ContentStatus
```

### MiniTest form

Field:

```text
TopicID
TestTitle
Description
TotalQuestions
QuestionIDs
DisplayOrder
IsPublished
ContentStatus
```

### Media form

Field:

```text
MediaType
FileUrl
FileName
MimeType
FileSizeBytes
AltText
Transcript
EntityType
EntityID
Purpose
DisplayOrder
```

---

## 13. View báo cáo nên dùng cho Creator

## 13.1. `vw_ContentCreatorContentSummary`

Dùng để hiển thị tổng quan nội dung do từng Creator tạo.

Creator chỉ nên xem dòng của chính mình:

```sql
SELECT *
FROM dbo.vw_ContentCreatorContentSummary
WHERE UserID = @CurrentUserID;
```

Admin có thể xem toàn bộ:

```sql
SELECT *
FROM dbo.vw_ContentCreatorContentSummary;
```

---

## 13.2. `vw_TopicLearningAnalytics`

Creator có thể xem hiệu quả học tập của topic do mình tạo.

Rule:

```sql
SELECT a.*
FROM dbo.vw_TopicLearningAnalytics a
JOIN dbo.Topics t ON t.TopicID = a.TopicID
WHERE t.CreatedByUserID = @CurrentUserID;
```

Admin xem toàn bộ.

---

## 13.3. `vw_MiniTestAnalytics`

Creator có thể xem hiệu quả mini test do mình tạo.

Rule:

```sql
SELECT a.*
FROM dbo.vw_MiniTestAnalytics a
JOIN dbo.MiniTests mt ON mt.MiniTestID = a.MiniTestID
WHERE mt.CreatedByUserID = @CurrentUserID;
```

---

## 14. Checklist database

- [ ] Có role `ContentCreator` trong `Roles`.
- [ ] Có permissions cần thiết trong `Permissions`.
- [ ] `RolePermissions` đã gán quyền cho `ContentCreator`.
- [ ] `Users.UserRole` hỗ trợ giá trị `ContentCreator`.
- [ ] User Creator có `RoleID` trỏ đúng về role `ContentCreator`.
- [ ] `Topics` có `CreatedByUserID`.
- [ ] `Words` có `CreatedByUserID`.
- [ ] `Questions` có `CreatedByUserID`.
- [ ] `MiniTests` có `CreatedByUserID`.
- [ ] `MediaAssets` có `UploadedByUserID`.
- [ ] Các bảng nội dung có `ContentStatus` nếu cần workflow duyệt.
- [ ] Có bảng `ContentReviewLogs` để ghi lịch sử duyệt.
- [ ] Có view `vw_ContentCreatorContentSummary` để thống kê nội dung Creator.

---

## 15. Checklist backend

- [ ] Login trả về `UserID`, `UserRole`, `RoleID`, `Permissions`.
- [ ] Middleware kiểm tra permission hoạt động.
- [ ] API Creator chỉ cho phép Creator/Admin truy cập.
- [ ] Creator không gọi được API quản lý user.
- [ ] Creator không gọi được API duyệt nội dung nếu không có `REVIEW_CONTENT`.
- [ ] Creator chỉ sửa được nội dung của mình.
- [ ] Admin sửa/duyệt được toàn bộ nội dung.
- [ ] API Learner chỉ lấy nội dung `Published`.
- [ ] API analytics Creator filter theo `CreatedByUserID`.

---

## 16. Checklist frontend

- [ ] Creator đăng nhập thấy dashboard Creator.
- [ ] Sidebar hiển thị theo permission.
- [ ] Có màn quản lý TopicCategories nếu Creator được quyền.
- [ ] Có màn quản lý Topics.
- [ ] Có màn quản lý Words.
- [ ] Có màn quản lý ExampleSentences.
- [ ] Có màn quản lý Questions.
- [ ] Có màn quản lý MiniTests.
- [ ] Có màn quản lý MediaAssets.
- [ ] Có nút Submit Review.
- [ ] Có trạng thái Draft / PendingReview / Published / Rejected / Archived.
- [ ] Có màn xem nội dung bị từ chối và lý do.
- [ ] Có màn Content Analytics cho Creator.
- [ ] Không hiện menu Manage Users cho Creator.
- [ ] Không hiện menu Global Analytics cho Creator.

---

## 17. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
|---|---|
| Creator nhìn thấy nội dung của Creator khác | Filter theo `CreatedByUserID` |
| Creator sửa nội dung của người khác | Thêm ownership rule ở backend |
| Learner thấy nội dung chưa duyệt | API học tập chỉ lấy `ContentStatus = 'Published'` |
| Creator có quyền Admin | Kiểm tra lại `RolePermissions` |
| Frontend hiển thị sai menu | Render menu theo permission |
| Permission bị hard-code | Dùng middleware `requirePermission()` |
| MiniTest đã publish nhưng Questions chưa publish | Khi publish MiniTest, kiểm tra toàn bộ questions đã `Published` |
| Topic đã publish nhưng Words chưa publish | API Learner chỉ lấy Words `Published` |

---

## 18. Quy trình triển khai đề xuất

## Phase 1: Database

1. Kiểm tra role `ContentCreator`.
2. Bổ sung permission còn thiếu.
3. Gán permission cho role `ContentCreator`.
4. Tạo hoặc cập nhật user Creator.
5. Kiểm tra các bảng nội dung có `CreatedByUserID`.
6. Kiểm tra workflow `ContentStatus`.
7. Kiểm tra `ContentReviewLogs`.
8. Kiểm tra view analytics cho Creator.

## Phase 2: Backend

1. Cập nhật login response có permissions.
2. Thêm middleware `requirePermission()`.
3. Thêm middleware kiểm tra ownership.
4. Thêm API quản lý content cho Creator.
5. Thêm API submit review.
6. Thêm API analytics Creator.
7. Chặn Creator khỏi API Admin.

## Phase 3: Frontend

1. Thêm Creator layout.
2. Thêm Creator sidebar.
3. Thêm CRUD content.
4. Thêm media upload.
5. Thêm submit review.
6. Thêm rejected content page.
7. Thêm creator analytics page.

## Phase 4: Admin review

1. Thêm danh sách nội dung chờ duyệt.
2. Thêm approve/reject/archive.
3. Ghi log vào `ContentReviewLogs`.
4. Hiển thị lịch sử duyệt.

## Phase 5: Testing

1. Test Learner.
2. Test Creator.
3. Test Admin.
4. Test permission.
5. Test ownership.
6. Test content workflow.
7. Test analytics.

---

## 19. Kết luận

Với bản database tiếng Anh, Creator nên được thêm bằng cách hoàn thiện role:

```text
ContentCreator
```

và gán permission quản lý nội dung tương ứng.

Không cần tạo bảng tài khoản riêng. Creator vẫn là một record trong `Users`, được phân biệt bằng `UserRole` và `RoleID`.

Mô hình chuẩn:

```text
Users
    -> Roles(ContentCreator)
        -> RolePermissions
            -> Permissions
```

Creator sẽ thao tác chính với:

```text
TopicCategories
Topics
Words
ExampleSentences
Questions
MiniTests
MediaAssets
ContentMediaLinks
ContentReviewLogs
```

Admin giữ vai trò kiểm soát chất lượng qua workflow:

```text
Draft -> PendingReview -> Published / Rejected / Archived
```

Learner chỉ nhìn thấy nội dung đã được xuất bản:

```text
ContentStatus = Published
```
