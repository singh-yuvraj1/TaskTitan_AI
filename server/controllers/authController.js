import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { seedUserData } from '../services/seedService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'superninja_secret_key_1337';
const JWT_EXPIRES_IN = '30d';

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

// @desc    Forgot Password
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

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user account found with that email address.',
        data: null,
        errors: [{ message: 'Email not found.' }]
      });
    }

    // Mock reset URL link
    const resetUrl = `http://localhost:5173/auth/reset?token=mock_reset_token_${Date.now()}`;
    console.log(`\n[PASSWORD RECOVERY LOG] Reset link generated for ${email}: ${resetUrl}\n`);

    res.status(200).json({
      success: true,
      message: 'Password reset link generated and printed to server console logs.',
      data: { resetUrl },
      errors: null
    });
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
