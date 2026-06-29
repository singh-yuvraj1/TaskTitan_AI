import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, ShieldAlert, Calendar, User, 
  Settings, Award, LogOut, Bell, Menu, X, ArrowRight, Brain, Terminal, Sparkles
} from 'lucide-react';
import { GlassCard } from './GlassCard';

export const Navigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isAuthenticated, 
    logout, 
    xp, 
    level, 
    rank, 
    notifications
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Award, public: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, public: false },
    { id: 'rescue', label: 'Rescue Center', icon: ShieldAlert, public: false },
    { id: 'calendar', label: 'AI Calendar', icon: Calendar, public: false },
    { id: 'dna', label: 'Focus & DNA', icon: User, public: false },
    { id: 'skills', label: 'Academy & Game', icon: Brain, public: false },
    { id: 'notifications', label: 'Notifications', icon: Bell, public: false },
    { id: 'logs', label: 'Agent Logs', icon: Terminal, public: false },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles, public: false },
    { id: 'settings', label: 'Settings', icon: Settings, public: false },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const getXPProgress = () => {
    const currentBase = (level - 1) * 300;
    const progress = xp - currentBase;
    return Math.min(100, Math.max(0, (progress / 300) * 100));
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-neutral-950 border-r border-neutral-850 z-40 p-4">
        {/* Branding */}
        <div className="flex items-center gap-3 px-2 py-4 cursor-pointer" onClick={() => handleTabClick('landing')}>
          <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <span className="font-extrabold text-neutral-200 text-lg">🥷</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1">
              Coding<span className="text-neutral-400">Ninja</span>
            </h1>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Rescue OS</p>
          </div>
        </div>

        {/* User Level Dashboard */}
        {isAuthenticated && (
          <div className="mt-2 px-2">
            <div className="p-3 bg-neutral-900/40 border border-neutral-850 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xl">🥷</div>
                <div>
                  <div className="text-xs font-semibold text-neutral-300">Level {level}</div>
                  <div className="text-xs text-neutral-500">{rank}</div>
                </div>
              </div>
              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-neutral-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getXPProgress()}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-neutral-500 mt-1 font-mono">
                <span>{xp - (level - 1) * 300} / 300 XP</span>
                <span>{xp} XP</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 mt-6 space-y-0.5">
          {navItems
            .filter(item => item.public || isAuthenticated)
            .map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
                    ${isActive 
                      ? 'bg-neutral-900 text-white border border-neutral-800' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className={isActive ? 'text-white' : 'text-neutral-500'} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'notifications' && unreadNotifications.length > 0 && (
                    <span className="bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Logout bottom link */}
        {isAuthenticated && (
          <div className="mt-auto pt-2 border-t border-neutral-900">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/10 transition-all"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Top Navigation & Menu Drawer */}
      <header className="lg:hidden flex justify-between items-center bg-neutral-950 border-b border-neutral-850 px-4 py-3 fixed top-0 w-full z-40">
        <div className="flex items-center gap-2" onClick={() => handleTabClick('landing')}>
          <span className="text-xl">🥷</span>
          <span className="text-sm font-bold text-white">Coding<span className="text-neutral-400">Ninja</span></span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button 
              onClick={() => setActiveTab('notifications')}
              className="relative p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all"
            >
              <Bell size={18} />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </button>
          )}

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[49px] bg-neutral-950 z-30 p-6 flex flex-col space-y-4">
          {isAuthenticated && (
            <div className="p-3 border border-neutral-850 rounded-xl bg-neutral-900/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🥷</span>
                <div>
                  <div className="text-xs text-neutral-300">Level {level}</div>
                  <div className="text-xs text-neutral-500">{rank}</div>
                </div>
              </div>
              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-neutral-400 h-full rounded-full" 
                  style={{ width: `${getXPProgress()}%` }}
                />
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1">
            {navItems
              .filter(item => item.public || isAuthenticated)
              .map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all
                      ${isActive 
                        ? 'bg-neutral-900 text-white border border-neutral-800' 
                        : 'text-neutral-400 hover:text-neutral-250 hover:bg-neutral-900/30'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'notifications' && unreadNotifications.length > 0 && (
                      <span className="bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>

          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-400 bg-rose-950/10 border border-rose-950/20 transition-all"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={() => handleTabClick('landing')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-all"
            >
              <span>Login to Workspace</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
    </>
  );
};

