const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

const USER_ROLES = ['Admin', 'Learner'];

function assertValidUserRole(roleName) {
  if (!USER_ROLES.includes(roleName)) {
    throw new Error('Invalid role');
  }
}

class AdminService {
  static normalizeImportKey(value) {
    return String(value ?? '')
      .replace(/^\uFEFF/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  static parseDelimitedImport(input) {
    if (Array.isArray(input)) {
      return input;
    }

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.words)) return input.words;
      if (Array.isArray(input.questions)) return input.questions;
      if (Array.isArray(input.rows)) return input.rows;
    }

    if (typeof input !== 'string') {
      throw new Error('Invalid import payload');
    }

    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('CSV must include a header and at least one data row');
    }

    const firstLine = trimmed.split(/\r?\n/)[0] || '';
    const delimiters = [',', ';', '\t'];
    const delimiter = delimiters.reduce((best, current) => {
      const currentCount = firstLine.split(current).length;
      const bestCount = firstLine.split(best).length;
      return currentCount > bestCount ? current : best;
    }, ',');

    const records = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      const next = trimmed[i + 1];

      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i++;
        row.push(cell.trim());
        if (row.some((value) => value !== '')) records.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }

    row.push(cell.trim());
    if (row.some((value) => value !== '')) records.push(row);

    if (records.length < 2) {
      throw new Error('CSV must include a header and at least one data row');
    }

    const headers = records[0].map((header) => header.trim());
    return records.slice(1).map((cells) => {
      return headers.reduce((parsedRow, header, index) => {
        parsedRow[header] = cells[index] ?? '';
        return parsedRow;
      }, {});
    });
  }

  static getImportValue(row, aliases) {
    const normalizedAliases = aliases.map((alias) => this.normalizeImportKey(alias));
    const entries = Object.entries(row ?? {});

    for (const [key, value] of entries) {
      if (normalizedAliases.includes(this.normalizeImportKey(key))) {
        return value;
      }
    }

    return undefined;
  }

  static splitImportList(value) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(value ?? '')
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  static parseQuestionImport(input) {
    return this.parseDelimitedImport(input);
  }

  static parseWordImport(input) {
    return this.parseDelimitedImport(input);
  }

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
    const { term, meaning, phonetic = '', partOfSpeechId, topicIds, examples } = wordData;
    const validExamples = Array.isArray(examples)
      ? examples.filter((ex) => String(ex?.sentence ?? '').trim())
      : [];
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
      if (validExamples.length > 0) {
        for (const ex of validExamples) {
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
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);
      const result = await request
        .input('WordID', sql.BigInt, wordId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Words WHERE WordID = @WordID)
          BEGIN
            SELECT CAST(0 AS INT) AS deleted;
            RETURN;
          END

          DELETE FROM MiniTestItems
          WHERE QuestionID IN (
            SELECT QuestionID FROM Questions WHERE WordID = @WordID
          );

          UPDATE mt
          SET TotalQuestions = counts.TotalQuestions,
              UpdatedAt = SYSDATETIMEOFFSET()
          FROM MiniTests mt
          CROSS APPLY (
            SELECT COUNT(*) AS TotalQuestions
            FROM MiniTestItems mti
            WHERE mti.MiniTestID = mt.MiniTestID
          ) counts;

          DELETE FROM ExerciseAttempts
          WHERE WordID = @WordID
             OR QuestionID IN (
               SELECT QuestionID FROM Questions WHERE WordID = @WordID
             );

          DELETE FROM UserWordProgress WHERE WordID = @WordID;

          IF OBJECT_ID(N'dbo.WordPartsAssignment', N'U') IS NOT NULL
            DELETE FROM WordPartsAssignment WHERE WordID = @WordID;

          IF OBJECT_ID(N'dbo.WordCertifications', N'U') IS NOT NULL
            DELETE FROM WordCertifications WHERE WordID = @WordID;

          DELETE FROM Questions WHERE WordID = @WordID;
          DELETE FROM ExampleSentences WHERE WordID = @WordID;
          DELETE FROM WordTopics WHERE WordID = @WordID;

          DELETE FROM Words WHERE WordID = @WordID;

          SELECT @@ROWCOUNT AS deleted;
        `);

      await transaction.commit();
      return result.recordset[0]?.deleted > 0;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async bulkInsertWords(input, adminId) {
    const rows = this.parseWordImport(input);
    const results = { success: 0, failed: 0, errors: [] };
    const pool = await poolPromise;

    const referenceData = await pool.request().query(`
      SELECT PartOfSpeechID AS id, PartOfSpeechName AS name, PartOfSpeechCode AS code
      FROM PartOfSpeeches;

      SELECT TopicID AS id, TopicName AS name, TopicCode AS code
      FROM Topics;
    `);

    const partsOfSpeech = referenceData.recordsets[0] || [];
    const topics = referenceData.recordsets[1] || [];
    const partOfSpeechById = new Map(partsOfSpeech.map((item) => [Number(item.id), Number(item.id)]));
    const partOfSpeechByName = new Map();
    const topicById = new Map(topics.map((item) => [Number(item.id), Number(item.id)]));
    const topicByName = new Map();

    for (const item of partsOfSpeech) {
      partOfSpeechByName.set(this.normalizeImportKey(item.name), Number(item.id));
      partOfSpeechByName.set(this.normalizeImportKey(item.code), Number(item.id));
    }

    for (const item of topics) {
      topicByName.set(this.normalizeImportKey(item.name), Number(item.id));
      topicByName.set(this.normalizeImportKey(item.code), Number(item.id));
    }

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      try {
        const term = String(this.getImportValue(row, ['term', 'word', 'vocabulary', 'tu vung', 'tu']) ?? '').trim();
        const meaning = String(this.getImportValue(row, ['meaning', 'definition', 'dinh nghia', 'nghia']) ?? '').trim();
        const phonetic = String(this.getImportValue(row, ['phonetic', 'pronunciation', 'phien am']) ?? '').trim();
        const rawPartOfSpeechId = this.getImportValue(row, ['partOfSpeechId', 'posId', 'part of speech id', 'loai tu id']);
        const rawPartOfSpeechName = this.getImportValue(row, ['partOfSpeech', 'partOfSpeechName', 'pos', 'part of speech', 'loai tu', 'tu loai']);
        const rawTopicIds = this.getImportValue(row, ['topicIds', 'topicId', 'topic ids', 'chu de ids', 'chu de id']);
        const rawTopics = this.getImportValue(row, ['topics', 'topic', 'topicNames', 'topicName', 'chu de', 'ten chu de']);
        const rawExampleSentence = this.getImportValue(row, ['exampleSentence', 'sentence', 'example', 'cau vi du', 'vi du']);
        const rawExampleMeaning = this.getImportValue(row, ['exampleMeaning', 'sentenceTranslation', 'translation', 'nghia cau vi du', 'dich']);

        if (!term || !meaning) {
          throw new Error('Missing required fields: term, meaning');
        }

        let partOfSpeechId = Number(rawPartOfSpeechId);
        if (!partOfSpeechId && rawPartOfSpeechName) {
          partOfSpeechId = partOfSpeechByName.get(this.normalizeImportKey(rawPartOfSpeechName));
        }

        if (!partOfSpeechId || !partOfSpeechById.has(Number(partOfSpeechId))) {
          throw new Error('Invalid or missing partOfSpeechId/partOfSpeech');
        }

        const topicIds = new Set();
        for (const value of this.splitImportList(rawTopicIds)) {
          const id = Number(value);
          if (!id || !topicById.has(id)) {
            throw new Error(`Invalid topicId: ${value}`);
          }
          topicIds.add(id);
        }

        for (const value of this.splitImportList(rawTopics)) {
          const id = Number(value);
          if (id && topicById.has(id)) {
            topicIds.add(id);
            continue;
          }

          const mappedTopicId = topicByName.get(this.normalizeImportKey(value));
          if (!mappedTopicId) {
            throw new Error(`Invalid topic: ${value}`);
          }
          topicIds.add(mappedTopicId);
        }

        const examples = [];
        if (String(rawExampleSentence ?? '').trim()) {
          examples.push({
            sentence: String(rawExampleSentence).trim(),
            meaning: String(rawExampleMeaning ?? '').trim()
          });
        }

        await this.createWord({
          term,
          meaning,
          phonetic,
          partOfSpeechId: Number(partOfSpeechId),
          topicIds: [...topicIds],
          examples
        }, adminId);

        results.success += 1;
      } catch (error) {
        results.failed += 1;
        results.errors.push({
          row: index + 2,
          message: error.message
        });
      }
    }

    return results;
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
    const { wordId, questionType, questionText, optionsJson = '[]', correctAnswer, explanation } = questionData;
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

  static async createUser(userData) {
    const {
      fullName,
      email,
      password,
      role = 'Learner',
      isActive = true
    } = userData;

    assertValidUserRole(role);

    if (!fullName || !email || !password || password.length < 6) {
      throw new Error('Invalid user data');
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT UserID FROM Users WHERE Email = @Email');

    if (existing.recordset.length > 0) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('PasswordHash', sql.NVarChar(500), passwordHash)
      .input('RoleName', sql.NVarChar(50), role)
      .input('IsActive', sql.Bit, Boolean(isActive))
      .query(`
        DECLARE @RoleID INT;
        SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

        IF @RoleID IS NULL
          THROW 50002, 'Role not found', 1;

        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, RoleID, IsActive, CreatedAt, UpdatedAt)
        OUTPUT inserted.UserID AS id, inserted.FullName AS fullName, inserted.Email AS email, inserted.UserRole AS role, inserted.IsActive AS isActive
        VALUES (@FullName, @Email, @PasswordHash, @RoleName, @RoleID, @IsActive, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
      `);

    return result.recordset[0];
  }

  static async bulkInsertQuestions(input, adminId) {
    const rows = this.parseQuestionImport(input);
    const results = { success: 0, failed: 0, errors: [] };

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const wordId = Number(row.wordId ?? row.WordID ?? row.wordID);
      const questionType = row.questionType ?? row.QuestionType;
      const questionText = row.questionText ?? row.QuestionText;
      const correctAnswer = row.correctAnswer ?? row.CorrectAnswer;
      const optionsJson = row.optionsJson ?? row.OptionsJson ?? '[]';
      const explanation = row.explanation ?? row.Explanation ?? null;

      try {
        if (!wordId || !questionType || !questionText || !correctAnswer) {
          throw new Error('Missing required fields: wordId, questionType, questionText, correctAnswer');
        }

        JSON.parse(optionsJson || '[]');

        await this.createQuestion({
          wordId,
          questionType,
          questionText,
          optionsJson: optionsJson || '[]',
          correctAnswer,
          explanation
        }, adminId);

        results.success += 1;
      } catch (error) {
        results.failed += 1;
        results.errors.push({
          row: index + 2,
          message: error.message
        });
      }
    }

    return results;
  }

  static async updateUser(userId, userData) {
    const {
      fullName,
      email,
      password,
      role = 'Learner',
      isActive = true
    } = userData;

    assertValidUserRole(role);

    if (!fullName || !email) {
      throw new Error('Invalid user data');
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT UserID FROM Users WHERE Email = @Email AND UserID <> @UserID');

    if (existing.recordset.length > 0) {
      throw new Error('Email already exists');
    }

    const request = pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('RoleName', sql.NVarChar(50), role)
      .input('IsActive', sql.Bit, Boolean(isActive));

    let passwordUpdate = '';
    if (password) {
      if (password.length < 6) {
        throw new Error('Invalid user data');
      }
      const passwordHash = await bcrypt.hash(password, 10);
      request.input('PasswordHash', sql.NVarChar(500), passwordHash);
      passwordUpdate = ', PasswordHash = @PasswordHash';
    }

    const result = await request.query(`
      DECLARE @RoleID INT;
      SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

      IF @RoleID IS NULL
        THROW 50002, 'Role not found', 1;

      UPDATE Users
      SET FullName = @FullName,
          Email = @Email,
          UserRole = @RoleName,
          RoleID = @RoleID,
          IsActive = @IsActive,
          UpdatedAt = SYSDATETIMEOFFSET()
          ${passwordUpdate}
      WHERE UserID = @UserID;
    `);

    return result.rowsAffected.some((count) => count > 0);
  }

  static async deleteUser(userId) {
    const pool = await poolPromise;
    const dependencies = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM Words WHERE CreatedByUserID = @UserID) AS words,
          (SELECT COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID) AS questions,
          (SELECT COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID) AS miniTests,
          (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID) AS topics
      `);

    const ownedContent = dependencies.recordset[0];
    if (ownedContent.words || ownedContent.questions || ownedContent.miniTests || ownedContent.topics) {
      throw new Error('User owns content');
    }

    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('DELETE FROM Users WHERE UserID = @UserID');

    return result.rowsAffected[0] > 0;
  }

  static async toggleUserStatus(userId) {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('UPDATE Users SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID');
    return true;
  }

  static async updateUserRole(userId, roleName) {
    assertValidUserRole(roleName);

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

  static async getNotifications(limit = 50) {
    const pool = await poolPromise;
    const tableExists = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.Notifications', N'U') AS tableId
    `);

    if (!tableExists.recordset[0].tableId) {
      return [];
    }

    const result = await pool.request()
      .input('Limit', sql.Int, limit)
      .query(`
        SELECT TOP (@Limit)
          n.NotificationID AS id,
          n.UserID AS userId,
          u.FullName AS fullName,
          u.Email AS email,
          n.Title AS title,
          n.Message AS message,
          n.Type AS type,
          n.DeliveryChannel AS deliveryChannel,
          n.IsRead AS isRead,
          n.CreatedAt AS createdAt,
          n.ActionUrl AS actionUrl
        FROM Notifications n
        JOIN Users u ON n.UserID = u.UserID
        ORDER BY n.CreatedAt DESC
      `);

    return result.recordset;
  }

  static async sendAnnouncement({ audience = 'All users', title, message, deliveryChannel = 'InApp', actionUrl = null }) {
    if (!title || !message) {
      throw new Error('Missing title or message');
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Audience', sql.NVarChar(50), audience)
      .input('Title', sql.NVarChar(200), title)
      .input('Message', sql.NVarChar(2000), message)
      .input('DeliveryChannel', sql.NVarChar(20), deliveryChannel)
      .input('ActionUrl', sql.NVarChar(500), actionUrl)
      .query(`
        IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
          THROW 50020, 'Notifications table is missing. Run migration_alignment_improvements.sql first.', 1;

        INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, ActionUrl)
        SELECT
          UserID,
          @Title,
          @Message,
          'Announcement',
          CASE WHEN @DeliveryChannel = 'Both' THEN 'InApp' ELSE @DeliveryChannel END,
          @ActionUrl
        FROM Users
        WHERE IsActive = 1
          AND (
            @Audience = 'All users'
            OR (@Audience = 'Learners' AND UserRole = 'Learner')
            OR (@Audience = 'Admins' AND UserRole = 'Admin')
          );

        SELECT @@ROWCOUNT AS inserted;
      `);

    return { inserted: result.recordset[0].inserted };
  }

  static async createDailyReminders() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
        THROW 50020, 'Notifications table is missing. Run migration_alignment_improvements.sql first.', 1;

      INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, ActionUrl)
      SELECT
        u.UserID,
        N'Time to study!',
        CONCAT(N'You have ', due.DueWords, N' words waiting for review today.'),
        'DailyReminder',
        'InApp',
        '/user/learn'
      FROM Users u
      CROSS APPLY
      (
        SELECT COUNT(*) AS DueWords
        FROM UserWordProgress uwp
        WHERE uwp.UserID = u.UserID
          AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET())
      ) due
      WHERE u.IsActive = 1
        AND u.UserRole = 'Learner'
        AND due.DueWords > 0
        AND NOT EXISTS
        (
          SELECT 1
          FROM Notifications n
          WHERE n.UserID = u.UserID
            AND n.Type = 'DailyReminder'
            AND CAST(n.CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
        );

      SELECT @@ROWCOUNT AS inserted;
    `);

    return { inserted: result.recordset[0].inserted };
  }
}

module.exports = AdminService;
