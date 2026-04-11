import React, { useRef, useEffect } from 'react';
import { Clock, Search } from 'lucide-react';

export default function TranscriptViewer({ transcript, currentTime, selectedClip }) {
  const scrollRef = useRef(null);

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (selectedClip && scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedClip]);

  return (
    <div className="card h-[400px] flex flex-col p-0 overflow-hidden">

      {/* HEADER */}
      <div className="p-4 border-b border-[#2a2a3a] bg-[#12121a] flex items-center justify-between">

        <h3 className="text-xs font-mono uppercase tracking-widest text-[#00ff88] flex items-center gap-2">
          <Clock size={14} />
          Transcript
        </h3>

        <div className="flex items-center gap-2 px-3 py-1 border border-[#2a2a3a] bg-[#0a0a0f]">

          <Search size={12} className="text-gray-500" />

          <input
            type="text"
            placeholder="search..."
            className="bg-transparent outline-none text-[10px] text-gray-300 w-20 font-mono"
          />

        </div>

      </div>

      {/* BODY */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >

        {!transcript || transcript.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs font-mono">
            Processing transcript...
          </div>
        ) : (
          transcript.map((item, i) => {

            const isInsideClip =
              selectedClip &&
              item.start >= selectedClip.startTime &&
              item.end <= selectedClip.endTime;

            const isCurrentlyPlaying =
              currentTime >= item.start && currentTime <= item.end;

            return (
              <div
                key={i}
                data-active={isInsideClip}
                className={`flex gap-3 p-3 border transition ${isInsideClip
                    ? 'border-[#00ff88] bg-[#00ff88]/5'
                    : isCurrentlyPlaying
                      ? 'border-[#2a2a3a] bg-[#12121a]'
                      : 'border-transparent hover:border-[#2a2a3a]'
                  }`}
              >

                {/* TIME */}
                <div className="shrink-0 text-[10px] font-mono text-gray-500 mt-1">
                  {formatTime(item.start)}
                </div>

                {/* TEXT */}
                <div
                  className={`text-xs leading-relaxed ${isInsideClip
                      ? 'text-[#00ff88]'
                      : isCurrentlyPlaying
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                >
                  {item.text}
                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}