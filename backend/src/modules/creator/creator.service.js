const { poolPromise, sql } = require('../../config/db');

class CreatorService {
  // ── Dashboard & Analytics ──
  static async getDashboardStats(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input('UserID', sql.BigInt, userId)
      .query(`SELECT * FROM vw_ContentCreatorContentSummary WHERE UserID = @UserID;
        SELECT a.* FROM vw_TopicLearningAnalytics a JOIN Topics t ON t.TopicID = a.TopicID WHERE t.CreatedByUserID = @UserID;
        SELECT a.* FROM vw_MiniTestAnalytics a JOIN MiniTests mt ON mt.MiniTestID = a.MiniTestID WHERE mt.CreatedByUserID = @UserID;`);
    return { stats: result.recordsets[0][0] || {}, topicAnalytics: result.recordsets[1] || [], miniTestAnalytics: result.recordsets[2] || [] };
  }

  static async getContentSummary(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input('UserID', sql.BigInt, userId)
      .query(`SELECT 'Topic' AS EntityType, ContentStatus, COUNT(*) AS Total FROM Topics WHERE CreatedByUserID = @UserID GROUP BY ContentStatus
        UNION ALL SELECT 'Word', ContentStatus, COUNT(*) FROM Words WHERE CreatedByUserID = @UserID GROUP BY ContentStatus
        UNION ALL SELECT 'Question', ContentStatus, COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID GROUP BY ContentStatus
        UNION ALL SELECT 'MiniTest', ContentStatus, COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID GROUP BY ContentStatus`);
    return result.recordset;
  }

  static async getAcademicAnalytics(userId) {
    const pool = await poolPromise;
    const [summaryRes, hardWordsRes, attemptsRes, perfRes] = await Promise.all([
      pool.request().input('UserID', sql.BigInt, userId).query(`SELECT (SELECT COUNT(DISTINCT mta.UserID) FROM MiniTestAttempts mta JOIN MiniTests mt ON mta.MiniTestID = mt.MiniTestID WHERE mt.CreatedByUserID = @UserID) AS totalStudents, (SELECT ISNULL(AVG(mta.Score), 0) FROM MiniTestAttempts mta JOIN MiniTests mt ON mta.MiniTestID = mt.MiniTestID WHERE mt.CreatedByUserID = @UserID) AS averageScore, (SELECT COUNT(mta.MiniTestAttemptID) FROM MiniTestAttempts mta JOIN MiniTests mt ON mta.MiniTestID = mt.MiniTestID WHERE mt.CreatedByUserID = @UserID) AS totalAttempts, (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID AND ContentStatus = 'Published') AS publishedTopics`),
      pool.request().input('UserID', sql.BigInt, userId).query(`SELECT TOP 10 w.WordID AS wordId, w.Term AS term, w.Meaning AS meaning, COUNT(*) AS totalAttempts, SUM(CASE WHEN ea.IsCorrect = 0 THEN 1 ELSE 0 END) AS wrongAttempts, CAST(SUM(CASE WHEN ea.IsCorrect = 0 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*) AS DECIMAL(5,1)) AS failureRate FROM ExerciseAttempts ea JOIN Words w ON ea.WordID = w.WordID WHERE w.CreatedByUserID = @UserID GROUP BY w.WordID, w.Term, w.Meaning HAVING COUNT(*) >= 1 ORDER BY failureRate DESC`),
      pool.request().input('UserID', sql.BigInt, userId).query(`SELECT mta.MiniTestAttemptID AS id, mta.MiniTestID AS testId, mt.TestTitle AS testTitle, mta.UserID AS userId, u.FullName AS studentName, mta.Score AS score, mta.TotalQuestions AS totalQuestions, mta.CorrectCount AS correctCount, mta.SubmittedAt AS submittedAt FROM MiniTestAttempts mta JOIN MiniTests mt ON mta.MiniTestID = mt.MiniTestID JOIN Users u ON mta.UserID = u.UserID WHERE mt.CreatedByUserID = @UserID ORDER BY mta.SubmittedAt DESC`),
      pool.request().input('UserID', sql.BigInt, userId).query(`SELECT mt.MiniTestID AS testId, mt.TestTitle AS testTitle, ISNULL(AVG(mta.Score), 0) AS averageScore, COUNT(mta.MiniTestAttemptID) AS attemptCount FROM MiniTests mt LEFT JOIN MiniTestAttempts mta ON mt.MiniTestID = mta.MiniTestID WHERE mt.CreatedByUserID = @UserID GROUP BY mt.MiniTestID, mt.TestTitle`),
    ]);
    const summary = summaryRes.recordset[0] || { totalStudents: 0, averageScore: 0, totalAttempts: 0, publishedTopics: 0 };
    summary.averageScore = Number(Number(summary.averageScore).toFixed(1));
    return { summary, hardWords: hardWordsRes.recordset.map(w => ({ ...w, failureRate: Number(w.failureRate) })), studentAttempts: attemptsRes.recordset, testPerformance: perfRes.recordset.map(t => ({ ...t, averageScore: Number(Number(t.averageScore).toFixed(1)) })) };
  }

  // ── Topics ──
  static async getMyTopics(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1), pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 50));
    const offset = (page - 1) * pageSize;
    let where = 't.CreatedByUserID = @UserID';
    const req = pool.request().input('UserID', sql.BigInt, userId);
    if (filters.status) { req.input('Status', sql.NVarChar(20), filters.status); where += ' AND t.ContentStatus = @Status'; }
    const total = (await req.query(`SELECT COUNT(*) AS total FROM Topics t WHERE ${where}`)).recordset[0].total;
    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 't.CreatedByUserID = @UserID';
    if (filters.status) { req2.input('Status', sql.NVarChar(20), filters.status); where2 += ' AND t.ContentStatus = @Status'; }
    const result = await req2.query(`SELECT t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code, t.Description AS description, t.ContentStatus AS contentStatus, tc.CategoryName AS categoryName, t.TopicCategoryID AS categoryId, t.CreatedAt AS createdAt FROM Topics t LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID WHERE ${where2} ORDER BY t.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY`);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async createTopic(data, userId) {
    const { topicName, topicCode, description, topicCategoryId } = data;
    const pool = await poolPromise;
    const result = await pool.request().input('TopicName', sql.NVarChar(200), topicName).input('TopicCode', sql.NVarChar(50), topicCode).input('Description', sql.NVarChar(1000), description || null).input('TopicCategoryID', sql.BigInt, topicCategoryId || null).input('CreatedByUserID', sql.BigInt, userId).query(`INSERT INTO Topics (TopicName, TopicCode, Description, TopicCategoryID, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt) OUTPUT inserted.TopicID AS id VALUES (@TopicName, @TopicCode, @Description, @TopicCategoryID, @CreatedByUserID, 'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
    return { id: result.recordset[0].id, topicName };
  }

  static async updateTopic(id, data, userId) {
    const { topicName, topicCode, description, topicCategoryId } = data;
    const pool = await poolPromise;
    const result = await pool.request().input('TopicID', sql.BigInt, id).input('UserID', sql.BigInt, userId).input('TopicName', sql.NVarChar(200), topicName).input('TopicCode', sql.NVarChar(50), topicCode || null).input('Description', sql.NVarChar(1000), description || null).input('TopicCategoryID', sql.BigInt, topicCategoryId || null).query('UPDATE Topics SET TopicName = ISNULL(@TopicName, TopicName), TopicCode = ISNULL(@TopicCode, TopicCode), Description = ISNULL(@Description, Description), TopicCategoryID = ISNULL(@TopicCategoryID, TopicCategoryID), UpdatedAt = SYSDATETIMEOFFSET() WHERE TopicID = @TopicID AND CreatedByUserID = @UserID');
    return result.rowsAffected[0] > 0;
  }

  static async deleteTopic(id, userId) {
    const pool = await poolPromise;
    const result = await pool.request().input('TopicID', sql.BigInt, id).input('UserID', sql.BigInt, userId).query("DELETE FROM Topics WHERE TopicID = @TopicID AND CreatedByUserID = @UserID AND ContentStatus = 'Draft'");
    return result.rowsAffected[0] > 0;
  }

  static async submitForReview(entityType, id, userId) {
    const map = { topic: { table: 'Topics', idCol: 'TopicID', type: 'Topic' }, word: { table: 'Words', idCol: 'WordID', type: 'Word' }, question: { table: 'Questions', idCol: 'QuestionID', type: 'Question' }, minitest: { table: 'MiniTests', idCol: 'MiniTestID', type: 'MiniTest' } };
    const e = map[String(entityType || '').toLowerCase()];
    if (!e) throw new Error('EntityType không hợp lệ');
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const upd = await new sql.Request(transaction).input('ID', sql.BigInt, id).input('UserID', sql.BigInt, userId).query(`UPDATE ${e.table} SET ContentStatus = 'PendingReview', UpdatedAt = SYSDATETIMEOFFSET() WHERE ${e.idCol} = @ID AND CreatedByUserID = @UserID AND ContentStatus IN ('Draft', 'Rejected')`);
      if (upd.rowsAffected[0] === 0) { await transaction.rollback(); return false; }
      await new sql.Request(transaction).input('EntityType', sql.NVarChar(30), e.type).input('EntityID', sql.BigInt, id).input('ActionByUserID', sql.BigInt, userId).query(`INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, NewStatus, Comment, CreatedAt) VALUES (@EntityType, @EntityID, @ActionByUserID, 'PendingReview', 'Submitted for review', SYSDATETIMEOFFSET())`);
      await transaction.commit(); return true;
    } catch (err) { await transaction.rollback(); throw err; }
  }

  // ── Words ──
  static async getMyWords(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1), pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 50));
    const offset = (page - 1) * pageSize, topicId = filters.topicId ? Number(filters.topicId) : null;
    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'w.CreatedByUserID = @UserID';
    if (filters.status) { req.input('Status', sql.NVarChar(20), filters.status); where += ' AND w.ContentStatus = @Status'; }
    if (topicId) { req.input('TopicID', sql.BigInt, topicId); where += ' AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = @TopicID)'; }
    const total = (await req.query(`SELECT COUNT(*) AS total FROM Words w WHERE ${where}`)).recordset[0].total;
    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 'w.CreatedByUserID = @UserID';
    if (filters.status) { req2.input('Status', sql.NVarChar(20), filters.status); where2 += ' AND w.ContentStatus = @Status'; }
    if (topicId) { req2.input('TopicID', sql.BigInt, topicId); where2 += ' AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = w.WordID AND wt.TopicID = @TopicID)'; }
    const result = await req2.query(`SELECT w.WordID AS id, w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic, w.PartOfSpeechID AS partOfSpeechId, p.PartOfSpeechName AS partOfSpeechName, w.ContentStatus AS contentStatus, w.CreatedAt AS createdAt FROM Words w LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID WHERE ${where2} ORDER BY w.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY`);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async createWord(data, userId) {
    const { term, meaning, phonetic, partOfSpeechId, topicIds, examples } = data;
    if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) throw new Error('Từ vựng bắt buộc phải được gán vào ít nhất một chủ đề');
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const wordResult = await new sql.Request(transaction).input('Term', sql.NVarChar(200), term).input('Meaning', sql.NVarChar(1000), meaning).input('Phonetic', sql.NVarChar(255), phonetic || '').input('PartOfSpeechID', sql.Int, partOfSpeechId).input('CreatedByUserID', sql.BigInt, userId).query(`INSERT INTO Words (Term, Meaning, Phonetic, PartOfSpeechID, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt) OUTPUT inserted.WordID AS id VALUES (@Term, @Meaning, @Phonetic, @PartOfSpeechID, @CreatedByUserID, 'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
      const wordId = wordResult.recordset[0].id;
      for (const tid of topicIds) await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).input('TopicID', sql.BigInt, tid).query('INSERT INTO WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @TopicID, SYSDATETIMEOFFSET())');
      const validExamples = Array.isArray(examples) ? examples.filter(e => String(e?.sentence ?? '').trim()) : [];
      for (const ex of validExamples) await new sql.Request(transaction).input('WordID', sql.BigInt, wordId).input('SentenceText', sql.NVarChar(2000), ex.sentence).input('SentenceTranslation', sql.NVarChar(2000), ex.meaning || '').query('INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt) VALUES (@WordID, @SentenceText, @SentenceTranslation, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())');
      await transaction.commit(); return { id: wordId, term };
    } catch (err) { await transaction.rollback(); throw err; }
  }

  static async updateWord(id, data, userId) {
    const { term, meaning, phonetic, partOfSpeechId } = data;
    const pool = await poolPromise;
    const result = await pool.request().input('WordID', sql.BigInt, id).input('UserID', sql.BigInt, userId).input('Term', sql.NVarChar(200), term).input('Meaning', sql.NVarChar(1000), meaning).input('Phonetic', sql.NVarChar(255), phonetic || '').input('PartOfSpeechID', sql.Int, partOfSpeechId).query('UPDATE Words SET Term=@Term, Meaning=@Meaning, Phonetic=@Phonetic, PartOfSpeechID=@PartOfSpeechID, UpdatedAt=SYSDATETIMEOFFSET() WHERE WordID=@WordID AND CreatedByUserID=@UserID');
    return result.rowsAffected[0] > 0;
  }

  static async deleteWord(id, userId) {
    const pool = await poolPromise;
    const result = await pool.request().input('WordID', sql.BigInt, id).input('UserID', sql.BigInt, userId).query("DELETE FROM Words WHERE WordID=@WordID AND CreatedByUserID=@UserID AND ContentStatus='Draft'");
    return result.rowsAffected[0] > 0;
  }

  // ── Questions ──
  static async getMyQuestions(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1), pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 50));
    const offset = (page - 1) * pageSize, topicId = filters.topicId ? Number(filters.topicId) : null;
    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'q.CreatedByUserID = @UserID';
    if (filters.status) { req.input('Status', sql.NVarChar(20), filters.status); where += ' AND q.ContentStatus = @Status'; }
    if (topicId) { req.input('TopicID', sql.BigInt, topicId); where += ' AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = q.WordID AND wt.TopicID = @TopicID)'; }
    const total = (await req.query(`SELECT COUNT(*) AS total FROM Questions q WHERE ${where}`)).recordset[0].total;
    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 'q.CreatedByUserID = @UserID';
    if (filters.status) { req2.input('Status', sql.NVarChar(20), filters.status); where2 += ' AND q.ContentStatus = @Status'; }
    if (topicId) { req2.input('TopicID', sql.BigInt, topicId); where2 += ' AND EXISTS (SELECT 1 FROM WordTopics wt WHERE wt.WordID = q.WordID AND wt.TopicID = @TopicID)'; }
    const result = await req2.query(`SELECT q.QuestionID AS id, q.WordID AS wordId, w.Term AS wordTerm, q.QuestionType AS questionType, q.QuestionText AS questionText, q.OptionsJson AS optionsJson, q.CorrectAnswer AS correctAnswer, q.Explanation AS explanation, q.ContentStatus AS contentStatus, q.CreatedAt AS createdAt FROM Questions q LEFT JOIN Words w ON q.WordID = w.WordID WHERE ${where2} ORDER BY q.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY`);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async createQuestion(data, userId) {
    const { wordId, questionType, questionText, optionsJson, correctAnswer, explanation } = data;
    const pool = await poolPromise;
    const wordCheck = await pool.request().input('WordID', sql.BigInt, wordId).input('UserID', sql.BigInt, userId).query(`SELECT w.WordID FROM Words w JOIN WordTopics wt ON w.WordID = wt.WordID WHERE w.WordID = @WordID AND w.CreatedByUserID = @UserID`);
    if (wordCheck.recordset.length === 0) throw new Error('Từ vựng không hợp lệ hoặc không thuộc quyền sở hữu của bạn');
    const result = await pool.request().input('WordID', sql.BigInt, wordId).input('QuestionType', sql.NVarChar(30), questionType).input('QuestionText', sql.NVarChar(2000), questionText).input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson || '[]').input('CorrectAnswer', sql.NVarChar(500), correctAnswer).input('Explanation', sql.NVarChar(2000), explanation || null).input('CreatedByUserID', sql.BigInt, userId).query(`INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt) OUTPUT inserted.QuestionID AS id VALUES (@WordID, @QuestionType, @QuestionText, @OptionsJson, @CorrectAnswer, @Explanation, @CreatedByUserID, 'Draft', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
    return result.recordset[0];
  }

  static async updateQuestion(id, data, userId) {
    const { wordId, questionType, questionText, optionsJson, correctAnswer, explanation } = data;
    const pool = await poolPromise;
    const result = await pool.request().input('QuestionID', sql.BigInt, id).input('UserID', sql.BigInt, userId).input('WordID', sql.BigInt, wordId).input('QuestionType', sql.NVarChar(30), questionType).input('QuestionText', sql.NVarChar(2000), questionText).input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson || '[]').input('CorrectAnswer', sql.NVarChar(500), correctAnswer).input('Explanation', sql.NVarChar(2000), explanation || null).query('UPDATE Questions SET WordID=@WordID, QuestionType=@QuestionType, QuestionText=@QuestionText, OptionsJson=@OptionsJson, CorrectAnswer=@CorrectAnswer, Explanation=@Explanation, UpdatedAt=SYSDATETIMEOFFSET() WHERE QuestionID=@QuestionID AND CreatedByUserID=@UserID');
    return result.rowsAffected[0] > 0;
  }

  static async deleteQuestion(id, userId) {
    const pool = await poolPromise;
    const result = await pool.request().input('QuestionID', sql.BigInt, id).input('UserID', sql.BigInt, userId).query("DELETE FROM Questions WHERE QuestionID=@QuestionID AND CreatedByUserID=@UserID AND ContentStatus='Draft'");
    return result.rowsAffected[0] > 0;
  }

  // ── MiniTests ──
  static async getMyMiniTests(userId, filters = {}) {
    const pool = await poolPromise;
    const page = Math.max(1, parseInt(filters.page) || 1), pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 50));
    const offset = (page - 1) * pageSize;
    const req = pool.request().input('UserID', sql.BigInt, userId);
    let where = 'mt.CreatedByUserID = @UserID';
    if (filters.status) { req.input('Status', sql.NVarChar(20), filters.status); where += ' AND mt.ContentStatus = @Status'; }
    const total = (await req.query(`SELECT COUNT(*) AS total FROM MiniTests mt WHERE ${where}`)).recordset[0].total;
    const req2 = pool.request().input('UserID', sql.BigInt, userId).input('Offset', sql.Int, offset).input('PageSize', sql.Int, pageSize);
    let where2 = 'mt.CreatedByUserID = @UserID';
    if (filters.status) { req2.input('Status', sql.NVarChar(20), filters.status); where2 += ' AND mt.ContentStatus = @Status'; }
    const result = await req2.query(`SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description, mt.TopicID AS topicId, t.TopicName AS topicName, mt.TotalQuestions AS totalQuestions, mt.IsPublished AS isPublished, mt.ContentStatus AS contentStatus, mt.CreatedAt AS createdAt FROM MiniTests mt LEFT JOIN Topics t ON mt.TopicID = t.TopicID WHERE ${where2} ORDER BY mt.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY`);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
  // ... còn createMiniTest, updateMiniTest, deleteMiniTest, media...
}

module.exports = CreatorService;