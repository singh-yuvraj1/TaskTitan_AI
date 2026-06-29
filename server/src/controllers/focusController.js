import FocusSession from '../models/FocusSession.js';
import HeatmapContribution from '../models/HeatmapContribution.js';
import User from '../../models/User.js';
import { awardXp, logActivityMetric } from '../../services/xpEngine.js';
import logger from '../utils/logger.js';

// XP rewards per focus mode
const FOCUS_XP_RATES = {
  pomodoro: 20,       // 25-min pomodoro
  short_break: 0,
  long_break: 0,
  deep: 30,           // Deep work session (50+ min)
  custom: 15,
};

// @desc    Start a new focus session
// @route   POST /api/focus/start
// @access  Private
export const startFocusSession = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { taskId, taskTitle, mode, targetDurationMinutes, notes } = req.body;

    // Check for an existing active session (not yet ended)
    const activeSession = await FocusSession.findOne({
      userEmail,
      endTime: null,
      completed: false
    }).sort({ createdAt: -1 });

    if (activeSession) {
      return res.status(409).json({
        success: false,
        message: 'An active focus session is already in progress. End it before starting a new one.',
        data: { activeSession },
        errors: [{ message: 'Active session conflict.' }]
      });
    }

    const session = await FocusSession.create({
      userEmail,
      taskId: taskId || '',
      taskTitle: taskTitle || '',
      startTime: new Date(),
      mode: mode || 'pomodoro',
      targetDurationMinutes: targetDurationMinutes || 25,
      notes: notes || '',
      completed: false
    });

    logger.debug(`[FOCUS] Session started for ${userEmail} — mode: ${session.mode}`);

    res.status(201).json({
      success: true,
      message: 'Focus session started. Stay in the zone, Ninja!',
      data: session,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End an active focus session and award XP
// @route   POST /api/focus/end
// @access  Private
export const endFocusSession = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { sessionId, completed, notes } = req.body;

    // Find session — either by ID or find the most recent active one
    let session;
    if (sessionId) {
      session = await FocusSession.findOne({ _id: sessionId, userEmail });
    } else {
      session = await FocusSession.findOne({
        userEmail,
        endTime: null
      }).sort({ createdAt: -1 });
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active focus session found.',
        data: null,
        errors: [{ message: 'Session not found.' }]
      });
    }

    if (session.endTime) {
      return res.status(400).json({
        success: false,
        message: 'This session has already been ended.',
        data: session,
        errors: [{ message: 'Session already completed.' }]
      });
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - session.startTime.getTime();
    const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));
    const wasCompleted = completed !== false; // default true

    // XP: base rate + bonus if fully completed (duration >= target)
    const baseXp = FOCUS_XP_RATES[session.mode] || 15;
    const completionBonus = wasCompleted && durationMinutes >= session.targetDurationMinutes ? 10 : 0;
    const xpAwarded = baseXp + completionBonus;

    // Update session
    session.endTime = endTime;
    session.durationMinutes = durationMinutes;
    session.completed = wasCompleted;
    session.xpAwarded = xpAwarded;
    if (notes) session.notes = notes;
    await session.save();

    // Award XP to user
    await awardXp(req.user, xpAwarded, `Focus session: ${session.mode} (${durationMinutes} min)`);

    // Log activity metric (hours)
    const focusHours = parseFloat((durationMinutes / 60).toFixed(2));
    await logActivityMetric(userEmail, 'focus', focusHours);

    // Update heatmap
    const today = new Date().toISOString().split('T')[0];
    await HeatmapContribution.upsertDay(userEmail, today, {
      focusMinutes: durationMinutes,
      xpEarned: xpAwarded,
      sessionsCount: 1,
      streakDay: req.user.streak || 0
    });

    logger.debug(`[FOCUS] Session ended: ${durationMinutes} min, +${xpAwarded} XP, user: ${userEmail}`);

    res.status(200).json({
      success: true,
      message: `Focus session logged. You earned +${xpAwarded} XP. Great work, Ninja!`,
      data: {
        session,
        xpAwarded,
        durationMinutes,
        focusHoursLogged: focusHours
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's focus session history (paginated)
// @route   GET /api/focus/history
// @access  Private
export const getFocusHistory = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { limit = 20, page = 1, mode } = req.query;

    const query = { userEmail, endTime: { $ne: null } };
    if (mode) query.mode = mode;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sessions = await FocusSession.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await FocusSession.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Focus session history retrieved.',
      data: {
        sessions,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10))
        }
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated focus statistics
// @route   GET /api/focus/stats
// @access  Private
export const getFocusStats = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    const sessions = await FocusSession.find({ userEmail, endTime: { $ne: null } });

    if (sessions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No focus sessions recorded yet.',
        data: {
          totalSessions: 0,
          completedSessions: 0,
          totalFocusMinutes: 0,
          totalFocusHours: 0,
          averageSessionMinutes: 0,
          totalXpEarned: 0,
          longestSession: 0,
          modeBreakdown: {},
          weeklyTrend: []
        },
        errors: null
      });
    }

    const completedSessions = sessions.filter(s => s.completed);
    const totalFocusMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalXpEarned = sessions.reduce((acc, s) => acc + (s.xpAwarded || 0), 0);
    const longestSession = Math.max(...sessions.map(s => s.durationMinutes || 0));
    const averageSessionMinutes = Math.round(totalFocusMinutes / sessions.length);

    // Mode breakdown
    const modeBreakdown = {};
    sessions.forEach(s => {
      modeBreakdown[s.mode] = (modeBreakdown[s.mode] || 0) + 1;
    });

    // Weekly trend (past 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter(s =>
        s.startTime && s.startTime.toISOString().startsWith(dateStr)
      );
      weeklyTrend.push({
        date: dateStr,
        sessions: daySessions.length,
        focusMinutes: daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
      });
    }

    res.status(200).json({
      success: true,
      message: 'Focus statistics compiled.',
      data: {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        totalFocusMinutes,
        totalFocusHours: parseFloat((totalFocusMinutes / 60).toFixed(1)),
        averageSessionMinutes,
        totalXpEarned,
        longestSession,
        modeBreakdown,
        weeklyTrend
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently active session (if any)
// @route   GET /api/focus/active
// @access  Private
export const getActiveSession = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    const session = await FocusSession.findOne({
      userEmail,
      endTime: null,
      completed: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: session ? 'Active session found.' : 'No active session.',
      data: { session: session || null },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
