const express = require('express');
const ReportService = require('../services/report.service');

const router = express.Router();

const getExpectedInternalToken = () => {
  return process.env.INTERNAL_SERVICE_TOKEN || (process.env.NODE_ENV !== 'production' ? 'dev-internal-token' : '');
};

const verifyInternalRequest = (req, res, next) => {
  const expectedToken = getExpectedInternalToken();
  const providedToken = req.headers['x-internal-service-token'];

  if (!expectedToken || providedToken !== expectedToken) {
    return res.status(401).json({ message: 'Invalid internal service token' });
  }

  next();
};

router.use(verifyInternalRequest);

router.get('/reports', async (req, res, next) => {
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
});

router.patch('/reports/:id', async (req, res, next) => {
  try {
    const adminId = Number(req.headers['x-admin-user-id']);
    if (!adminId) {
      return res.status(400).json({ message: 'Missing admin user id' });
    }

    const success = await ReportService.updateReport(req.params.id, req.body, adminId);
    if (!success) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
