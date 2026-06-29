/**
 * API Route Aggregator (src version)
 * Mounts all route groups under /api.
 * Importing from both legacy routes/ and new src/routes/.
 */

import express from 'express';

// ── Legacy routes (existing flat structure) ───────────────────────────────────
import authRoutes from '../../routes/authRoutes.js';
import taskRoutes from '../../routes/taskRoutes.js';
import habitRoutes from '../../routes/habitRoutes.js';
import calendarRoutes from '../../routes/calendarRoutes.js';
import skillRoutes from '../../routes/skillRoutes.js';
import aiRoutes from '../../routes/aiRoutes.js';
import userRoutes from '../../routes/userRoutes.js';
import analyticsRoutes from '../../routes/analyticsRoutes.js';

// ── New src routes ────────────────────────────────────────────────────────────
import focusRoutes from './focusRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import roadmapRoutes from './roadmapRoutes.js';

const router = express.Router();

// ── Authentication ────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Core Data ─────────────────────────────────────────────────────────────────
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/calendar', calendarRoutes);
router.use('/skills', skillRoutes);

// ── User & Gamification ───────────────────────────────────────────────────────
router.use('/user', userRoutes);
router.use('/analytics', analyticsRoutes);

// ── AI Services ───────────────────────────────────────────────────────────────
router.use('/ai', aiRoutes);

// ── New Feature Routes ────────────────────────────────────────────────────────
router.use('/focus', focusRoutes);
router.use('/notifications', notificationRoutes);
router.use('/roadmap', roadmapRoutes);

// ── API Route Index (lists all available routes) ──────────────────────────────
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CodingNinja Production API — v1',
    data: {
      endpoints: {
        auth: [
          'POST /api/auth/signup',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET  /api/auth/me',
          'POST /api/auth/forgot-password'
        ],
        tasks: [
          'GET    /api/tasks',
          'POST   /api/tasks',
          'PUT    /api/tasks/:id',
          'DELETE /api/tasks/:id',
          'POST   /api/tasks/:id/rescue'
        ],
        calendar: [
          'POST   /api/calendar',
          'DELETE /api/calendar/:id',
          'POST   /api/calendar/reschedule'
        ],
        habits: ['POST /api/habits/toggle'],
        skills: ['POST /api/skills/unlock'],
        user: [
          'GET  /api/user/state',
          'POST /api/user/focus',
          'POST /api/user/xp/add',
          'PUT  /api/user/settings',
          'POST /api/user/notifications/read'
        ],
        analytics: ['GET /api/analytics'],
        ai: [
          'POST /api/ai/command',
          'POST /api/ai/voice',
          'POST /api/ai/rescue-timeline',
          'POST /api/ai/coach-feedback'
        ],
        focus: [
          'POST /api/focus/start',
          'POST /api/focus/end',
          'GET  /api/focus/active',
          'GET  /api/focus/history',
          'GET  /api/focus/stats'
        ],
        notifications: [
          'GET    /api/notifications',
          'POST   /api/notifications',
          'PATCH  /api/notifications/read',
          'GET    /api/notifications/count',
          'DELETE /api/notifications/clear',
          'PATCH  /api/notifications/:id/read',
          'DELETE /api/notifications/:id'
        ],
        roadmap: [
          'GET    /api/roadmap',
          'POST   /api/roadmap',
          'GET    /api/roadmap/:id',
          'PUT    /api/roadmap/:id',
          'DELETE /api/roadmap/:id'
        ],
        health: ['GET /api/health']
      }
    },
    errors: null
  });
});

export default router;
