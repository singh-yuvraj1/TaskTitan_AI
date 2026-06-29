import React from 'react';
import { useApp } from '../context/AppContext';
import { Terminal, Shield, Sparkles, Activity } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const AgentMonitor: React.FC = () => {
  const { agents } = useApp();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'border-neonCyan text-neonCyan bg-neonCyan/10 shadow-[0_0_8px_rgba(0,229,255,0.2)]';
      case 'Optimizing':
        return 'border-neonViolet text-neonViolet bg-neonViolet/10 shadow-[0_0_8px_rgba(213,0,249,0.2)]';
      case 'Monitoring':
        return 'border-neonEmerald text-neonEmerald bg-neonEmerald/10 shadow-[0_0_8px_rgba(0,230,118,0.2)]';
      case 'Supporting':
        return 'border-neonAmber text-neonAmber bg-neonAmber/10 shadow-[0_0_8px_rgba(255,234,0,0.2)]';
      default:
        return 'border-white/20 text-white/50 bg-white/5';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-neonEmerald';
      case 'warning':
        return 'text-neonAmber';
      case 'danger':
        return 'text-neonRose font-bold';
      default:
        return 'text-white/80';
    }
  };

  // Compile logs from all agents and sort by time or just gather them chronologically
  const allLogs = agents.flatMap(agent => 
    agent.logs.map(log => ({ ...log, avatar: agent.avatar }))
  ).sort((a, b) => {
    // Sort in reverse order (newest first)
    return b.timestamp.localeCompare(a.timestamp);
  });

  return (
    <div className="space-y-6">
      {/* 4 Agents Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map(agent => (
          <GlassCard 
            key={agent.id} 
            className="p-4 bg-white/5 border border-white/10 flex flex-col justify-between"
            glowColor={
              agent.status === 'Active' ? 'cyan' :
              agent.status === 'Optimizing' ? 'violet' :
              agent.status === 'Monitoring' ? 'emerald' : 'none'
            }
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-3xl p-1.5 bg-white/5 rounded-xl border border-white/5">{agent.avatar}</span>
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 border rounded-full ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>
            
            <div className="mt-2">
              <h4 className="text-sm font-bold text-white tracking-wide">{agent.name}</h4>
              <p className="text-[11px] text-white/50 mt-0.5 leading-tight">{agent.role}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Unified Agent Telemetry Logs Terminal */}
      <GlassCard className="p-4 bg-black/40 border border-white/10" glowColor="cyan">
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="text-neonCyan animate-pulse" size={18} />
            <h3 className="text-sm font-bold text-white tracking-wide">Multi-Agent Activity Log (Telemetry)</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
            <Activity size={12} className="animate-spin text-neonCyan" />
            <span>REAL-TIME STREAM ACTIVE</span>
          </div>
        </div>

        {/* Terminal Screen */}
        <div className="h-44 overflow-y-auto font-mono text-xs space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {allLogs.length === 0 ? (
            <p className="text-white/40 italic py-4 text-center">Telemetry logs stream offline</p>
          ) : (
            allLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2 items-start py-0.5 border-b border-white/5 last:border-b-0">
                <span className="text-white/30 text-[10px] select-none pt-0.5">{log.timestamp}</span>
                <span className="text-sm select-none leading-none pt-0.5">{log.avatar}</span>
                <span className="font-bold text-neonCyan select-none">[{log.agent}]</span>
                <span className={`flex-1 ${getLogColor(log.type)}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};
