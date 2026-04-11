export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">

      <div className="w-20 h-20 border border-[#2a2a3a] bg-[#12121a] flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-500" />
      </div>

      <h3 className="text-sm font-mono uppercase tracking-widest text-white mb-2">
        {title}
      </h3>

      <p className="text-xs text-gray-400 mb-6 max-w-sm font-mono">
        {description}
      </p>

      {action}

    </div>
  );
}