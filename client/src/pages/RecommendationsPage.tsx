import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { tasks, streak, focusHours } = useApp();

  const getDynamicRecommendations = () => {
    const recs = [];
    const highRiskTask = tasks.find(t => !t.completed && t.failureProbability > 70);
    const overdueTask = tasks.find(t => !t.completed && new Date(t.deadline).getTime() < Date.now());
    
    if (highRiskTask) {
      recs.push({
        id: 'rec-1',
        title: "Deadline Rescue Active Profile",
        message: `Task "${highRiskTask.title}" carries a ${highRiskTask.failureProbability}% failure risk. Run Rescue Agent to lock focus blocks.`,
        type: 'rescue',
        actionLabel: 'Activate Rescue Mode',
        actionTab: 'rescue'
      });
    }
    if (overdueTask) {
      recs.push({
        id: 'rec-2',
        title: "Overdue Milestones Detected",
        message: `"${overdueTask.title}" has passed its scheduled deadline. Reschedule to safeguard consistency ratings.`,
        type: 'rescue',
        actionLabel: 'Go to AI Calendar',
        actionTab: 'calendar'
      });
    }
    if (streak < 3) {
      recs.push({
        id: 'rec-3',
        title: "Discipline Boost Advisable",
        message: `Current streak is ${streak}d. Log a Daily Focus ritual today to trigger your consistency multiplier.`,
        type: 'coach',
        actionLabel: 'Configure Daily Rituals',
        actionTab: 'dna'
      });
    } else {
      recs.push({
        id: 'rec-4',
        title: "Maintain Focus Streak",
        message: `You are on a strong ${streak}-day coding streak. Protect it with a Pomodoro session today.`,
        type: 'coach',
        actionLabel: 'Start Pomodoro Session',
        actionTab: 'dna'
      });
    }
    if (focusHours < 12) {
      recs.push({
        id: 'rec-5',
        title: "Schedule Deep Focus",
        message: `Focus hours stand at ${focusHours.toFixed(1)}h. Allocate study blocks inside your peak evening hours.`,
        type: 'coach',
        actionLabel: 'Schedule Focus Block',
        actionTab: 'calendar'
      });
    } else {
      recs.push({
        id: 'rec-6',
        title: "Burnout Prevention Warning",
        message: `Daily focus metrics are high (${focusHours.toFixed(1)}h). Coach Agent recommends a cool-down block after coding.`,
        type: 'coach',
        actionLabel: 'Review Work/Life Balance',
        actionTab: 'dna'
      });
    }
    return recs;
  };

  const { setActiveTab } = useApp();
  const recs = getDynamicRecommendations();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Sparkles size={22} className="text-violet-400" />
            <span>AI Recommendation Engine</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">Autonomous workspace recommendations based on active risk telemetry.</p>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {recs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-neutral-850 rounded-xl bg-neutral-950/40">
            <CheckCircle2 size={36} className="text-emerald-500 mb-3" />
            <h3 className="text-sm font-medium text-neutral-300">Operational Status Nominal</h3>
            <p className="text-xs text-neutral-500 mt-1">No recommendations generated. Your workspace parameters are stable.</p>
          </div>
        ) : (
          recs.map(rec => (
            <div 
              key={rec.id} 
              className={`p-5 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                rec.type === 'rescue' 
                  ? 'bg-rose-950/5 border-rose-950/60 text-neutral-200' 
                  : 'bg-neutral-900/20 border-neutral-800 text-neutral-200'
              }`}
            >
              <div className="flex gap-3.5">
                <div className="pt-0.5 select-none text-base">
                  {rec.type === 'rescue' ? (
                    <AlertTriangle className="text-rose-400" size={18} />
                  ) : (
                    <TrendingUp className="text-violet-400" size={18} />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{rec.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed mt-1">{rec.message}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab(rec.actionTab)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-white transition-all whitespace-nowrap self-start sm:self-center"
              >
                {rec.actionLabel}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom Info Widget */}
      <div className="bg-neutral-950/40 border border-neutral-850 rounded-xl p-4 flex gap-3 text-xs text-neutral-500">
        <Sparkles size={16} className="text-neutral-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-neutral-400">About the Recommendation Engine:</span> The recommendations displayed are dynamically compiled based on your current focus streak, overdue tasks, active risk metrics, and workload analysis. It provides contextual shortcuts to help optimize coding consistency and minimize deadline defaults.
        </div>
      </div>
    </div>
  );
};
