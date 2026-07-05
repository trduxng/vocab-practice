const { poolPromise, sql } = require('../../config/db');

const REPORT_TYPES = ['WordIncorrect', 'AudioIssue', 'AnswerIncorrect', 'Typo', 'Other'];
const ENTITY_TYPES = ['Word', 'Question', 'Audio', 'General'];
const REPORT_STATUSES = ['Open', 'InReview', 'Resolved', 'Rejected'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];

class ReportService {
  static normalizePagination(page = 1, limit = 20, maxLimit = 100) {
    const normalizedPage = Math.max(parseInt(page, 10) || 1, 1);
    const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), maxLimit);
    return { page: normalizedPage, limit: normalizedLimit, offset: (normalizedPage - 1) * normalizedLimit };
  }

  static paginate(items, total, page, limit) {
    const normalizedTotal = Number(total) || 0;
    return { items, pagination: { page, limit, total: normalizedTotal, totalPages: Math.max(1, Math.ceil(normalizedTotal / limit)) } };
  }

  static async ensureSchema() {
    const pool = await poolPromise;
    await pool.request().query(`
      IF OBJECT_ID(N'dbo.ContentReports', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.ContentReports (
          ContentReportID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ContentReports PRIMARY KEY,
          ReporterUserID BIGINT NOT NULL, EntityType NVARCHAR(30) NOT NULL,
          WordID BIGINT NULL, QuestionID BIGINT NULL,
          ReportType NVARCHAR(50) NOT NULL, Title NVARCHAR(200) NOT NULL,
          Description NVARCHAR(2000) NOT NULL, Status NVARCHAR(30) NOT NULL CONSTRAINT DF_ContentReports_Status DEFAULT (N'Open'),
          Priority NVARCHAR(20) NOT NULL CONSTRAINT DF_ContentReports_Priority DEFAULT (N'Normal'),
          AdminResponse NVARCHAR(2000) NULL, ResolvedByUserID BIGINT NULL,
          ResolvedAt DATETIMEOFFSET(7) NULL,
          CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ContentReports_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
          UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ContentReports_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
          CONSTRAINT FK_ContentReports_ReporterUserID FOREIGN KEY (ReporterUserID) REFERENCES dbo.Users(UserID),
          CONSTRAINT FK_ContentReports_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID),
          CONSTRAINT FK_ContentReports_QuestionID FOREIGN KEY (QuestionID) REFERENCES dbo.Questions(QuestionID),
          CONSTRAINT FK_ContentReports_ResolvedByUserID FOREIGN KEY (ResolvedByUserID) REFERENCES dbo.Users(UserID),
          CONSTRAINT CK_ContentReports_EntityType CHECK (EntityType IN (N'Word', N'Question', N'Audio', N'General')),
          CONSTRAINT CK_ContentReports_ReportType CHECK (ReportType IN (N'WordIncorrect', N'AudioIssue', N'AnswerIncorrect', N'Typo', N'Other')),
          CONSTRAINT CK_ContentReports_Status CHECK (Status IN (N'Open', N'InReview', N'Resolved', N'Rejected')),
          CONSTRAINT CK_ContentReports_Priority CHECK (Priority IN (N'Low', N'Normal', N'High', N'Urgent'))
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_Status_CreatedAt' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
        CREATE INDEX IX_ContentReports_Status_CreatedAt ON dbo.ContentReports(Status, CreatedAt DESC);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_ReportType' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
        CREATE INDEX IX_ContentReports_ReportType ON dbo.ContentReports(ReportType);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_ReporterUserID' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
        CREATE INDEX IX_ContentReports_ReporterUserID ON dbo.ContentReports(ReporterUserID, CreatedAt DESC);
    `);
  }

  static assertOneOf(value, allowed, fieldName) {
    if (!allowed.includes(value)) throw new Error(`Invalid ${fieldName}`);
  }

  static inferEntityType({ entityType, questionId, wordId, reportType }) {
    if (entityType) return entityType;
    if (reportType === 'AudioIssue') return 'Audio';
    if (questionId) return 'Question';
    if (wordId) return 'Word';
    return 'General';
  }

  static async createReport(userId, reportData) {
    await this.ensureSchema();
    const reportType = String(reportData?.reportType || '').trim();
    const entityType = this.inferEntityType({ entityType: String(reportData?.entityType || '').trim(), questionId: reportData?.questionId, wordId: reportData?.wordId, reportType });
    const wordId = Number(reportData?.wordId) || null;
    const questionId = Number(reportData?.questionId) || null;
    const title = String(reportData?.title || reportType).trim().slice(0, 200);
    const description = String(reportData?.description || '').trim().slice(0, 2000);

    this.assertOneOf(reportType, REPORT_TYPES, 'report type');
    this.assertOneOf(entityType, ENTITY_TYPES, 'entity type');
    if (!description || description.length < 5) throw new Error('Report description is too short');

    const pool = await poolPromise;
    const result = await pool.request()
      .input('ReporterUserID', sql.BigInt, userId).input('EntityType', sql.NVarChar(30), entityType)
      .input('WordID', sql.BigInt, wordId).input('QuestionID', sql.BigInt, questionId)
      .input('ReportType', sql.NVarChar(50), reportType).input('Title', sql.NVarChar(200), title || 'Content report')
      .input('Description', sql.NVarChar(2000), description)
      .query(`INSERT INTO ContentReports (ReporterUserID, EntityType, WordID, QuestionID, ReportType, Title, Description)
              OUTPUT inserted.ContentReportID AS id
              VALUES (@ReporterUserID, @EntityType, @WordID, @QuestionID, @ReportType, @Title, @Description)`);
    return result.recordset[0];
  }

  static async getReports(page = 1, limit = 20, filters = {}) {
    await this.ensureSchema();
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const search = String(filters.search ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const reportType = String(filters.reportType ?? '').trim();
    const entityType = String(filters.entityType ?? '').trim();
    const priority = String(filters.priority ?? '').trim();
    const conditions = [];
    const request = pool.request().input('Offset', sql.Int, paging.offset).input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push(`(cr.Title LIKE @Search OR cr.Description LIKE @Search OR cr.AdminResponse LIKE @Search OR reporter.FullName LIKE @Search OR reporter.Email LIKE @Search OR w.Term LIKE @Search OR q.QuestionText LIKE @Search)`);
    }
    if (status) { this.assertOneOf(status, REPORT_STATUSES, 'report status'); request.input('Status', sql.NVarChar(30), status); conditions.push('cr.Status = @Status'); }
    if (reportType) { this.assertOneOf(reportType, REPORT_TYPES, 'report type'); request.input('ReportType', sql.NVarChar(50), reportType); conditions.push('cr.ReportType = @ReportType'); }
    if (entityType) { this.assertOneOf(entityType, ENTITY_TYPES, 'entity type'); request.input('EntityType', sql.NVarChar(30), entityType); conditions.push('cr.EntityType = @EntityType'); }
    if (priority) { this.assertOneOf(priority, PRIORITIES, 'priority'); request.input('Priority', sql.NVarChar(20), priority); conditions.push('cr.Priority = @Priority'); }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total FROM ContentReports cr JOIN Users reporter ON cr.ReporterUserID = reporter.UserID
      LEFT JOIN Words w ON cr.WordID = w.WordID LEFT JOIN Questions q ON cr.QuestionID = q.QuestionID ${whereClause};
      SELECT cr.ContentReportID AS id, cr.ReporterUserID AS reporterUserId, reporter.FullName AS reporterName, reporter.Email AS reporterEmail,
        cr.EntityType AS entityType, cr.WordID AS wordId, w.Term AS wordTerm, w.Meaning AS wordMeaning,
        cr.QuestionID AS questionId, q.QuestionText AS questionText, q.CorrectAnswer AS correctAnswer,
        cr.ReportType AS reportType, cr.Title AS title, cr.Description AS description, cr.Status AS status,
        cr.Priority AS priority, cr.AdminResponse AS adminResponse, cr.ResolvedByUserID AS resolvedByUserId,
        resolver.FullName AS resolvedByName, cr.ResolvedAt AS resolvedAt, cr.CreatedAt AS createdAt, cr.UpdatedAt AS updatedAt
      FROM ContentReports cr JOIN Users reporter ON cr.ReporterUserID = reporter.UserID
      LEFT JOIN Users resolver ON cr.ResolvedByUserID = resolver.UserID
      LEFT JOIN Words w ON cr.WordID = w.WordID LEFT JOIN Questions q ON cr.QuestionID = q.QuestionID
      ${whereClause}
      ORDER BY CASE cr.Status WHEN 'Open' THEN 0 WHEN 'InReview' THEN 1 WHEN 'Resolved' THEN 2 ELSE 3 END, cr.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;
    `);
    return this.paginate(result.recordsets[1] || [], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async updateReport(reportId, data, adminId) {
    await this.ensureSchema();
    const status = String(data?.status || '').trim();
    const priority = String(data?.priority || '').trim();
    const adminResponse = data?.adminResponse === undefined ? undefined : String(data.adminResponse || '').trim().slice(0, 2000);

    if (status) this.assertOneOf(status, REPORT_STATUSES, 'report status');
    if (priority) this.assertOneOf(priority, PRIORITIES, 'priority');

    const pool = await poolPromise;
    const oldResult = await pool.request().input('ContentReportID', sql.BigInt, reportId)
      .query('SELECT Status, Priority FROM ContentReports WHERE ContentReportID = @ContentReportID');
    if (oldResult.recordset.length === 0) return false;

    const result = await pool.request()
      .input('ContentReportID', sql.BigInt, reportId).input('Status', sql.NVarChar(30), status || null)
      .input('Priority', sql.NVarChar(20), priority || null)
      .input('AdminResponse', sql.NVarChar(2000), adminResponse === undefined ? null : adminResponse)
      .input('ShouldUpdateResponse', sql.Bit, adminResponse !== undefined).input('AdminID', sql.BigInt, adminId)
      .query(`UPDATE ContentReports SET Status = COALESCE(@Status, Status), Priority = COALESCE(@Priority, Priority),
              AdminResponse = CASE WHEN @ShouldUpdateResponse = 1 THEN @AdminResponse ELSE AdminResponse END,
              ResolvedByUserID = CASE WHEN @Status IN (N'Resolved', N'Rejected') THEN @AdminID ELSE ResolvedByUserID END,
              ResolvedAt = CASE WHEN @Status IN (N'Resolved', N'Rejected') THEN SYSDATETIMEOFFSET() ELSE ResolvedAt END,
              UpdatedAt = SYSDATETIMEOFFSET() WHERE ContentReportID = @ContentReportID`);
    return result.rowsAffected[0] > 0;
  }
}

module.exports = ReportService;
