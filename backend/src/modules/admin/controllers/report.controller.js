const ReportService = require('../../learner/report.service');

class ReportController {
  static async getReports(req, res, next) { try { res.json(await ReportService.getReports(parseInt(req.query.page) || 1, parseInt(req.query.limit) || 20, req.query)); } catch (e) { next(e); } }
  static async updateReport(req, res, next) { try { const ok = await ReportService.updateReport(req.params.id, req.body, req.user.id); res.json({ message: ok ? 'Report updated' : 'Not found' }); } catch (e) { next(e); } }
}

module.exports = ReportController;