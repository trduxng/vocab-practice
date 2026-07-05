const { poolPromise, sql } = require('../../../config/db');
const AdminShared = require('./admin.shared');

class AuditService {
  static async getAuditLogs(page = 1, limit = 50, filters = {}) {
    const pool = await poolPromise;
    const paging = AdminShared.normalizePagination(page, limit, 100);
    const conditions = [];
    const request = pool.request().input('Offset', sql.Int, paging.offset).input('Limit', sql.Int, paging.limit);
    const search = String(filters.search ?? '').trim();
    const action = String(filters.action ?? '').trim();
    const entityType = String(filters.entityType ?? '').trim();
    const adminId = Number(filters.adminId) || null;
    if (search) { request.input('Search', sql.NVarChar(250), `%${search}%`); conditions.push('(l.Action LIKE @Search OR l.EntityType LIKE @Search OR l.Details LIKE @Search OR u.FullName LIKE @Search OR u.Email LIKE @Search)'); }
    if (action) { request.input('Action', sql.NVarChar(100), action); conditions.push('l.Action = @Action'); }
    if (entityType) { request.input('EntityType', sql.NVarChar(50), entityType); conditions.push('l.EntityType = @EntityType'); }
    if (adminId) { request.input('AdminID', sql.BigInt, adminId); conditions.push('l.ActionByUserID = @AdminID'); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`SELECT COUNT_BIG(1) AS total FROM AdminAuditLogs l LEFT JOIN Users u ON l.ActionByUserID = u.UserID ${where}; SELECT l.AdminAuditLogID AS id, l.ActionByUserID AS adminId, u.FullName AS adminName, u.Email AS adminEmail, l.Action AS action, l.EntityType AS entityType, l.EntityID AS entityId, l.Details AS details, l.CreatedAt AS createdAt FROM AdminAuditLogs l LEFT JOIN Users u ON l.ActionByUserID = u.UserID ${where} ORDER BY l.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`);
    return AdminShared.paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }
}

module.exports = AuditService;
