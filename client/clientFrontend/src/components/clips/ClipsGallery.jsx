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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             Curated Highlights
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs border border-sky-500/20">{clips.length} Clips</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Select a clip to view deep AI analysis and reasoning</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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