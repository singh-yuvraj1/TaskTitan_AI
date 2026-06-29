import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'rose' | 'emerald' | 'violet' | 'none';
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'none', 
  onClick 
}) => {
  const getGlowStyle = () => {
    switch (glowColor) {
      case 'cyan':
        return 'border-cyan-500/20 bg-cyan-950/10 hover:border-cyan-500/35';
      case 'rose':
        return 'border-rose-500/25 bg-rose-950/10 hover:border-rose-500/40';
      case 'emerald':
        return 'border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/35';
      case 'violet':
        return 'border-violet-500/20 bg-violet-950/10 hover:border-violet-500/35';
      default:
        return 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/60';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        rounded-xl 
        border 
        transition-all 
        duration-200 
        ${getGlowStyle()} 
        ${onClick ? 'cursor-pointer transform hover:-translate-y-0.5' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};
