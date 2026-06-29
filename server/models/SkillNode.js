import mongoose from 'mongoose';

const skillNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  unlocked: {
    type: Boolean,
    default: false
  },
  xpCost: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    default: ''
  },
  bonusDesc: {
    type: String,
    default: ''
  }
}, { timestamps: true });

skillNodeSchema.index({ userEmail: 1, id: 1 }, { unique: true });

export const SkillNode = mongoose.model('SkillNode', skillNodeSchema);
export default SkillNode;
