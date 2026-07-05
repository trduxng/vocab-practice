const { poolPromise, sql } = require('../../../config/db');
const { normalizePagination, paginate, logAdminAction, logContentReview } = require('./admin.shared');

class QuestionService {
  static async getQuestionsByWord(wordId, page = 1, limit = 20, filters = {}) {
    const pool = await poolPromise;
    const paging = normalizePagination(page, limit, 100);
    const search = String(filters.search ?? '').trim();
    const type = String(filters.type ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const conditions = ['WordID = @WordID'];
    const request = pool.request().input('WordID', sql.BigInt, wordId).input('Offset', sql.Int, paging.offset).input('Limit', sql.Int, paging.limit);
    if (search) { request.input('Search', sql.NVarChar(250), `%${search}%`); conditions.push('(QuestionText LIKE @Search OR CorrectAnswer LIKE @Search OR Explanation LIKE @Search)'); }
    if (type) { request.input('QuestionType', sql.NVarChar(30), type); conditions.push('QuestionType = @QuestionType'); }
    if (status) { request.input('ContentStatus', sql.NVarChar(30), status); conditions.push('ContentStatus = @ContentStatus'); }
    const where = `WHERE ${conditions.join(' AND ')}`;
    const result = await request.query(`SELECT COUNT_BIG(1) AS total FROM Questions ${where}; SELECT QuestionID AS id, QuestionType AS questionType, QuestionText AS questionText, OptionsJson AS optionsJson, CorrectAnswer AS correctAnswer, Explanation AS explanation, ContentStatus AS status, UpdatedAt AS updatedAt FROM Questions ${where} ORDER BY UpdatedAt DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`);
    return paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async createQuestion(questionData, adminId) {
    const { wordId, questionType, questionText, optionsJson = '[]', correctAnswer, explanation, status = 'Published' } = questionData;
    if (!CONTENT_STATUSES.includes(status)) throw new Error('Invalid content status');
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId).input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText).input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson)
      .input('CorrectAnswer', sql.NVarChar(500), correctAnswer).input('Explanation', sql.NVarChar(2000), explanation)
      .input('ContentStatus', sql.NVarChar(30), status).input('CreatedByUserID', sql.BigInt, adminId)
      .query(`INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, ContentStatus, CreatedByUserID, CreatedAt, UpdatedAt, PublishedAt)
        OUTPUT inserted.QuestionID AS id
        VALUES (@WordID, @QuestionType, @QuestionText, @OptionsJson, @CorrectAnswer, @Explanation, @ContentStatus, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), CASE WHEN @ContentStatus = N'Published' THEN SYSDATETIMEOFFSET() ELSE NULL END)`);
    const created = result.recordset[0];
    await logAdminAction(adminId, 'CREATE_QUESTION', 'Question', created.id, { wordId, questionType, status });
    return created;
  }

  static async updateQuestion(questionId, questionData, adminId) {
    const { wordId, questionType, questionText, optionsJson = '[]', correctAnswer, explanation, status = 'Published' } = questionData;
    if (!CONTENT_STATUSES.includes(status)) throw new Error('Invalid content status');
    const pool = await poolPromise;
    const oldStatusResult = await pool.request().input('QuestionID', sql.BigInt, questionId).query('SELECT ContentStatus FROM Questions WHERE QuestionID = @QuestionID');
    if (oldStatusResult.recordset.length === 0) return false;
    const oldStatus = oldStatusResult.recordset[0].ContentStatus;
    const result = await pool.request()
      .input('QuestionID', sql.BigInt, questionId).input('WordID', sql.BigInt, wordId).input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText).input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson)
      .input('CorrectAnswer', sql.NVarChar(500), correctAnswer).input('Explanation', sql.NVarChar(2000), explanation)
      .input('ContentStatus', sql.NVarChar(30), status).input('OldStatus', sql.NVarChar(30), oldStatus)
      .query(`UPDATE Questions SET WordID = @WordID, QuestionType = @QuestionType, QuestionText = @QuestionText, OptionsJson = @OptionsJson, CorrectAnswer = @CorrectAnswer, Explanation = @Explanation, ContentStatus = @ContentStatus, UpdatedAt = SYSDATETIMEOFFSET(), PublishedAt = CASE WHEN @ContentStatus = N'Published' AND @OldStatus <> N'Published' THEN SYSDATETIMEOFFSET() ELSE PublishedAt END WHERE QuestionID = @QuestionID`);
    if (result.rowsAffected[0] > 0) {
      if (oldStatus !== status) await logContentReview('Question', questionId, oldStatus, status, adminId, 'Updated from question manager');
      await logAdminAction(adminId, 'UPDATE_QUESTION', 'Question', questionId, { wordId, questionType, oldStatus, status });
    }
    return result.rowsAffected[0] > 0;
  }

  static async deleteQuestion(questionId, adminId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const result = await new sql.Request(transaction).input('QuestionID', sql.BigInt, questionId).query(`
        IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @QuestionID) BEGIN SELECT CAST(0 AS INT) AS deleted; RETURN; END
        DELETE FROM MiniTestItems WHERE QuestionID = @QuestionID; DELETE FROM ExerciseAttempts WHERE QuestionID = @QuestionID; DELETE FROM Questions WHERE QuestionID = @QuestionID;
        UPDATE mt SET TotalQuestions = counts.TotalQuestions, UpdatedAt = SYSDATETIMEOFFSET() FROM MiniTests mt CROSS APPLY (SELECT COUNT(*) AS TotalQuestions FROM MiniTestItems mti WHERE mti.MiniTestID = mt.MiniTestID) counts;
        SELECT CAST(1 AS INT) AS deleted`);
      await transaction.commit();
      const success = result.recordset[0]?.deleted > 0;
      if (success) await logAdminAction(adminId, 'DELETE_QUESTION', 'Question', questionId);
      return success;
    } catch (error) { await transaction.rollback(); throw error; }
  }

  static async bulkInsertQuestions(input, adminId) {
    const { parseDelimitedImport } = require('./admin.shared');
    const rows = parseDelimitedImport(input);
    const results = { success: 0, failed: 0, errors: [] };
    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const wordId = Number(row.wordId ?? row.WordID ?? row.wordID);
        const questionType = row.questionType ?? row.QuestionType;
        const questionText = row.questionText ?? row.QuestionText;
        const correctAnswer = row.correctAnswer ?? row.CorrectAnswer;
        const optionsJson = row.optionsJson ?? row.OptionsJson ?? '[]';
        const explanation = row.explanation ?? row.Explanation ?? null;
        const status = row.status ?? row.ContentStatus ?? 'Published';
        if (!wordId || !questionType || !questionText || !correctAnswer) throw new Error('Missing required fields');
        JSON.parse(optionsJson || '[]');
        await this.createQuestion({ wordId, questionType, questionText, optionsJson: optionsJson || '[]', correctAnswer, explanation, status }, adminId);
        results.success++;
      } catch (error) { results.failed++; results.errors.push({ row: i + 2, message: error.message }); }
    }
    return results;
  }
}

const CONTENT_STATUSES = ['Draft', 'PendingReview', 'Published', 'Rejected', 'Archived'];
module.exports = QuestionService;
