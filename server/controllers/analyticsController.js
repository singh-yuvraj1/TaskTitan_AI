import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import CalendarEvent from '../models/CalendarEvent.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    // 1. Fetch User data
    const tasks = await Task.find({ userEmail });
    const activityLogs = await ActivityLog.find({ userEmail }).sort({ date: 1 });
    const calendarEvents = await CalendarEvent.find({ userEmail });

    // 2. Compute Completion Rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 100;

    // 3. Average Focus Time
    let averageFocusTime = 0;
    if (activityLogs.length > 0) {
      const totalFocus = activityLogs.reduce((acc, log) => acc + (log.focusHours || 0), 0);
      averageFocusTime = Number((totalFocus / activityLogs.length).toFixed(1));
    }

    // 4. Weekly Productivity Score
    // Formula: combination of completion rate, streak, and focus hours
    const streak = req.user.streak || 0;
    const weeklyProductivityScore = Math.min(100, Math.round(40 + (streak * 10) + completionRate * 0.4));

    // 5. Deadline Success Rate
    // Compare updatedAt (approx completion time) and deadline
    let deadlineSuccessRate = 100;
    if (completedTasks.length > 0) {
      const onTimeTasks = completedTasks.filter(t => {
        const deadlineDate = new Date(t.deadline);
        const completionDate = new Date(t.updatedAt);
        return completionDate <= deadlineDate;
      });
      deadlineSuccessRate = Math.round((onTimeTasks.length / completedTasks.length) * 100);
    }

    // 6. Best Study Hours
    // Look at CalendarEvent start hours
    let bestStudyHours = "6:00 PM - 9:00 PM";
    if (calendarEvents.length > 0) {
      const hourCounts = {};
      calendarEvents.forEach(e => {
        if (e.start) {
          const hour = new Date(e.start).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });
      
      let bestHour = -1;
      let maxCount = -1;
      Object.keys(hourCounts).forEach(h => {
        if (hourCounts[h] > maxCount) {
          maxCount = hourCounts[h];
          bestHour = parseInt(h, 10);
        }
      });

      if (bestHour !== -1) {
        const startAmPm = bestHour >= 12 ? 'PM' : 'AM';
        const startFormatted = bestHour % 12 === 0 ? 12 : bestHour % 12;
        const endHour = (bestHour + 3) % 24;
        const endAmPm = endHour >= 12 ? 'PM' : 'AM';
        const endFormatted = endHour % 12 === 0 ? 12 : endHour % 12;
        bestStudyHours = `${startFormatted}:00 ${startAmPm} - ${endFormatted}:00 ${endAmPm}`;
      }
    }

    // 7. Most Productive Day
    // Group ActivityLogs by day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayXpSums = Array(7).fill(0);
    activityLogs.forEach(log => {
      if (log.date) {
        const dayIndex = new Date(log.date).getDay();
        dayXpSums[dayIndex] += (log.xpEarned || 0);
      }
    });

    let bestDayIndex = 2; // Default to Tuesday
    let maxDayXp = -1;
    dayXpSums.forEach((sum, idx) => {
      if (sum > maxDayXp) {
        maxDayXp = sum;
        bestDayIndex = idx;
      }
    });
    const mostProductiveDay = dayNames[bestDayIndex];

    // 8. Burnout Risk
    let burnoutRisk = 'Low';
    const pendingUrgentCount = tasks.filter(t => !t.completed && t.priority === 'Urgent-Important').length;
    if (pendingUrgentCount >= 3) {
      burnoutRisk = 'High';
    } else if (pendingUrgentCount >= 1 || tasks.filter(t => !t.completed).length > 5) {
      burnoutRisk = 'Medium';
    }

    // 9. Completion Trends (past 14 days)
    const completionTrends = activityLogs.slice(-14).map(log => ({
      date: log.date,
      xpEarned: log.xpEarned,
      focusHours: log.focusHours,
      tasksCompleted: log.tasksCompleted
    }));

    res.status(200).json({
      success: true,
      message: 'Analytics data calculated successfully.',
      data: {
        completionRate,
        averageFocusTime,
        weeklyProductivityScore,
        deadlineSuccessRate,
        bestStudyHours,
        mostProductiveDay,
        burnoutRisk,
        completionTrends
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
