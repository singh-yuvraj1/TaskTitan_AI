import express from 'express';
import { addCalendarEvent, deleteCalendarEvent, rescheduleCalendar } from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sanitizeInput } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.post('/', protect, sanitizeInput, addCalendarEvent);
router.delete('/:id', protect, deleteCalendarEvent);
router.post('/reschedule', protect, rescheduleCalendar);

export default router;
