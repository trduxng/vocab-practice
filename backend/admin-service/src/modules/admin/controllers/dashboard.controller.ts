import DashboardService from '../services/dashboard.service.ts';

class DashboardController {
  static async getStats(req, res, next) {
    try {
      const stats = await DashboardService.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const data = await DashboardService.getAnalyticsData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getContentManagement(req, res, next) {
    try {
      const data = await DashboardService.getContentManagementData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
