import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Sparkles, LayoutDashboard, ListTodo, Calendar, Clock, 
  ShieldAlert, Settings, Sun, Moon, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { GlassCard } from './GlassCard';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { 
    tasks, setActiveTab, toggleTheme, theme, triggerAIReschedule, runAICommand, showToast 
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle outside clicks to close palette
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const navigationItems = [
    { label: 'Go to Dashboard', tab: 'dashboard', icon: LayoutDashboard },
    { label: 'Go to AI Command Center', tab: 'command', icon: Sparkles },
    { label: 'Go to Tasks', tab: 'tasks', icon: ListTodo },
    { label: 'Go to Calendar Planner', tab: 'calendar', icon: Calendar },
    { label: 'Go to Focus Mode', tab: 'focus', icon: Clock },
    { label: 'Go to Rescue Mode', tab: 'rescue', icon: ShieldAlert },
    { label: 'Go to Settings', tab: 'settings', icon: Settings },
  ];

  const actionItems = [
    { label: 'Toggle Workspace Theme', action: () => toggleTheme(), icon: theme === 'dark' ? Sun : Moon },
    { label: 'AI Auto-Reschedule Collisions', action: () => triggerAIReschedule(), icon: Calendar },
    { label: 'Activate Emergency Task Rescue', action: () => { setActiveTab('rescue'); showToast('Redirecting to Rescue Mode', 'info'); }, icon: ShieldAlert },
  ];

  // Filter tasks based on query
  const filteredTasks = query
    ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const filteredNav = navigationItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
  const filteredActions = actionItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  // Combine items to list
  const combinedItems: any[] = [
    ...filteredNav.map(item => ({ ...item, type: 'nav' })),
    ...filteredActions.map(item => ({ ...item, type: 'action' })),
    ...filteredTasks.map(task => ({ label: `Search Task: ${task.title}`, task, type: 'task' }))
  ];

  // Handle keys logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, combinedItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + combinedItems.length) % Math.max(1, combinedItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (combinedItems[selectedIndex]) {
          handleExecute(combinedItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedIndex, combinedItems]);

  const handleExecute = (item: any) => {
    if (item.type === 'nav') {
      setActiveTab(item.tab);
    } else if (item.type === 'action') {
      item.action();
    } else if (item.type === 'task') {
      setActiveTab('tasks');
      showToast(`Selected task: ${item.task.title}`, 'info');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-start justify-center pt-24 px-4">
      <div 
        ref={containerRef}
        className="w-full max-w-xl animate-fade-in"
      >
        <GlassCard className="bg-[#0b0c16]/95 border border-white/20 shadow-2xl p-0 overflow-hidden" glowColor="cyan">
          {/* Header Input */}
          <div className="flex items-center border-b border-white/10 px-4 py-3 gap-3">
            <Search className="text-white/40 shrink-0" size={16} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search tasks, run actions, or navigate tabs..."
              className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder-white/30"
            />
            <span className="text-[9px] bg-white/10 text-white/50 border border-white/10 px-1.5 py-0.5 rounded font-mono uppercase">esc</span>
          </div>

          {/* Results List */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {combinedItems.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs font-mono">
                No matching actions or tasks found. Try typing 'theme' or 'tasks'
              </div>
            ) : (
              <div className="space-y-0.5">
                {combinedItems.map((item, idx) => {
                  const Icon = item.icon || ArrowRight;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleExecute(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all
                        ${isSelected 
                          ? 'bg-gradient-to-r from-neonCyan/10 to-neonViolet/10 border border-neonCyan/30 text-white shadow-sm' 
                          : 'border border-transparent text-white/70 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={14} className={isSelected ? 'text-neonCyan' : 'text-white/40'} />
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[9px] text-white/40 font-mono">
                          <span>select</span>
                          <CornerDownLeft size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="flex justify-between items-center bg-black/45 border-t border-white/10 px-4 py-2.5 text-[10px] text-white/40 font-mono">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><span className="border border-white/10 bg-white/5 px-1 py-0.2 rounded font-semibold">↑↓</span> Navigate</span>
              <span className="flex items-center gap-1"><span className="border border-white/10 bg-white/5 px-1 py-0.2 rounded font-semibold">enter</span> Select</span>
            </div>
            <span>Raycast Console v1.0</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
