export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
        <Icon size={36} className="text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}