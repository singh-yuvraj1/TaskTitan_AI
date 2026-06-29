import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Calendar, Grid3X3, Clock, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { HeatmapSkeleton } from '../components/SkeletonLoader';

export const HeatmapPage: React.FC = () => {
  const { activityHistory, isLoading } = useApp();
  const [viewType, setViewType] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [hoveredCell, setHoveredCell] = useState<any>(null);

  // Set number of weeks based on the selected filter
  const getGridConfig = () => {
    switch (viewType) {
      case 'weekly':
        return { cols: 6, rows: 7 }; // ~6 weeks
      case 'monthly':
        return { cols: 18, rows: 7 }; // ~4 months
      case 'yearly':
        return { cols: 52, rows: 7 }; // 1 full year
    }
  };

  const { cols, rows } = getGridConfig();
  const totalDays = cols * rows;

  // Build grid blocks backwards from today
  const cells = Array.from({ length: totalDays }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - idx));
    const dateStr = d.toISOString().split('T')[0];

    const activity = activityHistory[dateStr] || { xpEarned: 0, focusHours: 0, tasksCompleted: 0 };
    const xp = activity.xpEarned;
    const hours = activity.focusHours;
    const tasks = activity.tasksCompleted;

    // Heatmap levels (0 to 3) based on contribution
    let colorClass = 'bg-neutral-900 border-neutral-950/20';
    let level = 0;

    if (hours >= 4 || xp >= 150 || tasks >= 3) {
      colorClass = 'bg-neutral-300 border-neutral-200';
      level = 3;
    } else if (hours >= 2 || xp >= 80 || tasks >= 2) {
      colorClass = 'bg-neutral-500 border-neutral-600/30';
      level = 2;
    } else if (hours > 0 || xp > 0 || tasks > 0) {
      colorClass = 'bg-neutral-800 border-neutral-700/20';
      level = 1;
    }

    const formattedDate = d.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return {
      dateStr,
      formattedDate,
      xp,
      hours,
      tasks,
      colorClass,
      level,
      isToday: dateStr === new Date().toISOString().split('T')[0]
    };
  });

  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: { text: string; colIdx: number }[] = [];
    let currentMonth = '';

    for (let c = 0; c < cols; c++) {
      const cellIdx = c * rows;
      const cellDate = new Date();
      cellDate.setDate(cellDate.getDate() - (totalDays - 1 - cellIdx));
      const mName = months[cellDate.getMonth()];

      // Show labels separated by spacing
      if (mName !== currentMonth && c % (viewType === 'weekly' ? 2 : 4) === 0) {
        labels.push({ text: mName, colIdx: c });
        currentMonth = mName;
      }
    }
    return labels;
  };

  const handleMouseEnter = (e: React.MouseEvent, cell: any) => {
    const cellRect = e.currentTarget.getBoundingClientRect();
    const parentElement = e.currentTarget.closest('.heatmap-container-main');
    if (parentElement) {
      const parentRect = parentElement.getBoundingClientRect();
      setHoveredCell({
        ...cell,
        x: cellRect.left - parentRect.left + cellRect.width / 2,
        y: cellRect.top - parentRect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  // Stats summaries
  const totalCompleted = cells.reduce((acc, c) => acc + c.tasks, 0);
  const totalHours = cells.reduce((acc, c) => acc + c.hours, 0);
  const totalXp = cells.reduce((acc, c) => acc + c.xp, 0);

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-6">
      
      {/* Header & filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-900">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Grid3X3 size={20} className="text-neutral-400" />
            <span>Productivity Grid</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">Timeline of completed milestones, locked study blocks, and consistency stats.</p>
        </div>

        {/* View togglers */}
        <div className="flex gap-1.5 border border-neutral-850 p-1 rounded-lg bg-neutral-950/40">
          {(['weekly', 'monthly', 'yearly'] as const).map(type => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`
                px-3 py-1 rounded-md text-[10px] font-mono capitalize transition-all
                ${viewType === type 
                  ? 'bg-neutral-900 text-white border border-neutral-800' 
                  : 'text-neutral-500 hover:text-neutral-300'
                }
              `}
            >
              {type} view
            </button>
          ))}
        </div>
      </div>

      {/* Grid Showcase Card */}
      {isLoading ? (
        <HeatmapSkeleton />
      ) : (
        <Card className="bg-neutral-950/20 border-neutral-850 p-6 heatmap-container-main relative">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-neutral-900">
            <div className="text-xs text-neutral-400 font-medium">Activity Contribution Timeline</div>
            
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded bg-neutral-900 border border-neutral-950/25" />
              <div className="w-2.5 h-2.5 rounded bg-neutral-800 border border-neutral-700/20" />
              <div className="w-2.5 h-2.5 rounded bg-neutral-500 border border-neutral-600/35" />
              <div className="w-2.5 h-2.5 rounded bg-neutral-300 border border-neutral-200" />
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid Wrapper */}
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="min-w-[500px] flex gap-3 pt-2">
              
              {/* Days Column */}
              <div className="grid grid-rows-7 text-[10px] text-neutral-500 font-mono pr-2 pt-5 h-[105px] justify-items-start align-items-center shrink-0 leading-none">
                <span>Mon</span>
                <span className="opacity-0">Tue</span>
                <span>Wed</span>
                <span className="opacity-0">Thu</span>
                <span>Fri</span>
                <span className="opacity-0">Sat</span>
                <span className="opacity-0">Sun</span>
              </div>

              {/* Grid blocks */}
              <div className="flex-1 flex flex-col">
                {/* Month Header line */}
                <div className="h-4 relative text-[9px] text-neutral-500 font-mono mb-2">
                  {getMonthLabels().map((label, idx) => (
                    <span 
                      key={idx} 
                      className="absolute" 
                      style={{ left: `${(label.colIdx / cols) * 100}%` }}
                    >
                      {label.text}
                    </span>
                  ))}
                </div>

                {/* Grid cell layout */}
                <div 
                  className="grid grid-flow-col gap-1.5 h-[105px] relative"
                  style={{ 
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` 
                  }}
                >
                  {cells.map((cell, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={(e) => handleMouseEnter(e, cell)}
                      onMouseLeave={handleMouseLeave}
                      className={`
                        w-3 h-3 rounded-sm border transition-all duration-150
                        ${cell.colorClass} 
                        ${cell.isToday ? 'ring-1 ring-white scale-105' : ''} 
                        hover:scale-125 hover:z-10 cursor-pointer
                      `}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Floating Tooltip Portal */}
          {hoveredCell && (
            <div 
              className="absolute bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded-lg p-3 shadow-elevated z-50 pointer-events-none w-44 font-mono leading-relaxed"
              style={{
                left: `${hoveredCell.x}px`,
                top: `${hoveredCell.y}px`,
                transform: 'translate(-50%, -100%)',
                marginTop: '-12px'
              }}
            >
              <div className="font-bold text-white mb-1.5 border-b border-neutral-900 pb-1">{hoveredCell.formattedDate}</div>
              <div className="flex justify-between text-neutral-400">
                <span>XP Earned:</span>
                <span className="text-white font-semibold">+{hoveredCell.xp} XP</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Focus hours:</span>
                <span className="text-white font-semibold">{hoveredCell.hours} hrs</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Completed:</span>
                <span className="text-white font-semibold">{hoveredCell.tasks} tasks</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Grid metrics summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <Card className="p-4 bg-neutral-950/20 border-neutral-850 flex items-center gap-3">
          <CheckCircle2 size={16} className="text-neutral-400" />
          <div>
            <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Completed Tasks</div>
            <div className="text-sm font-semibold text-white mt-0.5">{totalCompleted} milestones</div>
          </div>
        </Card>

        <Card className="p-4 bg-neutral-950/20 border-neutral-850 flex items-center gap-3">
          <Clock size={16} className="text-neutral-400" />
          <div>
            <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Cumulative Focus</div>
            <div className="text-sm font-semibold text-white mt-0.5">{totalHours.toFixed(1)} focus hours</div>
          </div>
        </Card>

        <Card className="p-4 bg-neutral-950/20 border-neutral-850 flex items-center gap-3">
          <TrendingUp size={16} className="text-neutral-400" />
          <div>
            <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Total XP Score</div>
            <div className="text-sm font-semibold text-white mt-0.5">{totalXp} XP points</div>
          </div>
        </Card>
      </div>

    </div>
  );
};
