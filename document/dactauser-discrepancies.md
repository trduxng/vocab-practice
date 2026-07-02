# B?o c?o sai l?ch gi?a dactauser.md v? codebase th?c t?
> **Ng?y:** 23/06/2026
> **Ph?m vi:** Backend routes, controllers, services, database
> **T?ng s?:** 20 l?i (?? 3 Critical + ?? 7 Important + ?? 10 Minor)
---
## ?? Critical (3) ? Sai v? b?n ch?t, c?n s?a ngay
### 1. UC 003 ? Email kh?ng th? c?p nh?t
| | Chi ti?t |
|---|---|
| **dactauser.md** | Input data table (d?ng 80): Email l? tr??ng kh?ng b?t bu?c, c? th? c?p nh?t |
| **Codebase** | PUT /api/user/profile ch? update ullName. Controller ch? destructure { fullName } |
| **File** | ackend/src/controllers/user.controller.js:109-118 |
### 2. UC 004 ? Ch?c n?ng ??i m?t kh?u ch?a t?n t?i
| | Chi ti?t |
|---|---|
| **dactauser.md** | M? t? ??y ?? lu?ng ??i m?t kh?u (b??c 1-3, l?i 2a-2b, input table 3 tr??ng) |
| **Codebase** | **Kh?ng t?n t?i** ? zero matches trong to?n b? codebase |
| **G?i ?** | ??nh d?u l? "T?nh n?ng t??ng lai" ho?c x?a kh?i spec |
### 3. UC 012 ? Achievements kh?ng t?ng XP
| | Chi ti?t |
|---|---|
| **dactauser.md** | B?ng achievements (d?ng 260-267): FIRST_WORD +10, WORDS_100 +50, STREAK_7 +30, STREAK_30 +100, TEST_SCORE_90 +50, LEVEL_5 +75 |
| **Codebase** | Achievements l? **cosmetic badges thu?n t?y**, KH?NG t?ng XP. XP rewards ri?ng bi?t: LearnWord=5, PracticeComplete=10, MiniTestComplete=20, DailyLogin=5 |
| **File** | ackend/src/services/gamification.service.js:3-8 |
---
## ?? Important (7) ? Thi?u/Sai chi ti?t quan tr?ng
### 4. UC 002 ? Register kh?ng auto-login
| | dactauser.md | Codebase |
|---|---|---|
| | B??c 4: "T? ??ng ??ng nh?p v? chuy?n ??n Dashboard" | Register tr? v? { message, user }, **kh?ng JWT token**, kh?ng g?i gamification |
### 5. UC 010 ? Thi?u request body format
| | dactauser.md | Codebase |
|---|---|---|
| | N?p b?i ? t?nh ?i?m, l?u, t?ng XP | Request body: { "answers": [{ "questionId": 1, "submittedAnswer": "hello" }] }. Validation: ki?m tra IsPublished=1, ch?a t?ng n?p, questionId h?p l?. Scoring: case-insensitive exact match. X? l? trong SQL transaction. |
### 6. UC 017 ? Thi?u validation chi ti?t
| | dactauser.md | Codebase |
|---|---|---|
| | Ch?n lo?i l?i ? nh?p m? t? ? g?i | Request body g?m: eportType, entityType (auto-inferred), wordId, questionId, 	itle (max 200), description (min 5, max 2000). C? Zod schema validation. |
### 7. UC 008 ? Thi?u limit parameters
| | dactauser.md | Codebase |
|---|---|---|
| | Xem danh s?ch t? ?u ti?n | Smart Queue: default limit=20, max=50. Mistake Queue: default limit=10, max=30, HAVING wrongCount>=1. |
### 8. UC 020 ? Thi?u conflict strategy
| | dactauser.md | Codebase |
|---|---|---|
| | Import bulk t? v?ng | Bulk endpoint h? tr? conflictStrategy: merge (upsert), skip (b? qua), overwrite (ghi ??) |
### 9. UC 027 ? Thi?u generic content-status endpoint
| | dactauser.md | Codebase |
|---|---|---|
| | Ch? c? approve/reject/archive | C?n PATCH /api/admin/content-status cho ph?p Admin direct set status b?t k?. Ngo?i ra c? duplicate routes gi?a AdminController v? ReviewController. |
### 10. UC 030 ? Sai endpoint path
| | dactauser.md | Codebase |
|---|---|---|
| | GET /admin/questions | GET /api/admin/questions/:wordId (g?n v?i wordId c? th?) |
---
## ?? Minor (10) ? Sai l?ch nh?, n?n s?a
### 11. UC 001 ? Thi?u DailyLogin XP v? rate limit response
| | dactauser.md | Codebase |
|---|---|---|
| | B??c 3: "T?o JWT token v? hi?n th? giao di?n" | Login c?n auto-award DailyLogin XP (+5) cho Learner, tr? v? { token, user, gamification }. Thi?u alternative flow: rate limit 429. |
### 12. UC 006 ? Thi?u +5 XP LearnWord
| | dactauser.md | Codebase |
|---|---|---|
| | "Ghi nh?n l??t h?c, t?ng +5 XP" | ?? c? nh?ng thi?u sourceKey pattern: learn-word:{wordId}:{YYYY-MM-DD} (dedup theo ng?y) |
### 13. UC 011 ? session-details c?n c? testId v? date
| | dactauser.md | Codebase |
|---|---|---|
| | Xem l?ch s? ki?m tra | Endpoint: GET /api/user/minitests/session-details?testId=X&date=YYYY-MM-DD (c?n c? 2 params) |
### 14. UC 015 ? Thi?u level codes v? accent keys
| | dactauser.md | Codebase |
|---|---|---|
| | "4 c?p ?? TOEIC" | C? th?: TOEIC_300 (sky), TOEIC_500 (emerald), TOEIC_700 (amber), TOEIC_900 (violet). M?i topic c? 3 activities: lesson/practice/miniTest. |
### 15. UC 021 ? Thi?u AudioRecognition question type
| | dactauser.md | Codebase |
|---|---|---|
| | MCQ, FillBlank, DragDrop, Dictation, FlashcardCheck | C?n c? AudioRecognition (6 lo?i, kh?ng ph?i 5) |
### 16. UC 029 ? Sai t?n permission
| | dactauser.md | Codebase |
|---|---|---|
| | "c?n SYSTEM_SETTINGS permission" | Permission check: MANAGE_SYSTEM_SETTINGS |
### 17. UC 001 ? Thi?u validation detail
| | dactauser.md | Codebase |
|---|---|---|
| | Validation kh?ng chi ti?t | Zod schema: email z.string().email(), password z.string().min(1) |
### 18. UC 036 ? Thi?u health check response
| | dactauser.md | Codebase |
|---|---|---|
| | "Tr? v? status OK ho?c l?i" | Response: { uptime, message: 'OK', timestamp, db: 'Connected'|'Disconnected' }. 200 n?u OK, 500 n?u DB fail. |
### 19. UC 002 ? Thi?u default permissions
| | dactauser.md | Codebase |
|---|---|---|
| | ? | Register g?n permissions m?c ??nh: VIEW_DASHBOARD, LEARN_VOCAB |
### 20. UC 022 ? Thi?u 403 not-owned check
| | dactauser.md | Codebase |
|---|---|---|
| | Th?m/b? c?u h?i v?o ?? | Endpoint ki?m tra ownership: 403 n?u kh?ng ph?i Creator s? h?u |
---
## Th?ng k? theo Use-case
| UC | T?n | S? l?i | M?c ?? |
|----|-----|--------|--------|
| 001 | ??ng nh?p | 2 | ?? Minor |
| 002 | ??ng k? | 2 | ?? Minor |
| 003 | C?p nh?t th?ng tin | 1 | ?? Critical |
| 004 | ??i m?t kh?u | 1 | ?? Critical |
| 006 | H?c t? v?ng | 1 | ?? Minor |
| 008 | Smart Queue | 1 | ?? Important |
| 010 | Mini Test | 1 | ?? Important |
| 011 | Test History | 1 | ?? Minor |
| 012 | Gamification | 1 | ?? Critical |
| 015 | Learning Path | 1 | ?? Minor |
| 017 | B?o c?o l?i | 1 | ?? Important |
| 020 | Words CRUD | 1 | ?? Important |
| 021 | Questions CRUD | 1 | ?? Minor |
| 022 | Mini Tests CRUD | 1 | ?? Minor |
| 027 | Content Review | 1 | ?? Important |
| 029 | Admin Words | 1 | ?? Minor |
| 030 | Admin Questions | 1 | ?? Important |
| 036 | Health Check | 1 | ?? Minor |
| **T?ng** | | **20** | **3?? + 7?? + 10??** |
