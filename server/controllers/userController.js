import User from '../models/User.js';
import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import SkillNode from '../models/SkillNode.js';
import Challenge from '../models/Challenge.js';
import CalendarEvent from '../models/CalendarEvent.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import HeatmapContribution from '../src/models/HeatmapContribution.js';
import { awardXp, logActivityMetric, updateStreak } from '../services/xpEngine.js';
import { checkDeadlineNotifications } from '../services/notificationEngine.js';


// @desc    Get user workspace state
// @route   GET /api/user/state
// @access  Private
export const getUserState = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    // Trigger deadline checks to generate approaching/overdue alerts
    await checkDeadlineNotifications(userEmail);

    const tasks = await Task.find({ userEmail }).sort({ createdAt: -1 });
    const habits = await Habit.find({ userEmail });
    const skills = await SkillNode.find({ userEmail });
    const challenges = await Challenge.find({ userEmail });
    const calendarEvents = await CalendarEvent.find({ userEmail });
    const notifications = await Notification.find({ userEmail }).sort({ createdAt: -1 });
    const activityLogs = await ActivityLog.find({ userEmail });

    // Format activity history records for frontend calendar heatmap charts
    const activityHistory = {};
    activityLogs.forEach(log => {
      activityHistory[log.date] = {
        xpEarned: log.xpEarned,
        focusHours: log.focusHours,
        tasksCompleted: log.tasksCompleted
      };
    });

    // Structure progress properties matching AppContext expectations
    const progress = {
      email: req.user.email,
      name: req.user.name || '',
      xp: req.user.xp,
      level: req.user.level,
      rank: req.user.rank,
      streak: req.user.streak,
      focusHours: req.user.focusHours,
      badges: req.user.badges,
      theme: req.user.theme,
      language: req.user.language,
      geminiApiKey: req.user.geminiApiKey,
      notificationPreferences: req.user.notificationPreferences
    };

    res.status(200).json({
      success: true,
      message: 'User workspace state compiled.',
      data: {
        progress,
        tasks,
        habits,
        skills,
        challenges,
        calendarEvents,
        notifications,
        activityHistory
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update focus session metrics
// @route   POST /api/user/focus
// @access  Private
export const addFocusHours = async (req, res, next) => {
  try {
    const { hours } = req.body;
    const user = req.user;

    if (!hours || isNaN(hours)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid focus hours value.',
        data: null,
        errors: [{ message: 'Hours parameter must be a number.' }]
      });
    }

    user.focusHours = Number((user.focusHours + hours).toFixed(1));
    updateStreak(user);
    await user.save();

    // Log the daily metric
    await logActivityMetric(user.email, 'focus', hours);

    res.status(200).json({
      success: true,
      message: 'Focus session telemetry synced.',
      data: {
        focusHours: user.focusHours
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add XP manually or via frontend action
// @route   POST /api/user/xp/add
// @access  Private
export const addXpProgress = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const user = req.user;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid XP amount.',
        data: null,
        errors: [{ message: 'Amount parameter must be a number.' }]
      });
    }

    const updatedUser = await awardXp(user, Number(amount), reason || 'Activity completed');

    res.status(200).json({
      success: true,
      message: 'XP progress awarded.',
      data: {
        xp: updatedUser.xp,
        level: updatedUser.level,
        rank: updatedUser.rank
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile preferences & settings
// @route   PUT /api/user/settings
// @access  Private
export const updateSettings = async (req, res, next) => {
  try {
    const user = req.user;
    const { theme, language, geminiApiKey, notificationPreferences, name } = req.body;

    if (name !== undefined) user.name = name;
    if (theme !== undefined) user.theme = theme;
    if (language !== undefined) user.language = language;
    if (geminiApiKey !== undefined) user.geminiApiKey = geminiApiKey;
    if (notificationPreferences !== undefined) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences saved securely.',
      data: {
        user: {
          email: user.email,
          name: user.name,
          theme: user.theme,
          language: user.language,
          geminiApiKey: user.geminiApiKey,
          notificationPreferences: user.notificationPreferences
        }
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/user/notifications/read
// @access  Private
export const readNotifications = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    await Notification.updateMany({ userEmail, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read.',
      data: null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get heatmap contribution data (past 365 days)
// @route   GET /api/user/heatmap
// @access  Private
export const getHeatmapData = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { days = 365 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days, 10));
    const startDateStr = startDate.toISOString().split('T')[0];

    // Use HeatmapContribution (today's-date based contributions) as primary source
    const contributions = await HeatmapContribution.find({
      userEmail,
      date: { $gte: startDateStr }
    }).sort({ date: 1 });

    // Convert to { [YYYY-MM-DD]: { xpEarned, focusHours, tasksCompleted } } map
    // focusMinutes is stored in HeatmapContribution — convert to hours for client compatibility
    const heatmapData = {};
    contributions.forEach(log => {
      heatmapData[log.date] = {
        xpEarned: log.xpEarned || 0,
        focusHours: parseFloat(((log.focusMinutes || 0) / 60).toFixed(2)),
        tasksCompleted: log.tasksCompleted || 0,
        intensity: log.intensity || 0
      };
    });

    const totalXp = contributions.reduce((acc, l) => acc + (l.xpEarned || 0), 0);
    const totalFocusMinutes = contributions.reduce((acc, l) => acc + (l.focusMinutes || 0), 0);
    const totalTasksCompleted = contributions.reduce((acc, l) => acc + (l.tasksCompleted || 0), 0);
    const activeDays = contributions.filter(l => l.intensity > 0).length;

    res.status(200).json({
      success: true,
      message: 'Heatmap data retrieved.',
      data: {
        heatmapData,
        summary: {
          totalXp,
          totalFocusHours: parseFloat((totalFocusMinutes / 60).toFixed(1)),
          totalTasksCompleted,
          activeDays,
          periodDays: parseInt(days, 10)
        }
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
