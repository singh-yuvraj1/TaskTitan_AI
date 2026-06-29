import express from 'express';
import { runAICommand, runVoiceCommand, getRescueTimeline, getCoachAdvice } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sanitizeInput } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.post('/command', protect, sanitizeInput, runAICommand);
router.post('/voice', protect, sanitizeInput, runVoiceCommand);
router.post('/rescue-timeline', protect, sanitizeInput, getRescueTimeline);
router.post('/coach-feedback', protect, sanitizeInput, getCoachAdvice);

export default router;
