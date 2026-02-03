import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  error: Error;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorBanner({ error, onRetry, isRetrying }: ErrorBannerProps) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-rose-800">Erreur de chargement</p>
          <p className="text-sm text-rose-600">{error.message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        Reessayer
      </button>
    </div>
  );
}

interface ErrorPageProps {
  error: Error;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorPage({ error, onRetry, isRetrying }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-600" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">
          Impossible de charger les donnees
        </h1>
        <p className="text-slate-600 mb-6">
          {error.message || 'Une erreur est survenue lors du chargement des donnees.'}
        </p>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Chargement...' : 'Reessayer'}
        </button>
        <p className="text-xs text-slate-400 mt-4">
          Verifiez votre connexion internet et votre cle API Google Sheets
        </p>
      </div>
    </div>
  );
}
