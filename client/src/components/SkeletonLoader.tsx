import React from 'react';

export const TaskSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-[#0a0c16]/50 border border-white/10 rounded-2xl p-4 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-3 bg-white/10 rounded w-16" />
      </div>
      <div className="h-3 bg-white/10 rounded w-5/6" />
      <div className="flex items-center gap-2 pt-2">
        <div className="h-2 bg-white/10 rounded-full w-24" />
        <div className="h-2 bg-white/10 rounded-full w-12" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="w-full h-64 bg-[#0a0c16]/50 border border-white/10 rounded-2xl p-5 animate-pulse flex flex-col justify-between">
      <div className="h-4 bg-white/10 rounded w-1/4" />
      <div className="flex items-end justify-between gap-2 h-40 pt-4">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className="bg-white/10 rounded-t w-full" 
            style={{ height: `${20 + Math.random() * 80}%` }} 
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/20 mt-2">
        <div className="h-2 bg-white/10 rounded w-12" />
        <div className="h-2 bg-white/10 rounded w-12" />
        <div className="h-2 bg-white/10 rounded w-12" />
      </div>
    </div>
  );
};

export const HeatmapSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-[#0a0c16]/50 border border-white/10 rounded-2xl p-5 animate-pulse space-y-4">
      <div className="h-4 bg-white/10 rounded w-1/5" />
      <div className="grid grid-cols-7 gap-1.5 pt-2">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square bg-white/10 rounded-md w-full" />
        ))}
      </div>
    </div>
  );
};
