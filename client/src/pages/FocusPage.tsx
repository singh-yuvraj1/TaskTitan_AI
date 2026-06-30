import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Play, Pause, RotateCcw, ShieldAlert, Sparkles,
  Coffee, Zap, AlertTriangle, CheckCircle2, TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = 'http://localhost:5000/api';

export const FocusPage: React.FC = () => {
  const { focusHours, setFocusHours, addNotification, addXp, fetchUserState } = useApp();

  // Timer Configuration (In Seconds)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSessionType, setActiveSessionType] = useState<'focus' | 'break'>('focus');
  const [durationPreset, setDurationPreset] = useState(25); // In minutes

  // Distraction variables
  const [distractions, setDistractions] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Backend session tracking
  const activeSessionIdRef = useRef<string | null>(null);
  const [backendStats, setBackendStats] = useState<{
    totalSessions: number;
    totalFocusHours: number;
    completedSessions: number;
  } | null>(null);

  const timerRef = useRef<any>(null);

  // Load backend stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/focus/stats`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setBackendStats({
              totalSessions: json.data.totalSessions,
              totalFocusHours: json.data.totalFocusHours,
              completedSessions: json.data.completedSessions
            });
            // Sync completed session count with backend
            setCompletedSessions(json.data.totalSessions);
          }
        }
      } catch {
        // Silently fail — local stats still work
      }
    };
    loadStats();
  }, []);

  // Time Formatter
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, activeSessionType, durationPreset]);

  // Tab Visibility distraction detector
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && activeSessionType === 'focus') {
        setDistractions(prev => prev + 1);
        setShowWarning(true);
        addNotification(
          'Focus Interrupted 🚨',
          'You navigated away from your coding workspace during an active focus block.',
          'rescue'
        );
        setTimeout(() => setShowWarning(false), 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, activeSessionType]);

  // Start session — calls backend
  const startSession = async () => {
    if (activeSessionType !== 'focus') return;
    try {
      const res = await fetch(`${API_BASE}/focus/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'pomodoro',
          targetDurationMinutes: durationPreset
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?._id) {
          activeSessionIdRef.current = json.data._id;
        }
      }
    } catch {
      // Silently fail — timer still works locally
    }
  };

  // End session — calls backend and awards XP
  const endSession = async (wasCompleted: boolean) => {
    if (activeSessionType !== 'focus') return;
    try {
      const body: any = { completed: wasCompleted };
      if (activeSessionIdRef.current) body.sessionId = activeSessionIdRef.current;

      await fetch(`${API_BASE}/focus/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      activeSessionIdRef.current = null;
    } catch {
      // Silently fail — local XP/focus-hours still get logged
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    clearInterval(timerRef.current);

    if (activeSessionType === 'focus') {
      const addedHours = Number((durationPreset / 60).toFixed(2));
      setFocusHours(prev => Number((prev + addedHours).toFixed(1)));
      setCompletedSessions(prev => prev + 1);

      // Award XP locally (also happens server-side via /api/focus/end)
      addXp(30, `Conquered Pomodoro Focus Block (${durationPreset}m)`);
      addNotification(
        'Focus Block Completed 🏆',
        `Nice focus sprint! You finished a ${durationPreset} minute block. +30 XP credited.`,
        'gamification'
      );

      // Sync session end to backend, then refresh state (updates heatmap)
      await endSession(true);
      await fetchUserState();

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      addNotification(
        'Break Ended ☕',
        'Break session completed. Ready to lock in next focus block?',
        'coach'
      );
    }

    // Toggle session
    const nextType = activeSessionType === 'focus' ? 'break' : 'focus';
    const nextDuration = nextType === 'focus' ? 25 : 5;
    setActiveSessionType(nextType);
    setDurationPreset(nextDuration);
    setTimeLeft(nextDuration * 60);
  };

  const handlePresetSelect = (minutes: number, type: 'focus' | 'break') => {
    // If switching away from an active focus session, end it early
    if (isRunning && activeSessionType === 'focus' && activeSessionIdRef.current) {
      endSession(false);
    }
    setIsRunning(false);
    setActiveSessionType(type);
    setDurationPreset(minutes);
    setTimeLeft(minutes * 60);
  };

  const toggleTimer = async () => {
    if (!isRunning && activeSessionType === 'focus' && !activeSessionIdRef.current) {
      // Starting a new focus session — call backend
      await startSession();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (isRunning && activeSessionType === 'focus' && activeSessionIdRef.current) {
      endSession(false);
    }
    setIsRunning(false);
    setTimeLeft(durationPreset * 60);
  };

  const focusEfficiency = distractions === 0 ? 100 : Math.max(20, Math.round(100 - distractions * 15));
  // Show backend stats when available, else fall back to local
  const displayedSessions = backendStats ? backendStats.totalSessions + completedSessions - (backendStats.totalSessions) : completedSessions;
  const displayedFocusHours = backendStats
    ? parseFloat((backendStats.totalFocusHours).toFixed(1))
    : focusHours;

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">

      {/* Header */}
      <div className="pb-4 border-b border-neutral-900">
        <h2 className="text-xl font-bold text-white tracking-tight">Focus Chamber</h2>
        <p className="text-xs text-neutral-500 mt-1">Deep focus time blocking, Pomodoro sequencing, and workspace distraction monitoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Timer Control Card (Left / 7 cols) */}
        <div className="lg:col-span-7">
          <Card className="bg-neutral-950/20 border-neutral-850 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[380px]">
            {/* Distraction warning banner */}
            {showWarning && (
              <div className="absolute top-4 inset-x-4 p-3 bg-rose-950/40 border border-rose-900/35 rounded-lg flex items-center gap-2 text-rose-300 text-xs animate-pulse justify-center">
                <AlertTriangle size={14} className="shrink-0 text-rose-400" />
                <span>Distraction detected! Focus score decreased. Keep tab active.</span>
              </div>
            )}

            {/* Session indicator */}
            <div className="mb-4">
              <Badge variant={activeSessionType === 'focus' ? 'info' : 'success'}>
                {activeSessionType === 'focus' ? '🎯 Deep Work Focus Session' : '☕ Rest Recovery Break'}
              </Badge>
            </div>

            {/* Clock Face */}
            <div className="text-6xl md:text-7xl font-bold font-mono tracking-tight text-white my-6">
              {formatTime(timeLeft)}
            </div>

            {/* Presets Row */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <button
                onClick={() => handlePresetSelect(25, 'focus')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${durationPreset === 25 && activeSessionType === 'focus'
                  ? 'bg-neutral-900 border-neutral-700 text-white'
                  : 'bg-transparent border-neutral-900 text-neutral-500 hover:text-neutral-300'
                  }`}
              >
                25m Focus
              </button>
              <button
                onClick={() => handlePresetSelect(50, 'focus')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${durationPreset === 50 && activeSessionType === 'focus'
                  ? 'bg-neutral-900 border-neutral-700 text-white'
                  : 'bg-transparent border-neutral-900 text-neutral-500 hover:text-neutral-300'
                  }`}
              >
                50m Focus
              </button>
              <button
                onClick={() => handlePresetSelect(5, 'break')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${durationPreset === 5 && activeSessionType === 'break'
                  ? 'bg-neutral-900 border-neutral-700 text-white'
                  : 'bg-transparent border-neutral-900 text-neutral-500 hover:text-neutral-300'
                  }`}
              >
                5m Break
              </button>
              <button
                onClick={() => handlePresetSelect(15, 'break')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${durationPreset === 15 && activeSessionType === 'break'
                  ? 'bg-neutral-900 border-neutral-700 text-white'
                  : 'bg-transparent border-neutral-900 text-neutral-500 hover:text-neutral-300'
                  }`}
              >
                15m Break
              </button>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={toggleTimer}
                leftIcon={isRunning ? <Pause size={14} /> : <Play size={14} />}
              >
                {isRunning ? 'Pause Block' : 'Start Focus'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={resetTimer}
                leftIcon={<RotateCcw size={14} />}
              >
                Reset
              </Button>
            </div>
          </Card>
        </div>

        {/* Focus Stats Side Panel (Right / 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-neutral-950/20 border-neutral-850 p-6 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="pb-3 border-b border-neutral-900">
                <h3 className="text-sm font-semibold text-white tracking-tight">Focus Analytics</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Real-time parameters analyzing focus productivity.</p>
              </div>

              {/* Stats values */}
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Cumulative Time:</span>
                  <span className="text-white font-semibold">{displayedFocusHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Completed Sessions:</span>
                  <span className="text-white font-semibold">{completedSessions} blocks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Distraction Events:</span>
                  <span className={`font-semibold ${distractions > 2 ? 'text-rose-400' : 'text-neutral-300'}`}>
                    {distractions} counts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Focus Efficiency:</span>
                  <span className={`font-semibold ${focusEfficiency > 80 ? 'text-emerald-400' : focusEfficiency > 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                    {focusEfficiency}%
                  </span>
                </div>
              </div>
            </div>

            {/* Distraction info block */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex gap-2 text-[10px] text-neutral-500 leading-normal mt-4">
              <ShieldAlert size={14} className="text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <strong>Distraction Guard Active:</strong> Toggling tabs or applications during an active focus block raises distraction events and reduces focus efficiency ratings. Stay on this workspace to protect consistency metrics.
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};
