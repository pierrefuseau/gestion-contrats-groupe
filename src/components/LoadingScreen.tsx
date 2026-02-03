export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <img
        src="/logo_fuseau_hd.png"
        alt="Groupe FUSEAU"
        className="h-20 object-contain mb-8 animate-pulse"
      />
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="mt-4 text-muted">Chargement des donnees...</p>
    </div>
  );
}
