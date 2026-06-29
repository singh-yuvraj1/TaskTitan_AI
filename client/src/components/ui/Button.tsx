import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] text-white hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] border border-transparent rounded-xl',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-glass-border hover:scale-[1.03] rounded-xl backdrop-blur-sm',
    outline: 'bg-transparent text-text-secondary hover:text-white border border-glass-border hover:bg-white/5 hover:scale-[1.03] rounded-xl',
    ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-white/5 rounded-xl',
    danger: 'bg-[#EF4444] text-white hover:bg-red-600 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-transparent rounded-xl',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-4.5 py-2 text-xs gap-2 h-9.5',
    lg: 'px-5 py-2.5 text-sm gap-2 h-11',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 size={14} className="animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
