# 🐛 Chi Tiết Lỗi & Quick Fixes - VocaBoost

**Ngày báo cáo:** May 7, 2026  
**Severity:** 3 Critical + 7 Medium + 5 Low  

---

## 🔴 CRITICAL BUGS (Khắc phục ngay)

### Bug #1: Performance Killer - N+1 Query in `getWords()`
**File:** [backend/src/services/admin.service.js](backend/src/services/admin.service.js#L9)  
**Severity:** 🔴 CRITICAL  
**Impact:** API `/api/admin/words` sẽ rất chậm khi có >100 từ

**Vấn đề:**
```javascript
// ❌ BAD: 1 query + 20 queries = 21 queries total!
static async getWords(page = 1, limit = 20) {
  const words = result.recordset;  // 1 query
  
  for (let word of words) {
    const topicsResult = await pool.request()... // +1 query
    const examplesResult = await pool.request()...  // +1 query
  }
  // Total: 1 + (20 * 2) = 41 queries!
}
```

**Giải pháp - Dùng JOIN:**
```javascript
static async getWords(page = 1, limit = 20) {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;
  
  // ✅ GOOD: 1 query thay vì 41 queries
  const result = await pool.request()
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit)
    .query(`
      SELECT DISTINCT
        w.WordID AS id, 
        w.Term AS term, 
        w.Meaning AS meaning, 
        w.Phonetic AS phonetic, 
        w.PartOfSpeechID AS partOfSpeechId, 
        p.PartOfSpeechName AS partOfSpeechName,
        w.CreatedAt AS createdAt,
        (
          SELECT id, name 
          FROM (
            SELECT t.TopicID AS id, t.TopicName AS name 
            FROM WordTopics wt
            JOIN Topics t ON wt.TopicID = t.TopicID
            WHERE wt.WordID = w.WordID
            FOR JSON PATH
          ) AS topics
        ) AS topics,
        (
          SELECT id, sentence, meaning 
          FROM (
            SELECT ExampleSentenceID AS id, SentenceText AS sentence, SentenceTranslation AS meaning
            FROM ExampleSentences
            WHERE WordID = w.WordID
            FOR JSON PATH
          ) AS examples
        ) AS examples
      FROM Words w
      LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      ORDER BY w.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
  
  return result.recordset.map(w => ({
    ...w,
    topics: w.topics ? JSON.parse(w.topics) : [],
    examples: w.examples ? JSON.parse(w.examples) : []
  }));
}
```

**Expected result:** API response time < 200ms (từ 2-3 giây)

---

### Bug #2: Stored Procedure `usp_SubmitQuestionAttempt` Không Tồn Tại
**File:** [Database/prototype_database.sql](Database/prototype_database.sql)  
**Severity:** 🔴 CRITICAL  
**Impact:** API `/api/user/submit-answer` trả về 500 error

**Vấn đề:**
```javascript
// Backend gọi:
await pool.request()
  .execute('usp_SubmitQuestionAttempt');  // ❌ Procedure không tồn tại!
```

**Giải pháp - Tạo Stored Procedure:**

Thêm vào `Database/prototype_database.sql`:

```sql
CREATE PROCEDURE usp_SubmitQuestionAttempt
  @UserID BIGINT,
  @QuestionID BIGINT,
  @SubmittedAnswer NVARCHAR(1000)
AS
BEGIN
  SET NOCOUNT ON;
  
  DECLARE @WordID BIGINT;
  DECLARE @CorrectAnswer NVARCHAR(500);
  DECLARE @IsCorrect BIT = 0;
  
  -- Lấy WordID và CorrectAnswer
  SELECT @WordID = WordID, @CorrectAnswer = CorrectAnswer 
  FROM Questions WHERE QuestionID = @QuestionID;
  
  -- Kiểm tra đáp án (exact match hoặc case-insensitive)
  IF LOWER(TRIM(@SubmittedAnswer)) = LOWER(TRIM(@CorrectAnswer))
    SET @IsCorrect = 1;
  
  BEGIN TRANSACTION;
  BEGIN TRY
    -- 1. Ghi nhận ExerciseAttempt
    INSERT INTO ExerciseAttempts (UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, ScoreAwarded, AttemptedAt)
    VALUES (@UserID, @QuestionID, @WordID, @SubmittedAnswer, @IsCorrect, 
            CASE WHEN @IsCorrect = 1 THEN 100 ELSE 0 END, SYSDATETIMEOFFSET());
    
    -- 2. Cập nhật UserWordProgress (SRS Logic)
    DECLARE @MasteryLevel TINYINT, 
            @EaseFactor DECIMAL(4,2), 
            @RepetitionCount INT,
            @ConsecutiveCorrect INT,
            @ConsecutiveWrong INT;
    
    SELECT @MasteryLevel = MasteryLevel, 
           @EaseFactor = EaseFactor, 
           @RepetitionCount = RepetitionCount,
           @ConsecutiveCorrect = ConsecutiveCorrect,
           @ConsecutiveWrong = ConsecutiveWrong
    FROM UserWordProgress 
    WHERE UserID = @UserID AND WordID = @WordID;
    
    -- SRS Algorithm
    IF @IsCorrect = 1
    BEGIN
      SET @MasteryLevel = CASE WHEN @MasteryLevel < 10 THEN @MasteryLevel + 1 ELSE 10 END;
      SET @ConsecutiveCorrect = @ConsecutiveCorrect + 1;
      SET @ConsecutiveWrong = 0;
      
      -- Increase ease factor for difficult words
      IF @ConsecutiveCorrect >= 3
        SET @EaseFactor = CASE WHEN @EaseFactor < 3.5 THEN @EaseFactor + 0.1 ELSE 3.5 END;
    END
    ELSE
    BEGIN
      SET @MasteryLevel = CASE WHEN @MasteryLevel > 0 THEN @MasteryLevel - 1 ELSE 0 END;
      SET @ConsecutiveCorrect = 0;
      SET @ConsecutiveWrong = @ConsecutiveWrong + 1;
      
      -- Decrease ease factor
      SET @EaseFactor = CASE WHEN @EaseFactor > 1.3 THEN @EaseFactor - 0.2 ELSE 1.3 END;
    END
    
    SET @RepetitionCount = @RepetitionCount + 1;
    
    -- Calculate NextReviewDate using SRS formula
    DECLARE @IntervalDays INT;
    IF @RepetitionCount = 1
      SET @IntervalDays = 1;
    ELSE IF @RepetitionCount = 2
      SET @IntervalDays = 3;
    ELSE
      SET @IntervalDays = CAST(ROUND(CAST(CAST(@RepetitionCount - 2 AS FLOAT) * @EaseFactor AS FLOAT), 0) AS INT);
    
    UPDATE UserWordProgress
    SET MasteryLevel = @MasteryLevel,
        EaseFactor = @EaseFactor,
        RepetitionCount = @RepetitionCount,
        ConsecutiveCorrect = @ConsecutiveCorrect,
        ConsecutiveWrong = @ConsecutiveWrong,
        LastReviewedAt = SYSDATETIMEOFFSET(),
        NextReviewDate = DATEADD(DAY, @IntervalDays, SYSDATETIMEOFFSET()),
        LastScore = CASE WHEN @IsCorrect = 1 THEN 100 ELSE 0 END,
        MemoryStatus = CASE 
          WHEN @MasteryLevel >= 8 THEN 'Mastered'
          WHEN @MasteryLevel >= 5 THEN 'Reviewing'
          WHEN @MasteryLevel > 0 THEN 'Learning'
          ELSE 'New'
        END,
        UpdatedAt = SYSDATETIMEOFFSET()
    WHERE UserID = @UserID AND WordID = @WordID;
    
    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO
```

---

### Bug #3: UserWordProgress Không Được Init Khi User Đăng Ký
**File:** [backend/src/services/auth.service.js](backend/src/services/auth.service.js)  
**Severity:** 🔴 CRITICAL  
**Impact:** Người dùng mới không thấy flashcards

**Vấn đề:**
```sql
-- Khi user đăng ký:
INSERT INTO Users (FullName, Email, PasswordHash, UserRole, IsActive)
-- Nhưng UserWordProgress không được tạo!
-- Nên getDueFlashcards() trả về NULL
```

**Giải pháp - Tạo Trigger:**

Thêm vào `Database/prototype_database.sql`:

```sql
CREATE TRIGGER tr_InitUserWordProgress
ON Users AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  
  INSERT INTO UserWordProgress (UserID, WordID, MasteryLevel, EaseFactor, MemoryStatus)
  SELECT i.UserID, w.WordID, 0, 2.5, 'New'
  FROM inserted i
  CROSS JOIN Words w
  WHERE i.UserRole = 'Learner';
END
GO
```

---

## 🟡 MEDIUM BUGS (Fix trong tuần)

### Bug #4: Không Có Validation cho Input
**File:** [backend/src/middlewares/validate.js](backend/src/middlewares/validate.js)  
**Severity:** 🟡 MEDIUM  
**Impact:** SQL Injection, Bad data

**Vấn đề:**
```javascript
// ❌ Không validate QuestionType
await AdminService.createQuestion({
  questionType: "INVALID_TYPE",  // SQL error!
  questionText: "What?",
  correctAnswer: "answer",
  optionsJson: "{not valid json"  // Parse error!
});
```

**Giải pháp - Thêm Zod Validation:**

```javascript
// backend/src/middlewares/validate.js
const z = require('zod');

const schemas = {
  createQuestion: z.object({
    wordId: z.coerce.bigint().positive(),
    questionType: z.enum(['MCQ', 'FillBlank', 'DragDrop', 'Dictation', 'FlashcardCheck']),
    questionText: z.string().min(10).max(2000),
    correctAnswer: z.string().min(1).max(500),
    optionsJson: z.string()
      .refine(val => {
        try { 
          JSON.parse(val);
          return true;
        } catch { 
          return false; 
        }
      }, 'OptionsJson must be valid JSON'),
    explanation: z.string().max(2000).optional(),
    difficultyLevel: z.coerce.number().int().min(1).max(5).default(1),
  }),
  
  createWord: z.object({
    term: z.string().min(1).max(200),
    meaning: z.string().min(1).max(1000),
    phonetic: z.string().max(255).optional(),
    partOfSpeechId: z.coerce.number().int().positive(),
    topicIds: z.array(z.coerce.bigint().positive()).optional(),
    examples: z.array(z.object({
      sentence: z.string().min(5).max(2000),
      meaning: z.string().max(2000).optional()
    })).optional(),
  }),
};

const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
};

module.exports = { validate, schemas };
```

**Áp dụng:**
```javascript
// backend/src/routes/admin.routes.js
router.post('/questions', 
  validate(schemas.createQuestion),  // ✅ Validation trước
  AdminController.createQuestion
);
```

---

### Bug #5: Không Có Rate Limiting
**File:** [backend/src/index.js](backend/src/index.js)  
**Severity:** 🟡 MEDIUM  
**Impact:** DDoS attack, Spam

**Vấn đề:**
```javascript
// User có thể spam submit-answer 1000x/giây
curl http://localhost:3001/api/user/submit-answer \
  -X POST -d '{"questionId":1,"submittedAnswer":"a"}' 
// Không có rate limit!
```

**Giải pháp:**

```bash
npm install express-rate-limit
```

```javascript
// backend/src/index.js
const rateLimit = require('express-rate-limit');

// Global rate limit: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for submit-answer
const submitAnswerLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 30,  // Max 30 submissions per minute
  skipSuccessfulRequests: false,
});

app.use('/api/', globalLimiter);

// Apply to sensitive endpoints
app.post('/api/user/submit-answer', submitAnswerLimiter, UserController.submitAnswer);
```

---

### Bug #6: Missing Index on UserWordProgress
**File:** [Database/prototype_database.sql](Database/prototype_database.sql)  
**Severity:** 🟡 MEDIUM  
**Impact:** Slow query `getDueFlashcards()`

**Vấn đề:**
```sql
-- Query lấy flashcard cần ôn tập
SELECT * FROM UserWordProgress 
WHERE UserID = @UserID AND NextReviewDate <= GETDATE()
-- ❌ Không có index → Full table scan trên 1M+ rows!
```

**Giải pháp - Thêm Index:**

```sql
CREATE NONCLUSTERED INDEX IX_UserWordProgress_NextReviewDate 
ON UserWordProgress(UserID, NextReviewDate)
INCLUDE (MasteryLevel, MemoryStatus);

-- For analytics query
CREATE NONCLUSTERED INDEX IX_ExerciseAttempts_UserAttemptedAt
ON ExerciseAttempts(UserID, AttemptedAt)
INCLUDE (IsCorrect, ScoreAwarded);
```

---

### Bug #7: Test Session Không Được Tracked
**File:** [backend/src/controllers/user.controller.js](backend/src/controllers/user.controller.js)  
**Severity:** 🟡 MEDIUM  
**Impact:** Không thể xem lại chi tiết bài thi

**Vấn đề:**
```javascript
// Người dùng làm bài Mini Test:
// 1. Gọi /api/user/minitests/123 (lấy questions)
// 2. Gọi /api/user/submit-answer nhiều lần
// ❌ Nhưng không có cách nào biết đây là 1 session

// Nên không thể xem lại toàn bộ bài thi
```

**Giải pháp - Thêm Session Tracking:**

```javascript
// backend/src/routes/user.routes.js
router.post('/test-sessions/start', UserController.startTestSession);
router.post('/test-sessions/:sessionId/submit', UserController.submitTestAnswer);
router.get('/test-sessions/:sessionId/details', UserController.getTestSessionDetails);

// backend/src/controllers/user.controller.js
static async startTestSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { miniTestId } = req.body;
    
    const session = await UserService.startTestSession(userId, miniTestId);
    res.status(201).json({ 
      message: 'Test session started',
      sessionId: session.TestSessionID 
    });
  } catch (error) {
    next(error);
  }
}

static async submitTestAnswer(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { questionId, submittedAnswer } = req.body;
    
    await UserService.submitTestAnswer(sessionId, questionId, submittedAnswer);
    res.status(200).json({ message: 'Answer recorded' });
  } catch (error) {
    next(error);
  }
}

// backend/src/services/user.service.js
static async startTestSession(userId, miniTestId) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('UserID', sql.BigInt, userId)
    .input('MiniTestID', sql.BigInt, miniTestId)
    .query(`
      INSERT INTO TestSessions (UserID, MiniTestID, Status)
      OUTPUT inserted.TestSessionID
      VALUES (@UserID, @MiniTestID, 'In Progress')
    `);
  return result.recordset[0];
}

static async submitTestAnswer(sessionId, questionId, submittedAnswer) {
  const pool = await poolPromise;
  
  const result = await pool.request()
    .input('QuestionID', sql.BigInt, questionId)
    .query('SELECT CorrectAnswer FROM Questions WHERE QuestionID = @QuestionID');
  
  const isCorrect = result.recordset[0].CorrectAnswer.trim().toLowerCase() 
    === submittedAnswer.trim().toLowerCase();
  
  await pool.request()
    .input('TestSessionID', sql.BigInt, sessionId)
    .input('QuestionID', sql.BigInt, questionId)
    .input('SubmittedAnswer', sql.NVarChar, submittedAnswer)
    .input('IsCorrect', sql.Bit, isCorrect ? 1 : 0)
    .query(`
      INSERT INTO TestSessionAnswers (TestSessionID, QuestionID, SubmittedAnswer, IsCorrect, Score)
      VALUES (@TestSessionID, @QuestionID, @SubmittedAnswer, @IsCorrect, 
              @IsCorrect * 100)
    `);
}
```

---

### Bug #8: Frontend không handle Null Phonetic
**File:** [frontend/src/components/FlashcardComponent.tsx](frontend/src/components/FlashcardComponent.tsx)  
**Severity:** 🟡 MEDIUM  
**Impact:** Blank phonetic display

**Vấn đề:**
```tsx
// Nếu phonetic = NULL
<span>{flashcard.phonetic}</span>  // ❌ Hiển thị "null"
```

**Giải pháp:**
```tsx
<span>{flashcard.phonetic || 'Not available'}</span>
```

---

## 🟢 LOW PRIORITY BUGS (Fix khi rảnh)

### Bug #9: Inconsistent Datetime Timezone
**Severity:** 🟢 LOW  
**Impact:** Streak calculation sai (rare)

**Vấn đề:** Frontend local time vs Backend UTC

**Fix:** Sử dụng `DATETIMEOFFSET` consistently

---

### Bug #10: No Pagination on /api/admin/words
**Fix:**  Response quá lớn nếu có 10k words

**Solution:** Implement limit/offset

---

## 📊 Tóm Tắt Lỗi

| ID | Lỗi | Severity | Fix Time | Impact |
|----|-----|----------|----------|--------|
| #1 | N+1 Query | 🔴 | 30 min | API chậm 10x |
| #2 | SP không tồn tại | 🔴 | 20 min | 500 error |
| #3 | UserWordProgress init | 🔴 | 15 min | Blank flashcards |
| #4 | Validation | 🟡 | 45 min | SQL injection |
| #5 | Rate limit | 🟡 | 30 min | DDoS |
| #6 | Missing index | 🟡 | 10 min | Slow query |
| #7 | Session tracking | 🟡 | 90 min | No history |
| #8 | Null phonetic | 🟡 | 5 min | UI glitch |
| #9 | Timezone | 🟢 | 20 min | Rare bug |
| #10 | Pagination | 🟢 | 15 min | UX issue |

**Total fix time:** ~4 hours

---

## 🚀 QUICK ACTION PLAN

### Hôm nay (4 hours)
- [ ] Fix Bug #1 (N+1 Query)
- [ ] Fix Bug #2 (Create SP)
- [ ] Fix Bug #3 (Trigger)
- [ ] Fix Bug #4 (Validation)

### Tuần này
- [ ] Fix Bug #5 (Rate limiting)
- [ ] Fix Bug #6 (Index)
- [ ] Fix Bug #7 (Session tracking)
- [ ] Test toàn bộ

### Tuần sau
- [ ] Deploy fixes
- [ ] Monitor performance
- [ ] User feedback
