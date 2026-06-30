import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import Challenge from '../models/Challenge.js';
import SkillNode from '../models/SkillNode.js';
import CalendarEvent from '../models/CalendarEvent.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import HeatmapContribution from '../src/models/HeatmapContribution.js';

// Default mock templates
const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Implement DAA Dynamic Programming Assignment',
    description: 'Solve Knapsack and Longest Common Subsequence problems and measure runtime complexities.',
    category: 'DSA',
    priority: 'Urgent-Important',
    estimatedHours: 4,
    completed: false,
    subtasks: [
      { id: 'sub-1-1', title: 'Write standard knapsack matrix logic', completed: true, estimatedMinutes: 60 },
      { id: 'sub-1-2', title: 'Implement space optimized LCS solver', completed: false, estimatedMinutes: 90 },
      { id: 'sub-1-3', title: 'Write runtime benchmarking scripts', completed: false, estimatedMinutes: 90 }
    ],
    failureProbability: 84,
    failureReason: 'Due in 8 hours with 3 hours of active work remaining. Previous submission logs show a delay of 2.1 hours on algorithm tasks.',
    suggestedAction: 'Activate Deadline Rescue Mode. Start subtask "Space optimized LCS" within 30 minutes to ensure a 94% submission rate.',
    rescuePlanActive: false,
    rescueTimeline: [
      { id: 'rc-1', label: 'DP Setup & Input Parsing', durationMinutes: 30, completed: false, sequence: 1 },
      { id: 'rc-2', label: 'LCS Optimized Implementation', durationMinutes: 90, completed: false, sequence: 2 },
      { id: 'rc-3', label: 'Complexity Analysis Graphs', durationMinutes: 60, completed: false, sequence: 3 },
      { id: 'rc-4', label: 'Submission Verification', durationMinutes: 20, completed: false, sequence: 4 }
    ]
  },
  {
    id: 'task-2',
    title: 'Deploy Vite Production Bundle & Setup SSL',
    description: 'Build portfolio, bundle assets, set up Nginx reverse proxy, and secure with Let\'s Encrypt SSL certificates.',
    category: 'React',
    priority: 'NotUrgent-Important',
    estimatedHours: 5,
    completed: false,
    subtasks: [
      { id: 'sub-2-1', title: 'Configure Vite production targets', completed: true, estimatedMinutes: 45 },
      { id: 'sub-2-2', title: 'Setup Nginx routing on VPS', completed: false, estimatedMinutes: 120 },
      { id: 'sub-2-3', title: 'Issue Let\'s Encrypt SSL Certs', completed: false, estimatedMinutes: 60 }
    ],
    failureProbability: 15,
    failureReason: 'Healthy progress. Time cushion is 72 hours against 3 hours remaining.',
    suggestedAction: 'Stick to the standard calendar block scheduled for tomorrow morning.',
    rescuePlanActive: false
  },
  {
    id: 'task-3',
    title: 'Refactor Context API to Redux Toolkit',
    description: 'Migrate global theme and user state controllers to RTK slices for optimized state performance.',
    category: 'React',
    priority: 'Urgent-Important',
    estimatedHours: 6,
    completed: false,
    subtasks: [
      { id: 'sub-3-1', title: 'Install Redux Toolkit & React-Redux', completed: false, estimatedMinutes: 30 },
      { id: 'sub-3-2', title: 'Define Auth and Theme slices', completed: false, estimatedMinutes: 120 },
      { id: 'sub-3-3', title: 'Refactor root provider wrappers', completed: false, estimatedMinutes: 90 }
    ],
    failureProbability: 68,
    failureReason: 'Based on sleep cycles and previous night-owl patterns, you typically complete only 1.5 hours of refactoring coding blocks per day.',
    suggestedAction: 'Allocate two deep work pomodoro blocks today. Coach Agent recommends taking a brief walk before starting.',
    rescuePlanActive: false
  }
];

const DEFAULT_HABITS = [
  { id: 'hab-1', name: 'Coding Focus', completedDates: [], streak: 3 },
  { id: 'hab-2', name: 'Meditation & Zen', completedDates: [], streak: 1 },
  { id: 'hab-3', name: 'Tech Reading', completedDates: [], streak: 0 },
  { id: 'hab-4', name: 'Physical Gym', completedDates: [], streak: 0 }
];

const DEFAULT_CHALLENGES = [
  { id: 'ch-1', title: 'Pomodoro Beast', description: 'Complete 3 deep focus sessions in a single day.', xpReward: 50, progress: 66, completed: false, type: 'daily' },
  { id: 'ch-2', title: 'Rescue Champion', description: 'Prevent a deadline failure with Rescue Mode active.', xpReward: 100, progress: 0, completed: false, type: 'weekly' },
  { id: 'ch-3', title: 'Consistency Overlord', description: 'Maintain a 7-day habits completion streak.', xpReward: 200, progress: 42, completed: false, type: 'epic' },
  { id: 'ch-4', title: 'Leetcode Conqueror', description: 'Unlock the Dynamic Programming node in the skill tree.', xpReward: 150, progress: 0, completed: false, type: 'weekly' }
];

const DEFAULT_SKILLS = [
  { id: 'dsa-1', name: 'Arrays & Vectors', unlocked: true, xpCost: 0, category: 'DSA', bonusDesc: '+5% Task completion speed' },
  { id: 'dsa-2', name: 'Hashing & Strings', unlocked: true, xpCost: 100, category: 'DSA', parentId: 'dsa-1', bonusDesc: '+10% Focus score calibration' },
  { id: 'dsa-3', name: 'Linked Lists & Stacks', unlocked: false, xpCost: 200, category: 'DSA', parentId: 'dsa-2', bonusDesc: '+15 XP per algorithm solved' },
  { id: 'dsa-4', name: 'Trees & Heap', unlocked: false, xpCost: 350, category: 'DSA', parentId: 'dsa-3', bonusDesc: 'Unlocks "Recursion Guru" badge' },
  { id: 'dsa-5', name: 'Dynamic Programming', unlocked: false, xpCost: 500, category: 'DSA', parentId: 'dsa-4', bonusDesc: '-20% AI predicted task delay' },
  { id: 'dsa-6', name: 'Graph Traversals', unlocked: false, xpCost: 600, category: 'DSA', parentId: 'dsa-4', bonusDesc: '+5% Overall consistency rating' },
  
  { id: 'react-1', name: 'JSX & Props', unlocked: true, xpCost: 0, category: 'React', bonusDesc: '+5% React task completion speed' },
  { id: 'react-2', name: 'State Hooks', unlocked: true, xpCost: 100, category: 'React', parentId: 'react-1', bonusDesc: '+50 XP limit buffer' },
  { id: 'react-3', name: 'React Router v6', unlocked: false, xpCost: 200, category: 'React', parentId: 'react-2', bonusDesc: 'Unlocks premium navbar theme' },
  { id: 'react-4', name: 'Context State', unlocked: false, xpCost: 300, category: 'React', parentId: 'react-3', bonusDesc: '+10% Focus session multiplier' },
  { id: 'react-5', name: 'Redux Toolkit (RTK)', unlocked: false, xpCost: 450, category: 'React', parentId: 'react-4', bonusDesc: '-15% estimated project failure risk' },

  { id: 'prep-1', name: 'Aptitude & Logical Reasoning', unlocked: false, xpCost: 100, category: 'Placement Prep', bonusDesc: '+5% Task completion confidence' },
  { id: 'prep-2', name: 'Data Structures & Algorithms', unlocked: false, xpCost: 200, category: 'Placement Prep', parentId: 'prep-1', bonusDesc: '+10% Focus session multiplier' },
  { id: 'prep-3', name: 'Database Management Systems (DBMS)', unlocked: false, xpCost: 300, category: 'Placement Prep', parentId: 'prep-2', bonusDesc: '+15 XP for backend tasks' },
  { id: 'prep-4', name: 'Operating Systems (OS)', unlocked: false, xpCost: 400, category: 'Placement Prep', parentId: 'prep-3', bonusDesc: '-10% AI predicted task delay' },
  { id: 'prep-5', name: 'Computer Networks (CN)', unlocked: false, xpCost: 500, category: 'Placement Prep', parentId: 'prep-4', bonusDesc: 'Unlocks "Network Master" badge' },
  { id: 'prep-6', name: 'Capstone Projects & System Design', unlocked: false, xpCost: 600, category: 'Placement Prep', parentId: 'prep-5', bonusDesc: '+20% Overall success probability' }
];

export const seedUserData = async (email) => {
  const userEmail = email.toLowerCase().trim();
  const now = Date.now();

  // Helper date offset
  const offsetDate = (days, hours = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  };

  // Helper YYYY-MM-DD
  const getPastDateStr = (offsetDays) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  // Seed tasks
  const seededTasks = DEFAULT_TASKS.map((t, idx) => {
    let deadline = offsetDate(3); // default
    if (idx === 0) deadline = offsetDate(0, 8); // 8 hours
    else if (idx === 2) deadline = offsetDate(1, 2); // 26 hours
    return { ...t, userEmail, deadline };
  });
  await Task.insertMany(seededTasks);

  // Seed habits
  // Let's prefill habit completed dates to keep streaks looking active!
  const seededHabits = DEFAULT_HABITS.map(h => {
    let completedDates = [];
    if (h.id === 'hab-1') {
      completedDates = [0, 1, 2, 4, 5, 6, 7, 10, 11, 12, 15, 16, 20, 21].map(d => getPastDateStr(d));
    } else if (h.id === 'hab-2') {
      completedDates = [0, 2, 5, 6, 10, 15, 22].map(d => getPastDateStr(d));
    } else if (h.id === 'hab-3') {
      completedDates = [1, 3, 4, 7, 11, 12].map(d => getPastDateStr(d));
    } else if (h.id === 'hab-4') {
      completedDates = [1, 3, 5, 8, 12].map(d => getPastDateStr(d));
    }
    return { ...h, userEmail, completedDates };
  });
  await Habit.insertMany(seededHabits);

  // Seed challenges
  await Challenge.insertMany(DEFAULT_CHALLENGES.map(c => ({ ...c, userEmail })));

  // Seed skills
  await SkillNode.insertMany(DEFAULT_SKILLS.map(s => ({ ...s, userEmail })));

  // Seed calendar events
  const seededCalendar = [
    { id: 'cal-1', title: 'Focus: DAA DP Setup', start: offsetDate(0, 1), end: offsetDate(0, 2), taskId: 'task-1', isAiScheduled: true },
    { id: 'cal-2', title: 'Focus: Space optimized LCS', start: offsetDate(0, 4), end: offsetDate(0, 5.5), taskId: 'task-1', isAiScheduled: true },
    { id: 'cal-3', title: 'Daily Check-in with Coach Agent', start: offsetDate(0, -2), end: offsetDate(0, -1.5), isAiScheduled: false },
    { id: 'cal-4', title: 'Deep Work: RTK migrations', start: offsetDate(1, 4), end: offsetDate(1, 6), taskId: 'task-3', isAiScheduled: true }
  ].map(e => ({ ...e, userEmail }));
  await CalendarEvent.insertMany(seededCalendar);

  // Seed notifications
  const seededNotifs = [
    {
      id: 'notif-1',
      title: 'High Risk Deadline Alert',
      message: 'Your assignment "DAA Dynamic Programming" is due in 8 hours. Based on previous trends, starting now increases your success probability by 73%.',
      timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'rescue',
      read: false,
      contextAware: true
    }
  ].map(n => ({ ...n, userEmail }));
  await Notification.insertMany(seededNotifs);

  // Seed 14 days activity logs
  const seededLogs = [];
  for (let i = 14; i >= 0; i--) {
    seededLogs.push({
      userEmail,
      date: getPastDateStr(i),
      xpEarned: Math.round(30 + Math.random() * 150),
      focusHours: Number((1 + Math.random() * 4).toFixed(1)),
      tasksCompleted: Math.random() > 0.5 ? 1 : 0
    });
  }
  await ActivityLog.insertMany(seededLogs);

  // Seed 14 days of HeatmapContribution data for initial contribution grid population
  const heatmapSeeds = [];
  for (let i = 14; i >= 0; i--) {
    const xpVal = Math.round(30 + Math.random() * 150);
    const focusMin = Math.round((1 + Math.random() * 3.5) * 60);
    const tasksDone = Math.random() > 0.5 ? 1 : 0;
    const score = (tasksDone * 30) + (focusMin * 0.5) + (xpVal * 0.2);
    let intensity = 0;
    if (score > 0 && score < 30) intensity = 1;
    else if (score < 80) intensity = 2;
    else if (score < 150) intensity = 3;
    else intensity = 4;

    heatmapSeeds.push({
      userEmail,
      date: getPastDateStr(i),
      xpEarned: xpVal,
      focusMinutes: focusMin,
      tasksCompleted: tasksDone,
      sessionsCount: Math.random() > 0.4 ? 1 : 0,
      intensity
    });
  }

  try {
    await HeatmapContribution.insertMany(heatmapSeeds, { ordered: false });
  } catch (dupErr) {
    // Ignore duplicate key errors from re-seeds
  }
};
