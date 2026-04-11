import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film, X } from 'lucide-react';
import clsx from 'clsx';

export default function DropZone({ onFileSelect, selectedFile, onClear }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) onFileSelect(acceptedFiles[0]);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
  });

  if (selectedFile) {
    return (
      <div className="border border-[#00ff88]/40 bg-[#12121a] p-6 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-4">

          <div className="w-14 h-14 border border-[#00ff88]/40 flex items-center justify-center text-[#00ff88]">
            <Film size={26} />
          </div>

          <div className="text-left flex-1 min-w-0">
            <p className="font-mono text-white truncate text-sm">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          <button
            onClick={onClear}
            className="w-8 h-8 border border-[#2a2a3a] text-gray-400 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <X size={14} />
          </button>

        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border border-dashed p-10 text-center cursor-pointer transition-all duration-300 bg-[#0a0a0f]',
        isDragActive
          ? 'border-[#00ff88] bg-[#00ff88]/5 scale-[1.01]'
          : 'border-[#2a2a3a] hover:border-[#00ff88]/40 hover:bg-[#12121a]'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">

        <div
          className={clsx(
            'w-16 h-16 flex items-center justify-center border transition',
            isDragActive
              ? 'border-[#00ff88] text-[#00ff88]'
              : 'border-[#2a2a3a] text-gray-500'
          )}
        >
          <Upload size={28} />
        </div>

        <div>
          <p className="text-sm font-mono uppercase tracking-wide text-white mb-1">
            {isDragActive ? 'Drop video here' : 'Drag & drop video'}
          </p>
          <p className="text-xs text-gray-400">
            or click to browse files
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
          <span className="border border-[#2a2a3a] px-2 py-1">MP4</span>
          <span className="border border-[#2a2a3a] px-2 py-1">MOV</span>
          <span className="border border-[#2a2a3a] px-2 py-1">AVI</span>
          <span className="border border-[#2a2a3a] px-2 py-1">MKV</span>
          <span>• Max 500MB</span>
        </div>

      </div>
    </div>
  );
}