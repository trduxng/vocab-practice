import type { AdminRow, WordFilters, WordPayload } from '../admin.types.ts';
const { AdminShared, poolPromise, sql } = require('../shared/admin.shared.ts');

class WordService extends AdminShared {
  static async getWords(page = 1, limit = 20, filters: WordFilters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const topicId = Number(filters.topicId) || null;
    const partOfSpeechId = Number(filters.partOfSpeechId) || null;
    const search = String(filters.search ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const missingExamples = filters.missingExamples === true || filters.missingExamples === 'true';
    const missingQuestions = filters.missingQuestions === true || filters.missingQuestions === 'true';
    const sortBy = ['term', 'createdAt', 'updatedAt', 'questionCount', 'exampleCount'].includes(filters.sortBy)
      ? filters.sortBy
      : 'createdAt';
    const sortDirection = String(filters.sortDirection ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const sortMap = {
      term: 'w.Term',
      createdAt: 'w.CreatedAt',
      updatedAt: 'w.UpdatedAt',
      questionCount: 'QuestionCount',
      exampleCount: 'ExampleCount'
    };
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (topicId) {
      request.input('TopicID', sql.BigInt, topicId);
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM WordTopics wtFilter
          WHERE wtFilter.WordID = w.WordID
            AND wtFilter.TopicID = @TopicID
        )
      `);
    }

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(w.Term LIKE @Search OR w.Meaning LIKE @Search OR w.Phonetic LIKE @Search)');
    }

    if (partOfSpeechId) {
      request.input('PartOfSpeechID', sql.Int, partOfSpeechId);
      conditions.push('w.PartOfSpeechID = @PartOfSpeechID');
    }

    if (status) {
      this.assertContentStatus(status);
      request.input('ContentStatus', sql.NVarChar(30), status);
      conditions.push('w.ContentStatus = @ContentStatus');
    }

    if (missingExamples) {
      conditions.push('NOT EXISTS (SELECT 1 FROM ExampleSentences exFilter WHERE exFilter.WordID = w.WordID)');
    }

    if (missingQuestions) {
      conditions.push('NOT EXISTS (SELECT 1 FROM Questions qFilter WHERE qFilter.WordID = w.WordID)');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
        SELECT COUNT_BIG(1) AS total
        FROM Words w
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        ${whereClause};

        SELECT w.WordID AS id, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic,
               w.PartOfSpeechID AS partOfSpeechId, p.PartOfSpeechName AS partOfSpeechName,
               w.ContentStatus AS status, w.CreatedAt AS createdAt, w.UpdatedAt AS updatedAt,
               ISNULL(questionCounts.QuestionCount, 0) AS questionCount,
               ISNULL(exampleCounts.ExampleCount, 0) AS exampleCount
        FROM Words w
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        OUTER APPLY (
          SELECT COUNT_BIG(1) AS QuestionCount
          FROM Questions q
          WHERE q.WordID = w.WordID
        ) questionCounts
        OUTER APPLY (
          SELECT COUNT_BIG(1) AS ExampleCount
          FROM ExampleSentences ex
          WHERE ex.WordID = w.WordID
        ) exampleCounts
        ${whereClause}
        ORDER BY ${sortMap[sortBy]} ${sortDirection}, w.WordID DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);

    const total = result.recordsets[0][0]?.total || 0;
    const words = await this.attachWordRelations(pool, result.recordsets[1] || []);

    return this.paginate(words, total, paging.page, paging.limit);
  }

  static async attachWordRelations(pool, words) {
    if (!words.length) return words;

    const wordIds = words.map((word) => Number(word.id)).filter(Boolean);
    const idList = wordIds.join(',');
    const relatedResult = await pool.request().query(`
      SELECT wt.WordID AS wordId, t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code
      FROM WordTopics wt
      JOIN Topics t ON wt.TopicID = t.TopicID
      WHERE wt.WordID IN (${idList})
      ORDER BY t.TopicName;

      SELECT WordID AS wordId, ExampleSentenceID AS id, SentenceText AS sentence, SentenceTranslation AS meaning
      FROM ExampleSentences
      WHERE WordID IN (${idList})
      ORDER BY ExampleSentenceID;
    `);

    const topicsByWord = new Map();
    const examplesByWord = new Map();

    for (const topic of relatedResult.recordsets[0] || []) {
      const key = Number(topic.wordId);
      if (!topicsByWord.has(key)) topicsByWord.set(key, []);
      topicsByWord.get(key).push({ id: topic.id, name: topic.name, code: topic.code });
    }

    for (const example of relatedResult.recordsets[1] || []) {
      const key = Number(example.wordId);
      if (!examplesByWord.has(key)) examplesByWord.set(key, []);
      examplesByWord.get(key).push({ id: example.id, sentence: example.sentence, meaning: example.meaning });
    }

    return words.map((word) => ({
      ...word,
      topics: topicsByWord.get(Number(word.id)) || [],
      examples: examplesByWord.get(Number(word.id)) || []
    }));
  }

  static async getWordDetail(wordId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .query(`
        SELECT
          w.WordID AS id,
          w.Term AS term,
          w.Meaning AS meaning,
          w.Phonetic AS phonetic,
          w.PartOfSpeechID AS partOfSpeechId,
          p.PartOfSpeechName AS partOfSpeechName,
          w.ContentStatus AS status,
          w.CreatedAt AS createdAt,
          w.UpdatedAt AS updatedAt,
          w.CreatedByUserID AS createdByUserId,
          creator.FullName AS createdByName,
          ISNULL(questionCounts.QuestionCount, 0) AS questionCount,
          ISNULL(exampleCounts.ExampleCount, 0) AS exampleCount
        FROM Words w
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        LEFT JOIN Users creator ON w.CreatedByUserID = creator.UserID
        OUTER APPLY (SELECT COUNT_BIG(1) AS QuestionCount FROM Questions q WHERE q.WordID = w.WordID) questionCounts
        OUTER APPLY (SELECT COUNT_BIG(1) AS ExampleCount FROM ExampleSentences ex WHERE ex.WordID = w.WordID) exampleCounts
        WHERE w.WordID = @WordID;

        SELECT t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code
        FROM WordTopics wt
        JOIN Topics t ON wt.TopicID = t.TopicID
        WHERE wt.WordID = @WordID
        ORDER BY t.TopicName;

        SELECT ExampleSentenceID AS id, SentenceText AS sentence, SentenceTranslation AS meaning
        FROM ExampleSentences
        WHERE WordID = @WordID
        ORDER BY ExampleSentenceID;

        SELECT TOP 50
          QuestionID AS id,
          QuestionType AS questionType,
          QuestionText AS questionText,
          CorrectAnswer AS correctAnswer,
          ContentStatus AS status,
          UpdatedAt AS updatedAt
        FROM Questions
        WHERE WordID = @WordID
        ORDER BY UpdatedAt DESC;

        IF OBJECT_ID(N'dbo.AdminAuditLogs', N'U') IS NOT NULL
        BEGIN
          SELECT TOP 20
            l.AdminAuditLogID AS id,
            l.Action AS action,
            l.Details AS details,
            l.CreatedAt AS createdAt,
            u.FullName AS adminName
          FROM AdminAuditLogs l
          LEFT JOIN Users u ON l.ActionByUserID = u.UserID
          WHERE l.EntityType = N'Word' AND l.EntityID = @WordID
          ORDER BY l.CreatedAt DESC;
        END
        ELSE
        BEGIN
          SELECT CAST(NULL AS BIGINT) AS id, CAST(NULL AS NVARCHAR(100)) AS action,
                 CAST(NULL AS NVARCHAR(MAX)) AS details, CAST(NULL AS DATETIMEOFFSET) AS createdAt,
                 CAST(NULL AS NVARCHAR(200)) AS adminName
          WHERE 1 = 0;
        END
      `);

    const word = result.recordsets[0]?.[0];
    if (!word) return null;

    return {
      ...word,
      topics: result.recordsets[1] || [],
      examples: result.recordsets[2] || [],
      questions: result.recordsets[3] || [],
      auditLogs: result.recordsets[4] || []
    };
  }

  static async createWord(wordData: WordPayload, adminId) {
    const { term, meaning, phonetic = '', partOfSpeechId, topicIds, examples, status = 'Published' } = wordData;
    this.assertContentStatus(status);
    const normalizedTopicIds = Array.isArray(topicIds)
      ? [...new Set(topicIds.map((topicId) => Number(topicId)).filter(Boolean))]
      : [];
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
        .input('ContentStatus', sql.NVarChar(30), status)
        .input('CreatedByUserID', sql.BigInt, adminId)
        .query(`
          INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, ContentStatus, CreatedByUserID, CreatedAt, UpdatedAt)
          OUTPUT inserted.WordID AS id
          VALUES (@Term, @Meaning, @Phonetic, @PartOfSpeechID, @ContentStatus, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      
      const wordId = wordResult.recordset[0].id;

      // Insert WordTopics
      if (normalizedTopicIds.length > 0) {
        for (const topicId of normalizedTopicIds) {
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
      await this.logAdminAction(adminId, 'CREATE_WORD', 'Word', wordId, { term, topicIds: normalizedTopicIds });
      return { id: wordId, term, meaning };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateWord(wordId, wordData: WordPayload, adminId = null) {
    const { term, meaning, phonetic = '', partOfSpeechId, topicIds, examples, status = 'Published' } = wordData;
    this.assertContentStatus(status);
    const normalizedTopicIds = Array.isArray(topicIds)
      ? [...new Set(topicIds.map((topicId) => Number(topicId)).filter(Boolean))]
      : null;
    const validExamples = Array.isArray(examples)
      ? examples.filter((ex) => String(ex?.sentence ?? '').trim())
      : null;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const updateReq = new sql.Request(transaction);
      const result = await updateReq
        .input('WordID', sql.BigInt, wordId)
        .input('Term', sql.NVarChar(200), term)
        .input('Meaning', sql.NVarChar(1000), meaning)
        .input('Phonetic', sql.NVarChar(255), phonetic)
        .input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .input('ContentStatus', sql.NVarChar(30), status)
        .query(`
          UPDATE Words
          SET Term = @Term, Meaning = @Meaning, Phonetic = @Phonetic,
              PartOfSpeechID = @PartOfSpeechID,
              ContentStatus = @ContentStatus,
              UpdatedAt = SYSDATETIMEOFFSET()
          WHERE WordID = @WordID
        `);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }

      if (normalizedTopicIds) {
        const deleteTopicsReq = new sql.Request(transaction);
        await deleteTopicsReq
          .input('WordID', sql.BigInt, wordId)
          .query('DELETE FROM WordTopics WHERE WordID = @WordID');

        for (const topicId of normalizedTopicIds) {
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

      if (validExamples) {
        const deleteExamplesReq = new sql.Request(transaction);
        await deleteExamplesReq
          .input('WordID', sql.BigInt, wordId)
          .query('DELETE FROM ExampleSentences WHERE WordID = @WordID');

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
      if (adminId) {
        await this.logAdminAction(adminId, 'UPDATE_WORD', 'Word', wordId, { term, topicIds: normalizedTopicIds });
      }
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async archiveWord(wordId, adminId = null) {
    const pool = await poolPromise;
    const oldStatusResult = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .query('SELECT ContentStatus FROM Words WHERE WordID = @WordID');

    if (oldStatusResult.recordset.length === 0) return false;

    const oldStatus = oldStatusResult.recordset[0].ContentStatus;
    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('ContentStatus', sql.NVarChar(30), 'Archived')
      .query(`
        UPDATE Words
        SET ContentStatus = @ContentStatus,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE WordID = @WordID
      `);

    if (result.rowsAffected[0] > 0 && adminId) {
      await this.logAdminAction(adminId, 'ARCHIVE_WORD', 'Word', wordId);
      await this.logContentReview('Word', wordId, oldStatus, 'Archived', adminId, 'Archived from word manager');
    }

    return result.rowsAffected[0] > 0;
  }

  static async deleteWord(wordId, adminId = null) {
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
      const success = result.recordset[0]?.deleted > 0;
      if (success && adminId) {
        await this.logAdminAction(adminId, 'DELETE_WORD', 'Word', wordId);
      }
      return success;
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

        const topicIds = new Set<number>();
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

  static async previewWordImport(input) {
    const rows = this.parseWordImport(input);
    const pool = await poolPromise;
    const referenceData = await pool.request().query(`
      SELECT PartOfSpeechID AS id, PartOfSpeechName AS name, PartOfSpeechCode AS code
      FROM PartOfSpeeches;

      SELECT TopicID AS id, TopicName AS name, TopicCode AS code
      FROM Topics;
    `);

    const partsOfSpeech = referenceData.recordsets[0] || [];
    const topics = referenceData.recordsets[1] || [];
    const partOfSpeechById = new Map<number, AdminRow>(partsOfSpeech.map((item) => [Number(item.id), item]));
    const partOfSpeechByName = new Map<string, AdminRow>();
    const topicById = new Map<number, AdminRow>(topics.map((item) => [Number(item.id), item]));
    const topicByName = new Map<string, AdminRow>();
    const previewRows = [];
    let valid = 0;
    let invalid = 0;

    for (const item of partsOfSpeech) {
      partOfSpeechByName.set(this.normalizeImportKey(item.name), item);
      partOfSpeechByName.set(this.normalizeImportKey(item.code), item);
    }

    for (const item of topics) {
      topicByName.set(this.normalizeImportKey(item.name), item);
      topicByName.set(this.normalizeImportKey(item.code), item);
    }

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const errors = [];
      const term = String(this.getImportValue(row, ['term', 'word', 'vocabulary', 'tu vung', 'tu']) ?? '').trim();
      const meaning = String(this.getImportValue(row, ['meaning', 'definition', 'dinh nghia', 'nghia']) ?? '').trim();
      const phonetic = String(this.getImportValue(row, ['phonetic', 'pronunciation', 'phien am']) ?? '').trim();
      const rawPartOfSpeechId = this.getImportValue(row, ['partOfSpeechId', 'posId', 'part of speech id', 'loai tu id']);
      const rawPartOfSpeechName = this.getImportValue(row, ['partOfSpeech', 'partOfSpeechName', 'pos', 'part of speech', 'loai tu', 'tu loai']);
      const rawTopicIds = this.getImportValue(row, ['topicIds', 'topicId', 'topic ids', 'chu de ids', 'chu de id']);
      const rawTopics = this.getImportValue(row, ['topics', 'topic', 'topicNames', 'topicName', 'chu de', 'ten chu de']);
      const rawExampleSentence = this.getImportValue(row, ['exampleSentence', 'sentence', 'example', 'cau vi du', 'vi du']);
      const rawExampleMeaning = this.getImportValue(row, ['exampleMeaning', 'sentenceTranslation', 'translation', 'nghia cau vi du', 'dich']);

      if (!term) errors.push('Missing term');
      if (!meaning) errors.push('Missing meaning');

      let partOfSpeech = partOfSpeechById.get(Number(rawPartOfSpeechId));
      if (!partOfSpeech && rawPartOfSpeechName) {
        partOfSpeech = partOfSpeechByName.get(this.normalizeImportKey(rawPartOfSpeechName));
      }
      if (!partOfSpeech) errors.push('Invalid or missing partOfSpeech');

      const resolvedTopics: AdminRow[] = [];
      for (const value of this.splitImportList(rawTopicIds)) {
        const topic = topicById.get(Number(value));
        if (!topic) {
          errors.push(`Invalid topicId: ${value}`);
        } else if (!resolvedTopics.some((item) => Number(item.id) === Number(topic.id))) {
          resolvedTopics.push(topic);
        }
      }

      for (const value of this.splitImportList(rawTopics)) {
        const topic = topicById.get(Number(value)) || topicByName.get(this.normalizeImportKey(value));
        if (!topic) {
          errors.push(`Invalid topic: ${value}`);
        } else if (!resolvedTopics.some((item) => Number(item.id) === Number(topic.id))) {
          resolvedTopics.push(topic);
        }
      }

      if (errors.length > 0) invalid += 1;
      else valid += 1;

      previewRows.push({
        row: index + 2,
        valid: errors.length === 0,
        errors,
        term,
        meaning,
        phonetic,
        partOfSpeech: partOfSpeech ? { id: partOfSpeech.id, name: partOfSpeech.name, code: partOfSpeech.code } : null,
        topics: resolvedTopics.map((topic) => ({ id: topic.id, name: topic.name, code: topic.code })),
        examples: String(rawExampleSentence ?? '').trim()
          ? [{ sentence: String(rawExampleSentence).trim(), meaning: String(rawExampleMeaning ?? '').trim() }]
          : []
      });
    }

    return {
      total: rows.length,
      valid,
      invalid,
      rows: previewRows
    };
  }
}

module.exports = WordService;
