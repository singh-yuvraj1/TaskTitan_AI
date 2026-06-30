import Task from '../models/Task.js';
import CalendarEvent from '../models/CalendarEvent.js';
import Notification from '../models/Notification.js';
import Challenge from '../models/Challenge.js';
import HeatmapContribution from '../src/models/HeatmapContribution.js';
import { generateTaskDecomposition } from '../services/geminiService.js';
import { awardXp, logActivityMetric } from '../services/xpEngine.js';
import { calculateTaskRiskScore, triggerRescueEngine } from '../services/rescueEngine.js';

// @desc    Get all tasks with search and filters
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { category, priority, completed, search } = req.query;

    const query = { userEmail };

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (completed !== undefined) query.completed = completed === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    // Calibrate failure probabilities dynamically in-memory based on current parameters
    const updatedTasks = tasks.map(t => {
      const risk = calculateTaskRiskScore(t, req.user.focusHours, req.user.streak);
      t.failureProbability = risk;
      return t;
    });

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: updatedTasks,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task (decomposing with Gemini, creating calendar block, checking failure risk)
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { title, description, deadline } = req.body;

    // Call secure Gemini decomposition using process key or settings key
    const decomposition = await generateTaskDecomposition(
      title,
      description || '',
      deadline,
      req.user.geminiApiKey
    );

    const taskId = `task-${Date.now()}`;
    const newTask = new Task({
      id: taskId,
      userEmail,
      title,
      description: description || '',
      deadline,
      category: decomposition.category,
      priority: decomposition.priority,
      estimatedHours: Math.max(1, Math.round(decomposition.subtasks.reduce((acc, st) => acc + st.estimatedMinutes, 0) / 60)),
      completed: false,
      subtasks: decomposition.subtasks,
      failureProbability: decomposition.failureProbability,
      failureReason: decomposition.failureReason,
      suggestedAction: decomposition.suggestedAction,
      rescuePlanActive: false
    });

    await newTask.save();

    // Auto schedule focus calendar block (e.g. 2 hours from now)
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + newTask.estimatedHours);

    const newCalendarEvent = await CalendarEvent.create({
      id: `cal-auto-${Date.now()}`,
      userEmail,
      title: `Deep Focus: ${title}`,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      taskId,
      isAiScheduled: true
    });

    // Check failure risk and send notification if high
    if (newTask.failureProbability > 70) {
      await Notification.create({
        id: `notif-risk-${Date.now()}`,
        userEmail,
        title: 'AI High Risk Alert',
        message: `Task "${title}" carries a ${newTask.failureProbability}% risk of failure. Suggested Action: ${newTask.suggestedAction}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'rescue',
        read: false,
        contextAware: true
      });
    }

    // Award 15 XP
    await awardXp(req.user, 15, `Drafted task: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully with AI auto-decomposition and scheduling.',
      data: {
        task: newTask,
        calendarEvent: newCalendarEvent
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task (subtasks completion status, editing metadata)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;
    const updateFields = req.body;

    const task = await Task.findOne({ id, userEmail });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
        data: null,
        errors: [{ message: 'Task ID does not exist.' }]
      });
    }

    // Capture completion state change
    const wasCompleted = task.completed;

    // Apply updates
    Object.keys(updateFields).forEach(key => {
      task[key] = updateFields[key];
    });

    await task.save();

    // Trigger completions rewards
    if (task.completed && !wasCompleted) {
      // Award 50 XP (also triggers HeatmapContribution via centralized awardXp)
      await awardXp(req.user, 50, `Completed task: ${task.title}`);

      // Record task completion to HeatmapContribution using TODAY'S DATE (not deadline)
      try {
        const today = new Date().toISOString().split('T')[0];
        await HeatmapContribution.upsertDay(userEmail, today, {
          tasksCompleted: 1,
          streakDay: req.user.streak || 0
        });
      } catch (hErr) {
        console.error('[HEATMAP TASK UPDATE ERROR]:', hErr.message);
      }

      // Seed completion notification
      await Notification.create({
        id: `notif-goal-${Date.now()}`,
        userEmail,
        title: 'Goal Conquered!',
        message: `Successfully completed task "${task.title}". +50 XP awarded.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'gamification',
        read: false,
        contextAware: false
      });

      // Increment completed task count in daily ActivityLog metrics
      await logActivityMetric(userEmail, 'task', 1);

      // Check weekly challenge (ch-2) for Rescue Mode complete
      if (task.rescuePlanActive) {
        const rescueChallenge = await Challenge.findOne({ id: 'ch-2', userEmail });
        if (rescueChallenge && !rescueChallenge.completed) {
          rescueChallenge.progress = 100;
          rescueChallenge.completed = true;
          await rescueChallenge.save();

          // Award rescue champion XP (also tracked via centralized xpEngine)
          await awardXp(req.user, 100, 'Completed Rescue Champion Challenge');

          if (!req.user.badges.includes('Rescue Champion')) {
            req.user.badges.push('Rescue Champion');
            await req.user.save();
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: task,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task and clean respective calendar events
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ id, userEmail });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
        data: null,
        errors: [{ message: 'Task ID does not exist.' }]
      });
    }

    // Remove calendar allocations linked to this task
    await CalendarEvent.deleteMany({ taskId: id, userEmail });

    res.status(200).json({
      success: true,
      message: 'Task and associated calendar allocations purged successfully.',
      data: null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate rescue mode for high-risk task
// @route   POST /api/tasks/:id/rescue
// @access  Private
export const activateRescue = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;

    const task = await Task.findOne({ id, userEmail });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
        data: null,
        errors: [{ message: 'Task ID does not exist.' }]
      });
    }

    // Set priority to Urgent-Important
    task.priority = 'Urgent-Important';
    task.rescuePlanActive = true;

    // Run the rescue engine calculation
    const rescueResults = await triggerRescueEngine(task, req.user);
    
    // Merge result metrics
    task.rescueTimeline = rescueResults.rescueTimeline;
    task.recoveryPlan = rescueResults.recoveryPlan;
    task.completionForecast = rescueResults.completionForecast;
    task.failureProbability = rescueResults.failureProbability;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Emergency Rescue plan activated. Focus blocks locked and scheduled.',
      data: task,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
