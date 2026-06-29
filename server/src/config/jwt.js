/**
 * JWT Configuration
 * Centralizes all JWT-related constants and cookie options.
 */

export const JWT_SECRET = process.env.JWT_SECRET || 'superninja_jwt_secret_token_2026_prod_key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
export const JWT_COOKIE_NAME = 'cn_jwt';

// Cookie age in ms: 30 days
export const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Returns secure cookie options based on current environment.
 * httpOnly prevents XSS access; secure + sameSite prevent CSRF in production.
 */
export const getCookieOptions = () => ({
  expires: new Date(Date.now() + COOKIE_MAX_AGE_MS),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
});

/**
 * Cookie options that immediately expire the cookie (for logout).
 */
export const getLogoutCookieOptions = () => ({
  expires: new Date(0),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
});

export default {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_COOKIE_NAME,
  COOKIE_MAX_AGE_MS,
  getCookieOptions,
  getLogoutCookieOptions,
};
