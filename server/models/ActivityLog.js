import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  date: {
    type: String,
    required: true // Format: YYYY-MM-DD
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  focusHours: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

activityLogSchema.index({ userEmail: 1, date: 1 }, { unique: true });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
