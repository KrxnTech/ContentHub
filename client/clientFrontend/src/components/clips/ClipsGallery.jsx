import ClipCard from './ClipCard';
import DeepAnalysis from '../analysis/DeepAnalysis';
import { Scissors, FileText, Clock } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import { useState } from 'react';

export default function ClipsGallery({ clips, activeClipId, onSelectClip, transcript }) {
  const [playingClipId, setPlayingClipId] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [deepAnalysisClip, setDeepAnalysisClip] = useState(null);

  const handlePlayingChange = (clipId, isPlaying) => {
    if (isPlaying) {
      setPlayingClipId(clipId);
      setShowTranscript(true);
      // Also select the clip when playing starts
      const clip = clips.find(c => c._id === clipId);
      if (clip) {
        onSelectClip && onSelectClip(clip);
      }
    } else {
      setPlayingClipId(null);
    }
  };

  const handleDeepAnalysis = (clip) => {
    setDeepAnalysisClip(clip);
  };

  const activeClip = clips.find(c => c._id === activeClipId);
  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!clips || clips.length === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title="No clips yet"
        description="Process your video to generate AI-powered clips"
      />
    );
  }

  return (
    <div className="animate-fade-in">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">

        <div>
          <h2 className="text-xl font-mono uppercase tracking-widest text-white flex items-center gap-3">

            Curated Highlights

            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-[#00ff88]/40 text-[#00ff88]">
              {clips.length} Clips
            </span>

          </h2>

          <p className="text-gray-400 text-xs font-mono mt-2">
            {'>'} Select clip to inspect AI analysis
          </p>
        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CLIPS */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {clips.map((clip, index) => (
            <ClipCard
              key={clip._id}
              clip={clip}
              index={index}
              isActive={clip._id === activeClipId}
              onSelect={onSelectClip}
              playingClipId={playingClipId}
              onPlayingChange={handlePlayingChange}
              onDeepAnalysis={handleDeepAnalysis}
            />
          ))}

        </div>

        {/* TRANSCRIPT PANEL */}
        {showTranscript && activeClip && transcript && (
          <div className="lg:col-span-1 card h-fit sticky top-4">
            <div className="p-4 border-b border-[#2a2a3a] bg-[#12121a] flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#00ff88] flex items-center gap-2">
                <FileText size={14} />
                Transcript
              </h3>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 mb-4">
                <Clock size={12} />
                {formatTime(activeClip.startTime)} - {formatTime(activeClip.endTime)}
              </div>

              {!transcript || transcript.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-xs font-mono py-8">
                  Processing transcript...
                </div>
              ) : (
                transcript
                  .filter(item =>
                    item.start >= activeClip.startTime &&
                    item.end <= activeClip.endTime
                  )
                  .map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 border border-[#00ff88]/30 bg-[#00ff88]/5"
                    >
                      <div className="shrink-0 text-[10px] font-mono text-gray-500 mt-1">
                        {formatTime(item.start)}
                      </div>
                      <div className="text-xs leading-relaxed text-[#00ff88]">
                        {item.text}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* DEEP ANALYSIS MODAL */}
      {deepAnalysisClip && (
        <DeepAnalysis
          clip={deepAnalysisClip}
          transcript={transcript}
          onClose={() => setDeepAnalysisClip(null)}
        />
      )}

    </div>
  );
}