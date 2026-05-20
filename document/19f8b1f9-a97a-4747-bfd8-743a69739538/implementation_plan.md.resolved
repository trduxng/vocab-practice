# Triển khai Role ContentCreator — Bám sát PLAN gốc (Đã cập nhật)

Triển khai đầy đủ theo 5 phases trong [PLAN_them_creator_vao_he_thong_database_tieng_anh.md](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/document/PLAN_them_creator_vao_he_thong_database_tieng_anh.md) với thay đổi: **Creator không thể quản lý (CRUD) TopicCategories**, chỉ có quyền Xem (Read-only) để liên kết khi tạo/sửa Topics. Admin là người duy nhất quản lý TopicCategories.

---

## Hiện trạng đã xác nhận

### Database ✅ — Đã có đầy đủ trong [SQL mới nhất](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/Database/full_query_gen_merged_all_with_topic_categories_FIXED_moinhat.sql)

| Thành phần | Trạng thái |
|---|---|
| Role `ContentCreator` trong `Roles` | ✅ Line 822-827 |
| 16 Permissions (bao gồm `MANAGE_TOPIC_CATEGORIES`) | ✅ Line 834-865 |
| `RolePermissions` gán permissions cho Creator | ✅ Line 894-919 (Không bao gồm `MANAGE_TOPIC_CATEGORIES`) |
| `Users.UserRole` CHECK constraint | ✅ Line 82 |
| User mẫu `teacher@vocaboost.com` | ✅ Line 1027-1053 |
| `ContentStatus` trên Topics/Words/Questions/MiniTests | ✅ Line 1060-1174 |
| `TopicCategories` table | ✅ Line 1776-1805 |
| Views: `vw_ContentCreatorContentSummary`, `vw_TopicLearningAnalytics`, `vw_MiniTestAnalytics`, `vw_TopicCategorySummary` | ✅ Line 1655-2012 |

---

## User Review Required

> [!IMPORTANT]
> **Quyền TopicCategories**: `MANAGE_TOPIC_CATEGORIES` sẽ chỉ được giữ cho Admin. Ở phía Backend, route `GET /api/topic-categories` sẽ cho phép cả Creator và Admin gọi để lấy danh mục (phục vụ việc gán Category cho Topic). Các route `POST/PUT/DELETE` đối với TopicCategories sẽ bị chặn nếu user không phải Admin (hoặc không có quyền `MANAGE_TOPIC_CATEGORIES`).

---

## Proposed Changes

### Phase 1: Database — Xác nhận & Không thay đổi gì thêm

Vì script SQL mới nhất đã phân tách rõ ràng:
- Admin có `MANAGE_TOPIC_CATEGORIES` (Line 952)
- ContentCreator không có `MANAGE_TOPIC_CATEGORIES` (Line 911)
Nên không cần chạy thêm bất kỳ câu lệnh SQL thay đổi phân quyền nào.

---

### Phase 2: Backend — Creator & Admin Review API Layer

---

#### [NEW] [creator.service.js](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/backend/src/services/creator.service.js)

Service cho Creator, mọi query CRUD content **luôn filter** `CreatedByUserID = currentUserID`:

**Dashboard & Analytics**:
- `getDashboardStats(userId)` — query `vw_ContentCreatorContentSummary WHERE UserID = userId`
- `getContentSummary(userId)` — chi tiết nội dung theo status
- `getTopicAnalytics(userId, topicId)` — query `vw_TopicLearningAnalytics` join `Topics WHERE CreatedByUserID = userId`
- `getMiniTestAnalytics(userId, miniTestId)` — query `vw_MiniTestAnalytics` join `MiniTests WHERE CreatedByUserID = userId`

**TopicCategories (Read-only cho Creator, CRUD cho Admin)**:
- `getTopicCategories()` — Lấy danh sách danh mục chủ đề (phục vụ dropdown khi tạo/sửa Topics)

**Topics CRUD**:
- `getMyTopics(userId, filters)` — filter `CreatedByUserID`
- `createTopic(data, userId)` — `ContentStatus = 'Draft'`, `CreatedByUserID = userId` (yêu cầu điền `TopicCategoryID`)
- `updateTopic(id, data, userId)` — check ownership
- `deleteTopic(id, userId)` — check ownership, chỉ xóa Draft
- `submitTopicForReview(id, userId)` — đổi sang `PendingReview`, ghi `ContentReviewLogs`

**Words CRUD**:
- `getMyWords(userId, filters)`, `createWord()`, `updateWord()`, `deleteWord()`
- `submitWordForReview(id, userId)`
- Ví dụ câu (`ExampleSentences`) CRUD inline cùng Word
- Gán chủ đề (`WordTopics`) cho Word

**Questions CRUD**:
- `getMyQuestions(userId)`, `createQuestion()`, `updateQuestion()`, `deleteQuestion()`
- `submitQuestionForReview(id, userId)`

**MiniTests CRUD**:
- `getMyMiniTests(userId)`, `createMiniTest()`, `updateMiniTest()`, `deleteMiniTest()`
- `addMiniTestItem()`, `removeMiniTestItem()`
- `submitMiniTestForReview(id, userId)` — kiểm tra toàn bộ questions của test đã `Published` chưa

**Media CRUD**:
- `getMyMediaAssets(userId)` — filter `UploadedByUserID`
- `uploadMediaAsset(file, metadata, userId)`
- `deleteMediaAsset(id, userId)` — check ownership
- `linkMediaToContent()`, `unlinkMedia()`

---

#### [NEW] [creator.controller.js](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/backend/src/controllers/creator.controller.js)

#### [NEW] [creator.routes.js](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/backend/src/routes/creator.routes.js)

Routes được cấu hình phân quyền chặt chẽ:

```
# Dashboard & Analytics
GET    /api/creator/dashboard                         → VIEW_DASHBOARD
GET    /api/creator/content-summary                   → VIEW_CONTENT_ANALYTICS
GET    /api/creator/topics/:id/analytics              → VIEW_CONTENT_ANALYTICS
GET    /api/creator/mini-tests/:id/analytics          → VIEW_CONTENT_ANALYTICS

# TopicCategories (Read-only cho Creator để tạo Topic, Admin quản lý)
GET    /api/topic-categories                          → Cho phép Admin hoặc ContentCreator
POST   /api/topic-categories                          → Chỉ Admin (MANAGE_TOPIC_CATEGORIES)
PUT    /api/topic-categories/:id                      → Chỉ Admin (MANAGE_TOPIC_CATEGORIES)
DELETE /api/topic-categories/:id                      → Chỉ Admin (MANAGE_TOPIC_CATEGORIES)

# Topics
GET    /api/creator/topics                            → MANAGE_TOPICS
POST   /api/creator/topics                            → MANAGE_TOPICS
PUT    /api/creator/topics/:id                        → MANAGE_TOPICS
DELETE /api/creator/topics/:id                        → MANAGE_TOPICS
POST   /api/creator/topics/:id/submit-review          → SUBMIT_CONTENT_REVIEW

# Words, Questions, MiniTests, Media
... (tương tự như route cũ, kiểm tra quyền MANAGE_WORDS/QUESTIONS/TESTS/MEDIA)
```

---

#### [NEW] [review.service.js](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/backend/src/services/review.service.js)
#### [NEW] [review.controller.js](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/backend/src/controllers/review.controller.js)
#### [NEW] [review.routes.js](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/backend/src/routes/review.routes.js)

Quản lý duyệt nội dung của Admin (`PendingReview` → `Published` / `Rejected` / `Archived`).

---

#### [MODIFY] [index.js](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/backend/src/index.js)
#### [MODIFY] [auth.js](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/backend/src/middlewares/auth.js)

Tích hợp router mới và bổ sung middleware generic ownership check (`checkOwnership`).

---

### Phase 3: Frontend — Creator Layout & Pages

---

#### [MODIFY] [AuthContext.tsx](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/app/context/AuthContext.tsx)
#### [MODIFY] [login/page.tsx](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/app/login/page.tsx)
#### [MODIFY] [Sidebar.tsx](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/components/shared/Sidebar.tsx)

Sidebar của Creator **sẽ KHÔNG có** menu "Danh mục chủ đề" (Topic Categories) để quản lý. Thay vào đó, danh sách TopicCategories chỉ được tải nội bộ thông qua API phục vụ cho form chọn của Topics.

---

#### [NEW] [creator/layout.tsx](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/app/creator/layout.tsx)
#### [NEW] [creator.service.ts](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/services/creator.service.ts)

Cung cấp client gọi API `/api/creator/*` và `/api/topic-categories` (chỉ gọi GET).

---

#### Creator Pages — [NEW] (10 Pages, không có TopicCategories CRUD cho Creator)

| # | File | Mô tả | Form fields |
|---|---|---|---|
| 1 | `creator/dashboard/page.tsx` | Dashboard tổng quan | — |
| 2 | `creator/topics/page.tsx` | Quản lý Topics | TopicCategoryID (Dropdown lấy từ GET `/api/topic-categories`), TopicName, TopicCode, Description |
| 3 | `creator/words/page.tsx` | Quản lý Words | Term, Meaning, Phonetic, PartOfSpeechID, AudioUrlUK/US, ImageUrl, TopicIDs |
| 4 | `creator/questions/page.tsx` | Quản lý Questions | WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation |
| 5 | `creator/mini-tests/page.tsx` | Quản lý MiniTests | TopicID, TestTitle, Description, QuestionIDs |
| 6 | `creator/media/page.tsx` | Quản lý MediaAssets | MediaType, File, AltText, Transcript |
| 7 | `creator/drafts/page.tsx` | Xem các bản nháp (Draft) | — |
| 8 | `creator/pending/page.tsx` | Xem nội dung chờ duyệt | — |
| 9 | `creator/rejected/page.tsx` | Xem nội dung bị từ chối kèm lý do | — |
| 10 | `creator/analytics/page.tsx` | Phân tích hiệu quả nội dung | — |

---

### Phase 4: Admin Review UI & Admin TopicCategories (Trang riêng)

---

#### [NEW] [admin/content-review/page.tsx](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/app/admin/content-review/page.tsx)
#### [NEW] [admin/topic-categories/page.tsx](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/app/admin/topic-categories/page.tsx)

Admin sẽ có trang quản lý TopicCategories tại `/admin/topic-categories` để CRUD danh mục chủ đề (Business English, Travel English...). Creator không thể vào trang này.

#### [MODIFY] [Sidebar.tsx](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/components/shared/Sidebar.tsx) (admin section)
#### [MODIFY] [admin.service.ts](file:///d:/Code/Project_Web_nam3_ky2/web_hoc_tu_vung/vocab-practice/frontend/src/services/admin.service.ts)

---

### Phase 5: Testing & Verification

Kiểm thử phân quyền để đảm bảo Creator không thể POST/PUT/DELETE tới `/api/topic-categories` và không có giao diện quản lý danh mục này.
