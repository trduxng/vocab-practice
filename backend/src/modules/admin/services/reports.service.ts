import type { ReportFilters, ReportUpdatePayload } from '../admin.types.ts';
const { AdminShared } = require('../shared/admin.shared.ts');
const LearnerReportService = require('../../learner/report.service.js');

class ReportService extends AdminShared {
  static async getReports(page = 1, limit = 20, filters: ReportFilters = {}) {
    return LearnerReportService.getReports(page, limit, filters);
  }

  static async updateReport(reportId, data: ReportUpdatePayload, adminId) {
    return LearnerReportService.updateReport(reportId, data, adminId);
  }
}

module.exports = ReportService;
