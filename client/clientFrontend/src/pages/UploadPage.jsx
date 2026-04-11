import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Scissors } from 'lucide-react';
import DropZone from '../components/upload/DropZone';
import UploadProgress from '../components/upload/UploadProgress';
import { useUpload } from '../hooks/useUpload';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const { uploadVideo, uploading, uploadProgress } = useUpload();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a video file');
    if (!title.trim()) return toast.error('Please enter a title');

    try {
      const video = await uploadVideo(file, title);
      navigate(`/videos/${video._id}`);
    } catch (err) { }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0] relative overflow-hidden">

      {/* SUBTLE GRID BACKGROUND */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="max-w-2xl mx-auto py-16 px-4 animate-[float_6s_ease-in-out_infinite]">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black uppercase tracking-widest text-[#00ff88]">
            Upload Video
          </h1>
          <p className="text-gray-400 font-mono text-sm mt-2">
            {'>'} Inject video into AI pipeline
          </p>
        </div>

        {/* MAIN CARD */}
        <div
          className="relative p-6 bg-[#12121a] border border-[#2a2a3a] space-y-6"
          style={{
            clipPath:
              'polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px))',
          }}
        >

          {/* TITLE INPUT */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-mono">
              Title *
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88] font-mono">
                {'>'}
              </span>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="enter_video_title..."
                disabled={uploading}
                className="w-full bg-[#0a0a0f] border border-[#2a2a3a] pl-8 pr-4 py-3 text-[#00ff88] font-mono text-sm focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_10px_#00ff88] transition-all disabled:opacity-50"
                style={{
                  clipPath:
                    'polygon(0 8px,8px 0,calc(100% - 8px) 0,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0 calc(100% - 8px))',
                }}
              />
            </div>
          </div>

          {/* DROP ZONE */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-mono">
              Video File
            </label>

            {!uploading && (
              <DropZone
                onFileSelect={setFile}
                selectedFile={file}
                onClear={() => setFile(null)}
              />
            )}
          </div>

          {/* PROGRESS */}
          {uploading && <UploadProgress progress={uploadProgress} />}

          {/* BUTTON */}
          {!uploading && (
            <button
              onClick={handleUpload}
              disabled={!file || !title.trim()}
              className="w-full py-3 border-2 border-[#00ff88] text-[#00ff88] uppercase tracking-wider font-mono transition-all duration-200 hover:bg-[#00ff88] hover:text-black hover:shadow-[0_0_20px_#00ff88] disabled:opacity-40 disabled:hover:shadow-none"
              style={{
                clipPath:
                  'polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px))',
              }}
            >
              <Upload size={18} className="inline mr-2" />
              Upload & Continue
            </button>
          )}
        </div>

        {/* INFO PANEL */}
        <div
          className="mt-8 p-4 border border-[#00ff88]/30 bg-[#00ff88]/5"
          style={{
            clipPath:
              'polygon(0 8px,8px 0,calc(100% - 8px) 0,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0 calc(100% - 8px))',
          }}
        >
          <div className="flex items-start gap-3">

            <Scissors size={18} className="text-[#00ff88] mt-0.5 shrink-0" />

            <div className="text-xs font-mono text-gray-400">
              <p className="text-[#00ff88] uppercase tracking-wider mb-1">
                Processing Flow
              </p>
              <p>
                {'>'} Upload → Analyze → Extract → Generate clips → Export ready
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}