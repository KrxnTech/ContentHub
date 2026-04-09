import { useCallback, useState } from 'react';
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
      <div className="border-2 border-sky-500/50 bg-sky-500/5 rounded-2xl p-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-4">
          <div className="w-14 h-14 bg-sky-600/20 rounded-xl flex items-center justify-center">
            <Film size={28} className="text-sky-400" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{selectedFile.name}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={onClear}
            className="w-8 h-8 bg-slate-800 hover:bg-red-500/20 rounded-lg flex items-center justify-center transition-colors text-gray-400 hover:text-red-400"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300',
        isDragActive
          ? 'border-sky-500 bg-sky-500/10 scale-[1.01]'
          : 'border-white/20 hover:border-sky-500/50 hover:bg-white/5'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className={clsx(
          'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
          isDragActive ? 'bg-sky-500/20' : 'bg-slate-800'
        )}>
          <Upload size={32} className={isDragActive ? 'text-sky-400' : 'text-gray-500'} />
        </div>
        <div>
          <p className="text-lg font-semibold text-white mb-1">
            {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
          </p>
          <p className="text-gray-400 text-sm">or click to browse files</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="badge bg-slate-800 text-gray-400">MP4</span>
          <span className="badge bg-slate-800 text-gray-400">MOV</span>
          <span className="badge bg-slate-800 text-gray-400">AVI</span>
          <span className="badge bg-slate-800 text-gray-400">MKV</span>
          <span className="text-gray-600">• Max 500MB</span>
        </div>
      </div>
    </div>

  );
}