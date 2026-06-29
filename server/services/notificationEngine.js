import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

export const checkDeadlineNotifications = async (userEmail) => {
  const email = userEmail.toLowerCase().trim();
  
  try {
    const tasks = await Task.find({ userEmail: email, completed: false });
    const now = new Date();

    for (const task of tasks) {
      if (!task.deadline) continue;
      
      const deadlineDate = new Date(task.deadline);
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 0) {
        // Task is overdue
        const notifKey = `${email}-task-${task.id}-overdue`;
        const exists = await Notification.findOne({ userEmail: email, notifKey });
        
        if (!exists) {
          await Notification.create({
            id: `notif-overdue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userEmail: email,
            title: 'Task Overdue! 🚨',
            message: `Task "${task.title}" is overdue! Please reschedule it or mark it complete.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'rescue',
            read: false,
            contextAware: true,
            notifKey
          });
        }
      } else if (diffHours < 24) {
        // Due within 24 hours
        const notifKey = `${email}-task-${task.id}-approaching`;
        const exists = await Notification.findOne({ userEmail: email, notifKey });

        if (!exists) {
          await Notification.create({
            id: `notif-approach-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userEmail: email,
            title: 'Deadline Approaching! ⚠️',
            message: `Task "${task.title}" is due in less than 24 hours. Start work or reschedule.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'rescue',
            read: false,
            contextAware: true,
            notifKey
          });
        }
      }
    }
  } catch (error) {
    console.error('[NOTIFICATION ENGINE ERROR]:', error.message);
  }
};
