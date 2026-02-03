import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Bell, ChevronRight } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { formatRelativeDate } from '../../utils/formatters';
import { SEVERITY_COLORS, ALERT_TYPE_LABELS } from '../../utils/constants';

export function AlertsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { recentAlerts, unreadCount, markAsRead, markAllAsRead } = useAlerts();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-80 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Alertes</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentAlerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Aucune alerte
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentAlerts.map(alert => (
                  <li key={alert.id}>
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className={clsx(
                        'w-full p-3 text-left hover:bg-slate-50 transition-colors',
                        !alert.is_read && 'bg-blue-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={clsx(
                            'mt-0.5 w-2 h-2 rounded-full shrink-0',
                            alert.severity === 'critical' && 'bg-rose-500',
                            alert.severity === 'warning' && 'bg-amber-500',
                            alert.severity === 'info' && 'bg-blue-500'
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={clsx(
                                'px-1.5 py-0.5 text-[10px] font-medium rounded border',
                                SEVERITY_COLORS[alert.severity]
                              )}
                            >
                              {ALERT_TYPE_LABELS[alert.type]}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatRelativeDate(alert.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-700 line-clamp-2">
                            {alert.message}
                          </p>
                        </div>
                        {!alert.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/alerts"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-t border-slate-100 transition-colors"
          >
            Voir toutes les alertes
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
