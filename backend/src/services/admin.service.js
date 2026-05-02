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

  // --- QUESTIONS ---
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
}

module.exports = AdminService;
