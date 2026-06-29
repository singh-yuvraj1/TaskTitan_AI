import { generateRescueTimeline } from './geminiService.js';
import CalendarEvent from '../models/CalendarEvent.js';
import Notification from '../models/Notification.js';

// Calculate task risk dynamically based on parameters
export const calculateTaskRiskScore = (task, focusHours = 14.5, streak = 3) => {
  if (task.completed) return 0;

  const deadlineDate = new Date(task.deadline);
  const diffMs = deadlineDate.getTime() - Date.now();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 100; // Past due

  const totalSubs = task.subtasks ? task.subtasks.length : 0;
  const completedSubs = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const subtaskProgress = totalSubs > 0 ? (completedSubs / totalSubs) : 0;

  // Time pressure (up to 55 points)
  const timePressure = diffDays <= 1 ? 55 : diffDays <= 3 ? 35 : diffDays <= 5 ? 20 : 10;

  // Completion gap (up to 45 points)
  const workGap = (1 - subtaskProgress) * 45;

  // User activity calibration discount (up to -25 points)
  const userFactor = Math.max(-25, -(focusHours * 0.4 + streak * 0.6));

  const finalScore = Math.max(5, Math.min(100, Math.round(timePressure + workGap + userFactor)));
  return finalScore;
};

// Generates dynamic rescue recommendations and schedules focus blocks in MongoDB
export const triggerRescueEngine = async (task, user, customKey = '') => {
  const userEmail = user.email.toLowerCase().trim();
  const hoursRemaining = Math.max(0.5, (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60));

  // Determine recovery tasks
  const recoveryPlan = [
    `Decompose ${task.title} into 3 primary sub-milestones immediately.`,
    `Lock first focus block in next 2 hours to start work.`,
    `Deliver core subtask components (aim for 50% progress before evening).`,
    `Verify routing, deployment, and checklist details.`
  ];

  // Forecast time: 3 hours prior to deadline
  const forecastTime = new Date(task.deadline);
  forecastTime.setHours(forecastTime.getHours() - 3);
  const completionForecast = `Safe delivery forecast: ${forecastTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (3h before deadline)`;

  // Generate dynamic rescue steps timeline (either via Gemini or heuristic)
  const timeline = await generateRescueTimeline(task.title, hoursRemaining, customKey || user.geminiApiKey);

  // Generate two emergency calendar focus blocks
  const start1 = new Date();
  start1.setHours(start1.getHours() + 1); // 1 hour from now
  const end1 = new Date(start1);
  end1.setHours(end1.getHours() + 2); // 2 hours focus block

  const start2 = new Date();
  start2.setDate(start2.getDate() + 1); // tomorrow
  start2.setHours(10, 0, 0, 0); // 10:00 AM
  const end2 = new Date(start2);
  end2.setHours(end2.getHours() + 3); // 3 hours focus block

  const block1 = {
    id: `cal-rescue-1-${Date.now()}`,
    userEmail,
    title: `🚨 Emergency Focus: ${task.title} Sprint`,
    start: start1.toISOString(),
    end: end1.toISOString(),
    taskId: task.id,
    isAiScheduled: true
  };

  const block2 = {
    id: `cal-rescue-2-${Date.now()}`,
    userEmail,
    title: `🚨 Emergency Focus: ${task.title} Review`,
    start: start2.toISOString(),
    end: end2.toISOString(),
    taskId: task.id,
    isAiScheduled: true
  };

  // Persist focus blocks to database
  await CalendarEvent.create(block1);
  await CalendarEvent.create(block2);

  // Create notifications
  await Notification.create({
    id: `notif-rescue-${Date.now()}`,
    userEmail,
    title: '🚨 Rescue Mode Activated',
    message: `Emergency recovery plan constructed for "${task.title}". Calendar focus blocks locked.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'rescue',
    read: false,
    contextAware: true
  });

  return {
    rescueTimeline: timeline,
    recoveryPlan,
    completionForecast,
    riskScore: Math.round(task.failureProbability * 0.5),
    failureProbability: Math.round(task.failureProbability * 0.5)
  };
};
