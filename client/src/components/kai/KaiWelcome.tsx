import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ShieldAlert, Map, Zap, BookOpen } from 'lucide-react';

interface Prompt {
  icon: React.ReactNode;
  label: string;
  text: string;
  accent: string;
  bg: string;
}

const PROMPTS: Prompt[] = [
  {
    icon: <Calendar size={15} />,
    label: 'Plan my week',
    text: 'Plan my week',
    accent: 'text-violet-300',
    bg: 'hover:border-violet-500/40 hover:bg-violet-500/10',
  },
  {
    icon: <BookOpen size={15} />,
    label: 'Schedule exam prep',
    text: 'Schedule exam preparation',
    accent: 'text-cyan-300',
    bg: 'hover:border-cyan-500/40 hover:bg-cyan-500/10',
  },
  {
    icon: <ShieldAlert size={15} />,
    label: 'Generate Rescue Plan',
    text: 'Generate rescue plan',
    accent: 'text-rose-300',
    bg: 'hover:border-rose-500/40 hover:bg-rose-500/10',
  },
  {
    icon: <Map size={15} />,
    label: 'Placement Roadmap',
    text: 'Prepare placement roadmap',
    accent: 'text-amber-300',
    bg: 'hover:border-amber-500/40 hover:bg-amber-500/10',
  },
  {
    icon: <Zap size={15} />,
    label: 'Optimize Calendar',
    text: 'Optimize calendar',
    accent: 'text-emerald-300',
    bg: 'hover:border-emerald-500/40 hover:bg-emerald-500/10',
  },
];

interface KaiWelcomeProps {
  userName: string;
  onPromptClick: (text: string) => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

const KaiWelcome: React.FC<KaiWelcomeProps> = ({ userName, onPromptClick }) => {
  const greeting = getGreeting();
  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : 'Developer';

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8 overflow-y-auto">
      {/* Avatar + greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        {/* Kai avatar orb */}
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 flex items-center justify-center mb-5 shadow-xl shadow-violet-900/30 border border-white/10"
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(139,92,246,0.3)',
              '0 0 40px rgba(139,92,246,0.5)',
              '0 0 20px rgba(139,92,246,0.3)',
            ] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-2xl">✨</span>
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-1.5 tracking-tight">
          {greeting}, {displayName} 👋
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          I'm Kai, your AI productivity coach.<br />
          What would you like to plan today?
        </p>
      </motion.div>

      {/* Suggested prompts */}
      <div className="space-y-2.5">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-3"
        >
          Suggested actions
        </motion.p>

        {PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt.text}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ x: 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPromptClick(prompt.text)}
            className={`
              w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
              bg-white/[0.03] border border-white/8
              ${prompt.bg}
              transition-all duration-200 cursor-pointer text-left group
            `}
          >
            <span className={`${prompt.accent} shrink-0 transition-colors`}>
              {prompt.icon}
            </span>
            <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">
              {prompt.label}
            </span>
            <motion.span
              className={`ml-auto ${prompt.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
              initial={false}
            >
              →
            </motion.span>
          </motion.button>
        ))}
      </div>

      {/* Capabilities hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 p-3 rounded-xl bg-white/[0.02] border border-white/5"
      >
        <p className="text-[10px] text-white/25 leading-relaxed text-center font-mono">
          Kai can create tasks · schedule focus blocks · build rescue plans ·
          update XP · sync calendar · ask smart follow-up questions
        </p>
      </motion.div>
    </div>
  );
};

export default KaiWelcome;
