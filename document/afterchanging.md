Việc thêm **Creator / Content Creator / Biên tập viên / Giáo viên** sẽ **không làm thay đổi bản chất của Learner và Admin**, nhưng sẽ làm rõ lại quyền, luồng nghiệp vụ và phạm vi trách nhiệm của 2 nhóm này.

Nói ngắn gọn:

```text
Trước khi thêm Creator:
Admin vừa quản lý hệ thống, vừa có thể phải quản lý nội dung.
Learner chỉ học nội dung có sẵn.

Sau khi thêm Creator:
Creator chịu trách nhiệm tạo nội dung.
Admin chuyển sang vai trò kiểm soát, duyệt, giám sát.
Learner chỉ học nội dung đã được Creator tạo và Admin duyệt.
```

---

# 1. Ảnh hưởng đến Learner

## 1.1. Learner không bị mất chức năng cũ

Các chức năng cũ của Learner vẫn giữ nguyên:

```text
- Đăng ký / đăng nhập
- Xem danh mục chủ đề
- Chọn chủ đề học
- Học từ vựng
- Làm câu hỏi luyện tập
- Làm mini test
- Xem tiến độ học
- Quản lý sổ tay từ vựng cá nhân
```

Việc thêm Creator chủ yếu làm cho **nguồn nội dung của Learner có quy trình rõ hơn**.

---

## 1.2. Learner chỉ thấy nội dung đã xuất bản

Đây là thay đổi quan trọng nhất.

Trước đây Learner có thể lấy trực tiếp từ:

```text
Topics
Words
Questions
MiniTests
```

Sau khi thêm Creator, backend nên lọc thêm:

```sql
ContentStatus = 'Published'
```

hoặc nếu dùng bản tiếng Việt:

```sql
TrangThaiNoiDung = 'DaXuatBan'
```

Ví dụ với database tiếng Anh:

```sql
SELECT *
FROM dbo.Words
WHERE ContentStatus = 'Published';
```

Learner **không được thấy** nội dung ở các trạng thái:

```text
Draft
PendingReview
Rejected
Archived
```

---

## 1.3. Learner học nội dung do Creator tạo

Luồng mới:

```text
Creator tạo nội dung
    → Admin duyệt
        → Nội dung Published
            → Learner nhìn thấy và học
```

Tức là Learner không cần biết ai tạo nội dung, nhưng dữ liệu học của Learner sẽ phụ thuộc vào nội dung đã được Creator/Admin xử lý.

---

## 1.4. Learner không được tạo/sửa nội dung

Sau khi có Creator, cần đảm bảo Learner không có các quyền:

```text
MANAGE_TOPICS
MANAGE_WORDS
MANAGE_QUESTIONS
MANAGE_TESTS
MANAGE_MEDIA
SUBMIT_CONTENT_REVIEW
REVIEW_CONTENT
VIEW_CONTENT_ANALYTICS
```

Learner chỉ nên có:

```text
VIEW_DASHBOARD
LEARN_VOCAB
ENROLL_TOPICS
MANAGE_NOTEBOOK
```

Nếu có permission table, Learner nên được gán như sau:

```text
Learner
    - VIEW_DASHBOARD
    - LEARN_VOCAB
    - ENROLL_TOPICS
    - MANAGE_NOTEBOOK
```

---

## 1.5. API của Learner cần sửa nhẹ

Các API học tập cần thêm điều kiện lọc nội dung đã xuất bản.

Ví dụ:

### Lấy danh sách topic cho Learner

```sql
SELECT *
FROM dbo.Topics
WHERE ContentStatus = 'Published';
```

### Lấy từ vựng theo topic

```sql
SELECT w.*
FROM dbo.Words w
JOIN dbo.WordTopics wt ON wt.WordID = w.WordID
WHERE wt.TopicID = @TopicID
  AND w.ContentStatus = 'Published';
```

### Lấy câu hỏi luyện tập

```sql
SELECT *
FROM dbo.Questions
WHERE WordID = @WordID
  AND ContentStatus = 'Published';
```

### Lấy mini test

```sql
SELECT *
FROM dbo.MiniTests
WHERE TopicID = @TopicID
  AND ContentStatus = 'Published'
  AND IsPublished = 1;
```

---

# 2. Ảnh hưởng đến Admin

## 2.1. Admin không còn phải trực tiếp tạo toàn bộ nội dung

Trước khi thêm Creator, Admin có thể đang kiêm luôn:

```text
- Quản lý từ vựng
- Quản lý câu hỏi
- Quản lý bài kiểm tra
- Quản lý chủ đề
```

Sau khi thêm Creator, Admin nên chuyển trọng tâm sang:

```text
- Quản lý người dùng
- Gán vai trò
- Phân quyền
- Duyệt nội dung
- Giám sát hệ thống
- Xem báo cáo toàn cục
```

Admin vẫn có thể tạo/sửa nội dung, nhưng đó không còn là nhiệm vụ chính.

---

## 2.2. Admin có thêm nhiệm vụ gán role Creator

Admin cần có chức năng:

```text
Chọn user
    → đổi role thành ContentCreator
```

Với database tiếng Anh:

```sql
UPDATE dbo.Users
SET UserRole = 'ContentCreator',
    RoleID = (
        SELECT RoleID
        FROM dbo.Roles
        WHERE RoleName = 'ContentCreator'
    )
WHERE UserID = @UserID;
```

Admin cần quản lý 3 loại user:

```text
Learner
ContentCreator
Admin
```

---

## 2.3. Admin có thêm nhiệm vụ duyệt nội dung

Đây là thay đổi lớn nhất cho Admin.

Creator tạo nội dung ở trạng thái:

```text
Draft
```

Sau đó gửi duyệt:

```text
PendingReview
```

Admin xử lý:

```text
Approve  → Published
Reject   → Rejected
Archive  → Archived
```

Luồng:

```text
Creator tạo Word / Question / MiniTest
    → Creator gửi duyệt
        → Admin xem danh sách PendingReview
            → Admin duyệt hoặc từ chối
```

---

## 2.4. Admin cần màn hình “Nội dung chờ duyệt”

Admin nên có thêm menu:

```text
Admin Dashboard
    - Quản lý người dùng
    - Phân quyền
    - Nội dung chờ duyệt
    - Nội dung bị từ chối
    - Nội dung đã xuất bản
    - Báo cáo toàn cục
```

Danh sách nội dung chờ duyệt sẽ lấy từ các bảng:

```text
Topics
Words
Questions
MiniTests
```

Điều kiện:

```sql
ContentStatus = 'PendingReview'
```

---

## 2.5. Admin có quyền xem toàn bộ nội dung của Creator

Creator chỉ nên xem/sửa nội dung của mình.

Admin thì được xem toàn bộ:

```text
- Nội dung của tất cả Creator
- Nội dung đã xuất bản
- Nội dung đang chờ duyệt
- Nội dung bị từ chối
- Nội dung đã lưu trữ
```

Vì vậy backend cần rule:

```text
Nếu user là Admin:
    cho phép xem/sửa/duyệt tất cả nội dung

Nếu user là Creator:
    chỉ cho phép xem/sửa nội dung có CreatedByUserID = currentUser.UserID

Nếu user là Learner:
    chỉ xem nội dung Published
```

---

# 3. So sánh trước và sau khi thêm Creator

## 3.1. Trước khi thêm Creator

```text
Learner
    → Học nội dung có sẵn

Admin
    → Quản lý user
    → Quản lý nội dung
    → Xem báo cáo
```

Vấn đề:

```text
Admin bị ôm quá nhiều việc.
Không tách rõ người tạo nội dung và người kiểm duyệt.
Khó biết nội dung do ai tạo.
Khó thống kê hiệu quả từng giáo viên/biên tập viên.
```

---

## 3.2. Sau khi thêm Creator

```text
Learner
    → Học nội dung đã xuất bản

Creator
    → Tạo nội dung
    → Gửi duyệt
    → Xem thống kê nội dung mình tạo

Admin
    → Quản lý user
    → Phân quyền
    → Duyệt nội dung
    → Xem báo cáo toàn cục
```

Lợi ích:

```text
Tách rõ trách nhiệm.
Admin nhẹ việc tạo nội dung.
Creator có không gian làm nội dung.
Learner chỉ học nội dung đã qua kiểm soát.
Có thể báo cáo hiệu quả theo từng Creator.
```

---

# 4. Thay đổi cụ thể với quyền của Learner

## 4.1. Learner giữ quyền học tập

Learner nên có:

| Permission        | Tác dụng               |
| ----------------- | ---------------------- |
| `VIEW_DASHBOARD`  | Xem dashboard học tập  |
| `LEARN_VOCAB`     | Học từ vựng            |
| `ENROLL_TOPICS`   | Chọn chủ đề học        |
| `MANAGE_NOTEBOOK` | Quản lý sổ tay cá nhân |

## 4.2. Learner không được có quyền quản lý nội dung

Learner không nên có:

| Permission               | Lý do                                    |
| ------------------------ | ---------------------------------------- |
| `MANAGE_WORDS`           | Không được tạo/sửa từ vựng               |
| `MANAGE_TOPICS`          | Không được tạo/sửa chủ đề                |
| `MANAGE_QUESTIONS`       | Không được tạo/sửa câu hỏi               |
| `MANAGE_TESTS`           | Không được tạo/sửa bài test              |
| `MANAGE_MEDIA`           | Không được upload media nội dung         |
| `SUBMIT_CONTENT_REVIEW`  | Không có quyền gửi duyệt nội dung        |
| `REVIEW_CONTENT`         | Không có quyền duyệt nội dung            |
| `VIEW_CONTENT_ANALYTICS` | Không xem analytics nội dung của Creator |
| `VIEW_GLOBAL_ANALYTICS`  | Không xem analytics toàn hệ thống        |

---

# 5. Thay đổi cụ thể với quyền của Admin

Admin nên có toàn bộ quyền:

| Permission                | Tác dụng                    |
| ------------------------- | --------------------------- |
| `VIEW_DASHBOARD`          | Xem dashboard               |
| `MANAGE_USERS`            | Quản lý người dùng          |
| `MANAGE_SYSTEM_SETTINGS`  | Quản lý cấu hình hệ thống   |
| `MANAGE_TOPICS`           | Quản lý chủ đề              |
| `MANAGE_TOPIC_CATEGORIES` | Quản lý danh mục chủ đề     |
| `MANAGE_WORDS`            | Quản lý từ vựng             |
| `MANAGE_QUESTIONS`        | Quản lý câu hỏi             |
| `MANAGE_TESTS`            | Quản lý bài kiểm tra        |
| `MANAGE_MEDIA`            | Quản lý media               |
| `REVIEW_CONTENT`          | Duyệt nội dung              |
| `VIEW_CONTENT_ANALYTICS`  | Xem phân tích nội dung      |
| `VIEW_GLOBAL_ANALYTICS`   | Xem phân tích toàn hệ thống |
| `PUBLISH_OWN_CONTENT`     | Có thể xuất bản nội dung    |

Admin cũng có thể có quyền học như Learner để test hệ thống:

```text
LEARN_VOCAB
ENROLL_TOPICS
MANAGE_NOTEBOOK
```

Nhưng ở UI có thể ẩn bớt nếu không cần.

---

# 6. Thay đổi với database

## 6.1. Bảng `Users`

Với `Users`, cần đảm bảo có thể lưu 3 loại role:

```text
Learner
ContentCreator
Admin
```

Nếu đang có cột:

```text
UserRole
RoleID
```

thì:

```text
UserRole = 'ContentCreator'
RoleID -> Roles.RoleID của ContentCreator
```

---

## 6.2. Bảng `Roles`

Cần có record:

```text
RoleName = ContentCreator
Description = Biên tập viên / Giáo viên quản lý nội dung học tập
```

---

## 6.3. Bảng `Permissions`

Cần có các permission phục vụ Creator và Admin:

```text
MANAGE_TOPICS
MANAGE_TOPIC_CATEGORIES
MANAGE_WORDS
MANAGE_QUESTIONS
MANAGE_TESTS
MANAGE_MEDIA
SUBMIT_CONTENT_REVIEW
REVIEW_CONTENT
VIEW_CONTENT_ANALYTICS
VIEW_GLOBAL_ANALYTICS
```

---

## 6.4. Bảng `RolePermissions`

Cần gán quyền:

```text
Learner:
    VIEW_DASHBOARD
    LEARN_VOCAB
    ENROLL_TOPICS
    MANAGE_NOTEBOOK

ContentCreator:
    VIEW_DASHBOARD
    MANAGE_TOPIC_CATEGORIES
    MANAGE_TOPICS
    MANAGE_WORDS
    MANAGE_QUESTIONS
    MANAGE_TESTS
    MANAGE_MEDIA
    SUBMIT_CONTENT_REVIEW
    VIEW_CONTENT_ANALYTICS

Admin:
    all permissions
```

---

## 6.5. Các bảng nội dung

Các bảng sau cần có `CreatedByUserID`:

```text
TopicCategories
Topics
Words
Questions
MiniTests
MediaAssets
```

Mục đích:

```text
Biết nội dung do Creator nào tạo.
Admin có thể lọc nội dung theo Creator.
Creator chỉ sửa nội dung của mình.
```

---

## 6.6. Các bảng nội dung cần `ContentStatus`

Các bảng nên có:

```text
ContentStatus
ReviewedByUserID
ReviewedAt
PublishedAt
```

Áp dụng cho:

```text
Topics
Words
Questions
MiniTests
```

Có thể áp dụng thêm cho:

```text
TopicCategories
MediaAssets
```

nếu muốn duyệt cả danh mục và media.

---

# 7. Thay đổi với backend

## 7.1. Login

Login không thay đổi nhiều.

Vẫn là:

```text
Email + password
    → Users
        → Roles
            → Permissions
```

Nhưng sau khi thêm Creator, token cần có thêm trường:

```json
{
  "userId": 12,
  "email": "teacher@example.com",
  "role": "ContentCreator",
  "permissions": [
    "MANAGE_WORDS",
    "MANAGE_QUESTIONS",
    "MANAGE_TESTS"
  ]
}
```

---

## 7.2. Middleware phân quyền

Trước đây có thể code kiểu:

```text
if user.role == 'Admin'
```

Sau khi thêm Creator, nên đổi sang:

```text
requirePermission('MANAGE_WORDS')
requirePermission('REVIEW_CONTENT')
requirePermission('LEARN_VOCAB')
```

Lý do:

```text
Một chức năng có thể dùng bởi nhiều role.
Admin và Creator đều có thể quản lý từ vựng.
Nhưng chỉ Admin có quyền duyệt nội dung.
```

---

## 7.3. API Learner

Các API Learner cần thêm filter:

```text
ContentStatus = Published
```

Ví dụ:

```text
GET /api/learner/topics
GET /api/learner/topics/:id/words
GET /api/learner/words/:id/questions
GET /api/learner/mini-tests
```

Chỉ trả về nội dung đã xuất bản.

---

## 7.4. API Creator

Thêm nhóm API:

```text
GET    /api/creator/dashboard
GET    /api/creator/topics
POST   /api/creator/topics
PUT    /api/creator/topics/:id
POST   /api/creator/topics/:id/submit-review

GET    /api/creator/words
POST   /api/creator/words
PUT    /api/creator/words/:id
POST   /api/creator/words/:id/submit-review

GET    /api/creator/questions
POST   /api/creator/questions
PUT    /api/creator/questions/:id
POST   /api/creator/questions/:id/submit-review

GET    /api/creator/mini-tests
POST   /api/creator/mini-tests
PUT    /api/creator/mini-tests/:id
POST   /api/creator/mini-tests/:id/submit-review
```

Các API này cần kiểm tra:

```text
role = ContentCreator hoặc Admin
permission tương ứng
CreatedByUserID = currentUser.UserID nếu là Creator
```

---

## 7.5. API Admin

Admin cần thêm API duyệt:

```text
GET  /api/admin/content/pending-review
POST /api/admin/content/:entityType/:entityId/approve
POST /api/admin/content/:entityType/:entityId/reject
POST /api/admin/content/:entityType/:entityId/archive
```

---

# 8. Thay đổi với frontend

## 8.1. Learner UI

Learner UI gần như không đổi, nhưng cần đảm bảo:

```text
Chỉ hiển thị nội dung Published.
Không hiển thị nội dung Draft/PendingReview/Rejected.
Không có menu quản lý nội dung.
```

Menu Learner:

```text
Dashboard
Chọn chủ đề
Học từ vựng
Luyện tập
Bài kiểm tra nhỏ
Sổ tay cá nhân
Tiến độ học tập
```

---

## 8.2. Creator UI

Thêm dashboard mới:

```text
Creator Dashboard
Quản lý danh mục chủ đề
Quản lý chủ đề
Quản lý từ vựng
Quản lý câu hỏi
Quản lý bài kiểm tra nhỏ
Quản lý media
Nội dung bản nháp
Nội dung chờ duyệt
Nội dung bị từ chối
Thống kê nội dung
```

---

## 8.3. Admin UI

Admin UI cần thêm hoặc chỉnh:

```text
Quản lý người dùng
    → Gán role ContentCreator

Duyệt nội dung
    → Topics chờ duyệt
    → Words chờ duyệt
    → Questions chờ duyệt
    → MiniTests chờ duyệt

Báo cáo
    → Báo cáo toàn hệ thống
    → Báo cáo theo Creator
    → Báo cáo hiệu quả chủ đề
```

---

# 9. Kết luận

Việc thêm Creator sẽ làm hệ thống rõ ràng hơn:

```text
Learner:
    Chỉ học nội dung đã xuất bản.

Creator:
    Tạo nội dung, gửi duyệt, xem thống kê nội dung của mình.

Admin:
    Quản lý người dùng, gán Creator, duyệt nội dung, xem báo cáo toàn cục.
```

Vì vậy, Learner chỉ cần sửa nhẹ ở phần **lọc nội dung Published**, còn Admin sẽ được mở rộng thêm nhiệm vụ **quản lý Creator và duyệt nội dung Creator gửi lên**.
