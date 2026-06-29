import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { SkillTree } from '../components/SkillTree';
import { Trophy, Award, Flame, Target, Users, Zap, Shield } from 'lucide-react';

export const SkillTreeAndGame: React.FC = () => {
  const { xp, level, rank, badges, challenges, leaderboard } = useApp();
  const [gameTab, setGameTab] = useState<'tree' | 'leaderboard' | 'challenges'>('tree');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'global' | 'friends' | 'university'>('global');

  // Filter leaderboard
  const filteredLeaderboard = leaderboard
    .filter(u => u.group === leaderboardFilter)
    .sort((a, b) => b.xp - a.xp);

  // Badge metadata
  const badgeMeta = [
    { name: 'Deadline Slayer', desc: 'Auto-schedule a task due in under 24 hours.', icon: '🛡️', glow: 'cyan' as const },
    { name: 'Consistency King', desc: 'Log a 3-day focus habit streak.', icon: '👑', glow: 'emerald' as const },
    { name: 'Focus Beast', desc: 'Log 15 focus hours on the dashboard.', icon: '🔋', glow: 'violet' as const },
    { name: 'Productivity Ninja', desc: 'Unlock 3 nodes in the skill tree.', icon: '🥷', glow: 'cyan' as const },
    { name: '30 Day Warrior', desc: 'Secure a 7-day habit completion block.', icon: '⚔️', glow: 'rose' as const },
    { name: 'Deep Work Master', desc: 'Complete 3 pomodoro blocks without tab-switching.', icon: '🧠', glow: 'violet' as const },
    { name: 'Rescue Champion', desc: 'Submit a compromised task in Rescue Mode.', icon: '🚨', glow: 'rose' as const }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 px-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="text-neonAmber" size={24} />
            <span>Academy & Gamification Center</span>
          </h2>
          <p className="text-xs text-white/50">Level up your statistics, review achievements, and trace active skill trees.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
          <button
            onClick={() => setGameTab('tree')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameTab === 'tree' ? 'bg-neonCyan text-black font-extrabold shadow-glass-cyan' : 'text-white/60 hover:text-white'
            }`}
          >
            Skill Academy
          </button>
          <button
            onClick={() => setGameTab('challenges')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameTab === 'challenges' ? 'bg-neonViolet text-white font-extrabold shadow-glass-violet' : 'text-white/60 hover:text-white'
            }`}
          >
            Quests & Badges
          </button>
          <button
            onClick={() => setGameTab('leaderboard')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameTab === 'leaderboard' ? 'bg-neonEmerald text-black font-extrabold shadow-glass-emerald' : 'text-white/60 hover:text-white'
            }`}
          >
            Leaderboards
          </button>
        </div>
      </div>

      {/* 1. Skill Tree Tab */}
      {gameTab === 'tree' && <SkillTree />}

      {/* 2. Challenges & Badges Tab */}
      {gameTab === 'challenges' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Quests */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-neonCyan" size={18} />
                <h3 className="text-sm font-bold text-white">Active Ninja Quests</h3>
              </div>

              <div className="space-y-3">
                {challenges.map(q => (
                  <div 
                    key={q.id}
                    className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all flex justify-between items-center"
                  >
                    <div className="flex-1 mr-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-bold text-white">{q.title}</h4>
                        <span className="text-[9px] font-mono text-neonAmber">+{q.xpReward} XP</span>
                      </div>
                      <p className="text-[10px] text-white/50 mb-2 leading-relaxed">{q.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-neonCyan h-full rounded-full transition-all duration-300"
                          style={{ width: `${q.progress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      {q.completed ? (
                        <span className="text-[9px] font-mono font-bold text-neonEmerald bg-neonEmerald/10 border border-neonEmerald/20 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                          {q.progress}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Unlocked Achievements shelf */}
          <div className="lg:col-span-1 space-y-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="text-neonViolet" size={18} />
                <h3 className="text-sm font-bold text-white">Badge Showcase</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {badgeMeta.map((badge, idx) => {
                  const unlocked = badges.includes(badge.name);
                  return (
                    <GlassCard 
                      key={idx} 
                      className={`p-3 text-center flex flex-col items-center justify-between border ${
                        unlocked ? 'bg-white/5' : 'bg-black/20 opacity-40'
                      }`}
                      glowColor={unlocked ? badge.glow : 'none'}
                    >
                      <div className="text-2xl mb-1.5">{badge.icon}</div>
                      <div>
                        <h4 className="text-[10px] font-bold text-white truncate max-w-[80px]">{badge.name}</h4>
                        <p className="text-[8px] text-white/40 leading-tight mt-0.5">{badge.desc}</p>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* 3. Leaderboards Tab */}
      {gameTab === 'leaderboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-neonEmerald" size={18} />
                <h3 className="text-sm font-bold text-white">Select Bracket</h3>
              </div>

              <div className="flex flex-col gap-2">
                {(['global', 'friends', 'university'] as const).map(bracket => (
                  <button
                    key={bracket}
                    onClick={() => setLeaderboardFilter(bracket)}
                    className={`
                      w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left capitalize transition-all border
                      ${leaderboardFilter === bracket
                        ? 'bg-neonEmerald/10 border-neonEmerald/30 text-neonEmerald'
                        : 'border-white/5 bg-white/5 text-white/60 hover:text-white'
                      }
                    `}
                  >
                    {bracket} Rankings
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed font-mono">
                Ranks recalibrate dynamically every Sunday. Streaks provide XP multiplier points.
              </p>
            </GlassCard>
          </div>

          {/* Rankings Grid */}
          <div className="lg:col-span-2">
            <GlassCard className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white capitalize">{leaderboardFilter} Standings</h3>
                <span className="text-[10px] text-white/40 uppercase font-mono">NSUT Chapter #2</span>
              </div>

              <div className="space-y-2">
                {filteredLeaderboard.map((item, idx) => {
                  const isUser = item.name.includes('You');
                  return (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                        isUser 
                          ? 'bg-neonEmerald/5 border-neonEmerald/30 shadow-[0_0_8px_rgba(0,230,118,0.1)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 text-xs font-mono font-bold ${
                          idx === 0 ? 'text-neonAmber' : idx === 1 ? 'text-white/80' : 'text-white/40'
                        }`}>
                          #{idx + 1}
                        </span>
                        
                        <span className="text-lg">{item.avatar}</span>
                        
                        <div>
                          <h4 className={`text-xs font-bold ${isUser ? 'text-neonEmerald' : 'text-white'}`}>
                            {item.name}
                          </h4>
                          {item.university && (
                            <p className="text-[9px] text-white/40 font-mono mt-0.5">{item.university}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-[10px]">
                        <div className="flex items-center gap-1 text-neonRose">
                          <Flame size={12} className="fill-neonRose text-neonRose" />
                          <span>{item.streak}d</span>
                        </div>
                        <span className="text-white font-bold">{item.xp} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
