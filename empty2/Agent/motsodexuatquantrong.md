# 🎯 Đánh Giá Alignment VocaBoost vs. Yêu Cầu TOEIC Platform

**Ngày phân tích:** May 7, 2026  
**Mục tiêu:** Đảm bảo VocaBoost tuân thủ 100% các yêu cầu chức năng & phi chức năng

---

## 📋 BẢNG ALIGNMENT - CHỨC NĂNG HIỆN CÓ vs. YÊU CẦU

### 1. PHÂN HỆ QUẢN LÝ NỘI DUNG TỪ VỰNG

#### Yêu cầu: Cấu trúc từ vựng đa phương tiện

| Thành phần | Yêu cầu | Hiện tại | Status | Fix cần thiết |
|-----------|--------|---------|--------|--------------|
| **Từ** | Term (nvarchar 200) | ✅ Có | ✅ | - |
| **Loại từ** | PartOfSpeech (n, v, adj, adv, prep) | ✅ Có | ✅ | - |
| **Nghĩa** | Meaning (nvarchar 1000) | ✅ Có | ✅ | - |
| **Phiên âm** | Phonetic (IPA format) | ⚠️ Có nhưng NULL | ⚠️ | Bắt buộc (NOT NULL) |
| **Audio UK** | AudioUrlUK (British) | ✅ Có | ✅ | - |
| **Audio US** | AudioUrlUS (American) | ✅ Có | ✅ | - |
| **Hình ảnh** | ImageUrl (visual) | ✅ Có | ✅ | - |
| **Câu ví dụ** | ExampleSentences table | ✅ Có | ✅ | - |
| **Câu ví dụ TOEIC** | TOEIC context examples | ❌ Không | ❌ | **Thêm column ExampleSource = 'TOEIC'** |
| **Độ khó** | DifficultyLevel (1-5) | ✅ Có | ✅ | - |

**Status:** 🟡 80% - Thiếu TOEIC-specific examples

**Fix cần thiết:**
```sql
-- Thêm column ExampleSource
ALTER TABLE ExampleSentences
ADD ExampleSource NVARCHAR(50) NULL DEFAULT 'General'  -- 'TOEIC' | 'General' | 'Daily'
ADD PartNumber INT NULL;  -- NULL | 1 | 2 | 3 | 4 | 5 | 6 | 7

-- Update existing TOEIC examples
UPDATE ExampleSentences
SET ExampleSource = 'TOEIC',
    PartNumber = CASE 
      WHEN SentenceText LIKE '%email%' THEN 3
      WHEN SentenceText LIKE '%meeting%' THEN 3
      WHEN SentenceText LIKE '%photo%' THEN 1
      ELSE NULL
    END
WHERE ExampleSentenceID > 0;
```

---

#### Yêu cầu: Phân loại theo chủ đề (600 từ TOEIC + Part 1-7)

| Tính năng | Yêu cầu | Hiện tại | Status |
|----------|--------|---------|--------|
| **Topics** | 600 từ TOEIC thiết yếu | ✅ Topics table | ✅ |
| **Part-based** | Chia theo Part 1-7 | ❌ Không có | ❌ |
| **Word count** | ~600 từ | ⚠️ Seed data chỉ 15 từ | ⚠️ |
| **Category** | Economy, Office, Travel, etc. | ⚠️ Chỉ T50 | ⚠️ |

**Status:** 🔴 40% - Thiếu Part-based classification

**Fix cần thiết:**
```sql
-- Thêm table PartsClassification
CREATE TABLE PartsClassification (
  PartID INT IDENTITY(1,1) PRIMARY KEY,
  PartNumber INT NOT NULL UNIQUE,  -- 1-7
  PartName NVARCHAR(100) NOT NULL, -- 'Part 1 - Photographs' | 'Part 3 - Conversation' ...
  Description NVARCHAR(500) NULL,
  VocabularyCount INT DEFAULT 0,
  CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Liên kết Words với Parts
CREATE TABLE WordPartsAssignment (
  WordID BIGINT NOT NULL,
  PartID INT NOT NULL,
  RelevancyScore INT DEFAULT 1,  -- 1-5: Mức độ liên quan
  CONSTRAINT PK_WordParts PRIMARY KEY (WordID, PartID),
  FOREIGN KEY (WordID) REFERENCES Words(WordID) ON DELETE CASCADE,
  FOREIGN KEY (PartID) REFERENCES PartsClassification(PartID)
);

-- Insert Parts 1-7
INSERT INTO PartsClassification (PartNumber, PartName, Description)
VALUES 
  (1, 'Photographs', 'Describe people, objects, scenes'),
  (2, 'Question-Response', 'Short questions and responses'),
  (3, 'Conversations', '2-3 minute business conversations'),
  (4, 'Talks', 'Short 1-2 minute talks'),
  (5, 'Incomplete Sentences', 'Choose correct word for sentence'),
  (6, 'Error Identification', 'Find and correct grammar errors'),
  (7, 'Reading Comprehension', 'Single and multiple passages');
```

**Seed 600 từ TOEIC:**
```sql
-- Ví dụ: Insert từ theo Part
INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID, DifficultyLevel)
VALUES ('Accommodate', N'Cung cấp chỗ ở / thích ứng', '/əˈkɒmədeɪt/', 1, 1, 2);

-- Gán từ vào Part 5 (thường dùng trong incomplete sentences)
INSERT INTO WordPartsAssignment (WordID, PartID, RelevancyScore)
VALUES (SCOPE_IDENTITY(), 5, 4);
```

---

### 2. PHÂN HỆ HỌC TẬP VÀ TƯƠNG TÁC

#### Yêu cầu: Chế độ Flashcard + Bài tập trắc nghiệm + SRS

| Tính năng | Yêu cầu | Hiện tại | Status |
|----------|--------|---------|--------|
| **Flashcard** | Lật thẻ → xem nghĩa + phát âm | ✅ Có | ✅ |
| **MCQ** | Multiple choice (A/B/C/D) | ✅ Có | ✅ |
| **Fill-blank** | Điền từ vào chỗ trống | ✅ Có | ✅ |
| **Dictation** | Nghe viết lại từ/câu | ❌ Không | ❌ |
| **Drag-drop** | Sắp xếp câu/từ | ❌ Không | ❌ |
| **SRS Algorithm** | NextReviewDate auto-calculate | ⚠️ SP mất | ⚠️ |
| **Phát âm** | Audio playback + TTS | ✅ Có | ✅ |

**Status:** 🟡 70% - Thiếu Dictation & Drag-drop, SRS chưa hoàn chỉnh

**Fix cần thiết:**

#### 2.1 Thêm Question Type: Dictation
```sql
-- Types cần có
-- 'MCQ', 'FillBlank', 'DragDrop', 'Dictation', 'FlashcardCheck', 'AudioRecognition'

-- Ví dụ Dictation
INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson, CreatedByUserID)
VALUES (
  123,
  'Dictation',
  '<audio src="https://...audio.mp3"></audio> -- Nghe và viết lại từ',
  'accommodate',
  '{"instruction": "Nghe lại 3 lần, viết chính xác", "maxAttempts": 3}',
  1
);
```

#### 2.2 Thêm Question Type: DragDrop
```sql
INSERT INTO Questions (WordID, QuestionType, QuestionText, CorrectAnswer, OptionsJson, CreatedByUserID)
VALUES (
  124,
  'DragDrop',
  'Sắp xếp từ để tạo câu đúng: [I] [should] [accommodate] [their]',
  'I should accommodate their',
  '{"items": ["should", "I", "accommodate", "their"], "correctOrder": [1, 0, 2, 3]}',
  1
);
```

#### 2.3 Sửa SRS Algorithm (tạo SP đúng)
```sql
CREATE PROCEDURE usp_SubmitQuestionAttempt
  @UserID BIGINT,
  @QuestionID BIGINT,
  @SubmittedAnswer NVARCHAR(1000),
  @QuestionType NVARCHAR(30)
AS
BEGIN
  SET NOCOUNT ON;
  
  DECLARE @WordID BIGINT, @CorrectAnswer NVARCHAR(500);
  SELECT @WordID = WordID, @CorrectAnswer = CorrectAnswer 
  FROM Questions WHERE QuestionID = @QuestionID;
  
  -- Normalize answer
  DECLARE @IsCorrect BIT = 0;
  IF LOWER(TRIM(@SubmittedAnswer)) = LOWER(TRIM(@CorrectAnswer))
    SET @IsCorrect = 1;
  
  -- Insert attempt
  INSERT INTO ExerciseAttempts (UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, ScoreAwarded, AttemptedAt)
  VALUES (@UserID, @QuestionID, @WordID, @SubmittedAnswer, 
          @IsCorrect, CASE WHEN @IsCorrect = 1 THEN 100 ELSE 0 END, 
          SYSDATETIMEOFFSET());
  
  -- Update UserWordProgress (SRS)
  DECLARE @MasteryLevel TINYINT, @EaseFactor DECIMAL(4,2), @RepetitionCount INT;
  
  SELECT @MasteryLevel = ISNULL(MasteryLevel, 0),
         @EaseFactor = ISNULL(EaseFactor, 2.5),
         @RepetitionCount = ISNULL(RepetitionCount, 0)
  FROM UserWordProgress 
  WHERE UserID = @UserID AND WordID = @WordID;
  
  -- SM-2 Algorithm (Spaced Repetition)
  IF @IsCorrect = 1
  BEGIN
    SET @MasteryLevel = CASE WHEN @MasteryLevel < 10 THEN @MasteryLevel + 1 ELSE 10 END;
    SET @RepetitionCount = @RepetitionCount + 1;
    SET @EaseFactor = CASE WHEN @EaseFactor < 3.5 THEN @EaseFactor + 0.1 ELSE 3.5 END;
  END
  ELSE
  BEGIN
    SET @MasteryLevel = CASE WHEN @MasteryLevel > 0 THEN @MasteryLevel - 1 ELSE 0 END;
    SET @EaseFactor = CASE WHEN @EaseFactor > 1.3 THEN @EaseFactor - 0.2 ELSE 1.3 END;
  END
  
  -- Calculate interval (days)
  DECLARE @IntervalDays INT;
  IF @RepetitionCount = 1
    SET @IntervalDays = 1;
  ELSE IF @RepetitionCount = 2
    SET @IntervalDays = 3;
  ELSE
    SET @IntervalDays = CAST(ROUND(@RepetitionCount * @EaseFactor, 0) AS INT);
  
  -- Update progress
  UPDATE UserWordProgress
  SET MasteryLevel = @MasteryLevel,
      EaseFactor = @EaseFactor,
      RepetitionCount = @RepetitionCount,
      LastReviewedAt = SYSDATETIMEOFFSET(),
      NextReviewDate = DATEADD(DAY, @IntervalDays, SYSDATETIMEOFFSET()),
      MemoryStatus = CASE 
        WHEN @MasteryLevel >= 8 THEN 'Mastered'
        WHEN @MasteryLevel >= 5 THEN 'Reviewing'
        WHEN @MasteryLevel > 0 THEN 'Learning'
        ELSE 'New'
      END
  WHERE UserID = @UserID AND WordID = @WordID;
END
GO
```

---

### 3. PHÂN HỆ KIỂM TRA & ĐÁNH GIÁ

#### Yêu cầu: Mini-test + Learning Dashboard

| Tính năng | Yêu cầu | Hiện tại | Status |
|----------|--------|---------|--------|
| **Mini-test** | Bài kiểm tra ngắn/chủ đề | ✅ MiniTests table | ✅ |
| **Auto-scoring** | Tự động chấm điểm | ✅ Có | ✅ |
| **Dashboard** | Biểu đồ tiến độ (Recharts) | ⚠️ Cơ bản | ⚠️ |
| **Word count** | Số từ đã thuộc vs. đang học | ✅ Có | ✅ |
| **Time-to-mastery** | Dự báo thời gian hoàn thành | ❌ Không | ❌ |
| **Weak words** | Top 5 từ dễ sai | ✅ Có | ✅ |

**Status:** 🟡 75% - Thiếu Time-to-mastery prediction

**Fix cần thiết:**
```sql
-- View: Dự báo thời gian hoàn thành
CREATE VIEW vw_MasteryTimelineProjection AS
SELECT 
  u.UserID,
  COUNT(DISTINCT uwp.WordID) AS TotalWords,
  SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) AS MasteredWords,
  CAST(SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) * 100.0 
       / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS CompletionPercentage,
  -- Estimate days to 100% mastery
  CASE 
    WHEN SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) = 0 
    THEN NULL  -- Not started yet
    ELSE CAST(
      COUNT(*) / 
      (SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) * 1.0) *
      DATEDIFF(DAY, MIN(uwp.LastReviewedAt), GETDATE())
    AS INT)
  END AS EstimatedDaysToMastery,
  DATEADD(DAY, 
    CASE 
      WHEN SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) = 0 THEN 365
      ELSE CAST(
        COUNT(*) / 
        (SUM(CASE WHEN uwp.MasteryLevel >= 8 THEN 1 ELSE 0 END) * 1.0) *
        DATEDIFF(DAY, MIN(uwp.LastReviewedAt), GETDATE())
      AS INT)
    END,
    GETDATE()
  ) AS ProjectedCompletionDate
FROM Users u
LEFT JOIN UserWordProgress uwp ON u.UserID = uwp.UserID
GROUP BY u.UserID;

-- Frontend endpoint
-- GET /api/user/dashboard
-- Response:
/*
{
  "totalWords": 600,
  "masteredWords": 150,
  "completionPercentage": 25,
  "estimatedDaysToMastery": 90,
  "projectedCompletionDate": "2026-08-05",
  "weakWords": [...],
  "weeklyProgress": [...]
}
*/
```

**Frontend Component Update:**
```typescript
// frontend/src/components/MasteryTimeline.tsx
export default function MasteryTimeline() {
  const [projection, setProjection] = useState(null);
  
  useEffect(() => {
    const fetchProjection = async () => {
      const data = await apiClient.get('/user/dashboard/mastery-timeline');
      setProjection(data);
    };
    fetchProjection();
  }, []);
  
  if (!projection) return null;
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-gray-400">Completion Progress</p>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${projection.completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-blue-400 mt-2">
          {projection.completionPercentage}% ({projection.masteredWords}/{projection.totalWords})
        </p>
      </div>
      
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <p className="text-sm text-gray-400">Estimated Mastery Date</p>
        <p className="text-2xl font-bold text-green-400 mt-2">
          {new Date(projection.projectedCompletionDate).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {projection.estimatedDaysToMastery} days at current pace
        </p>
      </div>
    </div>
  );
}
```

---

### 4. PHÂN HỆ QUẢN TRỊ HỆ THỐNG

#### Yêu cầu: Quản lý ngân hàng câu hỏi + Notification system

| Tính năng | Yêu cầu | Hiện tại | Status |
|----------|--------|---------|--------|
| **CRUD Questions** | Thêm/Sửa/Xóa câu hỏi | ✅ Có | ✅ |
| **Bulk import** | Import CSV/Excel câu hỏi | ❌ Không | ❌ |
| **Question stats** | Success rate của mỗi câu | ⚠️ Có nhưng chưa tối ưu | ⚠️ |
| **Email notifications** | Nhắc nhở qua Email | ❌ Không | ❌ |
| **Push notifications** | Thông báo đẩy (Web/Mobile) | ❌ Không | ❌ |
| **Daily reminders** | Nhắc nhở hàng ngày | ❌ Không | ❌ |

**Status:** 🔴 40% - Thiếu Notification system & Bulk import

**Fix cần thiết:**

#### 4.1 Thêm Notifications table
```sql
CREATE TABLE Notifications (
  NotificationID BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserID BIGINT NOT NULL,
  Title NVARCHAR(200) NOT NULL,
  Message NVARCHAR(2000) NOT NULL,
  Type NVARCHAR(30) NOT NULL,  -- 'DailyReminder', 'Achievement', 'WeakWords', 'CourseComplete'
  IsRead BIT DEFAULT 0,
  DeliveryChannel NVARCHAR(20) NOT NULL,  -- 'Email', 'PushNotification', 'InApp'
  CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
  ReadAt DATETIMEOFFSET NULL,
  ActionUrl NVARCHAR(500) NULL,
  FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
CREATE NONCLUSTERED INDEX IX_Notifications_UserID ON Notifications(UserID, CreatedAt DESC);

-- Insert daily reminder (via scheduled job)
INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, CreatedAt)
SELECT 
  u.UserID,
  N'Time to study!',
  N'You have 10 words waiting for review today. Practice now!',
  'DailyReminder',
  'Email',
  SYSDATETIMEOFFSET()
FROM Users u
WHERE u.IsActive = 1 
  AND NOT EXISTS (
    SELECT 1 FROM Notifications 
    WHERE UserID = u.UserID 
      AND CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)
      AND Type = 'DailyReminder'
  );
```

#### 4.2 Thêm Email Service
```javascript
// backend/src/services/notification.service.js
const nodemailer = require('nodemailer');

class NotificationService {
  static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  });

  static async sendDailyReminder(userId, userEmail, pendingWords) {
    const htmlContent = `
      <h2>📚 Thời gian ôn tập từ vựng!</h2>
      <p>Bạn có ${pendingWords} từ chờ ôn tập hôm nay.</p>
      <p>
        <a href="https://vocaboost.app/user/learn?from=email" 
           style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Bắt đầu ôn tập ngay
        </a>
      </p>
    `;

    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: '📚 VocaBoost - Nhắc nhở ôn tập hàng ngày',
      html: htmlContent
    });

    // Log notification to database
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('Email', sql.NVarChar, userEmail)
      .query(`
        INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel)
        VALUES (@UserID, 'Daily reminder sent', @Email, 'DailyReminder', 'Email')
      `);
  }

  static async sendAchievementNotification(userId, achievementName) {
    // Similar pattern for achievement notifications
  }
}

module.exports = NotificationService;
```

#### 4.3 Bulk Import Questions
```javascript
// backend/src/routes/admin.routes.js
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/questions/bulk-import', upload.single('file'), 
  checkPermission('MANAGE_QUESTIONS'), 
  AdminController.bulkImportQuestions);

// backend/src/controllers/admin.controller.js
static async bulkImportQuestions(req, res, next) {
  try {
    const file = req.file;
    const userId = req.user.id;
    
    // Parse CSV/Excel
    const data = await parseExcelFile(file.path);
    
    // Validate & insert
    const results = await AdminService.bulkInsertQuestions(data, userId);
    
    res.status(200).json({
      message: 'Bulk import successful',
      inserted: results.success,
      failed: results.failed,
      errors: results.errors
    });
  } catch (error) {
    next(error);
  }
}
```

---

## 📊 YÊU CẦU PHI CHỨC NĂNG (Non-Functional)

### 1. Tính Tương Tác (Interactivity)

| Yêu cầu | Hiện tại | Status | Fix |
|--------|---------|--------|-----|
| **Feedback âm thanh** | Đúng/sai → âm thanh | ✅ Có | ✅ |
| **Hiệu ứng chúc mừng** | Confetti, animation | ⚠️ Cơ bản | Enhance |
| **Real-time response** | <100ms feedback | ⚠️ ~200-300ms | Optimize |
| **Visual feedback** | Color change, highlight | ✅ Có | ✅ |

**Enhance animations:**
```typescript
// frontend/src/components/CorrectAnswerAnimation.tsx
export function CorrectAnswerAnimation() {
  return (
    <>
      {/* Confetti effect */}
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        numberOfPieces={100}
        recycle={false}
      />
      
      {/* Success message with animation */}
      <motion.div
        initial={{ scale: 0, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-3xl font-bold text-green-400">✨ Tuyệt vời!</p>
        <p className="text-gray-300 mt-2">+10 XP</p>
      </motion.div>
    </>
  );
}
```

---

### 2. Hiệu Năng (Performance)

| Yêu cầu | Target | Hiện tại | Status | Fix |
|--------|--------|---------|--------|-----|
| **Audio load** | <2s | ⚠️ ~3-4s | ⚠️ | Optimize |
| **Image load** | <1s | ⚠️ ~2-3s | ⚠️ | Compress + CDN |
| **API response** | <200ms | ⚠️ ~500-2000ms | ⚠️ | Caching |
| **Page load** | <2s | ⚠️ ~4-5s | ⚠️ | Code splitting |
| **Next.js build** | <1m | ❓ Unknown | ❓ Measure |

**Performance Optimizations:**

```typescript
// 1. Image optimization
// frontend/next.config.ts
export default {
  images: {
    domains: ['vocaboost-cdn.azureedge.net'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
};

// 2. Audio optimization
// Use compression + streaming
<audio 
  src="https://vocaboost-cdn.azureedge.net/audio/word-123.mp3?format=aac&bitrate=128k"
  preload="none"  // Lazy load
  onPlay={() => console.log('Audio started')}
/>

// 3. Caching strategy
// backend: Cache frequent queries (Redis)
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: 6379
});

// Cache flashcards for 1 hour
app.get('/api/user/flashcards', async (req, res) => {
  const cacheKey = `flashcards:${req.user.id}`;
  const cached = await client.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const flashcards = await UserService.getDueFlashcards(req.user.id);
  await client.setex(cacheKey, 3600, JSON.stringify(flashcards));
  res.json(flashcards);
});

// 4. Code splitting
// frontend: Dynamic imports
const LearningComponent = dynamic(() => import('@/components/Learning'), {
  loading: () => <LoadingSkeleton />,
});
```

---

### 3. Tính Khả Dụng (Usability)

| Yêu cầu | Hiện tại | Status |
|--------|---------|--------|
| **Minimal design** | ✅ Có | ✅ |
| **Focus on content** | ✅ Có | ✅ |
| **Mobile-friendly** | ⚠️ Partial | ⚠️ |
| **Touch-optimized** | ⚠️ Partial | ⚠️ |
| **Keyboard shortcuts** | ❌ Không | ❌ |
| **Dark mode** | ✅ Có | ✅ |
| **Accessibility (A11y)** | ⚠️ Basic | ⚠️ |

**Improvements needed:**

```typescript
// Keyboard shortcuts
// frontend/src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Submit answer
        handleSubmit();
      } else if (e.key === 'ArrowRight') {
        // Next flashcard
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        // Previous flashcard
        goToPrevious();
      } else if (e.key === ' ') {
        // Play audio
        playAudio();
      } else if (e.key === 'a') {
        // Select option A
        selectOption('A');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
}

// A11y improvements
<button 
  aria-label="Nghe phát âm từ" 
  aria-describedby="audio-help"
  onClick={playAudio}
>
  🔊
</button>

<img 
  src={word.imageUrl}
  alt={`Hình ảnh minh họa: ${word.term}`}
  role="img"
  loading="lazy"
/>

// Skip to main content
<a href="#main-content" className="sr-only">
  Skip to main content
</a>
<main id="main-content">
  {/* Content */}
</main>
```

---

### 4. Tính Ổn Định (Reliability)

| Yêu cầu | Hiện tại | Status | Fix |
|--------|---------|--------|-----|
| **Data sync** | Realtime | ⚠️ Delay 5-10s | Improve |
| **Error recovery** | Graceful | ⚠️ Partial | Add retry logic |
| **Offline support** | ❌ Không | ❌ | Add PWA |
| **Data backup** | ⚠️ Manual | ⚠️ | Automate |

**Improvements:**

```typescript
// 1. Service Worker for offline support
// frontend/public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('vocaboost-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/user/learn',
        '/user/progress',
        '/offline'
      ]);
    })
  );
});

// 2. Retry logic
// frontend/src/lib/api-client.ts
export async function apiClientWithRetry(
  url: string,
  options = {},
  maxRetries = 3
) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
      
      lastError = response.statusText;
      
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    } catch (error) {
      lastError = error;
    }
  }
  
  throw lastError;
}

// 3. Automated backups (SQL Server)
-- Create daily backup job
EXEC sp_add_schedule
  @schedule_name='DailyBackup',
  @freq_type=4,  -- Daily
  @freq_interval=1,
  @active_start_time=020000;  -- 2 AM

EXEC sp_attach_schedule
  @job_name='BackupVocaboPracticeDB',
  @schedule_name='DailyBackup';
```

---

### 5. Khả Năng Mở Rộng (Scalability)

| Yêu cầu | Hiện tại | Status | Plan |
|--------|---------|--------|------|
| **Multi-language** | ❌ Chỉ Tiếng Anh | ❌ | Add language table |
| **Other certificates** | ❌ Chỉ TOEIC | ❌ | Add certification table |
| **Database scaling** | ⚠️ Single server | ⚠️ | Azure SQL scale-out |
| **Frontend CDN** | ⚠️ Direct from server | ⚠️ | Use Azure CDN |
| **Microservices** | ❌ Monolith | ❌ | Future: Split services |

**Multitenancy Architecture:**

```sql
-- Add certification support
CREATE TABLE Certifications (
  CertificationID INT IDENTITY(1,1) PRIMARY KEY,
  CertificationCode NVARCHAR(20) NOT NULL UNIQUE,  -- 'TOEIC', 'IELTS', 'JLPT'
  CertificationName NVARCHAR(100) NOT NULL,
  Description NVARCHAR(500) NULL
);

-- Add language support
CREATE TABLE Languages (
  LanguageID INT IDENTITY(1,1) PRIMARY KEY,
  LanguageCode NVARCHAR(5) NOT NULL UNIQUE,  -- 'en', 'vi', 'ja'
  LanguageName NVARCHAR(100) NOT NULL
);

-- Link Words to Certifications
CREATE TABLE WordCertifications (
  WordID BIGINT NOT NULL,
  CertificationID INT NOT NULL,
  CONSTRAINT PK_WordCert PRIMARY KEY (WordID, CertificationID),
  FOREIGN KEY (WordID) REFERENCES Words(WordID) ON DELETE CASCADE,
  FOREIGN KEY (CertificationID) REFERENCES Certifications(CertificationID)
);

-- Add language_code to UI components
ALTER TABLE Users ADD PreferredLanguageID INT NULL;
ALTER TABLE Topics ADD LanguageID INT NOT NULL DEFAULT 1;  -- 1 = English
```

---

## 📝 BẢNG TÓNG HỢP ALIGNMENT

```
┌─────────────────────────────────────────────────────┐
│          VocaBoost Alignment Matrix                 │
├─────────────────────────────────────────────────────┤
│ Chức năng                         │ % | Status      │
├───────────────────────────────────┼───┼─────────────┤
│ 1. Content Management             │80 │ 🟡 80%     │
│    └─ TOEIC Examples              │30 │ 🔴 30%     │
│    └─ Part-based Classification   │ 0 │ 🔴 0%      │
│                                   │   │             │
│ 2. Learning & Interaction         │70 │ 🟡 70%     │
│    └─ Dictation                   │ 0 │ 🔴 0%      │
│    └─ DragDrop                    │ 0 │ 🔴 0%      │
│    └─ SRS Algorithm               │50 │ 🟡 50%     │
│                                   │   │             │
│ 3. Assessment & Evaluation        │75 │ 🟡 75%     │
│    └─ Time-to-Mastery Projection  │ 0 │ 🔴 0%      │
│                                   │   │             │
│ 4. Admin System                   │40 │ 🔴 40%     │
│    └─ Bulk Import                 │ 0 │ 🔴 0%      │
│    └─ Notification System         │ 0 │ 🔴 0%      │
│                                   │   │             │
│ Non-Functional:                   │   │             │
│    Interactivity                  │80 │ 🟡 80%     │
│    Performance                    │50 │ 🟡 50%     │
│    Usability (Mobile)             │60 │ 🟡 60%     │
│    Reliability (Offline)          │30 │ 🔴 30%     │
│    Scalability (Multi-cert)       │ 0 │ 🔴 0%      │
├───────────────────────────────────┼───┼─────────────┤
│ OVERALL ALIGNMENT                 │59 │ 🟡 59%     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 ĐỀ XUẤT CẤP PRIORITIZE

### 🔴 CRITICAL (Fix ngay để đủ yêu cầu)
1. **SRS Algorithm** (50% → 100%) - 4 giờ
2. **Dictation Questions** (0% → 100%) - 8 giờ
3. **TOEIC Examples** (30% → 100%) - 6 giờ
4. **Notification System** (0% → 100%) - 12 giờ
5. **Time-to-Mastery** (0% → 100%) - 4 giờ

### 🟡 HIGH (Improve user experience)
6. Performance Optimization - 16 giờ
7. Mobile Keyboard Shortcuts - 4 giờ
8. Offline Support (PWA) - 12 giờ
9. Part-based Classification - 6 giờ
10. Bulk Import - 6 giờ

### 🟢 MEDIUM (Future enhancement)
11. Multi-language Support - 20 giờ
12. Multi-certification - 16 giờ
13. Microservices - 40+ giờ

---

## ✅ FINAL CHECKLIST

Before launching, verify:

- [ ] **All 600 TOEIC words** in database (with audio, images)
- [ ] **TOEIC examples** properly tagged in ExampleSentences
- [ ] **Part 1-7 classification** complete
- [ ] **Dictation questions** available
- [ ] **SRS algorithm** producing correct NextReviewDate
- [ ] **Notifications** sending (Email + Push)
- [ ] **Time-to-mastery** displayed on dashboard
- [ ] **Mobile responsive** (<200ms load)
- [ ] **Offline support** working
- [ ] **A11y compliance** (WCAG 2.1 AA)
- [ ] **Performance** <2s page load, <200ms API

**Target: 100% Alignment by Week 6**

---

**Next Step: Execute fixes in priority order!**
