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
    <nav className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center group-hover:bg-sky-500 transition-colors">
              <Scissors size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Clip<span className="text-sky-400">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  location.pathname === to
                    ? 'bg-sky-600/20 text-sky-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >

                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}