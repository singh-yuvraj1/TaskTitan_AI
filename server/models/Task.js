import mongoose from 'mongoose';

// SubTask Schema definition
const subTaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  estimatedMinutes: { type: Number, default: 45 }
});

// RescueTimeline Schema definition
const rescueTimelineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  sequence: { type: Number, required: true }
});

// Main Task Schema
const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  deadline: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  priority: {
    type: String,
    default: 'NotUrgent-NotImportant'
  },
  estimatedHours: {
    type: Number,
    default: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  subtasks: [subTaskSchema],
  failureProbability: {
    type: Number,
    default: 0
  },
  failureReason: {
    type: String,
    default: ''
  },
  suggestedAction: {
    type: String,
    default: ''
  },
  rescuePlanActive: {
    type: Boolean,
    default: false
  },
  rescueTimeline: [rescueTimelineSchema],
  recoveryPlan: {
    type: [String],
    default: []
  },
  completionForecast: {
    type: String,
    default: ''
  }
}, { timestamps: true });

taskSchema.pre('save', function (next) {
  if (this.subtasks && this.subtasks.length > 0) {
    const completedCount = this.subtasks.filter(s => s.completed).length;
    this.progress = Math.round((completedCount / this.subtasks.length) * 100);
  } else if (this.completed) {
    this.progress = 100;
  }
  next();
});

taskSchema.index({ userEmail: 1, id: 1 }, { unique: true });

export const Task = mongoose.model('Task', taskSchema);
export default Task;
