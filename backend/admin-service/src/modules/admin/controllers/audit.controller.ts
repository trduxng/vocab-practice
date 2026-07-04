import AuditService from '../services/audit.service.ts';

class AuditController {
  static async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const data = await AuditService.getAuditLogs(page, limit, {
        search: req.query.search,
        action: req.query.action,
        entityType: req.query.entityType,
        adminId: req.query.adminId
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default AuditController;
