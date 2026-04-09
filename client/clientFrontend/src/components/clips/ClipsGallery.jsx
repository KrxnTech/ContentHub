import ClipCard from './ClipCard';
import { Scissors } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

export default function ClipsGallery({ clips }) {
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Generated Clips
          <span className="ml-2 badge bg-sky-600/20 text-sky-400">{clips.length}</span>
        </h2>

        <p className="text-sm text-gray-500">Sorted by engagement score</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map((clip, index) => (
          <ClipCard key={clip._id} clip={clip} index={index} />
        ))}
      </div>
    </div>
  );
}