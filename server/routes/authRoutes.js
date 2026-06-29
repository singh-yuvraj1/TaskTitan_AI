import express from 'express';
import { signup, login, logout, forgotPassword, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateSignup, validateLogin } from '../middleware/validationMiddleware.js';
import { sanitizeInput } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.post('/signup', validateSignup, sanitizeInput, signup);
router.post('/login', validateLogin, sanitizeInput, login);
router.post('/logout', protect, logout);
router.post('/forgot-password', sanitizeInput, forgotPassword);
router.get('/me', protect, getMe);

export default router;
