import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Zap, RefreshCw, Trash2, AlertCircle, Play, Brain, BarChart3, FileText, TrendingUp } from 'lucide-react';

import { videoAPI, clipAPI } from '../services/api';
import { useVideoStatus } from '../hooks/useVideoStatus';
import ClipsGallery from '../components/clips/ClipsGallery';
import StatusBadge from '../components/video/StatusBadge';
import Loader from '../components/ui/Loader';
import TimelineVisualization from '../components/analysis/TimelineVisualization';
import AIThinkingPanel from '../components/analysis/AIThinkingPanel';
import TranscriptViewer from '../components/analysis/TranscriptViewer';
import toast from 'react-hot-toast';

export default function VideoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClip, setSelectedClip] = useState(null);

  const { status, clips: polledClips, loading: polling, startPolling } = useVideoStatus(id);

  const fetchVideo = async () => {
    try {
      const response = await videoAPI.getById(id);

      console.log("\n" + "=".repeat(60));
      console.log("CRITICAL DEBUG: API RESPONSE IN PAGE", response.data);
      console.log(`Status: ${response.data.status}`);
      console.log(`Clips Array Length (from video): ${response.data.clips?.length}`);
      console.log("=".repeat(60) + "\n");

      setVideo(response.data);

      if (response.data.status === 'completed' && clips.length === 0) {
        const clipsRes = await clipAPI.getByVideo(id);
        console.log("DEBUG: Loaded Clips from API:", clipsRes.data);
        setClips(clipsRes.data);
        if (clipsRes.data.length > 0 && !selectedClip) setSelectedClip(clipsRes.data[0]);
      }
    } catch (err) {
      console.error(err);
      if (!video) {
        toast.error('Video not found');
        navigate('/videos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();

    // Setup polling interval for status updates
    const interval = setInterval(() => {
      // Only poll if video isn't finished yet
      if (video?.status !== 'completed' && video?.status !== 'failed') {
        fetchVideo();
      }
    }, 5000);


    return () => clearInterval(interval);
  }, [id, video?.status]);

  useEffect(() => {
    if (polledClips && polledClips.length > 0) {
      console.log("DEBUG: Received clips from polling hook:", polledClips);
      setClips(polledClips);
      if (!selectedClip) setSelectedClip(polledClips[0]);
    }
  }, [polledClips]);


  useEffect(() => {
    if (status && video) {
      setVideo((prev) => ({ ...prev, status }));
      if (status === 'completed') toast.success('AI Brain has finished analysis!');
      if (status === 'failed') toast.error('Processing failed. Please try again.');
    }
  }, [status]);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await videoAPI.process(id);
      setVideo((prev) => ({ ...prev, status: 'processing' }));
      toast.success('AI analysis started!');
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader size="lg" text="Initializing AI neurons..." />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="animate-fade-in space-y-8 pb-20">

      <div className="flex items-center justify-between">
        <Link
          to="/videos"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete Video"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Analysis Header */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Video & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-0 overflow-hidden border-white/5 shadow-2xl">
            <div className="bg-black/40 p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Play size={14} className="text-purple-400 fill-purple-400" />
                </div>
                <h1 className="text-lg font-bold text-white truncate max-w-md">{video.title}</h1>
              </div>
              <StatusBadge status={video.status} />
            </div>

            <div className="aspect-video bg-black relative group">
              <video
                ref={videoRef}
                src={video.originalUrl}
                controls
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full"
                poster={video.thumbnailUrl}
              />
            </div>
          </div>

          {/* Timeline Graph */}
          {(video.status === 'completed' || video.aiSegments?.length > 0) && (
            <TimelineVisualization
              duration={video.duration}
              segments={video.aiSegments}
              clips={clips}
              activeClipId={selectedClip?._id}
            />
          )}
        </div>

        {/* Right Column: AI Logic & Stats */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-slate-900 to-black border-sky-500/10 h-full flex flex-col">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-widest mb-6">
              <BarChart3 size={16} />
              Processing Insight
            </div>

            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400 text-sm">Video Duration</span>
                <span className="text-white font-mono">{video.duration.toFixed(1)}s</span>
              </div>

              {video.status === 'uploaded' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <Zap size={32} className="text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Ready for Analysis</h3>
                    <p className="text-gray-400 text-sm mt-1">Our AI is waiting to scan this video for viral moments.</p>
                  </div>
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    {processing ? 'Starting Brain...' : 'Initalize AI Scan'}
                  </button>
                </div>
              )}

              {(video.status === 'completed' || video.status === 'processing') && (
                <AIThinkingPanel clip={selectedClip} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Transcript & Detailed Analysis */}
      {video.status === 'completed' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
              <FileText size={16} />
              Content Proof: Full Transcript
            </div>
            <TranscriptViewer
              transcript={video.transcript}
              currentTime={currentTime}
              selectedClip={selectedClip}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Brain size={16} />
              Engine Summary
            </div>
            <div className="card bg-black/20 border-white/5 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">AI Confidence Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white">{(selectedClip?.confidence * 100 || 87).toFixed(0)}%</span>
                  <span className="text-green-500 text-xs mb-2 font-bold flex items-center gap-1">
                    <TrendingUp size={12} /> High Reliability
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mt-4">
                  The AI model has cross-referenced the transcript importance, audio spikes, and emotional shifts to finalize its confidence in these selections.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <div className="pt-12">
        {polling && (
          <div className="card flex flex-col items-center justify-center py-20 bg-black/40 border-dashed border-2 border-white/10">
            <RefreshCw size={48} className="text-sky-500 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">AI Brain is Thinking...</h3>
            <p className="text-gray-500 text-center max-w-sm">
              Scanning keywords, detecting laughter, and calculating viral potential across the entire timeline.
            </p>

            <div className="w-64 h-2 bg-slate-900 rounded-full mt-8 overflow-hidden">
              <div className="h-full bg-sky-500 animate-pulse-width" />
            </div>
          </div>
        )}

        {!polling && (
          <ClipsGallery
            clips={clips}
            activeClipId={selectedClip?._id}
            onSelectClip={setSelectedClip}
          />
        )}
      </div>

    </div>
  );
}
