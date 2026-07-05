const { poolPromise, sql } = require('../../../config/db');

const USER_ROLES = ['Admin', 'Learner', 'ContentCreator'];
const CONTENT_STATUSES = ['Draft', 'PendingReview', 'Published', 'Rejected', 'Archived'];

function assertValidUserRole(roleName) {
  if (!USER_ROLES.includes(roleName)) throw new Error('Invalid role');
}

function normalizePagination(page = 1, limit = 20, maxLimit = 100) {
  return {
    page: Math.max(parseInt(page, 10) || 1, 1),
    limit: Math.min(Math.max(parseInt(limit, 10) || 20, 1), maxLimit),
    offset: (Math.max(parseInt(page, 10) || 1, 1) - 1) * Math.min(Math.max(parseInt(limit, 10) || 20, 1), maxLimit)
  };
}

function paginate(items, total, page, limit) {
  return {
    items,
    pagination: { page, limit, total: Number(total) || 0, totalPages: Math.max(1, Math.ceil((Number(total) || 0) / limit)) }
  };
}

function buildTopicCode(name) {
  const code = String(name ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 50);
  return code || `TOPIC_${Date.now()}`;
}

function normalizeImportKey(value) {
  return String(value ?? '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/^\uFEFF/, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function logAdminAction(adminId, action, entityType, entityId, details = null) {
  try {
    const pool = await poolPromise;
    await pool.request().query(`
      IF OBJECT_ID(N'dbo.AdminAuditLogs', N'U') IS NULL
        CREATE TABLE dbo.AdminAuditLogs (AdminAuditLogID BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY, ActionByUserID BIGINT NOT NULL, Action NVARCHAR(100) NOT NULL, EntityType NVARCHAR(50) NOT NULL, EntityID BIGINT NULL, Details NVARCHAR(MAX) NULL, CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_AdminAuditLogs_CreatedAt DEFAULT (SYSDATETIMEOFFSET()));
    `);
    await pool.request()
      .input('ActionByUserID', sql.BigInt, adminId)
      .input('Action', sql.NVarChar(100), action)
      .input('EntityType', sql.NVarChar(50), entityType)
      .input('EntityID', sql.BigInt, entityId ? Number(entityId) : null)
      .input('Details', sql.NVarChar(sql.MAX), details ? JSON.stringify(details) : null)
      .query('INSERT INTO AdminAuditLogs (ActionByUserID, Action, EntityType, EntityID, Details) VALUES (@ActionByUserID, @Action, @EntityType, @EntityID, @Details)');
  } catch (error) {
    console.warn('Failed to write admin audit log:', error.message);
  }
}

async function logContentReview(entityType, entityId, oldStatus, newStatus, adminId, comment = null) {
  const pool = await poolPromise;
  await pool.request()
    .input('EntityType', sql.NVarChar(30), entityType)
    .input('EntityID', sql.BigInt, entityId)
    .input('ActionByUserID', sql.BigInt, adminId)
    .input('OldStatus', sql.NVarChar(30), oldStatus || null)
    .input('NewStatus', sql.NVarChar(30), newStatus)
    .input('Comment', sql.NVarChar(2000), comment || null)
    .query(`IF OBJECT_ID(N'dbo.ContentReviewLogs', N'U') IS NOT NULL
      INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment) VALUES (@EntityType, @EntityID, @ActionByUserID, @OldStatus, @NewStatus, @Comment)`);
}

function parseDelimitedImport(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === 'object' && input) {
    if (Array.isArray(input.words)) return input.words;
    if (Array.isArray(input.questions)) return input.questions;
    if (Array.isArray(input.rows)) return input.rows;
  }
  if (typeof input !== 'string') throw new Error('Invalid import payload');
  const trimmed = input.trim();
  if (!trimmed) throw new Error('CSV must include a header and at least one data row');
  const records = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const delimiter = [',', ';', '\t'].reduce((best, d) => {
    const c = (trimmed.split('\n')[0] || '').split(d).length;
    return c > (trimmed.split('\n')[0] || '').split(best).length ? d : best;
  }, ',');
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i], next = trimmed[i + 1];
    if (char === '"' && next === '"') { cell += '"'; i++; }
    else if (char === '"') inQuotes = !inQuotes;
    else if (char === delimiter && !inQuotes) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some(v => v !== '')) records.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(v => v !== '')) records.push(row);
  if (records.length < 2) throw new Error('CSV must include a header and at least one data row');
  const headers = records[0].map(h => h.trim());
  return records.slice(1).map(cells => headers.reduce((obj, h, i) => { obj[h] = cells[i] ?? ''; return obj; }, {}));
}

function getImportValue(row, aliases) {
  const normalized = aliases.map(a => normalizeImportKey(a));
  for (const [key, value] of Object.entries(row ?? {})) {
    if (normalized.includes(normalizeImportKey(key))) return value;
  }
}

function splitImportList(value) {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  return String(value ?? '').split(/[;,|]/).map(v => v.trim()).filter(Boolean);
}

module.exports = {
  USER_ROLES, CONTENT_STATUSES, assertValidUserRole,
  normalizePagination, paginate, buildTopicCode, normalizeImportKey,
  logAdminAction, logContentReview,
  parseDelimitedImport, getImportValue, splitImportList,
};
