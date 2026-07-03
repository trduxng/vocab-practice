import ReportClient from '../../../integrations/report.client.ts';
import type { ReportFilters, ReportUpdatePayload } from '../admin.types.ts';
import { AdminShared } from '../shared/admin.shared.ts';

class ReportService extends AdminShared {
  static async getReports(page = 1, limit = 20, filters: ReportFilters = {}) {
    return ReportClient.getReports(page, limit, filters);
  }

  static async updateReport(reportId, data: ReportUpdatePayload, adminId) {
    return ReportClient.updateReport(reportId, data, adminId);
  }
}

export default ReportService;
