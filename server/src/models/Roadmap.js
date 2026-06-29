import mongoose from 'mongoose';

/**
 * Roadmap Model
 * Weekly/Monthly learning roadmap with milestone tracking.
 * Allows users to define structured learning paths.
 */

// Milestone sub-document
const milestoneSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  // Estimated effort in hours
  estimatedHours: { type: Number, default: 2 },
  // Target completion date for this milestone
  targetDate: { type: String, default: '' },
  completedAt: { type: Date, default: null }
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Category: 'DSA', 'React', 'Backend', 'System Design', 'Placement Prep', 'General'
  category: {
    type: String,
    default: 'General'
  },
  // Duration type
  timeframe: {
    type: String,
    enum: ['weekly', 'monthly', 'custom'],
    default: 'weekly'
  },
  targetDate: {
    type: String,
    required: true
  },
  milestones: {
    type: [milestoneSchema],
    default: []
  },
  // Completion percentage (auto-computed from milestones)
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  // XP reward on full completion
  xpReward: {
    type: Number,
    default: 100
  },
  // Whether roadmap was AI-generated
  isAiGenerated: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Auto-calculate progress before saving
roadmapSchema.pre('save', function (next) {
  if (this.milestones && this.milestones.length > 0) {
    const completedCount = this.milestones.filter(m => m.completed).length;
    this.progress = Math.round((completedCount / this.milestones.length) * 100);
    this.completed = this.progress === 100;
  } else if (this.completed) {
    this.progress = 100;
  }
  next();
});

roadmapSchema.index({ userEmail: 1, createdAt: -1 });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
