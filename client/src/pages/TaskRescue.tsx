import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { Task, TaskPriority } from '../types';
import { 
  ShieldAlert, Sparkles, CheckCircle2, Circle, AlertTriangle, 
  Trash2, Play, Check, Flame, ChevronRight, Activity 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

export const TaskRescue: React.FC = () => {
  const { 
    tasks, completeTask, deleteTask, activateRescueMode, 
    toggleRescueStep, toggleSubtask, burnoutRisk, focusHours 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'matrix' | 'rescue' | 'burnout'>('matrix');

  // Filter tasks by priority
  const getTasksByPriority = (priority: TaskPriority) => {
    return tasks.filter(t => !t.completed && t.priority === priority);
  };

  const getPriorityBorder = (p: TaskPriority) => {
    switch (p) {
      case 'Urgent-Important': return 'border-neonRose/30 hover:border-neonRose/50';
      case 'NotUrgent-Important': return 'border-neonCyan/30 hover:border-neonCyan/50';
      case 'Urgent-NotImportant': return 'border-neonAmber/30 hover:border-neonAmber/50';
      default: return 'border-white/10 hover:border-white/20';
    }
  };

  const getPriorityTitleColor = (p: TaskPriority) => {
    switch (p) {
      case 'Urgent-Important': return 'text-neonRose';
      case 'NotUrgent-Important': return 'text-neonCyan';
      case 'Urgent-NotImportant': return 'text-neonAmber';
      default: return 'text-white/60';
    }
  };

  // Burnout stress data
  const stressData = [
    { name: 'Week 1', taskLoad: 4, completionRate: 90, stressIndex: 25 },
    { name: 'Week 2', taskLoad: 6, completionRate: 85, stressIndex: 45 },
    { name: 'Week 3', taskLoad: 9, completionRate: 70, stressIndex: 80 },
    { name: 'Week 4', taskLoad: tasks.filter(t => !t.completed).length + 3, completionRate: 65, stressIndex: burnoutRisk === 'High' ? 85 : 55 },
  ];

  const highRiskTasks = tasks.filter(t => !t.completed && t.failureProbability > 50);
  const activeRescueTask = tasks.find(t => t.rescuePlanActive);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 px-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="text-neonRose animate-pulse" size={24} />
            <span>AI Rescue Console & Deadline Defender</span>
          </h2>
          <p className="text-xs text-white/50">Urgent action deck prioritizing tasks and scheduling rescue operations.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'matrix' ? 'bg-neonCyan text-black font-extrabold shadow-glass-cyan' : 'text-white/60 hover:text-white'
            }`}
          >
            Eisenhower Matrix
          </button>
          <button
            onClick={() => setActiveTab('rescue')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'rescue' ? 'bg-neonRose text-white font-extrabold shadow-glass-rose' : 'text-white/60 hover:text-white'
            }`}
          >
            {activeRescueTask && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neonRose opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neonRose"></span>
              </span>
            )}
            <span>Rescue Deck</span>
          </button>
          <button
            onClick={() => setActiveTab('burnout')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'burnout' ? 'bg-neonViolet text-white font-extrabold shadow-glass-violet' : 'text-white/60 hover:text-white'
            }`}
          >
            Burnout Diagnostics
          </button>
        </div>
      </div>

      {/* 1. Eisenhower Matrix Tab */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['Urgent-Important', 'NotUrgent-Important', 'Urgent-NotImportant', 'NotUrgent-NotImportant'] as TaskPriority[]).map((priority) => {
            const quadrantTasks = getTasksByPriority(priority);
            return (
              <GlassCard 
                key={priority}
                className={`p-5 min-h-[220px] bg-white/5 flex flex-col justify-between border ${getPriorityBorder(priority)}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-sm font-extrabold tracking-wider uppercase font-mono ${getPriorityTitleColor(priority)}`}>
                      {priority.replace('-', ' & ')}
                    </h3>
                    <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 bg-white/5 rounded-full">
                      {quadrantTasks.length} items
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {quadrantTasks.length === 0 ? (
                      <p className="text-xs text-white/30 italic py-8 text-center">Quadrant cleared</p>
                    ) : (
                      quadrantTasks.map(task => (
                        <div 
                          key={task.id} 
                          className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all flex justify-between items-center group"
                        >
                          <div className="flex items-center gap-2.5">
                            <button 
                              onClick={() => completeTask(task.id)}
                              className="text-white/40 hover:text-neonEmerald transition-all"
                            >
                              <Circle size={15} />
                            </button>
                            <div>
                              <h4 className="text-xs font-bold text-white max-w-[180px] truncate">{task.title}</h4>
                              <p className="text-[9px] text-white/40 mt-0.5 font-mono">
                                Due {new Date(task.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {task.failureProbability > 70 && (
                              <span className="text-[8px] font-mono font-bold text-neonRose bg-neonRose/15 border border-neonRose/20 px-2 py-0.5 rounded-full animate-pulse">
                                {task.failureProbability}% failure chance
                              </span>
                            )}
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-neonRose transition-all p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 flex justify-between text-[9px] font-mono text-white/30">
                  <span>Action: {priority.includes('Urgent') ? 'Do Immediately' : 'Delegate / Eliminate'}</span>
                  <span>Automation: Ready</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* 2. Rescue Mode Tab */}
      {activeTab === 'rescue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Failure Predictions checklist */}
          <div className="lg:col-span-1 space-y-4">
            <GlassCard className="p-5" glowColor="rose">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                <AlertTriangle className="text-neonRose" size={16} />
                <span>AI Predicted Task Failures</span>
              </h3>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">
                Using cognitive load patterns, active context schedules, and historic habit metrics to anticipate failures.
              </p>

              <div className="space-y-3">
                {highRiskTasks.length === 0 ? (
                  <p className="text-xs text-white/30 italic text-center py-6">All deadlines carry low risk profiles.</p>
                ) : (
                  highRiskTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-xl border transition-all ${
                        task.rescuePlanActive 
                          ? 'border-neonRose/40 bg-neonRose/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-white truncate max-w-[160px]">{task.title}</h4>
                          <p className="text-[10px] text-neonRose font-mono font-bold mt-0.5">
                            Risk Index: {task.failureProbability}%
                          </p>
                        </div>
                        
                        {!task.rescuePlanActive && (
                          <button
                            onClick={() => activateRescueMode(task.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-neonRose text-white font-bold rounded-lg hover:opacity-90 active:scale-95 text-[10px] shadow-glass-rose transition-all"
                          >
                            <Play size={10} className="fill-white" />
                            <span>Rescue</span>
                          </button>
                        )}
                      </div>

                      {task.failureReason && (
                        <p className="text-[10px] text-white/50 leading-relaxed mt-2 border-t border-white/5 pt-2">
                          <strong className="text-white/70">Reason:</strong> {task.failureReason}
                        </p>
                      )}
                      
                      {task.suggestedAction && !task.rescuePlanActive && (
                        <p className="text-[10px] text-neonCyan mt-1 font-mono">
                          ⚡ Suggested: {task.suggestedAction}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* Active Rescue Timeline */}
          <div className="lg:col-span-2">
            {activeRescueTask ? (
              <GlassCard className="p-5 bg-white/5 border border-neonRose/20 h-full flex flex-col justify-between" glowColor="rose">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/10 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="animate-ping w-2 h-2 rounded-full bg-neonRose" />
                        <h3 className="text-md font-black text-white">RESCUE OPERATION ACTIVE</h3>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">Target Deliverable: {activeRescueTask.title}</p>
                    </div>

                    <button
                      onClick={() => completeTask(activeRescueTask.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-neonEmerald to-neonCyan text-black font-extrabold rounded-xl hover:opacity-90 text-xs shadow-glass-emerald transition-all"
                    >
                      <Check size={14} className="stroke-[2.5]" />
                      <span>Complete Submission</span>
                    </button>
                  </div>

                  {/* Rescue subtask tracker */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 font-mono">Tactical Sprint Milestones</h4>
                    
                    <div className="space-y-3 pl-2 relative border-l border-white/10 ml-3 py-1">
                      {activeRescueTask.rescueTimeline?.map((step) => (
                        <div key={step.id} className="relative flex justify-between items-center group">
                          {/* Dot connector */}
                          <div className={`
                            absolute -left-[14px] top-2.5 w-2 h-2 rounded-full border transition-all
                            ${step.completed 
                              ? 'bg-neonEmerald border-neonEmerald shadow-[0_0_8px_#00e676]' 
                              : 'bg-darkBg border-white/30'
                            }
                          `} />

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleRescueStep(activeRescueTask.id, step.id)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                step.completed 
                                  ? 'bg-neonEmerald/10 border-neonEmerald/30 text-neonEmerald' 
                                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                              }`}
                            >
                              {step.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                            </button>
                            <div>
                              <p className={`text-xs font-bold transition-all ${step.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                                {step.label}
                              </p>
                              <p className="text-[9px] text-white/40 font-mono mt-0.5">Duration: {step.durationMinutes} mins</p>
                            </div>
                          </div>

                          {step.completed && (
                            <span className="text-[8px] font-mono font-bold text-neonEmerald bg-neonEmerald/10 px-2 py-0.5 rounded-full">
                              Completed (+15 XP)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] font-mono text-white/40">
                  <span>Rescue Confidence Index: 93%</span>
                  <span>Safety Cushion: 1.5 Hours</span>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-12 text-center flex flex-col items-center justify-center border border-white/10 bg-white/5 h-full">
                <span className="text-4xl mb-3">🛡️</span>
                <h3 className="text-md font-bold text-white mb-1">Rescue Operations Dormant</h3>
                <p className="text-xs text-white/50 max-w-sm">
                  No active high-risk deadlines have been pushed into emergency scheduling. Calibrate tasks from the predictions sidebar.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* 3. Burnout Diagnostics Tab */}
      {activeTab === 'burnout' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <GlassCard className="p-5" glowColor={burnoutRisk === 'High' ? 'rose' : 'none'}>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="text-neonViolet animate-pulse" size={18} />
                <h3 className="text-sm font-bold text-white">Stress Diagnostic System</h3>
              </div>

              <div className="space-y-4 text-xs text-white/70">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <div className="text-white/40 text-[9px] uppercase font-mono mb-1">Burnout Risk Status</div>
                  <div className={`text-xl font-black rounded-full inline-block px-4 py-1 ${
                    burnoutRisk === 'High' ? 'text-neonRose bg-neonRose/10 border border-neonRose/20 shadow-[0_0_10px_rgba(255,23,68,0.2)]' : 'text-neonEmerald bg-neonEmerald/10 border border-neonEmerald/20'
                  }`}>
                    {burnoutRisk} RISK
                  </div>
                </div>

                <p className="leading-relaxed text-[11px]">
                  {burnoutRisk === 'High' 
                    ? "Alert: Workload triggers indicate over-commitment. Completion latency is at 2.4 days. Recommended: Reduce daily task load by 20% to prevent deadline failures." 
                    : "Your work-to-rest ratio is healthy. Focus timers show an average cool-down of 45 minutes between coding blocks."}
                </p>
                
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <h4 className="text-[10px] uppercase font-mono tracking-wider text-white/40">Actionable recommendations:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-white/60">
                    <li>Skip secondary refactoring blocks today.</li>
                    <li>Limit focus sessions to max 90 minutes.</li>
                    <li>Establish a firm cool-down sequence by 10:00 PM.</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2">
            <GlassCard className="p-5 bg-white/5 border border-white/10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide mb-1">Workload Stress Vector</h3>
                <p className="text-[10px] text-white/40 mb-4">Plots task load intensity against weekly stress indices</p>
                
                <div className="h-60 w-full bg-black/20 rounded-xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                      <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} className="font-mono" />
                      <YAxis stroke="#ffffff40" fontSize={10} className="font-mono" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d0f18', borderColor: '#ffffff1a', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '10px' }}
                        itemStyle={{ fontSize: '10px' }}
                      />
                      <Bar dataKey="taskLoad" fill="#00e5ff" name="Active Task Count" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="stressIndex" fill="#ff1744" name="Burnout stress Index" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 mt-4 text-[10px] text-white/40 flex justify-between items-center font-mono">
                <span>Diagnostic calibration: Active</span>
                <span className="text-neonCyan cursor-pointer hover:underline">Recalibrate parameters</span>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
