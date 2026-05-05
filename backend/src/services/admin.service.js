const { poolPromise, sql } = require('../config/db');

class AdminService {
  // --- WORDS ---
  static async getWords(page = 1, limit = 20) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;
    
    // Fetch main words
    const result = await pool.request()
      .input('Offset', sql.Int, offset)
      .input('Limit', sql.Int, limit)
      .query(`
        SELECT w.WordID AS id, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic, 
               w.PartOfSpeechID AS partOfSpeechId, p.PartOfSpeechName AS partOfSpeechName,
               w.CreatedAt AS createdAt 
        FROM Words w
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        ORDER BY w.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);
    
    const words = result.recordset;

    // Fetch related data for each word (Note: In production, optimize this with a JOIN or separate batch query)
    for (let word of words) {
      // Topics
      const topicsResult = await pool.request()
        .input('WordID', sql.BigInt, word.id)
        .query(`
          SELECT t.TopicID AS id, t.TopicName AS name 
          FROM WordTopics wt
          JOIN Topics t ON wt.TopicID = t.TopicID
          WHERE wt.WordID = @WordID
        `);
      word.topics = topicsResult.recordset;

      // Examples
      const examplesResult = await pool.request()
        .input('WordID', sql.BigInt, word.id)
        .query(`
          SELECT ExampleSentenceID AS id, SentenceText AS sentence, SentenceTranslation AS meaning
          FROM ExampleSentences
          WHERE WordID = @WordID
        `);
      word.examples = examplesResult.recordset;
    }

    return words;
  }

  static async createWord(wordData, adminId) {
    const { term, meaning, phonetic, partOfSpeechId, topicIds, examples } = wordData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);
      // Insert Word
      const wordResult = await request
        .input('Term', sql.NVarChar(200), term)
        .input('Meaning', sql.NVarChar(1000), meaning)
        .input('Phonetic', sql.NVarChar(255), phonetic)
        .input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .input('CreatedByUserID', sql.BigInt, adminId)
        .query(`
          INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID, CreatedAt, UpdatedAt)
          OUTPUT inserted.WordID AS id
          VALUES (@Term, @Meaning, @Phonetic, @PartOfSpeechID, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      
      const wordId = wordResult.recordset[0].id;

      // Insert WordTopics
      if (topicIds && topicIds.length > 0) {
        for (const topicId of topicIds) {
          const topicReq = new sql.Request(transaction);
          await topicReq
            .input('WordID', sql.BigInt, wordId)
            .input('TopicID', sql.BigInt, topicId)
            .query(`
              INSERT INTO WordTopics (WordID, TopicID, AssignedAt) 
              VALUES (@WordID, @TopicID, SYSDATETIMEOFFSET())
            `);
        }
      }

      // Insert ExampleSentences
      if (examples && examples.length > 0) {
        for (const ex of examples) {
          const exReq = new sql.Request(transaction);
          await exReq
            .input('WordID', sql.BigInt, wordId)
            .input('SentenceText', sql.NVarChar(2000), ex.sentence)
            .input('SentenceTranslation', sql.NVarChar(2000), ex.meaning)
            .query(`
              INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
              VALUES (@WordID, @SentenceText, @SentenceTranslation, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
            `);
        }
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
    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('Term', sql.NVarChar(200), term)
      .input('Meaning', sql.NVarChar(1000), meaning)
      .input('Phonetic', sql.NVarChar(255), phonetic)
      .input('PartOfSpeechID', sql.Int, partOfSpeechId)
      .query(`
        UPDATE Words 
        SET Term = @Term, Meaning = @Meaning, Phonetic = @Phonetic, 
            PartOfSpeechID = @PartOfSpeechID, UpdatedAt = SYSDATETIMEOFFSET()
        WHERE WordID = @WordID
      `);
    return result.rowsAffected[0] > 0;
  }

  static async deleteWord(wordId) {
    const pool = await poolPromise;
    // Note: Due to CASCADE in ExampleSentences and WordTopics, 
    // we only need to delete from Words and Questions.
    // However, MiniTestItems might reference Questions.
    
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      
      // Delete from Words (cascades to WordTopics, ExampleSentences, Questions)
      await request
        .input('WordID', sql.BigInt, wordId)
        .query('DELETE FROM Words WHERE WordID = @WordID');

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- QUESTIONS ---
  static async getQuestionsByWord(wordId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .query(`
        SELECT QuestionID AS id, QuestionType AS questionType, QuestionText AS questionText, 
               OptionsJson AS optionsJson, CorrectAnswer AS correctAnswer, Explanation AS explanation
        FROM Questions
        WHERE WordID = @WordID
      `);
    return result.recordset;
  }

  static async createQuestion(questionData, adminId) {
    const { wordId, questionType, questionText, optionsJson, correctAnswer, explanation } = questionData;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText)
      .input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson)
      .input('CorrectAnswer', sql.NVarChar(500), correctAnswer)
      .input('Explanation', sql.NVarChar(2000), explanation)
      .input('CreatedByUserID', sql.BigInt, adminId)
      .query(`
        INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, CreatedByUserID, CreatedAt, UpdatedAt)
        OUTPUT inserted.QuestionID AS id
        VALUES (@WordID, @QuestionType, @QuestionText, @OptionsJson, @CorrectAnswer, @Explanation, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);
    return result.recordset[0];
  }

  // --- MINI TESTS ---
  static async getMiniTests() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description, 
             t.TopicName AS topicName, mt.TotalQuestions AS totalQuestions, mt.IsPublished AS isPublished
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      ORDER BY mt.CreatedAt DESC
    `);
    return result.recordset;
  }

  static async createMiniTest(testData, adminId) {
    const { title, description, topicId, questionIds } = testData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      
      const testResult = await request
        .input('Title', sql.NVarChar(255), title)
        .input('Description', sql.NVarChar(1000), description)
        .input('TopicID', sql.BigInt, topicId)
        .input('CreatedByUserID', sql.BigInt, adminId)
        .input('TotalQuestions', sql.Int, questionIds.length)
        .query(`
          INSERT INTO MiniTests (TestTitle, Description, TopicID, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt)
          OUTPUT inserted.MiniTestID AS id
          VALUES (@Title, @Description, @TopicID, @CreatedByUserID, @TotalQuestions, 1, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      
      const testId = testResult.recordset[0].id;

      for (let i = 0; i < questionIds.length; i++) {
        const itemReq = new sql.Request(transaction);
        await itemReq
          .input('MiniTestID', sql.BigInt, testId)
          .input('QuestionID', sql.BigInt, questionIds[i])
          .input('DisplayOrder', sql.Int, i + 1)
          .query(`
            INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
            VALUES (@MiniTestID, @QuestionID, @DisplayOrder)
          `);
      }

      await transaction.commit();
      return { id: testId, title };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getDashboardStats() {
    const pool = await poolPromise;
    
    const studentsResult = await pool.request().query("SELECT COUNT(*) AS total FROM Users WHERE UserRole = 'Learner'");
    const wordsResult = await pool.request().query("SELECT COUNT(*) AS total FROM Words");
    const topicsResult = await pool.request().query("SELECT COUNT(*) AS total FROM Topics");
    const attemptsResult = await pool.request().query("SELECT COUNT(*) AS total FROM ExerciseAttempts");

    return {
      totalStudents: studentsResult.recordset[0].total,
      totalWords: wordsResult.recordset[0].total,
      totalTopics: topicsResult.recordset[0].total,
      totalAttempts: attemptsResult.recordset[0].total
    };
  }

  static async getStudents() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.UserID AS id, u.FullName AS fullName, u.Email AS email, u.UserRole AS role,
             r.RoleName AS roleName, u.IsActive AS isActive, u.CreatedAt AS joinedAt,
             (SELECT COUNT(*) FROM UserWordProgress WHERE UserID = u.UserID AND MasteryLevel >= 8) AS masteredWords,
             (SELECT COUNT(*) FROM UserWordProgress WHERE UserID = u.UserID) AS totalWords,
             (SELECT COUNT(*) FROM ExerciseAttempts WHERE UserID = u.UserID) AS totalAttempts,
             (SELECT MAX(AttemptedAt) FROM ExerciseAttempts WHERE UserID = u.UserID) AS lastActiveAt
      FROM Users u
      LEFT JOIN Roles r ON u.RoleID = r.RoleID
      ORDER BY u.CreatedAt DESC
    `);
    return result.recordset;
  }

  static async toggleUserStatus(userId) {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('UPDATE Users SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID');
    return true;
  }

  static async updateUserRole(userId, roleName) {
    const allowedRoles = ['Admin', 'Learner'];
    if (!allowedRoles.includes(roleName)) {
      throw new Error('Invalid role');
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('RoleName', sql.NVarChar(50), roleName)
      .query(`
        DECLARE @RoleID INT;
        SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

        IF @RoleID IS NULL
          THROW 50002, 'Role not found', 1;

        UPDATE Users
        SET UserRole = @RoleName,
            RoleID = @RoleID,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE UserID = @UserID;
      `);

    return result.rowsAffected.some((count) => count > 0);
  }

  static async getAnalyticsData() {
    const pool = await poolPromise;
    
    // Fetch last 7 days of activity
    const activityResult = await pool.request().query(`
      SELECT CAST(AttemptedAt AS DATE) AS date, COUNT(*) AS count
      FROM ExerciseAttempts
      WHERE AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET())
      GROUP BY CAST(AttemptedAt AS DATE)
      ORDER BY date ASC
    `);

    // Word distribution by Part of Speech
    const distributionResult = await pool.request().query(`
      SELECT p.PartOfSpeechName AS name, COUNT(w.WordID) AS value
      FROM PartOfSpeeches p
      LEFT JOIN Words w ON p.PartOfSpeechID = w.PartOfSpeechID
      GROUP BY p.PartOfSpeechName
    `);

    return {
      dailyTrends: activityResult.recordset.map(r => ({
        day: new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
        attempts: r.count
      })),
      wordDistribution: distributionResult.recordset
    };
  }
}

module.exports = AdminService;
