/**
 * Structured Logger Utility
 * Provides consistent, prefixed logging across all server modules.
 * In production, debug logs are suppressed.
 * Replaces raw console.log calls to avoid log spam.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';

// Suppress all logs during testing
const shouldLog = !IS_TEST;

const timestamp = () => new Date().toISOString();

const formatMessage = (level, message) =>
  `[${timestamp()}] [${level.toUpperCase()}] ${message}`;

const logger = {
  /**
   * General informational log — always shown in dev, shown in prod.
   */
  info: (message) => {
    if (shouldLog) console.log(formatMessage('INFO', message));
  },

  /**
   * Warning log — always shown. Used for non-critical issues.
   */
  warn: (message) => {
    if (shouldLog) console.warn(formatMessage('WARN', message));
  },

  /**
   * Error log — always shown. Used for failures.
   */
  error: (message, err = null) => {
    if (shouldLog) {
      console.error(formatMessage('ERROR', message));
      if (err && !IS_PRODUCTION) {
        console.error(err.stack || err);
      }
    }
  },

  /**
   * Debug log — only shown in development mode.
   * Use for verbose request tracing.
   */
  debug: (message) => {
    if (shouldLog && !IS_PRODUCTION) {
      console.log(formatMessage('DEBUG', message));
    }
  },

  /**
   * HTTP request log — brief summary of incoming requests.
   * Replaces morgan in controller-level logging needs.
   */
  http: (req) => {
    if (shouldLog && !IS_PRODUCTION) {
      logger.debug(`${req.method} ${req.originalUrl}`);
    }
  },

  /**
   * Database operation log.
   */
  db: (message) => {
    if (shouldLog) console.log(formatMessage('DB', message));
  },

  /**
   * AI service log — for Gemini calls and fallbacks.
   */
  ai: (message) => {
    if (shouldLog && !IS_PRODUCTION) {
      console.log(formatMessage('AI', message));
    }
  },
};

export default logger;
