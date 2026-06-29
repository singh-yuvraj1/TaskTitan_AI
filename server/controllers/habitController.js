import Habit from '../models/Habit.js';
import Notification from '../models/Notification.js';
import { awardXp } from '../services/xpEngine.js';

// @desc    Toggle habit completion status for today
// @route   POST /api/habits/toggle
// @access  Private
export const toggleHabit = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { habitId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ id: habitId, userEmail });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found.',
        data: null,
        errors: [{ message: 'Habit ID does not exist.' }]
      });
    }

    const isCompletedToday = habit.completedDates.includes(today);
    let nextCompleted = [...habit.completedDates];
    let nextStreak = habit.streak;

    if (isCompletedToday) {
      // Untoggle completion
      nextCompleted = nextCompleted.filter(d => d !== today);
      nextStreak = Math.max(0, nextStreak - 1);
      habit.completedDates = nextCompleted;
      habit.streak = nextStreak;
      await habit.save();
    } else {
      // Complete habit
      nextCompleted.push(today);
      nextStreak += 1;
      habit.completedDates = nextCompleted;
      habit.streak = nextStreak;
      await habit.save();

      // Award 10 XP for completion
      await awardXp(req.user, 10, `Completed Habit: ${habit.name}`);

      // Milestone streak rewards
      if (nextStreak === 7) {
        // Award 100 XP streak bonus
        await awardXp(req.user, 100, '7 Day Habit Streak Bonus!');
        
        // Add "30 Day Warrior" badge if not already unlocked
        if (!req.user.badges.includes('30 Day Warrior')) {
          req.user.badges.push('30 Day Warrior');
          await req.user.save();
          
          await Notification.create({
            id: `notif-badge-${Date.now()}`,
            userEmail,
            title: 'New Badge Unlocked! 🏆',
            message: 'You have unlocked the "30 Day Warrior" badge!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'gamification',
            read: false,
            contextAware: false
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Habit toggled successfully.',
      data: habit,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
