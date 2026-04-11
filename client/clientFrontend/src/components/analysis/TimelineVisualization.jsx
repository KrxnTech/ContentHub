import React from 'react';

export default function TimelineVisualization({ duration, segments = [], clips = [], activeClipId }) {
  if (!duration) return null;

  return (
    <div className="card animate-fade-in overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#00ff88] flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00ff88] animate-pulse" />
            Heatmap
          </h3>

          <p className="text-[10px] text-gray-500 mt-1 font-mono">
            AI scanning engagement peaks
          </p>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-600" /> Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#00ff88]/40" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#00ff88]" /> Peak
          </span>
        </div>

      </div>

      {/* TIMELINE */}
      <div className="relative h-24 w-full bg-[#12121a] border border-[#2a2a3a] overflow-hidden flex items-end px-2">

        {/* GRID */}
        <div className="absolute inset-0 grid grid-cols-12 opacity-20 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-[#2a2a3a]" />
          ))}
        </div>

        {/* BARS */}
        <div className="flex-1 flex items-end gap-[2px] h-full relative z-10 pt-4">
          {segments.map((seg, i) => {
            const height = `${seg.score || 30}%`;
            const isHigh = seg.score >= 70;

            return (
              <div key={i} className="flex-1 relative group">

                <div
                  className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${isHigh
                      ? 'bg-[#00ff88]'
                      : 'bg-[#00ff88]/30'
                    }`}
                  style={{ height }}
                />

                {/* TOOLTIP */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-[#2a2a3a] px-2 py-1 text-[8px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {seg.score}%
                </div>

              </div>
            );
          })}
        </div>

        {/* CLIPS OVERLAY */}
        <div className="absolute inset-x-2 inset-y-0 pointer-events-none">

          {clips.map((clip) => {
            const left = (clip.startTime / duration) * 100;
            const width = (clip.duration / duration) * 100;
            const isActive = clip._id === activeClipId;

            return (
              <div
                key={clip._id}
                className={`absolute top-0 bottom-0 border-x ${isActive
                    ? 'border-[#00ff88] bg-[#00ff88]/10 z-10'
                    : 'border-[#2a2a3a]'
                  }`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`
                }}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00ff88] text-black px-2 py-0.5 text-[8px] font-mono uppercase">
                    Active
                  </div>
                )}
              </div>
            );
          })}

        </div>

      </div>

      {/* TIME SCALE */}
      <div className="flex justify-between mt-4 text-[9px] font-mono text-gray-500 px-2">
        <span>00:00</span>
        <span>{Math.floor(duration / 2)}s</span>
        <span>{duration.toFixed(0)}s</span>
      </div>

    </div>
  );
}