import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold border select-none tracking-wider uppercase';

  const variants = {
    default: 'bg-white/5 text-text-secondary border-glass-border',
    success: 'bg-[#22C55E]/10 text-success border-[#22C55E]/20',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    danger: 'bg-[#EF4444]/10 text-danger border-[#EF4444]/20',
    info: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
