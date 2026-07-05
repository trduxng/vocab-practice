const { sql, poolPromise } = require("../../config/db");

class NotebookService {
  static async getNotebook(userId, page = 1, pageSize = 20) {
    const pool = await poolPromise;
    page = Math.max(1, page);
    pageSize = Math.min(50, Math.max(1, pageSize));
    const offset = (page - 1) * pageSize;
    const countResult = await pool.request().input("UserID", sql.BigInt, userId)
      .query(`SELECT COUNT(*) AS total FROM UserVocabularyNotebook WHERE UserID = @UserID`);
    const total = countResult.recordset[0].total;
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("Offset", sql.Int, offset).input("PageSize", sql.Int, pageSize).query(`
      SELECT un.NotebookID AS notebookId, un.UserID AS userId, un.WordID AS wordId, un.PersonalNote AS personalNote,
        un.IsFavorite AS isFavorite, un.AddedAt AS addedAt, un.UpdatedAt AS updatedAt,
        w.Term AS term, w.Meaning AS meaning, w.Phonetic AS phonetic,
        p.PartOfSpeechName AS partOfSpeechName, ISNULL(uwp.MasteryLevel, 0) AS masteryLevel
      FROM UserVocabularyNotebook un JOIN Words w ON un.WordID = w.WordID
      LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
      LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
      WHERE un.UserID = @UserID ORDER BY un.IsFavorite DESC, un.UpdatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);
    return { data: result.recordset, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async addNotebookEntry(userId, wordId, personalNote) {
    const pool = await poolPromise;
    const existing = await pool.request().input("UserID", sql.BigInt, userId).input("WordID", sql.BigInt, wordId)
      .query(`SELECT NotebookID FROM UserVocabularyNotebook WHERE UserID = @UserID AND WordID = @WordID`);

    if (existing.recordset.length > 0) {
      const result = await pool.request().input("NotebookID", sql.BigInt, existing.recordset[0].NotebookID)
        .input("PersonalNote", sql.NVarChar(2000), personalNote || null)
        .query(`UPDATE UserVocabularyNotebook SET PersonalNote = COALESCE(@PersonalNote, PersonalNote), UpdatedAt = SYSDATETIMEOFFSET()
          OUTPUT inserted.NotebookID AS notebookId, inserted.PersonalNote AS personalNote WHERE NotebookID = @NotebookID`);
      return result.recordset[0];
    }

    const result = await pool.request().input("UserID", sql.BigInt, userId).input("WordID", sql.BigInt, wordId)
      .input("PersonalNote", sql.NVarChar(2000), personalNote || null).input("IsFavorite", sql.Bit, false)
      .query(`INSERT INTO UserVocabularyNotebook (UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt)
        OUTPUT inserted.NotebookID AS notebookId, inserted.PersonalNote AS personalNote
        VALUES (@UserID, @WordID, @PersonalNote, @IsFavorite, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
    return result.recordset[0];
  }

  static async updateNotebookEntry(notebookId, userId, { personalNote, isFavorite }) {
    const pool = await poolPromise;
    const result = await pool.request().input("NotebookID", sql.BigInt, notebookId).input("UserID", sql.BigInt, userId)
      .input("PersonalNote", sql.NVarChar(2000), personalNote !== undefined ? personalNote : null)
      .input("IsFavorite", sql.Bit, isFavorite !== undefined ? Boolean(isFavorite) : null)
      .query(`UPDATE UserVocabularyNotebook SET PersonalNote = COALESCE(@PersonalNote, PersonalNote),
        IsFavorite = CASE WHEN @IsFavorite IS NOT NULL THEN @IsFavorite ELSE IsFavorite END, UpdatedAt = SYSDATETIMEOFFSET()
        OUTPUT inserted.NotebookID AS notebookId, inserted.PersonalNote AS personalNote, inserted.IsFavorite AS isFavorite
        WHERE NotebookID = @NotebookID AND UserID = @UserID`);
    return result.recordset[0] || null;
  }

  static async deleteNotebookEntry(notebookId, userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("NotebookID", sql.BigInt, notebookId).input("UserID", sql.BigInt, userId)
      .query(`DELETE FROM UserVocabularyNotebook OUTPUT deleted.NotebookID AS notebookId WHERE NotebookID = @NotebookID AND UserID = @UserID`);
    return result.recordset[0] || null;
  }

  static async checkNotebookEntry(userId, wordId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.BigInt, userId).input("WordID", sql.BigInt, wordId)
      .query(`SELECT un.NotebookID AS notebookId, un.PersonalNote AS personalNote, un.IsFavorite AS isFavorite FROM UserVocabularyNotebook un WHERE un.UserID = @UserID AND un.WordID = @WordID`);
    return result.recordset[0] || null;
  }
}

module.exports = NotebookService;
