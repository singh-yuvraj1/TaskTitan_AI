import CalendarEvent from '../models/CalendarEvent.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

// @desc    Add manual or AI calendar event
// @route   POST /api/calendar
// @access  Private
export const addCalendarEvent = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { event } = req.body;

    const newEvent = new CalendarEvent({
      ...event,
      userEmail,
      id: event.id || `cal-man-${Date.now()}`
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully.',
      data: newEvent,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete calendar event
// @route   DELETE /api/calendar/:id
// @access  Private
export const deleteCalendarEvent = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;

    const deleted = await CalendarEvent.findOneAndDelete({ id, userEmail });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
        data: null,
        errors: [{ message: 'Event ID does not exist.' }]
      });
    }

    res.status(200).json({
      success: true,
      message: 'Calendar event deleted.',
      data: null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-optimize reschedule calendar blocks
// @route   POST /api/calendar/reschedule
// @access  Private
export const rescheduleCalendar = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    const userTasks = await Task.find({ userEmail, completed: false });
    const userEvents = await CalendarEvent.find({ userEmail });

    if (userTasks.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending tasks to reschedule.',
        data: userEvents,
        errors: null
      });
    }

    let offsetHours = 3;
    // Keep user's custom manual blocks, discard previously auto-scheduled AI blocks
    const manualEvents = userEvents.filter(e => !e.isAiScheduled);
    const reallocated = [...manualEvents];

    userTasks.forEach((task, idx) => {
      const start = new Date();
      start.setHours(start.getHours() + offsetHours);
      const end = new Date(start);
      end.setHours(end.getHours() + task.estimatedHours);

      reallocated.push(new CalendarEvent({
        id: `cal-re-${Date.now()}-${idx}`,
        userEmail,
        title: `Deep Focus: ${task.title}`,
        start: start.toISOString(),
        end: end.toISOString(),
        taskId: task.id,
        isAiScheduled: true
      }));

      offsetHours += task.estimatedHours + 1; // leave 1-hour gaps
    });

    // Delete existing AI blocks and write new ones
    await CalendarEvent.deleteMany({ userEmail, isAiScheduled: true });
    
    const newAiBlocks = reallocated.filter(e => e.isAiScheduled);
    if (newAiBlocks.length > 0) {
      await CalendarEvent.insertMany(newAiBlocks);
    }

    // Trigger Notification
    await Notification.create({
      id: `notif-cal-${Date.now()}`,
      userEmail,
      title: 'Calendar Auto-Optimized',
      message: 'AI has rescheduled calendar blocks to resolve collisions and stress-buffer workload.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'calendar',
      read: false,
      contextAware: false
    });

    const finalEvents = await CalendarEvent.find({ userEmail });

    res.status(200).json({
      success: true,
      message: 'Calendar reallocated and optimized successfully.',
      data: finalEvents,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
