import mongoose from 'mongoose';

/**
 * Badge Model
 * Tracks badge award events for gamification.
 * Badges are awarded by the XP engine, rescue engine, or challenge completion.
 */
const badgeSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  // Unique badge identifier (e.g., 'rescue_champion', 'streak_king')
  badgeId: {
    type: String,
    required: true
  },
  badgeName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Emoji icon or icon identifier
  icon: {
    type: String,
    default: '🏅'
  },
  // Category: 'productivity', 'consistency', 'rescue', 'mastery', 'social'
  category: {
    type: String,
    enum: ['productivity', 'consistency', 'rescue', 'mastery', 'social', 'general'],
    default: 'general'
  },
  // Rarity tier
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  // XP bonus associated with this badge
  xpBonus: {
    type: Number,
    default: 0
  },
  // When this badge was earned
  awardedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate badge awards per user
badgeSchema.index({ userEmail: 1, badgeId: 1 }, { unique: true });

// Predefined badge definitions for reference
export const BADGE_DEFINITIONS = {
  rescue_champion: {
    badgeId: 'rescue_champion',
    badgeName: 'Rescue Champion',
    description: 'Prevented a deadline failure using Rescue Mode.',
    icon: '🚨',
    category: 'rescue',
    rarity: 'rare',
    xpBonus: 100
  },
  streak_king: {
    badgeId: 'streak_king',
    badgeName: 'Streak King',
    description: 'Maintained a 7-day active coding streak.',
    icon: '🔥',
    category: 'consistency',
    rarity: 'rare',
    xpBonus: 150
  },
  pomodoro_beast: {
    badgeId: 'pomodoro_beast',
    badgeName: 'Pomodoro Beast',
    description: 'Completed 10 Pomodoro focus sessions.',
    icon: '🍅',
    category: 'productivity',
    rarity: 'common',
    xpBonus: 50
  },
  ninja_level: {
    badgeId: 'ninja_level',
    badgeName: 'Code Ninja',
    description: 'Reached Level 10.',
    icon: '🥷',
    category: 'mastery',
    rarity: 'epic',
    xpBonus: 200
  },
  first_rescue: {
    badgeId: 'first_rescue',
    badgeName: 'First Responder',
    description: 'Activated Rescue Mode for the first time.',
    icon: '🛡️',
    category: 'rescue',
    rarity: 'common',
    xpBonus: 25
  },
};

export const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
