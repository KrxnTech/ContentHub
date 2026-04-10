import React from 'react';

export default function TimelineVisualization({ duration, segments = [], clips = [], activeClipId }) {
  if (!duration) return null;

  return (
    <div className="card animate-fade-in shadow-2xl overflow-hidden border-sky-500/10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Viral Potential Heatmap
          </h3>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">AI scanning whole video duration for high-engagement peaks</p>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-gray-400">
           <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-gray-600" /> Low
           </div>
           <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-blue-500" /> Medium
           </div>
           <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" /> Peak (Viral)
           </div>
        </div>
      </div>

      <div className="relative h-24 w-full bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5 flex items-end px-2 group">
        {/* Background Grid */}
        <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-20">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-white/10 h-full" />
          ))}
        </div>

        {/* Heatmap Bars */}
        <div className="flex-1 flex items-end gap-[2px] h-full relative z-10 pt-4">
          {segments.map((seg, i) => {
            const height = `${seg.score || 30}%`;
            const isViral = seg.score >= 80;
            const isMedium = seg.score >= 50 && seg.score < 80;
            
            return (
              <div 
                key={i}
                className="flex-1 group/bar relative"
                style={{ height: '100%' }}
              >
                <div 
                  className={`absolute bottom-0 left-0 right-0 rounded-t-[2px] transition-all duration-500 ease-out hover:scale-y-110 ${
                    isViral 
                      ? 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]' 
                      : isMedium 
                      ? 'bg-blue-500' 
                      : 'bg-gray-700'
                  }`}
                  style={{ height }}
                />
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-white/20 px-2 py-1 rounded text-[8px] text-white opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  Score: {seg.score}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Clip Ranges Overlays */}
        <div className="absolute inset-x-2 inset-y-0 pointer-events-none">
          {clips.map((clip) => {
            const left = (clip.startTime / duration) * 100;
            const width = (clip.duration / duration) * 100;
            const isActive = clip._id === activeClipId;

            return (
              <div 
                key={clip._id}
                className={`absolute top-0 bottom-0 border-x transition-all duration-300 ${
                  isActive 
                    ? 'border-white bg-white/10 z-20' 
                    : 'border-white/20 bg-white/5 z-0'
                }`}
                style={{ 
                    left: `${left}%`, 
                    width: `${width}%`
                }}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter">
                    Active Clip
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-[9px] font-mono text-gray-500 px-2">
        <span>00:00</span>
        <span>{Math.floor(duration / 2)}s</span>
        <span>{duration.toFixed(0)}s</span>
      </div>
    </div>
  );
}
