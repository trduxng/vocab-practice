const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

app.get('/health', async (req, res) => {
  try {
    const pool = await poolPromise;
    res.status(200).json({ status: 'OK', db: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', db: 'Disconnected' });
  }
});

// Error Handler Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
