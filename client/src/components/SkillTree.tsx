import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Unlock, Zap, BrainCircuit, GraduationCap } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const SkillTree: React.FC = () => {
  const { skills, xp, unlockSkill } = useApp();
  const [activeCategory, setActiveCategory] = useState<'DSA' | 'React' | 'Placement Prep'>('DSA');

  const filteredNodes = skills.filter(s => s.category === activeCategory);

  // Group nodes by root level and hierarchy to map parent-child connections
  const getParentName = (parentId?: string) => {
    if (!parentId) return '';
    return skills.find(s => s.id === parentId)?.name || '';
  };

  return (
    <div className="w-full">
      {/* Academy Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className={activeCategory === 'DSA' ? 'text-neonCyan' : activeCategory === 'React' ? 'text-neonViolet' : 'text-neonEmerald'} />
            <span>CodingNinja Academy & Skill Tree</span>
          </h2>
          <p className="text-xs text-white/50">Reach XP milestones to unlock passive skill nodes, boosting your stats and scheduling priorities (no XP is deducted).</p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveCategory('DSA')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'DSA' 
                ? 'bg-neonCyan text-black font-extrabold shadow-glass-cyan' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            DSA Track
          </button>
          <button
            onClick={() => setActiveCategory('React')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'React' 
                ? 'bg-neonViolet text-white font-extrabold shadow-glass-violet' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            React Track
          </button>
          <button
            onClick={() => setActiveCategory('Placement Prep')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'Placement Prep' 
                ? 'bg-neonEmerald text-black font-extrabold shadow-glass-emerald' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Placement Prep
          </button>
        </div>
      </div>

      {/* Skills Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Visual Vertical Flow */}
        <div className="lg:col-span-2 space-y-4 relative pl-4 border-l border-white/10 ml-4 py-2">
          {filteredNodes.map((node, index) => {
            const canAfford = xp >= node.xpCost;
            const parent = skills.find(s => s.id === node.parentId);
            const parentUnlocked = parent ? parent.unlocked : true;
            const canUnlock = !node.unlocked && parentUnlocked;

            return (
              <div key={node.id} className="relative group">
                {/* Node connection bubble dot */}
                <div className={`
                  absolute -left-[22px] top-6 w-3.5 h-3.5 rounded-full border-2 z-10 transition-all duration-300
                  ${node.unlocked 
                    ? activeCategory === 'DSA' 
                      ? 'bg-neonCyan border-neonCyan shadow-[0_0_8px_#00e5ff]' 
                      : activeCategory === 'React' 
                        ? 'bg-neonViolet border-neonViolet shadow-[0_0_8px_#d500f9]'
                        : 'bg-neonEmerald border-neonEmerald shadow-[0_0_8px_#00e676]'
                    : 'bg-darkBg border-white/30'
                  }
                `} />

                <GlassCard 
                  className={`p-4 bg-white/5 transition-all ${
                    node.unlocked 
                      ? activeCategory === 'DSA' 
                        ? 'border-neonCyan/30 bg-neonCyan/5' 
                        : activeCategory === 'React'
                          ? 'border-neonViolet/30 bg-neonViolet/5'
                          : 'border-neonEmerald/30 bg-neonEmerald/5'
                      : 'border-white/10 opacity-70'
                  }`}
                  glowColor={node.unlocked ? (activeCategory === 'DSA' ? 'cyan' : activeCategory === 'React' ? 'violet' : 'emerald') : 'none'}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                        node.unlocked 
                          ? activeCategory === 'DSA' 
                            ? 'bg-neonCyan/10 text-neonCyan' 
                            : activeCategory === 'React'
                              ? 'bg-neonViolet/10 text-neonViolet'
                              : 'bg-neonEmerald/10 text-neonEmerald'
                          : 'bg-white/5 text-white/40'
                      }`}>
                        {node.unlocked ? <Unlock size={18} /> : <Lock size={18} />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{node.name}</h3>
                        {node.parentId && (
                          <p className="text-[10px] text-white/40 font-mono">
                            Requires: {getParentName(node.parentId)}
                          </p>
                        )}
                        <p className="text-xs text-neonEmerald mt-1 flex items-center gap-1">
                          <Zap size={12} className="fill-neonEmerald" />
                          <span>Bonus: {node.bonusDesc}</span>
                        </p>
                      </div>
                    </div>

                    {/* Unlock Action Button */}
                    <div className="text-right">
                      {node.unlocked ? (
                        <span className="text-[10px] uppercase font-mono font-bold text-neonEmerald bg-neonEmerald/10 px-2 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      ) : (
                        <button
                          disabled={!canUnlock || !canAfford}
                          onClick={() => unlockSkill(node.id)}
                          className={`
                            px-3 py-1 rounded-lg text-xs font-bold tracking-wide transition-all font-mono
                            ${canUnlock && canAfford
                              ? activeCategory === 'DSA'
                                ? 'bg-neonCyan text-black hover:opacity-90 shadow-glass-cyan cursor-pointer'
                                : activeCategory === 'React'
                                  ? 'bg-neonViolet text-white hover:opacity-90 shadow-glass-violet cursor-pointer'
                                  : 'bg-neonEmerald text-black hover:opacity-90 shadow-glass-emerald cursor-pointer'
                              : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }
                          `}
                        >
                          Unlock ({node.xpCost} XP)
                        </button>
                      )}
                      
                      {!node.unlocked && !parentUnlocked && (
                        <p className="text-[9px] text-neonRose mt-1 font-mono">Unlock parent node first</p>
                      )}
                      {!node.unlocked && parentUnlocked && !canAfford && (
                        <p className="text-[9px] text-neonRose mt-1 font-mono">Need {node.xpCost - xp} more XP</p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* Right Column: Dynamic Legend Card */}
        <div>
          <GlassCard className="p-5 space-y-4" glowColor={activeCategory === 'DSA' ? 'cyan' : activeCategory === 'React' ? 'violet' : 'emerald'}>
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className={activeCategory === 'DSA' ? 'text-neonCyan' : activeCategory === 'React' ? 'text-neonViolet' : 'text-neonEmerald'} size={24} />
              <h3 className="text-md font-bold text-white">Academy Mechanics</h3>
            </div>
            
            <div className="space-y-3 text-xs text-white/70">
              <p>
                Each node unlocked triggers a <strong className="text-white">permanent multiplier boost</strong> in your local state.
              </p>
              <div className="p-3 bg-white/5 rounded-xl space-y-2 border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span>Available Balance:</span>
                  <span className={`${activeCategory === 'DSA' ? 'text-neonCyan' : activeCategory === 'React' ? 'text-neonViolet' : 'text-neonEmerald'} font-bold`}>{xp} XP</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span>Unlocked Skills:</span>
                  <span className="text-white font-bold">{skills.filter(s => s.unlocked).length} / {skills.length}</span>
                </div>
              </div>
              <p className="text-white/50 text-[11px] leading-relaxed">
                Tip: Complete high-priority rescue missions and maintain your weekly streak logs to accumulate XP milestones faster!
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
