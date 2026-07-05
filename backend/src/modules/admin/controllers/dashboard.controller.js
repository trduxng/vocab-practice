const DashboardService = require('../services/dashboard.service');

class DashboardController {
  static async getStats(req, res, next) { try { res.json(await DashboardService.getDashboardStats()); } catch (e) { next(e); } }
  static async getAnalytics(req, res, next) { try { res.json(await DashboardService.getAnalyticsData()); } catch (e) { next(e); } }
  static async getContentManagement(req, res, next) { try { res.json(await DashboardService.getContentManagementData()); } catch (e) { next(e); } }
}

module.exports = DashboardController;