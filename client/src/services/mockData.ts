import { Task, Habit, AIAgent, DNAProfile, SkillNode, Challenge, LeaderboardUser, CalendarEvent } from '../types';

// Helper to offset current time
const offsetDate = (days: number, hours: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

// Helper for date string formatting (YYYY-MM-DD)
const getPastDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Implement DAA Dynamic Programming Assignment',
    description: 'Solve Knapsack and Longest Common Subsequence problems and measure runtime complexities.',
    deadline: offsetDate(0, 8), // 8 hours from now
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
    deadline: offsetDate(3),
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
    deadline: offsetDate(1, 2), // 26 hours from now
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
  },
  {
    id: 'task-4',
    title: 'Design TaskTitan-AI SQL & Schema Models',
    description: 'Draw database entity diagrams, outline state interfaces, and write down JSON schemas.',
    deadline: offsetDate(-1), // Due yesterday
    category: 'Backend',
    priority: 'Urgent-Important',
    estimatedHours: 3,
    completed: true,
    subtasks: [
      { id: 'sub-4-1', title: 'Draft schema draft', completed: true, estimatedMinutes: 90 },
      { id: 'sub-4-2', title: 'Review indexing priorities', completed: true, estimatedMinutes: 90 }
    ],
    failureProbability: 0,
    rescuePlanActive: false
  }
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'hab-1',
    name: 'Coding Focus',
    completedDates: [
      getPastDateStr(0),
      getPastDateStr(1),
      getPastDateStr(2),
      getPastDateStr(4),
      getPastDateStr(5),
      getPastDateStr(6),
      getPastDateStr(7),
      getPastDateStr(10),
      getPastDateStr(11),
      getPastDateStr(12),
      getPastDateStr(15),
      getPastDateStr(16),
      getPastDateStr(20),
      getPastDateStr(21),
    ],
    streak: 3
  },
  {
    id: 'hab-2',
    name: 'Meditation & Zen',
    completedDates: [
      getPastDateStr(0),
      getPastDateStr(2),
      getPastDateStr(5),
      getPastDateStr(6),
      getPastDateStr(10),
      getPastDateStr(15),
      getPastDateStr(22),
    ],
    streak: 1
  },
  {
    id: 'hab-3',
    name: 'Tech Reading',
    completedDates: [
      getPastDateStr(1),
      getPastDateStr(3),
      getPastDateStr(4),
      getPastDateStr(7),
      getPastDateStr(11),
      getPastDateStr(12),
    ],
    streak: 0
  },
  {
    id: 'hab-4',
    name: 'Physical Gym',
    completedDates: [
      getPastDateStr(1),
      getPastDateStr(3),
      getPastDateStr(5),
      getPastDateStr(8),
      getPastDateStr(12),
    ],
    streak: 0
  }
];

export const DEFAULT_DNA_PROFILE: DNAProfile = {
  type: 'Night Owl',
  description: 'Your peak productivity occurs between 9:00 PM and 2:00 AM. During these hours, your average deep focus duration reaches 74 minutes with minor context switching. However, tasks due early morning (8:00 AM - 12:00 PM) carry a 3.4x higher risk of delay.',
  focusScore: 82,
  consistencyScore: 78,
  successRate: 88,
  recommendations: [
    'Schedule complex algorithm solving blocks after 8:00 PM.',
    'Avoid committing to early-morning deliverables. Renegotiate or target completion the night before.',
    'Set a rigid 45-minute cool-down ritual post-coding to protect sleep quality.'
  ]
};

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'agent-planner',
    name: 'Planner Agent',
    role: 'Decomposes tasks and maps schedules',
    status: 'Active',
    avatar: '🎯',
    logs: [
      { timestamp: '14:20', agent: 'Planner', message: 'Decomposed "DAA Dynamic Programming" into 3 concrete milestones.', type: 'info' },
      { timestamp: '14:22', agent: 'Planner', message: 'Allocated 2-hour calendar block on June 25th for VPS configuration.', type: 'success' }
    ]
  },
  {
    id: 'agent-prioritizer',
    name: 'Prioritizer Agent',
    role: 'Evaluates urgency-importance indices',
    status: 'Optimizing',
    avatar: '⚖️',
    logs: [
      { timestamp: '15:02', agent: 'Prioritizer', message: 'Re-weighted "Refactor Context API". Upgraded priority to Urgent-Important.', type: 'warning' },
      { timestamp: '15:05', agent: 'Prioritizer', message: 'Completed weekly prioritization sweep. Workload distribution optimized.', type: 'success' }
    ]
  },
  {
    id: 'agent-rescue',
    name: 'Rescue Agent',
    role: 'Identifies high risk of deadline failure',
    status: 'Monitoring',
    avatar: '🚨',
    logs: [
      { timestamp: '15:10', agent: 'Rescue', message: 'Scanning upcoming deadlines. Identified "DAA Dynamic Programming" at high risk (84%).', type: 'danger' },
      { timestamp: '15:11', agent: 'Rescue', message: 'Constructed 4-step Rescue Plan for DAA Assignment. Standby for manual activation.', type: 'warning' }
    ]
  },
  {
    id: 'agent-coach',
    name: 'Coach Agent',
    role: 'Boosts discipline and checks habits',
    status: 'Supporting',
    avatar: '🧠',
    logs: [
      { timestamp: '09:00', agent: 'Coach', message: 'Morning check-in: Night Owl sleep cycle detected. Wake time offset by +45 mins.', type: 'info' },
      { timestamp: '12:00', agent: 'Coach', message: 'You have completed 2 active habits today! Keep it up for your streak.', type: 'success' }
    ]
  }
];

export const SKILL_TREE_NODES: SkillNode[] = [
  // DSA Tree
  { id: 'dsa-1', name: 'Arrays & Vectors', unlocked: true, xpCost: 0, category: 'DSA', bonusDesc: '+5% Task completion speed' },
  { id: 'dsa-2', name: 'Hashing & Strings', unlocked: true, xpCost: 100, category: 'DSA', parentId: 'dsa-1', bonusDesc: '+10% Focus score calibration' },
  { id: 'dsa-3', name: 'Linked Lists & Stacks', unlocked: false, xpCost: 200, category: 'DSA', parentId: 'dsa-2', bonusDesc: '+15 XP per algorithm solved' },
  { id: 'dsa-4', name: 'Trees & Heap', unlocked: false, xpCost: 350, category: 'DSA', parentId: 'dsa-3', bonusDesc: 'Unlocks "Recursion Guru" badge' },
  { id: 'dsa-5', name: 'Dynamic Programming', unlocked: false, xpCost: 500, category: 'DSA', parentId: 'dsa-4', bonusDesc: '-20% AI predicted task delay' },
  { id: 'dsa-6', name: 'Graph Traversals', unlocked: false, xpCost: 600, category: 'DSA', parentId: 'dsa-4', bonusDesc: '+5% Overall consistency rating' },

  // React Tree
  { id: 'react-1', name: 'JSX & Props', unlocked: true, xpCost: 0, category: 'React', bonusDesc: '+5% React task completion speed' },
  { id: 'react-2', name: 'State Hooks', unlocked: true, xpCost: 100, category: 'React', parentId: 'react-1', bonusDesc: '+50 XP limit buffer' },
  { id: 'react-3', name: 'React Router v6', unlocked: false, xpCost: 200, category: 'React', parentId: 'react-2', bonusDesc: 'Unlocks premium navbar theme' },
  { id: 'react-4', name: 'Context State', unlocked: false, xpCost: 300, category: 'React', parentId: 'react-3', bonusDesc: '+10% Focus session multiplier' },
  { id: 'react-5', name: 'Redux Toolkit (RTK)', unlocked: false, xpCost: 450, category: 'React', parentId: 'react-4', bonusDesc: '-15% estimated project failure risk' },

  // Placement Prep Tree
  { id: 'prep-1', name: 'Aptitude & Logical Reasoning', unlocked: false, xpCost: 100, category: 'Placement Prep', bonusDesc: '+5% Task completion confidence' },
  { id: 'prep-2', name: 'Data Structures & Algorithms', unlocked: false, xpCost: 200, category: 'Placement Prep', parentId: 'prep-1', bonusDesc: '+10% Focus session multiplier' },
  { id: 'prep-3', name: 'Database Management Systems (DBMS)', unlocked: false, xpCost: 300, category: 'Placement Prep', parentId: 'prep-2', bonusDesc: '+15 XP for backend tasks' },
  { id: 'prep-4', name: 'Operating Systems (OS)', unlocked: false, xpCost: 400, category: 'Placement Prep', parentId: 'prep-3', bonusDesc: '-10% AI predicted task delay' },
  { id: 'prep-5', name: 'Computer Networks (CN)', unlocked: false, xpCost: 500, category: 'Placement Prep', parentId: 'prep-4', bonusDesc: 'Unlocks "Network Master" badge' },
  { id: 'prep-6', name: 'Capstone Projects & System Design', unlocked: false, xpCost: 600, category: 'Placement Prep', parentId: 'prep-5', bonusDesc: '+20% Overall success probability' }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'ch-1', title: 'Pomodoro Beast', description: 'Complete 3 deep focus sessions in a single day.', xpReward: 50, progress: 66, completed: false, type: 'daily' },
  { id: 'ch-2', title: 'Rescue Champion', description: 'Prevent a deadline failure with Rescue Mode active.', xpReward: 100, progress: 0, completed: false, type: 'weekly' },
  { id: 'ch-3', title: 'Consistency Overlord', description: 'Maintain a 7-day habits completion streak.', xpReward: 200, progress: 42, completed: false, type: 'epic' },
  { id: 'ch-4', title: 'Leetcode Conqueror', description: 'Unlock the Dynamic Programming node in the skill tree.', xpReward: 150, progress: 0, completed: false, type: 'weekly' }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  // Global
  { id: 'lb-1', name: 'Arjun Sharma', rank: 1, xp: 4850, streak: 32, avatar: '👤', university: 'IIT Delhi', group: 'global' },
  { id: 'lb-2', name: 'CodeNinja_404', rank: 2, xp: 4210, streak: 21, avatar: '👤', university: 'DTU', group: 'global' },
  { id: 'lb-3', name: 'Priya Patel', rank: 3, xp: 3980, streak: 14, avatar: '👤', university: 'BITS Pilani', group: 'global' },
  { id: 'lb-u', name: 'You (Ninja)', rank: 12, xp: 1250, streak: 3, avatar: '🥷', university: 'NSUT', group: 'global' },
  
  // Friends
  { id: 'lb-f1', name: 'Rohan Gupta', rank: 1, xp: 2100, streak: 12, avatar: '👤', group: 'friends' },
  { id: 'lb-f2', name: 'Sneha Rao', rank: 2, xp: 1850, streak: 8, avatar: '👤', group: 'friends' },
  { id: 'lb-u-f', name: 'You (Ninja)', rank: 3, xp: 1250, streak: 3, avatar: '🥷', group: 'friends' },
  { id: 'lb-f3', name: 'Kabir Dev', rank: 4, xp: 950, streak: 0, avatar: '👤', group: 'friends' },

  // University
  { id: 'lb-u1', name: 'Aditya Sen', rank: 1, xp: 3200, streak: 18, avatar: '👤', university: 'NSUT', group: 'university' },
  { id: 'lb-u2', name: 'Divya Mehta', rank: 2, xp: 2600, streak: 10, avatar: '👤', university: 'NSUT', group: 'university' },
  { id: 'lb-u-u', name: 'You (Ninja)', rank: 6, xp: 1250, streak: 3, avatar: '🥷', university: 'NSUT', group: 'university' }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Focus: DAA DP Setup',
    start: offsetDate(0, 1),
    end: offsetDate(0, 2),
    taskId: 'task-1',
    isAiScheduled: true
  },
  {
    id: 'cal-2',
    title: 'Focus: Space optimized LCS',
    start: offsetDate(0, 4),
    end: offsetDate(0, 5.5),
    taskId: 'task-1',
    isAiScheduled: true
  },
  {
    id: 'cal-3',
    title: 'Daily Check-in with Coach Agent',
    start: offsetDate(0, -2),
    end: offsetDate(0, -1.5),
    isAiScheduled: false
  },
  {
    id: 'cal-4',
    title: 'Deep Work: RTK migrations',
    start: offsetDate(1, 4),
    end: offsetDate(1, 6),
    taskId: 'task-3',
    isAiScheduled: true
  }
];

export const INITIAL_ACTIVITY_HISTORY: Record<string, { xpEarned: number; focusHours: number; tasksCompleted: number }> = {
  [getPastDateStr(14)]: { xpEarned: 45, focusHours: 1.5, tasksCompleted: 1 },
  [getPastDateStr(13)]: { xpEarned: 30, focusHours: 1.0, tasksCompleted: 0 },
  [getPastDateStr(12)]: { xpEarned: 60, focusHours: 2.0, tasksCompleted: 1 },
  [getPastDateStr(11)]: { xpEarned: 95, focusHours: 3.0, tasksCompleted: 2 },
  [getPastDateStr(10)]: { xpEarned: 40, focusHours: 1.5, tasksCompleted: 0 },
  [getPastDateStr(9)]: { xpEarned: 120, focusHours: 4.0, tasksCompleted: 2 },
  [getPastDateStr(8)]: { xpEarned: 50, focusHours: 1.5, tasksCompleted: 1 },
  [getPastDateStr(7)]: { xpEarned: 80, focusHours: 2.5, tasksCompleted: 1 },
  [getPastDateStr(6)]: { xpEarned: 150, focusHours: 4.0, tasksCompleted: 2 },
  [getPastDateStr(5)]: { xpEarned: 30, focusHours: 1.5, tasksCompleted: 0 },
  [getPastDateStr(4)]: { xpEarned: 220, focusHours: 5.5, tasksCompleted: 3 },
  [getPastDateStr(3)]: { xpEarned: 90, focusHours: 3.0, tasksCompleted: 1 },
  [getPastDateStr(2)]: { xpEarned: 300, focusHours: 6.0, tasksCompleted: 4 },
  [getPastDateStr(1)]: { xpEarned: 110, focusHours: 2.0, tasksCompleted: 1 },
  [getPastDateStr(0)]: { xpEarned: 65, focusHours: 1.0, tasksCompleted: 0 },
};

