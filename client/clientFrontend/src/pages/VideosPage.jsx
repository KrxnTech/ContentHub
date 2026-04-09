import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Upload } from 'lucide-react';
import { videoAPI } from '../services/api';
import VideoCard from '../components/video/VideoCard';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const response = await videoAPI.getAll();
      setVideos(response.data);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video and all its clips?')) return;
    try {
      await videoAPI.delete(id);
      setVideos((prev) => prev.filter((v) => v._id !== id));
      toast.success('Video deleted');
    } catch {
      toast.error('Failed to delete video');
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader size="lg" text="Loading your videos..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Videos</h1>
          <p className="text-gray-400">{videos.length} video{videos.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <Link to="/upload" className="btn-primary">
          <Upload size={16} />
          Upload New
        </Link>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No videos yet"
          description="Upload your first video to get started with AI clipping"
          action={
            <Link to="/upload" className="btn-primary">
              <Upload size={16} />
              Upload Video
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}