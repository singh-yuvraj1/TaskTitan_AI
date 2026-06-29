import mongoose from 'mongoose';

/**
 * HeatmapContribution Model
 * GitHub-style contribution heatmap data.
 * Provides pre-aggregated daily activity intensity for fast heatmap rendering.
 * Complements ActivityLog with a dedicated intensity scoring system.
 */
const heatmapContributionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  // Date in YYYY-MM-DD format (one record per user per day)
  date: {
    type: String,
    required: true
  },
  // Intensity level 0-4 (like GitHub heatmap)
  // 0 = no activity, 1 = light, 2 = moderate, 3 = high, 4 = maximum
  intensity: {
    type: Number,
    default: 0,
    min: 0,
    max: 4
  },
  // Raw metrics for intensity calculation
  tasksCompleted: {
    type: Number,
    default: 0
  },
  // Focus time in minutes (not hours - higher precision)
  focusMinutes: {
    type: Number,
    default: 0
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  // Number of focus sessions started
  sessionsCount: {
    type: Number,
    default: 0
  },
  // Streak on this day
  streakDay: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Unique record per user per day
heatmapContributionSchema.index({ userEmail: 1, date: 1 }, { unique: true });
// For date-range queries (past 365 days for annual heatmap)
heatmapContributionSchema.index({ userEmail: 1, date: -1 });

/**
 * Static helper to compute intensity from raw metrics.
 * Used when upserting heatmap records.
 */
heatmapContributionSchema.statics.computeIntensity = function ({ tasksCompleted, focusMinutes, xpEarned }) {
  const score = (tasksCompleted * 30) + (focusMinutes * 0.5) + (xpEarned * 0.2);
  if (score === 0) return 0;
  if (score < 30) return 1;
  if (score < 80) return 2;
  if (score < 150) return 3;
  return 4;
};

/**
 * Upserts (creates or updates) a heatmap record for a given day.
 */
heatmapContributionSchema.statics.upsertDay = async function (userEmail, date, updates) {
  const record = await this.findOne({ userEmail, date });

  const tasksCompleted = (record?.tasksCompleted || 0) + (updates.tasksCompleted || 0);
  const focusMinutes = (record?.focusMinutes || 0) + (updates.focusMinutes || 0);
  const xpEarned = (record?.xpEarned || 0) + (updates.xpEarned || 0);
  const sessionsCount = (record?.sessionsCount || 0) + (updates.sessionsCount || 0);

  const intensity = this.computeIntensity({ tasksCompleted, focusMinutes, xpEarned });

  return this.findOneAndUpdate(
    { userEmail, date },
    { $set: { tasksCompleted, focusMinutes, xpEarned, sessionsCount, intensity, streakDay: updates.streakDay || 0 } },
    { upsert: true, new: true }
  );
};

export const HeatmapContribution = mongoose.model('HeatmapContribution', heatmapContributionSchema);
export default HeatmapContribution;
