import express from 'express';
import passport from 'passport';
import { signup, login, logout, forgotPassword, resetPassword, getMe, googleCallback } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateSignup, validateLogin } from '../middleware/validationMiddleware.js';
import { sanitizeInput } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.post('/signup', validateSignup, sanitizeInput, signup);
router.post('/login', validateLogin, sanitizeInput, login);
router.post('/logout', protect, logout);
router.post('/forgot-password', sanitizeInput, forgotPassword);
router.post('/reset-password', sanitizeInput, resetPassword);
router.get('/me', protect, getMe);

// Google OAuth Initializer
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google OAuth Callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:5173/?tab=auth&error=Google%20Authentication%20failed', session: false }), googleCallback);

export default router;
