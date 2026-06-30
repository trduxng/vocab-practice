# 🎯 Hướng Dẫn Triển Khai Tính Năng - VocaBoost Complete

**Mục tiêu:** Biến VocaBoost từ 70% → 100% hoàn chỉnh như Quizlet/Luyentu

---

## 📌 QUICK SUMMARY

| Giai đoạn | Tính năng | Dev time | Priority |
|-----------|----------|----------|----------|
| **Phase 1** | Database & SRS Fix | 4h | 🔴 Critical |
| **Phase 2** | User Statistics & Achievements | 8h | 🔴 Critical |
| **Phase 3** | Test Session Tracking | 6h | 🟡 High |
| **Phase 4** | Gamification (Streak, XP, Leaderboard) | 16h | 🟡 High |
| **Phase 5** | Social Features | 20h | 🟢 Medium |
| **Phase 6** | Advanced Analytics | 12h | 🟢 Medium |
| **Phase 7** | Mobile & AI | 40h+ | 🔵 Future |

**Total:** 4-6 tuần (1 dev full-time)

---

## 🔴 PHASE 1: DATABASE & SRS FIX (4 hours)

### Bước 1: Tạo 14 bảng database mới

**File:** `Database/new-tables.sql`

```sql
-- Chạy script này để thêm các bảng thiếu

-- 1. UserSessions
CREATE TABLE UserSessions (
  SessionID BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserID BIGINT NOT NULL,
  Token NVARCHAR(1000) NOT NULL,
  DeviceInfo NVARCHAR(500) NULL,
  IPAddress NVARCHAR(50) NULL,
  IsActive BIT DEFAULT 1,
  CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
  ExpiresAt DATETIMEOFFSET NULL,
  FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
CREATE NONCLUSTERED INDEX IX_UserSessions_UserID ON UserSessions(UserID);
GO

-- 2. Achievements
CREATE TABLE Achievements (
  AchievementID INT IDENTITY(1,1) PRIMARY KEY,
  AchievementCode NVARCHAR(50) NOT NULL UNIQUE,
  AchievementName NVARCHAR(200) NOT NULL,
  Description NVARCHAR(500) NULL,
  IconUrl NVARCHAR(1000) NULL,
  Criteria NVARCHAR(1000) NULL,
  CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);
GO

-- 3. UserAchievements
CREATE TABLE UserAchievements (
  UserAchievementID BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserID BIGINT NOT NULL,
  AchievementID INT NOT NULL,
  UnlockedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
  CONSTRAINT UQ_UserAchievements UNIQUE (UserID, AchievementID),
  FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
  FOREIGN KEY (AchievementID) REFERENCES Achievements(AchievementID)
);
GO

-- 4. UserStatistics
CREATE TABLE UserStatistics (
  UserStatisticsID BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserID BIGINT NOT NULL UNIQUE,
  TotalWordsLearned INT DEFAULT 0,
  CurrentStreak INT DEFAULT 0,
  LongestStreak INT DEFAULT 0,
  TotalXP INT DEFAULT 0,
  CurrentLevel INT DEFAULT 1,
  TotalMinutesStudied INT DEFAULT 0,
  LastStudyDate DATETIMEOFFSET NULL,
  AccuracyRate DECIMAL(5,2) DEFAULT 0,
  UpdatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
  FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
CREATE NONCLUSTERED INDEX IX_UserStatistics_UserID ON UserStatistics(UserID);
GO

-- 5. DailyStreak
CREATE TABLE DailyStreak (
  DailyStreakID BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserID BIGINT NOT NULL,
  StudyDate DATE NOT NULL,
  MinutesStudied INT DEFAULT 0,
  ExercisesCompleted INT DEFAULT 0,
  IsComplete BIT DEFAULT 0,
  CONSTRAINT UQ_DailyStreak UNIQUE (UserID, StudyDate),
  FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
CREATE NONCLUSTERED INDEX IX_DailyStreak_UserID ON DailyStreak(UserID, StudyDate);
GO

-- 6. TestSessions
CREATE TABLE TestSessions (
  TestSessionID BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserID BIGINT NOT NULL,
  MiniTestID BIGINT NOT NULL,
  StartedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
  CompletedAt DATETIMEOFFSET NULL,
  TotalScore DECIMAL(5,2) DEFAULT 0,
  TotalQuestions INT DEFAULT 0,
  CorrectAnswers INT DEFAULT 0,
  Status NVARCHAR(30) DEFAULT 'In Progress',
  FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
  FOREIGN KEY (MiniTestID) REFERENCES MiniTests(MiniTestID)
);
CREATE NONCLUSTERED INDEX IX_TestSessions_UserID ON TestSessions(UserID, StartedAt);
GO

-- 7. TestSessionAnswers
CREATE TABLE TestSessionAnswers (
  TestSessionAnswerID BIGINT IDENTITY(1,1) PRIMARY KEY,
  TestSessionID BIGINT NOT NULL,
  QuestionID BIGINT NOT NULL,
  SubmittedAnswer NVARCHAR(1000) NOT NULL,
  IsCorrect BIT NOT NULL,
  Score DECIMAL(5,2) DEFAULT 0,
  TimeSpent INT DEFAULT 0,
  AnsweredAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
  FOREIGN KEY (TestSessionID) REFERENCES TestSessions(TestSessionID) ON DELETE CASCADE,
  FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID)
);
GO

-- 8-14. Các bảng khác (UCourseProgress, Synonyms, v.v.)
-- ... (xem COMPREHENSIVE_ANALYSIS.md)
```

### Bước 2: Tạo Stored Procedures

Xem file [BUG_REPORT_AND_FIXES.md](BUG_REPORT_AND_FIXES.md#bug-2-stored-procedure-uspsubmitquestionattempt-không-tồn-tại) cho SP `usp_SubmitQuestionAttempt`

### Bước 3: Tạo Triggers

```sql
-- Trigger 1: Auto-init UserWordProgress cho user mới
CREATE TRIGGER tr_InitUserWordProgress
ON Users AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  
  INSERT INTO UserStatistics (UserID)
  SELECT UserID FROM inserted WHERE UserRole = 'Learner';
  
  INSERT INTO UserWordProgress (UserID, WordID, MasteryLevel, EaseFactor, MemoryStatus)
  SELECT i.UserID, w.WordID, 0, 2.5, 'New'
  FROM inserted i
  CROSS JOIN Words w
  WHERE i.UserRole = 'Learner';
END
GO

-- Trigger 2: Cập nhật Streak khi user học trong ngày
CREATE TRIGGER tr_UpdateStreak
ON ExerciseAttempts AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  
  DECLARE @UserID BIGINT, @AttemptedAt DATETIMEOFFSET;
  
  SELECT TOP 1 @UserID = UserID, @AttemptedAt = AttemptedAt FROM inserted;
  
  DECLARE @Today DATE = CAST(@AttemptedAt AS DATE);
  DECLARE @Yesterday DATE = DATEADD(DAY, -1, @Today);
  
  -- Check if user has entry for today
  IF NOT EXISTS (SELECT 1 FROM DailyStreak WHERE UserID = @UserID AND StudyDate = @Today)
  BEGIN
    -- Check if yesterday has entry (for streak continuity)
    DECLARE @YesterdayComplete BIT = 
      CASE WHEN EXISTS (SELECT 1 FROM DailyStreak WHERE UserID = @UserID AND StudyDate = @Yesterday AND IsComplete = 1)
      THEN 1 ELSE 0 END;
    
    INSERT INTO DailyStreak (UserID, StudyDate, ExercisesCompleted, IsComplete)
    VALUES (@UserID, @Today, 1, 0);
  END
  ELSE
  BEGIN
    UPDATE DailyStreak
    SET ExercisesCompleted = ExercisesCompleted + 1
    WHERE UserID = @UserID AND StudyDate = @Today;
  END
  
  -- Update UserStatistics
  DECLARE @CurrentStreak INT = (
    SELECT COUNT(*) 
    FROM DailyStreak 
    WHERE UserID = @UserID 
    AND StudyDate >= DATEADD(DAY, -30, @Today)
    AND IsComplete = 1
    AND StudyDate NOT IN (
      SELECT DATEADD(DAY, number, @Today - 30)
      FROM (SELECT ROW_NUMBER() OVER (ORDER BY @@SPID) - 1 AS number 
            FROM sys.all_columns) AS numbers
      WHERE DATEADD(DAY, number, @Today - 30) NOT IN (
        SELECT StudyDate FROM DailyStreak WHERE UserID = @UserID AND IsComplete = 1
      )
    )
  );
  
  UPDATE UserStatistics
  SET CurrentStreak = @CurrentStreak,
      LastStudyDate = @AttemptedAt,
      UpdatedAt = SYSDATETIMEOFFSET()
  WHERE UserID = @UserID;
END
GO
```

### Bước 4: Thêm Indexes

```sql
-- Performance indexes
CREATE NONCLUSTERED INDEX IX_UserWordProgress_NextReviewDate 
ON UserWordProgress(UserID, NextReviewDate) 
INCLUDE (MasteryLevel, MemoryStatus);

CREATE NONCLUSTERED INDEX IX_ExerciseAttempts_UserAttemptedAt
ON ExerciseAttempts(UserID, AttemptedAt) 
INCLUDE (IsCorrect, ScoreAwarded);

CREATE NONCLUSTERED INDEX IX_Words_DifficultyLevel
ON Words(DifficultyLevel)
INCLUDE (Term, Meaning);

CREATE NONCLUSTERED INDEX IX_Questions_QuestionType
ON Questions(QuestionType)
INCLUDE (WordID, QuestionText);
```

---

## 🟡 PHASE 2: USER STATISTICS & ACHIEVEMENTS (8 hours)

### Backend Implementation

**File:** `backend/src/services/statistics.service.js` (NEW)

```javascript
const { sql, poolPromise } = require('../config/db');

class StatisticsService {
  // Lấy statistics của user
  static async getUserStatistics(userId) {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT 
          TotalWordsLearned,
          CurrentStreak,
          LongestStreak,
          TotalXP,
          CurrentLevel,
          TotalMinutesStudied,
          AccuracyRate,
          LastStudyDate
        FROM UserStatistics
        WHERE UserID = @UserID
      `);
    
    return result.recordset[0] || {};
  }
  
  // Cập nhật XP khi user hoàn thành exercise
  static async addXP(userId, xpAmount, reason = 'exercise') {
    const pool = await poolPromise;
    
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('XPAmount', sql.Int, xpAmount)
      .query(`
        UPDATE UserStatistics
        SET TotalXP = TotalXP + @XPAmount,
            CurrentLevel = (TotalXP + @XPAmount) / 100 + 1,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE UserID = @UserID
      `);
  }
  
  // Unlock achievement
  static async unlockAchievement(userId, achievementCode) {
    const pool = await poolPromise;
    
    try {
      // Lấy achievementId
      const achResult = await pool.request()
        .input('AchievementCode', sql.NVarChar, achievementCode)
        .query('SELECT AchievementID FROM Achievements WHERE AchievementCode = @AchievementCode');
      
      if (achResult.recordset.length === 0) return false;
      
      const achievementId = achResult.recordset[0].AchievementID;
      
      // Insert vào UserAchievements nếu chưa có
      await pool.request()
        .input('UserID', sql.BigInt, userId)
        .input('AchievementID', sql.Int, achievementId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM UserAchievements WHERE UserID = @UserID AND AchievementID = @AchievementID)
          BEGIN
            INSERT INTO UserAchievements (UserID, AchievementID)
            VALUES (@UserID, @AchievementID)
          END
        `);
      
      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }
  
  // Check & unlock achievements dựa trên điều kiện
  static async checkAndUnlockAchievements(userId) {
    const pool = await poolPromise;
    const stats = await this.getUserStatistics(userId);
    
    // Achievement 1: Bắt đầu học (1 từ)
    if (stats.TotalWordsLearned >= 1) {
      await this.unlockAchievement(userId, 'FIRST_WORD');
    }
    
    // Achievement 2: 100 từ
    if (stats.TotalWordsLearned >= 100) {
      await this.unlockAchievement(userId, '100_WORDS');
    }
    
    // Achievement 3: Perfect streak (7 ngày)
    if (stats.CurrentStreak >= 7) {
      await this.unlockAchievement(userId, 'WEEK_WARRIOR');
    }
    
    // Achievement 4: 1000 XP
    if (stats.TotalXP >= 1000) {
      await this.unlockAchievement(userId, 'XP_MASTER');
    }
    
    // Achievement 5: 100% accuracy trên 10 exercises
    const accResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT COUNT(*) AS perfectSessions
        FROM (
          SELECT TestSessionID
          FROM TestSessionAnswers
          WHERE TestSessionID IN (
            SELECT TestSessionID FROM TestSessions WHERE UserID = @UserID
          )
          GROUP BY TestSessionID
          HAVING SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END) = 0
        ) AS perfectTests
      `);
    
    if (accResult.recordset[0].perfectSessions >= 10) {
      await this.unlockAchievement(userId, 'PERFECT_SCORE');
    }
  }
  
  // Lấy danh sách achievements của user
  static async getUserAchievements(userId) {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT 
          a.AchievementID,
          a.AchievementCode,
          a.AchievementName,
          a.Description,
          a.IconUrl,
          ua.UnlockedAt
        FROM UserAchievements ua
        JOIN Achievements a ON ua.AchievementID = a.AchievementID
        WHERE ua.UserID = @UserID
        ORDER BY ua.UnlockedAt DESC
      `);
    
    return result.recordset;
  }
}

module.exports = StatisticsService;
```

**File:** `backend/src/routes/user.routes.js` (UPDATE)

```javascript
const express = require('express');
const UserController = require('../controllers/user.controller');
const StatisticsController = require('../controllers/statistics.controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware.verifyToken);

// Existing routes
router.post('/submit-answer', UserController.submitAnswer);
router.get('/flashcards', UserController.getFlashcards);

// NEW: Statistics & Achievements
router.get('/statistics', StatisticsController.getStatistics);
router.get('/achievements', StatisticsController.getAchievements);

module.exports = router;
```

**File:** `backend/src/controllers/statistics.controller.js` (NEW)

```javascript
const StatisticsService = require('../services/statistics.service');

class StatisticsController {
  static async getStatistics(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await StatisticsService.getUserStatistics(userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
  
  static async getAchievements(req, res, next) {
    try {
      const userId = req.user.id;
      const achievements = await StatisticsService.getUserAchievements(userId);
      res.status(200).json(achievements);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StatisticsController;
```

### Frontend Implementation

**File:** `frontend/src/components/StatisticsCard.tsx` (NEW)

```typescript
import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Trophy, Flame, Zap, BookOpen } from 'lucide-react';

interface Statistics {
  TotalWordsLearned: number;
  CurrentStreak: number;
  TotalXP: number;
  CurrentLevel: number;
  AccuracyRate: number;
}

export default function StatisticsCard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.get('/user/statistics');
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Words Learned */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Words Learned</p>
            <p className="text-2xl font-bold text-blue-400">{stats.TotalWordsLearned}</p>
          </div>
          <BookOpen className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Streak</p>
            <p className="text-2xl font-bold text-orange-400">{stats.CurrentStreak}</p>
          </div>
          <Flame className="w-8 h-8 text-orange-500" />
        </div>
      </div>

      {/* Total XP */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total XP</p>
            <p className="text-2xl font-bold text-purple-400">{stats.TotalXP}</p>
          </div>
          <Zap className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      {/* Level */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Level</p>
            <p className="text-2xl font-bold text-green-400">{stats.CurrentLevel}</p>
          </div>
          <Trophy className="w-8 h-8 text-green-500" />
        </div>
      </div>
    </div>
  );
}
```

**File:** `frontend/src/components/AchievementsShowcase.tsx` (NEW)

```typescript
import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Lock } from 'lucide-react';

interface Achievement {
  AchievementID: number;
  AchievementCode: string;
  AchievementName: string;
  Description: string;
  IconUrl: string;
  UnlockedAt: string;
}

export default function AchievementsShowcase() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await apiClient.get('/user/achievements');
        setAchievements(data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Achievements</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.AchievementID}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center hover:shadow-lg transition"
          >
            <img 
              src={achievement.IconUrl} 
              alt={achievement.AchievementName}
              className="w-12 h-12 mx-auto mb-2"
            />
            <p className="font-bold text-sm">{achievement.AchievementName}</p>
            <p className="text-xs text-gray-400 mt-1">{achievement.Description}</p>
            <p className="text-xs text-yellow-400 mt-2">
              {new Date(achievement.UnlockedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🟡 PHASE 3: TEST SESSION TRACKING (6 hours)

### Implementation

**Backend SQL:**
```sql
-- Trigger tự động complete test session
CREATE TRIGGER tr_CompleteTestSession
ON TestSessionAnswers AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  
  DECLARE @TestSessionID BIGINT, @QuestionCount INT, @CorrectCount INT;
  
  SELECT @TestSessionID = TestSessionID FROM inserted;
  
  -- Count questions
  SELECT @QuestionCount = COUNT(*) 
  FROM TestSessionAnswers 
  WHERE TestSessionID = @TestSessionID;
  
  -- Count correct
  SELECT @CorrectCount = SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END)
  FROM TestSessionAnswers
  WHERE TestSessionID = @TestSessionID;
  
  -- Update test session
  UPDATE TestSessions
  SET TotalQuestions = @QuestionCount,
      CorrectAnswers = @CorrectCount,
      TotalScore = (@CorrectCount * 100.0 / @QuestionCount)
  WHERE TestSessionID = @TestSessionID;
END
GO
```

**Backend Routes:**
```javascript
// backend/src/routes/user.routes.js
router.post('/test-sessions/start', UserController.startTestSession);
router.post('/test-sessions/:sessionId/answers', UserController.submitTestAnswer);
router.get('/test-sessions/:sessionId/details', UserController.getTestSessionDetails);
router.post('/test-sessions/:sessionId/complete', UserController.completeTestSession);
```

---

## 🟡 PHASE 4: GAMIFICATION (16 hours)

### Daily Challenge Feature

**Backend:**
```javascript
// GET /api/user/daily-challenge
static async getDailyChallenge(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  // Lấy hoặc tạo challenge của hôm nay
  const challenge = await pool.request()
    .input('UserID', sql.BigInt, userId)
    .input('Date', sql.DateTime, today)
    .query(`
      SELECT * FROM DailyChallenges
      WHERE UserID = @UserID AND ChallengeDate = @Date
    `);
  
  if (challenge.recordset.length === 0) {
    // Tạo challenge mới
    const randomTopic = await getRandomTopic();
    const words = await getWordsFromTopic(randomTopic.TopicID, 5);
    
    // Insert challenge
    // ...
  }
  
  return challenge.recordset[0];
}
```

### Leaderboard Feature

```javascript
// GET /api/leaderboard?period=week
static async getLeaderboard(period = 'week') {
  const sql = `
    SELECT TOP 100
      u.UserID,
      u.FullName,
      us.TotalXP,
      us.CurrentLevel,
      us.CurrentStreak,
      ROW_NUMBER() OVER (ORDER BY us.TotalXP DESC) AS Rank
    FROM UserStatistics us
    JOIN Users u ON us.UserID = u.UserID
    WHERE u.IsActive = 1
    ORDER BY us.TotalXP DESC
  `;
  
  // ... execute query
}
```

---

## 📋 DEPLOYMENT CHECKLIST

```
[ ] Phase 1 - Database & SRS
  [ ] Run new-tables.sql
  [ ] Create all stored procedures
  [ ] Create all triggers
  [ ] Create indexes
  [ ] Test: User can submit answer and SRS updates
  [ ] Test: New user gets UserWordProgress records
  
[ ] Phase 2 - Statistics
  [ ] Backend: StatisticsService
  [ ] Backend: StatisticsController
  [ ] Backend: Routes
  [ ] Frontend: StatisticsCard
  [ ] Frontend: AchievementsShowcase
  [ ] Test: Stats display correctly
  
[ ] Phase 3 - Test Sessions
  [ ] Backend: TestSession endpoints
  [ ] Frontend: Session tracking
  [ ] Test: Can view test history
  
[ ] Phase 4 - Gamification
  [ ] Daily Challenge
  [ ] Leaderboard
  [ ] Streak tracking
  [ ] XP system
  
[ ] Full System Test
  [ ] Register new user
  [ ] Do 10 exercises
  [ ] Check stats
  [ ] Verify achievements unlocked
  [ ] Verify streak increased
  [ ] View test history
  [ ] Compare with friend on leaderboard
  
[ ] Performance Test
  [ ] Load test 100 concurrent users
  [ ] Check query response time < 200ms
  [ ] Check N+1 queries fixed
  
[ ] Deploy to Production
  [ ] Backup production database
  [ ] Run migration scripts
  [ ] Verify deployment
  [ ] Monitor logs
```

---

## 🎯 SUCCESS CRITERIA

✅ **Phase 1 Complete:**
- SRS algorithm working (NextReviewDate updates correctly)
- New users can start learning immediately
- No 500 errors on submit-answer

✅ **Phase 2 Complete:**
- Users see their stats on dashboard
- Achievements unlock when conditions are met
- Stats persist across sessions

✅ **Phase 3 Complete:**
- Users can view full test history
- Can see detailed answers per question
- Test results saved correctly

✅ **Phase 4 Complete:**
- Streak counter increments daily
- XP awarded correctly
- Leaderboard shows top 100
- Daily challenge available

✅ **All Phases:**
- No performance degradation
- All API tests passing
- Zero critical errors in logs
- User feedback positive

---

## 🚀 ESTIMATED TIMELINE

```
Week 1:
  Mon-Tue: Database setup + SP/Triggers
  Wed-Thu: Phase 1 testing
  Fri: Code review + fixes

Week 2:
  Mon-Wed: Phase 2 (Backend + Frontend)
  Thu-Fri: Phase 2 testing

Week 3:
  Mon-Tue: Phase 3 (Test Sessions)
  Wed: Phase 4 kickoff (Gamification)
  Thu-Fri: Phase 4 development

Week 4:
  Mon-Wed: Phase 4 completion
  Thu-Fri: Full system testing + bug fixes

Week 5:
  Mon-Tue: Performance tuning
  Wed-Fri: Production deployment + monitoring
```

---

**Next Step:** Execute Phase 1 immediately!
