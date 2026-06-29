/**
 * Server Entry Point
 * Bootstraps the database connection and starts the HTTP listener.
 * Application setup lives in src/app.js.
 */

import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import createApp from './src/app.js';
import logger from './src/utils/logger.js';

// Validate all required environment variables before anything else
try {
  validateEnv();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Create the Express application
    const app = createApp();

    // 3. Start the HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      logger.info(`  CodingNinja API Server — ${NODE_ENV.toUpperCase()}`);
      logger.info(`  Listening on: http://localhost:${PORT}`);
      logger.info(`  Health check: http://localhost:${PORT}/api/health`);
      logger.info(`  API index:    http://localhost:${PORT}/api`);
      logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    });

    // 4. Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      logger.warn(`[SERVER] ${signal} received. Initiating graceful shutdown...`);
      server.close(() => {
        logger.info('[SERVER] HTTP server closed.');
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('[SERVER] Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 5. Handle uncaught exceptions — log and exit cleanly
    process.on('uncaughtException', (err) => {
      logger.error('[SERVER] Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error(`[SERVER] Unhandled Rejection: ${reason}`);
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error(`[SERVER] Bootstrap failed: ${error.message}`, error);
    process.exit(1);
  }
};

startServer();
