const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const errorHandler = require('./middlewares/errorHandler');
const { poolPromise } = require('./config/db');
const GamificationService = require('./services/gamification.service');

// Go server config
const GO_PORT = process.env.GO_PORT || '3002';
const GO_SERVER_PATH = path.join(__dirname, '..', 'user-go', 'server');

// Import routes
const authRoutes = require('./routes/auth.routes');
const categoriesRoutes = require('./routes/categories.routes');
const adminRoutes = require('./routes/admin.routes');

const creatorRoutes = require('./routes/creator.routes');
const reviewRoutes = require('./routes/review.routes');
const aiRoutes = require('./routes/ai.routes');

// ========== Auto-spawn Go user service ==========
let goProcess = null;

function startGoService() {
  const fs = require('fs');
  if (!fs.existsSync(GO_SERVER_PATH)) {
    console.log('[Go] Binary not found at', GO_SERVER_PATH);
    console.log('[Go] Run "cd user-go && go build -o server ./cmd/server" first');
    return;
  }

  const goEnv = {
    ...process.env,
    PORT: GO_PORT,
    GO_PORT: GO_PORT,
  };

  goProcess = spawn(GO_SERVER_PATH, [], {
    env: goEnv,
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  goProcess.on('error', (err) => {
    console.error('[Go] Failed to start:', err.message);
    goProcess = null;
  });

  goProcess.on('exit', (code) => {
    console.log(`[Go] Process exited with code ${code}`);
    goProcess = null;
  });

  console.log(`[Go] User service starting on port ${GO_PORT}...`);
}

function stopGoService() {
  if (goProcess) {
    console.log('[Go] Stopping user service...');
    goProcess.kill('SIGTERM');
    goProcess = null;
  }
}

startGoService();

const app = express();
const port = process.env.PORT || 3001;

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
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
app.use('/api/admin/content-review', reviewRoutes);
app.use('/api/admin', adminRoutes);
// User routes → proxy to Go service (required — no JS fallback)
app.use('/api/user', (req, res, next) => {
  if (goProcess) {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: parseInt(GO_PORT),
      path: '/api/user' + req.url.replace(/^\/api\/user/, '') || '/',
      method: req.method,
      headers: { ...req.headers, host: 'localhost:' + GO_PORT },
    };
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on('error', () => {
      console.error('[Go] Proxy error — user service unreachable');
      res.status(503).json({ message: 'User service unavailable' });
    });
    if (req.body && Object.keys(req.body).length) {
      proxyReq.write(JSON.stringify(req.body));
    }
    proxyReq.end();
  } else {
    console.error('[Go] User service not running');
    res.status(503).json({ message: 'User service unavailable' });
  }
});
app.use('/api/creator', creatorRoutes);
app.use('/api/ai', aiRoutes);

// Error Handler Middleware
app.use(errorHandler);

console.log('Attempting to start server...');
app.listen(port, () => {
  console.log(`Server successfully started on port ${port}`);
  // Seed achievements (idempotent — MERGE)
  GamificationService.seedAchievements()
    .then(() => console.log('[Init] Achievements seeded'))
    .catch(err => console.error('[Init] Failed to seed achievements:', err.message));
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  stopGoService();
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
