/**
 * Environment Variable Validator
 * Validates all required environment variables at startup.
 * Throws clearly if critical variables are missing.
 */

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const OPTIONAL_VARS_WITH_DEFAULTS = {
  PORT: '5000',
  NODE_ENV: 'development',
  JWT_EXPIRES_IN: '30d',
  GEMINI_API_KEY: '',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX: '200',
  CORS_ORIGIN: 'http://localhost:5173',
};

export const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[ENV ERROR] Missing required environment variables: ${missing.join(', ')}\n` +
      `Please configure your .env file. See .env.example for reference.`
    );
  }

  // Apply defaults for optional vars
  for (const [key, defaultValue] of Object.entries(OPTIONAL_VARS_WITH_DEFAULTS)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }
};

export const env = {
  get PORT() { return parseInt(process.env.PORT || '5000', 10); },
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
  get MONGODB_URI() { return process.env.MONGODB_URI; },
  get JWT_SECRET() { return process.env.JWT_SECRET; },
  get JWT_EXPIRES_IN() { return process.env.JWT_EXPIRES_IN || '30d'; },
  get GEMINI_API_KEY() { return process.env.GEMINI_API_KEY || ''; },
  get RATE_LIMIT_WINDOW_MS() { return parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); },
  get RATE_LIMIT_MAX() { return parseInt(process.env.RATE_LIMIT_MAX || '200', 10); },
  get CORS_ORIGIN() { return process.env.CORS_ORIGIN || 'http://localhost:5173'; },
  get IS_PRODUCTION() { return process.env.NODE_ENV === 'production'; },
  get IS_DEVELOPMENT() { return process.env.NODE_ENV === 'development'; },
};

export default env;
