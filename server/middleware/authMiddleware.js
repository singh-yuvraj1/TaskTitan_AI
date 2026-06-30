import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../src/config/jwt.js';

export const protect = async (req, res, next) => {
  let token = '';

  // 1. Check for token in cookies
  if (req.cookies && req.cookies.cn_jwt) {
    token = req.cookies.cn_jwt;
  }
  // 2. Check for token in authorization headers
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No session token found.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find the user and attach to request object
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH ERROR]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid session token.'
    });
  }
};
