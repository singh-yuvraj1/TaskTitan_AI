import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const GitHubHeatmap: React.FC = () => {
  const { activityHistory } = useApp();
  const [hoveredCell, setHoveredCell] = useState<any>(null);

  // Create grid coordinates: 22 weeks, 7 days per week = 154 blocks
  const cols = 22;
  const rows = 7;
  const totalDays = cols * rows;

  // Calculate past date items
  const cells = Array.from({ length: totalDays }).map((_, idx) => {
    const d = new Date();
    // Offset backwards
    d.setDate(d.getDate() - (totalDays - 1 - idx));
    const dateStr = d.toISOString().split('T')[0];
    
    // Retrieve real logged activity for this date
    const activity = activityHistory[dateStr] || { xpEarned: 0, focusHours: 0, tasksCompleted: 0 };
    const xp = activity.xpEarned;
    const hours = activity.focusHours;
    const tasks = activity.tasksCompleted;

    // Determine intensity color class based on work metrics
    let colorClass = 'bg-white/[0.03] border-glass-border';
    let level = 0;

    if (hours >= 4 || xp >= 200 || tasks >= 3) {
      colorClass = 'bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] border-transparent';
      level = 3;
    } else if (hours >= 2 || xp >= 100 || tasks >= 2) {
      colorClass = 'bg-violet-600/70 border-violet-500/30';
      level = 2;
    } else if (hours > 0 || xp > 0 || tasks > 0) {
      colorClass = 'bg-violet-950/40 border-violet-900/10';
      level = 1;
    }

    const formattedDate = new Date(dateStr).toLocaleDateString([], {
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
      
      if (mName !== currentMonth && c % 4 === 0) {
        labels.push({ text: mName, colIdx: c });
        currentMonth = mName;
      }
    }
    return labels;
  };

  const handleMouseEnter = (e: React.MouseEvent, cell: any) => {
    const cellRect = e.currentTarget.getBoundingClientRect();
    const parentElement = e.currentTarget.closest('.heatmap-container');
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

  return (
    <div className="p-6 bg-card border border-glass-border rounded-[24px] shadow-elevated w-full overflow-x-auto select-none relative heatmap-container">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
            Productivity Contribution Grid
          </h3>
          <p className="text-[10px] text-text-muted mt-0.5">Chronological telemetry of completed tasks, focus blocks, and active XP gains.</p>
        </div>
        
        <div className="flex items-center gap-1 text-[9px] text-text-muted font-mono self-end sm:self-auto">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-white/[0.03] border border-glass-border" />
          <div className="w-2.5 h-2.5 rounded bg-violet-950/40 border border-violet-900/10" />
          <div className="w-2.5 h-2.5 rounded bg-violet-600/70 border border-violet-500/30" />
          <div className="w-2.5 h-2.5 rounded bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]" />
          <span>More</span>
        </div>
      </div>

      <div className="min-w-[440px] flex gap-2 pt-2">
        {/* Days label */}
        <div className="grid grid-rows-7 text-[9px] text-text-muted font-mono pr-2 pt-5 h-[90px] justify-items-start align-items-center">
          <span>Mon</span>
          <span className="opacity-0">Tue</span>
          <span>Wed</span>
          <span className="opacity-0">Thu</span>
          <span>Fri</span>
          <span className="opacity-0">Sat</span>
          <span className="opacity-0">Sun</span>
        </div>

        {/* Heatmap Grid */}
        <div className="flex-1 flex flex-col relative">
          {/* Month labels row */}
          <div className="h-4 relative text-[9px] text-text-muted font-mono mb-1.5">
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

          {/* Grid Blocks */}
          <div 
            className="grid grid-flow-col gap-1 h-[90px] relative"
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
                  w-2.5 h-2.5 rounded-sm border transition-all duration-150
                  ${cell.colorClass} 
                  ${cell.isToday ? 'ring-1 ring-cyan-400 scale-110 z-10' : ''} 
                  hover:scale-135 hover:z-20 cursor-pointer
                `}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip Portal (Framer Motion Enhanced) */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div 
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute bg-surface border border-glass-border text-[10px] text-text-secondary rounded-xl p-3 shadow-elevated z-50 pointer-events-none w-44 font-mono leading-relaxed"
            style={{
              left: `${hoveredCell.x}px`,
              top: `${hoveredCell.y}px`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-12px'
            }}
          >
            <div className="font-bold text-text-primary mb-1.5 border-b border-glass-border pb-1">{hoveredCell.formattedDate}</div>
            <div className="flex justify-between text-text-secondary">
              <span>XP Earned:</span>
              <span className="text-cyan-400 font-bold">+{hoveredCell.xp} XP</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Focus Time:</span>
              <span className="text-violet-400 font-bold">{hoveredCell.hours}h</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Completed:</span>
              <span className="text-emerald-400 font-bold">{hoveredCell.tasks} tasks</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
