import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent, Task } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  Calendar as CalendarIcon, Clock, Sparkles, Plus, Trash2, 
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, 
  MapPin, User, GripVertical, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CalendarPlanner: React.FC = () => {
  const { 
    calendarEvents, 
    tasks, 
    triggerAIReschedule, 
    deleteCalendarEvent, 
    addCalendarEvent, 
    addNotification,
    focusHours,
    streak,
    isLoading
  } = useApp();

  const [activeView, setActiveView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Interaction states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [movingEvent, setMovingEvent] = useState<CalendarEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDuration, setQuickDuration] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);

  // Time grid configuration (8:00 AM to 10:00 PM)
  const startHour = 8;
  const endHour = 22;
  const hoursArray = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Sync Google Calendar Simulation
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);

  const handleGoogleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncEnabled(true);
      
      const today = new Date();
      const events: CalendarEvent[] = [
        {
          id: `cal-google-1-${Date.now()}`,
          title: '📅 Sync: Team Standup',
          start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30).toISOString(),
          isAiScheduled: false
        },
        {
          id: `cal-google-2-${Date.now()}`,
          title: '📅 Sync: Mentor Review',
          start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0).toISOString(),
          end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0).toISOString(),
          isAiScheduled: false
        }
      ];
      events.forEach(e => addCalendarEvent(e));
      
      addNotification(
        'Google Calendar Synced',
        'Retrieved synced events and populated your focus grids.',
        'calendar'
      );
    }, 1200);
  };

  // Helper date generators
  const getWeekDays = (refDate: Date) => {
    const start = new Date(refDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Start on Monday
    start.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getMonthDays = (refDate: Date) => {
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    const firstDayOfWeek = firstDay.getDay();
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // offset to Monday

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset; i > 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i + 1),
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (activeView === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -1 : 1));
    } else if (activeView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getEventsForSlot = (date: Date, hour: number) => {
    return calendarEvents.filter(event => {
      const start = new Date(event.start);
      return isSameDay(start, date) && start.getHours() === hour;
    });
  };

  const getDeadlinesForDate = (date: Date) => {
    return tasks.filter(task => {
      if (task.completed) return false;
      return isSameDay(new Date(task.deadline), date);
    });
  };

  const isTaskScheduled = (taskId: string) => {
    return calendarEvents.some(e => e.taskId === taskId);
  };

  const unscheduledTasks = tasks.filter(t => !t.completed && !isTaskScheduled(t.id));

  const handleSlotClick = (date: Date, hour: number) => {
    if (selectedTask) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + selectedTask.estimatedHours);

      const newEvent: CalendarEvent = {
        id: `cal-task-${Date.now()}`,
        title: `Deep Focus: ${selectedTask.title}`,
        start: start.toISOString(),
        end: end.toISOString(),
        taskId: selectedTask.id,
        isAiScheduled: true
      };

      addCalendarEvent(newEvent);
      addNotification(
        'Focus Scheduled',
        `Locked in "${selectedTask.title}" on ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${hour}:00.`,
        'calendar'
      );
      setSelectedTask(null);
    } else if (movingEvent) {
      const durationMs = new Date(movingEvent.end).getTime() - new Date(movingEvent.start).getTime();
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + durationMs);

      const updatedEvent: CalendarEvent = {
        ...movingEvent,
        start: start.toISOString(),
        end: end.toISOString()
      };

      deleteCalendarEvent(movingEvent.id);
      addCalendarEvent(updatedEvent);
      addNotification(
        'Time Slot Adjusted',
        `Rescheduled "${movingEvent.title}" to ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}.`,
        'calendar'
      );
      setMovingEvent(null);
    } else {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      setSelectedSlot({ date: slotDate, hour });
      setQuickTitle('');
      setShowAddModal(true);
    }
  };

  const handleCreateQuickBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !selectedSlot) return;

    const start = new Date(selectedSlot.date);
    const end = new Date(start.getTime() + quickDuration * 60 * 1000);

    const newEvent: CalendarEvent = {
      id: `cal-quick-${Date.now()}`,
      title: quickTitle,
      start: start.toISOString(),
      end: end.toISOString(),
      isAiScheduled: false
    };

    addCalendarEvent(newEvent);
    setShowAddModal(false);
    setSelectedSlot(null);
  };

  const formatHourLabel = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${ampm}`;
  };

  // Animations variants
  const sidebarVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as any } }
  };

  const gridVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as any } }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 px-1">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-surface border border-glass-border p-5 rounded-[24px] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-text-primary tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-text-muted" size={18} />
            <span>Workspace Planner</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">Time block focus slots, map deadlines, and coordinate schedules.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Selection Tab */}
          <div className="flex p-1 bg-background border border-glass-border rounded-xl">
            {(['day', 'week', 'month'] as const).map(view => (
              <button
                key={view}
                onClick={() => {
                  setActiveView(view);
                  setSelectedTask(null);
                  setMovingEvent(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeView === view 
                    ? 'bg-card text-text-primary shadow-sm border border-glass-border' 
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Sync Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoogleSync}
            disabled={isSyncing}
            className={`text-xs border border-glass-border rounded-xl ${
              syncEnabled 
                ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' 
                : 'text-text-secondary bg-white/[0.02] hover:bg-white/5'
            }`}
          >
            {isSyncing ? 'Syncing...' : syncEnabled ? 'Google Synced' : 'Sync Google Calendar'}
          </Button>

          {/* AI Optimizer Sweep */}
          <Button
            variant="primary"
            size="sm"
            onClick={triggerAIReschedule}
            leftIcon={<Sparkles size={13} className="text-white animate-pulse" />}
            className="text-xs"
          >
            AI Reschedule Sweep
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Unscheduled & Context Sidebar */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={sidebarVariants}
          className="space-y-4 lg:col-span-1"
        >
          {/* Drag & Schedule Simulation Guide */}
          <div className="p-5 bg-surface border border-glass-border rounded-[24px] shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles size={14} className="text-violet-400" />
              <span>Interactive Planner</span>
            </h3>
            <p className="text-[10px] text-text-muted leading-relaxed">
              Click any unscheduled task in the list below, then click an empty calendar cell to assign a focus block. 
            </p>
            
            <AnimatePresence>
              {selectedTask && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-between text-[10px] text-violet-300"
                >
                  <span className="truncate font-semibold flex items-center gap-1">🎯 Ready: {selectedTask.title}</span>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="text-text-muted hover:text-text-primary font-bold underline ml-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
              {movingEvent && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-between text-[10px] text-cyan-300"
                >
                  <span className="truncate font-semibold flex items-center gap-1">🚚 Moving: {movingEvent.title}</span>
                  <button 
                    onClick={() => setMovingEvent(null)}
                    className="text-text-muted hover:text-text-primary font-bold underline ml-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Unscheduled Tasks List */}
          <div className="bg-surface border border-glass-border rounded-[24px] shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-glass-border">
              <h3 className="text-xs font-bold text-text-primary">Unallocated Items</h3>
              <span className="text-[9px] font-mono text-text-muted bg-background px-2.5 py-0.5 rounded-full border border-glass-border">
                {unscheduledTasks.length} pending
              </span>
            </div>
            
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="p-3.5 bg-white/5 border border-glass-border rounded-xl space-y-3">
                      <div className="flex justify-between">
                        <div className="h-3.5 bg-white/10 rounded w-2/3" />
                        <div className="h-3 bg-white/10 rounded w-8" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-2 bg-white/10 rounded w-12" />
                        <div className="h-2 bg-white/10 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : unscheduledTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2 bg-white/[0.01] border border-glass-border rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-text-muted">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-semibold text-text-primary">All blocks allocated</h4>
                    <p className="text-[10px] text-text-muted max-w-[150px] mx-auto font-sans leading-normal">
                      All active tasks are time-blocked or completed.
                    </p>
                  </div>
                </div>
              ) : (
                unscheduledTasks.map(task => {
                  const isSelected = selectedTask?.id === task.id;
                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(isSelected ? null : task);
                        setMovingEvent(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 hover:border-violet-500/35 hover:-translate-y-0.5 ${
                        isSelected 
                          ? 'border-violet-500 bg-violet-500/[0.03] shadow-md' 
                          : 'border-glass-border bg-white/[0.01]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-text-primary leading-snug line-clamp-2">{task.title}</span>
                        <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          task.priority === 'Urgent-Important' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-white/5 text-text-muted border border-glass-border'
                        }`}>
                          {task.priority === 'Urgent-Important' ? 'Urgent' : 'Routine'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 text-[9px] text-text-muted font-mono">
                        <span className="flex items-center gap-1.5">
                          <Clock size={10} />
                          {task.estimatedHours}h est.
                        </span>
                        <span>
                          Due {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Burnout & Focus Stats */}
          <div className="bg-surface border border-glass-border rounded-[24px] shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary">Focus Metrics</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-text-muted">Weekly Target:</span>
                <span className="text-text-primary font-bold">20.0 Hours</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-text-muted">Focus Completed:</span>
                <span className="text-emerald-400 font-bold">{focusHours.toFixed(1)} Hours</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-text-muted">Consistency Streak:</span>
                <span className="text-amber-400 font-bold">{streak} Days 🔥</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* main Calendar Grid */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={gridVariants}
          className="lg:col-span-3 bg-surface border border-glass-border rounded-[24px] shadow-sm overflow-hidden flex flex-col"
        >
          {/* Calendar Inner Navigation Header */}
          <div className="flex justify-between items-center p-5 border-b border-glass-border bg-surface">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateDate('prev')}
                className="p-1.5 hover:bg-white/5 border border-glass-border rounded-xl transition-colors text-text-muted hover:text-text-primary"
              >
                <ChevronLeft size={14} />
              </button>
              
              <h3 className="text-xs font-bold text-text-primary tracking-tight uppercase min-w-[130px] text-center">
                {activeView === 'day' && currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                {activeView === 'week' && (
                  <>
                    {weekDays[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </>
                )}
                {activeView === 'month' && currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </h3>

              <button 
                onClick={() => navigateDate('next')}
                className="p-1.5 hover:bg-white/5 border border-glass-border rounded-xl transition-colors text-text-muted hover:text-text-primary"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-[10px] font-bold text-text-secondary hover:text-text-primary border border-glass-border px-3 py-1 rounded-xl bg-background hover:bg-white/5 transition-colors"
            >
              Today
            </button>
          </div>

          {/* Render Active View */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[650px] divide-y divide-glass-border">
              
              {/* Day / Week Column Titles */}
              {activeView !== 'month' && (
                <div className="grid grid-cols-8 bg-surface sticky top-0 backdrop-blur-md z-10 border-b border-glass-border">
                  <div className="p-3 text-[9px] font-mono text-text-muted text-center uppercase tracking-wider">Time</div>
                  
                  {activeView === 'day' ? (
                    <div className="col-span-7 p-3 text-xs font-bold text-text-primary flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span>{currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>
                  ) : (
                    weekDays.map((day, i) => {
                      const isToday = isSameDay(day, new Date());
                      return (
                        <div 
                          key={i} 
                          className={`p-3 text-center transition-colors border-l border-glass-border/40 ${
                            isToday ? 'bg-white/[0.01]' : ''
                          }`}
                        >
                          <div className="text-[9px] font-mono text-text-muted uppercase tracking-wider">
                            {day.toLocaleDateString([], { weekday: 'short' })}
                          </div>
                          <div className={`text-xs font-bold mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            isToday ? 'bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white' : 'text-text-primary'
                          }`}>
                            {day.getDate()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Day View Grid */}
              {activeView === 'day' && (
                <div className="divide-y divide-glass-border/40 select-none">
                  {/* Deadline Indicator Banner */}
                  {getDeadlinesForDate(currentDate).length > 0 && (
                    <div className="p-3.5 bg-rose-500/5 border-b border-rose-500/10 text-[10px] text-rose-400 font-semibold flex items-center gap-2 px-5">
                      <AlertCircle size={13} className="shrink-0 text-rose-500" />
                      <span>
                        Deadline Alert: {getDeadlinesForDate(currentDate).map(t => `"${t.title}"`).join(', ')} due today!
                      </span>
                    </div>
                  )}

                  {hoursArray.map(hour => {
                    const slotEvents = getEventsForSlot(currentDate, hour);
                    return (
                      <div key={hour} className="grid grid-cols-8 min-h-[58px] group transition-colors hover:bg-white/[0.01]">
                        {/* Hour Label */}
                        <div className="p-2 text-[9px] font-mono text-text-muted text-center flex items-center justify-center border-r border-glass-border/40">
                          {formatHourLabel(hour)}
                        </div>

                        {/* Event Slots */}
                        <div 
                          onClick={() => handleSlotClick(currentDate, hour)}
                          className="col-span-7 p-2 relative flex flex-col gap-2 cursor-pointer min-h-[58px]"
                        >
                          {slotEvents.length === 0 ? (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-white/[0.02] text-[9px] font-mono text-text-muted transition-opacity">
                              {selectedTask ? `Schedule block: "${selectedTask.title}"` : 'Click to add block'}
                            </div>
                          ) : (
                            slotEvents.map(event => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMovingEvent(event);
                                  setSelectedTask(null);
                                }}
                                className={`px-4.5 py-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                                  event.isAiScheduled
                                    ? 'bg-card border-violet-500/30 hover:border-violet-500/50 text-white shadow-sm shadow-violet-500/5'
                                    : 'bg-background border-glass-border hover:border-neutral-700 text-text-secondary'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Clock size={12} className="text-text-muted shrink-0" />
                                    <span className="text-xs font-bold truncate leading-tight">{event.title}</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteCalendarEvent(event.id);
                                      addNotification('Block Cleared', `Deleted calendar block: "${event.title}".`, 'calendar');
                                    }}
                                    className="text-text-muted hover:text-rose-400 p-0.5 rounded transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[9px] font-mono text-text-muted">
                                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {event.isAiScheduled && (
                                    <span className="text-[8px] font-mono bg-violet-500/10 px-2 py-0.2 rounded border border-violet-500/20 text-violet-400 font-semibold">
                                      AI Focus
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Week View Grid */}
              {activeView === 'week' && (
                <div className="divide-y divide-glass-border/40 select-none">
                  {hoursArray.map(hour => (
                    <div key={hour} className="grid grid-cols-8 min-h-[64px] group">
                      {/* Hour Label */}
                      <div className="p-2 text-[9px] font-mono text-text-muted text-center flex items-center justify-center border-r border-glass-border/40 bg-surface">
                        {formatHourLabel(hour)}
                      </div>

                      {/* Day Columns */}
                      {weekDays.map((dayDate, dayIdx) => {
                        const slotEvents = getEventsForSlot(dayDate, hour);
                        const dayDeadlines = getDeadlinesForDate(dayDate);
                        
                        return (
                          <div 
                            key={dayIdx}
                            onClick={() => handleSlotClick(dayDate, hour)}
                            className="p-1 relative border-l border-glass-border/40 min-h-[64px] flex flex-col gap-1 cursor-pointer hover:bg-white/[0.01] transition-colors"
                          >
                            {/* Deadline markers */}
                            {dayDeadlines.length > 0 && hour === startHour && (
                              <div className="absolute top-0.5 inset-x-1 py-0.5 px-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[8px] text-rose-400 font-bold tracking-tight truncate z-10 animate-pulse">
                                🚨 DL: {dayDeadlines[0].title}
                              </div>
                            )}

                            {slotEvents.map(event => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMovingEvent(event);
                                  setSelectedTask(null);
                                }}
                                className={`px-2 py-1.5 rounded-lg border text-left transition-all overflow-hidden text-ellipsis ${
                                  event.isAiScheduled
                                    ? 'bg-card border-violet-500/20 hover:border-violet-500/40 text-white shadow-sm shadow-violet-500/5'
                                    : 'bg-background border-glass-border hover:border-neutral-700 text-text-secondary'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-[10px] font-bold truncate leading-tight">{event.title.replace('Deep Focus: ', '')}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteCalendarEvent(event.id);
                                    }}
                                    className="text-text-muted hover:text-rose-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                                <div className="text-[8px] font-mono text-text-muted mt-0.5">
                                  {new Date(event.start).getHours()}:00
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* Month View Grid */}
              {activeView === 'month' && (
                <div className="grid grid-cols-7 divide-x divide-glass-border border-b border-glass-border bg-surface">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
                    <div key={h} className="p-2.5 text-center text-[9px] font-mono text-text-muted uppercase tracking-wider font-semibold">
                      {h}
                    </div>
                  ))}
                </div>
              )}

              {activeView === 'month' && (
                <div className="grid grid-cols-7 grid-rows-5 min-h-[500px] divide-x divide-y divide-glass-border bg-surface select-none">
                  {monthDays.map((daySlot, index) => {
                    const date = daySlot.date;
                    const isToday = isSameDay(date, new Date());
                    
                    const dayEvents = calendarEvents.filter(e => isSameDay(new Date(e.start), date));
                    const dayDeadlines = getDeadlinesForDate(date);

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (selectedTask) {
                            handleSlotClick(date, 10);
                          } else {
                            setCurrentDate(date);
                            setActiveView('day');
                          }
                        }}
                        className={`p-2.5 flex flex-col gap-1 min-h-[95px] cursor-pointer transition-colors hover:bg-white/[0.01] ${
                          daySlot.isCurrentMonth ? 'bg-surface' : 'bg-background/20 text-text-muted/40'
                        } ${isToday ? 'bg-violet-500/[0.02]' : ''}`}
                      >
                        {/* Day indicator */}
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg ${
                            isToday ? 'bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white' : 'text-text-muted'
                          }`}>
                            {date.getDate()}
                          </span>
                          
                          {dayDeadlines.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse" title="Deadline today" />
                          )}
                        </div>

                        {/* Deadlines listings */}
                        {dayDeadlines.slice(0, 1).map(dl => (
                          <div key={dl.id} className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[8px] text-rose-400 font-bold truncate leading-normal">
                            🚨 DL: {dl.title}
                          </div>
                        ))}

                        {/* Events list */}
                        <div className="flex-1 space-y-1 overflow-hidden mt-1.5">
                          {dayEvents.slice(0, 3).map(event => (
                            <div 
                              key={event.id}
                              className={`px-2 py-0.5 rounded-lg text-[8px] truncate border font-bold ${
                                event.isAiScheduled
                                  ? 'bg-card border-violet-500/10 text-white shadow-sm'
                                  : 'bg-background border-glass-border text-text-secondary'
                              }`}
                            >
                              {event.title.replace('Deep Focus: ', '')}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[7px] font-mono text-text-muted text-right px-1">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </motion.div>

      </div>

      {/* Quick Add Custom Focus Slot Modal */}
      <AnimatePresence>
        {showAddModal && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-glass-border rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-elevated"
            >
              <div>
                <h3 className="text-sm font-bold text-text-primary">Create Custom Focus Slot</h3>
                <p className="text-[10px] text-text-muted mt-1">
                  Scheduling block on {selectedSlot.date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {formatHourLabel(selectedSlot.hour)}
                </p>
              </div>
              
              <form onSubmit={handleCreateQuickBlock} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase text-text-muted font-semibold">Block Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solve Leetcode trees"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full bg-background border border-glass-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase text-text-muted font-semibold">Duration</label>
                  <select
                    value={quickDuration}
                    onChange={(e) => setQuickDuration(Number(e.target.value))}
                    className="w-full bg-background border border-glass-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-violet-500/50 transition-colors"
                  >
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="90">1.5 Hours</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    type="button" 
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedSlot(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Confirm block
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
