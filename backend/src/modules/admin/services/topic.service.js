const { poolPromise, sql } = require('../../../config/db');
const { normalizePagination, paginate, buildTopicCode, logAdminAction, logContentReview, CONTENT_STATUSES } = require('./admin.shared');

class TopicService {
  static async getTopics(page = 1, limit = 50, filters = {}) {
    const pool = await poolPromise;
    const paging = normalizePagination(page, limit, 200);
    const search = String(filters.search ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const categoryId = Number(filters.categoryId) || null;
    const conditions = [];
    const request = pool.request().input('Offset', sql.Int, paging.offset).input('Limit', sql.Int, paging.limit);

    if (search) { request.input('Search', sql.NVarChar(250), `%${search}%`); conditions.push('(t.TopicName LIKE @Search OR t.TopicCode LIKE @Search OR t.Description LIKE @Search)'); }
    if (status) { request.input('ContentStatus', sql.NVarChar(30), status); conditions.push('t.ContentStatus = @ContentStatus'); }
    if (categoryId) { request.input('TopicCategoryID', sql.BigInt, categoryId); conditions.push('t.TopicCategoryID = @TopicCategoryID'); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total FROM Topics t ${where};
      SELECT t.TopicID AS id, t.TopicName AS name, t.TopicCode AS code, t.Description AS description,
             t.TopicCategoryID AS topicCategoryId, tc.CategoryName AS categoryName, t.ContentStatus AS status,
             COUNT(DISTINCT wt.WordID) AS wordCount, COUNT(DISTINCT mt.MiniTestID) AS miniTestCount,
             t.UpdatedAt AS updatedAt, t.CreatedAt AS createdAt
      FROM Topics t LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID
      LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID LEFT JOIN MiniTests mt ON t.TopicID = mt.TopicID
      ${where} GROUP BY t.TopicID, t.TopicName, t.TopicCode, t.Description, t.TopicCategoryID,
      tc.CategoryName, t.ContentStatus, t.UpdatedAt, t.CreatedAt
      ORDER BY t.UpdatedAt DESC, t.TopicID DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`);
    return paginate(result.recordsets[1] || [], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async createTopic(topicData, adminId) {
    const name = String(topicData?.name ?? '').trim();
    const description = String(topicData?.description ?? '').trim();
    const code = buildTopicCode(topicData?.code || name);
    const topicCategoryId = topicData?.topicCategoryId ? Number(topicData.topicCategoryId) : null;
    const status = topicData?.status || 'Published';
    if (!name || !adminId) throw new Error('Invalid topic data');
    if (!CONTENT_STATUSES.includes(status)) throw new Error('Invalid content status');

    const pool = await poolPromise;
    const duplicate = await pool.request()
      .input('TopicName', sql.NVarChar(200), name).input('TopicCode', sql.NVarChar(50), code)
      .query(`SELECT SUM(CASE WHEN TopicName = @TopicName THEN 1 ELSE 0 END) AS nameCount, SUM(CASE WHEN TopicCode = @TopicCode THEN 1 ELSE 0 END) AS codeCount FROM Topics WHERE TopicName = @TopicName OR TopicCode = @TopicCode`);
    const existing = duplicate.recordset[0] || {};
    if (existing.nameCount > 0) throw new Error('Topic already exists');
    if (existing.codeCount > 0) throw new Error('Topic code already exists');

    const result = await pool.request()
      .input('TopicName', sql.NVarChar(200), name).input('TopicCode', sql.NVarChar(50), code)
      .input('Description', sql.NVarChar(1000), description || null).input('TopicCategoryID', sql.BigInt, topicCategoryId)
      .input('ContentStatus', sql.NVarChar(30), status).input('CreatedByUserID', sql.BigInt, adminId)
      .query(`INSERT INTO Topics (TopicName, TopicCode, Description, TopicCategoryID, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
        OUTPUT inserted.TopicID AS id, inserted.TopicName AS name, inserted.TopicCode AS code, inserted.Description AS description, inserted.ContentStatus AS status
        VALUES (@TopicName, @TopicCode, @Description, @TopicCategoryID, @CreatedByUserID, @ContentStatus, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
    const created = result.recordset[0];
    await logAdminAction(adminId, 'CREATE_TOPIC', 'Topic', created.id, created);
    return created;
  }

  static async updateTopic(topicId, topicData, adminId) {
    const name = topicData.name ? String(topicData.name).trim() : null;
    const description = topicData.description !== undefined ? String(topicData.description ?? '').trim() : null;
    const code = topicData.code ? buildTopicCode(topicData.code) : null;
    const topicCategoryId = topicData.topicCategoryId === undefined ? undefined : (topicData.topicCategoryId ? Number(topicData.topicCategoryId) : null);
    const status = topicData.status || null;
    if (!name && description === null && !code && topicCategoryId === undefined && !status) throw new Error('Invalid topic data');
    if (status && !CONTENT_STATUSES.includes(status)) throw new Error('Invalid content status');

    const pool = await poolPromise;
    const oldStatusResult = await pool.request().input('TopicID', sql.BigInt, topicId).query('SELECT ContentStatus FROM Topics WHERE TopicID = @TopicID');
    if (oldStatusResult.recordset.length === 0) return false;

    const result = await pool.request()
      .input('TopicID', sql.BigInt, topicId).input('TopicName', sql.NVarChar(200), name)
      .input('TopicCode', sql.NVarChar(50), code).input('Description', sql.NVarChar(1000), description)
      .input('TopicCategoryID', sql.BigInt, topicCategoryId === undefined ? null : topicCategoryId)
      .input('HasTopicCategoryID', sql.Bit, topicCategoryId !== undefined).input('ContentStatus', sql.NVarChar(30), status)
      .query(`UPDATE Topics SET TopicName = COALESCE(@TopicName, TopicName), TopicCode = COALESCE(@TopicCode, TopicCode),
        Description = CASE WHEN @Description IS NULL THEN Description ELSE @Description END,
        TopicCategoryID = CASE WHEN @HasTopicCategoryID = 1 THEN @TopicCategoryID ELSE TopicCategoryID END,
        ContentStatus = COALESCE(@ContentStatus, ContentStatus), UpdatedAt = SYSDATETIMEOFFSET() WHERE TopicID = @TopicID`);
    if (result.rowsAffected[0] > 0) {
      await logAdminAction(adminId, 'UPDATE_TOPIC', 'Topic', topicId, topicData);
      if (status) await logContentReview('Topic', topicId, oldStatusResult.recordset[0].ContentStatus, status, adminId, 'Updated from topic manager');
    }
    return result.rowsAffected[0] > 0;
  }

  static async deleteTopic(topicId, adminId) {
    const pool = await poolPromise;
    const row = (await pool.request().input('TopicID', sql.BigInt, topicId)
      .query(`SELECT (SELECT COUNT(*) FROM Topics WHERE TopicID = @TopicID) AS existsCount, (SELECT COUNT(*) FROM WordTopics WHERE TopicID = @TopicID) AS wordCount, (SELECT COUNT(*) FROM MiniTests WHERE TopicID = @TopicID) AS miniTestCount`)).recordset[0];
    if (!row?.existsCount) return { success: false, archived: false };
    if (row.wordCount > 0 || row.miniTestCount > 0) {
      await this.updateTopic(topicId, { status: 'Archived' }, adminId);
      return { success: true, archived: true };
    }
    const result = await pool.request().input('TopicID', sql.BigInt, topicId).query('DELETE FROM Topics WHERE TopicID = @TopicID');
    if (result.rowsAffected[0] > 0) await logAdminAction(adminId, 'DELETE_TOPIC', 'Topic', topicId);
    return { success: result.rowsAffected[0] > 0, archived: false };
  }

  // ── Topic Categories ──
  static async getTopicCategories() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT tc.TopicCategoryID AS id, tc.CategoryName AS name, tc.CategoryCode AS code,
             tc.Description AS description, tc.IconUrl AS iconUrl, tc.DisplayOrder AS displayOrder,
             tc.IsActive AS isActive, COUNT(DISTINCT t.TopicID) AS topicCount,
             COUNT(DISTINCT wt.WordID) AS wordCount, tc.UpdatedAt AS updatedAt, tc.CreatedAt AS createdAt
      FROM TopicCategories tc LEFT JOIN Topics t ON tc.TopicCategoryID = t.TopicCategoryID
      LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID
      GROUP BY tc.TopicCategoryID, tc.CategoryName, tc.CategoryCode, tc.Description,
               tc.IconUrl, tc.DisplayOrder, tc.IsActive, tc.UpdatedAt, tc.CreatedAt
      ORDER BY tc.DisplayOrder ASC, tc.CategoryName ASC`);
    return result.recordset;
  }

  static async createTopicCategory(categoryData, adminId) {
    const name = String(categoryData?.name ?? '').trim();
    const code = buildTopicCode(categoryData?.code || name);
    const description = String(categoryData?.description ?? '').trim();
    const iconUrl = String(categoryData?.iconUrl ?? '').trim();
    const displayOrder = Number(categoryData?.displayOrder) || 1;
    const isActive = categoryData?.isActive === undefined ? true : Boolean(categoryData.isActive);
    if (!name) throw new Error('Invalid topic category data');
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CategoryName', sql.NVarChar(255), name).input('CategoryCode', sql.NVarChar(100), code)
      .input('Description', sql.NVarChar(1000), description || null).input('IconUrl', sql.NVarChar(1000), iconUrl || null)
      .input('DisplayOrder', sql.Int, displayOrder).input('IsActive', sql.Bit, isActive)
      .input('CreatedByUserID', sql.BigInt, adminId)
      .query(`IF EXISTS (SELECT 1 FROM TopicCategories WHERE CategoryCode = @CategoryCode) THROW 50011, 'Topic category code already exists', 1;
        INSERT INTO TopicCategories (CategoryName, CategoryCode, Description, IconUrl, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
        OUTPUT inserted.TopicCategoryID AS id, inserted.CategoryName AS name, inserted.CategoryCode AS code, inserted.Description AS description, inserted.IsActive AS isActive
        VALUES (@CategoryName, @CategoryCode, @Description, @IconUrl, @DisplayOrder, @IsActive, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`);
    const created = result.recordset[0];
    await logAdminAction(adminId, 'CREATE_TOPIC_CATEGORY', 'TopicCategory', created.id, created);
    return created;
  }

  static async updateTopicCategory(categoryId, categoryData, adminId) {
    const name = String(categoryData?.name ?? '').trim();
    const code = buildTopicCode(categoryData?.code || name);
    const description = String(categoryData?.description ?? '').trim();
    const iconUrl = String(categoryData?.iconUrl ?? '').trim();
    const displayOrder = Number(categoryData?.displayOrder) || 1;
    const isActive = categoryData?.isActive === undefined ? true : Boolean(categoryData.isActive);
    if (!name) throw new Error('Invalid topic category data');
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TopicCategoryID', sql.BigInt, categoryId).input('CategoryName', sql.NVarChar(255), name)
      .input('CategoryCode', sql.NVarChar(100), code).input('Description', sql.NVarChar(1000), description || null)
      .input('IconUrl', sql.NVarChar(1000), iconUrl || null).input('DisplayOrder', sql.Int, displayOrder)
      .input('IsActive', sql.Bit, isActive)
      .query(`UPDATE TopicCategories SET CategoryName=@CategoryName, CategoryCode=@CategoryCode,
        Description=@Description, IconUrl=@IconUrl, DisplayOrder=@DisplayOrder, IsActive=@IsActive,
        UpdatedAt=SYSDATETIMEOFFSET() WHERE TopicCategoryID=@TopicCategoryID`);
    if (result.rowsAffected[0] > 0) await logAdminAction(adminId, 'UPDATE_TOPIC_CATEGORY', 'TopicCategory', categoryId, categoryData);
    return result.rowsAffected[0] > 0;
  }

  static async deleteTopicCategory(categoryId, adminId) {
    const pool = await poolPromise;
    const result = await pool.request().input('TopicCategoryID', sql.BigInt, categoryId)
      .query(`UPDATE Topics SET TopicCategoryID = NULL, UpdatedAt = SYSDATETIMEOFFSET() WHERE TopicCategoryID = @TopicCategoryID;
        UPDATE TopicCategories SET IsActive = 0, UpdatedAt = SYSDATETIMEOFFSET() WHERE TopicCategoryID = @TopicCategoryID`);
    const success = result.rowsAffected.some((count) => count > 0);
    if (success) await logAdminAction(adminId, 'DISABLE_TOPIC_CATEGORY', 'TopicCategory', categoryId);
    return success;
  }
}

module.exports = TopicService;
