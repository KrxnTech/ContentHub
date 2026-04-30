import { Clock, Brain, Sparkles, TrendingUp, Info, BarChart3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function ClipCard({ clip, index, isActive, onSelect, playingClipId, onPlayingChange, onDeepAnalysis }) {

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getClipDuration = () => {
    if (clip.duration && clip.duration > 0) {
      return clip.duration.toFixed(1);
    }
    if (clip.startTime !== undefined && clip.endTime !== undefined) {
      const calculatedDuration = clip.endTime - clip.startTime;
      return calculatedDuration.toFixed(1);
    }
    return '0.0';
  };

  const emotionEmojis = {
    funny: '🔥 Funny',
    emotional: '❤️ Emotional',
    motivational: '🏆 Motivational',
    educational: '💡 Educational',
    neutral: '😐 Neutral'
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-[#00ff88] border-[#00ff88]/40 bg-[#00ff88]/10';
    if (score >= 80) return 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/5';
    if (score >= 70) return 'text-green-400 border-green-500/30 bg-green-500/10';
    return 'text-gray-400 border-[#2a2a3a] bg-[#12121a]';
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      onPlayingChange && onPlayingChange(clip._id, !isPlaying);
    }
  };

  // Auto-stop when another clip starts playing
  useEffect(() => {
    if (playingClipId && playingClipId !== clip._id && isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [playingClipId, clip._id, isPlaying]);

  return (
    <div
      onClick={() => onSelect && onSelect(clip)}
      className={clsx(
        "card cursor-pointer transition-all duration-300 group relative overflow-hidden",
        isActive
          ? "border-[#00ff88] ring-1 ring-[#00ff88]/30 bg-[#12121a]"
          : "hover:border-[#00ff88]/40 hover:-translate-y-1"
      )}
    >

      {/* VIDEO */}
      <div className="relative overflow-hidden mb-5 aspect-video border border-[#2a2a3a] bg-black" onClick={togglePlay}>

        <video
          ref={videoRef}
          src={clip.clipUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          preload="metadata"
          controls
          onPlay={() => {
            setIsPlaying(true);
            onPlayingChange && onPlayingChange(clip._id, true);
          }}
          onPause={() => {
            setIsPlaying(false);
            onPlayingChange && onPlayingChange(clip._id, false);
          }}
        />

        {/* INDEX */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 border border-[#2a2a3a] text-[10px] text-gray-400 font-mono">
          CLIP {index + 1}
        </div>

        {/* SCORE */}
        <div className={clsx(
          "absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono border",
          getScoreColor(clip.viralScore)
        )}>
          <Sparkles size={10} />
          {clip.viralScore}
        </div>

        {/* DURATION */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-[9px] font-mono text-white">
          {getClipDuration()}s
        </div>

      </div>

      {/* BADGES */}
      <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-mono uppercase">

        <span className="px-2 py-0.5 border border-[#2a2a3a] text-gray-400">
          {emotionEmojis[clip.emotion] || clip.emotion}
        </span>

        <span className="px-2 py-0.5 border border-[#00ff88]/40 text-[#00ff88]">
          {clip.category}
        </span>

      </div>

      {/* CONTENT */}
      <div className="space-y-4">

        <h4 className="text-white text-sm font-mono uppercase tracking-wide group-hover:text-[#00ff88] transition">
          {clip.title}
        </h4>

        {/* REASONING */}
        <div className="space-y-3 p-3 bg-[#12121a] border border-[#2a2a3a]">

          <div className="flex gap-2">
            <Brain size={12} className="text-[#00ff88]" />
            <p className="text-xs text-gray-400 line-clamp-2">
              {clip.aiReason || clip.reason}
            </p>
          </div>

          <div className="flex gap-2 border-t border-[#2a2a3a] pt-2">
            <TrendingUp size={12} className="text-green-400" />
            <p className="text-xs text-gray-400 line-clamp-2">
              {clip.whyThisPart || clip.why_this_part}
            </p>
          </div>

        </div>

        {/* TAGS */}
        <div className="flex flex-wrap gap-1">
          {(clip.keywords || clip.tags || []).slice(0, 4).map((kw, i) => (
            <span
              key={i}
              className="text-[9px] px-2 py-0.5 border border-[#2a2a3a] text-gray-500"
            >
              #{kw}
            </span>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">

          <div className="flex items-center gap-1">
            <Clock size={10} />
            {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeepAnalysis && onDeepAnalysis(clip);
            }}
            className="flex items-center gap-1 text-[#00ff88] hover:text-white transition-colors"
          >
            <BarChart3 size={10} />
            Deep Analysis
          </button>

        </div>

      </div>
    </div>
  );
}