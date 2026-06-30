import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  // Gamification stats (formerly UserProgress)
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  rank: {
    type: String,
    default: 'Beginner'
  },
  streak: {
    type: Number,
    default: 0
  },
  focusHours: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  },
  lastActiveDate: {
    type: String,
    default: ''
  },
  streakUpdatedDate: {
    type: String,
    default: ''
  },
  // Settings & Preferences
  theme: {
    type: String,
    default: 'dark'
  },
  language: {
    type: String,
    default: 'en'
  },
  geminiApiKey: {
    type: String,
    default: ''
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    rescueAlerts: { type: Boolean, default: true }
  },
  // Password Reset Token Fields
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Helper to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
