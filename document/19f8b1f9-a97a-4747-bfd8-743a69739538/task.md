# Task: Triển khai ContentCreator

## Phase 1: Database

- [x] Xác nhận SQL đã có đủ schema (không cần migration thêm)

## Phase 2: Backend

- [x] Tạo `creator.service.js` — CRUD + ownership + workflow
- [x] Tạo `creator.controller.js`
- [x] Tạo `creator.routes.js`
- [x] Tạo `review.service.js` — Admin approve/reject/archive
- [x] Tạo `review.controller.js`
- [x] Tạo `review.routes.js`
- [x] Sửa `auth.js` — thêm `checkOwnership` middleware
- [x] Sửa `index.js` — mount creator + review routes

## Phase 3: Frontend

- [x] Sửa `AuthContext.tsx` — thêm `isCreator`, `hasPermission`
- [x] Sửa `Sidebar.tsx` — thêm creatorLinks
- [x] Sửa `login/page.tsx` — redirect ContentCreator
- [x] Tạo `creator/layout.tsx`
- [x] Tạo `creator.service.ts`
- [x] Tạo `creator/dashboard/page.tsx`
- [x] Tạo `creator/topics/page.tsx`
- [x] Tạo `creator/words/page.tsx`
- [x] Tạo `creator/questions/page.tsx`
- [x] Tạo `creator/mini-tests/page.tsx`
- [x] Tạo `creator/media/page.tsx`
- [x] Tạo `creator/drafts/page.tsx`
- [x] Tạo `creator/pending/page.tsx`
- [x] Tạo `creator/rejected/page.tsx`
- [x] Tạo `creator/analytics/page.tsx`

## Phase 4: Admin Review UI

- [x] Tạo `admin/content-review/page.tsx`
- [x] Tạo `admin/topic-categories/page.tsx`
- [x] Sửa `admin.service.ts` — thêm review + topicCategory methods
- [x] Sửa Sidebar admin section

## Phase 5: Testing

- [x] Test login Creator → JWT permissions
- [x] Test Creator CRUD + ownership
- [x] Test Admin approve/reject
- [x] Browser tests
