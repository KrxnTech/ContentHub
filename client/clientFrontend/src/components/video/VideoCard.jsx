import { Link } from 'react-router-dom';
import { Play, Trash2, Scissors, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function VideoCard({ video, onDelete }) {

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div
      className="group bg-[#12121a] border border-[#2a2a3a] p-4 transition-all duration-300 hover:border-[#00ff88]"
      style={{
        clipPath:
          'polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px))',
      }}
    >

      {/* THUMBNAIL */}
      <div className="relative mb-4 aspect-video bg-black overflow-hidden">

        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#00ff88]">
            <Play size={40} />
          </div>
        )}

        {/* HOVER OVERLAY */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

          <Link
            to={`/videos/${video._id}`}
            className="w-12 h-12 border border-[#00ff88] text-[#00ff88] flex items-center justify-center hover:bg-[#00ff88] hover:text-black transition"
          >
            <Play size={18} />
          </Link>

        </div>

        {/* STATUS */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={video.status} />
        </div>

      </div>

      {/* INFO */}
      <div>

        <h3 className="text-white font-mono text-sm uppercase tracking-wide mb-2 truncate group-hover:text-[#00ff88] transition">
          {video.title}
        </h3>

        <div className="flex justify-between text-xs text-gray-400 font-mono">

          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(video.createdAt)}</span>
          </div>

          {video.clips?.length > 0 && (
            <div className="flex items-center gap-1 text-[#00ff88]">
              <Scissors size={12} />
              <span>{video.clips.length}</span>
            </div>
          )}

        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-4">

          <Link
            to={`/videos/${video._id}`}
            className="flex-1 text-center py-2 border border-[#00ff88] text-[#00ff88] font-mono text-xs uppercase hover:bg-[#00ff88] hover:text-black transition"
          >
            <Play size={14} className="inline mr-1" />
            View
          </Link>

          <button
            onClick={() => onDelete(video._id)}
            className="w-9 h-9 border border-[#2a2a3a] text-gray-400 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <Trash2 size={14} />
          </button>

        </div>

      </div>
    </div>
  );
}