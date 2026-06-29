import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { KaiOrbState } from './useKaiConversation';

interface KaiOrbProps {
  orbState: KaiOrbState;
  onClick: () => void;
}

const KaiOrb: React.FC<KaiOrbProps> = ({ orbState, onClick }) => {
  const gradients: Record<KaiOrbState, string> = {
    idle: 'from-violet-600 via-indigo-600 to-purple-700',
    listening: 'from-emerald-500 via-teal-500 to-green-600',
    processing: 'from-cyan-500 via-sky-500 to-blue-600',
    thinking: 'from-cyan-500 via-blue-500 to-violet-600',
    speaking: 'from-amber-400 via-rose-500 to-pink-600',
  };

  const shadows: Record<KaiOrbState, string> = {
    idle: 'shadow-violet-900/50',
    listening: 'shadow-emerald-900/60',
    processing: 'shadow-cyan-900/60',
    thinking: 'shadow-violet-900/60',
    speaking: 'shadow-rose-900/60',
  };

  const ringColors: Record<KaiOrbState, string> = {
    idle: 'border-violet-500/40',
    listening: 'border-emerald-400/60',
    processing: 'border-cyan-400/60',
    thinking: 'border-violet-400/60',
    speaking: 'border-amber-400/60',
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      title="Open Kai AI"
      className={`
        relative w-14 h-14 rounded-full flex items-center justify-center
        bg-gradient-to-br ${gradients[orbState]}
        shadow-xl ${shadows[orbState]}
        border ${ringColors[orbState]}
        transition-all duration-500 cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400
      `}
    >
      {/* Pulse ring — listening */}
      {orbState === 'listening' && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Spin ring — thinking / processing */}
      {(orbState === 'thinking' || orbState === 'processing') && (
        <motion.span
          className="absolute inset-0 rounded-full border-t-2 border-cyan-400/70"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Pulse — speaking */}
      {orbState === 'speaking' && (
        <motion.span
          className="absolute inset-0 rounded-full border border-amber-400/40"
          animate={{ scale: [1, 1.15], opacity: [0.5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Inner icon */}
      <div className="relative z-10">
        <motion.div
          animate={orbState === 'idle' ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={22} className="text-white drop-shadow-sm" />
        </motion.div>
      </div>

      {/* Tooltip */}
      <motion.span
        initial={{ opacity: 0, x: 8 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#0a0d1b]/95 border border-white/10 text-[11px] font-bold text-white whitespace-nowrap pointer-events-none shadow-xl"
      >
        Ask Kai
      </motion.span>
    </motion.button>
  );
};

export default KaiOrb;
