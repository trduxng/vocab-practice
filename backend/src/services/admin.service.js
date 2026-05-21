const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

const USER_ROLES = ['Admin', 'Learner', 'ContentCreator'];

function assertValidUserRole(roleName) {
  if (!USER_ROLES.includes(roleName)) {
    throw new Error('Invalid role');
  }
}

class AdminService {
  static CONTENT_STATUSES = ['Draft', 'PendingReview', 'Published', 'Rejected', 'Archived'];

  static normalizePagination(page = 1, limit = 20, maxLimit = 100) {
    const normalizedPage = Math.max(parseInt(page, 10) || 1, 1);
    const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), maxLimit);

    return {
      page: normalizedPage,
      limit: normalizedLimit,
      offset: (normalizedPage - 1) * normalizedLimit
    };
  }

  static paginate(items, total, page, limit) {
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
      console.warn('Failed to write admin audit log', error.message);
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

  // --- TOPICS ---
  static async getTopics(page = 1, limit = 50, filters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 200);
    const search = String(filters.search ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const categoryId = Number(filters.categoryId) || null;
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(t.TopicName LIKE @Search OR t.TopicCode LIKE @Search OR t.Description LIKE @Search)');
    }

    if (status) {
      this.assertContentStatus(status);
      request.input('ContentStatus', sql.NVarChar(30), status);
      conditions.push('t.ContentStatus = @ContentStatus');
    }

    if (categoryId) {
      request.input('TopicCategoryID', sql.BigInt, categoryId);
      conditions.push('t.TopicCategoryID = @TopicCategoryID');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total
      FROM Topics t
      LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID
      ${whereClause};

      SELECT
        t.TopicID AS id,
        t.TopicName AS name,
        t.TopicCode AS code,
        t.Description AS description,
        t.TopicCategoryID AS topicCategoryId,
        tc.CategoryName AS categoryName,
        t.ContentStatus AS status,
        COUNT(DISTINCT wt.WordID) AS wordCount,
        COUNT(DISTINCT mt.MiniTestID) AS miniTestCount,
        t.UpdatedAt AS updatedAt,
        t.CreatedAt AS createdAt
      FROM Topics t
      LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID
      LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID
      LEFT JOIN MiniTests mt ON t.TopicID = mt.TopicID
      ${whereClause}
      GROUP BY t.TopicID, t.TopicName, t.TopicCode, t.Description, t.TopicCategoryID,
               tc.CategoryName, t.ContentStatus, t.UpdatedAt, t.CreatedAt
      ORDER BY t.UpdatedAt DESC, t.TopicID DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;
    `);

    return this.paginate(result.recordsets[1] || [], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async getTopicCategories() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        tc.TopicCategoryID AS id,
        tc.CategoryName AS name,
        tc.CategoryCode AS code,
        tc.Description AS description,
        tc.IconUrl AS iconUrl,
        tc.DisplayOrder AS displayOrder,
        tc.IsActive AS isActive,
        COUNT(DISTINCT t.TopicID) AS topicCount,
        COUNT(DISTINCT wt.WordID) AS wordCount,
        tc.UpdatedAt AS updatedAt,
        tc.CreatedAt AS createdAt
      FROM TopicCategories tc
      LEFT JOIN Topics t ON tc.TopicCategoryID = t.TopicCategoryID
      LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID
      GROUP BY tc.TopicCategoryID, tc.CategoryName, tc.CategoryCode, tc.Description,
               tc.IconUrl, tc.DisplayOrder, tc.IsActive, tc.UpdatedAt, tc.CreatedAt
      ORDER BY tc.DisplayOrder ASC, tc.CategoryName ASC;
    `);

    return result.recordset;
  }

  static async createTopic(topicData, adminId) {
    const name = String(topicData?.name ?? '').trim();
    const description = String(topicData?.description ?? '').trim();
    const code = this.buildTopicCode(topicData?.code || name);
    const topicCategoryId = topicData?.topicCategoryId ? Number(topicData.topicCategoryId) : null;
    const status = topicData?.status || 'Published';

    if (!name || !adminId) {
      throw new Error('Invalid topic data');
    }
    this.assertContentStatus(status);

    const pool = await poolPromise;
    const duplicate = await pool.request()
      .input('TopicName', sql.NVarChar(200), name)
      .input('TopicCode', sql.NVarChar(50), code)
      .query(`
        SELECT
          SUM(CASE WHEN TopicName = @TopicName THEN 1 ELSE 0 END) AS nameCount,
          SUM(CASE WHEN TopicCode = @TopicCode THEN 1 ELSE 0 END) AS codeCount
        FROM Topics
        WHERE TopicName = @TopicName OR TopicCode = @TopicCode
      `);

    const existing = duplicate.recordset[0] || {};
    if (existing.nameCount > 0) {
      throw new Error('Topic already exists');
    }
    if (existing.codeCount > 0) {
      throw new Error('Topic code already exists');
    }

    const result = await pool.request()
      .input('TopicName', sql.NVarChar(200), name)
      .input('TopicCode', sql.NVarChar(50), code)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('TopicCategoryID', sql.BigInt, topicCategoryId)
      .input('ContentStatus', sql.NVarChar(30), status)
      .input('CreatedByUserID', sql.BigInt, adminId)
      .query(`
        IF @TopicCategoryID IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM TopicCategories WHERE TopicCategoryID = @TopicCategoryID)
          THROW 50010, 'Invalid topic category', 1;

        INSERT INTO Topics (
          TopicName,
          TopicCode,
          Description,
          TopicCategoryID,
          CreatedByUserID,
          ContentStatus,
          CreatedAt,
          UpdatedAt
        )
        OUTPUT
          inserted.TopicID AS id,
          inserted.TopicName AS name,
          inserted.TopicCode AS code,
          inserted.Description AS description,
          inserted.ContentStatus AS status
        VALUES (
          @TopicName,
          @TopicCode,
          @Description,
          @TopicCategoryID,
          @CreatedByUserID,
          @ContentStatus,
          SYSDATETIMEOFFSET(),
          SYSDATETIMEOFFSET()
        );
      `);

    const created = result.recordset[0];
    await this.logAdminAction(adminId, 'CREATE_TOPIC', 'Topic', created.id, created);
    return created;
  }

  static async updateTopic(topicId, topicData, adminId) {
    const name = topicData.name ? String(topicData.name).trim() : null;
    const description = topicData.description !== undefined ? String(topicData.description ?? '').trim() : null;
    const code = topicData.code ? this.buildTopicCode(topicData.code) : null;
    const topicCategoryId = topicData.topicCategoryId === undefined ? undefined : (topicData.topicCategoryId ? Number(topicData.topicCategoryId) : null);
    const status = topicData.status || null;

    if (!name && description === null && !code && topicCategoryId === undefined && !status) {
      throw new Error('Invalid topic data');
    }
    if (status) this.assertContentStatus(status);

    const pool = await poolPromise;
    if (name || code) {
      const duplicate = await pool.request()
        .input('TopicID', sql.BigInt, topicId)
        .input('TopicName', sql.NVarChar(200), name)
        .input('TopicCode', sql.NVarChar(50), code)
        .query(`
          SELECT
            SUM(CASE WHEN @TopicName IS NOT NULL AND TopicName = @TopicName THEN 1 ELSE 0 END) AS nameCount,
            SUM(CASE WHEN @TopicCode IS NOT NULL AND TopicCode = @TopicCode THEN 1 ELSE 0 END) AS codeCount
          FROM Topics
          WHERE TopicID <> @TopicID
            AND ((@TopicName IS NOT NULL AND TopicName = @TopicName) OR (@TopicCode IS NOT NULL AND TopicCode = @TopicCode))
        `);

      const existing = duplicate.recordset[0] || {};
      if (existing.nameCount > 0) throw new Error('Topic already exists');
      if (existing.codeCount > 0) throw new Error('Topic code already exists');
    }

    const oldStatusResult = await pool.request()
      .input('TopicID', sql.BigInt, topicId)
      .query('SELECT ContentStatus FROM Topics WHERE TopicID = @TopicID');

    if (oldStatusResult.recordset.length === 0) return false;

    const request = pool.request()
      .input('TopicID', sql.BigInt, topicId)
      .input('TopicName', sql.NVarChar(200), name)
      .input('TopicCode', sql.NVarChar(50), code)
      .input('Description', sql.NVarChar(1000), description)
      .input('TopicCategoryID', sql.BigInt, topicCategoryId === undefined ? null : topicCategoryId)
      .input('HasTopicCategoryID', sql.Bit, topicCategoryId !== undefined)
      .input('ContentStatus', sql.NVarChar(30), status);

    const result = await request.query(`
      IF @HasTopicCategoryID = 1 AND @TopicCategoryID IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM TopicCategories WHERE TopicCategoryID = @TopicCategoryID)
        THROW 50010, 'Invalid topic category', 1;

      UPDATE Topics
      SET TopicName = COALESCE(@TopicName, TopicName),
          TopicCode = COALESCE(@TopicCode, TopicCode),
          Description = CASE WHEN @Description IS NULL THEN Description ELSE @Description END,
          TopicCategoryID = CASE WHEN @HasTopicCategoryID = 1 THEN @TopicCategoryID ELSE TopicCategoryID END,
          ContentStatus = COALESCE(@ContentStatus, ContentStatus),
          UpdatedAt = SYSDATETIMEOFFSET()
      WHERE TopicID = @TopicID
    `);

    if (result.rowsAffected[0] > 0) {
      await this.logAdminAction(adminId, 'UPDATE_TOPIC', 'Topic', topicId, topicData);
      if (status) {
        await this.logContentReview('Topic', topicId, oldStatusResult.recordset[0].ContentStatus, status, adminId, 'Updated from topic manager');
      }
    }

    return result.rowsAffected[0] > 0;
  }

  static async deleteTopic(topicId, adminId) {
    const pool = await poolPromise;
    const dependencies = await pool.request()
      .input('TopicID', sql.BigInt, topicId)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM Topics WHERE TopicID = @TopicID) AS existsCount,
          (SELECT COUNT(*) FROM WordTopics WHERE TopicID = @TopicID) AS wordCount,
          (SELECT COUNT(*) FROM MiniTests WHERE TopicID = @TopicID) AS miniTestCount
      `);

    const row = dependencies.recordset[0];
    if (!row?.existsCount) return { success: false, archived: false };

    if (row.wordCount > 0 || row.miniTestCount > 0) {
      await this.updateTopic(topicId, { status: 'Archived' }, adminId);
      return { success: true, archived: true };
    }

    const result = await pool.request()
      .input('TopicID', sql.BigInt, topicId)
      .query('DELETE FROM Topics WHERE TopicID = @TopicID');

    if (result.rowsAffected[0] > 0) {
      await this.logAdminAction(adminId, 'DELETE_TOPIC', 'Topic', topicId);
    }

    return { success: result.rowsAffected[0] > 0, archived: false };
  }

  static async createTopicCategory(categoryData, adminId) {
    const name = String(categoryData?.name ?? '').trim();
    const code = this.buildTopicCode(categoryData?.code || name);
    const description = String(categoryData?.description ?? '').trim();
    const iconUrl = String(categoryData?.iconUrl ?? '').trim();
    const displayOrder = Number(categoryData?.displayOrder) || 1;
    const isActive = categoryData?.isActive === undefined ? true : Boolean(categoryData.isActive);

    if (!name) throw new Error('Invalid topic category data');

    const pool = await poolPromise;
    const result = await pool.request()
      .input('CategoryName', sql.NVarChar(255), name)
      .input('CategoryCode', sql.NVarChar(100), code)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('IconUrl', sql.NVarChar(1000), iconUrl || null)
      .input('DisplayOrder', sql.Int, displayOrder)
      .input('IsActive', sql.Bit, isActive)
      .input('CreatedByUserID', sql.BigInt, adminId)
      .query(`
        IF EXISTS (SELECT 1 FROM TopicCategories WHERE CategoryCode = @CategoryCode)
          THROW 50011, 'Topic category code already exists', 1;

        INSERT INTO TopicCategories (CategoryName, CategoryCode, Description, IconUrl, DisplayOrder, IsActive, CreatedByUserID, CreatedAt, UpdatedAt)
        OUTPUT inserted.TopicCategoryID AS id, inserted.CategoryName AS name, inserted.CategoryCode AS code, inserted.Description AS description, inserted.IsActive AS isActive
        VALUES (@CategoryName, @CategoryCode, @Description, @IconUrl, @DisplayOrder, @IsActive, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);

    const created = result.recordset[0];
    await this.logAdminAction(adminId, 'CREATE_TOPIC_CATEGORY', 'TopicCategory', created.id, created);
    return created;
  }

  static async updateTopicCategory(categoryId, categoryData, adminId) {
    const name = String(categoryData?.name ?? '').trim();
    const code = this.buildTopicCode(categoryData?.code || name);
    const description = String(categoryData?.description ?? '').trim();
    const iconUrl = String(categoryData?.iconUrl ?? '').trim();
    const displayOrder = Number(categoryData?.displayOrder) || 1;
    const isActive = categoryData?.isActive === undefined ? true : Boolean(categoryData.isActive);

    if (!name) throw new Error('Invalid topic category data');

    const pool = await poolPromise;
    const result = await pool.request()
      .input('TopicCategoryID', sql.BigInt, categoryId)
      .input('CategoryName', sql.NVarChar(255), name)
      .input('CategoryCode', sql.NVarChar(100), code)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('IconUrl', sql.NVarChar(1000), iconUrl || null)
      .input('DisplayOrder', sql.Int, displayOrder)
      .input('IsActive', sql.Bit, isActive)
      .query(`
        IF EXISTS (SELECT 1 FROM TopicCategories WHERE CategoryCode = @CategoryCode AND TopicCategoryID <> @TopicCategoryID)
          THROW 50011, 'Topic category code already exists', 1;

        UPDATE TopicCategories
        SET CategoryName = @CategoryName,
            CategoryCode = @CategoryCode,
            Description = @Description,
            IconUrl = @IconUrl,
            DisplayOrder = @DisplayOrder,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE TopicCategoryID = @TopicCategoryID
      `);

    if (result.rowsAffected[0] > 0) {
      await this.logAdminAction(adminId, 'UPDATE_TOPIC_CATEGORY', 'TopicCategory', categoryId, categoryData);
    }

    return result.rowsAffected[0] > 0;
  }

  static async deleteTopicCategory(categoryId, adminId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TopicCategoryID', sql.BigInt, categoryId)
      .query(`
        UPDATE Topics SET TopicCategoryID = NULL, UpdatedAt = SYSDATETIMEOFFSET()
        WHERE TopicCategoryID = @TopicCategoryID;

        UPDATE TopicCategories
        SET IsActive = 0, UpdatedAt = SYSDATETIMEOFFSET()
        WHERE TopicCategoryID = @TopicCategoryID;
      `);

    const success = result.rowsAffected.some((count) => count > 0);
    if (success) {
      await this.logAdminAction(adminId, 'DISABLE_TOPIC_CATEGORY', 'TopicCategory', categoryId);
    }
    return success;
  }

  // --- WORDS ---
  static async getWords(page = 1, limit = 20, filters = {}) {
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

  static async createWord(wordData, adminId) {
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

  static async updateWord(wordId, wordData, adminId = null) {
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

        const topicIds = new Set();
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
    const partOfSpeechById = new Map(partsOfSpeech.map((item) => [Number(item.id), item]));
    const partOfSpeechByName = new Map();
    const topicById = new Map(topics.map((item) => [Number(item.id), item]));
    const topicByName = new Map();
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

      const resolvedTopics = [];
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

  // --- QUESTIONS ---
  static async getQuestionsByWord(wordId, page = 1, limit = 20, filters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const search = String(filters.search ?? '').trim();
    const type = String(filters.type ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const conditions = ['WordID = @WordID'];
    const request = pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(QuestionText LIKE @Search OR CorrectAnswer LIKE @Search OR Explanation LIKE @Search)');
    }

    if (type) {
      request.input('QuestionType', sql.NVarChar(30), type);
      conditions.push('QuestionType = @QuestionType');
    }

    if (status) {
      request.input('ContentStatus', sql.NVarChar(30), status);
      conditions.push('ContentStatus = @ContentStatus');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const result = await request
      .query(`
        SELECT COUNT_BIG(1) AS total
        FROM Questions
        ${whereClause};

        SELECT QuestionID AS id, QuestionType AS questionType, QuestionText AS questionText, 
               OptionsJson AS optionsJson, CorrectAnswer AS correctAnswer, Explanation AS explanation,
               ContentStatus AS status, UpdatedAt AS updatedAt
        FROM Questions
        ${whereClause}
        ORDER BY UpdatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);
    return this.paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async createQuestion(questionData, adminId) {
    const { wordId, questionType, questionText, optionsJson = '[]', correctAnswer, explanation } = questionData;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WordID', sql.BigInt, wordId)
      .input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText)
      .input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson)
      .input('CorrectAnswer', sql.NVarChar(500), correctAnswer)
      .input('Explanation', sql.NVarChar(2000), explanation)
      .input('CreatedByUserID', sql.BigInt, adminId)
      .query(`
        INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, CreatedByUserID, CreatedAt, UpdatedAt)
        OUTPUT inserted.QuestionID AS id
        VALUES (@WordID, @QuestionType, @QuestionText, @OptionsJson, @CorrectAnswer, @Explanation, @CreatedByUserID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);
    const created = result.recordset[0];
    await this.logAdminAction(adminId, 'CREATE_QUESTION', 'Question', created.id, { wordId, questionType });
    return created;
  }

  static async updateQuestion(questionId, questionData, adminId) {
    const { wordId, questionType, questionText, optionsJson = '[]', correctAnswer, explanation } = questionData;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('QuestionID', sql.BigInt, questionId)
      .input('WordID', sql.BigInt, wordId)
      .input('QuestionType', sql.NVarChar(30), questionType)
      .input('QuestionText', sql.NVarChar(2000), questionText)
      .input('OptionsJson', sql.NVarChar(sql.MAX), optionsJson)
      .input('CorrectAnswer', sql.NVarChar(500), correctAnswer)
      .input('Explanation', sql.NVarChar(2000), explanation)
      .query(`
        UPDATE Questions
        SET WordID = @WordID,
            QuestionType = @QuestionType,
            QuestionText = @QuestionText,
            OptionsJson = @OptionsJson,
            CorrectAnswer = @CorrectAnswer,
            Explanation = @Explanation,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE QuestionID = @QuestionID
      `);

    if (result.rowsAffected[0] > 0) {
      await this.logAdminAction(adminId, 'UPDATE_QUESTION', 'Question', questionId, { wordId, questionType });
    }

    return result.rowsAffected[0] > 0;
  }

  static async deleteQuestion(questionId, adminId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);
      const result = await request
        .input('QuestionID', sql.BigInt, questionId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Questions WHERE QuestionID = @QuestionID)
          BEGIN
            SELECT CAST(0 AS INT) AS deleted;
            RETURN;
          END

          DELETE FROM MiniTestItems WHERE QuestionID = @QuestionID;
          DELETE FROM ExerciseAttempts WHERE QuestionID = @QuestionID;
          DELETE FROM Questions WHERE QuestionID = @QuestionID;

          UPDATE mt
          SET TotalQuestions = counts.TotalQuestions,
              UpdatedAt = SYSDATETIMEOFFSET()
          FROM MiniTests mt
          CROSS APPLY (
            SELECT COUNT(*) AS TotalQuestions
            FROM MiniTestItems mti
            WHERE mti.MiniTestID = mt.MiniTestID
          ) counts;

          SELECT CAST(1 AS INT) AS deleted;
        `);

      await transaction.commit();

      const success = result.recordset[0]?.deleted > 0;
      if (success) {
        await this.logAdminAction(adminId, 'DELETE_QUESTION', 'Question', questionId);
      }
      return success;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- MINI TESTS ---
  static async getMiniTests(page = 1, limit = 20, filters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const search = String(filters.search ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const topicId = Number(filters.topicId) || null;
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(mt.TestTitle LIKE @Search OR mt.Description LIKE @Search OR t.TopicName LIKE @Search)');
    }

    if (status) {
      request.input('ContentStatus', sql.NVarChar(30), status);
      conditions.push('mt.ContentStatus = @ContentStatus');
    }

    if (topicId) {
      request.input('TopicID', sql.BigInt, topicId);
      conditions.push('mt.TopicID = @TopicID');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      ${whereClause};

      SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description, 
             mt.TopicID AS topicId, t.TopicName AS topicName, mt.TotalQuestions AS totalQuestions,
             mt.IsPublished AS isPublished, mt.ContentStatus AS status, mt.UpdatedAt AS updatedAt,
             (
               SELECT mti.QuestionID AS id
               FROM MiniTestItems mti
               WHERE mti.MiniTestID = mt.MiniTestID
               ORDER BY mti.DisplayOrder
               FOR JSON PATH
             ) AS questionsJson
      FROM MiniTests mt
      LEFT JOIN Topics t ON mt.TopicID = t.TopicID
      ${whereClause}
      ORDER BY mt.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    const items = result.recordsets[1].map((test) => ({
      ...test,
      questionIds: test.questionsJson ? JSON.parse(test.questionsJson).map((item) => item.id) : []
    }));
    return this.paginate(items, result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async createMiniTest(testData, adminId) {
    const { title, description, topicId, questionIds } = testData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      
      const testResult = await request
        .input('Title', sql.NVarChar(255), title)
        .input('Description', sql.NVarChar(1000), description)
        .input('TopicID', sql.BigInt, topicId)
        .input('CreatedByUserID', sql.BigInt, adminId)
        .input('TotalQuestions', sql.Int, questionIds.length)
        .query(`
          INSERT INTO MiniTests (TestTitle, Description, TopicID, CreatedByUserID, TotalQuestions, IsPublished, CreatedAt, UpdatedAt)
          OUTPUT inserted.MiniTestID AS id
          VALUES (@Title, @Description, @TopicID, @CreatedByUserID, @TotalQuestions, 1, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      
      const testId = testResult.recordset[0].id;

      for (let i = 0; i < questionIds.length; i++) {
        const itemReq = new sql.Request(transaction);
        await itemReq
          .input('MiniTestID', sql.BigInt, testId)
          .input('QuestionID', sql.BigInt, questionIds[i])
          .input('DisplayOrder', sql.Int, i + 1)
          .query(`
            INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
            VALUES (@MiniTestID, @QuestionID, @DisplayOrder)
          `);
      }

      await transaction.commit();
      await this.logAdminAction(adminId, 'CREATE_MINI_TEST', 'MiniTest', testId, { title, topicId, questionCount: questionIds.length });
      return { id: testId, title };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateMiniTest(testId, testData, adminId) {
    const { title, description, topicId, questionIds } = testData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const updateReq = new sql.Request(transaction);
      const result = await updateReq
        .input('MiniTestID', sql.BigInt, testId)
        .input('Title', sql.NVarChar(255), title)
        .input('Description', sql.NVarChar(1000), description || null)
        .input('TopicID', sql.BigInt, topicId || null)
        .input('TotalQuestions', sql.Int, questionIds.length)
        .query(`
          UPDATE MiniTests
          SET TestTitle = @Title,
              Description = @Description,
              TopicID = @TopicID,
              TotalQuestions = @TotalQuestions,
              UpdatedAt = SYSDATETIMEOFFSET()
          WHERE MiniTestID = @MiniTestID
        `);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }

      const deleteReq = new sql.Request(transaction);
      await deleteReq
        .input('MiniTestID', sql.BigInt, testId)
        .query('DELETE FROM MiniTestItems WHERE MiniTestID = @MiniTestID');

      for (let i = 0; i < questionIds.length; i++) {
        const itemReq = new sql.Request(transaction);
        await itemReq
          .input('MiniTestID', sql.BigInt, testId)
          .input('QuestionID', sql.BigInt, questionIds[i])
          .input('DisplayOrder', sql.Int, i + 1)
          .query(`
            INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
            VALUES (@MiniTestID, @QuestionID, @DisplayOrder)
          `);
      }

      await transaction.commit();
      await this.logAdminAction(adminId, 'UPDATE_MINI_TEST', 'MiniTest', testId, { title, topicId, questionCount: questionIds.length });
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteMiniTest(testId, adminId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      const result = await request
        .input('MiniTestID', sql.BigInt, testId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM MiniTests WHERE MiniTestID = @MiniTestID)
          BEGIN
            SELECT CAST(0 AS INT) AS deleted;
            RETURN;
          END

          IF OBJECT_ID(N'dbo.MiniTestAttempts', N'U') IS NOT NULL
            DELETE FROM MiniTestAttempts WHERE MiniTestID = @MiniTestID;

          DELETE FROM MiniTestItems WHERE MiniTestID = @MiniTestID;
          DELETE FROM MiniTests WHERE MiniTestID = @MiniTestID;
          SELECT CAST(1 AS INT) AS deleted;
        `);

      await transaction.commit();
      const success = result.recordset[0]?.deleted > 0;
      if (success) {
        await this.logAdminAction(adminId, 'DELETE_MINI_TEST', 'MiniTest', testId);
      }
      return success;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async setMiniTestStatus(testId, status, adminId, comment = null) {
    this.assertContentStatus(status);
    const pool = await poolPromise;
    const oldStatusResult = await pool.request()
      .input('MiniTestID', sql.BigInt, testId)
      .query('SELECT ContentStatus FROM MiniTests WHERE MiniTestID = @MiniTestID');

    if (oldStatusResult.recordset.length === 0) return false;
    const oldStatus = oldStatusResult.recordset[0].ContentStatus;

    const result = await pool.request()
      .input('MiniTestID', sql.BigInt, testId)
      .input('ContentStatus', sql.NVarChar(30), status)
      .input('ReviewedByUserID', sql.BigInt, adminId)
      .query(`
        UPDATE MiniTests
        SET ContentStatus = @ContentStatus,
            IsPublished = CASE WHEN @ContentStatus = N'Published' THEN 1 ELSE 0 END,
            ReviewedByUserID = @ReviewedByUserID,
            ReviewedAt = SYSDATETIMEOFFSET(),
            PublishedAt = CASE WHEN @ContentStatus = N'Published' THEN SYSDATETIMEOFFSET() ELSE PublishedAt END,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE MiniTestID = @MiniTestID
      `);

    if (result.rowsAffected[0] > 0) {
      await this.logContentReview('MiniTest', testId, oldStatus, status, adminId, comment);
      await this.logAdminAction(adminId, 'UPDATE_MINI_TEST_STATUS', 'MiniTest', testId, { oldStatus, status, comment });
    }
    return result.rowsAffected[0] > 0;
  }

  static async getDashboardStats() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Users) AS totalUsers,
        (SELECT COUNT(*) FROM Users WHERE UserRole = 'Learner') AS totalStudents,
        (SELECT COUNT(*) FROM Users WHERE UserRole = 'ContentCreator') AS totalCreators,
        (SELECT COUNT(*) FROM Words) AS totalWords,
        (SELECT COUNT(*) FROM Topics) AS totalTopics,
        (SELECT COUNT(*) FROM Topics WHERE ContentStatus = 'Published') AS publishedTopics,
        (SELECT COUNT(*) FROM Questions) AS totalQuestions,
        (SELECT COUNT(*) FROM ExerciseAttempts) AS totalAttempts,
        (SELECT COUNT(*) FROM MiniTests) AS totalMiniTests,
        (SELECT COUNT(*) FROM Topics WHERE ContentStatus = 'PendingReview') +
        (SELECT COUNT(*) FROM Words WHERE ContentStatus = 'PendingReview') +
        (SELECT COUNT(*) FROM Questions WHERE ContentStatus = 'PendingReview') +
        (SELECT COUNT(*) FROM MiniTests WHERE ContentStatus = 'PendingReview') AS pendingReviews,
        (SELECT COUNT(*) FROM UserWordProgress WHERE MemoryStatus = 'Mastered') AS masteredRecords,
        (SELECT COUNT(*) FROM UserWordProgress WHERE NextReviewDate <= SYSDATETIMEOFFSET() OR NextReviewDate IS NULL) AS dueReviews,
        (SELECT COUNT(*) FROM Users WHERE CreatedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET())) AS newUsersThisWeek,
        (SELECT COUNT(DISTINCT UserID) FROM ExerciseAttempts WHERE AttemptedAt >= DATEADD(day, -1, SYSDATETIMEOFFSET())) AS activeUsersToday,
        (SELECT CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) FROM ExerciseAttempts) AS averageAccuracy;

      SELECT
        CONVERT(varchar(10), CAST(CreatedAt AS date), 120) AS date,
        COUNT(*) AS users
      FROM Users
      WHERE CreatedAt >= DATEADD(day, -30, SYSDATETIMEOFFSET())
      GROUP BY CAST(CreatedAt AS date)
      ORDER BY CAST(CreatedAt AS date);

      SELECT
        FORMAT(CAST(AttemptedAt AS date), 'ddd', 'en-US') AS day,
        COUNT(*) AS attempts,
        SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) AS correct
      FROM ExerciseAttempts
      WHERE AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET())
      GROUP BY CAST(AttemptedAt AS date)
      ORDER BY CAST(AttemptedAt AS date);

      SELECT UserRole AS name, COUNT(*) AS value
      FROM Users
      GROUP BY UserRole
      ORDER BY UserRole;

      SELECT TOP 8
        'ExerciseAttempt' AS type,
        CONCAT(u.FullName, ' answered ', w.Term) AS title,
        CASE WHEN ea.IsCorrect = 1 THEN 'Correct answer' ELSE 'Needs review' END AS detail,
        ea.AttemptedAt AS createdAt,
        CASE WHEN ea.IsCorrect = 1 THEN 'emerald' ELSE 'amber' END AS tone
      FROM ExerciseAttempts ea
      JOIN Users u ON ea.UserID = u.UserID
      JOIN Words w ON ea.WordID = w.WordID
      ORDER BY ea.AttemptedAt DESC;
    `);

    return {
      ...result.recordsets[0][0],
      systemHealth: {
        apiStatus: 'OK',
        databaseStatus: 'Connected',
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds: Math.round(process.uptime())
      },
      userGrowth: result.recordsets[1],
      weeklyActivity: result.recordsets[2],
      userTypes: result.recordsets[3],
      recentActivity: result.recordsets[4]
    };
  }

  static async getStudents(page = 1, limit = 20, filters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const search = String(filters.search ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const role = String(filters.role ?? '').trim();
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(u.FullName LIKE @Search OR u.Email LIKE @Search OR u.UserRole LIKE @Search OR r.RoleName LIKE @Search)');
    }

    if (status === 'active' || status === 'banned') {
      request.input('IsActive', sql.Bit, status === 'active');
      conditions.push('u.IsActive = @IsActive');
    }

    if (role) {
      request.input('RoleName', sql.NVarChar(50), role);
      conditions.push('u.UserRole = @RoleName');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total
      FROM Users u
      LEFT JOIN Roles r ON u.RoleID = r.RoleID
      ${whereClause};

      SELECT u.UserID AS id, u.FullName AS fullName, u.Email AS email, u.UserRole AS role,
             r.RoleName AS roleName, u.IsActive AS isActive, u.CreatedAt AS joinedAt,
             (SELECT COUNT(*) FROM UserWordProgress WHERE UserID = u.UserID AND MasteryLevel >= 8) AS masteredWords,
             (SELECT COUNT(*) FROM UserWordProgress WHERE UserID = u.UserID) AS totalWords,
             (SELECT COUNT(*) FROM ExerciseAttempts WHERE UserID = u.UserID) AS totalAttempts,
             (SELECT MAX(AttemptedAt) FROM ExerciseAttempts WHERE UserID = u.UserID) AS lastActiveAt
      FROM Users u
      LEFT JOIN Roles r ON u.RoleID = r.RoleID
      ${whereClause}
      ORDER BY u.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    return this.paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async createUser(userData) {
    const {
      fullName,
      email,
      password,
      role = 'Learner',
      isActive = true
    } = userData;

    assertValidUserRole(role);

    if (!fullName || !email || !password || password.length < 6) {
      throw new Error('Invalid user data');
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT UserID FROM Users WHERE Email = @Email');

    if (existing.recordset.length > 0) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('PasswordHash', sql.NVarChar(500), passwordHash)
      .input('RoleName', sql.NVarChar(50), role)
      .input('IsActive', sql.Bit, Boolean(isActive))
      .query(`
        DECLARE @RoleID INT;
        SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

        IF @RoleID IS NULL
          THROW 50002, 'Role not found', 1;

        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, RoleID, IsActive, CreatedAt, UpdatedAt)
        OUTPUT inserted.UserID AS id, inserted.FullName AS fullName, inserted.Email AS email, inserted.UserRole AS role, inserted.IsActive AS isActive
        VALUES (@FullName, @Email, @PasswordHash, @RoleName, @RoleID, @IsActive, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
      `);

    return result.recordset[0];
  }

  static async bulkInsertQuestions(input, adminId) {
    const rows = this.parseQuestionImport(input);
    const results = { success: 0, failed: 0, errors: [] };

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const wordId = Number(row.wordId ?? row.WordID ?? row.wordID);
      const questionType = row.questionType ?? row.QuestionType;
      const questionText = row.questionText ?? row.QuestionText;
      const correctAnswer = row.correctAnswer ?? row.CorrectAnswer;
      const optionsJson = row.optionsJson ?? row.OptionsJson ?? '[]';
      const explanation = row.explanation ?? row.Explanation ?? null;

      try {
        if (!wordId || !questionType || !questionText || !correctAnswer) {
          throw new Error('Missing required fields: wordId, questionType, questionText, correctAnswer');
        }

        JSON.parse(optionsJson || '[]');

        await this.createQuestion({
          wordId,
          questionType,
          questionText,
          optionsJson: optionsJson || '[]',
          correctAnswer,
          explanation
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

  static async updateUser(userId, userData) {
    const {
      fullName,
      email,
      password,
      role = 'Learner',
      isActive = true
    } = userData;

    assertValidUserRole(role);

    if (!fullName || !email) {
      throw new Error('Invalid user data');
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT UserID FROM Users WHERE Email = @Email AND UserID <> @UserID');

    if (existing.recordset.length > 0) {
      throw new Error('Email already exists');
    }

    const request = pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('RoleName', sql.NVarChar(50), role)
      .input('IsActive', sql.Bit, Boolean(isActive));

    let passwordUpdate = '';
    if (password) {
      if (password.length < 6) {
        throw new Error('Invalid user data');
      }
      const passwordHash = await bcrypt.hash(password, 10);
      request.input('PasswordHash', sql.NVarChar(500), passwordHash);
      passwordUpdate = ', PasswordHash = @PasswordHash';
    }

    const result = await request.query(`
      DECLARE @RoleID INT;
      SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

      IF @RoleID IS NULL
        THROW 50002, 'Role not found', 1;

      UPDATE Users
      SET FullName = @FullName,
          Email = @Email,
          UserRole = @RoleName,
          RoleID = @RoleID,
          IsActive = @IsActive,
          UpdatedAt = SYSDATETIMEOFFSET()
          ${passwordUpdate}
      WHERE UserID = @UserID;
    `);

    return result.rowsAffected.some((count) => count > 0);
  }

  static async deleteUser(userId) {
    const pool = await poolPromise;
    const dependencies = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM Words WHERE CreatedByUserID = @UserID) AS words,
          (SELECT COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID) AS questions,
          (SELECT COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID) AS miniTests,
          (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID) AS topics
      `);

    const ownedContent = dependencies.recordset[0];
    if (ownedContent.words || ownedContent.questions || ownedContent.miniTests || ownedContent.topics) {
      throw new Error('User owns content');
    }

    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('DELETE FROM Users WHERE UserID = @UserID');

    return result.rowsAffected[0] > 0;
  }

  static async toggleUserStatus(userId) {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('UPDATE Users SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID');
    return true;
  }

  static async updateUserRole(userId, roleName) {
    assertValidUserRole(roleName);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('RoleName', sql.NVarChar(50), roleName)
      .query(`
        DECLARE @RoleID INT;
        SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

        IF @RoleID IS NULL
          THROW 50002, 'Role not found', 1;

        UPDATE Users
        SET UserRole = @RoleName,
            RoleID = @RoleID,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE UserID = @UserID;
      `);

    return result.rowsAffected.some((count) => count > 0);
  }

  static async updateContentStatus({ entityType, entityId, status, comment }, adminId) {
    this.assertContentStatus(status);

    const tableMap = {
      Topic: { table: 'Topics', id: 'TopicID' },
      Word: { table: 'Words', id: 'WordID' },
      Question: { table: 'Questions', id: 'QuestionID' },
      MiniTest: { table: 'MiniTests', id: 'MiniTestID', publishColumn: true }
    };
    const target = tableMap[entityType];
    if (!target) throw new Error('Invalid entity type');

    const pool = await poolPromise;
    const oldStatusResult = await pool.request()
      .input('EntityID', sql.BigInt, entityId)
      .query(`SELECT ContentStatus FROM ${target.table} WHERE ${target.id} = @EntityID`);

    if (oldStatusResult.recordset.length === 0) return false;
    const oldStatus = oldStatusResult.recordset[0].ContentStatus;

    const publishFragment = target.publishColumn
      ? ', IsPublished = CASE WHEN @ContentStatus = N\'Published\' THEN 1 ELSE 0 END'
      : '';

    const result = await pool.request()
      .input('EntityID', sql.BigInt, entityId)
      .input('ContentStatus', sql.NVarChar(30), status)
      .input('ReviewedByUserID', sql.BigInt, adminId)
      .query(`
        UPDATE ${target.table}
        SET ContentStatus = @ContentStatus,
            ReviewedByUserID = @ReviewedByUserID,
            ReviewedAt = SYSDATETIMEOFFSET(),
            PublishedAt = CASE WHEN @ContentStatus = N'Published' THEN SYSDATETIMEOFFSET() ELSE PublishedAt END,
            UpdatedAt = SYSDATETIMEOFFSET()
            ${publishFragment}
        WHERE ${target.id} = @EntityID
      `);

    if (result.rowsAffected[0] > 0) {
      await this.logContentReview(entityType, entityId, oldStatus, status, adminId, comment);
      await this.logAdminAction(adminId, 'UPDATE_CONTENT_STATUS', entityType, entityId, { oldStatus, status, comment });
    }

    return result.rowsAffected[0] > 0;
  }

  static async getAnalyticsData() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        CAST(COALESCE(AVG(CAST(CASE WHEN ea.IsCorrect = 1 THEN 100.0 ELSE 0.0 END AS DECIMAL(5,2))), 0) AS DECIMAL(5,2)) AS averageAccuracy,
        COUNT(ea.ExerciseAttemptID) AS totalAttempts,
        COUNT(DISTINCT ea.UserID) AS activeLearners,
        SUM(CASE WHEN ea.IsCorrect = 0 THEN 1 ELSE 0 END) AS wrongAttempts
      FROM ExerciseAttempts ea;

      SELECT TOP 8
        COALESCE(t.TopicName, 'Uncategorized') AS name,
        COUNT(ea.ExerciseAttemptID) AS attempts,
        CAST(SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.ExerciseAttemptID), 0) AS DECIMAL(5,2)) AS completion
      FROM ExerciseAttempts ea
      JOIN Words w ON ea.WordID = w.WordID
      LEFT JOIN WordTopics wt ON w.WordID = wt.WordID
      LEFT JOIN Topics t ON wt.TopicID = t.TopicID
      GROUP BY COALESCE(t.TopicName, 'Uncategorized')
      ORDER BY COUNT(ea.ExerciseAttemptID) DESC;

      SELECT TOP 8
        CONCAT('Q', q.QuestionID) AS question,
        q.QuestionText AS questionText,
        w.Term AS term,
        COUNT(ea.ExerciseAttemptID) AS attempts,
        CAST(SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.ExerciseAttemptID), 0) AS DECIMAL(5,2)) AS accuracy
      FROM Questions q
      JOIN Words w ON q.WordID = w.WordID
      LEFT JOIN ExerciseAttempts ea ON q.QuestionID = ea.QuestionID
      GROUP BY q.QuestionID, q.QuestionText, w.Term
      ORDER BY accuracy ASC, attempts DESC;

      SELECT
        FORMAT(CAST(AttemptedAt AS date), 'ddd', 'en-US') AS day,
        COUNT(*) AS attempts,
        CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS accuracy
      FROM ExerciseAttempts
      WHERE AttemptedAt >= DATEADD(day, -7, SYSDATETIMEOFFSET())
      GROUP BY CAST(AttemptedAt AS date)
      ORDER BY CAST(AttemptedAt AS date);

      SELECT p.PartOfSpeechName AS name, COUNT(w.WordID) AS value
      FROM PartOfSpeeches p
      LEFT JOIN Words w ON p.PartOfSpeechID = w.PartOfSpeechID
      GROUP BY p.PartOfSpeechName
      ORDER BY p.PartOfSpeechName;

      SELECT TOP 5
        COALESCE(t.TopicName, 'Uncategorized') AS label,
        CAST(SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.ExerciseAttemptID), 0) AS DECIMAL(5,2)) AS accuracy
      FROM ExerciseAttempts ea
      JOIN Words w ON ea.WordID = w.WordID
      LEFT JOIN WordTopics wt ON w.WordID = wt.WordID
      LEFT JOIN Topics t ON wt.TopicID = t.TopicID
      GROUP BY COALESCE(t.TopicName, 'Uncategorized')
      ORDER BY accuracy ASC;
    `);

    return {
      summary: result.recordsets[0][0],
      popularQuizzes: result.recordsets[1],
      questionAccuracy: result.recordsets[2],
      studyActivity: result.recordsets[3],
      wordDistribution: result.recordsets[4],
      difficultTopics: result.recordsets[5]
    };
  }

  static async getContentManagementData() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Topics WHERE ContentStatus = 'Published') +
        (SELECT COUNT(*) FROM Words WHERE ContentStatus = 'Published') +
        (SELECT COUNT(*) FROM Questions WHERE ContentStatus = 'Published') +
        (SELECT COUNT(*) FROM MiniTests WHERE ContentStatus = 'Published') AS publishedItems,
        (SELECT COUNT(*) FROM Words) AS totalWords,
        (SELECT COUNT(*) FROM Questions) AS totalQuestions,
        (SELECT COUNT(*) FROM TopicCategories WHERE IsActive = 1) AS activeCategories,
        (SELECT COUNT(*) FROM Topics WHERE ContentStatus IN ('Draft','PendingReview','Rejected')) +
        (SELECT COUNT(*) FROM Words WHERE ContentStatus IN ('Draft','PendingReview','Rejected')) +
        (SELECT COUNT(*) FROM Questions WHERE ContentStatus IN ('Draft','PendingReview','Rejected')) +
        (SELECT COUNT(*) FROM MiniTests WHERE ContentStatus IN ('Draft','PendingReview','Rejected')) AS reviewItems;

      SELECT TOP 100 *
      FROM (
        SELECT
          CONCAT('TOPIC-', t.TopicID) AS id,
          t.TopicID AS entityId,
          'Topic' AS type,
          t.TopicName AS title,
          COALESCE(tc.CategoryName, 'Uncategorized') AS category,
          t.TopicCode AS code,
          t.ContentStatus AS status,
          COUNT(DISTINCT wt.WordID) AS itemCount,
          0 AS attempts,
          CAST(NULL AS DECIMAL(5,2)) AS accuracy,
          t.UpdatedAt AS updatedAt
        FROM Topics t
        LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID
        LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID
        GROUP BY t.TopicID, t.TopicName, tc.CategoryName, t.TopicCode, t.ContentStatus, t.UpdatedAt

        UNION ALL

        SELECT
          CONCAT('WORD-', w.WordID) AS id,
          w.WordID AS entityId,
          'Word' AS type,
          w.Term AS title,
          COALESCE(p.PartOfSpeechName, 'Vocabulary') AS category,
          CAST(w.DifficultyLevel AS nvarchar(20)) AS code,
          w.ContentStatus AS status,
          COUNT(DISTINCT q.QuestionID) AS itemCount,
          COUNT(DISTINCT ea.ExerciseAttemptID) AS attempts,
          CAST(SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.ExerciseAttemptID), 0) AS DECIMAL(5,2)) AS accuracy,
          w.UpdatedAt AS updatedAt
        FROM Words w
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        LEFT JOIN Questions q ON w.WordID = q.WordID
        LEFT JOIN ExerciseAttempts ea ON w.WordID = ea.WordID
        GROUP BY w.WordID, w.Term, p.PartOfSpeechName, w.DifficultyLevel, w.ContentStatus, w.UpdatedAt

        UNION ALL

        SELECT
          CONCAT('QUESTION-', q.QuestionID) AS id,
          q.QuestionID AS entityId,
          'Question' AS type,
          q.QuestionText AS title,
          q.QuestionType AS category,
          w.Term AS code,
          q.ContentStatus AS status,
          1 AS itemCount,
          COUNT(ea.ExerciseAttemptID) AS attempts,
          CAST(SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.ExerciseAttemptID), 0) AS DECIMAL(5,2)) AS accuracy,
          q.UpdatedAt AS updatedAt
        FROM Questions q
        JOIN Words w ON q.WordID = w.WordID
        LEFT JOIN ExerciseAttempts ea ON q.QuestionID = ea.QuestionID
        GROUP BY q.QuestionID, q.QuestionText, q.QuestionType, w.Term, q.ContentStatus, q.UpdatedAt

        UNION ALL

        SELECT
          CONCAT('MINITEST-', mt.MiniTestID) AS id,
          mt.MiniTestID AS entityId,
          'MiniTest' AS type,
          mt.TestTitle AS title,
          COALESCE(t.TopicName, 'General') AS category,
          CAST(mt.TotalQuestions AS nvarchar(20)) AS code,
          mt.ContentStatus AS status,
          mt.TotalQuestions AS itemCount,
          COUNT(mta.MiniTestAttemptID) AS attempts,
          CAST(AVG(mta.Score) AS DECIMAL(5,2)) AS accuracy,
          mt.UpdatedAt AS updatedAt
        FROM MiniTests mt
        LEFT JOIN Topics t ON mt.TopicID = t.TopicID
        LEFT JOIN MiniTestAttempts mta ON mt.MiniTestID = mta.MiniTestID
        GROUP BY mt.MiniTestID, mt.TestTitle, t.TopicName, mt.TotalQuestions, mt.ContentStatus, mt.UpdatedAt
      ) content
      ORDER BY updatedAt DESC;

      SELECT CategoryName AS name, CategoryCode AS code, DisplayOrder, IsActive
      FROM TopicCategories
      ORDER BY DisplayOrder, CategoryName;

      SELECT TOP 10
        EntityType AS type,
        EntityID AS entityId,
        NewStatus AS status,
        Comment AS reason,
        CreatedAt AS createdAt
      FROM ContentReviewLogs
      ORDER BY CreatedAt DESC;
    `);

    return {
      summary: result.recordsets[0][0],
      content: result.recordsets[1],
      categories: result.recordsets[2],
      reviewLogs: result.recordsets[3]
    };
  }

  static async getNotifications(page = 1, limit = 50, filters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const tableExists = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.Notifications', N'U') AS tableId
    `);

    if (!tableExists.recordset[0].tableId) {
      return this.paginate([], 0, paging.page, paging.limit);
    }

    const search = String(filters.search ?? '').trim();
    const type = String(filters.type ?? '').trim();
    const deliveryChannel = String(filters.deliveryChannel ?? '').trim();
    const isRead = filters.isRead === undefined || filters.isRead === '' ? null : filters.isRead === true || filters.isRead === 'true' || filters.isRead === '1';
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(n.Title LIKE @Search OR n.Message LIKE @Search OR u.FullName LIKE @Search OR u.Email LIKE @Search)');
    }

    if (type) {
      request.input('Type', sql.NVarChar(50), type);
      conditions.push('n.Type = @Type');
    }

    if (deliveryChannel) {
      request.input('DeliveryChannel', sql.NVarChar(20), deliveryChannel);
      conditions.push('n.DeliveryChannel = @DeliveryChannel');
    }

    if (isRead !== null) {
      request.input('IsRead', sql.Bit, isRead);
      conditions.push('n.IsRead = @IsRead');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request
      .query(`
        SELECT COUNT_BIG(1) AS total
        FROM Notifications n
        JOIN Users u ON n.UserID = u.UserID
        ${whereClause};

        SELECT
          n.NotificationID AS id,
          n.UserID AS userId,
          u.FullName AS fullName,
          u.Email AS email,
          n.Title AS title,
          n.Message AS message,
          n.Type AS type,
          n.DeliveryChannel AS deliveryChannel,
          n.IsRead AS isRead,
          n.CreatedAt AS createdAt,
          n.ActionUrl AS actionUrl
        FROM Notifications n
        JOIN Users u ON n.UserID = u.UserID
        ${whereClause}
        ORDER BY n.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);

    return this.paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async getAuditLogs(page = 1, limit = 50, filters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const tableExists = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.AdminAuditLogs', N'U') AS tableId
    `);

    if (!tableExists.recordset[0].tableId) {
      return this.paginate([], 0, paging.page, paging.limit);
    }

    const search = String(filters.search ?? '').trim();
    const action = String(filters.action ?? '').trim();
    const entityType = String(filters.entityType ?? '').trim();
    const adminId = Number(filters.adminId) || null;
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(l.Action LIKE @Search OR l.EntityType LIKE @Search OR l.Details LIKE @Search OR u.FullName LIKE @Search OR u.Email LIKE @Search)');
    }

    if (action) {
      request.input('Action', sql.NVarChar(100), action);
      conditions.push('l.Action = @Action');
    }

    if (entityType) {
      request.input('EntityType', sql.NVarChar(50), entityType);
      conditions.push('l.EntityType = @EntityType');
    }

    if (adminId) {
      request.input('AdminID', sql.BigInt, adminId);
      conditions.push('l.ActionByUserID = @AdminID');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total
      FROM AdminAuditLogs l
      LEFT JOIN Users u ON l.ActionByUserID = u.UserID
      ${whereClause};

      SELECT
        l.AdminAuditLogID AS id,
        l.ActionByUserID AS adminId,
        u.FullName AS adminName,
        u.Email AS adminEmail,
        l.Action AS action,
        l.EntityType AS entityType,
        l.EntityID AS entityId,
        l.Details AS details,
        l.CreatedAt AS createdAt
      FROM AdminAuditLogs l
      LEFT JOIN Users u ON l.ActionByUserID = u.UserID
      ${whereClause}
      ORDER BY l.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

    return this.paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async sendAnnouncement({ audience = 'All users', title, message, deliveryChannel = 'InApp', actionUrl = null }) {
    if (!title || !message) {
      throw new Error('Missing title or message');
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Audience', sql.NVarChar(50), audience)
      .input('Title', sql.NVarChar(200), title)
      .input('Message', sql.NVarChar(2000), message)
      .input('DeliveryChannel', sql.NVarChar(20), deliveryChannel)
      .input('ActionUrl', sql.NVarChar(500), actionUrl)
      .query(`
        IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
          THROW 50020, 'Notifications table is missing. Run migration_alignment_improvements.sql first.', 1;

        INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, ActionUrl)
        SELECT
          UserID,
          @Title,
          @Message,
          'Announcement',
          CASE WHEN @DeliveryChannel = 'Both' THEN 'InApp' ELSE @DeliveryChannel END,
          @ActionUrl
        FROM Users
        WHERE IsActive = 1
          AND (
            @Audience = 'All users'
            OR (@Audience = 'Learners' AND UserRole = 'Learner')
            OR (@Audience = 'Admins' AND UserRole = 'Admin')
          );

        SELECT @@ROWCOUNT AS inserted;
      `);

    return { inserted: result.recordset[0].inserted };
  }

  static async createDailyReminders() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
        THROW 50020, 'Notifications table is missing. Run migration_alignment_improvements.sql first.', 1;

      INSERT INTO Notifications (UserID, Title, Message, Type, DeliveryChannel, ActionUrl)
      SELECT
        u.UserID,
        N'Time to study!',
        CONCAT(N'You have ', due.DueWords, N' words waiting for review today.'),
        'DailyReminder',
        'InApp',
        '/user/learn'
      FROM Users u
      CROSS APPLY
      (
        SELECT COUNT(*) AS DueWords
        FROM UserWordProgress uwp
        WHERE uwp.UserID = u.UserID
          AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET())
      ) due
      WHERE u.IsActive = 1
        AND u.UserRole = 'Learner'
        AND due.DueWords > 0
        AND NOT EXISTS
        (
          SELECT 1
          FROM Notifications n
          WHERE n.UserID = u.UserID
            AND n.Type = 'DailyReminder'
            AND CAST(n.CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
        );

      SELECT @@ROWCOUNT AS inserted;
    `);

    return { inserted: result.recordset[0].inserted };
  }

  // ── TopicCategories CRUD (Admin only) ──
  static async getTopicCategories() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TopicCategoryID AS id, CategoryName AS name, CategoryCode AS code,
             Description AS description, IconUrl AS iconUrl, DisplayOrder AS displayOrder,
             IsActive AS isActive
      FROM TopicCategories
      ORDER BY DisplayOrder, CategoryName
    `);
    return result.recordset;
  }

  static async createTopicCategory(data) {
    const { categoryName, categoryCode, description, iconUrl, displayOrder, isActive } = data;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CategoryName', sql.NVarChar(200), categoryName)
      .input('CategoryCode', sql.NVarChar(50), categoryCode)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('IconUrl', sql.NVarChar(500), iconUrl || null)
      .input('DisplayOrder', sql.Int, displayOrder || 0)
      .input('IsActive', sql.Bit, isActive !== false)
      .query(`
        INSERT INTO TopicCategories (CategoryName, CategoryCode, Description, IconUrl, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
        OUTPUT inserted.TopicCategoryID AS id
        VALUES (@CategoryName, @CategoryCode, @Description, @IconUrl, @DisplayOrder, @IsActive, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);
    return result.recordset[0];
  }

  static async updateTopicCategory(id, data) {
    const { categoryName, categoryCode, description, iconUrl, displayOrder, isActive } = data;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ID', sql.BigInt, id)
      .input('CategoryName', sql.NVarChar(200), categoryName)
      .input('CategoryCode', sql.NVarChar(50), categoryCode)
      .input('Description', sql.NVarChar(1000), description || null)
      .input('IconUrl', sql.NVarChar(500), iconUrl || null)
      .input('DisplayOrder', sql.Int, displayOrder || 0)
      .input('IsActive', sql.Bit, isActive !== false)
      .query(`
        UPDATE TopicCategories
        SET CategoryName=@CategoryName, CategoryCode=@CategoryCode, Description=@Description,
            IconUrl=@IconUrl, DisplayOrder=@DisplayOrder, IsActive=@IsActive, UpdatedAt=SYSDATETIMEOFFSET()
        WHERE TopicCategoryID=@ID
      `);
    return result.rowsAffected[0] > 0;
  }

  static async deleteTopicCategory(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ID', sql.BigInt, id)
      .query('DELETE FROM TopicCategories WHERE TopicCategoryID=@ID');
    return result.rowsAffected[0] > 0;
  }
}

module.exports = AdminService;
