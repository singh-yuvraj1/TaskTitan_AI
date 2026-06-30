import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input, TextArea, Select } from './ui/Input';
import { Modal } from './ui/Modal';
import KaiDrawer from './kai/KaiDrawer';
import { 
  LayoutDashboard, ListTodo, Calendar as CalendarIcon, Clock, 
  BarChart3, Grid3X3, Milestone, Settings as SettingsIcon,
  Search, Bell, Plus, Menu, X, LogOut, CheckCircle2, Trophy, ShieldAlert, Award, Sparkles,
  Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    activeTab, setActiveTab, logout, notifications, addTask, 
    markNotificationsAsRead, level, rank, xp, tasks, theme, toggleTheme,
    setCommandPaletteOpen, triggerAIReschedule, userName, userEmail
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Bind keyboard shortcuts: 'N' to add task, '/' to launch command console
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
      if (e.key === '/') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCommandPaletteOpen]);

  // Quick Add Form States
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('NotUrgent-Important');
  const [category, setCategory] = useState('DSA');
  const [estimatedHours, setEstimatedHours] = useState('2');
  const [isAdding, setIsAdding] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'command', label: 'AI Command', icon: Sparkles },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'rescue', label: 'Rescue Mode', icon: ShieldAlert },
    { id: 'focus', label: 'Focus', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'heatmap', label: 'Heatmap', icon: Grid3X3 },
    { id: 'roadmap', label: 'Roadmap', icon: Milestone },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    setIsAdding(true);
    try {
      await addTask(title, desc, new Date(deadline).toISOString());
      setTitle('');
      setDesc('');
      setDeadline('');
      setPriority('NotUrgent-Important');
      setCategory('DSA');
      setEstimatedHours('2');
      setIsQuickAddOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const getXPProgress = () => {
    const currentBase = (level - 1) * 300;
    const progress = xp - currentBase;
    return Math.min(100, Math.max(0, (progress / 300) * 100));
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'rescue': return <ShieldAlert size={14} className="text-rose-400 mt-0.5" />;
      case 'coach': return <Sparkles size={14} className="text-violet-400 mt-0.5" />;
      case 'gamification': return <Trophy size={14} className="text-amber-400 mt-0.5" />;
      default: return <CheckCircle2 size={14} className="text-emerald-400 mt-0.5" />;
    }
  };

  // Focus Recommendations Engine helper
  const getFocusRecommendation = () => {
    const active = tasks.filter(t => !t.completed);
    if (active.length === 0) return null;

    // 1. High risk task that does NOT have rescue plan active
    const highRisk = active.find(t => t.riskScore !== undefined && t.riskScore > 70 && !t.rescuePlanActive);
    if (highRisk) {
      return {
        text: `🚨 High Default Threat: "${highRisk.title}" carries a ${highRisk.riskScore}% risk score. Activate Rescue Mode immediately!`,
        actionTab: 'rescue'
      };
    }

    // 2. Overdue task
    const overdue = active.find(t => new Date(t.deadline).getTime() < Date.now());
    if (overdue) {
      return {
        text: `⚠️ Overdue Target: "${overdue.title}" deadline has passed. Reschedule in Calendar now.`,
        actionTab: 'calendar'
      };
    }

    // 3. Recommended action item based on highest risk task
    const sorted = [...active].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
    const target = sorted[0];
    if (target) {
      return {
        text: `💡 Daily Focus Priority: Spend 90 minutes on "${target.title}" (estimated: ${target.estimatedHours}h remaining).`,
        actionTab: 'focus'
      };
    }

    return null;
  };

  const recommendation = getFocusRecommendation();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-text-primary antialiased font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-glass-border z-40 p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-4 cursor-pointer" onClick={() => handleTabClick('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-background border border-glass-border flex items-center justify-center">
            <span className="font-extrabold text-text-primary text-lg">⚡</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary tracking-tight">TaskTitan-AI</h1>
            <p className="text-[9px] text-text-muted uppercase tracking-widest font-mono">AI Productivity OS</p>
          </div>
        </div>

        {/* User Mini Profile widget */}
        <div className="mt-2 px-2 pb-4">
          <div className="p-3.5 bg-card border border-glass-border rounded-2xl shadow-sm">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold text-text-primary border border-glass-border">
                {(userName || userEmail || 'N').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">{userName || userEmail.split('@')[0] || 'Ninja'}</div>
                <div className="text-[10px] text-text-muted">{rank}</div>
              </div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] h-full rounded-full transition-all duration-300"
                style={{ width: `${getXPProgress()}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-text-muted mt-1.5 font-mono">
              <span>Lvl {level}</span>
              <span>{xp % 300}/300 XP</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative overflow-hidden group
                  ${isActive 
                    ? 'bg-white/[0.03] text-text-primary border-l-2 border-violet-500 pl-3 active-glow font-bold' 
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5 pl-3.5'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={isActive ? 'text-violet-400' : 'text-text-muted group-hover:text-text-primary'} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-2 border-t border-neutral-900">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/10 transition-all"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden flex justify-between items-center bg-neutral-950 border-b border-neutral-850 px-4 py-3 fixed top-0 w-full z-40">
        <div className="flex items-center gap-2" onClick={() => handleTabClick('dashboard')}>
          <span className="text-xl">⚡</span>
          <span className="text-sm font-bold text-white">TaskTitan-AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsQuickAddOpen(true)}
            className="p-1 h-auto text-neutral-400 hover:text-white"
          >
            <Plus size={18} />
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[49px] bg-neutral-950 z-30 p-6 flex flex-col space-y-4">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all
                    ${isActive 
                      ? 'bg-neutral-900 text-white border border-neutral-800' 
                      : 'text-neutral-400 hover:text-neutral-250 hover:bg-neutral-900/30'
                    }
                  `}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-400 bg-rose-950/10 border border-rose-950/20 transition-all"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 lg:pl-64 pt-[49px] lg:pt-0 flex flex-col min-h-screen w-full">
        
        {/* Topbar - Desktop/Tablet */}
        <div className="hidden lg:flex h-16 bg-surface/50 border-b border-glass-border px-8 items-center justify-between z-30 sticky top-0 backdrop-blur-md">
          {/* Left: Search input */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-3.5 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="Search workspace (Press /)"
              className="w-full bg-background border border-glass-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-violet-500/50 transition-colors shadow-sm cursor-pointer"
              onFocus={(e) => {
                setCommandPaletteOpen(true);
                e.currentTarget.blur();
              }}
              readOnly
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Quick Add Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsQuickAddOpen(true)}
              leftIcon={<Plus size={13} />}
            >
              Add Task
            </Button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 hover:bg-white/5 border border-glass-border rounded-xl text-text-muted hover:text-text-primary transition-colors overflow-hidden relative cursor-pointer"
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, rotate: 90, opacity: 0 }}
                  animate={{ y: 0, rotate: 0, opacity: 1 }}
                  exit={{ y: 20, rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 hover:bg-white/5 border border-glass-border rounded-xl text-text-muted hover:text-text-primary transition-colors"
              >
                <Bell size={14} />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-card border border-glass-border rounded-2xl shadow-elevated p-4 z-50 max-h-96 overflow-y-auto backdrop-blur-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-glass-border mb-3">
                    <h4 className="text-xs font-semibold text-text-primary">Notifications</h4>
                    {unreadNotifs.length > 0 && (
                      <button 
                        onClick={markNotificationsAsRead}
                        className="text-[10px] text-text-muted hover:text-text-primary hover:underline"
                      >
                        Clear unread
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-text-muted text-center py-4">No new notifications</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-white/[0.02] border border-glass-border">
                          {getNotifIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-text-primary truncate">{n.title}</span>
                              <span className="text-[8px] text-text-muted shrink-0 font-mono mt-0.5">{n.timestamp}</span>
                            </div>
                            <p className="text-[10px] text-text-secondary leading-normal mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Circle — dynamic user initial */}
            <div className="w-8 h-8 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-xs font-bold text-text-primary hover:bg-white/10 transition-colors cursor-pointer">
              {(userName || userEmail || 'N').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-6">
          {recommendation && (
            <div className="max-w-6xl mx-auto px-5 py-3 bg-card border border-glass-border rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs shadow-sm hover:border-violet-500/30 transition-colors duration-300">
              <div className="text-text-secondary font-medium leading-relaxed">
                {recommendation.text}
              </div>
              <button 
                onClick={() => setActiveTab(recommendation.actionTab)}
                className="text-text-muted hover:text-text-primary font-bold underline shrink-0 cursor-pointer"
              >
                Resolve Action
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Create New Task"
        description="Add a task due date to decompose into subtasks automatically."
      >
        <form onSubmit={handleQuickAddSubmit} className="space-y-4">
          <Input 
            label="Task Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete DAA Assignment"
          />
          <TextArea 
            label="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Provide context or links for this milestone..."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Deadline Date & Time"
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <Select 
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'DSA', label: 'DSA Practice' },
                { value: 'React', label: 'React / Frontend' },
                { value: 'WebDev', label: 'Web Development' },
                { value: 'Backend', label: 'Backend / Database' },
                { value: 'System Design', label: 'System Design' },
                { value: 'General', label: 'General Task' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select 
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'Urgent-Important', label: 'Urgent & Important' },
                { value: 'NotUrgent-Important', label: 'Important (Not Urgent)' },
                { value: 'Urgent-NotImportant', label: 'Urgent (Not Important)' },
                { value: 'NotUrgent-NotImportant', label: 'Routine Tasks' }
              ]}
            />
            <Input 
              label="Estimated Time (Hours)"
              type="number"
              min="1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isAdding}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Floating Quick Action Button (FAB) Menu */}
      <div className="fixed bottom-6 right-24 z-40 group flex flex-col-reverse items-end gap-2.5">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-12 h-12 bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] rounded-full flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Launch command palette (CMD+K)"
        >
          ⚡
        </button>
        
        {/* Hidden menu shown on group hover */}
        <div className="flex flex-col gap-2 items-end opacity-0 pointer-events-none translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 bg-[#0a0c16]/95 border border-white/10 hover:border-cyan-500/30 px-3.5 py-2 rounded-xl text-[10px] font-bold text-white shadow-md cursor-pointer"
          >
            <span>Add Task</span>
            <Plus size={10} className="text-cyan-400" />
          </button>
          
          <button 
            onClick={() => triggerAIReschedule()}
            className="flex items-center gap-2 bg-[#0a0c16]/95 border border-white/10 hover:border-violet-500/30 px-3.5 py-2 rounded-xl text-[10px] font-bold text-white shadow-md cursor-pointer"
          >
            <span>Optimize Grid</span>
            <Sparkles size={10} className="text-violet-400" />
          </button>
          
          <button 
            onClick={() => handleTabClick('focus')}
            className="flex items-center gap-2 bg-[#0a0c16]/95 border border-white/10 hover:border-rose-500/30 px-3.5 py-2 rounded-xl text-[10px] font-bold text-white shadow-md cursor-pointer"
          >
            <span>Focus Mode</span>
            <Clock size={10} className="text-rose-400" />
          </button>
        </div>
      </div>

      {/* Kai AI Premium Drawer */}
      <KaiDrawer />

    </div>
  );
};
