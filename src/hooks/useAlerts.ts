import { useMemo, useState, useCallback } from 'react';
import type { Alert } from '../types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const unreadCount = useMemo(
    () => alerts.filter(a => !a.is_read).length,
    [alerts]
  );

  const criticalAlerts = useMemo(
    () => alerts.filter(a => a.severity === 'critical'),
    [alerts]
  );

  const recentAlerts = useMemo(
    () => [...alerts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    [alerts]
  );

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, is_read: true } : a))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  }, []);

  return {
    alerts,
    unreadCount,
    criticalAlerts,
    recentAlerts,
    markAsRead,
    markAllAsRead
  };
}
