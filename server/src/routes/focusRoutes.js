import express from 'express';
import {
  startFocusSession,
  endFocusSession,
  getFocusHistory,
  getFocusStats,
  getActiveSession
} from '../controllers/focusController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { sanitizeInput } from '../../middleware/securityMiddleware.js';
import { validate, startFocusSessionSchema, endFocusSessionSchema } from '../validations/validators.js';

const router = express.Router();

// All focus routes require authentication
router.use(protect);

// GET  /api/focus/active   — get currently active session
router.get('/active', getActiveSession);

// GET  /api/focus/stats    — get aggregated focus statistics
router.get('/stats', getFocusStats);

// GET  /api/focus/history  — paginated session history
router.get('/history', getFocusHistory);

// POST /api/focus/start    — start a new focus session
router.post('/start', sanitizeInput, validate(startFocusSessionSchema), startFocusSession);

// POST /api/focus/end      — end the active session and award XP
router.post('/end', sanitizeInput, validate(endFocusSessionSchema), endFocusSession);

export default router;
