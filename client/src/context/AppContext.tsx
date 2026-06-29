import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Task, SubTask, Habit, AIAgent, DNAProfile, SkillNode, 
  Challenge, LeaderboardUser, CalendarEvent, Notification, AgentLog, TaskCategory,
  ActivityHistoryEntry, AnalyticsData
} from '../types';
import { 
  INITIAL_AGENTS, DEFAULT_DNA_PROFILE, INITIAL_LEADERBOARD
} from '../services/mockData';

const API_BASE = 'http://localhost:5000/api';

// Local heuristics utility for offline task parsing fallbacks
const calculateLocalHeuristics = (title: string, desc: string, deadlineStr: string) => {
  const t = (title || '').toLowerCase() + ' ' + (desc || '').toLowerCase();
  let category: TaskCategory = 'General';
  if (t.includes('dsa') || t.includes('array') || t.includes('tree') || t.includes('graph') || t.includes('leetcode') || t.includes('sort')) {
    category = 'DSA';
  } else if (t.includes('react') || t.includes('component') || t.includes('hook') || t.includes('context')) {
    category = 'React';
  }

  const diffMs = new Date(deadlineStr).getTime() - Date.now();
  const diffHours = Math.max(0.1, diffMs / (1000 * 60 * 60));

  let priority: Task['priority'] = 'NotUrgent-Important';
  if (diffHours < 24) priority = 'Urgent-Important';

  let failureProbability = 15;
  let failureReason = 'Progress looks stable.';
  let suggestedAction = 'Start with standard Pomodoro blocks.';

  if (diffHours < 12) {
    failureProbability = 82;
    failureReason = `Task due in only ${diffHours.toFixed(1)} hours.`;
    suggestedAction = 'Trigger Rescue Mode!';
  }

  return { category, priority, failureProbability, failureReason, suggestedAction };
};

export const calculateTaskRisk = (task: Task, focusHours: number, streak: number) => {
  if (task.completed) return 0;
  
  const deadlineDate = new Date(task.deadline);
  const diffMs = deadlineDate.getTime() - Date.now();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays < 0) return 100;
  
  const totalSubs = task.subtasks.length;
  const completedSubs = task.subtasks.filter(s => s.completed).length;
  const subtaskProgress = totalSubs > 0 ? (completedSubs / totalSubs) : (task.progress !== undefined ? task.progress / 100 : 0);
  
  const timePressure = diffDays <= 1 ? 55 : diffDays <= 3 ? 35 : diffDays <= 5 ? 20 : 10;
  const workGap = (1 - subtaskProgress) * 45;
  const userFactor = Math.max(-25, -(focusHours * 0.4 + streak * 0.6));
  
  return Math.max(5, Math.min(100, Math.round(timePressure + workGap + userFactor)));
};

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, password?: string, name?: string) => Promise<boolean>;
  logout: () => void;
  userEmail: string;
  userName: string;

  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;

  xp: number;
  level: number;
  rank: string;
  streak: number;
  badges: string[];
  leaderboard: LeaderboardUser[];
  addXp: (amount: number, reason: string) => void;

  focusScore: number;
  consistencyScore: number;
  focusHours: number;
  burnoutRisk: 'Low' | 'Medium' | 'High';
  setFocusHours: React.Dispatch<React.SetStateAction<number>>;

  tasks: Task[];
  habits: Habit[];
  agents: AIAgent[];
  skills: SkillNode[];
  challenges: Challenge[];
  calendarEvents: CalendarEvent[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  dnaProfile: DNAProfile;
  activityHistory: Record<string, ActivityHistoryEntry>;
  analytics: AnalyticsData | null;
  fetchAnalytics: () => Promise<void>;

  addTask: (title: string, description: string, deadline: string) => Promise<void>;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  completeTask: (taskId: string) => void;
  activateRescueMode: (taskId: string) => Promise<void>;
  toggleRescueStep: (taskId: string, stepId: string) => void;
  toggleHabit: (habitId: string) => void;
  unlockSkill: (skillId: string) => void;
  triggerAIReschedule: () => void;
  deleteCalendarEvent: (id: string) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  addNotification: (title: string, message: string, type: Notification['type'], contextAware?: boolean) => void;
  markNotificationsAsRead: () => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  runAICommand: (command: string) => Promise<string>;

  // Loading State
  isLoading: boolean;

  // Toast System
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Command Palette & Onboarding States
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (val: boolean) => void;
  isOnboardingOpen: boolean;
  setOnboardingOpen: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Overlay States
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('cn_theme') as 'dark' | 'light';
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('cn_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      await fetch(`${API_BASE}/user/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: nextTheme }),
        credentials: 'include'
      });
      showToast(`Theme switched to ${nextTheme} mode`, 'success');
    } catch (e) {
      console.warn('Failed to sync theme settings to server:', e);
    }
  };

  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [focusHours, setFocusHoursState] = useState<number>(0);
  const [badges, setBadges] = useState<string[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityHistory, setActivityHistory] = useState<Record<string, ActivityHistoryEntry>>({});
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [dnaProfile] = useState<DNAProfile>(DEFAULT_DNA_PROFILE);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics`, {
        credentials: 'include'
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setAnalytics(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch analytics from server:', e);
    }
  };
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);

  // Sync state from server using secure cookie credentials
  const fetchUserState = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/user/state`, {
        credentials: 'include'
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const { progress, tasks: tList, habits: hList, skills: sList, challenges: cList, calendarEvents: eList, notifications: nList, activityHistory: history } = json.data;
          
          if (progress) {
            setXp(progress.xp);
            setStreak(progress.streak);
            setFocusHoursState(progress.focusHours);
            setBadges(progress.badges);
            setGeminiApiKeyState(progress.geminiApiKey || '');
            if (progress.name) setUserName(progress.name);
          }
          if (tList) setTasks(tList);
          if (hList) setHabits(hList);
          if (sList) setSkills(sList);
          if (cList) setChallenges(cList);
          if (eList) setCalendarEvents(eList);
          if (nList) setNotifications(nList);
          // Fetch dedicated heatmap data (365 days) for the full activity history
          try {
            const heatmapRes = await fetch(`${API_BASE}/user/heatmap?days=365`, { credentials: 'include' });
            if (heatmapRes.ok) {
              const heatmapJson = await heatmapRes.json();
              if (heatmapJson.success && heatmapJson.data?.heatmapData) {
                setActivityHistory(heatmapJson.data.heatmapData);
              } else if (history) {
                setActivityHistory(history);
              }
            } else if (history) {
              setActivityHistory(history);
            }
          } catch {
            if (history) setActivityHistory(history);
          }
        }
      }
      await fetchAnalytics();
    } catch (e) {
      console.warn('[OFFLINE STATE FETCH FALLBACK]:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify session cookie validation on startup
  useEffect(() => {
    const verifySession = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data && json.data.user) {
            setIsAuthenticated(true);
            setUserEmail(json.data.user.email);
            if (json.data.user.name) setUserName(json.data.user.name);
            setActiveTab('dashboard');
            await fetchUserState();
            // Automatically launch onboarding if registering for the first time
            const onboardingCompleted = localStorage.getItem('cn_onboarding_completed') === 'true';
            if (!onboardingCompleted) {
              setOnboardingOpen(true);
            }
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn('No active session authenticated.');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifySession();
  }, []);

  // Update task risk scores dynamically when parameters change
  useEffect(() => {
    if (tasks.length > 0) {
      setTasks(prev => prev.map(t => {
        const risk = calculateTaskRisk(t, focusHours, streak);
        return {
          ...t,
          riskScore: risk,
          failureProbability: risk
        };
      }));
    }
  }, [focusHours, streak, tasks.length]);

  const logActivity = (type: 'xp' | 'focus' | 'task', amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    setActivityHistory(prev => {
      const current = prev[today] || { xpEarned: 0, focusHours: 0, tasksCompleted: 0 };
      const updated = { ...current };
      if (type === 'xp') updated.xpEarned += amount;
      else if (type === 'focus') updated.focusHours = Number((updated.focusHours + amount).toFixed(1));
      else if (type === 'task') updated.tasksCompleted += amount;
      return { ...prev, [today]: updated };
    });
  };

  const level = Math.floor(xp / 300) + 1;
  let rank = 'Beginner';
  if (level >= 50) rank = 'Grandmaster';
  else if (level >= 20) rank = 'Master';
  else if (level >= 10) rank = 'Ninja';
  else if (level >= 5) rank = 'Explorer';

  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 100;
  
  const focusScore = Math.min(100, Math.round(50 + (focusHours * 3)));
  const consistencyScore = Math.min(100, Math.round(40 + (streak * 10) + completionRate * 0.4));

  let burnoutRisk: 'Low' | 'Medium' | 'High' = 'Low';
  const pendingUrgentCount = tasks.filter(t => !t.completed && t.priority === 'Urgent-Important').length;
  if (pendingUrgentCount >= 3) {
    burnoutRisk = 'High';
  } else if (pendingUrgentCount >= 1 || tasks.filter(t => !t.completed).length > 5) {
    burnoutRisk = 'Medium';
  }

  useEffect(() => {
    setLeaderboard(prev => prev.map(user => {
      if (user.id === 'lb-u' || user.id === 'lb-u-f' || user.id === 'lb-u-u') {
        return { ...user, xp, streak };
      }
      return user;
    }));
  }, [xp, streak]);

  const setGeminiApiKey = async (key: string) => {
    setGeminiApiKeyState(key);
    try {
      await fetch(`${API_BASE}/user/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: key }),
        credentials: 'include'
      });
      showToast('Gemini API Key updated securely', 'success');
      addNotification('Settings Updated', 'Gemini API Key saved securely.', 'calendar');
    } catch (e) {
      console.warn('Failed to sync api key setting to server:', e);
      showToast('Settings sync failed', 'error');
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setUserEmail(email.trim().toLowerCase());
        if (data.data?.user?.name) setUserName(data.data.user.name);
        setActiveTab('dashboard');
        showToast('Login successful! Welcome back.', 'success');
        addNotification('Welcome Back!', 'Login successful. CodingNinja Productivity OS active.', 'coach');
        await fetchUserState();
        return true;
      } else {
        showToast(data.message || 'Login failed. Verify credentials.', 'error');
        return false;
      }
    } catch (e) {
      console.error('Login request failed:', e);
      showToast('Authentication server is unreachable.', 'error');
      return false;
    }
  };

  const signup = async (email: string, password?: string, name?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setUserEmail(email.trim().toLowerCase());
        if (data.data?.user?.name) setUserName(data.data.user.name);
        setActiveTab('dashboard');
        showToast('Registration successful! Welcome.', 'success');
        addNotification('Welcome to Workspace!', 'Profile registered successfully.', 'coach');
        await fetchUserState();
        setOnboardingOpen(true); // Launch onboarding wizard
        return true;
      } else {
        showToast(data.message || 'Signup failed.', 'error');
        return false;
      }
    } catch (e) {
      console.error('Signup request failed:', e);
      showToast('Authentication server is unreachable.', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      showToast('Logged out of workspace.', 'info');
    } catch (err) {
      console.warn('Logout sync failed:', err);
    }
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setTasks([]);
    setCalendarEvents([]);
    setHabits([]);
    setNotifications([]);
    setActivityHistory({});
    localStorage.removeItem('cn_onboarding_completed');
    setActiveTab('landing');
  };

  const addXp = async (amount: number, reason: string) => {
    setXp(prev => {
      const nextXp = prev + amount;
      const nextLevel = Math.floor(nextXp / 300) + 1;
      const currentLevel = Math.floor(prev / 300) + 1;
      if (nextLevel > currentLevel) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => {
          addNotification('Level Up! 🌟', `Congratulations! You reached Level ${nextLevel}. You are growing stronger.`, 'gamification');
        }, 100);
      }
      return nextXp;
    });

    showToast(`+${amount} XP: ${reason}`, 'success');
    logActivity('xp', amount);
    logAgentMsg('agent-coach', `User earned +${amount} XP: ${reason}`, 'success');

    try {
      await fetch(`${API_BASE}/user/xp/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason }),
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Failed to sync XP progression to server:', e);
    }
  };

  const setFocusHours = (value: React.SetStateAction<number>) => {
    setFocusHoursState(prev => {
      const nextVal = typeof value === 'function' ? (value as any)(prev) : value;
      const diff = nextVal - prev;
      if (diff > 0) {
        logActivity('focus', diff);
        showToast(`Logged focus block: +${diff} hours`, 'info');
        fetch(`${API_BASE}/user/focus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hours: diff }),
          credentials: 'include'
        }).catch(err => console.warn('Focus hours sync failed:', err));
      }
      return nextVal;
    });
  };

  const logAgentMsg = (agentId: string, message: string, type: AgentLog['type']) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          logs: [{ timestamp, agent: agent.name, message, type }, ...agent.logs].slice(0, 15)
        };
      }
      return agent;
    }));
  };

  const addNotification = (title: string, message: string, type: Notification['type'], contextAware: boolean = false) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false,
      contextAware
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(`${API_BASE}/user/notifications/read`, {
        method: 'POST',
        credentials: 'include'
      });
      showToast('Notifications cleared', 'info');
    } catch (err) {
      console.warn('Failed to mark notifications read on server:', err);
    }
  };

  const addTask = async (title: string, description: string, deadline: string) => {
    logAgentMsg('agent-planner', `Analyzing task proposal: "${title}"`, 'info');
    showToast(`Analyzing task proposal: "${title}"`, 'info');
    
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, deadline }),
        credentials: 'include'
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data && json.data.task) {
          const newTask = json.data.task;
          setTasks(prev => [newTask, ...prev]);
          if (json.data.calendarEvent) {
            setCalendarEvents(prev => [...prev, json.data.calendarEvent]);
          }
          logAgentMsg('agent-planner', `Successfully created task "${title}" and auto-decomposed into ${newTask.subtasks.length} subtasks.`, 'success');
          logAgentMsg('agent-prioritizer', `Classified "${title}" as [${newTask.priority}] under category [${newTask.category}].`, 'info');
          showToast(`Task created! Decomposed into ${newTask.subtasks.length} subtasks.`, 'success');

          if (newTask.failureProbability > 70) {
            addNotification(
              'AI High Risk Alert',
              `Task "${title}" carries a ${newTask.failureProbability}% risk of failure. Suggested Action: ${newTask.suggestedAction}`,
              'rescue',
              true
            );
            logAgentMsg('agent-rescue', `CRITICAL: Task "${title}" failure risk is ${newTask.failureProbability}%. Rescue engine primed.`, 'danger');
            showToast(`Warning: High Failure Risk for task "${title}"`, 'warning');
          }

          await fetchUserState(); // Sync XP progression
          return;
        }
      }
      showToast('Failed to create task on the server', 'error');
      logAgentMsg('agent-planner', 'Task creation failed on the server', 'danger');
    } catch (e) {
      console.error('Failed to create task:', e);
      showToast('Task creation failed: server unreachable', 'error');
      logAgentMsg('agent-planner', 'Task creation failed: server unreachable', 'danger');
    }
  };



  const updateTask = async (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    try {
      const response = await fetch(`${API_BASE}/tasks/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
        credentials: 'include'
      });
      if (response.ok) {
        await fetchUserState();
      }
    } catch (e) {
      console.warn('Failed to save task update to server:', e);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setCalendarEvents(prev => prev.filter(e => e.taskId !== id));
    logAgentMsg('agent-planner', `Purged task ID [${id}] and removed respective calendar allocations.`, 'warning');
    showToast('Task and scheduled blocks deleted.', 'info');

    try {
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Failed to delete task on server:', e);
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    let updatedTask: Task | undefined;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const subtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        const completedSubs = subtasks.filter(s => s.completed).length;
        const totalSubs = subtasks.length;
        const percent = totalSubs > 0 ? completedSubs / totalSubs : 1;
        const nextProb = Math.max(0, Math.round(t.failureProbability * (1 - percent * 0.5)));

        logAgentMsg('agent-planner', `Subtask completion toggled in task [${t.title}].`, 'info');
        
        if (completedSubs > 0 && percent < 1) {
          addXp(5, 'Completed subtask chunk');
        }

        updatedTask = { ...t, subtasks, failureProbability: nextProb };
        return updatedTask;
      }
      return t;
    }));

    if (updatedTask) {
      try {
        await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
          credentials: 'include'
        });
      } catch (e) {
        console.warn('Failed to sync subtask completion state:', e);
      }
    }
  };

  const completeTask = async (taskId: string) => {
    let updatedTask: Task | undefined;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (!t.completed) {
          addXp(50, `Completed task: ${t.title}`);
          addNotification('Goal Conquered!', `Successfully submitted task "${t.title}". +50 XP.`, 'gamification');
          showToast(`Task Complete: "${t.title}" (+50 XP)`, 'success');
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 }
          });
          
          const subtasks = t.subtasks.map(s => ({ ...s, completed: true }));
          logAgentMsg('agent-coach', `Amazing hustle! Task "${t.title}" finalized successfully.`, 'success');
          
          logActivity('task', 1);

          updatedTask = { ...t, completed: true, subtasks, failureProbability: 0, rescuePlanActive: false };
          return updatedTask;
        } else {
          updatedTask = { ...t, completed: false };
          showToast('Task marked incomplete.', 'info');
          return updatedTask;
        }
      }
      return t;
    }));

    if (updatedTask) {
      try {
        await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
          credentials: 'include'
        });
        await fetchUserState();
      } catch (e) {
        console.warn('Failed to complete task on server:', e);
      }
    }
  };

  const activateRescueMode = async (taskId: string) => {
    logAgentMsg('agent-rescue', `Initiating emergency rescue sequence for task [${taskId}].`, 'warning');
    showToast('AI Rescue sequence initiated...', 'warning');
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/rescue`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          await fetchUserState();
          addNotification(
            '🚨 Rescue Mode Activated',
            `Emergency plan generated for task. Focus blocks locked.`,
            'rescue'
          );
          showToast('Emergency Focus blocks locked in calendar', 'success');
          confetti({
            particleCount: 80,
            colors: ['#ef4444', '#f59e0b', '#3b82f6'],
            spread: 60,
            origin: { y: 0.6 }
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Rescue activation sync failed, fallback locally:', e);
    }

    // Dynamic Local Fallback Rescue Mode
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const recoveryPlan = [
      `Decompose ${task.title} into 3 primary sub-milestones immediately.`,
      `Lock first focus block in next 2 hours to start work.`,
      `Deliver core subtask components (aim for 50% progress before evening).`,
      `Verify routing, deployment, and checklist details.`
    ];

    const start1 = new Date(); start1.setHours(start1.getHours() + 1);
    const end1 = new Date(start1); end1.setHours(end1.getHours() + 2);
    const block1: CalendarEvent = {
      id: `cal-rescue-1-${Date.now()}`,
      title: `🚨 Emergency Focus: ${task.title} Sprint`,
      start: start1.toISOString(),
      end: end1.toISOString(),
      taskId: task.id,
      isAiScheduled: true
    };

    const updatedTask: Task = {
      ...task,
      priority: 'Urgent-Important',
      rescuePlanActive: true,
      recoveryPlan,
      completionForecast: `Forecast active`,
      riskScore: Math.round((task.riskScore || 80) * 0.5),
      failureProbability: Math.round((task.riskScore || 80) * 0.5)
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    setCalendarEvents(prev => [...prev, block1]);
    addNotification('🚨 Rescue Mode Activated', 'Rescue items locked.', 'rescue');
  };

  const toggleRescueStep = async (taskId: string, stepId: string) => {
    let updatedTask: Task | undefined;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.rescueTimeline) {
        const rescueTimeline = t.rescueTimeline.map(step => {
          if (step.id === stepId) {
            const nextState = !step.completed;
            if (nextState) {
              addXp(15, `Finished Rescue Step: ${step.label}`);
            }
            return { ...step, completed: nextState };
          }
          return step;
        });

        logAgentMsg('agent-rescue', `Toggled rescue step checklist.`, 'info');
        updatedTask = { ...t, rescueTimeline };
        return updatedTask;
      }
      return t;
    }));

    if (updatedTask) {
      try {
        await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
          credentials: 'include'
        });
      } catch (e) {
        console.warn('Failed to save rescue step status to server:', e);
      }
    }
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const response = await fetch(`${API_BASE}/habits/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId }),
        credentials: 'include'
      });
      if (response.ok) {
        await fetchUserState();
        logAgentMsg('agent-coach', `Habit progress synced to server.`, 'success');
        return;
      }
    } catch (e) {
      console.warn('Failed to toggle habit on server, applying local fallback:', e);
    }

    // Local Fallback
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const isCompletedToday = h.completedDates.includes(today);
        let nextCompleted = [...h.completedDates];
        let nextStreak = h.streak;
        if (isCompletedToday) {
          nextCompleted = nextCompleted.filter(d => d !== today);
          nextStreak = Math.max(0, nextStreak - 1);
        } else {
          nextCompleted.push(today);
          nextStreak = nextStreak + 1;
          addXp(10, `Completed Habit: ${h.name}`);
        }
        return { ...h, completedDates: nextCompleted, streak: nextStreak };
      }
      return h;
    }));
  };

  const unlockSkill = async (skillId: string) => {
    const node = skills.find(s => s.id === skillId);
    if (!node) return;

    if (xp < node.xpCost) {
      showToast('Unlock criteria not met: Insufficient XP', 'warning');
      addNotification('Insufficient XP', `Unlocking "${node.name}" requires reaching a total of ${node.xpCost} XP.`, 'gamification');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/skills/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId }),
        credentials: 'include'
      });
      if (response.ok) {
        setSkills(prev => prev.map(s => s.id === skillId ? { ...s, unlocked: true } : s));
        showToast(`Skill Unlocked: "${node.name}"`, 'success');
        addNotification('Skill Unlocked! 🛠️', `Unlocked skill node: ${node.name}. Benefit: ${node.bonusDesc}`, 'gamification');
        logAgentMsg('agent-coach', `Unlocked skill node "${node.name}".`, 'success');
        await fetchUserState();
        confetti({ particleCount: 80, spread: 40, origin: { y: 0.8 } });
      }
    } catch (e) {
      console.warn('Failed to unlock skill on server:', e);
    }
  };

  const triggerAIReschedule = async () => {
    logAgentMsg('agent-planner', 'Initiating emergency calendar rescheduling sweep.', 'warning');
    showToast('Running AI schedule sweep...', 'info');
    try {
      const response = await fetch(`${API_BASE}/calendar/reschedule`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setCalendarEvents(json.data);
          logAgentMsg('agent-planner', 'AI Auto-Reschedule completed. Collision sweep resolved.', 'success');
          showToast('Calendar rescheduling sweep complete', 'success');
          addNotification('Calendar Auto-Optimized', 'AI has rescheduled calendar blocks to avoid overlaps.', 'calendar');
          return;
        }
      }
    } catch (e) {
      console.warn('Reschedule endpoint offline, using local fallback:', e);
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    logAgentMsg('agent-planner', `Removed calendar event ID [${id}].`, 'warning');
    showToast('Time block deleted.', 'info');

    try {
      await fetch(`${API_BASE}/calendar/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Failed to delete calendar event on server:', e);
    }
  };

  const addCalendarEvent = async (event: CalendarEvent) => {
    setCalendarEvents(prev => [...prev, event]);
    logAgentMsg('agent-planner', `Created calendar event: "${event.title}"`, 'success');

    try {
      await fetch(`${API_BASE}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
        credentials: 'include'
      });
      showToast('Focus block scheduled', 'success');
    } catch (e) {
      console.warn('Failed to create calendar event on server:', e);
    }
  };

  const runAICommand = async (command: string): Promise<string> => {
    logAgentMsg('agent-coach', `Running Command: "${command}"`, 'info');
    showToast(`AI Command: "${command}"`, 'info');
    
    try {
      const response = await fetch(`${API_BASE}/ai/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
        credentials: 'include'
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          await fetchUserState(); // pull newly seeded items
          showToast('Command executed successfully', 'success');
          addNotification('AI Command Sweep Complete', 'Deliverables parsed and schedules generated.', 'calendar');
          return json.reply;
        }
      }
    } catch (e) {
      console.warn('AI command center offline:', e);
    }
    showToast('AI Command Center failed', 'error');
    return 'The AI Command Center server could not be reached.';
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      isAuthenticated,
      login,
      signup,
      logout,
      userEmail,
      userName,
      geminiApiKey,
      setGeminiApiKey,
      xp,
      level,
      rank,
      streak,
      badges,
      leaderboard,
      addXp,
      focusScore,
      consistencyScore,
      focusHours,
      burnoutRisk,
      setFocusHours,
      tasks,
      habits,
      agents,
      skills,
      challenges,
      calendarEvents,
      notifications,
      setNotifications,
      dnaProfile,
      activityHistory,
      analytics,
      fetchAnalytics,
      addTask,
      updateTask,
      deleteTask,
      toggleSubtask,
      completeTask,
      activateRescueMode,
      toggleRescueStep,
      toggleHabit,
      unlockSkill,
      triggerAIReschedule,
      deleteCalendarEvent,
      addCalendarEvent,
      addNotification,
      markNotificationsAsRead,
      theme,
      toggleTheme,
      runAICommand,
      isLoading,
      toasts,
      showToast,
      removeToast,
      isCommandPaletteOpen,
      setCommandPaletteOpen,
      isOnboardingOpen,
      setOnboardingOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
