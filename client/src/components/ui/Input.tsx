import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  wrapperClassName = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-[11px] font-bold text-text-muted select-none">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`
          w-full bg-background border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder-text-muted
          transition-colors duration-150 outline-none
          ${error 
            ? 'border-danger focus:border-danger' 
            : 'border-glass-border focus:border-violet-500/50'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-danger">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-[10px] text-text-muted">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  className = '',
  wrapperClassName = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-[11px] font-bold text-text-muted select-none">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`
          w-full bg-background border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder-text-muted
          transition-colors duration-150 outline-none min-h-[90px] resize-y
          ${error 
            ? 'border-danger focus:border-danger' 
            : 'border-glass-border focus:border-violet-500/50'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-danger">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-[10px] text-text-muted">{helperText}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helperText,
  className = '',
  wrapperClassName = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={selectId} className="block text-[11px] font-bold text-text-muted select-none">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          w-full bg-background border rounded-xl px-3.5 py-2.5 text-xs text-text-secondary
          transition-colors duration-150 outline-none cursor-pointer
          ${error 
            ? 'border-danger focus:border-danger' 
            : 'border-glass-border focus:border-violet-500/50'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-surface text-text-primary">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[10px] font-bold text-danger">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-[10px] text-text-muted">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
