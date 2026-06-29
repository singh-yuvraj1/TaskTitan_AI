/**
 * Express Application Factory
 * Sets up all middleware, routes, and error handlers.
 * Kept separate from server.js so the app can be tested independently.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { getConnectionStatus } from './config/db.js';
import apiRouter from './routes/api.js';
import { notFound, errorHandler } from '../middleware/errorMiddleware.js';
import logger from './utils/logger.js';
import env from './config/env.js';

const createApp = () => {
  const app = express();

  // ─── Security Middleware ───────────────────────────────────────────────────
  app.use(helmet({
    crossOriginEmbedderPolicy: false,  // Needed for Gemini embed previews
    contentSecurityPolicy: false,      // Handled separately if needed
  }));

  // ─── CORS Configuration ───────────────────────────────────────────────────
  const corsOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  app.use(cors({
    origin: corsOrigins,
    credentials: true,                // Allow cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // ─── Body Parsing & Cookies ────────────────────────────────────────────────
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // ─── Request Logging ──────────────────────────────────────────────────────
  // Use morgan in development for detailed logs; combined in production for log aggregation
  if (env.IS_DEVELOPMENT) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      // Skip health check endpoint from logs to reduce noise
      skip: (req) => req.url === '/api/health'
    }));
  }

  // ─── Rate Limiter ─────────────────────────────────────────────────────────
  const apiLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
      data: null,
      errors: [{ message: 'Rate limit exceeded.' }]
    },
    handler: (req, res, next, options) => {
      logger.warn(`[RATE LIMIT] IP ${req.ip} exceeded rate limit on ${req.path}`);
      res.status(options.statusCode).json(options.message);
    }
  });

  // Apply rate limiting to all API routes except health check
  app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    return apiLimiter(req, res, next);
  });

  // ─── Health Check Endpoint ─────────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    const dbStatus = getConnectionStatus();
    const isDbConnected = dbStatus.isConnected && dbStatus.readyState === 1;

    const healthData = {
      status: isDbConnected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      database: {
        connected: isDbConnected,
        host: dbStatus.host || 'unknown',
        name: dbStatus.name || 'unknown',
      },
      checks: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        JWT_SECRET: !!process.env.JWT_SECRET,
        GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      }
    };

    const statusCode = isDbConnected ? 200 : 503;
    res.status(statusCode).json({
      success: isDbConnected,
      message: isDbConnected
        ? 'All systems operational.'
        : 'Server is up but database connection is degraded.',
      data: healthData,
      errors: null
    });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ─── Error Handling ───────────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
