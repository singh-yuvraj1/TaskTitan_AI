import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Settings, History, Wifi, RefreshCw } from 'lucide-react';
import type { KaiOrbState } from './useKaiConversation';

interface KaiHeaderProps {
  orbState: KaiOrbState;
  onClose: () => void;
  onToggleVoice: () => void;
  onClearHistory: () => void;
  isListening: boolean;
}

const stateColors: Record<KaiOrbState, string> = {
  idle: 'bg-emerald-400',
  listening: 'bg-emerald-400',
  processing: 'bg-cyan-400',
  thinking: 'bg-violet-400',
  speaking: 'bg-amber-400',
};

const stateLabels: Record<KaiOrbState, string> = {
  idle: 'Connected',
  listening: 'Listening',
  processing: 'Processing',
  thinking: 'Thinking',
  speaking: 'Speaking',
};

const KaiHeader: React.FC<KaiHeaderProps> = ({
  orbState, onClose, onToggleVoice, onClearHistory, isListening
}) => {
  const dotColor = stateColors[orbState];
  const statusLabel = stateLabels[orbState];

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] bg-white/[0.015] shrink-0">
      {/* Kai Avatar */}
      <div className="relative shrink-0">
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 flex items-center justify-center border border-white/15 shadow-lg shadow-violet-900/30"
          animate={
            orbState !== 'idle'
              ? { boxShadow: ['0 0 10px rgba(139,92,246,0.3)', '0 0 25px rgba(139,92,246,0.6)', '0 0 10px rgba(139,92,246,0.3)'] }
              : {}
          }
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-lg">✨</span>
        </motion.div>

        {/* Status dot */}
        <motion.div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080b1a] ${dotColor}`}
          animate={orbState !== 'idle' ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white tracking-tight">Kai AI</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={orbState}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2 }}
              className={`text-[10px] font-semibold ${dotColor.replace('bg-', 'text-')}`}
            >
              {statusLabel}
            </motion.span>
          </AnimatePresence>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-[10px] text-white/30">Productivity Coach</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Voice toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={onToggleVoice}
          title="Voice mode"
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center border transition-all
            ${isListening
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
            }
          `}
        >
          <Mic size={14} />
        </motion.button>

        {/* Clear history */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={onClearHistory}
          title="Clear conversation"
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw size={13} />
        </motion.button>

        {/* Close */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: 90 }}
          whileTap={{ scale: 0.93 }}
          onClick={onClose}
          title="Close Kai"
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={14} />
        </motion.button>
      </div>
    </div>
  );
};

export default KaiHeader;
