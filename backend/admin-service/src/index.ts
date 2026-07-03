import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { poolPromise } from './config/db.ts';
import errorHandler from './middlewares/error-handler.ts';
import adminRoutes from './modules/admin/index.ts';

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in admin-service/.env');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3003;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Admin service unhandled rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Admin service uncaught exception thrown:', err);
});

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[admin-service ${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/health', async (req, res) => {
  const status: {
    service: string;
    uptime: number;
    message: string;
    timestamp: number;
    db: string;
    error?: string;
  } = {
    service: 'admin-service',
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    db: 'Checking...'
  };

  try {
    const pool = await poolPromise;
    await pool.request().query('SELECT 1');
    status.db = 'Connected';
    res.status(200).json(status);
  } catch (error) {
    status.db = 'Disconnected';
    status.error = error.message;
    res.status(500).json(status);
  }
});

app.use('/api/admin', adminRoutes);

app.use(errorHandler);

console.log('Attempting to start admin service...');
app.listen(port, () => {
  console.log(`Admin service successfully started on port ${port}`);
});

const gracefulShutdown = async (signal) => {
  console.log(`Admin service received ${signal}. Shutting down gracefully...`);
  try {
    const pool = await poolPromise;
    await pool.close();
    console.log('Admin service database pool closed.');
    process.exit(0);
  } catch (err) {
    console.error('Admin service shutdown error:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
