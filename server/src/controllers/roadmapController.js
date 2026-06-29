import Roadmap from '../models/Roadmap.js';
import { awardXp } from '../../services/xpEngine.js';
import Notification from '../../models/Notification.js';
import logger from '../utils/logger.js';

// @desc    Get all roadmaps for the user
// @route   GET /api/roadmap
// @access  Private
export const getRoadmaps = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { category, completed, timeframe } = req.query;

    const query = { userEmail };
    if (category) query.category = category;
    if (completed !== undefined) query.completed = completed === 'true';
    if (timeframe) query.timeframe = timeframe;

    const roadmaps = await Roadmap.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Roadmaps retrieved successfully.',
      data: roadmaps,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new learning roadmap
// @route   POST /api/roadmap
// @access  Private
export const createRoadmap = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { title, description, category, timeframe, targetDate, milestones, xpReward } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap title is required.',
        data: null,
        errors: [{ message: 'Title is required.' }]
      });
    }

    if (!targetDate || isNaN(Date.parse(targetDate))) {
      return res.status(400).json({
        success: false,
        message: 'A valid target date is required.',
        data: null,
        errors: [{ message: 'Invalid targetDate.' }]
      });
    }

    // Format milestones with IDs if not provided
    const formattedMilestones = (milestones || []).map((m, idx) => ({
      id: m.id || `milestone-${Date.now()}-${idx}`,
      title: m.title || `Milestone ${idx + 1}`,
      description: m.description || '',
      completed: false,
      estimatedHours: m.estimatedHours || 2,
      targetDate: m.targetDate || '',
      completedAt: null
    }));

    const roadmap = await Roadmap.create({
      userEmail,
      title: title.trim(),
      description: description || '',
      category: category || 'General',
      timeframe: timeframe || 'weekly',
      targetDate,
      milestones: formattedMilestones,
      xpReward: xpReward || 100,
      isAiGenerated: false
    });

    logger.debug(`[ROADMAP] Created roadmap "${title}" for ${userEmail}`);

    // Award XP for creating a roadmap
    await awardXp(req.user, 10, `Created roadmap: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Roadmap created successfully. Stay focused, Ninja!',
      data: roadmap,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update roadmap metadata or milestone completion
// @route   PUT /api/roadmap/:id
// @access  Private
export const updateRoadmap = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;
    const { title, description, category, targetDate, milestones, milestoneId, milestoneCompleted } = req.body;

    const roadmap = await Roadmap.findOne({ _id: id, userEmail });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.',
        data: null,
        errors: [{ message: 'Roadmap ID does not exist.' }]
      });
    }

    const wasCompleted = roadmap.completed;

    // Update fields if provided
    if (title !== undefined) roadmap.title = title.trim();
    if (description !== undefined) roadmap.description = description;
    if (category !== undefined) roadmap.category = category;
    if (targetDate !== undefined) roadmap.targetDate = targetDate;

    // Full milestones replacement
    if (milestones !== undefined) {
      roadmap.milestones = milestones;
    }

    // Toggle single milestone by ID
    if (milestoneId !== undefined) {
      roadmap.milestones = roadmap.milestones.map(m => {
        if (m.id === milestoneId) {
          const nextCompleted = milestoneCompleted !== undefined ? milestoneCompleted : !m.completed;
          return {
            ...m.toObject(),
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date() : null
          };
        }
        return m;
      });
    }

    await roadmap.save(); // Pre-save hook recalculates progress

    // If roadmap just completed, award XP + notification
    if (!wasCompleted && roadmap.completed) {
      await awardXp(req.user, roadmap.xpReward, `Completed roadmap: ${roadmap.title}`);
      await Notification.create({
        id: `notif-roadmap-${Date.now()}`,
        userEmail,
        title: '🗺️ Roadmap Complete!',
        message: `You completed your roadmap "${roadmap.title}". +${roadmap.xpReward} XP awarded!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'gamification',
        read: false,
        contextAware: false
      });
      logger.debug(`[ROADMAP] Roadmap "${roadmap.title}" completed for ${userEmail}`);
    }

    res.status(200).json({
      success: true,
      message: 'Roadmap updated successfully.',
      data: roadmap,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a roadmap
// @route   DELETE /api/roadmap/:id
// @access  Private
export const deleteRoadmap = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;

    const deleted = await Roadmap.findOneAndDelete({ _id: id, userEmail });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.',
        data: null,
        errors: [{ message: 'Roadmap ID does not exist.' }]
      });
    }

    res.status(200).json({
      success: true,
      message: 'Roadmap deleted.',
      data: null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single roadmap by ID
// @route   GET /api/roadmap/:id
// @access  Private
export const getRoadmapById = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;

    const roadmap = await Roadmap.findOne({ _id: id, userEmail });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.',
        data: null,
        errors: [{ message: 'Roadmap ID does not exist.' }]
      });
    }

    res.status(200).json({
      success: true,
      message: 'Roadmap retrieved.',
      data: roadmap,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
