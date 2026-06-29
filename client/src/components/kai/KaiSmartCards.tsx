import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Calendar, AlertTriangle, RefreshCw,
  Zap, BookOpen, Target, TrendingUp, Clock, ExternalLink,
  PlayCircle,
} from 'lucide-react';
import type { KaiSmartCard, FollowUpQuestion, IntentType } from './useKaiConversation';

// ─── Shared Styles ────────────────────────────────────────────────────────────

const cardBase = 'rounded-2xl border p-4 w-full mt-2 overflow-hidden';

// ─── Follow-Up Card (Chip Picker) ─────────────────────────────────────────────

interface FollowUpCardProps {
  question: FollowUpQuestion;
  onChipAnswer: (answer: string) => void;
  disabled?: boolean;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({ question, onChipAnswer, disabled }) => {
  if (question.type !== 'chips' && question.type !== 'select') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${cardBase} bg-[#0e1225]/80 border-white/10`}
    >
      <div className="flex flex-wrap gap-2">
        {question.options?.map((opt, i) => (
          <motion.button
            key={opt}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            onClick={() => !disabled && onChipAnswer(opt)}
            disabled={disabled}
            className={`
              px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all
              ${disabled
                ? 'border-white/5 text-white/20 cursor-not-allowed'
                : 'border-violet-500/30 text-violet-300 bg-violet-500/10 hover:bg-violet-500/25 hover:border-violet-500/60 hover:scale-[1.03] active:scale-[0.97] cursor-pointer'
              }
            `}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Confirmation Card ────────────────────────────────────────────────────────

interface ConfirmationCardProps {
  data: {
    summary: string;
    intent: IntentType;
    params: Record<string, string>;
    extractedTitle?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const intentIcon: Record<IntentType, React.ReactNode> = {
  'schedule-task':     <BookOpen size={16} className="text-cyan-400" />,
  'rescue-plan':       <AlertTriangle size={16} className="text-rose-400" />,
  'plan-week':         <Calendar size={16} className="text-violet-400" />,
  'placement-roadmap': <Target size={16} className="text-amber-400" />,
  'optimize-calendar': <Zap size={16} className="text-emerald-400" />,
  'general':           <TrendingUp size={16} className="text-blue-400" />,
};

const intentLabel: Record<IntentType, string> = {
  'schedule-task':     'Schedule Study Session',
  'rescue-plan':       'Generate Rescue Plan',
  'plan-week':         'Plan My Week',
  'placement-roadmap': 'Placement Roadmap',
  'optimize-calendar': 'Optimize Calendar',
  'general':           'AI Command',
};

const renderBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  data, onConfirm, onCancel, disabled
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    className={`${cardBase} bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border-violet-500/25`}
  >
    {/* Header */}
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
        {intentIcon[data.intent]}
      </div>
      <div>
        <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Action Preview</div>
        <div className="text-xs font-bold text-white/90">{intentLabel[data.intent]}</div>
      </div>
    </div>

    {/* Summary */}
    <div className="text-xs text-white/70 leading-relaxed mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
      {renderBold(data.summary)}
    </div>

    {/* Buttons */}
    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => !disabled && onConfirm()}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold border border-violet-500/30 shadow-lg shadow-violet-900/30 hover:shadow-violet-700/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <CheckCircle2 size={13} />
        Confirm &amp; Create
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => !disabled && onCancel()}
        disabled={disabled}
        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
      >
        Cancel
      </motion.button>
    </div>
  </motion.div>
);

// ─── Task Created Card ────────────────────────────────────────────────────────

interface TaskCreatedCardProps {
  data: {
    intent: IntentType;
    params: Record<string, string>;
    extractedTitle: string;
    duration?: string;
    scheduledTime?: string;
    deadline?: string;
    addedRevision?: boolean;
    taskName?: string;
  };
  onViewTask?: () => void;
  onViewCalendar?: () => void;
  onStartFocus?: () => void;
}

const timeLabel = (t: string) =>
  t.replace(' (8–11 AM)', '').replace(' (12–3 PM)', '').replace(' (6–9 PM)', '').trim();

export const TaskCreatedCard: React.FC<TaskCreatedCardProps> = ({
  data, onViewTask, onViewCalendar, onStartFocus,
}) => {
  const title    = data.taskName || data.extractedTitle || 'Task';
  const duration = data.duration;
  const time     = data.scheduledTime ? timeLabel(data.scheduledTime) : null;
  const deadline = data.deadline || 'tomorrow';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`${cardBase} bg-gradient-to-br from-emerald-950/40 to-teal-950/30 border-emerald-500/25`}
    >
      {/* Success header */}
      <div className="flex items-center gap-2.5 mb-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
          className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
        </motion.div>
        <div>
          <div className="text-[10px] text-emerald-400/60 font-mono uppercase tracking-wider">Created Successfully</div>
          <div className="text-sm font-bold text-emerald-300 leading-tight">{title}</div>
        </div>
      </div>

      {/* Detail chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {duration && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 font-medium">
            <Clock size={9} /> {duration}
          </span>
        )}
        {time && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 font-medium">
            {time}
          </span>
        )}
        {deadline && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 font-medium capitalize">
            {deadline}
          </span>
        )}
      </div>

      {/* XP & sync badges */}
      <div className="flex items-center flex-wrap gap-1.5 mb-4 text-[10px]">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
        >
          +15 XP
        </motion.span>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-bold"
        >
          Dashboard Updated
        </motion.span>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold"
        >
          Calendar Synced
        </motion.span>
        {data.addedRevision && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold"
          >
            + Revision Scheduled
          </motion.span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {onViewTask && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onViewTask}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <ExternalLink size={11} />
            View Task
          </motion.button>
        )}
        {onViewCalendar && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onViewCalendar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <Calendar size={11} />
            Open Calendar
          </motion.button>
        )}
        {onStartFocus && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartFocus}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-xs font-semibold text-violet-300 hover:bg-violet-500/25 hover:text-violet-200 transition-all cursor-pointer"
          >
            <PlayCircle size={11} />
            Start Focus
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Error / Retry Card ───────────────────────────────────────────────────────

interface ErrorCardProps {
  onRetry: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`${cardBase} bg-rose-950/30 border-rose-500/20`}
  >
    <div className="flex items-center gap-2 mb-2.5">
      <AlertTriangle size={15} className="text-rose-400" />
      <span className="text-xs font-bold text-rose-300">Connection Error</span>
    </div>
    <p className="text-[11px] text-rose-200/60 mb-3">
      I couldn't reach the AI engine. Make sure the backend server is running on port 5000, then try again.
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition-all cursor-pointer"
    >
      <RefreshCw size={11} />
      Try Again
    </button>
  </motion.div>
);

// ─── Smart Card Renderer ──────────────────────────────────────────────────────

interface SmartCardRendererProps {
  card: KaiSmartCard;
  onChipAnswer: (answer: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onViewTask: () => void;
  onViewCalendar: () => void;
  onStartFocus: () => void;
  onRetry: () => void;
  disabled?: boolean;
}

export const SmartCardRenderer: React.FC<SmartCardRendererProps> = ({
  card, onChipAnswer, onConfirm, onCancel,
  onViewTask, onViewCalendar, onStartFocus, onRetry, disabled,
}) => {
  switch (card.type) {
    case 'followup':
      return (
        <FollowUpCard
          question={card.data.question as FollowUpQuestion}
          onChipAnswer={onChipAnswer}
          disabled={disabled}
        />
      );
    case 'confirmation':
      return (
        <ConfirmationCard
          data={card.data as any}
          onConfirm={onConfirm}
          onCancel={onCancel}
          disabled={disabled}
        />
      );
    case 'task-created':
      return (
        <TaskCreatedCard
          data={card.data as any}
          onViewTask={onViewTask}
          onViewCalendar={onViewCalendar}
          onStartFocus={onStartFocus}
        />
      );
    case 'analytics':
      if (card.data.error) return <ErrorCard onRetry={onRetry} />;
      return null;
    default:
      return null;
  }
};
