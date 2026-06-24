const { sql, poolPromise } = require("../config/db");

const XP_REWARDS = Object.freeze({
  LearnWord: 5,
  PracticeComplete: 10,
  MiniTestComplete: 20,
  DailyLogin: 5,
  AchievementUnlock: 50,
});

const ACHIEVEMENT_SEED = [
  ["FIRST_WORD", "First Word", "Learn your first vocabulary word.", "🌱", "WORDS_LEARNED", 1, 1, 10],
  ["WORDS_100", "First 100 Words", "Learn 100 vocabulary words.", "📚", "WORDS_LEARNED", 100, 2, 100],
  ["STREAK_7", "7 Day Streak", "Learn for 7 consecutive days.", "🔥", "STREAK_DAYS", 7, 3, 50],
  ["STREAK_30", "30 Day Streak", "Learn for 30 consecutive days.", "⚡", "STREAK_DAYS", 30, 4, 150],
  ["TEST_SCORE_90", "Test Ace", "Score at least 90 percent on a mini test.", "🎯", "TEST_SCORE", 90, 5, 50],
  ["LEVEL_5", "Level Five", "Reach learner level 5.", "🏆", "LEVEL", 5, 6, 100],
];

class GamificationService {
  static schemaReady = null;

  static getDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  static getLevelState(totalXP = 0) {
    const safeXP = Math.max(0, Number(totalXP) || 0);
    let currentLevel = 1;
    let levelStartXP = 0;
    let xpForNextLevel = 100;

    while (safeXP >= levelStartXP + xpForNextLevel) {
      levelStartXP += xpForNextLevel;
      currentLevel += 1;
      xpForNextLevel = currentLevel * 100;
    }

    const currentLevelXP = safeXP - levelStartXP;
    return {
      totalXP: safeXP,
      currentLevel,
      currentLevelXP,
      xpForNextLevel,
      xpToNextLevel: xpForNextLevel - currentLevelXP,
      nextLevelTotalXP: levelStartXP + xpForNextLevel,
      levelProgress: Math.round((currentLevelXP / xpForNextLevel) * 100),
    };
  }

  static async ensureSchema() {
    if (!this.schemaReady) {
      this.schemaReady = this.createSchema().catch((error) => {
        this.schemaReady = null;
        throw error;
      });
    }
    return this.schemaReady;
  }

  static async createSchema() {
    const pool = await poolPromise;
    await pool.request().query(`
      IF COL_LENGTH(N'dbo.Users', N'TotalXP') IS NULL
      BEGIN
        ALTER TABLE dbo.Users
          ADD TotalXP INT NOT NULL CONSTRAINT DF_Users_TotalXP DEFAULT (0);
      END;

      IF COL_LENGTH(N'dbo.Users', N'CurrentLevel') IS NULL
      BEGIN
        ALTER TABLE dbo.Users
          ADD CurrentLevel INT NOT NULL CONSTRAINT DF_Users_CurrentLevel DEFAULT (1);
      END;

      IF OBJECT_ID(N'dbo.UserXPEvents', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.UserXPEvents (
          XPEventID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserXPEvents PRIMARY KEY,
          UserID BIGINT NOT NULL CONSTRAINT FK_UserXPEvents_UserID REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
          EventType NVARCHAR(50) NOT NULL,
          XPAmount INT NOT NULL CONSTRAINT CK_UserXPEvents_XPAmount CHECK (XPAmount > 0),
          SourceKey NVARCHAR(200) NULL,
          MetadataJson NVARCHAR(MAX) NULL,
          CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserXPEvents_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
          CONSTRAINT CK_UserXPEvents_MetadataJson CHECK (MetadataJson IS NULL OR ISJSON(MetadataJson) = 1)
        );
      END;

      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'UX_UserXPEvents_User_Event_Source'
          AND object_id = OBJECT_ID(N'dbo.UserXPEvents')
      )
      BEGIN
        CREATE UNIQUE INDEX UX_UserXPEvents_User_Event_Source
        ON dbo.UserXPEvents(UserID, EventType, SourceKey)
        WHERE SourceKey IS NOT NULL;
      END;

      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'IX_UserXPEvents_UserID_CreatedAt'
          AND object_id = OBJECT_ID(N'dbo.UserXPEvents')
      )
      BEGIN
        CREATE INDEX IX_UserXPEvents_UserID_CreatedAt
        ON dbo.UserXPEvents(UserID, CreatedAt DESC)
        INCLUDE (EventType, XPAmount);
      END;

      IF OBJECT_ID(N'dbo.Achievements', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.Achievements (
          AchievementID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Achievements PRIMARY KEY,
          Code NVARCHAR(80) NOT NULL CONSTRAINT UQ_Achievements_Code UNIQUE,
          Name NVARCHAR(200) NOT NULL,
          Description NVARCHAR(500) NOT NULL,
          Icon NVARCHAR(20) NOT NULL,
          CriteriaType NVARCHAR(50) NOT NULL,
          CriteriaValue INT NOT NULL CONSTRAINT CK_Achievements_CriteriaValue CHECK (CriteriaValue > 0),
          DisplayOrder INT NOT NULL,
          IsActive BIT NOT NULL CONSTRAINT DF_Achievements_IsActive DEFAULT (1),
          XPReward INT NOT NULL CONSTRAINT DF_Achievements_XPReward DEFAULT (50),
          CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Achievements_CreatedAt DEFAULT (SYSDATETIMEOFFSET())
        );
      END;

      IF COL_LENGTH(N'dbo.Achievements', N'XPReward') IS NULL
      BEGIN
        ALTER TABLE dbo.Achievements
          ADD XPReward INT NOT NULL CONSTRAINT DF_Achievements_XPReward DEFAULT (50);
      END;

      IF OBJECT_ID(N'dbo.UserAchievements', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.UserAchievements (
          UserAchievementID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserAchievements PRIMARY KEY,
          UserID BIGINT NOT NULL CONSTRAINT FK_UserAchievements_UserID REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
          AchievementID INT NOT NULL CONSTRAINT FK_UserAchievements_AchievementID REFERENCES dbo.Achievements(AchievementID),
          UnlockedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserAchievements_UnlockedAt DEFAULT (SYSDATETIMEOFFSET()),
          SeenAt DATETIMEOFFSET(7) NULL,
          CONSTRAINT UQ_UserAchievements_User_Achievement UNIQUE (UserID, AchievementID)
        );
      END;
    `);

    for (const achievement of ACHIEVEMENT_SEED) {
      const [code, name, description, icon, criteriaType, criteriaValue, displayOrder, xpReward] = achievement;
      await pool.request()
        .input("Code", sql.NVarChar(80), code)
        .input("Name", sql.NVarChar(200), name)
        .input("Description", sql.NVarChar(500), description)
        .input("Icon", sql.NVarChar(20), icon)
        .input("CriteriaType", sql.NVarChar(50), criteriaType)
        .input("CriteriaValue", sql.Int, criteriaValue)
        .input("DisplayOrder", sql.Int, displayOrder)
        .input("XPReward", sql.Int, xpReward || 50)
        .query(`
          MERGE dbo.Achievements AS target
          USING (SELECT @Code AS Code) AS source
          ON target.Code = source.Code
          WHEN MATCHED THEN
            UPDATE SET Name = @Name,
                       Description = @Description,
                       Icon = @Icon,
                       CriteriaType = @CriteriaType,
                       CriteriaValue = @CriteriaValue,
                       DisplayOrder = @DisplayOrder,
                       XPReward = @XPReward,
                       IsActive = 1
          WHEN NOT MATCHED THEN
            INSERT (Code, Name, Description, Icon, CriteriaType, CriteriaValue, DisplayOrder, XPReward)
            VALUES (@Code, @Name, @Description, @Icon, @CriteriaType, @CriteriaValue, @DisplayOrder, @XPReward);
        `);
    }
  }

  static async awardXP(userId, { eventType, sourceKey = null, metadata = null, xpAmount = null } = {}) {
    await this.ensureSchema();
    const amount = xpAmount !== null ? xpAmount : XP_REWARDS[eventType];
    if (amount === undefined || amount === null) throw new Error(`Unsupported XP event type: ${eventType}`);

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      const result = await request
        .input("UserID", sql.BigInt, userId)
        .input("EventType", sql.NVarChar(50), eventType)
        .input("XPAmount", sql.Int, amount)
        .input("SourceKey", sql.NVarChar(200), sourceKey)
        .input("MetadataJson", sql.NVarChar(sql.MAX), metadata ? JSON.stringify(metadata) : null)
        .query(`
          DECLARE @Inserted TABLE (XPEventID BIGINT, XPAmount INT);

          IF @SourceKey IS NULL OR NOT EXISTS (
            SELECT 1 FROM dbo.UserXPEvents
            WHERE UserID = @UserID AND EventType = @EventType AND SourceKey = @SourceKey
          )
          BEGIN
            INSERT dbo.UserXPEvents (UserID, EventType, XPAmount, SourceKey, MetadataJson)
            OUTPUT inserted.XPEventID, inserted.XPAmount INTO @Inserted
            VALUES (@UserID, @EventType, @XPAmount, @SourceKey, @MetadataJson);

            UPDATE dbo.Users
            SET TotalXP = ISNULL(TotalXP, 0) + @XPAmount,
                UpdatedAt = SYSDATETIMEOFFSET()
            WHERE UserID = @UserID;
          END;

          SELECT ISNULL((SELECT TOP 1 XPEventID FROM @Inserted), 0) AS xpEventId,
                 ISNULL((SELECT SUM(XPAmount) FROM @Inserted), 0) AS xpGained,
                 ISNULL((SELECT TotalXP FROM dbo.Users WHERE UserID = @UserID), 0) AS totalXP;
        `);

      const row = result.recordset[0] || {};
      const level = this.getLevelState(row.totalXP);
      await new sql.Request(transaction)
        .input("UserID", sql.BigInt, userId)
        .input("CurrentLevel", sql.Int, level.currentLevel)
        .query(`
          UPDATE dbo.Users SET CurrentLevel = @CurrentLevel WHERE UserID = @UserID
        `);

      await transaction.commit();
      const unlockedAchievements = (row.xpGained > 0 && eventType !== "AchievementUnlock") ? await this.checkAchievements(userId) : [];
      return {
        xpEventId: Number(row.xpEventId || 0),
        xpGained: Number(row.xpGained || 0),
        eventType,
        awarded: Number(row.xpGained || 0) > 0,
        ...level,
        unlockedAchievements,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async awardDailyLogin(userId) {
    return this.awardXP(userId, {
      eventType: "DailyLogin",
      sourceKey: `daily-login:${this.getDateKey()}`,
    });
  }

  static async checkAchievements(userId) {
    await this.ensureSchema();
    const profile = await this.getMetrics(userId);
    const pool = await poolPromise;
    const result = await pool.request()
      .input("UserID", sql.BigInt, userId)
      .input("WordsLearned", sql.Int, profile.wordsLearned)
      .input("StreakDays", sql.Int, profile.streak)
      .input("BestTestScore", sql.Int, profile.bestTestScore)
      .input("CurrentLevel", sql.Int, profile.currentLevel)
      .query(`
        INSERT dbo.UserAchievements (UserID, AchievementID)
        OUTPUT inserted.AchievementID AS id,
               inserted.UnlockedAt AS unlockedAt
        SELECT @UserID, a.AchievementID
        FROM dbo.Achievements a
        WHERE a.IsActive = 1
          AND NOT EXISTS (
            SELECT 1 FROM dbo.UserAchievements ua
            WHERE ua.UserID = @UserID AND ua.AchievementID = a.AchievementID
          )
          AND (
            (a.CriteriaType = N'WORDS_LEARNED' AND @WordsLearned >= a.CriteriaValue)
            OR (a.CriteriaType = N'STREAK_DAYS' AND @StreakDays >= a.CriteriaValue)
            OR (a.CriteriaType = N'TEST_SCORE' AND @BestTestScore >= a.CriteriaValue)
            OR (a.CriteriaType = N'LEVEL' AND @CurrentLevel >= a.CriteriaValue)
          );
      `);

    const unlockedIds = result.recordset.map((row) => Number(row.id));
    if (unlockedIds.length === 0) return [];
    
    const allAchievements = await this.getAchievements(userId, profile);
    const newlyUnlocked = allAchievements.filter((achievement) => unlockedIds.includes(achievement.id));

    // Award XP for each newly unlocked achievement!
    for (const ach of newlyUnlocked) {
      const rewardXP = ach.xpReward || 50;
      await this.awardXP(userId, {
        eventType: "AchievementUnlock",
        sourceKey: `achievement-unlock:${ach.code}`,
        metadata: { achievementCode: ach.code, achievementName: ach.label },
        xpAmount: rewardXP,
      }).catch((err) => {
        console.error(`[GamificationService.checkAchievements] Error awarding XP for ${ach.code}:`, err);
      });
    }

    return newlyUnlocked;
  }

  static async getMetrics(userId) {
    await this.ensureSchema();
    const pool = await poolPromise;
    const result = await pool.request()
      .input("UserID", sql.BigInt, userId)
      .query(`
        WITH DailyActivity AS (
          SELECT DISTINCT CAST(CreatedAt AS DATE) AS ActivityDate
          FROM dbo.UserXPEvents
          WHERE UserID = @UserID
            AND EventType IN (N'LearnWord', N'PracticeComplete', N'MiniTestComplete', N'DailyLogin')
          UNION
          SELECT DISTINCT CAST(AttemptedAt AS DATE) AS ActivityDate
          FROM dbo.ExerciseAttempts
          WHERE UserID = @UserID
        ),
        RankedActivity AS (
          SELECT ActivityDate,
                 MAX(ActivityDate) OVER () AS LatestDate,
                 ROW_NUMBER() OVER (ORDER BY ActivityDate DESC) AS rowNumber
          FROM DailyActivity
        )
        SELECT
          ISNULL((SELECT TotalXP FROM dbo.Users WHERE UserID = @UserID), 0) AS totalXP,
          ISNULL((SELECT COUNT(*) FROM dbo.UserWordProgress WHERE UserID = @UserID AND RepetitionCount > 0), 0) AS wordsLearned,
          ISNULL((SELECT MAX(Score) FROM dbo.MiniTestAttempts WHERE UserID = @UserID AND SubmittedAt IS NOT NULL), 0) AS bestTestScore,
          ISNULL((
            SELECT COUNT(*)
            FROM RankedActivity
            WHERE LatestDate >= DATEADD(day, -1, CAST(SYSDATETIMEOFFSET() AS DATE))
              AND DATEDIFF(day, ActivityDate, LatestDate) = rowNumber - 1
          ), 0) AS streak,
          ISNULL((
            SELECT SUM(XPAmount) FROM dbo.UserXPEvents
            WHERE UserID = @UserID
              AND CAST(CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
          ), 0) AS todayXP;
      `);
    const row = result.recordset[0] || {};
    return {
      wordsLearned: Number(row.wordsLearned || 0),
      bestTestScore: Number(row.bestTestScore || 0),
      streak: Number(row.streak || 0),
      todayXP: Number(row.todayXP || 0),
      ...this.getLevelState(row.totalXP),
    };
  }

  static async getAchievements(userId, metrics = null) {
    await this.ensureSchema();
    const profile = metrics || await this.getMetrics(userId);
    const pool = await poolPromise;
    const result = await pool.request()
      .input("UserID", sql.BigInt, userId)
      .query(`
        SELECT a.AchievementID AS id,
               a.Code AS code,
               a.Name AS label,
               a.Description AS description,
               a.Icon AS icon,
               a.CriteriaType AS criteriaType,
               a.CriteriaValue AS target,
               a.XPReward AS xpReward,
               CASE WHEN ua.UserAchievementID IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS unlocked,
               ua.UnlockedAt AS unlockedAt,
               CASE WHEN ua.SeenAt IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS seen
        FROM dbo.Achievements a
        LEFT JOIN dbo.UserAchievements ua
          ON ua.AchievementID = a.AchievementID AND ua.UserID = @UserID
        WHERE a.IsActive = 1
        ORDER BY a.DisplayOrder;
      `);
    return result.recordset.map((achievement) => {
      const progress = this.getAchievementProgress(achievement.criteriaType, profile);
      const target = Number(achievement.target || 1);
      return {
        ...achievement,
        id: Number(achievement.id),
        target,
        progress,
        progressPercentage: Math.min(100, Math.round((progress / target) * 100)),
      };
    });
  }

  static getAchievementProgress(criteriaType, metrics) {
    if (criteriaType === "WORDS_LEARNED") return metrics.wordsLearned;
    if (criteriaType === "STREAK_DAYS") return metrics.streak;
    if (criteriaType === "TEST_SCORE") return metrics.bestTestScore;
    if (criteriaType === "LEVEL") return metrics.currentLevel;
    return 0;
  }

  static async getProfile(userId) {
    await this.ensureSchema();
    await this.checkAchievements(userId);
    const metrics = await this.getMetrics(userId);
    const achievements = await this.getAchievements(userId, metrics);
    return {
      ...metrics,
      achievements,
      unseenAchievements: achievements.filter((achievement) => achievement.unlocked && !achievement.seen),
    };
  }

  static async markAchievementsSeen(userId, achievementIds = []) {
    await this.ensureSchema();
    const pool = await poolPromise;
    const request = pool.request().input("UserID", sql.BigInt, userId);
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      await request.query(`
        UPDATE dbo.UserAchievements
        SET SeenAt = COALESCE(SeenAt, SYSDATETIMEOFFSET())
        WHERE UserID = @UserID;
      `);
      return;
    }

    const safeIds = achievementIds.map(Number).filter(Number.isInteger);
    if (safeIds.length === 0) return;
    await request.query(`
      UPDATE dbo.UserAchievements
      SET SeenAt = COALESCE(SeenAt, SYSDATETIMEOFFSET())
      WHERE UserID = @UserID
        AND AchievementID IN (${safeIds.join(",")});
    `);
  }
}

GamificationService.XP_REWARDS = XP_REWARDS;

module.exports = GamificationService;
