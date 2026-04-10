import { Play, Clock, Zap, Tag, Brain, Sparkles, TrendingUp, Info } from 'lucide-react';
import clsx from 'clsx';

export default function ClipCard({ clip, index, isActive, onSelect }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / (60));
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const emotionEmojis = {
    funny: '🔥 Funny',
    emotional: '❤️ Emotional',
    motivational: '🏆 Motivational',
    educational: '💡 Educational',
    neutral: '😐 Neutral'
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-purple-400 border-purple-500/30 bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
    if (score >= 80) return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    if (score >= 70) return 'text-green-400 border-green-500/30 bg-green-500/10';
    return 'text-gray-400 border-white/10 bg-white/5';
  };

  return (
    <div 
      onClick={() => onSelect && onSelect(clip)}
      className={clsx(
        "card cursor-pointer transition-all duration-500 group relative overflow-hidden",
        isActive ? "border-purple-500/50 ring-2 ring-purple-500/20 bg-purple-500/5 scale-[1.02]" : "hover:border-white/20 hover:translate-y-[-4px]"
      )}
    >
      {/* Decorative Glow for high scores */}
      {clip.viralScore >= 90 && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-[60px] pointer-events-none" />
      )}

      {/* Video Preview Section */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 mb-5 aspect-video border border-white/5">
        <video
          src={clip.clipUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          preload="metadata"
        />
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                <Play size={20} className="text-white fill-white ml-0.5" />
            </div>
        </div>

        {/* Clip Index */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold text-gray-300">
          CLIP {index + 1}
        </div>

        {/* Viral Score Badge */}
        <div className={clsx(
            "absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold backdrop-blur-md",
            getScoreColor(clip.viralScore)
        )}>
          <Sparkles size={12} className="animate-pulse" />
          VIRAL: {clip.viralScore}
        </div>

        {/* Duration Overlay */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-[9px] font-mono text-white rounded">
          {clip.duration}s
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase text-gray-400 tracking-wider">
           {emotionEmojis[clip.emotion] || clip.emotion}
        </span>
        <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded text-[10px] font-bold uppercase text-sky-400 tracking-wider">
           {clip.category}
        </span>
      </div>

      {/* Title & Info */}
      <div className="space-y-4">
        <h4 className="font-bold text-white text-lg leading-tight group-hover:text-purple-400 transition-colors">
            {clip.title}
        </h4>

        {/* reasoning section */}
        <div className="space-y-2.5 p-3 rounded-xl bg-black/30 border border-white/5">
            <div className="flex items-start gap-2">
                <Brain size={14} className="text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-purple-400/70 uppercase">Why this clip?</p>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed italic">
                        "{clip.aiReason || clip.reason}"
                    </p>
                </div>
            </div>
            
            <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                <TrendingUp size={14} className="text-green-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-green-400/70 uppercase">Why this part?</p>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed italic">
                        "{clip.whyThisPart || clip.why_this_part}"
                    </p>
                </div>
            </div>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {(clip.keywords || clip.tags || []).slice(0, 4).map((kw, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-900 text-gray-500 rounded-md border border-white/5 group-hover:border-purple-500/20 transition-colors">
              #{kw}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                <Clock size={12} />
                <span>{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 italic">
                <Info size={10} />
                {(clip.confidence * 100).toFixed(0)}% AI Confidence
            </div>
        </div>
      </div>
    </div>
  );
}