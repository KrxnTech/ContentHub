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
      <div className="min-h-screen bg-[#000] flex items-center justify-center">
        <Loader size="lg" text="Loading your videos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0] relative overflow-hidden">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">

          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-[#00ff88]">
              My Videos
            </h1>

            <p className="text-gray-400 font-mono text-sm mt-1">
              {'>'} {videos.length} video{videos.length !== 1 ? 's' : ''} stored
            </p>
          </div>

          <Link
            to="/upload"
            className="px-6 py-2 border border-[#00ff88] text-[#00ff88] font-mono uppercase tracking-wider hover:bg-[#00ff88] hover:text-black transition"
            style={{
              clipPath:
                'polygon(0 8px,8px 0,calc(100% - 8px) 0,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0 calc(100% - 8px))',
            }}
          >
            <Upload size={16} className="inline mr-2" />
            Upload
          </Link>

        </div>

        {/* CONTENT */}
        {videos.length === 0 ? (
          <div className="border border-[#2a2a3a] bg-[#12121a] p-10 text-center">

            <Film size={40} className="mx-auto text-[#00ff88] mb-4" />

            <h2 className="text-white font-semibold mb-2">
              No videos yet
            </h2>

            <p className="text-gray-400 text-sm mb-6">
              Upload your first video to start AI clipping
            </p>

            <Link
              to="/upload"
              className="px-6 py-2 border border-[#00ff88] text-[#00ff88] font-mono uppercase hover:bg-[#00ff88] hover:text-black transition"
            >
              <Upload size={16} className="inline mr-2" />
              Upload Video
            </Link>

          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onDelete={handleDelete}
              />
            ))}

          </div>
        )}

      </div>
    </div>
  );
}