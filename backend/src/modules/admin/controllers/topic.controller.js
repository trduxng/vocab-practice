const TopicService = require('../services/topic.service');
const { poolPromise, sql } = require('../../../config/db');

class TopicController {
  static async getTopics(req, res, next) {
    try { res.json(await TopicService.getTopics(parseInt(req.query.page) || 1, parseInt(req.query.limit) || 50, { search: req.query.search, status: req.query.status, categoryId: req.query.categoryId })); } catch (e) { next(e); }
  }
  static async getTopicCategories(req, res, next) {
    try { const pool = await poolPromise; res.json((await pool.request().query('SELECT tc.TopicCategoryID AS id, tc.CategoryName AS name, tc.CategoryCode AS code, tc.Description AS description, tc.IconUrl AS iconUrl, tc.DisplayOrder AS displayOrder, tc.IsActive AS isActive, COUNT(DISTINCT t.TopicID) AS topicCount, COUNT(DISTINCT wt.WordID) AS wordCount, tc.UpdatedAt AS updatedAt, tc.CreatedAt AS createdAt FROM TopicCategories tc LEFT JOIN Topics t ON tc.TopicCategoryID = t.TopicCategoryID LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID GROUP BY tc.TopicCategoryID, tc.CategoryName, tc.CategoryCode, tc.Description, tc.IconUrl, tc.DisplayOrder, tc.IsActive, tc.UpdatedAt, tc.CreatedAt ORDER BY tc.DisplayOrder ASC, tc.CategoryName ASC')).recordset); } catch (e) { next(e); }
  }
  static async createTopic(req, res, next) {
    try { const result = await TopicService.createTopic(req.body, req.user.id); res.status(201).json({ message: 'Tạo chủ đề thành công', data: result }); } catch (e) { next(e); }
  }
  static async updateTopic(req, res, next) {
    try { const ok = await TopicService.updateTopic(req.params.id, req.body, req.user.id); if (!ok) return res.status(404).json({ message: 'Không tìm thấy chủ đề' }); res.json({ message: 'Cập nhật chủ đề thành công' }); } catch (e) { next(e); }
  }
  static async deleteTopic(req, res, next) {
    try { const result = await TopicService.deleteTopic(req.params.id, req.user.id); if (!result.success) return res.status(404).json({ message: 'Không tìm thấy chủ đề' }); res.json({ message: result.archived ? 'Đã lưu trữ' : 'Xóa thành công', archived: result.archived }); } catch (e) { next(e); }
  }
  static async createTopicCategory(req, res, next) {
    try { const pool = await poolPromise; const { name, code, description, iconUrl, displayOrder = 1, isActive = true } = req.body; const result = await pool.request().input('CategoryName', sql.NVarChar(255), name).input('CategoryCode', sql.NVarChar(100), code || name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 100)).input('Description', sql.NVarChar(1000), description || null).input('IconUrl', sql.NVarChar(1000), iconUrl || null).input('DisplayOrder', sql.Int, displayOrder).input('IsActive', sql.Bit, isActive).input('CreatedByUserID', sql.BigInt, req.user.id).query('INSERT INTO TopicCategories (CategoryName, CategoryCode, Description, IconUrl, DisplayOrder, IsActive, CreatedByUserID) OUTPUT inserted.TopicCategoryID AS id VALUES (@CategoryName, @CategoryCode, @Description, @IconUrl, @DisplayOrder, @IsActive, @CreatedByUserID)'); res.status(201).json({ message: 'Tạo danh mục thành công', data: result.recordset[0] }); } catch (e) { next(e); }
  }
  static async updateTopicCategory(req, res, next) {
    try { const pool = await poolPromise; const { name, code, description, iconUrl, displayOrder, isActive } = req.body; await pool.request().input('TopicCategoryID', sql.BigInt, req.params.id).input('CategoryName', sql.NVarChar(255), name).input('CategoryCode', sql.NVarChar(100), code).input('Description', sql.NVarChar(1000), description || null).input('IconUrl', sql.NVarChar(1000), iconUrl || null).input('DisplayOrder', sql.Int, displayOrder || 1).input('IsActive', sql.Bit, isActive !== undefined ? isActive : true).query('UPDATE TopicCategories SET CategoryName = @CategoryName, CategoryCode = @CategoryCode, Description = @Description, IconUrl = @IconUrl, DisplayOrder = @DisplayOrder, IsActive = @IsActive, UpdatedAt = SYSDATETIMEOFFSET() WHERE TopicCategoryID = @TopicCategoryID'); res.json({ message: 'Cập nhật thành công' }); } catch (e) { next(e); }
  }
  static async deleteTopicCategory(req, res, next) {
    try { const pool = await poolPromise; await pool.request().input('TopicCategoryID', sql.BigInt, req.params.id).query('UPDATE Topics SET TopicCategoryID = NULL WHERE TopicCategoryID = @TopicCategoryID; UPDATE TopicCategories SET IsActive = 0, UpdatedAt = SYSDATETIMEOFFSET() WHERE TopicCategoryID = @TopicCategoryID'); res.json({ message: 'Đã tắt danh mục' }); } catch (e) { next(e); }
  }
}

module.exports = TopicController;