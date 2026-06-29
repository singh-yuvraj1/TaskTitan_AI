import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { GitHubHeatmap } from '../components/GitHubHeatmap';
import { 
  User, CheckSquare, Flame, Sparkles, Brain, 
  Play, Pause, RotateCcw, AlertTriangle, Coffee, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DNAProfile: React.FC = () => {
  const { 
    dnaProfile, habits, toggleHabit, addXp, 
    focusHours, setFocusHours, addNotification 
  } = useApp();

  // Pomodoro States
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<'focus' | 'break'>('focus');
  
  // Distraction Monitor States
  const [distractionsCount, setDistractionsCount] = useState(0);
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);

  // Focus Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            // Timer complete
            handleTimerComplete();
          } else {
            setTimerMinutes(prev => prev - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerMinutes, timerSeconds]);

  // Visibility Distraction Listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerRunning) {
        setDistractionsCount(prev => prev + 1);
        setShowDistractionWarning(true);
        addNotification(
          'Distraction Detected 🚨',
          'You switched tabs/applications during an active Pomodoro Deep Focus block. Focus index reduced.',
          'coach',
          true
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerRunning]);

  const handleTimerComplete = () => {
    setTimerRunning(false);
    confetti({
      particleCount: 100,
      spread: 60,
      colors: ['#00e5ff', '#00e676']
    });

    if (timerType === 'focus') {
      const earnedXp = Math.max(10, 30 - distractionsCount * 5); // reduce reward if distracted
      addXp(earnedXp, 'Completed Pomodoro focus session');
      setFocusHours(prev => prev + 0.5);
      addNotification(
        'Focus Block Secured 🎯',
        `Completed 25m Focus Block! Earned +${earnedXp} XP (Distractions: ${distractionsCount}).`,
        'gamification'
      );
      setTimerMinutes(5); // start short break
      setTimerType('break');
    } else {
      addNotification('Break Concluded ☕', 'Break over! Let\'s resume focus block.', 'coach');
      setTimerMinutes(25);
      setTimerType('focus');
    }
    setDistractionsCount(0);
    setShowDistractionWarning(false);
  };

  const handleReset = () => {
    setTimerRunning(false);
    setTimerMinutes(timerType === 'focus' ? 25 : 5);
    setTimerSeconds(0);
    setDistractionsCount(0);
    setShowDistractionWarning(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 px-1">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="text-neonCyan" size={24} />
          <span>Productivity DNA & Focus Chamber</span>
        </h2>
        <p className="text-xs text-white/50">Analyze cognitive patterns, record focus habits, and perform deep work sprints.</p>
      </div>

      {/* Heatmap Row */}
      <GitHubHeatmap />

      {/* Row 2: Pomodoro Chamber & DNA analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pomodoro Chamber */}
        <GlassCard className="lg:col-span-1 p-5 bg-white/5 border border-white/10 flex flex-col justify-between" glowColor={timerRunning ? 'cyan' : 'none'}>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-extrabold tracking-wide text-white uppercase font-mono">
                {timerType === 'focus' ? '🎯 Deep Work Focus Session' : '☕ Cognitive Cool Down'}
              </h3>
              {timerRunning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neonCyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neonCyan"></span>
                </span>
              )}
            </div>

            {/* Timer Screen display */}
            <div className="text-center my-6">
              <div className="text-5xl font-black text-white font-mono tracking-widest">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              <p className="text-[10px] text-white/40 uppercase mt-2 tracking-widest font-mono">
                {timerRunning ? 'Session in progress' : 'Standby'}
              </p>
            </div>

            {/* Focus status meter */}
            {timerRunning && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 mb-4 text-xs space-y-2">
                <div className="flex justify-between font-mono text-[10px]">
                  <span>Distractions Count:</span>
                  <span className={distractionsCount > 0 ? 'text-neonRose font-bold' : 'text-neonEmerald font-bold'}>
                    {distractionsCount} tabs switches
                  </span>
                </div>
                {showDistractionWarning && (
                  <p className="text-[9px] text-neonRose font-mono flex items-center gap-1">
                    <AlertTriangle size={10} className="animate-bounce" />
                    <span>Focus compromised! Keep this tab active to protect XP.</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 border-t border-white/5 pt-4">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                timerRunning
                  ? 'bg-neonRose/20 border border-neonRose/30 text-neonRose hover:bg-neonRose/30'
                  : 'bg-neonCyan text-black font-extrabold hover:opacity-90 shadow-glass-cyan'
              }`}
            >
              {timerRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{timerRunning ? 'Pause Sprint' : 'Initiate Focus'}</span>
            </button>
            
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-white/70 hover:text-white transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </GlassCard>

        {/* DNA analysis card */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
            <Brain className="text-neonViolet" size={16} />
            <span>Productivity DNA Calibration</span>
          </h3>

          <div className="space-y-4 text-xs text-white/70">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-0.5">Peak Performance Window</span>
              <p className="text-sm font-bold text-white flex items-center gap-1">
                <span>🦉 Night Owl Track</span>
                <span className="text-neonViolet text-[10px] font-mono">(9:00 PM - 2:00 AM)</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">Agent Diagnostic Summary</span>
              <p className="leading-relaxed text-[11px] bg-white/5 p-3 rounded-xl border border-white/5">
                {dnaProfile.description}
              </p>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neonCyan block mb-1">Tailored Recommendations:</span>
              <ul className="space-y-1.5 pl-4 list-disc text-[11px] text-white/60">
                {dnaProfile.recommendations.map((rec, idx) => (
                  <li key={idx} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Focus Habits */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <CheckSquare className="text-neonEmerald" size={16} />
              <span>Daily Focus Rituals</span>
            </h3>

            <div className="space-y-3">
              {habits.map(habit => {
                const todayStr = new Date().toISOString().split('T')[0];
                const checked = habit.completedDates.includes(todayStr);

                return (
                  <div 
                    key={habit.id} 
                    className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleHabit(habit.id)}
                        className="w-4 h-4 rounded border-white/20 bg-transparent text-neonEmerald focus:ring-neonEmerald cursor-pointer"
                      />
                      <span className={`text-xs font-bold transition-all ${checked ? 'text-white/40 line-through' : 'text-white'}`}>
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[10px] text-neonRose">
                      <Flame size={12} className="fill-neonRose text-neonRose" />
                      <span>{habit.streak}d streak</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/5 pt-3 mt-4 text-[9px] font-mono text-white/30 text-center">
            Completing habits awards +10 XP and intensity scales on contribution grids.
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
