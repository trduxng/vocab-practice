const { sql, poolPromise } = require("../../config/db");
const GamificationService = require("./gamification.service");

const LEVEL_SEED = [
  ["TOEIC_300", "TOEIC 300", 300, "Build a practical foundation with essential everyday TOEIC vocabulary.", 1, "sky"],
  ["TOEIC_500", "TOEIC 500", 500, "Expand workplace vocabulary and improve response speed.", 2, "emerald"],
  ["TOEIC_700", "TOEIC 700", 700, "Master higher-frequency business and academic contexts.", 3, "amber"],
  ["TOEIC_900", "TOEIC 900", 900, "Refine advanced vocabulary for high-score TOEIC performance.", 4, "violet"],
];

class LearningPathService {
  static schemaReady = null;

  static async ensureSchema() {
    if (!this.schemaReady) {
      this.schemaReady = this.createSchema().catch((error) => { this.schemaReady = null; throw error; });
    }
    return this.schemaReady;
  }

  static async createSchema() {
    const pool = await poolPromise;
    await pool.request().query(`
      IF OBJECT_ID(N'dbo.LearningPathLevels', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.LearningPathLevels (
          LearningPathLevelID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_LearningPathLevels PRIMARY KEY,
          LevelCode NVARCHAR(30) NOT NULL CONSTRAINT UQ_LearningPathLevels_LevelCode UNIQUE,
          LevelName NVARCHAR(100) NOT NULL,
          TargetScore INT NOT NULL CONSTRAINT CK_LearningPathLevels_TargetScore CHECK (TargetScore > 0),
          Description NVARCHAR(500) NULL, DisplayOrder INT NOT NULL CONSTRAINT UQ_LearningPathLevels_DisplayOrder UNIQUE,
          AccentKey NVARCHAR(30) NOT NULL, IsActive BIT NOT NULL CONSTRAINT DF_LearningPathLevels_IsActive DEFAULT (1),
          CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_LearningPathLevels_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
          UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_LearningPathLevels_UpdatedAt DEFAULT (SYSDATETIMEOFFSET())
        );
      END;
      IF OBJECT_ID(N'dbo.LearningPathTopics', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.LearningPathTopics (
          LearningPathTopicID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_LearningPathTopics PRIMARY KEY,
          LearningPathLevelID INT NOT NULL CONSTRAINT FK_LearningPathTopics_LevelID REFERENCES dbo.LearningPathLevels(LearningPathLevelID) ON DELETE CASCADE,
          TopicID BIGINT NOT NULL CONSTRAINT FK_LearningPathTopics_TopicID REFERENCES dbo.Topics(TopicID) ON DELETE CASCADE,
          DisplayOrder INT NOT NULL, IsRequired BIT NOT NULL CONSTRAINT DF_LearningPathTopics_IsRequired DEFAULT (1),
          CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_LearningPathTopics_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
          CONSTRAINT UQ_LearningPathTopics_TopicID UNIQUE (TopicID)
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_LearningPathTopics_LevelID_DisplayOrder' AND object_id = OBJECT_ID(N'dbo.LearningPathTopics'))
        CREATE INDEX IX_LearningPathTopics_LevelID_DisplayOrder ON dbo.LearningPathTopics(LearningPathLevelID, DisplayOrder);
    `);

    for (const level of LEVEL_SEED) {
      const [code, name, targetScore, description, displayOrder, accentKey] = level;
      await pool.request()
        .input("LevelCode", sql.NVarChar(30), code).input("LevelName", sql.NVarChar(100), name)
        .input("TargetScore", sql.Int, targetScore).input("Description", sql.NVarChar(500), description)
        .input("DisplayOrder", sql.Int, displayOrder).input("AccentKey", sql.NVarChar(30), accentKey)
        .query(`MERGE dbo.LearningPathLevels AS target USING (SELECT @LevelCode AS LevelCode) AS source ON target.LevelCode = source.LevelCode
          WHEN MATCHED THEN UPDATE SET LevelName = @LevelName, TargetScore = @TargetScore, Description = @Description,
            DisplayOrder = @DisplayOrder, AccentKey = @AccentKey, IsActive = 1, UpdatedAt = SYSDATETIMEOFFSET()
          WHEN NOT MATCHED THEN INSERT (LevelCode, LevelName, TargetScore, Description, DisplayOrder, AccentKey)
            VALUES (@LevelCode, @LevelName, @TargetScore, @Description, @DisplayOrder, @AccentKey);`);
    }
  }

  static async syncPublishedTopics() {
    const pool = await poolPromise;
    await pool.request().query(`
      WITH RankedTopics AS (SELECT t.TopicID, NTILE(4) OVER (ORDER BY t.TopicID) AS LevelBucket FROM dbo.Topics t WHERE t.ContentStatus = N'Published'),
      TopicsToMap AS (SELECT rt.TopicID, rt.LevelBucket, ROW_NUMBER() OVER (PARTITION BY rt.LevelBucket ORDER BY rt.TopicID) AS TopicOrder
        FROM RankedTopics rt WHERE NOT EXISTS (SELECT 1 FROM dbo.LearningPathTopics lpt WHERE lpt.TopicID = rt.TopicID))
      INSERT dbo.LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder)
      SELECT l.LearningPathLevelID, t.TopicID, t.TopicOrder FROM TopicsToMap t JOIN dbo.LearningPathLevels l ON l.DisplayOrder = t.LevelBucket;
    `);
  }

  static async getRoadmap(userId) {
    await Promise.all([this.ensureSchema(), GamificationService.ensureSchema()]);
    await this.syncPublishedTopics();
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId).query(`
      SELECT LearningPathLevelID AS id, LevelCode AS code, LevelName AS title, TargetScore AS targetScore,
             Description AS description, DisplayOrder AS displayOrder, AccentKey AS accentKey
      FROM dbo.LearningPathLevels WHERE IsActive = 1 ORDER BY DisplayOrder;

      SELECT lpt.LearningPathTopicID AS pathTopicId, lpt.LearningPathLevelID AS levelId, lpt.DisplayOrder AS displayOrder,
             t.TopicID AS topicId, t.TopicName AS title, t.TopicCode AS code, t.Description AS description,
             ISNULL(wordStats.totalWords, 0) AS totalWords, ISNULL(wordStats.learnedWords, 0) AS learnedWords,
             ISNULL(wordStats.masteredWords, 0) AS masteredWords, ISNULL(practiceStats.practiceCompletions, 0) AS practiceCompletions,
             ISNULL(testStats.miniTestCount, 0) AS miniTestCount, ISNULL(testStats.completedMiniTests, 0) AS completedMiniTests,
             testStats.firstMiniTestId AS firstMiniTestId
      FROM dbo.LearningPathTopics lpt JOIN dbo.Topics t ON t.TopicID = lpt.TopicID
      OUTER APPLY (SELECT COUNT(DISTINCT wt.WordID) AS totalWords, COUNT(DISTINCT CASE WHEN uwp.RepetitionCount > 0 THEN wt.WordID END) AS learnedWords,
        COUNT(DISTINCT CASE WHEN uwp.MasteryLevel >= 7 THEN wt.WordID END) AS masteredWords
        FROM dbo.WordTopics wt LEFT JOIN dbo.UserWordProgress uwp ON uwp.WordID = wt.WordID AND uwp.UserID = @UserID WHERE wt.TopicID = t.TopicID) wordStats
      OUTER APPLY (SELECT COUNT(*) AS practiceCompletions FROM dbo.UserXPEvents x
        WHERE x.UserID = @UserID AND x.EventType = N'PracticeComplete' AND TRY_CONVERT(BIGINT, JSON_VALUE(x.MetadataJson, '$.topicId')) = t.TopicID) practiceStats
      OUTER APPLY (SELECT COUNT(DISTINCT mt.MiniTestID) AS miniTestCount, COUNT(DISTINCT CASE WHEN mta.SubmittedAt IS NOT NULL THEN mt.MiniTestID END) AS completedMiniTests,
        MIN(mt.MiniTestID) AS firstMiniTestId FROM dbo.MiniTests mt
        LEFT JOIN dbo.MiniTestAttempts mta ON mta.MiniTestID = mt.MiniTestID AND mta.UserID = @UserID
        WHERE mt.TopicID = t.TopicID AND mt.IsPublished = 1) testStats
      WHERE t.ContentStatus = N'Published'
      ORDER BY lpt.LearningPathLevelID, lpt.DisplayOrder, lpt.LearningPathTopicID;
    `);

    return this.buildRoadmap(result.recordsets[0], result.recordsets[1]);
  }

  static buildRoadmap(levelRows, topicRows) {
    const allTopics = [];
    const levels = levelRows.map((level) => {
      const topics = topicRows.filter((topic) => Number(topic.levelId) === Number(level.id)).map((topic) => {
        const totalWords = Number(topic.totalWords || 0);
        const learnedWords = Number(topic.learnedWords || 0);
        const masteredWords = Number(topic.masteredWords || 0);
        const lessonCompleted = totalWords > 0 && learnedWords >= totalWords;
        const practiceCompleted = Number(topic.practiceCompletions || 0) > 0;
        const miniTestConfigured = Number(topic.miniTestCount || 0) > 0;
        const miniTestCompleted = Number(topic.completedMiniTests || 0) > 0;
        const canStartLesson = totalWords > 0;
        const canPractice = learnedWords > 0;
        const completed = lessonCompleted && practiceCompleted && (!miniTestConfigured || miniTestCompleted);
        const status = completed ? "completed" : canStartLesson ? "available" : "locked";
        const lessonProgress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
        const completionParts = [lessonProgress, practiceCompleted ? 100 : 0];
        if (miniTestConfigured) completionParts.push(miniTestCompleted ? 100 : 0);
        const completionPercentage = Math.round(completionParts.reduce((sum, p) => sum + p, 0) / completionParts.length);

        const activities = [
          { type: "lesson", title: `Learn ${topic.title}`, description: `${learnedWords}/${totalWords} words learned`,
            status: lessonCompleted ? "completed" : canStartLesson ? "available" : "locked", route: `/user/learn/${topic.topicId}`, configured: true },
          { type: "practice", title: "Practice session", description: practiceCompleted ? "Practice completed" : "Reinforce this topic with a focused session",
            status: practiceCompleted ? "completed" : canPractice ? "available" : "locked", route: `/user/practice?topicId=${topic.topicId}`, configured: true },
          { type: "miniTest", title: "Mini test", description: miniTestConfigured ? `${topic.miniTestCount} mini test available` : "Mini test coming soon",
            status: miniTestCompleted ? "completed" : canPractice && practiceCompleted && miniTestConfigured ? "available" : "locked",
            route: topic.firstMiniTestId ? `/user/minitests/${topic.firstMiniTestId}` : "/user/minitests", configured: miniTestConfigured },
        ];

        const pathTopic = { pathTopicId: Number(topic.pathTopicId), topicId: Number(topic.topicId), title: topic.title,
          code: topic.code, description: topic.description, status, completionPercentage, totalWords, learnedWords, masteredWords, activities };
        allTopics.push(pathTopic);
        return pathTopic;
      });

      const completedTopics = topics.filter((t) => t.status === "completed").length;
      const availableTopics = topics.filter((t) => t.status === "available").length;
      return {
        id: Number(level.id), code: level.code, title: level.title, targetScore: Number(level.targetScore),
        description: level.description, displayOrder: Number(level.displayOrder), accentKey: level.accentKey,
        status: topics.length > 0 && completedTopics === topics.length ? "completed" : availableTopics > 0 ? "available" : "locked",
        completionPercentage: topics.length > 0 ? Math.round(topics.reduce((sum, t) => sum + t.completionPercentage, 0) / topics.length) : 0,
        completedTopics, totalTopics: topics.length, topics,
      };
    });

    const completedTopics = allTopics.filter((t) => t.status === "completed").length;
    const currentTopicIndex = allTopics.findIndex((t) => t.status === "available");
    const currentTopic = currentTopicIndex >= 0 ? allTopics[currentTopicIndex] : allTopics.at(-1) || null;
    const nextTopic = currentTopicIndex >= 0 ? allTopics[currentTopicIndex + 1] || null : null;
    const currentActivity = currentTopic?.activities.find((a) => a.status === "available") || null;

    return {
      completionPercentage: allTopics.length > 0 ? Math.round(allTopics.reduce((sum, t) => sum + t.completionPercentage, 0) / allTopics.length) : 0,
      completedTopics, totalTopics: allTopics.length,
      currentPosition: currentTopic ? {
        levelTitle: levels.find((l) => l.topics.some((t) => t.topicId === currentTopic.topicId))?.title,
        topicId: currentTopic.topicId, topicTitle: currentTopic.title, topicStatus: currentTopic.status,
        activityTitle: currentActivity?.title || "Roadmap completed", activityRoute: currentActivity?.route || "/user/courses",
        completionPercentage: currentTopic.completionPercentage,
      } : null,
      currentLesson: currentTopic ? { topicId: currentTopic.topicId, title: currentTopic.title, route: `/user/learn/${currentTopic.topicId}`, status: currentTopic.status, completionPercentage: currentTopic.completionPercentage } : null,
      nextLesson: nextTopic ? { topicId: nextTopic.topicId, title: nextTopic.title, route: `/user/learn/${nextTopic.topicId}`, status: nextTopic.status, completionPercentage: nextTopic.completionPercentage } : null,
      levels,
    };
  }
}

module.exports = LearningPathService;
