import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-card border border-glass-border rounded-[24px] shadow-elevated backdrop-blur-md overflow-hidden transition-all duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_12px_40px_-12px_var(--shadow-color)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`px-7 py-5 border-b border-glass-border bg-white/[0.01] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`text-sm font-bold text-text-primary tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p
      className={`text-xs text-text-muted mt-1 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`px-7 py-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`px-7 py-5 border-t border-glass-border bg-white/[0.01] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
