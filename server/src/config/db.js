/**
 * MongoDB Connection Manager
 * Handles connection to MongoDB Atlas with retry logic and event listeners.
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const DB_OPTIONS = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
};

// Track connection state to avoid duplicate connections
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    logger.info('[DB] Already connected to MongoDB. Skipping reconnect.');
    return true;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codingninja';

  try {
    const conn = await mongoose.connect(uri, DB_OPTIONS);
    isConnected = true;

    logger.info(`[DB] MongoDB connected: ${conn.connection.host}`);
    logger.info(`[DB] Database name: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('[DB] MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      logger.info('[DB] MongoDB reconnected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`[DB] MongoDB connection error: ${err.message}`);
      isConnected = false;
    });

    return true;
  } catch (error) {
    logger.error(`[DB] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('[DB] MongoDB disconnected cleanly.');
};

export const getConnectionStatus = () => ({
  isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});

export default { connectDB, disconnectDB, getConnectionStatus };
