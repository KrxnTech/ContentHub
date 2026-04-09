import { Play, Clock, Zap, Tag } from 'lucide-react';
import clsx from 'clsx';

export default function ClipCard({ clip, index }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const scoreColor = clip.engagementScore >= 80
    ? 'text-green-400 bg-green-500/10'
    : clip.engagementScore >= 60
    ? 'text-yellow-400 bg-yellow-500/10'
    : 'text-gray-400 bg-gray-500/10';

  return (
    <div className="card hover:border-white/20 transition-all duration-300 animate-slide-up group">
      {/* Video Preview */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 mb-4 aspect-video">
        <video
          src={clip.clipUrl}
          className="w-full h-full object-cover"
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          
          <a
            href={clip.clipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play size={20} className="text-white ml-0.5" />
          </a>
        </div>

        {/* Clip number badge */}
        <div className="absolute top-2 left-2 w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>

        {/* Score badge */}
        <div className={clsx('absolute top-2 right-2 badge gap-1', scoreColor)}>
          <Zap size={10} />
          {clip.engagementScore}
        </div>
      </div>

      {/* Info */}
      <div>
        <h4 className="font-semibold text-white mb-1 truncate">{clip.title}</h4>

        {clip.aiReason && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{clip.aiReason}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{formatTime(clip.startTime)} → {formatTime(clip.endTime)}</span>
          </div>
          <span className="text-gray-700">•</span>
          <span>{clip.duration}s</span>
        </div>

        {clip.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clip.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="badge bg-slate-900 text-gray-400 gap-1 border border-white/10">
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>
        )}


        <a
          href={clip.clipUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full justify-center mt-4 text-sm py-2"
        >
          <Play size={14} />
          Watch Clip
        </a>
      </div>
    </div>
  );
}