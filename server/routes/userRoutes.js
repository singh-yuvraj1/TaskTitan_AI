import express from 'express';
import { getUserState, addFocusHours, addXpProgress, updateSettings, readNotifications, getHeatmapData } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sanitizeInput } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.get('/state', protect, getUserState);
router.get('/heatmap', protect, getHeatmapData);
router.post('/focus', protect, sanitizeInput, addFocusHours);
router.post('/xp/add', protect, sanitizeInput, addXpProgress);
router.put('/settings', protect, sanitizeInput, updateSettings);
router.post('/notifications/read', protect, readNotifications);

export default router;
