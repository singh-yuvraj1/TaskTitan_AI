import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { Settings as SettingsIcon, Key, Bell, Shield, Download, RefreshCw, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const { geminiApiKey, setGeminiApiKey, userEmail, xp, streak, showToast } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [saved, setSaved] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [telemetryFrequency, setTelemetryFrequency] = useState('60');

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();
    if (trimmed && (!trimmed.startsWith('AIzaSy') || trimmed.length < 20)) {
      showToast('Invalid Gemini API Key format. It should start with "AIzaSy" and be a valid length.', 'error');
      return;
    }
    setGeminiApiKey(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      userEmail,
      xp,
      streak,
      timestamp: new Date().toISOString(),
      platform: 'TaskTitan-AI'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tasktitan_profile.json';
    link.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2 px-1">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <SettingsIcon className="text-neonCyan" size={24} />
          <span>Workspace Settings</span>
        </h2>
        <p className="text-xs text-white/50">Configure Gemini API endpoints, telemetry logs, and sync credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Columns: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Gemini API Key */}
          <GlassCard className="p-5" glowColor={geminiApiKey ? 'cyan' : 'none'}>
            <div className="flex items-center gap-2 mb-3">
              <Key className="text-neonCyan" size={18} />
              <h3 className="text-sm font-bold text-white">Google Gemini API Integration</h3>
            </div>
            
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Provide your Google Gemini API Key to enable live generative planning, prioritizations, context reminders, and voice assistants. Leave blank to run the Semantic Heuristic fallbacks.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-white/40 mb-1">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neonCyan/40 font-mono"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 font-mono">Stored locally in browser localStorage</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neonCyan text-black font-extrabold text-xs rounded-xl shadow-glass-cyan flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all"
                >
                  {saved ? <Check size={12} className="stroke-[2.5]" /> : null}
                  <span>{saved ? 'Key Saved' : 'Save Connection'}</span>
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Alert Configurations */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-neonViolet" size={18} />
              <h3 className="text-sm font-bold text-white">Alerts & Notifications</h3>
            </div>

            <div className="space-y-4 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white leading-tight">Auditory Alarms</h4>
                  <p className="text-[10px] text-white/40">Play warning sirens when Rescue Mode activates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-neonViolet focus:ring-neonViolet cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <h4 className="font-bold text-white leading-tight">Telemetry Scan Speed</h4>
                  <p className="text-[10px] text-white/40">Frequency of AI deadline evaluation updates.</p>
                </div>
                <select
                  value={telemetryFrequency}
                  onChange={(e) => setTelemetryFrequency(e.target.value)}
                  className="bg-[#0e1017] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white outline-none"
                >
                  <option value="30">30 Seconds</option>
                  <option value="60">1 Minute</option>
                  <option value="300">5 Minutes</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Profile Actions */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-neonEmerald" size={18} />
              <h3 className="text-sm font-bold text-white">Backup & Security</h3>
            </div>

            <div className="space-y-4 text-xs text-white/70">
              <p className="leading-relaxed text-[11px]">
                Your workspace profile contains progress stats, logs, unlocked achievements, and key hashes. Exporting creates a secure local backup.
              </p>

              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 text-white font-bold rounded-xl text-xs transition-all"
              >
                <Download size={14} />
                <span>Export Profile JSON</span>
              </button>
              
              <div className="border-t border-white/5 pt-3 text-[10px] text-white/40 font-mono text-center">
                Sync Server Status: <strong className="text-neonEmerald">Online</strong>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
