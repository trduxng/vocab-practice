import ReportService from '../services/reports.service.ts';

class ReportsController {
  static async getReports(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const data = await ReportService.getReports(page, limit, {
        search: req.query.search,
        status: req.query.status,
        reportType: req.query.reportType,
        entityType: req.query.entityType,
        priority: req.query.priority
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async updateReport(req, res, next) {
    try {
      const success = await ReportService.updateReport(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.status(200).json({ message: 'Report updated' });
    } catch (error) {
      if (error.message.startsWith('Invalid ')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}

export default ReportsController;
