import ClipCard from './ClipCard';
import { Scissors } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

export default function ClipsGallery({ clips, activeClipId, onSelectClip }) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {clips.map((clip, index) => (
          <ClipCard
            key={clip._id}
            clip={clip}
            index={index}
            isActive={clip._id === activeClipId}
            onSelect={onSelectClip}
          />
        ))}

      </div>

    </div>
  );
}