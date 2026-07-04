const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const errorHandler = require('./middlewares/errorHandler');
const { poolPromise } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const categoriesRoutes = require('./routes/categories.routes');
const userRoutes = require('./routes/user.routes');
const progressRoutes = require('./routes/progress.routes');
const creatorRoutes = require('./routes/creator.routes');
const aiRoutes = require('./routes/ai.routes');
const internalReportRoutes = require('./routes/internal-report.routes');

const app = express();
const port = process.env.PORT || 3001;
const adminServiceUrl = (process.env.ADMIN_SERVICE_URL || 'http://localhost:3003').replace(/\/+$/, '');

// Global Error Handlers to prevent crash
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: true, 
  credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const proxyAdminRequest = async (req, res) => {
  try {
    const targetUrl = `${adminServiceUrl}${req.originalUrl}`;
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      duplex: ['GET', 'HEAD'].includes(req.method) ? undefined : 'half',
      redirect: 'manual'
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    console.error('Admin service proxy failed:', error.message);
    res.status(502).json({
      message: 'Admin service unavailable',
      target: adminServiceUrl
    });
  }
};

app.use('/api/admin', proxyAdminRequest);
app.use(express.json());

// Routes
app.get('/api/health', async (req, res) => {
  const status = {
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
  } catch (e) {
    status.db = 'Disconnected';
    status.error = e.message;
    res.status(500).json(status);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/internal', internalReportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/ai', aiRoutes);

// Error Handler Middleware
app.use(errorHandler);

console.log('Attempting to start server...');
app.listen(port, () => {
  console.log(`Server successfully started on port ${port}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    const pool = await poolPromise;
    await pool.close();
    console.log('Database pool closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
