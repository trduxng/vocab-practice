const AuditService = require('../services/audit.service');

class AuditController {
  static async getAuditLogs(req, res, next) { try { res.json(await AuditService.getAuditLogs(parseInt(req.query.page) || 1, parseInt(req.query.limit) || 50, req.query)); } catch (e) { next(e); } }
}

module.exports = AuditController;