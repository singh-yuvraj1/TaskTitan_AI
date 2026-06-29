import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

// Helper to log user's daily metrics
export const logActivityMetric = async (email, type, amount) => {
  const today = new Date().toISOString().split('T')[0];
  const userEmail = email.toLowerCase().trim();

  try {
    const log = await ActivityLog.findOne({ userEmail, date: today });
    if (!log) {
      await ActivityLog.create({
        userEmail,
        date: today,
        xpEarned: type === 'xp' ? amount : 0,
        focusHours: type === 'focus' ? amount : 0,
        tasksCompleted: type === 'task' ? amount : 0
      });
    } else {
      if (type === 'xp') log.xpEarned += amount;
      else if (type === 'focus') log.focusHours = Number((log.focusHours + amount).toFixed(1));
      else if (type === 'task') log.tasksCompleted += amount;
      await log.save();
    }
  } catch (err) {
    console.error('[ACTIVITY METRIC ERROR]:', err.message);
  }
};

// Streak calculation helper
export const updateStreak = (user) => {
  const todayStr = new Date().toISOString().split('T')[0];
  if (user.streakUpdatedDate === todayStr) {
    return;
  }

  const lastActiveStr = user.lastActiveDate;
  if (!lastActiveStr) {
    user.streak = 1;
  } else {
    const todayDate = new Date(todayStr);
    const lastActiveDate = new Date(lastActiveStr);
    const diffTime = todayDate.getTime() - lastActiveDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.streak += 1;
    } else if (diffDays > 1) {
      user.streak = 1;
    }
  }

  user.lastActiveDate = todayStr;
  user.streakUpdatedDate = todayStr;
};

// Main XP Award Engine
export const awardXp = async (user, amount, reason) => {
  const userEmail = user.email.toLowerCase().trim();
  const oldLevel = user.level;

  try {
    user.xp += amount;
    
    // Level formula: level = Math.floor(xp / 300) + 1
    const newLevel = Math.floor(user.xp / 300) + 1;
    user.level = newLevel;

    // Rank formulas
    let rank = 'Beginner';
    if (newLevel >= 50) rank = 'Grandmaster';
    else if (newLevel >= 20) rank = 'Master';
    else if (newLevel >= 10) rank = 'Ninja';
    else if (newLevel >= 5) rank = 'Explorer';
    user.rank = rank;

    // Update streak tracking
    updateStreak(user);

    await user.save();

    // Log the XP metric for charts/heatmap
    await logActivityMetric(userEmail, 'xp', amount);

    // If leveled up, trigger notification!
    if (newLevel > oldLevel) {
      await Notification.create({
        id: `notif-lvl-${Date.now()}`,
        userEmail,
        title: 'Level Up! 🌟',
        message: `Congratulations! You reached Level ${newLevel}. You are growing stronger.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'gamification',
        read: false,
        contextAware: false
      });
    }

    return user;
  } catch (error) {
    console.error('[XP ENGINE ERROR]:', error.message);
    throw error;
  }
};
