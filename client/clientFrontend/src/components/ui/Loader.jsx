export default function Loader({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">

      <div
        className={`${sizes[size]} border-2 border-[#2a2a3a] border-t-[#00ff88] rounded-full animate-spin`}
      />

      {text && (
        <p className="text-xs text-gray-400 font-mono animate-pulse">
          {text}
        </p>
      )}

    </div>
  );
}