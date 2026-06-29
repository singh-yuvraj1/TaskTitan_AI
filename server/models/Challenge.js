import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
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
    default: ''
  },
  xpReward: {
    type: Number,
    default: 50
  },
  progress: {
    type: Number,
    default: 0 // percentage 0 - 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'daily' // 'daily', 'weekly', 'epic'
  }
}, { timestamps: true });

challengeSchema.index({ userEmail: 1, id: 1 }, { unique: true });

export const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
