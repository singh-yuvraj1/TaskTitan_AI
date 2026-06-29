import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Terminal, Activity, Search, ShieldAlert, Sparkles, User, Info } from 'lucide-react';

export const AgentLogsPage: React.FC = () => {
  const { agents } = useApp();
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'danger':
        return 'text-rose-400 font-bold';
      default:
        return 'text-neutral-300';
    }
  };

  const getAgentBadge = (agentName: string) => {
    switch (agentName) {
      case 'Planner':
        return 'bg-blue-950/30 text-blue-400 border-blue-900/30';
      case 'Prioritizer':
        return 'bg-violet-950/30 text-violet-400 border-violet-900/30';
      case 'Rescue':
        return 'bg-rose-950/30 text-rose-400 border-rose-900/30';
      case 'Coach':
        return 'bg-amber-950/30 text-amber-400 border-amber-900/30';
      default:
        return 'bg-neutral-900 text-neutral-400 border-neutral-800';
    }
  };

  // Compile logs from all agents
  const allLogs = agents.flatMap(agent => 
    agent.logs.map(log => ({ 
      ...log, 
      avatar: agent.avatar,
      agentId: agent.id 
    }))
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Filter logs
  const filteredLogs = allLogs.filter(log => {
    const matchesAgent = filterAgent === 'all' || log.agent.toLowerCase() === filterAgent.toLowerCase();
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.agent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAgent && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Terminal size={22} className="text-neutral-400" />
            <span>Agent Telemetry Logs</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">Real-time background agent operational streams and telemetry logs.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono bg-neutral-950 px-3 py-1.5 border border-neutral-850 rounded-lg">
          <Activity size={12} className="animate-spin text-cyan-400" />
          <span>TELEMETRY STREAM ONLINE</span>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-850 rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-neutral-700"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="all">All Agents</option>
            <option value="planner">Planner Agent</option>
            <option value="prioritizer">Prioritizer Agent</option>
            <option value="rescue">Rescue Agent</option>
            <option value="coach">Coach Agent</option>
          </select>
        </div>
      </div>

      {/* Terminal Board */}
      <div className="border border-neutral-850 rounded-xl bg-neutral-950/60 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-neutral-950 px-4 py-2.5 border-b border-neutral-850 flex items-center justify-between font-mono text-[10px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            <span className="ml-2">workspace_session_telemetry.log</span>
          </div>
          <span>UTF-8</span>
        </div>

        {/* Console content */}
        <div className="p-4 font-mono text-xs space-y-2.5 max-h-[500px] overflow-y-auto min-h-[300px]">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 italic">
              <Info size={20} className="mb-2 text-neutral-600" />
              <span>No telemetry logs match current filters</span>
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 items-start py-1 border-b border-neutral-900/50 last:border-b-0">
                <span className="text-neutral-600 text-[10px] select-none pt-0.5">{log.timestamp}</span>
                <span className="text-sm select-none leading-none">{log.avatar}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] border font-bold uppercase ${getAgentBadge(log.agent)}`}>
                  {log.agent}
                </span>
                <span className={`flex-1 leading-relaxed ${getLogColor(log.type)}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
