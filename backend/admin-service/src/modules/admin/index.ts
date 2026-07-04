import express from 'express';

import { verifyToken } from '../../middlewares/auth.ts';
import auditRoutes from './routes/audit.routes.ts';
import contentReviewRoutes from './routes/content-review.routes.ts';
import contentStatusRoutes from './routes/content-status.routes.ts';
import dashboardRoutes from './routes/dashboard.routes.ts';
import miniTestRoutes from './routes/mini-tests.routes.ts';
import notificationRoutes from './routes/notifications.routes.ts';
import questionRoutes from './routes/questions.routes.ts';
import reportRoutes from './routes/reports.routes.ts';
import topicRoutes from './routes/topics.routes.ts';
import userRoutes from './routes/users.routes.ts';
import wordRoutes from './routes/words.routes.ts';

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

export default router;
