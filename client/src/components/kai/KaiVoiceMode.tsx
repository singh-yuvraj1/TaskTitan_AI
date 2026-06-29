import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Mic, MicOff, X } from 'lucide-react';
import type { KaiOrbState } from './useKaiConversation';

// ─── Waveform Bars ────────────────────────────────────────────────────────────

interface WaveformProps {
  state: KaiOrbState;
}

const NUM_BARS = 12;

const WaveformBars: React.FC<WaveformProps> = ({ state }) => {
  const isActive = state === 'listening' || state === 'speaking';
  const isProcessing = state === 'processing' || state === 'thinking';

  const barColors: Record<KaiOrbState, string> = {
    idle: 'bg-white/20',
    listening: 'bg-emerald-400',
    processing: 'bg-cyan-400',
    thinking: 'bg-violet-400',
    speaking: 'bg-amber-400',
  };

  const barColor = barColors[state];

  return (
    <div className="flex items-center justify-center gap-1.5 h-16">
      {Array.from({ length: NUM_BARS }).map((_, i) => {
        const seed = i / NUM_BARS;
        const baseDelay = seed * 0.4;
        const baseDuration = 0.5 + seed * 0.4;

        return (
          <motion.div
            key={i}
            className={`rounded-full w-1.5 ${barColor} transition-colors duration-500`}
            animate={
              isActive
                ? {
                    height: ['6px', `${16 + Math.sin(seed * Math.PI * 2) * 28}px`, '6px'],
                    opacity: [0.6, 1, 0.6],
                  }
                : isProcessing
                ? {
                    height: ['4px', `${8 + Math.cos(seed * Math.PI) * 12}px`, '4px'],
                    opacity: [0.4, 0.8, 0.4],
                  }
                : {
                    height: '4px',
                    opacity: 0.15,
                  }
            }
            transition={
              isActive || isProcessing
                ? {
                    duration: baseDuration,
                    delay: baseDelay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </div>
  );
};

// ─── State Label ──────────────────────────────────────────────────────────────

const stateConfig: Record<KaiOrbState, { label: string; subLabel: string; color: string }> = {
  idle: {
    label: 'Voice Mode',
    subLabel: 'Tap the microphone to speak',
    color: 'text-white/50',
  },
  listening: {
    label: 'Listening...',
    subLabel: 'Speak now — I\'m all ears',
    color: 'text-emerald-300',
  },
  processing: {
    label: 'Processing Speech',
    subLabel: 'Converting your voice to text',
    color: 'text-cyan-300',
  },
  thinking: {
    label: 'Kai is Thinking...',
    subLabel: 'Generating your plan',
    color: 'text-violet-300',
  },
  speaking: {
    label: 'Kai is Speaking',
    subLabel: 'Listen for your response',
    color: 'text-amber-300',
  },
};

// ─── Orbit Ring ───────────────────────────────────────────────────────────────

const OrbRing: React.FC<{ state: KaiOrbState }> = ({ state }) => {
  const ringColors: Record<KaiOrbState, string> = {
    idle: 'border-white/10',
    listening: 'border-emerald-500/60',
    processing: 'border-cyan-500/60',
    thinking: 'border-violet-500/60',
    speaking: 'border-amber-500/60',
  };

  const isAnimated = state !== 'idle';

  return (
    <>
      {/* Outer pulse ring */}
      <AnimatePresence>
        {isAnimated && (
          <motion.div
            key={state}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute inset-0 rounded-full border-2 ${ringColors[state]}`}
          />
        )}
      </AnimatePresence>

      {/* Inner glow orb */}
      <motion.div
        animate={{
          boxShadow: state === 'idle'
            ? '0 0 0px rgba(139, 92, 246, 0)'
            : state === 'listening'
            ? '0 0 30px rgba(52, 211, 153, 0.5), 0 0 60px rgba(52, 211, 153, 0.2)'
            : state === 'thinking'
            ? '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.2)'
            : state === 'speaking'
            ? '0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.2)'
            : '0 0 30px rgba(6, 182, 212, 0.5)',
        }}
        transition={{ duration: 0.5 }}
        className={`
          absolute inset-0 rounded-full border-2 transition-colors duration-500
          ${ringColors[state]}
        `}
      />
    </>
  );
};

// ─── Mic Center Orb ───────────────────────────────────────────────────────────

const MicOrb: React.FC<{ state: KaiOrbState; onToggle: () => void }> = ({ state, onToggle }) => {
  const gradients: Record<KaiOrbState, string> = {
    idle: 'from-violet-700 via-indigo-700 to-purple-700',
    listening: 'from-emerald-500 via-teal-500 to-green-600',
    processing: 'from-cyan-500 via-sky-500 to-blue-600',
    thinking: 'from-violet-500 via-purple-500 to-indigo-600',
    speaking: 'from-amber-500 via-orange-500 to-rose-500',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      onClick={onToggle}
      className={`
        relative w-20 h-20 rounded-full flex items-center justify-center
        bg-gradient-to-br ${gradients[state]}
        shadow-lg transition-all duration-500 cursor-pointer
        border border-white/20
      `}
    >
      <OrbRing state={state} />
      <AnimatePresence mode="wait">
        <motion.div
          key={state === 'idle' ? 'idle' : 'active'}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          {state === 'idle' ? (
            <Mic size={26} className="text-white" />
          ) : state === 'listening' ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <Mic size={26} className="text-white" />
            </motion.div>
          ) : (
            <MicOff size={26} className="text-white/80" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

// ─── KaiVoiceMode Overlay ─────────────────────────────────────────────────────

interface KaiVoiceModeProps {
  isVisible: boolean;
  orbState: KaiOrbState;
  onToggleMic: () => void;
  onClose: () => void;
  transcript?: string;
}

const KaiVoiceMode: React.FC<KaiVoiceModeProps> = ({
  isVisible, orbState, onToggleMic, onClose, transcript = ''
}) => {
  const config = stateConfig[orbState];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md bg-[#060918]/85 rounded-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <X size={14} />
          </button>

          {/* Center content */}
          <div className="flex flex-col items-center gap-6">
            {/* Waveform */}
            <WaveformBars state={orbState} />

            {/* Mic orb */}
            <MicOrb state={orbState} onToggle={onToggleMic} />

            {/* State label + live transcript */}
            <div className="text-center px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={orbState}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`text-base font-bold ${config.color} mb-1`}>
                    {config.label}
                  </div>
                  {transcript ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-white/70 font-medium leading-relaxed mt-2 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 max-w-[220px] mx-auto"
                    >
                      "{transcript}"
                    </motion.div>
                  ) : (
                    <div className="text-xs text-white/30">
                      {config.subLabel}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Tap to dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-6 text-[10px] text-white/20 font-mono"
          >
            Press × to return to chat
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KaiVoiceMode;
