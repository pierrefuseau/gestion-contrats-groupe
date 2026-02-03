import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Download, ChevronRight } from 'lucide-react';
import { Card, DataTable, type Column } from '../components/common';
import { Button } from '../components/common/Button';
import { useData } from '../contexts/DataContext';
import { formatWeight, getStatusColors, getStatusLabel } from '../utils/formatters';
import type { PositionSummary } from '../types';

export function ProductList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { positions } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || ''
  );

  const filteredPositions = useMemo(() => {
    return positions.filter(p => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchName = p.article_name.toLowerCase().includes(searchLower);
        const matchSku = p.sku.toLowerCase().includes(searchLower);
        if (!matchName && !matchSku) return false;
      }

      if (statusFilter) {
        const statuses = statusFilter.split(',');
        if (!statuses.includes(p.status)) return false;
      }

      return true;
    });
  }, [positions, search, statusFilter]);

  const columns: Column<PositionSummary>[] = [
    {
      key: 'sku',
      header: 'SKU',
      width: '140px',
      sortable: true,
      getValue: p => p.sku,
      render: p => (
        <span className="font-mono text-xs text-slate-500">{p.sku}</span>
      )
    },
    {
      key: 'name',
      header: 'Produit',
      sortable: true,
      getValue: p => p.article_name,
      render: p => (
        <p className="font-medium text-slate-900">{p.article_name}</p>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      width: '130px',
      sortable: true,
      getValue: p => p.stock_kg,
      render: p => (
        <div>
          <span className="text-sm text-slate-700">{formatWeight(p.stock_kg)}</span>
          <p className="text-xs text-slate-400">{p.stock_uvc.toLocaleString('fr-FR')} UVC</p>
        </div>
      )
    },
    {
      key: 'position',
      header: 'Position Nette',
      width: '160px',
      sortable: true,
      getValue: p => p.net_position_kg,
      render: p => {
        const colors = getStatusColors(p.status);
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${colors.text}`}>
              {p.net_position_kg >= 0 ? '+' : ''}{formatWeight(p.net_position_kg)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {getStatusLabel(p.status)}
            </span>
          </div>
        );
      }
    },
    {
      key: 'supply',
      header: 'A recevoir',
      width: '120px',
      sortable: true,
      getValue: p => p.supply_remaining_kg,
      render: p => (
        <span className="text-sm text-emerald-600">
          +{formatWeight(p.supply_remaining_kg)}
        </span>
      )
    },
    {
      key: 'demand',
      header: 'A livrer',
      width: '120px',
      sortable: true,
      getValue: p => p.demand_remaining_kg,
      render: p => (
        <span className="text-sm text-rose-600">
          -{formatWeight(p.demand_remaining_kg)}
        </span>
      )
    },
    {
      key: 'contracts',
      header: 'Contrats',
      width: '100px',
      sortable: true,
      getValue: p => p.supplier_contracts + p.client_contracts,
      render: p => (
        <div className="text-xs text-slate-500">
          <span className="text-emerald-600">{p.supplier_contracts} F</span>
          {' / '}
          <span className="text-rose-600">{p.client_contracts} C</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: () => (
        <ChevronRight className="w-4 h-4 text-slate-400" />
      )
    }
  ];

  const handleExport = () => {
    const headers = ['SKU', 'Produit', 'Stock KG', 'Stock UVC', 'Position Nette KG', 'Statut', 'A recevoir KG', 'A livrer KG', 'Contrats Fournisseur', 'Contrats Client'];
    const rows = filteredPositions.map(p => [
      p.sku,
      p.article_name,
      p.stock_kg,
      p.stock_uvc,
      p.net_position_kg,
      p.status,
      p.supply_remaining_kg,
      p.demand_remaining_kg,
      p.supplier_contracts,
      p.client_contracts
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `positions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  const hasFilters = search || statusFilter;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Produits</h1>
        <Button
          variant="secondary"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExport}
        >
          Exporter
        </Button>
      </div>

      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou SKU..."
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Tous statuts</option>
            <option value="LONG">Excedent</option>
            <option value="SHORT">Deficit</option>
            <option value="CRITICAL">Critique</option>
            <option value="SHORT,CRITICAL">Deficit + Critique</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="h-9 px-3 text-sm text-slate-600 hover:text-slate-900"
            >
              Effacer filtres
            </button>
          )}
        </div>
      </Card>

      <Card padding="none">
        <DataTable
          data={filteredPositions}
          columns={columns}
          keyExtractor={p => p.sku}
          onRowClick={p => navigate(`/product/${encodeURIComponent(p.sku)}`)}
          emptyMessage="Aucun produit trouve"
        />
      </Card>

      <div className="text-sm text-slate-500 text-center">
        {filteredPositions.length} produit{filteredPositions.length > 1 ? 's' : ''} affiche{filteredPositions.length > 1 ? 's' : ''}
        {hasFilters && ` sur ${positions.length}`}
      </div>
    </div>
  );
}
