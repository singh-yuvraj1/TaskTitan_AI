import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { 
  Clock, CheckCircle2, TrendingUp, BarChart3, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ChartSkeleton } from '../components/SkeletonLoader';

export const AnalyticsPage: React.FC = () => {
  const { tasks, focusHours, streak, activityHistory, analytics, isLoading } = useApp();

  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100;

  const getAIInsight = () => {
    if (tasks.length === 0) {
      return "No tasks created yet. Draft goals using the AI Command Core or add tasks manually to generate velocity insights.";
    }
    
    const completedPct = analytics?.completionRate !== undefined ? analytics.completionRate : completionRate;
    let text = "";
    
    if (completedPct === 100 && tasks.length > 0) {
      text += "Outstanding completion velocity! All active milestones are cleared. ";
    } else if (completedPct > 70) {
      text += `Strong momentum! Your task completion rate stands at a high ${completedPct}%. `;
    } else if (completedPct > 40) {
      text += `Steady progress. You've completed ${completedTasks.length} out of ${tasks.length} tasks (${completedPct}%). `;
    } else {
      text += `Let's ramp up output. Currently, only ${completedPct}% of milestone tasks are checked off. `;
    }

    const peakHours = analytics?.bestStudyHours || "6:00 PM and 9:00 PM";
    if (focusHours > 15) {
      text += `Your reserved focus density is solid, peaking during ${peakHours}. Keep maintaining your deep focus blocks!`;
    } else if (focusHours > 5) {
      text += "Logging focus hours regularly will help optimize calendar allocations. Try time-blocking a Pomodoro sprint.";
    } else {
      text += "Increase deep focus reservations. Allocating dedicated calendar blocks for unscheduled milestones will decrease default failure risk.";
    }

    if (streak >= 3) {
      text += ` You are on an active ${streak}-day streak. Kai recommends tackling urgent modules to sustain your daily multiplier score.`;
    } else {
      text += " Establish a daily work rhythm. Completing at least one task or logging focus daily builds habit consistency.";
    }

    return text;
  };

  // Compile history metrics from activityHistory
  const chartData = Object.keys(activityHistory)
    .sort()
    .slice(-7)
    .map(dateStr => {
      const entry = activityHistory[dateStr];
      const date = new Date(dateStr);
      const name = date.toLocaleDateString([], { weekday: 'short' });
      return {
        name,
        focusHours: entry.focusHours,
        tasksCompleted: entry.tasksCompleted,
        xpEarned: entry.xpEarned
      };
    });

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as any } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="max-w-6xl mx-auto py-2 space-y-8 px-1"
    >
      
      {/* Header */}
      <div className="pb-4 border-b border-glass-border">
        <h2 className="text-xl font-bold text-text-primary tracking-tight">Performance Analytics</h2>
        <p className="text-xs text-text-muted mt-1">Check historical velocity, focus efficiency, and milestone progression.</p>
      </div>

      {/* AI Insights Coach Card */}
      {!isLoading && tasks.length > 0 && (
        <Card className="p-5 border-violet-500/20 bg-gradient-to-r from-violet-950/20 via-indigo-950/5 to-cyan-950/20 relative overflow-hidden animate-fadeIn">
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-400 shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider font-mono">Kai's Performance Analysis</h3>
              <p className="text-xs text-text-secondary leading-relaxed pt-1 pr-4">{getAIInsight()}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Completion Velocity</div>
          <div className="text-sm font-bold text-text-primary mt-2">{completedTasks.length} tasks finished</div>
        </Card>
        
        <Card className="p-5">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Task Completion Rate</div>
          <div className="text-sm font-bold text-text-primary mt-2">{analytics?.completionRate !== undefined ? analytics.completionRate : completionRate}% rate</div>
        </Card>

        <Card className="p-5">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Total Focus Reserved</div>
          <div className="text-sm font-bold text-text-primary mt-2">{focusHours.toFixed(1)} focus hours</div>
        </Card>

        <Card className="p-5">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Active Focus Streak</div>
          <div className="text-sm font-bold text-text-primary mt-2">{streak} consecutive days</div>
        </Card>

        <Card className="p-5">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Productivity Score</div>
          <div className="text-sm font-bold text-violet-400 mt-2">{analytics?.weeklyProductivityScore || 0}/100</div>
        </Card>

        <Card className="p-5">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">On-Time Submission Rate</div>
          <div className="text-sm font-bold text-cyan-400 mt-2">{analytics?.deadlineSuccessRate !== undefined ? analytics.deadlineSuccessRate : 100}% on-time</div>
        </Card>

        <Card className="p-5">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Peak Focus Hours</div>
          <div className="text-xs font-bold text-indigo-400 mt-2.5 truncate">{analytics?.bestStudyHours || '6:00 PM - 9:00 PM'}</div>
        </Card>

        <Card className="p-5">
          <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Most Productive Day</div>
          <div className="text-sm font-bold text-emerald-400 mt-2">{analytics?.mostProductiveDay || 'N/A'}</div>
        </Card>
      </div>

      {/* Chart Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-glass-border rounded-2xl bg-[#0a0c16]/30 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-text-muted">
            <BarChart3 size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text-primary">No performance metrics available</h3>
            <p className="text-xs text-text-muted max-w-sm">
              Log focus hours or complete tasks to seed historical velocity chart analytics.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Focus Hours */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Daily Focus hours</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Focus minutes logged over the past 7 days</p>
              </div>
              <Clock size={16} className="text-text-muted" />
            </div>

            <div className="h-64 w-full bg-background rounded-2xl p-3 border border-glass-border">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} className="font-mono" tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={9} className="font-mono" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '10px', fontFamily: 'monospace' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="focusHours" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorFocus)" name="Focus Hours" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Tasks Completed */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Tasks Completed</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Milestone closures logged over the past 7 days</p>
              </div>
              <CheckCircle2 size={16} className="text-text-muted" />
            </div>

            <div className="h-64 w-full bg-background rounded-2xl p-3 border border-glass-border">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} className="font-mono" tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={9} className="font-mono" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '10px', fontFamily: 'monospace' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="tasksCompleted" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorTasks)" name="Tasks Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

    </motion.div>
  );
};
