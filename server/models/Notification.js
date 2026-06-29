import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
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
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'coach' // 'coach', 'rescue', 'calendar', 'gamification'
  },
  read: {
    type: Boolean,
    default: false
  },
  contextAware: {
    type: Boolean,
    default: false
  },
  notifKey: {
    type: String,
    default: ''
  }
}, { timestamps: true });

notificationSchema.index({ userEmail: 1, id: 1 }, { unique: true });
notificationSchema.index({ userEmail: 1, notifKey: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
