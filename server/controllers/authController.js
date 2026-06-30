import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { seedUserData } from '../services/seedService.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../src/config/jwt.js';

// Helper to sign JWT and write cookie
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Strip password from returned user object
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  res.status(statusCode)
    .cookie('cn_jwt', token, cookieOptions)
    .json({
      success: true,
      message,
      data: {
        token,
        user: userObj
      },
      errors: null
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with that email already exists.',
        data: null,
        errors: [{ message: 'Email already registered.' }]
      });
    }

    // Create user
    const newUser = await User.create({
      email: lowerEmail,
      password,
      name: name || ''
    });

    // Seed default state
    try {
      await seedUserData(lowerEmail);
    } catch (seedErr) {
      console.error('[SEED ERROR] Seeding failed for registered user:', seedErr.message);
    }

    sendTokenResponse(newUser, 201, res, 'Profile created successfully and workspace initialized.');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
        data: null,
        errors: [{ message: 'Invalid email or password.' }]
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
        data: null,
        errors: [{ message: 'Invalid email or password.' }]
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie('cn_jwt', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
      data: null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password — generate token, optionally email it
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required.',
        data: null,
        errors: [{ message: 'Missing email address.' }]
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Security: return same response whether user exists or not to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
        data: null,
        errors: null
      });
    }

    // Generate a secure random 32-byte token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (never store raw tokens)
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Store the hashed token and expiry on the user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save({ validateBeforeSave: false });

    // Build reset URL using the raw (unhashed) token — the client sends it back, we rehash to compare
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientBaseUrl}/?tab=auth&mode=reset&token=${rawToken}`;

    // ─── SMTP Check ──────────────────────────────────────────────────────────
    const smtpConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    if (smtpConfigured) {
      // Production Mode: Send real email via Nodemailer
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT, 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const mailOptions = {
          from: `"TaskTitan-AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'Password Reset Request — TaskTitan-AI',
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; background: #0B0F19; color: #F8FAFC; border-radius: 16px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #7C3AED, #06B6D4); padding: 32px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 900;">⚡ TaskTitan-AI</h1>
                <p style="margin: 8px 0 0; opacity: 0.8; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">AI Productivity OS</p>
              </div>
              <div style="padding: 32px;">
                <h2 style="font-size: 20px; margin: 0 0 12px;">Reset Your Password</h2>
                <p style="color: #94A3B8; line-height: 1.6;">You requested a password reset for your account. Click the button below to set a new password. This link expires in <strong style="color: #F8FAFC;">15 minutes</strong>.</p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${resetUrl}" style="background: linear-gradient(135deg, #7C3AED, #06B6D4); color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block;">
                    Reset Password →
                  </a>
                </div>
                <p style="color: #64748B; font-size: 12px; line-height: 1.6;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;" />
                <p style="color: #475569; font-size: 11px; text-align: center; font-family: monospace;">Reset link: ${resetUrl}</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[PASSWORD RESET] Email sent to ${user.email}`);

        return res.status(200).json({
          success: true,
          message: 'Password reset email sent. Check your inbox.',
          data: null,
          errors: null
        });
      } catch (emailErr) {
        console.error('[EMAIL ERROR] Failed to send reset email:', emailErr.message);
        // Clear the token since email failed
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email. Please try again.',
          data: null,
          errors: [{ message: emailErr.message }]
        });
      }
    } else {
      // ─── Development Mode ──────────────────────────────────────────────────
      // No SMTP configured — log the link and return it in the response
      console.log('\n' + '='.repeat(70));
      console.log(`[PASSWORD RESET — DEVELOPMENT MODE]`);
      console.log(`  Email   : ${user.email}`);
      console.log(`  Token   : ${rawToken}`);
      console.log(`  Expires : ${user.resetPasswordExpire.toISOString()}`);
      console.log(`  Link    : ${resetUrl}`);
      console.log('='.repeat(70) + '\n');

      return res.status(200).json({
        success: true,
        message: 'Development mode: No SMTP configured. Reset link logged to terminal and returned in response.',
        data: {
          resetUrl,
          expiresAt: user.resetPasswordExpire.toISOString(),
          devMode: true
        },
        errors: null
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password — validate token, update password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.',
        data: null,
        errors: [{ message: 'Missing token or password.' }]
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
        data: null,
        errors: [{ message: 'Password too short.' }]
      });
    }

    // Hash the incoming raw token to compare against stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by hashed token where expiry is still in the future
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new one.',
        data: null,
        errors: [{ message: 'Token invalid or expired.' }]
      });
    }

    // Update password — pre-save hook will hash it
    user.password = password;

    // Clear reset token fields to invalidate this and any other pending tokens
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    console.log(`[PASSWORD RESET] Password updated for ${user.email}`);

    // Log the user in automatically after a successful reset
    sendTokenResponse(user, 200, res, 'Password reset successful. You are now logged in.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User session verified.',
      data: {
        user: req.user
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Callback Redirection
// @route   GET /api/auth/google/callback
// @access  Private (Internal from Google)
export const googleCallback = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect('http://localhost:5173/?tab=auth&error=Google%20Authentication%20failed');
    }

    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('cn_jwt', token, cookieOptions);
    res.redirect('http://localhost:5173/');
  } catch (error) {
    console.error('[OAUTH CALLBACK ERROR]:', error.message);
    res.redirect('http://localhost:5173/?tab=auth&error=Google%20Authentication%20failed');
  }
};
