import express from 'express';
import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';
import habitRoutes from './habitRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import skillRoutes from './skillRoutes.js';
import aiRoutes from './aiRoutes.js';
import userRoutes from './userRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/calendar', calendarRoutes);
router.use('/skills', skillRoutes);
router.use('/ai', aiRoutes);
router.use('/user', userRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
