export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes: number;
}

export type TaskCategory = 'DSA' | 'React' | 'WebDev' | 'Backend' | 'System Design' | 'General';
export type TaskPriority = 'Urgent-Important' | 'NotUrgent-Important' | 'Urgent-NotImportant' | 'NotUrgent-NotImportant';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  category: TaskCategory;
  priority: TaskPriority;
  estimatedHours: number;
  completed: boolean;
  subtasks: SubTask[];
  failureProbability: number; // 0 to 100
  failureReason?: string;
  suggestedAction?: string;
  rescuePlanActive: boolean;
  rescueTimeline?: RescueTimelineStep[];
  progress?: number; // 0 to 100
  notes?: string;
  riskScore?: number;
  recoveryPlan?: string[];
  completionForecast?: string;
}

export interface RescueTimelineStep {
  id: string;
  label: string;
  durationMinutes: number;
  completed: boolean;
  sequence: number;
}

export interface Habit {
  id: string;
  name: string; // e.g. Coding, Gym, Reading, Learning, Meditation
  completedDates: string[]; // ['YYYY-MM-DD']
  streak: number;
}

export type AgentStatus = 'Active' | 'Optimizing' | 'Monitoring' | 'Supporting' | 'Idle';

export interface AgentLog {
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  avatar: string;
  logs: AgentLog[];
}

export interface DNAProfile {
  type: 'Early Bird' | 'Night Owl' | 'Deep Worker' | 'Procrastinator' | 'Sprint Worker';
  description: string;
  focusScore: number;
  consistencyScore: number;
  successRate: number;
  recommendations: string[];
}

export interface SkillNode {
  id: string;
  name: string;
  unlocked: boolean;
  xpCost: number;
  category: 'DSA' | 'React' | 'Placement Prep';
  parentId?: string; // For visual hierarchical structure
  bonusDesc: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number; // 0 to 100
  completed: boolean;
  type: 'daily' | 'weekly' | 'epic';
}

export interface LeaderboardUser {
  id: string;
  name: string;
  rank: number;
  xp: number;
  streak: number;
  avatar: string;
  university?: string;
  group: 'global' | 'friends' | 'university';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'rescue' | 'coach' | 'gamification' | 'calendar';
  read: boolean;
  contextAware?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO String
  end: string;   // ISO String
  taskId?: string;
  isAiScheduled: boolean;
}

export interface ActivityHistoryEntry {
  xpEarned: number;
  focusHours: number;
  tasksCompleted: number;
}

export interface AnalyticsData {
  completionRate: number;
  averageFocusTime: number;
  weeklyProductivityScore: number;
  deadlineSuccessRate: number;
  bestStudyHours: string;
  mostProductiveDay: string;
  burnoutRisk: string;
  completionTrends: any[];
}

