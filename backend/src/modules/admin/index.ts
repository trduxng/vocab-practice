const express = require('express');

const { verifyToken } = require('../../middlewares/auth.js');
const auditRoutes = require('./routes/audit.routes.ts');
const contentReviewRoutes = require('./routes/content-review.routes.ts');
const contentStatusRoutes = require('./routes/content-status.routes.ts');
const dashboardRoutes = require('./routes/dashboard.routes.ts');
const miniTestRoutes = require('./routes/mini-tests.routes.ts');
const notificationRoutes = require('./routes/notifications.routes.ts');
const questionRoutes = require('./routes/questions.routes.ts');
const reportRoutes = require('./routes/reports.routes.ts');
const topicRoutes = require('./routes/topics.routes.ts');
const userRoutes = require('./routes/users.routes.ts');
const wordRoutes = require('./routes/words.routes.ts');

const router = express.Router();

router.use(verifyToken);

router.use(topicRoutes);
router.use(wordRoutes);
router.use(questionRoutes);
router.use(miniTestRoutes);
router.use(dashboardRoutes);
router.use(userRoutes);
router.use(contentStatusRoutes);
router.use(auditRoutes);
router.use(reportRoutes);
router.use(notificationRoutes);
router.use('/content-review', contentReviewRoutes);

module.exports = router;
