export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-medium">Chargement des donnees...</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`${sizeClasses[size]} border-emerald-500 border-t-transparent rounded-full animate-spin`} />
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner />
        <p className="text-sm text-slate-500">Chargement...</p>
      </div>
    </div>
  );
}
