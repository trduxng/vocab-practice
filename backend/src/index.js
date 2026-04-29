const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');
const { poolPromise } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

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
