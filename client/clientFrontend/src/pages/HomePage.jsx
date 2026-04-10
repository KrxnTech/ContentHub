import { Link } from 'react-router-dom';
import { Upload, Zap, Scissors, Film } from 'lucide-react';

const features = [
  { icon: Upload, title: 'Upload Video', desc: 'Drag & drop your video file up to 500MB' },
  { icon: Zap, title: 'AI Analysis', desc: 'Our AI analyzes content and finds key moments' },
  { icon: Scissors, title: 'Auto Clip', desc: 'Automatically generates engaging short clips' },
  { icon: Film, title: 'Download', desc: 'Preview and download your clips instantly' },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center py-20">
        <div className="inline-flex items-center gap-2 badge bg-sky-600/20 text-sky-400 border border-sky-500/30 mb-6 px-4 py-2">
          <Zap size={14} />
          AI-Powered Video Clipping
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Turn Long Videos Into
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400 block">
            Viral Clips Instantly
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Upload your video and let AI automatically find and extract the most engaging moments — ready to share in seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/upload" className="btn-primary text-base px-8 py-3">
            <Upload size={18} />
            Upload Video
          </Link>
          <Link to="/videos" className="btn-secondary text-base px-8 py-3">
            <Film size={18} />
            My Videos
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div key={i} className="card text-center hover:border-sky-500/30 transition-all">
            <div className="w-12 h-12 bg-sky-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon size={24} className="text-sky-400" />
            </div>

            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}