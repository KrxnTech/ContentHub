import { CheckCircle } from 'lucide-react';

export default function UploadProgress({ progress }) {
  return (
    <div className="animate-slide-up">

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">
          Uploading to Cloudinary...
        </span>

        <span className="text-sm font-mono text-[#00ff88]">
          {progress}%
        </span>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-[#12121a] h-2 overflow-hidden border border-[#2a2a3a]">

        <div
          className="h-full bg-[#00ff88] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />

      </div>

      {/* COMPLETE STATE */}
      {progress === 100 && (
        <div className="flex items-center gap-2 mt-3 text-[#00ff88] text-xs font-mono animate-fade-in">
          <CheckCircle size={14} />
          <span>Upload complete. Saving...</span>
        </div>
      )}

    </div>
  );
}