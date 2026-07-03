const { sql, poolPromise } = require("../config/db");

const XP_REWARDS = Object.freeze({
  LearnWord: 5,
  PracticeComplete: 10,
  MiniTestComplete: 20,
  DailyLogin: 5,
  AchievementUnlock: 50,
});

const ACHIEVEMENT_SEED = [
  ["FIRST_WORD", "Từ Đầu Tiên", "Học từ vựng đầu tiên của bạn.", "🌱", "WORDS_LEARNED", 1, 1, 10],
  ["WORDS_100", "100 Từ Đầu Tiên", "Học 100 từ vựng.", "📚", "WORDS_LEARNED", 100, 2, 100],
  ["STREAK_7", "Chuỗi 7 Ngày", "Học tập 7 ngày liên tiếp.", "🔥", "STREAK_DAYS", 7, 3, 50],
  ["STREAK_30", "Chuỗi 30 Ngày", "Học tập 30 ngày liên tiếp.", "⚡", "STREAK_DAYS", 30, 4, 150],
  ["TEST_SCORE_90", "Đỉnh Cao Bài Kiểm Tra", "Đạt ít nhất 90% trong bài kiểm tra.", "🎯", "TEST_SCORE", 90, 5, 50],
  ["LEVEL_5", "Cấp Độ Năm", "Đạt cấp độ học viên 5.", "🏆", "LEVEL", 5, 6, 100],
  ["FIRST_MINI_TEST", "Bài Kiểm Tra Đầu Tiên", "Hoàn thành bài kiểm tra đầu tiên của bạn.", "📝", "TEST_SCORE", 1, 7, 20],
];

class GamificationService {
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

  static async seedAchievements() {
    const pool = await poolPromise;
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
    const amount = xpAmount !== null ? xpAmount : XP_REWARDS[eventType];
    if (amount === undefined || amount === null) throw new Error(`Loại sự kiện XP không được hỗ trợ: ${eventType}`);

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
      return {
        xpEventId: Number(row.xpEventId || 0),
        xpGained: Number(row.xpGained || 0),
        eventType,
        awarded: Number(row.xpGained || 0) > 0,
        ...level,
        unlockedAchievements: [],
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
}

GamificationService.XP_REWARDS = XP_REWARDS;

module.exports = GamificationService;
