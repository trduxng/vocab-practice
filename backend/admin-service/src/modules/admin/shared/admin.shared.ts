import { poolPromise, sql } from '../../../config/db.ts';

export { poolPromise, sql };

export const USER_ROLES = ['Admin', 'Learner', 'ContentCreator'] as const;

export function assertValidUserRole(roleName: string) {
  if (!USER_ROLES.includes(roleName as (typeof USER_ROLES)[number])) {
    throw new Error('Invalid role');
  }
}

export class AdminShared {
  static CONTENT_STATUSES = ['Draft', 'PendingReview', 'Published', 'Rejected', 'Archived'];

  static normalizePagination(page: string | number = 1, limit: string | number = 20, maxLimit: string | number = 100) {
    const normalizedPage = Math.max(parseInt(String(page), 10) || 1, 1);
    const normalizedMaxLimit = Number(maxLimit) || 100;
    const normalizedLimit = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), normalizedMaxLimit);

    return {
      page: normalizedPage,
      limit: normalizedLimit,
      offset: (normalizedPage - 1) * normalizedLimit
    };
  }

  static paginate<T>(items: T[], total: string | number, page: number, limit: number) {
    const normalizedTotal = Number(total) || 0;

    return {
      items,
      pagination: {
        page,
        limit,
        total: normalizedTotal,
        totalPages: Math.max(1, Math.ceil(normalizedTotal / limit))
      }
    };
  }

  static buildTopicCode(name) {
    const code = String(name ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/\u0110/g, 'D')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50);

    return code || `TOPIC_${Date.now()}`;
  }

  static assertContentStatus(status) {
    if (!this.CONTENT_STATUSES.includes(status)) {
      throw new Error('Invalid content status');
    }
  }

  static async logAdminAction(adminId, action, entityType, entityId, details = null) {
    try {
      const pool = await poolPromise;
      await pool.request().query(`
        IF OBJECT_ID(N'dbo.AdminAuditLogs', N'U') IS NULL
        BEGIN
          CREATE TABLE dbo.AdminAuditLogs
          (
            AdminAuditLogID BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
            ActionByUserID BIGINT NOT NULL,
            Action NVARCHAR(100) NOT NULL,
            EntityType NVARCHAR(50) NOT NULL,
            EntityID BIGINT NULL,
            Details NVARCHAR(MAX) NULL,
            CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_AdminAuditLogs_CreatedAt DEFAULT (SYSDATETIMEOFFSET())
          );
        END
      `);

      await pool.request()
        .input('ActionByUserID', sql.BigInt, adminId)
        .input('Action', sql.NVarChar(100), action)
        .input('EntityType', sql.NVarChar(50), entityType)
        .input('EntityID', sql.BigInt, entityId ? Number(entityId) : null)
        .input('Details', sql.NVarChar(sql.MAX), details ? JSON.stringify(details) : null)
        .query(`
          INSERT INTO AdminAuditLogs (ActionByUserID, Action, EntityType, EntityID, Details)
          VALUES (@ActionByUserID, @Action, @EntityType, @EntityID, @Details)
        `);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('Failed to write admin audit log', message);
    }
  }

  static async logContentReview(entityType, entityId, oldStatus, newStatus, adminId, comment = null) {
    const pool = await poolPromise;
    await pool.request()
      .input('EntityType', sql.NVarChar(30), entityType)
      .input('EntityID', sql.BigInt, entityId)
      .input('ActionByUserID', sql.BigInt, adminId)
      .input('OldStatus', sql.NVarChar(30), oldStatus || null)
      .input('NewStatus', sql.NVarChar(30), newStatus)
      .input('Comment', sql.NVarChar(2000), comment || null)
      .query(`
        IF OBJECT_ID(N'dbo.ContentReviewLogs', N'U') IS NOT NULL
        BEGIN
          INSERT INTO ContentReviewLogs (EntityType, EntityID, ActionByUserID, OldStatus, NewStatus, Comment)
          VALUES (@EntityType, @EntityID, @ActionByUserID, @OldStatus, @NewStatus, @Comment)
        END
      `);
  }

  static normalizeImportKey(value) {
    return String(value ?? '')
      .replace(/\u0111/g, 'd')
      .replace(/\u0110/g, 'D')
      .replace(/^\uFEFF/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
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

}
