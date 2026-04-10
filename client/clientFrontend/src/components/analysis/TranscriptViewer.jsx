import React, { useRef, useEffect } from 'react';
import { Clock, Search } from 'lucide-react';

export default function TranscriptViewer({ transcript, currentTime, selectedClip }) {
  const scrollRef = useRef(null);

  const formatTime = (seconds) => {
    // Aggressive guard for non-numeric or missing values
    if (typeof seconds !== 'number' || isNaN(seconds)) {
        return "00:00";
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (transcript && transcript.length > 0) {
        console.log("\n" + "%".repeat(40));
        console.log("CRITICAL DEBUG: TRANSCRIPT DATA IN FRONTEND");
        console.log(`Count: ${transcript.length}`);
        console.log("First Line Data:", transcript[0]);
        console.log("%".repeat(40) + "\n");
    }
    
    if (selectedClip && scrollRef.current) {


      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedClip]);

  return (
    <div className="card h-[400px] flex flex-col p-0 overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
          <Clock size={16} className="text-sky-400" />
          Smart Transcript
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-lg border border-white/5">
          <Search size={12} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="Search transcript..." 
            className="bg-transparent border-none text-[10px] text-white focus:ring-0 w-24"
          />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {!transcript || transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 italic text-sm">
            Processing transcript...
          </div>
        ) : (
          transcript.map((item, i) => {
            const isInsideClip = selectedClip && 
                                item.start >= selectedClip.startTime && 
                                item.end <= selectedClip.endTime;
            
            const isCurrentlyPlaying = currentTime >= item.start && currentTime <= item.end;

            return (
              <div 
                key={i}
                data-active={isInsideClip}
                className={`flex gap-4 p-3 rounded-xl transition-all duration-300 ${
                  isInsideClip 
                    ? 'bg-sky-500/10 border border-sky-500/20' 
                    : isCurrentlyPlaying
                    ? 'bg-white/5 border border-white/10'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="shrink-0 text-[10px] font-mono text-gray-500 mt-1">
                  {formatTime(item.start)}
                </div>
                <div className={`text-sm leading-relaxed ${
                  isInsideClip ? 'text-sky-200' : isCurrentlyPlaying ? 'text-white' : 'text-gray-400'
                }`}>
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
