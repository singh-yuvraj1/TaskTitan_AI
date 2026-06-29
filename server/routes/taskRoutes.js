import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, activateRescue } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateTask } from '../middleware/validationMiddleware.js';
import { sanitizeInput } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.get('/', protect, getTasks);
router.post('/', protect, validateTask, sanitizeInput, createTask);
router.put('/:id', protect, sanitizeInput, updateTask);
router.delete('/:id', protect, deleteTask);
router.post('/:id/rescue', protect, activateRescue);

export default router;
