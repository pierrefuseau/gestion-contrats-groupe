import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Eye, Filter, ExternalLink } from 'lucide-react';
import { Card, DataTable, type Column } from '../components/common';
import { Button } from '../components/common/Button';
import { useAlerts } from '../hooks/useAlerts';
import { formatDate, formatRelativeDate } from '../utils/formatters';
import { SEVERITY_COLORS, ALERT_TYPE_LABELS } from '../utils/constants';
import type { Alert } from '../types';

export function AlertsCenter() {
  const {
    alerts,
    unreadCount,
    markAsRead,
    markAsResolved,
    markAllAsRead
  } = useAlerts();

  const [typeFilter, setTypeFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'unresolved'>('all');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (typeFilter && alert.type !== typeFilter) return false;
      if (severityFilter && alert.severity !== severityFilter) return false;
      if (statusFilter === 'unread' && alert.is_read) return false;
      if (statusFilter === 'unresolved' && alert.is_resolved) return false;
      return true;
    });
  }, [alerts, typeFilter, severityFilter, statusFilter]);

  const columns: Column<Alert>[] = [
    {
      key: 'created_at',
      header: 'Date',
      width: '140px',
      sortable: true,
      getValue: a => new Date(a.created_at).getTime(),
      render: a => (
        <div>
          <p className="text-sm text-slate-900">{formatDate(a.created_at)}</p>
          <p className="text-xs text-slate-500">{formatRelativeDate(a.created_at)}</p>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      width: '160px',
      render: a => (
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${SEVERITY_COLORS[a.severity]}`}
        >
          {ALERT_TYPE_LABELS[a.type]}
        </span>
      )
    },
    {
      key: 'severity',
      header: 'Sévérité',
      width: '100px',
      sortable: true,
      getValue: a => {
        const order = { critical: 0, warning: 1, info: 2 };
        return order[a.severity];
      },
      render: a => (
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              a.severity === 'critical'
                ? 'bg-rose-500'
                : a.severity === 'warning'
                ? 'bg-amber-500'
                : 'bg-blue-500'
            }`}
          />
          <span className="text-sm text-slate-700 capitalize">
            {a.severity === 'critical'
              ? 'Critique'
              : a.severity === 'warning'
              ? 'Attention'
              : 'Info'}
          </span>
        </div>
      )
    },
    {
      key: 'message',
      header: 'Message',
      render: a => (
        <div className="max-w-md">
          <p className={`text-sm ${a.is_read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
            {a.message}
          </p>
          {a.sku && (
            <Link
              to={`/product/${a.sku}`}
              className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              {a.sku}
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      width: '120px',
      render: a => (
        <div className="flex items-center gap-2">
          {!a.is_read && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
              Non lu
            </span>
          )}
          {a.is_resolved ? (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
              Résolu
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
              Actif
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      render: a => (
        <div className="flex items-center gap-1">
          {!a.is_read && (
            <button
              onClick={e => {
                e.stopPropagation();
                markAsRead(a.id);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
              title="Marquer comme lu"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {!a.is_resolved && (
            <button
              onClick={e => {
                e.stopPropagation();
                markAsResolved(a.id);
              }}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
              title="Marquer comme résolu"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const alertTypes = [
    { value: 'position_short', label: 'Position déficitaire' },
    { value: 'position_critical', label: 'Position critique' },
    { value: 'delivery_delayed', label: 'Livraison retardée' },
    { value: 'contract_expiring', label: 'Contrat expirant' },
    { value: 'threshold_breach', label: 'Seuil franchi' }
  ];

  const clearFilters = () => {
    setTypeFilter('');
    setSeverityFilter('');
    setStatusFilter('all');
  };

  const hasFilters = typeFilter || severityFilter || statusFilter !== 'all';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Bell className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Centre d'Alertes</h1>
            <p className="text-sm text-slate-500">
              {unreadCount > 0 ? `${unreadCount} alerte${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune alerte non lue'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllAsRead}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Tous types</option>
            {alertTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Toutes sévérités</option>
            <option value="critical">Critique</option>
            <option value="warning">Attention</option>
            <option value="info">Info</option>
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === 'unread'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non lues
            </button>
            <button
              onClick={() => setStatusFilter('unresolved')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === 'unresolved'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non résolues
            </button>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Effacer filtres
            </button>
          )}
        </div>
      </Card>

      <Card padding="none">
        <DataTable
          data={filteredAlerts}
          columns={columns}
          keyExtractor={a => a.id}
          emptyMessage="Aucune alerte"
        />
      </Card>

      <div className="text-sm text-slate-500 text-center">
        {filteredAlerts.length} alerte{filteredAlerts.length > 1 ? 's' : ''} affichée{filteredAlerts.length > 1 ? 's' : ''}
        {hasFilters && ` sur ${alerts.length}`}
      </div>
    </div>
  );
}
