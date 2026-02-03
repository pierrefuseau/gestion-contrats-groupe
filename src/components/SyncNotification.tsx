import { X, AlertTriangle } from 'lucide-react';

interface SyncNotificationProps {
  message: string | null;
  onDismiss: () => void;
}

export function SyncNotification({ message, onDismiss }: SyncNotificationProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">
              Synchronisation
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {message}
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Les donnees locales restent disponibles.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-amber-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
