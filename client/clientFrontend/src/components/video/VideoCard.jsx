import { Link } from 'react-router-dom';
import { Play, Trash2, Scissors, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import clsx from 'clsx';

export default function VideoCard({ video, onDelete }) {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="card group hover:border-white/20 transition-all duration-300 animate-slide-up">
      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 mb-4 aspect-video">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={40} className="text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link
            to={`/videos/${video._id}`}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play size={20} className="text-white ml-0.5" />
          </Link>
        </div>
        <div className="absolute top-2 right-2">
          <StatusBadge status={video.status} />
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 className="font-semibold text-white truncate mb-2 group-hover:text-sky-400 transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(video.createdAt)}</span>
          </div>
          {video.clips?.length > 0 && (
            <div className="flex items-center gap-1 text-sky-400">
              <Scissors size={12} />
              <span>{video.clips.length} clips</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Link to={`/videos/${video._id}`} className="btn-primary flex-1 justify-center text-sm py-2">
            <Play size={14} />
            View
          </Link>
          <button
            onClick={() => onDelete(video._id)}
            className="w-9 h-9 bg-slate-900 hover:bg-red-500/20 rounded-xl flex items-center justify-center transition-colors text-gray-500 hover:text-red-400 border border-white/10"
          >
            <Trash2 size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}