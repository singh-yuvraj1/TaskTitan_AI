import React from 'react';
import { useApp } from '../context/AppContext';
import { GitHubHeatmap } from '../components/GitHubHeatmap';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  CheckSquare, Clock, Award, ShieldAlert,
  Calendar as CalendarIcon, CheckCircle2, Flame, RefreshCw, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const {
    tasks, focusHours, streak, completeTask, level, xp, userName
  } = useApp();

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 100;

  // Find Today's Focus task (first active Urgent task or just first active task)
  const activeTasks = tasks.filter(t => !t.completed);
  const focusTask = activeTasks.find(t => t.priority === 'Urgent-Important') || activeTasks[0];
  const todaysFocusText = focusTask ? focusTask.title : 'All targets resolved';

  // Compute risk category count (High: probability > 70%, Medium: 40-70%, Low: < 40%)
  const highRiskTasks = activeTasks.filter(t => t.failureProbability > 70);
  const medRiskTasks = activeTasks.filter(t => t.failureProbability >= 40 && t.failureProbability <= 70);
  const lowRiskTasks = activeTasks.filter(t => t.failureProbability < 40);

  // Compile calendar events for the Next 7 Days (Upcoming Work)
  const next7DaysTasks = [...activeTasks]
    .filter(t => {
      const diffTime = new Date(t.deadline).getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Dynamic time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  const displayName = userName || 'Ninja';

  // Page container slide up animation
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as any, staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-6xl mx-auto py-2 px-1"
    >

      {/* SECTION 1: Welcome Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div>
              <h2 className="text-xl lg:text-[24px] font-bold text-text-primary tracking-tight">
                {getGreeting()}, {displayName}
              </h2>
              <p className="text-xs text-text-muted mt-1">Here is your workspace schedule breakdown for today.</p>
            </div>

            <div className="p-4 bg-white/[0.02] border border-glass-border rounded-2xl text-left max-w-sm shrink-0 shadow-sm backdrop-blur-sm">
              <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">Today's Focus</span>
              <span className="text-xs font-bold text-text-primary mt-1.5 block truncate max-w-[240px]">
                {todaysFocusText}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 2: Metrics Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-2xl shadow-sm">
            <CheckSquare size={16} />
          </div>
          <div>
            <div className="text-[9px] text-text-muted font-mono uppercase tracking-wider">Today's Tasks</div>
            <div className="text-sm font-bold text-text-primary mt-0.5">{pendingCount} pending</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl shadow-sm">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-[9px] text-text-muted font-mono uppercase tracking-wider">Focus Hours</div>
            <div className="text-sm font-bold text-text-primary mt-0.5">{focusHours.toFixed(1)} hrs</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl shadow-sm">
            <BarChart2 size={16} />
          </div>
          <div>
            <div className="text-[9px] text-text-muted font-mono uppercase tracking-wider">Completion Rate</div>
            <div className="text-sm font-bold text-text-primary mt-0.5">{completionRate}%</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-sm">
            <Flame size={16} />
          </div>
          <div>
            <div className="text-[9px] text-text-muted font-mono uppercase tracking-wider">Current Streak</div>
            <div className="text-sm font-bold text-text-primary mt-0.5">{streak} days</div>
          </div>
        </Card>
      </motion.div>

      {/* Grid: Sections 3, 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SECTION 3: Today's Plan (Left / 8 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col">
          <Card className="p-6 flex flex-col min-h-[360px] flex-1">
            <div className="flex justify-between items-center pb-3 border-b border-glass-border mb-5">
              <div>
                <h3 className="text-sm font-bold text-text-primary tracking-tight">Today's Plan</h3>
                <p className="text-xs text-text-muted mt-0.5">Tasks requiring active contribution blocks.</p>
              </div>
              <span className="text-[10px] font-mono text-text-muted bg-white/5 border border-glass-border px-2.5 py-0.5 rounded-full">
                {activeTasks.length} remaining
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1">
              {activeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-xs text-text-muted italic">
                  <CheckCircle2 size={32} className="text-white/10 mb-3" />
                  <span>No tasks remaining. Workspace clear!</span>
                </div>
              ) : (
                activeTasks.map(task => {
                  const isOverdue = new Date(task.deadline).getTime() < Date.now();
                  const progressPct = task.progress !== undefined ? task.progress : 0;

                  return (
                    <div
                      key={task.id}
                      className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-glass-border rounded-2xl flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <input
                          type="checkbox"
                          onChange={() => completeTask(task.id)}
                          className="w-4 h-4 rounded-md border-glass-border bg-transparent text-violet-500 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary leading-snug truncate">{task.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-text-muted">
                            <span className={task.priority === 'Urgent-Important' ? 'text-rose-400 font-bold' : 'text-text-muted'}>
                              {task.priority === 'Urgent-Important' ? 'Urgent' : 'Routine'}
                            </span>
                            <span>•</span>
                            <span>{task.category}</span>
                            <span>•</span>
                            <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                              Due {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress visual bar with gradient */}
                      <div className="flex items-center gap-3.5 shrink-0">
                        <div className="w-20 bg-white/5 h-1.5 rounded-full overflow-hidden border border-glass-border">
                          <div
                            className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-secondary font-mono w-8 text-right">{progressPct}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>

        {/* SECTION 4: Deadline Overview (Right / 4 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col">
          <Card className="p-6 flex flex-col justify-between flex-1 min-h-[360px]">
            <div>
              <div className="pb-3 border-b border-glass-border mb-5">
                <h3 className="text-sm font-bold text-text-primary tracking-tight">Deadline Risk</h3>
                <p className="text-xs text-text-muted mt-0.5">Predictive threat matrix for active milestones.</p>
              </div>

              {/* Status categories list */}
              <div className="space-y-4 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse" />
                    <span className="text-text-secondary font-semibold">High Risk</span>
                  </div>
                  <span className="font-mono text-text-primary bg-white/5 border border-glass-border px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                    {highRiskTasks.length} tasks
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" />
                    <span className="text-text-secondary font-semibold">Medium Risk</span>
                  </div>
                  <span className="font-mono text-text-primary bg-white/5 border border-glass-border px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                    {medRiskTasks.length} tasks
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
                    <span className="text-text-secondary font-semibold">Low Risk</span>
                  </div>
                  <span className="font-mono text-text-primary bg-white/5 border border-glass-border px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                    {lowRiskTasks.length} tasks
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-text-muted font-mono leading-relaxed mt-8 border-t border-glass-border pt-4">
              Failure risk calculated dynamically based on task density, subtasks completion rates, and historical study hours.
            </div>
          </Card>
        </motion.div>
      </div>

      {/* SECTION 5: Upcoming Work (Calendar Style next 7 days) */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="pb-3 border-b border-glass-border mb-5">
            <h3 className="text-sm font-bold text-text-primary tracking-tight">Upcoming Work</h3>
            <p className="text-xs text-text-muted mt-0.5">Milestones scheduled over the next 7 days.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3.5">
            {Array.from({ length: 7 }).map((_, idx) => {
              const date = new Date();
              date.setDate(date.getDate() + idx);
              const dateStr = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

              // Filter tasks matching this date
              const dayTasks = next7DaysTasks.filter(t => {
                const taskDate = new Date(t.deadline).toDateString();
                return taskDate === date.toDateString();
              });

              const isToday = idx === 0;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-left min-h-[130px] flex flex-col justify-between transition-all duration-300 hover:border-violet-500/20 ${isToday
                    ? 'border-violet-500/30 bg-violet-500/[0.01]'
                    : 'border-glass-border bg-white/[0.01]'
                    }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                    <span className={isToday ? 'text-violet-400 font-bold' : 'text-text-muted'}>
                      {isToday ? 'Today' : dateStr.split(',')[0]}
                    </span>
                    <span className="text-text-muted">{date.getDate()}</span>
                  </div>

                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    {dayTasks.length === 0 ? (
                      <span className="text-[9px] text-text-muted/40 block pt-4 italic">No items</span>
                    ) : (
                      dayTasks.slice(0, 2).map(t => (
                        <div
                          key={t.id}
                          className="px-2 py-1 rounded-lg bg-card border border-glass-border text-[9px] text-text-secondary truncate font-medium"
                          title={t.title}
                        >
                          {t.title}
                        </div>
                      ))
                    )}
                    {dayTasks.length > 2 && (
                      <span className="text-[8px] text-text-muted block font-mono">+{dayTasks.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* SECTION 6: GitHub Heatmap Widget */}
      <motion.div variants={itemVariants} className="flex flex-col">
        <GitHubHeatmap />
      </motion.div>

    </motion.div>
  );
};
