import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  Sparkles, CornerDownLeft, AlertCircle, CheckCircle2, 
  Clock, Calendar, ShieldAlert, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AICommandCenter: React.FC = () => {
  const { runAICommand, tasks, calendarEvents, activateRescueMode, setActiveTab } = useApp();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const suggestedQueries = [
    {
      text: "I have DAA exam in 5 days and React project due next Friday",
      label: "Plan DAA & React Milestones"
    },
    {
      text: "Optimize calendar and reschedule focus blocks",
      label: "Optimize Schedule Grid"
    },
    {
      text: "Activate emergency rescue for high risk tasks",
      label: "Trigger Rescue Sweep"
    }
  ];

  const handleSubmit = async (textToSubmit: string) => {
    if (!textToSubmit.trim()) return;
    setIsProcessing(true);
    setResultMessage(null);
    setSubmittedQuery(textToSubmit);

    try {
      const response = await runAICommand(textToSubmit);
      setResultMessage(response);
    } catch (error) {
      console.error(error);
      setResultMessage("Failed to process command. Please verify connection to the local sandbox state.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getRelevantTasks = () => {
    if (!submittedQuery) return [];
    const q = submittedQuery.toLowerCase();
    
    if (q.includes('daa') || q.includes('react')) {
      return tasks.filter(t => 
        t.title.toLowerCase().includes('daa') || 
        t.title.toLowerCase().includes('react')
      );
    }
    
    return tasks.slice(0, 2);
  };

  const getEventsForTask = (taskId: string) => {
    return calendarEvents.filter(e => e.taskId === taskId);
  };

  const relevantTasks = getRelevantTasks();

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as any } }
  };

  const skeletonVariants = {
    animate: {
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as any }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-8 py-4 px-1"
    >
      
      {/* Intro Header */}
      <div className="text-center space-y-3.5 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-glass-border rounded-full text-[10px] font-mono text-text-muted font-bold">
          <Sparkles size={11} className="text-violet-400 animate-pulse" />
          <span>AI Command Core</span>
        </div>
        
        <h2 className="text-xl lg:text-[28px] font-bold tracking-tight text-text-primary leading-tight">
          Decompose and time-block natural queries
        </h2>
        <p className="text-xs text-text-muted leading-relaxed">
          Enter exams, project briefs, or deadlines. The productivity engine automatically drafts subtasks, computes deadline risk probabilities, and structures focus sessions.
        </p>
      </div>

      {/* Flagship Command Input Box */}
      <div className="bg-surface border border-glass-border rounded-[24px] p-6 shadow-sm relative overflow-hidden">
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(query);
          }}
          className="relative flex items-center"
        >
          <Sparkles className="absolute left-4.5 text-text-muted" size={16} />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I have DAA exam in 5 days and React project due next Friday..."
            className="w-full bg-background border border-glass-border rounded-2xl pl-12 pr-28 py-4 text-xs text-text-primary placeholder-text-muted outline-none focus:border-violet-500/50 transition-colors shadow-inner"
            disabled={isProcessing}
          />

          <div className="absolute right-3.5 flex items-center gap-2">
            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[10px] text-text-muted hover:text-text-primary font-mono px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className="bg-text-primary hover:bg-neutral-200 text-background px-3.5 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-50 disabled:hover:bg-text-primary cursor-pointer shadow-sm"
            >
              <span>{isProcessing ? 'Thinking...' : 'Compile'}</span>
              <CornerDownLeft size={10} />
            </button>
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="mt-6 space-y-3">
          <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted font-bold block">Suggested instructions:</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item.text);
                  handleSubmit(item.text);
                }}
                className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-glass-border hover:border-violet-500/30 rounded-2xl text-left transition-all text-xs flex flex-col justify-between h-24 hover:-translate-y-0.5 cursor-pointer shadow-sm"
                disabled={isProcessing}
              >
                <span className="text-[10px] font-bold text-text-primary leading-snug">{item.label}</span>
                <span className="text-[9px] text-text-muted truncate w-full block mt-2">{item.text}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Skeletons/Process indicators (Fast & Professional) */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="h-4 w-32 bg-white/5 rounded-full animate-pulse border border-glass-border" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div 
                variants={skeletonVariants}
                animate="animate"
                className="bg-surface border border-glass-border rounded-3xl p-6 h-52 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                  <div className="h-3 w-3/4 bg-white/5 rounded-full" />
                </div>
                <div className="h-10 w-full bg-white/5 rounded-xl" />
              </motion.div>

              <motion.div 
                variants={skeletonVariants}
                animate="animate"
                className="bg-surface border border-glass-border rounded-3xl p-6 h-52 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                  <div className="h-3 w-3/4 bg-white/5 rounded-full" />
                </div>
                <div className="h-10 w-full bg-white/5 rounded-xl" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synthesis Compilation Results Feed */}
      {!isProcessing && resultMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          
          {/* Status Message */}
          <div className="p-4 bg-white/[0.01] border border-glass-border rounded-2xl flex items-start gap-3.5 shadow-sm">
            <CheckCircle2 className="text-[#22C55E] shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="text-xs font-bold text-text-primary">AI Compilation Summary</h4>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{resultMessage}</p>
            </div>
          </div>

          {/* Render seed/relevant tasks decomposition */}
          {relevantTasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-muted">Decomposed Milestones & Calendars</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {relevantTasks.map(task => {
                  const taskEvents = getEventsForTask(task.id);
                  const isHighRisk = task.failureProbability !== undefined && task.failureProbability > 70;

                  return (
                    <Card key={task.id} className="p-6 flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-text-primary leading-snug">{task.title}</h4>
                            <p className="text-[10px] text-text-muted mt-1 leading-normal">{task.description}</p>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 bg-white/5 border border-glass-border text-text-secondary">
                            {task.category}
                          </span>
                        </div>

                        {/* Effort & Risk Indicators */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="p-2.5 bg-white/[0.01] rounded-xl border border-glass-border flex items-center gap-2">
                            <Clock size={14} className="text-text-muted" />
                            <div>
                              <div className="text-[8px] text-text-muted uppercase font-mono font-semibold">EST. EFFORT</div>
                              <div className="text-[11px] font-bold text-text-primary font-mono">{task.estimatedHours} Hours</div>
                            </div>
                          </div>

                          <div className="p-2.5 bg-white/[0.01] rounded-xl border border-glass-border flex items-center gap-2">
                            <AlertCircle size={14} className={isHighRisk ? 'text-rose-400' : 'text-text-muted'} />
                            <div>
                              <div className="text-[8px] text-text-muted uppercase font-mono font-semibold">DEFAULT RISK</div>
                              <div className={`text-[11px] font-bold font-mono ${isHighRisk ? 'text-rose-400' : 'text-text-secondary'}`}>
                                {task.failureProbability}% Miss Prob
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Failure Reason */}
                        {task.failureReason && (
                          <p className="text-[10px] text-text-secondary bg-rose-500/[0.02] p-2.5 rounded-xl border border-rose-500/10 font-mono leading-normal">
                            <span className="text-rose-400 uppercase font-bold text-[8px] block mb-0.5">Risk Factor:</span>
                            {task.failureReason}
                          </p>
                        )}

                        {/* Subtask Decomposition */}
                        {task.subtasks.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-mono uppercase text-text-muted tracking-wider font-bold">Subtask Checklist:</span>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                              {task.subtasks.map(st => (
                                <div key={st.id} className="flex items-center gap-2 text-[10px] text-text-secondary">
                                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                                  <span className="truncate flex-1">{st.title}</span>
                                  <span className="text-[8px] text-text-muted font-mono">({st.estimatedMinutes}m)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Calendar Slots allocated */}
                        {taskEvents.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-mono uppercase text-text-muted tracking-wider font-bold">Calendar Focus Reserves:</span>
                            <div className="space-y-1.5">
                              {taskEvents.map(event => {
                                const eventStart = new Date(event.start);
                                return (
                                  <div key={event.id} className="p-2.5 bg-white/[0.01] border border-glass-border rounded-xl flex items-center justify-between text-[10px] text-text-secondary">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Calendar size={12} className="text-violet-400 shrink-0" />
                                      <span className="truncate font-semibold">{event.title.replace('Deep Focus: ', '')}</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-text-muted shrink-0">
                                      {eventStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {eventStart.getHours()}:00
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rescue Mode activation Trigger */}
                      {isHighRisk && !task.rescuePlanActive && (
                        <div className="pt-3.5 border-t border-glass-border flex justify-between items-center gap-3">
                          <span className="text-[10px] text-text-muted font-medium">Rescue workflow ready</span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={async () => {
                              await activateRescueMode(task.id);
                              setActiveTab('rescue');
                            }}
                            className="text-[10px] font-bold px-3.5 py-1.5 rounded-xl bg-white text-black"
                            leftIcon={<ShieldAlert size={12} />}
                          >
                            Activate Rescue
                          </Button>
                        </div>
                      )}

                      {task.rescuePlanActive && (
                        <div className="pt-3.5 border-t border-glass-border flex justify-between items-center gap-3 text-[10px] text-emerald-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} />
                            Rescue Plan Locked
                          </span>
                          <button 
                            onClick={() => setActiveTab('rescue')} 
                            className="text-text-muted hover:text-text-primary font-bold underline cursor-pointer text-[10px]"
                          >
                            View Rescue Board
                          </button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>
      )}

    </motion.div>
  );
};
