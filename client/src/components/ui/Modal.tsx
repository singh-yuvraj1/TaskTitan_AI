import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerActions,
  size = 'md',
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <motion.div 
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' as any }}
        className={`
          relative w-full bg-card border border-glass-border rounded-[24px] shadow-elevated
          overflow-hidden flex flex-col max-h-[90vh] z-10
          ${sizeClasses[size]}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-start px-7 pt-6 pb-3 bg-white/[0.01]">
          <div className="space-y-0.5">
            {title && (
              <h3 className="text-sm font-bold text-text-primary tracking-tight">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-text-muted leading-relaxed">{description}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/5 border border-glass-border rounded-xl text-text-muted hover:text-text-primary shrink-0 ml-4 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-7 py-5 flex-1 overflow-y-auto text-xs text-text-secondary leading-relaxed border-t border-glass-border border-b border-glass-border">
          {children}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="px-7 py-4 flex justify-end gap-2 bg-white/[0.01] shrink-0">
            {footerActions}
          </div>
        )}
      </motion.div>
    </div>
  );
};
