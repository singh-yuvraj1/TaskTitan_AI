import mongoose from 'mongoose';

/**
 * FocusSession Model
 * Tracks individual Pomodoro/deep work focus sessions per user.
 * Each session logs start/end time, duration, and links to a task if applicable.
 */
const focusSessionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  // Optional: link session to a specific task
  taskId: {
    type: String,
    default: ''
  },
  taskTitle: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  // Duration in minutes (computed on session end)
  durationMinutes: {
    type: Number,
    default: 0
  },
  // Focus mode type
  mode: {
    type: String,
    enum: ['pomodoro', 'deep', 'custom', 'short_break', 'long_break'],
    default: 'pomodoro'
  },
  // Target duration in minutes (25 for pomodoro, etc.)
  targetDurationMinutes: {
    type: Number,
    default: 25
  },
  // Whether session completed fully or was interrupted
  completed: {
    type: Boolean,
    default: false
  },
  // XP awarded for this session
  xpAwarded: {
    type: Number,
    default: 0
  },
  // Notes or reflection (optional)
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Compound index for user + time range queries (heatmap, analytics)
focusSessionSchema.index({ userEmail: 1, startTime: -1 });
focusSessionSchema.index({ userEmail: 1, taskId: 1 });

export const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
export default FocusSession;
