import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import type { KaiMessage } from './useKaiConversation';
import { SmartCardRenderer } from './KaiSmartCards';

// ─── Markdown Renderer ────────────────────────────────────────────────────────

const renderMarkdown = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Code block (inline)
    if (line.startsWith('```')) {
      return null; // handled as blocks
    }

    // Bold + inline code rendering
    const parts = line.split(/(\*\*.*?\*\*|`[^`]+`)/g);
    const rendered = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 font-mono text-[10px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

    // Bullet
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={lineIdx} className="flex gap-2 items-start">
          <span className="text-violet-400 mt-0.5 shrink-0">•</span>
          <span>{rendered.slice(1)}</span>
        </div>
      );
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex gap-2 items-start">
          <span className="text-violet-400 font-mono text-[10px] mt-0.5 shrink-0">{numMatch[1]}.</span>
          <span>{numMatch[2]}</span>
        </div>
      );
    }

    // Empty line
    if (!line.trim()) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    return <div key={lineIdx}>{rendered}</div>;
  }).filter(Boolean);
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 6 }}
    className="flex gap-3 items-end"
  >
    {/* Kai avatar */}
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 border border-white/10">
      <span className="text-xs">✨</span>
    </div>

    {/* Dots bubble */}
    <div className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-bl-sm flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400/70"
          animate={{ y: ['0px', '-5px', '0px'], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.7,
            delay: i * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  </motion.div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: KaiMessage;
  onChipAnswer: (answer: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onViewTask: () => void;
  onViewCalendar: () => void;
  onStartFocus: () => void;
  onRetry: () => void;
  isLatestKai: boolean;
  phase: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message, onChipAnswer, onConfirm, onCancel,
  onViewTask, onViewCalendar, onStartFocus, onRetry, isLatestKai, phase
}) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-full`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
          <User size={13} className="text-white/70" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 border border-white/10 shadow-md shadow-violet-900/30">
          <span className="text-xs">✨</span>
        </div>
      )}

      {/* Bubble + card */}
      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        {/* Text bubble */}
        {message.text && (
          <div
            className={`
              px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${isUser
                ? 'bg-gradient-to-br from-violet-600/90 to-indigo-700/90 text-white rounded-br-sm border border-violet-500/30 shadow-lg shadow-violet-900/20'
                : 'bg-white/[0.04] border border-white/[0.08] text-white/85 rounded-bl-sm'
              }
            `}
          >
            <div className="space-y-0.5 text-[13px]">
              {renderMarkdown(message.text)}
            </div>
            {/* Streaming cursor */}
            {message.isStreaming && (
              <motion.span
                className="inline-block w-0.5 h-3.5 bg-violet-400/80 ml-1 align-middle rounded-full"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              />
            )}
          </div>
        )}

        {/* Smart card */}
        {message.card && !message.isStreaming && (
          <div className="w-full">
            <SmartCardRenderer
              card={message.card}
              onChipAnswer={onChipAnswer}
              onConfirm={onConfirm}
              onCancel={onCancel}
              onViewTask={onViewTask}
              onViewCalendar={onViewCalendar}
              onStartFocus={onStartFocus}
              onRetry={onRetry}
              disabled={!isLatestKai || phase === 'executing'}
            />
          </div>
        )}

        {/* Timestamp */}
        <div className="text-[9px] text-white/20 font-mono px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

// ─── KaiMessageList ───────────────────────────────────────────────────────────

interface KaiMessageListProps {
  messages: KaiMessage[];
  isTyping: boolean;
  phase: string;
  onChipAnswer: (answer: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onViewTask: () => void;
  onViewCalendar: () => void;
  onStartFocus: () => void;
  onRetry: () => void;
}

const KaiMessageList: React.FC<KaiMessageListProps> = ({
  messages, isTyping, phase,
  onChipAnswer, onConfirm, onCancel, onViewTask, onViewCalendar, onStartFocus, onRetry,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Find the index of the last Kai message (for enabling smart card interactions)
  const lastKaiIdx = messages.reduceRight((acc, msg, i) => acc === -1 && msg.role === 'kai' ? i : acc, -1);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onChipAnswer={onChipAnswer}
            onConfirm={onConfirm}
            onCancel={onCancel}
            onViewTask={onViewTask}
            onViewCalendar={onViewCalendar}
            onStartFocus={onStartFocus}
            onRetry={onRetry}
            isLatestKai={idx === lastKaiIdx}
            phase={phase}
          />
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {isTyping && <TypingIndicator />}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
};

export default KaiMessageList;
