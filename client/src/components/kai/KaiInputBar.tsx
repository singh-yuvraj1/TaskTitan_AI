import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff } from 'lucide-react';

interface KaiInputBarProps {
  onSend: (text: string) => void;
  onToggleVoice: () => void;
  isListening: boolean;
  isDisabled: boolean;
  placeholder?: string;
}

const KaiInputBar: React.FC<KaiInputBarProps> = ({
  onSend, onToggleVoice, isListening, isDisabled, placeholder
}) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    setValue('');
    onSend(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !isDisabled;

  return (
    <div className="px-4 pb-5 pt-3 border-t border-white/[0.07] bg-white/[0.01] shrink-0">
      <div className={`
        flex items-end gap-2.5 rounded-2xl border px-3.5 py-3 transition-all duration-200
        ${isDisabled
          ? 'border-white/5 bg-white/[0.02]'
          : 'border-white/10 bg-white/[0.04] focus-within:border-violet-500/50 focus-within:bg-white/[0.06]'
        }
      `}>
        {/* Voice button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleVoice}
          disabled={isDisabled}
          title={isListening ? 'Stop listening' : 'Start voice mode'}
          className={`
            w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all
            ${isListening
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-900/30'
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
            }
            disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer
          `}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <Mic size={14} />
            </motion.div>
          ) : (
            <Mic size={14} />
          )}
        </motion.button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={placeholder || (isDisabled ? 'Kai is thinking...' : 'Ask Kai anything...')}
          className={`
            flex-1 bg-transparent border-0 outline-none resize-none
            text-sm text-white placeholder-white/25 leading-relaxed
            disabled:opacity-30 disabled:cursor-not-allowed
            max-h-[140px] overflow-y-auto
          `}
          style={{ scrollbarWidth: 'none' }}
        />

        {/* Send button */}
        <AnimatePresence>
          {canSend && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/30 border border-violet-500/30 cursor-pointer"
            >
              <Send size={13} className="text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Hint */}
      <p className="text-[9px] text-white/15 text-center mt-2 font-mono">
        {isListening ? '🎙 Listening... speak now' : 'Enter to send · Shift+Enter for new line'}
      </p>
    </div>
  );
};

export default KaiInputBar;
