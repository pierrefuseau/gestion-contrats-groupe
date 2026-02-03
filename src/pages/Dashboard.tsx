import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  AlertTriangle,
  FileText,
  Euro,
  Percent,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/common';
import { useData } from '../contexts/DataContext';
import { formatCurrency, formatPercent, formatWeight, getStatusColors, getStatusLabel } from '../utils/formatters';

export function Dashboard() {
  const navigate = useNavigate();
  const { positions, supplierContracts, clientContracts } = useData();

  const kpis = useMemo(() => {
    const shortCount = positions.filter(p => p.status === 'SHORT').length;
    const criticalCount = positions.filter(p => p.status === 'CRITICAL').length;
    const activeSupplier = supplierContracts.filter(c => c.status === 'active').length;
    const activeClient = clientContracts.filter(c => c.status === 'active').length;

    const totalBuyValue = supplierContracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.price_buy * c.qty_remaining_kg), 0);

    const totalSellValue = clientContracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.price_sell * c.qty_remaining_kg), 0);

    const avgMargin = positions.length > 0
      ? positions.reduce((sum, p) => sum + p.margin_percent, 0) / positions.length
      : 0;

    return {
      shortCount,
      criticalCount,
      activeContracts: activeSupplier + activeClient,
      engagedValueBuy: totalBuyValue,
      engagedValueSell: totalSellValue,
      potentialMargin: totalSellValue - totalBuyValue,
      avgMargin
    };
  }, [positions, supplierContracts, clientContracts]);

  const riskPositions = useMemo(() => {
    return positions
      .filter(p => p.status !== 'LONG')
      .sort((a, b) => a.net_position_kg - b.net_position_kg)
      .slice(0, 6);
  }, [positions]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          label="Positions DEFICIT"
          value={kpis.shortCount}
          icon={<TrendingDown className="w-5 h-5" />}
          variant={kpis.shortCount > 0 ? 'warning' : 'default'}
        />
        <KPICard
          label="Positions CRITIQUES"
          value={kpis.criticalCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={kpis.criticalCount > 0 ? 'danger' : 'default'}
        />
        <KPICard
          label="Contrats Actifs"
          value={kpis.activeContracts}
          icon={<FileText className="w-5 h-5" />}
        />
        <KPICard
          label="Valeur Engagee"
          value={formatCurrency(kpis.engagedValueSell)}
          icon={<Euro className="w-5 h-5" />}
        />
        <KPICard
          label="Marge Moyenne"
          value={formatPercent(kpis.avgMargin)}
          icon={<Percent className="w-5 h-5" />}
          variant={kpis.avgMargin > 15 ? 'success' : 'default'}
        />
      </div>

      {riskPositions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Risques Immediats
            </h2>
            <button
              onClick={() => navigate('/products?status=SHORT,CRITICAL')}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskPositions.map(position => {
              const colors = getStatusColors(position.status);
              return (
                <button
                  key={position.sku}
                  onClick={() => navigate(`/product/${encodeURIComponent(position.sku)}`)}
                  className={`${colors.bg} ${colors.border} border rounded-xl p-4 text-left hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">{position.sku}</p>
                      <p className="font-semibold text-slate-900 truncate">{position.article_name}</p>
                    </div>
                    <span className={`${colors.text} text-xs font-bold px-2 py-1 rounded-full ${colors.bg}`}>
                      {getStatusLabel(position.status)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${colors.text}`}>
                      {formatWeight(position.net_position_kg)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {position.supplier_contracts} contrats fournisseur | {position.client_contracts} contrats client
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="none">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Top Fournisseurs Actifs</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {supplierContracts
              .filter(c => c.status === 'active')
              .slice(0, 5)
              .map((contract, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900">{contract.supplier_name}</p>
                    <p className="text-sm text-slate-500">{contract.article_name || contract.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatWeight(contract.qty_remaining_kg)}</p>
                    <p className="text-xs text-slate-500">reste</p>
                  </div>
                </div>
              ))}
            {supplierContracts.filter(c => c.status === 'active').length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                Aucun contrat fournisseur actif
              </div>
            )}
          </div>
        </Card>

        <Card padding="none">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Top Clients Actifs</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {clientContracts
              .filter(c => c.status === 'active')
              .slice(0, 5)
              .map((contract) => (
                <div key={contract.contract_id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900">{contract.client_name}</p>
                    <p className="text-sm text-slate-500">{contract.article_name || contract.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-rose-600">{formatWeight(contract.qty_remaining_kg)}</p>
                    <p className="text-xs text-slate-500">a livrer</p>
                  </div>
                </div>
              ))}
            {clientContracts.filter(c => c.status === 'active').length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                Aucun contrat client actif
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function KPICard({ label, value, icon, variant = 'default' }: KPICardProps) {
  const variantStyles = {
    default: 'bg-white border-slate-200',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-rose-50 border-rose-200'
  };

  const iconStyles = {
    default: 'text-slate-400',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-rose-600'
  };

  return (
    <div className={`${variantStyles[variant]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <span className={iconStyles[variant]}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
