import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Zap, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { videoAPI, clipAPI } from '../services/api';
import { useVideoStatus } from '../hooks/useVideoStatus';
import ClipsGallery from '../components/clips/ClipsGallery';
import StatusBadge from '../components/video/StatusBadge';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

export default function VideoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const { status, clips: polledClips, loading: polling, startPolling } = useVideoStatus(id);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await videoAPI.getById(id);
        setVideo(response.data);
        if (response.data.status === 'completed') {
          const clipsRes = await clipAPI.getByVideo(id);
          setClips(clipsRes.data);
        }
        if (response.data.status === 'processing') {
          startPolling();
        }
      } catch {
        toast.error('Video not found');
        navigate('/videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  useEffect(() => {
    if (polledClips.length > 0) setClips(polledClips);
  }, [polledClips]);

  useEffect(() => {
    if (status && video) {
      setVideo((prev) => ({ ...prev, status }));
      if (status === 'completed') toast.success('Clips generated successfully!');
      if (status === 'failed') toast.error('Processing failed. Please try again.');
    }
  }, [status]);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await videoAPI.process(id);
      setVideo((prev) => ({ ...prev, status: 'processing' }));
      toast.success('AI processing started!');
      startPolling();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this video and all its clips?')) return;
    try {
      await videoAPI.delete(id);
      toast.success('Video deleted');
      navigate('/videos');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader size="lg" text="Loading video..." />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="animate-fade-in">

      <Link
        to="/videos"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Videos
      </Link>

      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {video.thumbnailUrl && (
            <div className="w-full lg:w-72 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-white">{video.title}</h1>
              <StatusBadge status={video.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <span>Uploaded {new Date(video.createdAt).toLocaleDateString()}</span>
              {video.clips?.length > 0 && (
                <span className="text-sky-400">{video.clips.length} clips generated</span>
              )}
            </div>

            {video.status === 'processing' && (
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6">
                <RefreshCw size={18} className="text-yellow-400 animate-spin" />
                <div>
                  <p className="text-yellow-400 font-medium text-sm">
                    AI is processing your video...
                  </p>
                  <p className="text-yellow-400/60 text-xs mt-0.5">
                    This may take 2-5 minutes.
                  </p>
                </div>
              </div>
            )}

            {video.status === 'failed' && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                <AlertCircle size={18} className="text-red-400" />
                <p className="text-red-400 text-sm">
                  Processing failed. Try again below.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {(video.status === 'uploaded' || video.status === 'failed') && (
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="btn-primary"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" />
                      Starting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap size={16} />
                      Process with AI
                    </span>
                  )}
                </button>
              )}

              
              <a
                href={video.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View Original
              </a>

              <button
                onClick={handleDelete}
                className="btn-secondary text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {polling && (
        <div className="flex items-center justify-center py-16">
          <Loader size="lg" text="AI is analyzing your video and generating clips..." />
        </div>
      )}

      {!polling && <ClipsGallery clips={clips} />}

    </div>
  );
}