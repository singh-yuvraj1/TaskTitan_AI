import express from 'express';
import { unlockSkill } from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sanitizeInput } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.post('/unlock', protect, sanitizeInput, unlockSkill);

export default router;
