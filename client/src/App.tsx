import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AICommandCenter } from './pages/AICommandCenter';
import { TasksPage } from './pages/TasksPage';
import { CalendarPlanner } from './pages/CalendarPlanner';
import { RescuePage } from './pages/RescuePage';
import { FocusPage } from './pages/FocusPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { Settings } from './pages/Settings';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingModal } from './components/OnboardingModal';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    isCommandPaletteOpen, setCommandPaletteOpen,
    isOnboardingOpen, setOnboardingOpen,
    toasts, removeToast
  } = useApp();

  // Listen for global keyboard shortcut triggers (CMD+K / CTRL+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'landing':
        return <Landing />;
      case 'auth':
        return <Auth />;
      case 'dashboard':
        return <Dashboard />;
      case 'command':
        return <AICommandCenter />;
      case 'tasks':
        return <TasksPage />;
      case 'calendar':
        return <CalendarPlanner />;
      case 'rescue':
        return <RescuePage />;
      case 'focus':
        return <FocusPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'heatmap':
        return <HeatmapPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'settings':
        return <Settings />;
      default:
        return <Landing />;
    }
  };

  const isFullPage = activeTab === 'landing' || activeTab === 'auth';

  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans">
      {isFullPage ? (
        <main>{renderActiveTab()}</main>
      ) : (
        <Layout>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' as any }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </Layout>
      )}

      {/* Floating custom Toast overlay container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-xl shadow-lg cursor-pointer transform translate-y-0 transition-all duration-300 animate-slide-in hover:scale-[1.02] pointer-events-auto
              ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20' : ''}
              ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/30 text-rose-300 shadow-rose-950/20' : ''}
              ${toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-amber-300 shadow-amber-950/20' : ''}
              ${toast.type === 'info' ? 'bg-[#0b172a]/95 border-blue-500/30 text-blue-300 shadow-blue-950/20' : ''}
            `}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">
                {toast.type === 'success' ? '✨' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span className="text-[11px] font-bold tracking-wide">{toast.message}</span>
            </div>
            <button className="text-[10px] opacity-40 hover:opacity-100 ml-3 shrink-0 font-mono">×</button>
          </div>
        ))}
      </div>

      {/* CMD+K Command Console */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* User onboarding Modal */}
      <OnboardingModal 
        isOpen={isOnboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
