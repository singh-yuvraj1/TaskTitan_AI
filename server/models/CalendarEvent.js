import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
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
  start: {
    type: String,
    required: true
  },
  end: {
    type: String,
    required: true
  },
  taskId: {
    type: String,
    default: ''
  },
  isAiScheduled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

calendarEventSchema.index({ userEmail: 1, id: 1 }, { unique: true });

export const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
