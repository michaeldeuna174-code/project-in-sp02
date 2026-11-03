const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const { checkConnection } = require('./config/database');

const app = express();

// Allowed frontend origins for CORS.
const configuredOrigins = [
  process.env.FRONTEND_URL,
  'https://cybersafeawareness.netlify.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5500',
  'http://localhost:8080',
  'http://localhost:8765',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8765'
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

const allowedOrigins = new Set(configuredOrigins);

function isLocalDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  try {
    const url = new URL(origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    return (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '::1'
    );
  } catch (err) {
    return false;
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, server-to-server) and file:// (null).
    if (!origin || origin === 'null') {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.has(normalizedOrigin) || isLocalDevelopmentOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error('Cross-Origin Request Blocked by CyberSafe CORS policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Endpoint
// Reports the real backend and database status. A database failure is never
// reported as a successful connection.
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkConnection();
  const databaseOk = Boolean(dbStatus.ok);

  res.status(databaseOk ? 200 : 503).json({
    status: databaseOk ? 'ok' : 'degraded',
    backend: {
      status: 'running',
      port: Number(process.env.PORT) || 5000
    },
    service: 'CyberSafe Backend REST API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api', quizRoutes);

// Serve the existing frontend when the backend is started from the project.
// This makes http://localhost:5000/index.html use the same-origin /api route.
//
// Only these exact frontend files are exposed. Serving the whole project
// folder with express.static would also expose backend/.env, which contains
// the Supabase service role key. Never do that.
const frontendPath = path.resolve(__dirname, '../../');
const frontendFiles = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/script.js': 'script.js',
  '/style.css': 'style.css'
};

for (const [routePath, fileName] of Object.entries(frontendFiles)) {
  app.get(routePath, (req, res, next) => {
    res.sendFile(path.join(frontendPath, fileName), (err) => {
      if (err) next(err);
    });
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
