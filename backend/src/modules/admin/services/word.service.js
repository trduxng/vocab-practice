const { poolPromise, sql } = require('../../../config/db');
const { normalizePagination, paginate, logAdminAction, logContentReview, parseDelimitedImport, getImportValue, splitImportList, normalizeImportKey } = require('./admin.shared');

let partsOfSpeechCache = null;
let topicsCache = null;

async function getReferenceData() {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT PartOfSpeechID AS id, PartOfSpeechName AS name, PartOfSpeechCode AS code FROM PartOfSpeeches; SELECT TopicID AS id, TopicName AS name, TopicCode AS code FROM Topics');
  return { partsOfSpeech: result.recordsets[0] || [], topics: result.recordsets[1] || [] };
}

async function attachWordRelations(pool, words) {
  if (!words.length) return words;
  const wordIds = words.map(w => Number(w.id)).filter(Boolean).join(',');
  if (!wordIds) return words;
  const related = await pool.request().query(`
    SELECT wt.WordID AS wordId, t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code FROM WordTopics wt JOIN Topics t ON wt.TopicID = t.TopicID WHERE wt.WordID IN (${wordIds}) ORDER BY t.TopicName;
    SELECT WordID AS wordId, ExampleSentenceID AS id, SentenceText AS sentence, SentenceTranslation AS meaning FROM ExampleSentences WHERE WordID IN (${wordIds}) ORDER BY ExampleSentenceID`);
  const topicsByWord = new Map(), examplesByWord = new Map();
  for (const t of related.recordsets[0] || []) { const k = Number(t.wordId); if (!topicsByWord.has(k)) topicsByWord.set(k, []); topicsByWord.get(k).push({ id: t.id, name: t.name, code: t.code }); }
  for (const e of related.recordsets[1] || []) { const k = Number(e.wordId); if (!examplesByWord.has(k)) examplesByWord.set(k, []); examplesByWord.get(k).push({ id: e.id, sentence: e.sentence, meaning: e.meaning }); }
  return words.map(w => ({ ...w, topics: topicsByWord.get(Number(w.id)) || [], examples: examplesByWord.get(Number(w.id)) || [] }));
}

class WordService {
  static async getWords(page = 1, limit = 20, filters = {}) {
    const pool = await poolPromise;
    const paging = normalizePagination(page, limit, 100);
    const { topicId, partOfSpeechId, search, status, missingExamples, missingQuestions, sortBy, sortDirection } = {
      topicId: Number(filters.topicId) || null, partOfSpeechId: Number(filters.partOfSpeechId) || null,
      search: String(filters.search ?? '').trim(), status: String(filters.status ?? '').trim(),
      missingExamples: filters.missingExamples === true || filters.missingExamples === 'true',
      missingQuestions: filters.missingQuestions === true || filters.missingQuestions === 'true',
      sortBy: ['term','createdAt','updatedAt','questionCount','exampleCount'].includes(filters.sortBy) ? filters.sortBy : 'createdAt',
      sortDirection: String(filters.sortDirection ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC',
    };
    const conditions = [];
    const request = pool.request().input('Offset', sql.Int, paging.offset).input('Limit', sql.Int, paging.limit);
    const sortMap = { term: 'w.Term', createdAt: 'w.CreatedAt', updatedAt: 'w.UpdatedAt', questionCount: 'QuestionCount', exampleCount: 'ExampleCount' };

    if (topicId) { request.input('TopicID', sql.BigInt, topicId); conditions.push('EXISTS (SELECT 1 FROM WordTopics wtFilter WHERE wtFilter.WordID = w.WordID AND wtFilter.TopicID = @TopicID)'); }
    if (search) { request.input('Search', sql.NVarChar(250), `%${search}%`); conditions.push('(w.Term LIKE @Search OR w.Meaning LIKE @Search OR w.Phonetic LIKE @Search)'); }
    if (partOfSpeechId) { request.input('PartOfSpeechID', sql.Int, partOfSpeechId); conditions.push('w.PartOfSpeechID = @PartOfSpeechID'); }
    if (status) { request.input('ContentStatus', sql.NVarChar(30), status); conditions.push('w.ContentStatus = @ContentStatus'); }
    if (missingExamples) conditions.push('NOT EXISTS (SELECT 1 FROM ExampleSentences exFilter WHERE exFilter.WordID = w.WordID)');
    if (missingQuestions) conditions.push('NOT EXISTS (SELECT 1 FROM Questions qFilter WHERE qFilter.WordID = w.WordID)');

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total FROM Words w ${where};
      SELECT w.WordID AS id, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic, w.PartOfSpeechID AS partOfSpeechId,
        p.PartOfSpeechName AS partOfSpeechName, w.ContentStatus AS status, w.CreatedAt AS createdAt, w.UpdatedAt AS updatedAt,
        ISNULL(questionCounts.QuestionCount, 0) AS questionCount, ISNULL(exampleCounts.ExampleCount, 0) AS exampleCount
      FROM Words w LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      OUTER APPLY (SELECT COUNT_BIG(1) AS QuestionCount FROM Questions q WHERE q.WordID = w.WordID) questionCounts
      OUTER APPLY (SELECT COUNT_BIG(1) AS ExampleCount FROM ExampleSentences ex WHERE ex.WordID = w.WordID) exampleCounts
      ${where} ORDER BY ${sortMap[sortBy]} ${sortDirection}, w.WordID DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`);
    const words = await attachWordRelations(pool, result.recordsets[1] || []);
    return paginate(words, result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async getWordDetail(wordId) {
    const pool = await poolPromise;
    const result = await pool.request().input('WordID', sql.BigInt, wordId).query(`
      SELECT w.WordID AS id, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic, w.PartOfSpeechID AS partOfSpeechId,
        p.PartOfSpeechName AS partOfSpeechName, w.ContentStatus AS status, w.CreatedAt AS createdAt, w.UpdatedAt AS updatedAt,
        w.CreatedByUserID AS createdByUserId, creator.FullName AS createdByName,
        ISNULL(questionCounts.QuestionCount, 0) AS questionCount, ISNULL(exampleCounts.ExampleCount, 0) AS exampleCount
      FROM Words w LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      LEFT JOIN Users creator ON w.CreatedByUserID = creator.UserID
      OUTER APPLY (SELECT COUNT_BIG(1) AS QuestionCount FROM Questions q WHERE q.WordID = w.WordID) questionCounts
      OUTER APPLY (SELECT COUNT_BIG(1) AS ExampleCount FROM ExampleSentences ex WHERE ex.WordID = w.WordID) exampleCounts
      WHERE w.WordID = @WordID;
      SELECT t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code FROM WordTopics wt JOIN Topics t ON wt.TopicID = t.TopicID WHERE wt.WordID = @WordID ORDER BY t.TopicName;
      SELECT ExampleSentenceID AS id, SentenceText AS sentence, SentenceTranslation AS meaning FROM ExampleSentences WHERE WordID = @WordID ORDER BY ExampleSentenceID;
      SELECT TOP 50 QuestionID AS id, QuestionType AS questionType, QuestionText AS questionText, CorrectAnswer AS correctAnswer, ContentStatus AS status, UpdatedAt AS updatedAt FROM Questions WHERE WordID = @WordID ORDER BY UpdatedAt DESC;
    `);
    const word = result.recordsets[0]?.[0];
    if (!word) return null;
    return { ...word, topics: result.recordsets[1] || [], examples: result.recordsets[2] || [], questions: result.recordsets[3] || [] };
  }

  static async createWord(wordData, adminId) {
    const { term, meaning, phonetic = '', partOfSpeechId, topicIds, examples, status = 'Published' } = wordData;
    if (!CONTENT_STATUSES.includes(status)) throw new Error('Invalid content status');
    const normalizedTopicIds = Array.isArray(topicIds) ? [...new Set(topicIds.map(id => Number(id)).filter(Boolean))] : [];
    const validExamples = Array.isArray(examples) ? examples.filter(ex => String(ex?.sentence ?? '').trim()) : [];
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const wordResult = await new sql.Request(transaction)
        .input('Term', sql.NVarChar(200), term).input('Meaning', sql.NVarChar(1000), meaning)
        .input('Phonetic', sql.NVarChar(255), phonetic).input('PartOfSpeechID', sql.Int, partOfSpeechId)
        .input('ContentStatus', sql.NVarChar(30), status).input('CreatedByUserID', sql.BigInt, adminId)
        .query(`INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, ContentStatus, CreatedByUserID, CreatedAt, UpdatedAt) OUTPUT inserted.WordID AS id VALUES (@Term, @Meaning, @Phonetic, @PartOfSpeechID, @ContentStatus, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
      const wordId = wordResult.recordset[0].id;
      for (const tId of normalizedTopicIds) await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).input('TopicID', sql.BigInt, tId).query('INSERT INTO WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @TopicID, SYSDATETIMEOFFSET())');
      for (const ex of validExamples) await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).input('SentenceText', sql.NVarChar(2000), ex.sentence).input('SentenceTranslation', sql.NVarChar(2000), ex.meaning).query('INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt) VALUES (@WordID, @SentenceText, @SentenceTranslation, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())');
      await transaction.commit();
      await logAdminAction(adminId, 'CREATE_WORD', 'Word', wordId, { term, topicIds: normalizedTopicIds });
      return { id: wordId, term, meaning };
    } catch (error) { await transaction.rollback(); throw error; }
  }

  static async updateWord(wordId, wordData, adminId = null) {
    const { term, meaning, phonetic = '', partOfSpeechId, topicIds, examples, status = 'Published' } = wordData;
    if (!CONTENT_STATUSES.includes(status)) throw new Error('Invalid content status');
    const normalizedTopicIds = Array.isArray(topicIds) ? [...new Set(topicIds.map(id => Number(id)).filter(Boolean))] : null;
    const validExamples = Array.isArray(examples) ? examples.filter(ex => String(ex?.sentence ?? '').trim()) : null;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const result = await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).input('Term', sql.NVarChar(200), term).input('Meaning', sql.NVarChar(1000), meaning).input('Phonetic', sql.NVarChar(255), phonetic).input('PartOfSpeechID', sql.Int, partOfSpeechId).input('ContentStatus', sql.NVarChar(30), status).query('UPDATE Words SET Term = @Term, Meaning = @Meaning, Phonetic = @Phonetic, PartOfSpeechID = @PartOfSpeechID, ContentStatus = @ContentStatus, UpdatedAt = SYSDATETIMEOFFSET() WHERE WordID = @WordID');
      if (result.rowsAffected[0] === 0) { await transaction.rollback(); return false; }
      if (normalizedTopicIds) {
        await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).query('DELETE FROM WordTopics WHERE WordID = @WordID');
        for (const tId of normalizedTopicIds) await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).input('TopicID', sql.BigInt, tId).query('INSERT INTO WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @TopicID, SYSDATETIMEOFFSET())');
      }
      if (validExamples) {
        await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).query('DELETE FROM ExampleSentences WHERE WordID = @WordID');
        for (const ex of validExamples) await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).input('SentenceText', sql.NVarChar(2000), ex.sentence).input('SentenceTranslation', sql.NVarChar(2000), ex.meaning).query('INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt) VALUES (@WordID, @SentenceText, @SentenceTranslation, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())');
      }
      await transaction.commit();
      if (adminId) await logAdminAction(adminId, 'UPDATE_WORD', 'Word', wordId, { term, topicIds: normalizedTopicIds });
      return true;
    } catch (error) { await transaction.rollback(); throw error; }
  }

  static async archiveWord(wordId, adminId = null) {
    const pool = await poolPromise;
    const oldStatusResult = await pool.request().input('WordID', sql.BigInt, wordId).query('SELECT ContentStatus FROM Words WHERE WordID = @WordID');
    if (oldStatusResult.recordset.length === 0) return false;
    const oldStatus = oldStatusResult.recordset[0].ContentStatus;
    const result = await pool.request().input('WordID', sql.BigInt, wordId).input('ContentStatus', sql.NVarChar(30), 'Archived').query('UPDATE Words SET ContentStatus = @ContentStatus, UpdatedAt = SYSDATETIMEOFFSET() WHERE WordID = @WordID');
    if (result.rowsAffected[0] > 0 && adminId) { await logAdminAction(adminId, 'ARCHIVE_WORD', 'Word', wordId); await logContentReview('Word', wordId, oldStatus, 'Archived', adminId, 'Archived from word manager'); }
    return result.rowsAffected[0] > 0;
  }

  static async deleteWord(wordId, adminId = null) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const result = await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).query(`
        IF NOT EXISTS (SELECT 1 FROM Words WHERE WordID = @WordID) BEGIN SELECT CAST(0 AS INT) AS deleted; RETURN; END
        DELETE FROM MiniTestItems WHERE QuestionID IN (SELECT QuestionID FROM Questions WHERE WordID = @WordID);
        UPDATE mt SET TotalQuestions = counts.TotalQuestions, UpdatedAt = SYSDATETIMEOFFSET() FROM MiniTests mt CROSS APPLY (SELECT COUNT(*) AS TotalQuestions FROM MiniTestItems mti WHERE mti.MiniTestID = mt.MiniTestID) counts;
        DELETE FROM ExerciseAttempts WHERE WordID = @WordID OR QuestionID IN (SELECT QuestionID FROM Questions WHERE WordID = @WordID);
        DELETE FROM UserWordProgress WHERE WordID = @WordID;
        DELETE FROM Questions WHERE WordID = @WordID; DELETE FROM ExampleSentences WHERE WordID = @WordID; DELETE FROM WordTopics WHERE WordID = @WordID;
        DELETE FROM Words WHERE WordID = @WordID; SELECT @@ROWCOUNT AS deleted`);
      await transaction.commit();
      const success = result.recordset[0]?.deleted > 0;
      if (success && adminId) await logAdminAction(adminId, 'DELETE_WORD', 'Word', wordId);
      return success;
    } catch (error) { await transaction.rollback(); throw error; }
  }

  static async previewWordImport(input) {
    const rows = parseDelimitedImport(input);
    const ref = await getReferenceData();
    const posById = new Map(ref.partsOfSpeech.map(p => [Number(p.id), p]));
    const posByName = new Map(); for (const p of ref.partsOfSpeech) { posByName.set(normalizeImportKey(p.name), p); posByName.set(normalizeImportKey(p.code), p); }
    const topicById = new Map(ref.topics.map(t => [Number(t.id), t]));
    const topicByName = new Map(); for (const t of ref.topics) { topicByName.set(normalizeImportKey(t.name), t); topicByName.set(normalizeImportKey(t.code), t); }
    const previewRows = []; let valid = 0, invalid = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]; const errors = [];
      const term = String(getImportValue(row, ['term','word','vocabulary','tu vung','tu']) ?? '').trim();
      const meaning = String(getImportValue(row, ['meaning','definition','dinh nghia','nghia']) ?? '').trim();
      if (!term) errors.push('Missing term'); if (!meaning) errors.push('Missing meaning');
      const rawPosName = getImportValue(row, ['partOfSpeech','partOfSpeechName','pos','part of speech','loai tu','tu loai']);
      const pos = rawPosName ? posByName.get(normalizeImportKey(rawPosName)) : null;
      if (!pos) errors.push('Invalid or missing partOfSpeech');
      if (errors.length) invalid++; else valid++;
      previewRows.push({ row: i + 2, valid: errors.length === 0, errors, term, meaning, phonetic: '', partOfSpeech: pos || null, topics: [], examples: [] });
    }
    return { total: rows.length, valid, invalid, rows: previewRows };
  }

  static async bulkInsertWords(input, adminId) {
    const rows = parseDelimitedImport(input);
    const results = { success: 0, failed: 0, errors: [] };
    const ref = await getReferenceData();
    const posById = new Map(ref.partsOfSpeech.map(p => [Number(p.id), Number(p.id)]));
    const posByName = new Map(); for (const p of ref.partsOfSpeech) { posByName.set(normalizeImportKey(p.name), Number(p.id)); posByName.set(normalizeImportKey(p.code), Number(p.id)); }
    const topicById = new Map(ref.topics.map(t => [Number(t.id), Number(t.id)]));
    const topicByName = new Map(); for (const t of ref.topics) { topicByName.set(normalizeImportKey(t.name), Number(t.id)); topicByName.set(normalizeImportKey(t.code), Number(t.id)); }
    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const term = String(getImportValue(row, ['term','word','vocabulary','tu vung','tu']) ?? '').trim();
        const meaning = String(getImportValue(row, ['meaning','definition','dinh nghia','nghia']) ?? '').trim();
        const phonetic = String(getImportValue(row, ['phonetic','pronunciation','phien am']) ?? '').trim();
        const rawPosName = getImportValue(row, ['partOfSpeech','partOfSpeechName','pos','part of speech','loai tu','tu loai']);
        if (!term || !meaning) throw new Error('Missing required fields: term, meaning');
        const partOfSpeechId = rawPosName ? posByName.get(normalizeImportKey(rawPosName)) : null;
        if (!partOfSpeechId || !posById.has(Number(partOfSpeechId))) throw new Error('Invalid or missing partOfSpeech');
        const rawTopics = getImportValue(row, ['topics','topic','topicNames','topicName','chu de','ten chu de']);
        const topicIds = new Set();
        for (const val of splitImportList(rawTopics)) {
          const mapped = topicByName.get(normalizeImportKey(val));
          if (!mapped) throw new Error(`Invalid topic: ${val}`);
          topicIds.add(mapped);
        }
        await this.createWord({ term, meaning, phonetic, partOfSpeechId: Number(partOfSpeechId), topicIds: [...topicIds], examples: [] }, adminId);
        results.success++;
      } catch (error) { results.failed++; results.errors.push({ row: i + 2, message: error.message }); }
    }
    return results;
  }
}

const CONTENT_STATUSES = ['Draft', 'PendingReview', 'Published', 'Rejected', 'Archived'];
module.exports = WordService;
