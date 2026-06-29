import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
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
  completedDates: {
    type: [String],
    default: []
  },
  streak: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

habitSchema.index({ userEmail: 1, id: 1 }, { unique: true });

export const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
