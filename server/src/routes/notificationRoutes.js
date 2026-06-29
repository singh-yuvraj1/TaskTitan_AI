import express from 'express';
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
  deleteNotification,
  clearReadNotifications,
  createNotification,
  getUnreadCount
} from '../controllers/notificationController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { sanitizeInput } from '../../middleware/securityMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// GET    /api/notifications/count   — get unread count (must come before /:id)
router.get('/count', getUnreadCount);

// DELETE /api/notifications/clear   — clear all read notifications (before /:id)
router.delete('/clear', clearReadNotifications);

// PATCH  /api/notifications/read    — mark ALL as read (before /:id)
router.patch('/read', markAllAsRead);

// GET    /api/notifications          — list all (paginated, filterable)
router.get('/', getNotifications);

// POST   /api/notifications          — create one (for testing / admin)
router.post('/', sanitizeInput, createNotification);

// PATCH  /api/notifications/:id/read — mark single as read
router.patch('/:id/read', markOneAsRead);

// DELETE /api/notifications/:id      — delete single
router.delete('/:id', deleteNotification);

export default router;
