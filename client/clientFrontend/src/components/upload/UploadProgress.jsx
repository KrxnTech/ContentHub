import { CheckCircle } from 'lucide-react';

export default function UploadProgress({ progress }) {
  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">Uploading to Cloudinary...</span>
        <span className="text-sm font-bold text-sky-400">{progress}%</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {progress === 100 && (
        <div className="flex items-center gap-2 mt-3 text-green-400 text-sm animate-fade-in">
          <CheckCircle size={16} />
          <span>Upload complete! Saving to database...</span>
        </div>
      )}
    </div>
  );
}