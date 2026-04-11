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
    <div className="relative min-h-screen bg-[#0a0a0f] text-[#e0e0e0] overflow-hidden">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[linear-gradient(rgba(0,255,136,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.05)_1px,transparent_1px)] bg-[size:50px_50px] animate-[slowMove_20s_linear_infinite]" />

      {/* SCANLINES */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.4)_2px,rgba(0,0,0,0.4)_4px)]" />

      {/* HERO */}
      <div className="text-center py-24 px-4 animate-[float_6s_ease-in-out_infinite]">

        <h1 className="mt-8 text-5xl sm:text-7xl font-black uppercase tracking-widest text-[#00ff88] leading-tight">
          Turn Long Videos
          <br />
          <span className="text-white">
            Into Viral Clips
          </span>
        </h1>

        <p className="mt-6 text-gray-400 max-w-xl mx-auto font-mono text-sm tracking-wide opacity-80">
          {'>'} Upload video → AI extracts high-engagement segments → export ready clips
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

          <Link
            to="/upload"
            className="px-8 py-3 border-2 border-[#00ff88] text-[#00ff88] uppercase tracking-wider font-mono transition-all duration-200 hover:bg-[#00ff88] hover:text-black hover:scale-105 hover:shadow-[0_0_20px_#00ff88]"
            style={{
              clipPath:
                'polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px))',
            }}
          >
            <Upload size={18} className="inline mr-2" />
            Upload
          </Link>

          <Link
            to="/videos"
            className="px-8 py-3 border border-[#ff00ff] text-[#ff00ff] uppercase tracking-wider font-mono transition-all duration-200 hover:bg-[#ff00ff] hover:text-black hover:scale-105 hover:shadow-[0_0_20px_#ff00ff]"
            style={{
              clipPath:
                'polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px))',
            }}
          >
            <Film size={18} className="inline mr-2" />
            Library
          </Link>

        </div>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-16">

        {features.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={i}
            className="relative p-6 bg-[#12121a] border border-[#2a2a3a] hover:border-[#00ff88] transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_0_20px_#00ff88]/20"
            style={{
              clipPath:
                'polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px))',
              animation: `float 5s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >

            {/* Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[#00ff88]/5 blur-xl" />

            <div className="relative z-10 text-center">

              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-[#00ff88]/40 text-[#00ff88] group-hover:shadow-[0_0_10px_#00ff88] transition">
                <Icon size={22} />
              </div>

              <h3 className="text-white font-mono uppercase tracking-wide text-sm mb-2">
                {title}
              </h3>

              <p className="text-xs text-gray-400 font-mono">
                {desc}
              </p>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}