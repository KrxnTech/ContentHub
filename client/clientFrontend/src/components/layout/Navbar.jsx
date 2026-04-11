import { Link, useLocation } from 'react-router-dom';
import { Scissors, Upload, Film, Home } from 'lucide-react';
import clsx from 'clsx';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/videos', label: 'My Videos', icon: Film },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="border-b border-[#2a2a3a] bg-[#000]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 border border-[#00ff88] flex items-center justify-center text-[#00ff88] group-hover:bg-[#00ff88] group-hover:text-black transition">
              <Scissors size={18} />
            </div>

            <span className="font-mono text-sm uppercase tracking-widest text-white">
              Clip<span className="text-[#00ff88]">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-2">

            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider transition border border-transparent',
                  location.pathname === to
                    ? 'border-[#00ff88] text-[#00ff88]'
                    : 'text-gray-400 hover:text-[#00ff88] hover:border-[#00ff88]/40'
                )}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}

          </div>
        </div>
      </div>
    </nav>
  );
}