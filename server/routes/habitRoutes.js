import express from 'express';
import { toggleHabit } from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sanitizeInput } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.post('/toggle', protect, sanitizeInput, toggleHabit);

export default router;
