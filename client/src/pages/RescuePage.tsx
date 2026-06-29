import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, Calendar, 
  ChevronRight, ArrowRight, Activity, Zap, Play, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RescuePage: React.FC = () => {
  const { tasks, calendarEvents, activateRescueMode, toggleRescueStep, setActiveTab } = useApp();

  // Find all high risk tasks (riskScore > 60% or failureProbability > 60%)
  const atRiskTasks = tasks.filter(t => 
    !t.completed && 
    ((t.riskScore !== undefined && t.riskScore > 60) || t.failureProbability > 60)
  );

  // Active rescued tasks
  const rescuedTasks = tasks.filter(t => !t.completed && t.rescuePlanActive);

  const getRescueEvents = (taskId: string) => {
    return calendarEvents.filter(e => e.taskId === taskId && e.title.includes('🚨'));
  };

  // Animation configurations
  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as any } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="max-w-5xl mx-auto space-y-8 py-2 px-1"
    >
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-surface border border-glass-border p-5 rounded-[24px] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-text-primary tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={18} />
            <span>Emergency Rescue Core</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">Manage at-risk milestones, unlock calendar focus grids, and recover lagging schedules.</p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono text-text-muted">
          <span>Active Threats:</span>
          <span className={`px-3 py-1 rounded-xl font-bold border transition-colors ${
            atRiskTasks.length > 0 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
              : 'bg-white/5 text-text-muted border-glass-border'
          }`}>
            {atRiskTasks.length} Milestones
          </span>
        </div>
      </div>

      {/* Main Grid split: Left (Threat List), Right (Active Rescue Terminal) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: At-Risk Tasks list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-glass-border rounded-[24px] shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary pb-3 border-b border-glass-border">
              Lagging Milestones
            </h3>

            <div className="space-y-3.5">
              {atRiskTasks.length === 0 ? (
                <div className="text-center py-10 text-[10px] text-text-muted italic flex flex-col items-center justify-center space-y-2">
                  <CheckCircle size={24} className="text-emerald-500/20" />
                  <span>No high risk tasks detected. Grid is safe.</span>
                </div>
              ) : (
                atRiskTasks.map(task => {
                  const isRescued = task.rescuePlanActive;
                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all duration-300 ${
                        isRescued 
                          ? 'border-emerald-500/20 bg-emerald-500/[0.01]' 
                          : 'border-glass-border bg-white/[0.01] hover:border-violet-500/20'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-text-primary truncate leading-none">{task.title}</span>
                          <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                            isRescued 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {task.riskScore ?? task.failureProbability}% risk
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-2 line-clamp-2 leading-relaxed">{task.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3.5 border-t border-glass-border mt-3 text-[10px]">
                        <span className="text-[9px] font-mono text-text-muted">
                          Due {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        
                        {!isRescued ? (
                          <button
                            onClick={() => activateRescueMode(task.id)}
                            className="text-text-primary hover:text-violet-400 font-bold underline cursor-pointer text-[10px] transition-colors"
                          >
                            Trigger Rescue
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono text-[9px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick recommendations panel */}
          <div className="bg-surface border border-glass-border rounded-[24px] shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary">Recovery Advice</h3>
            <div className="space-y-3.5 text-[11px] text-text-secondary leading-relaxed">
              <p>
                Rescue Mode updates the priority of chosen milestones to <span className="text-text-primary font-bold">Urgent-Important</span> and reserves deep work blocks directly on your calendar.
              </p>
              <div className="p-3 bg-background border border-glass-border rounded-2xl space-y-2 font-mono text-[9px] text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="text-violet-400">✓</span> Lock 90m focus blocks
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-violet-400">✓</span> Pause dashboard notifications
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-violet-400">✓</span> Complete checklist targets
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Rescued Task Dashboard Panel */}
        <div className="lg:col-span-2 space-y-4">
          {rescuedTasks.length === 0 ? (
            <div className="bg-surface border border-glass-border rounded-[24px] shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[350px]">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-text-muted">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-bold text-text-primary">No active recovery plans</h3>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                When you trigger Rescue Mode on a lagging milestone, its custom recovery path and locked calendar blocks will compile here.
              </p>
              {atRiskTasks.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => activateRescueMode(atRiskTasks[0].id)}
                  className="text-[10px] font-bold px-4 py-2 mt-2"
                >
                  Rescue: {atRiskTasks[0].title}
                </Button>
              )}
            </div>
          ) : (
            rescuedTasks.map(task => {
              const rescueEvents = getRescueEvents(task.id);
              return (
                <div key={task.id} className="bg-surface border border-glass-border rounded-[24px] shadow-sm p-6 space-y-6">
                  
                  {/* Status header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-glass-border">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[9px] font-mono font-bold">
                        ● RESCUE PROTOCOL ENGAGED
                      </span>
                      <h3 className="text-base font-bold text-text-primary mt-2.5 leading-snug">{task.title}</h3>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-[9px] text-text-muted font-mono font-bold tracking-wider uppercase">ESTIMATED DELIVERY</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono mt-1">3h before deadline</div>
                    </div>
                  </div>

                  {/* Completion Forecast Banner */}
                  {task.completionForecast && (
                    <div className="p-4 bg-background border border-glass-border rounded-2xl text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <span className="text-text-secondary font-semibold leading-relaxed">{task.completionForecast}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('calendar')}
                        className="text-[10px] px-2 py-1 font-bold underline text-text-muted hover:text-text-primary"
                      >
                        Adjust Calendar
                      </Button>
                    </div>
                  )}

                  {/* Checklist & Calendar details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left side: Recovery Roadmap Checklist */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                        Recovery Roadmap
                      </h4>
                      
                      <div className="space-y-3">
                        {task.rescueTimeline ? (
                          task.rescueTimeline.map(step => (
                            <label
                              key={step.id}
                              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                                step.completed 
                                  ? 'bg-white/[0.01] border-glass-border/40 text-text-muted/65' 
                                  : 'bg-white/[0.01] border-glass-border hover:border-violet-500/30 text-text-secondary'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={step.completed}
                                onChange={() => toggleRescueStep(task.id, step.id)}
                                className="mt-1 rounded-md bg-background border-glass-border text-[#7C3AED] focus:ring-0 w-4 h-4 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-[11px] leading-snug font-bold block ${step.completed ? 'line-through text-text-muted/50' : ''}`}>
                                  {step.label}
                                </span>
                                <span className="text-[9px] text-text-muted font-mono mt-1 block">
                                  Duration: {step.durationMinutes} mins
                                </span>
                              </div>
                            </label>
                          ))
                        ) : task.recoveryPlan ? (
                          task.recoveryPlan.map((planStep, idx) => (
                            <div key={idx} className="flex gap-3 p-3.5 rounded-2xl bg-white/[0.01] border border-glass-border text-text-secondary">
                              <div className="w-5 h-5 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-[9px] font-mono text-text-muted shrink-0 mt-0.5 font-bold">
                                {idx + 1}
                              </div>
                              <span className="text-[11px] leading-snug">{planStep}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-text-muted italic">No breakdown timeline generated.</p>
                        )}
                      </div>
                    </div>

                    {/* Right side: Locked calendar focus slots */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                        Locked Focus Sessions
                      </h4>

                      <div className="space-y-3">
                        {rescueEvents.length === 0 ? (
                          <div className="p-5 rounded-2xl border border-glass-border text-center text-[10px] text-text-muted italic bg-white/[0.01]">
                            No emergency blocks scheduled. Click "Adjust Calendar" to assign slots.
                          </div>
                        ) : (
                          rescueEvents.map(event => {
                            const start = new Date(event.start);
                            const end = new Date(event.end);
                            return (
                              <div key={event.id} className="p-3.5 bg-white/[0.01] border border-glass-border rounded-2xl flex flex-col justify-between gap-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <Clock size={13} className="text-violet-400 shrink-0" />
                                  <span className="text-[11px] font-bold text-text-primary truncate leading-none">{event.title.replace('🚨 ', '')}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-text-muted font-mono border-t border-glass-border/30 pt-2.5">
                                  <span>{start.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                                  <span>
                                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      
                      {/* Interactive Focus launch block */}
                      <div className="p-5 bg-white/[0.01] border border-glass-border rounded-3xl space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                          <Zap size={14} className="text-violet-400 animate-pulse" />
                          <span>Deep Work Focus Session</span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed">
                          Launch your Pomodoro workstation now to begin completing milestones on your recovery checklist.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('focus')}
                          className="w-full text-[10px] py-2 bg-text-primary hover:bg-neutral-200 text-background font-bold border-none justify-center flex gap-1.5 items-center cursor-pointer rounded-xl"
                        >
                          <Play size={11} fill="currentColor" />
                          <span>Launch Focus Block</span>
                        </Button>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </motion.div>
  );
};
