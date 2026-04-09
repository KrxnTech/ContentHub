export default function Loader({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-sky-600/30 border-t-sky-500 rounded-full animate-spin`} />

      {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
}