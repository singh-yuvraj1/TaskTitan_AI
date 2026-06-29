import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
}

export interface DropdownProps {
  label?: string;
  trigger?: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  trigger,
  items,
  onSelect,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={containerRef}>
      <div>
        {trigger ? (
          <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
            {trigger}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            <span>{label || 'Options'}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-1.5 w-44 origin-top-right rounded-lg bg-neutral-950 border border-neutral-850
            shadow-elevated p-1 focus:outline-none
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          <div className="py-0.5 space-y-0.5" role="menu">
            {items.map((item) => (
              <button
                key={item.value}
                onClick={() => handleItemClick(item.value)}
                role="menuitem"
                className={`
                  w-full text-left rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-2
                  ${item.destructive 
                    ? 'text-rose-400 hover:bg-rose-950/20' 
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  }
                `}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
