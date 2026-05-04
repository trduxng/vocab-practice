// vocab-practice/backend/src/services/admin.service.js
const { poolPromise, sql } = require("../config/db");

class AdminService {
  // --- WORDS ---
  static async getWords(page = 1, limit = 20) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM Words
    `);
    const total = countResult.recordset[0].total;

    // Get words
    const result = await pool
      .request()
      .input("Offset", sql.Int, offset)
      .input("Limit", sql.Int, limit).query(`
        SELECT WordID AS id, Term AS term, Meaning AS meaning, Phonetic AS phonetic,
               PartOfSpeechID AS partOfSpeechId, CreatedAt AS createdAt
        FROM Words
        ORDER BY CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);

    return {
      words: result.recordset,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async createWord(wordData, adminId) {
    const { term, meaning, phonetic, partOfSpeechId, topicIds, examples } =
      wordData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);
      // Insert Word
      const wordResult = await request
        .input("Term", sql.NVarChar(200), term)
        .input("Meaning", sql.NVarChar(1000), meaning)
        .input("Phonetic", sql.NVarChar(255), phonetic || null)
        .input("PartOfSpeechID", sql.Int, partOfSpeechId)
        .input("CreatedByUserID", sql.BigInt, adminId).query(`
          INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID, CreatedAt, UpdatedAt)
          OUTPUT inserted.WordID AS id
          VALUES (@Term, @Meaning, @Phonetic, @PartOfSpeechID, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);

      const wordId = wordResult.recordset[0].id;

      // Insert WordTopics
      // if (topicIds && topicIds.length > 0) {
      //   for (const topicId of topicIds) {
      //     const topicReq = new sql.Request(transaction);
      //     await topicReq
      //       .input("WordID", sql.BigInt, wordId)
      //       .input("TopicID", sql.BigInt, topicId).query(`
      //         INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
      //         VALUES (@WordID, @TopicID, SYSDATETIMEOFFSET())
      //       `);
      //   }
      // }
      // Batch insert WordTopics (thay vì vòng lặp)
      if (topicIds && topicIds.length > 0) {
        // Tạo VALUES clause cho batch insert
        const values = topicIds
          .map((_, i) => `(@WordID, @TopicID${i}, SYSDATETIMEOFFSET())`)
          .join(", ");

        const topicReq = new sql.Request(transaction);
        topicReq.input("WordID", sql.BigInt, wordId);
        topicIds.forEach((topicId, i) => {
          topicReq.input(`TopicID${i}`, sql.BigInt, topicId);
        });

        await topicReq.query(`
          INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
          VALUES ${values}
        `);
      }

      // Insert ExampleSentences
      // if (examples && examples.length > 0) {
      //   for (const ex of examples) {
      //     const exReq = new sql.Request(transaction);
      //     await exReq
      //       .input("WordID", sql.BigInt, wordId)
      //       .input("SentenceText", sql.NVarChar(2000), ex.sentence)
      //       .input("SentenceTranslation", sql.NVarChar(2000), ex.meaning)
      //       .query(`
      //         INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
      //         VALUES (@WordID, @SentenceText, @SentenceTranslation, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      //       `);
      //   }
      // }
      // Batch insert ExampleSentences (thay vì vòng lặp)
      if (examples && examples.length > 0) {
        const values = examples
          .map(
            (_, i) =>
              `(@WordID, @SentenceText${i}, @SentenceTranslation${i}, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`,
          )
          .join(", ");

        const exReq = new sql.Request(transaction);
        exReq.input("WordID", sql.BigInt, wordId);
        examples.forEach((ex, i) => {
          exReq.input(`SentenceText${i}`, sql.NVarChar(2000), ex.sentence);
          exReq.input(
            `SentenceTranslation${i}`,
            sql.NVarChar(2000),
            ex.meaning || null,
          );
        });

        await exReq.query(`
          INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
          VALUES ${values}
        `);
      }

      await transaction.commit();
      return { id: wordId, term, meaning };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateWord(wordId, wordData) {
    const { term, meaning, phonetic, partOfSpeechId } = wordData;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("WordID", sql.BigInt, wordId)
      .input("Term", sql.NVarChar(200), term)
      .input("Meaning", sql.NVarChar(1000), meaning)
      .input("Phonetic", sql.NVarChar(255), phonetic || null)
      .input("PartOfSpeechID", sql.Int, partOfSpeechId).query(`
        UPDATE Words
        SET Term = @Term, Meaning = @Meaning, Phonetic = @Phonetic,
            PartOfSpeechID = @PartOfSpeechID, UpdatedAt = SYSDATETIMEOFFSET()
        WHERE WordID = @WordID
      `);
    return result.rowsAffected[0] > 0;
  }

  // --- QUESTIONS ---
  static async createQuestion(questionData, adminId) {
    const {
      wordId,
      questionType,
      questionText,
      optionsJson,
      correctAnswer,
      explanation,
    } = questionData;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("WordID", sql.BigInt, wordId)
      .input("QuestionType", sql.NVarChar(30), questionType)
      .input("QuestionText", sql.NVarChar(2000), questionText)
      .input("OptionsJson", sql.NVarChar(sql.MAX), optionsJson)
      .input("CorrectAnswer", sql.NVarChar(500), correctAnswer)
      .input("Explanation", sql.NVarChar(2000), explanation || null)
      .input("CreatedByUserID", sql.BigInt, adminId).query(`
        INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, CreatedByUserID, CreatedAt, UpdatedAt)
        OUTPUT inserted.QuestionID AS id
        VALUES (@WordID, @QuestionType, @QuestionText, @OptionsJson, @CorrectAnswer, @Explanation, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);
    return result.recordset[0];
  }

  // ===== DASHBOARD STATS =====

  static async getOverviewStats() {
    const pool = await poolPromise;

    // Tổng học viên
    const totalStudents = await pool.request().query(`
      SELECT COUNT(*) AS count FROM Users WHERE UserRole = 'Learner' AND IsActive = 1
    `);
    const lastMonthStudents = await pool.request().query(`
      SELECT COUNT(*) AS count FROM Users
      WHERE UserRole = 'Learner' AND CreatedAt >= DATEADD(MONTH, -1, SYSDATETIMEOFFSET())
    `);

    // Tổng khóa học (Topics)
    const activeCourses = await pool.request().query(`
      SELECT COUNT(*) AS count FROM Topics
    `);

    // Tỉ lệ hoàn thành (tạm tính từ UserWordProgress)
    const completionStats = await pool.request().query(`
      SELECT
        COUNT(DISTINCT UserID) AS totalLearners,
        COUNT(DISTINCT CASE WHEN MemoryStatus = 'Mastered' THEN UserID END) AS masteredLearners
      FROM UserWordProgress
    `);

    const totalStudentsCount = totalStudents.recordset[0].count;
    const lastMonthCount = lastMonthStudents.recordset[0].count;
    const activeCoursesCount = activeCourses.recordset[0].count;

    const totalLearners = completionStats.recordset[0].totalLearners || 1;
    const masteredLearners = completionStats.recordset[0].masteredLearners || 0;

    // Tính % thay đổi (demo)
    const prevMonthStudents = totalStudentsCount - lastMonthCount;
    const studentsChange =
      prevMonthStudents > 0
        ? `+${Math.round((lastMonthCount / prevMonthStudents) * 100)}%`
        : "+0%";

    return {
      totalStudents: totalStudentsCount,
      totalStudentsChange: studentsChange,
      totalStudentsUp: lastMonthCount > 0,
      monthlyRevenue: "156.000.000đ",
      revenueChange: "+8%",
      revenueUp: true,
      activeCourses: activeCoursesCount,
      activeCoursesChange: "+2",
      activeCoursesUp: true,
      completionRate: Math.round((masteredLearners / totalLearners) * 100),
      completionRateChange: "+5%",
      completionRateUp: true,
    };
  }

  static async getWeeklyActivity() {
    const pool = await poolPromise();
    const result = await pool.request().query(`
      SELECT
        DATENAME(WEEKDAY, AttemptedAt) AS day,
        COUNT(DISTINCT UserID) AS users
      FROM ExerciseAttempts
      WHERE AttemptedAt >= DATEADD(DAY, -7, SYSDATETIMEOFFSET())
      GROUP BY DATENAME(WEEKDAY, AttemptedAt), DATEPART(WEEKDAY, AttemptedAt)
      ORDER BY DATEPART(WEEKDAY, AttemptedAt)
    `);

    // Map day names to Vietnamese
    const dayMap = {
      Monday: "T2",
      Tuesday: "T3",
      Wednesday: "T4",
      Thursday: "T5",
      Friday: "T6",
      Saturday: "T7",
      Sunday: "CN",
    };

    return result.recordset.map((row) => ({
      day: dayMap[row.day] || row.day.substring(0, 2),
      users: row.users || 0,
    }));
  }

  static async getTodayActivity() {
    const pool = await poolPromise();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await pool
      .request()
      .input("Today", sql.DateTimeOffset, today).query(`
        SELECT
          (SELECT COUNT(*) FROM Users WHERE CreatedAt >= @Today AND UserRole = 'Learner') AS newSignups,
          (SELECT COUNT(DISTINCT UserID) FROM ExerciseAttempts WHERE AttemptedAt >= @Today) AS activeSessions,
          (SELECT COUNT(*) FROM ExerciseAttempts WHERE AttemptedAt >= @Today AND IsCorrect = 1) AS newReviews,
          '12.500.000đ' AS revenue
      `);

    return result.recordset[0];
  }

  static async getRecentUsers() {
    const pool = await poolPromise();
    const result = await pool.request().query(`
      SELECT TOP 5
        FullName AS name,
        Email AS email,
        'TOEIC 800+' AS course,
        CASE WHEN IsActive = 1 THEN 'active' ELSE 'inactive' END AS status,
        FORMAT(CreatedAt, 'dd/MM/yyyy') AS joined,
        LEFT(FullName, 2) AS avatar,
        CASE
          WHEN UserID % 5 = 0 THEN 'bg-blue-500'
          WHEN UserID % 5 = 1 THEN 'bg-pink-500'
          WHEN UserID % 5 = 2 THEN 'bg-green-500'
          WHEN UserID % 5 = 3 THEN 'bg-amber-500'
          ELSE 'bg-purple-500'
        END AS avatarColor
      FROM Users
      WHERE UserRole = 'Learner'
      ORDER BY CreatedAt DESC
    `);
    return result.recordset;
  }

  static async getTopCourses() {
    const pool = await poolPromise();
    const result = await pool.request().query(`
      SELECT TOP 3
        t.TopicName AS name,
        COUNT(DISTINCT uwp.UserID) AS students,
        CONCAT(FORMAT(COUNT(DISTINCT uwp.UserID) * 100000, '#,##0'), 'đ') AS revenue,
        4.8 AS rating,
        CASE
          WHEN t.TopicID = 1 THEN 42
          WHEN t.TopicID = 2 THEN 78
          ELSE 65
        END AS progress
      FROM Topics t
      LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID
      LEFT JOIN UserWordProgress uwp ON wt.WordID = uwp.WordID
      GROUP BY t.TopicID, t.TopicName
      ORDER BY students DESC
    `);
    return result.recordset;
  }
}

module.exports = AdminService;
