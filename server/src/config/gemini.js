/**
 * Gemini AI Configuration
 * Resolves the active Gemini API key with a priority chain:
 *   1. User's personal API key (stored in DB, passed from req.user)
 *   2. Server-level environment key (process.env.GEMINI_API_KEY)
 *   3. null (triggers heuristic fallbacks in services)
 */

export const GEMINI_MODEL = 'gemini-1.5-flash';
export const GEMINI_TIMEOUT_MS = 15000; // 15 second timeout for AI calls

/**
 * Resolves the Gemini API key to use for a request.
 * @param {string|null} userKey - The user's personal API key from their settings
 * @returns {string|null} The API key to use, or null if none available
 */
export const resolveGeminiKey = (userKey = '') => {
  if (userKey && userKey.trim().length > 10) {
    return userKey.trim();
  }
  const serverKey = process.env.GEMINI_API_KEY;
  if (serverKey && serverKey.trim().length > 10) {
    return serverKey.trim();
  }
  return null;
};

/**
 * Returns whether Gemini AI is available (either user or server key present).
 */
export const isGeminiAvailable = (userKey = '') => {
  return resolveGeminiKey(userKey) !== null;
};

export default {
  GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  resolveGeminiKey,
  isGeminiAvailable,
};
