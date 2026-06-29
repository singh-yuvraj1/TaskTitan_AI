import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Milestone, CheckCircle2, Lock, Sparkles, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Default placement roadmap seeded on first load if backend is empty
const DEFAULT_ROADMAP_SEEDS = [
  // DSA
  { title: 'Arrays & Hashing',         category: 'DSA',      description: 'Master array manipulations, hash maps, and two-pointer algorithms.' },
  { title: 'Linked Lists & Stacks',     category: 'DSA',      description: 'Reversing lists, cycle detection, and evaluating stack matrices.' },
  { title: 'Trees & Graphs',            category: 'DSA',      description: 'BFS/DFS traversals, binary search trees, and Dijkstra algorithms.' },
  { title: 'Dynamic Programming',       category: 'DSA',      description: 'Memoization, tabulation, and coin change optimization problems.' },
  // DBMS
  { title: 'SQL & Joins',               category: 'DBMS',     description: 'Writing aggregate queries, complex inner/outer joins, and subqueries.' },
  { title: 'Normalization',             category: 'DBMS',     description: 'Understanding 1NF, 2NF, 3NF, and BCNF relational constraints.' },
  { title: 'Transactions & ACID',       category: 'DBMS',     description: 'Concurrency control, transaction isolation levels, and locks.' },
  // OS
  { title: 'Process Management',        category: 'OS',       description: 'CPU scheduling algorithms, process control blocks, and fork operations.' },
  { title: 'Threads & Concurrency',     category: 'OS',       description: 'Race conditions, semaphores, mutex variables, and deadlocks.' },
  { title: 'Memory Management',         category: 'OS',       description: 'Paging, segmentation, virtual memory, and page replacement indices.' },
  // CN
  { title: 'OSI & TCP/IP Layers',       category: 'CN',       description: 'Understanding layers mapping, packet encapsulation, and protocols.' },
  { title: 'IP Addressing & Subnets',   category: 'CN',       description: 'Calculating CIDR blocks, subnets, and classless routing rules.' },
  { title: 'HTTP & TCP Protocols',      category: 'CN',       description: 'Three-way handshakes, TCP window scaling, and HTTP header parsing.' },
  // Projects
  { title: 'SaaS Frontend Layout',      category: 'Projects', description: 'Building responsive pages, forms validation, and component state trees.' },
  { title: 'REST API & Express',        category: 'Projects', description: 'Setting up web servers, routing middleware, and database schemas.' },
  { title: 'Production Deployments',    category: 'Projects', description: 'Configuring SSL certs, reverse proxies, and cloud deployments.' },
];

type Category = 'DSA' | 'DBMS' | 'OS' | 'CN' | 'Projects';

interface RoadmapNode {
  _id: string;
  title: string;
  category: Category;
  description: string;
  progress: number;       // 0–100
  milestones: { _id: string; title: string; completed: boolean }[];
  // We use milestones[0].completed as the "node completed" flag for simple display
}

export const RoadmapPage: React.FC = () => {
  const { addXp, addNotification } = useApp();

  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | Category>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const isCompleted = (node: RoadmapNode) =>
    node.progress >= 100 || (node.milestones.length > 0 && node.milestones[0].completed);

  // ── Fetch roadmap from backend ────────────────────────────────────────────

  const fetchRoadmap = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/roadmap`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.success) {
        if (json.data && json.data.length > 0) {
          setNodes(json.data);
        } else {
          // Empty — seed default roadmap
          await seedDefaultRoadmap();
        }
      }
    } catch {
      setIsLoading(false);
    }
  }, []);

  // ── Seed default placement roadmap ────────────────────────────────────────

  const seedDefaultRoadmap = async () => {
    try {
      const created: RoadmapNode[] = [];
      for (const seed of DEFAULT_ROADMAP_SEEDS) {
        const res = await fetch(`${API_BASE}/roadmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: seed.title,
            category: seed.category,
            milestones: [{ title: seed.description }],
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            timeframe: '3months',
            xpReward: 40
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) created.push(json.data);
        }
      }
      setNodes(created);
    } catch {
      // fallback — empty state shown
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchRoadmap();
      setIsLoading(false);
    };
    init();
  }, [fetchRoadmap]);

  // ── Toggle node completion ────────────────────────────────────────────────

  const toggleNode = async (node: RoadmapNode) => {
    if (togglingId) return;
    setTogglingId(node._id);

    const currentlyCompleted = isCompleted(node);
    const nextCompleted = !currentlyCompleted;

    // Optimistic update
    setNodes(prev => prev.map(n => {
      if (n._id !== node._id) return n;
      return {
        ...n,
        progress: nextCompleted ? 100 : 0,
        milestones: n.milestones.map((m, idx) =>
          idx === 0 ? { ...m, completed: nextCompleted } : m
        )
      };
    }));

    try {
      const res = await fetch(`${API_BASE}/roadmap/${node._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          progress: nextCompleted ? 100 : 0,
          milestones: node.milestones.map((m, idx) =>
            idx === 0 ? { ...m, completed: nextCompleted } : m
          )
        })
      });

      if (!res.ok) throw new Error('Update failed');

      if (nextCompleted) {
        addXp(40, `Unlocked preparation roadmap node: ${node.title}`);
        addNotification(
          'Milestone Unlocked! 🎯',
          `You unlocked the roadmap topic "${node.title}". +40 XP credited.`,
          'gamification'
        );
      }
    } catch {
      // Rollback optimistic update
      setNodes(prev => prev.map(n => {
        if (n._id !== node._id) return n;
        return {
          ...n,
          progress: currentlyCompleted ? 100 : 0,
          milestones: n.milestones.map((m, idx) =>
            idx === 0 ? { ...m, completed: currentlyCompleted } : m
          )
        };
      }));
    } finally {
      setTogglingId(null);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const categories: Category[] = ['DSA', 'DBMS', 'OS', 'CN', 'Projects'];

  const getNodesByCategory = (cat: Category) =>
    nodes.filter(n => n.category === cat);

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-2 space-y-6">
        <div className="pb-4 border-b border-neutral-900">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Milestone size={20} className="text-neutral-400" />
            <span>Placement Preparation Roadmap</span>
          </h2>
        </div>
        <div className="flex items-center justify-center py-24 gap-3 text-neutral-500 text-sm">
          <Loader2 size={18} className="animate-spin" />
          <span>Loading your roadmap from the database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-900">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Milestone size={20} className="text-neutral-400" />
            <span>Placement Preparation Roadmap</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">Syllabus progression mapping for interviews and technical assessments.</p>
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap gap-1 border border-neutral-850 p-1 rounded-lg bg-neutral-950/40">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-md text-[10px] font-mono transition-all ${
              activeCategory === 'all' 
                ? 'bg-neutral-900 text-white border border-neutral-800' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Show All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-md text-[10px] font-mono transition-all ${
                activeCategory === cat 
                  ? 'bg-neutral-900 text-white border border-neutral-800' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main categories roadmaps grids */}
      <div className="space-y-8">
        {categories
          .filter(cat => activeCategory === 'all' || activeCategory === cat)
          .map(cat => {
            const catNodes = getNodesByCategory(cat);
            if (catNodes.length === 0) return null;

            const compCount = catNodes.filter(n => isCompleted(n)).length;
            const progressPct = Math.round((compCount / catNodes.length) * 100);

            return (
              <div key={cat} className="space-y-4">
                {/* Category Header */}
                <div className="flex justify-between items-baseline pb-1.5 border-b border-neutral-900">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-sm font-semibold text-white tracking-tight">{cat} Syllabus</h3>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {compCount} of {catNodes.length} unlocked
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                    <div className="w-20 bg-neutral-900 h-1 rounded-full overflow-hidden border border-neutral-850">
                      <div className="bg-neutral-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                    <span>{progressPct}% Done</span>
                  </div>
                </div>

                {/* Node Cards list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {catNodes.map((node, nodeIdx) => {
                    const completed = isCompleted(node);
                    const prevNodeCompleted = nodeIdx === 0 || isCompleted(catNodes[nodeIdx - 1]);
                    const isUnlocked = completed || prevNodeCompleted;
                    const isToggling = togglingId === node._id;

                    return (
                      <Card 
                        key={node._id} 
                        className={`
                          transition-all duration-200 border flex flex-col justify-between h-40
                          ${completed 
                            ? 'bg-neutral-950/40 border-neutral-800' 
                            : isUnlocked 
                              ? 'bg-neutral-900/10 border-neutral-850'
                              : 'bg-neutral-950/50 border-neutral-900 opacity-50'
                          }
                        `}
                      >
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="text-xs font-semibold text-white leading-normal truncate">{node.title}</h4>
                              <div className="shrink-0 select-none">
                                {completed ? (
                                  <CheckCircle2 size={14} className="text-white" />
                                ) : isUnlocked ? (
                                  <Sparkles size={14} className="text-neutral-500 animate-pulse" />
                                ) : (
                                  <Lock size={12} className="text-neutral-600" />
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] text-neutral-500 leading-normal line-clamp-3">
                              {node.milestones[0]?.title || node.title}
                            </p>
                          </div>

                          <div className="pt-2">
                            {isUnlocked ? (
                              <button
                                onClick={() => toggleNode(node)}
                                disabled={isToggling}
                                className={`
                                  w-full py-1 text-[9px] font-mono rounded border transition-all flex items-center justify-center gap-1
                                  ${completed 
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' 
                                    : 'bg-white border-transparent text-black font-semibold hover:bg-neutral-200'
                                  }
                                  ${isToggling ? 'opacity-60 cursor-not-allowed' : ''}
                                `}
                              >
                                {isToggling && <Loader2 size={10} className="animate-spin" />}
                                {completed ? 'Reset Node' : 'Unlock Topic'}
                              </button>
                            ) : (
                              <div className="text-[9px] font-mono text-neutral-600 text-center py-1">
                                Lock state active
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

    </div>
  );
};
