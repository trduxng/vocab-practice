const { poolPromise, sql } = require('../config/db');

class AdminService {
  // --- WORDS ---
  static async getWords(page = 1, limit = 20) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;
    const result = await pool.request()
      .input('Offset', sql.Int, offset)
      .input('Limit', sql.Int, limit)
      .query(`
        SELECT WordID, Term, Meaning, Phonetic, PartOfSpeechID, CreatedAt 
        FROM Words 
        ORDER BY CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);
    return result.recordset;
  }

  static async createWord(wordData) {
    const { term, meaning, phonetic, partOfSpeechId, topicIds, examples } = wordData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);
      // Insert Word
      const wordResult = await request
        .input('Term', sql.NVarChar(100), term)
        .input('Meaning', sql.NVarChar(sql.MAX), meaning)
        .input('Phonetic', sql.NVarChar(100), phonetic)
        .input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .query(`
          INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedAt, UpdatedAt)
          OUTPUT inserted.WordID
          VALUES (@Term, @Meaning, @Phonetic, @PartOfSpeechID, GETDATE(), GETDATE())
        `);
      
      const wordId = wordResult.recordset[0].WordID;

      // Insert WordTopics
      if (topicIds && topicIds.length > 0) {
        for (const topicId of topicIds) {
          const topicReq = new sql.Request(transaction);
          await topicReq
            .input('WordID', sql.Int, wordId)
            .input('TopicID', sql.Int, topicId)
            .query(`
              INSERT INTO WordTopics (WordID, TopicID) VALUES (@WordID, @TopicID)
            `);
        }
      }

      // Insert ExampleSentences
      if (examples && examples.length > 0) {
        for (const ex of examples) {
          const exReq = new sql.Request(transaction);
          await exReq
            .input('WordID', sql.Int, wordId)
            .input('Sentence', sql.NVarChar(sql.MAX), ex.sentence)
            .input('Meaning', sql.NVarChar(sql.MAX), ex.meaning)
            .query(`
              INSERT INTO ExampleSentences (WordID, Sentence, Meaning)
              VALUES (@WordID, @Sentence, @Meaning)
            `);
        }
      }

      await transaction.commit();
      return { wordId, term, meaning };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateWord(wordId, wordData) {
    const { term, meaning, phonetic, partOfSpeechId } = wordData;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.Int, wordId)
      .input('Term', sql.NVarChar(100), term)
      .input('Meaning', sql.NVarChar(sql.MAX), meaning)
      .input('Phonetic', sql.NVarChar(100), phonetic)
      .input('PartOfSpeechID', sql.Int, partOfSpeechId)
      .query(`
        UPDATE Words 
        SET Term = @Term, Meaning = @Meaning, Phonetic = @Phonetic, 
            PartOfSpeechID = @PartOfSpeechID, UpdatedAt = GETDATE()
        WHERE WordID = @WordID
      `);
    return result.rowsAffected[0] > 0;
  }

  // --- QUESTIONS ---
  static async createQuestion(questionData) {
    const { wordId, questionType, questionText, optionsJson, correctAnswer } = questionData;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.Int, wordId)
      .input('QuestionType', sql.NVarChar(50), questionType)
      .input('QuestionText', sql.NVarChar(sql.MAX), questionText)
      .input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson)
      .input('CorrectAnswer', sql.NVarChar(sql.MAX), correctAnswer)
      .query(`
        INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, CreatedAt, UpdatedAt)
        OUTPUT inserted.QuestionID
        VALUES (@WordID, @QuestionType, @QuestionText, @OptionsJson, @CorrectAnswer, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  }
}

module.exports = AdminService;
