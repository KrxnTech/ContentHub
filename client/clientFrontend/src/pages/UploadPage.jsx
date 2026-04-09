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
    } catch (err) {
      // error already shown by hook
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
        <p className="text-gray-400">Upload your video and let AI generate the best clips</p>
      </div>

      <div className="card space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Video Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your video..."
            disabled={uploading}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
          />

        </div>

        {/* Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Video File</label>
          {!uploading && (
            <DropZone
              onFileSelect={setFile}
              selectedFile={file}
              onClear={() => setFile(null)}
            />
          )}
        </div>

        {/* Upload Progress */}
        {uploading && <UploadProgress progress={uploadProgress} />}

        {/* Upload Button */}
        {!uploading && (
          <button
            onClick={handleUpload}
            disabled={!file || !title.trim()}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            <Upload size={18} />
            Upload & Continue
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-sky-600/10 border border-sky-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Scissors size={18} className="text-sky-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-400">
            <p className="font-medium text-sky-400 mb-1">How it works</p>
            <p>After uploading, click "Process with AI" on your video page. Our AI will analyze your video and automatically generate the most engaging clips.</p>
          </div>
        </div>
      </div>
    </div>
  );
}