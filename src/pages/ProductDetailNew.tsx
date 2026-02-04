import { useParams, useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Warehouse, Factory, Users, Scale } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatPriceWithUnit } from '../utils/formatters';
import { PageHeader } from '../components/PageHeader';

export function ProductDetailNew() {
  const { sku } = useParams<{ sku: string }>();
  const navigate = useNavigate();
  const { getSupplierContractsBySku, getClientContractsBySku, getPositionBySku } = useData();

  const position = sku ? getPositionBySku(sku) : undefined;
  const supplierContracts = sku ? getSupplierContractsBySku(sku) : [];
  const clientContracts = sku ? getClientContractsBySku(sku) : [];

  const activeSupplierContracts = supplierContracts
    .filter(c => c.status === 'active')
    .sort((a, b) => {
      const dateA = a.date_start ? new Date(a.date_start).getTime() : 0;
      const dateB = b.date_start ? new Date(b.date_start).getTime() : 0;
      return dateB - dateA;
    });
  const activeClientContracts = clientContracts
    .filter(c => c.status === 'active')
    .sort((a, b) => {
      const dateA = a.date_start ? new Date(a.date_start).getTime() : 0;
      const dateB = b.date_start ? new Date(b.date_start).getTime() : 0;
      return dateB - dateA;
    });

  const formatWeight = (kg: number) => {
    if (Math.abs(kg) >= 1000) return `${(kg / 1000).toFixed(1)} T`;
    return `${Math.round(kg)} kg`;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-danger bg-danger/10 border-danger';
      case 'SHORT': return 'text-warning bg-warning/10 border-warning';
      case 'LONG': return 'text-success bg-success/10 border-success';
      default: return 'text-muted bg-muted/10 border-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5" />;
      case 'SHORT': return <TrendingDown className="w-5 h-5" />;
      case 'LONG': return <TrendingUp className="w-5 h-5" />;
      default: return null;
    }
  };

  if (!position) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader backTo="/produits" backLabel="Produits" />
        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-primary mb-2">Produit introuvable</h1>
          <p className="text-muted">Aucun produit avec le SKU "{sku}"</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader backTo="/produits" backLabel="Produits" />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-7 h-7 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-primary">{position.article_name}</h1>
              <p className="text-muted">SKU: {sku}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusColor(position.status)}`}>
              {getStatusIcon(position.status)}
              <span className="font-semibold">{position.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            Bilan de position
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Warehouse className="w-5 h-5 text-muted" />
                <span className="text-primary">Stock actuel</span>
              </div>
              <span className="font-semibold text-primary">{formatWeight(position.stock_kg)}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Factory className="w-5 h-5 text-success" />
                <span className="text-primary">Approvisionnement restant</span>
              </div>
              <span className="font-semibold text-success">+{formatWeight(position.supply_remaining_kg)}</span>
            </div>

            {position.supply_in_transit_kg > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-border pl-8">
                <span className="text-muted text-sm">dont en transit</span>
                <span className="text-muted text-sm">{formatWeight(position.supply_in_transit_kg)}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-danger" />
                <span className="text-primary">Engagements clients</span>
              </div>
              <span className="font-semibold text-danger">-{formatWeight(position.demand_remaining_kg)}</span>
            </div>

            <div className="flex items-center justify-between py-4 bg-surface-alt rounded-lg px-4 -mx-4">
              <span className="text-lg font-semibold text-primary">Position nette</span>
              <span className={`text-xl font-bold ${position.net_position_kg >= 0 ? 'text-success' : 'text-danger'}`}>
                {position.net_position_kg >= 0 ? '+' : ''}{formatWeight(position.net_position_kg)}
              </span>
            </div>
          </div>

          {position.avg_buy_price > 0 && position.avg_sell_price > 0 && (
            <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted">Prix achat moy.</div>
                <div className="font-semibold text-primary">{formatPrice(position.avg_buy_price)}/kg</div>
              </div>
              <div>
                <div className="text-sm text-muted">Prix vente moy.</div>
                <div className="font-semibold text-primary">{formatPrice(position.avg_sell_price)}/kg</div>
              </div>
              <div>
                <div className="text-sm text-muted">Marge</div>
                <div className={`font-semibold ${position.margin_percent >= 0 ? 'text-success' : 'text-danger'}`}>
                  {position.margin_percent.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {activeSupplierContracts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Factory className="w-5 h-5 text-accent" />
              Contrats fournisseurs ({activeSupplierContracts.length})
            </h2>
            <div className="space-y-3">
              {activeSupplierContracts.map((contract, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/fournisseurs/${contract.supplier_code}`)}
                  className="w-full bg-white rounded-xl border border-border p-4 text-left
                            hover:border-accent hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                    {contract.supplier_name}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    {formatDate(contract.date_start)} - {formatDate(contract.date_end)}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-success">
                      Reste: <strong>{formatWeight(contract.qty_remaining_kg)}</strong>
                      <span className="text-muted font-normal"> / {formatWeight(contract.qty_contracted_kg)}</span>
                    </span>
                    <span className="text-muted">|</span>
                    <span className="text-primary">
                      Prix: <strong>{formatPriceWithUnit(contract.price_buy, contract.price_unit)}</strong>
                    </span>
                    {contract.qty_in_transit_kg > 0 && (
                      <>
                        <span className="text-muted">|</span>
                        <span className="text-warning">
                          Transit: {formatWeight(contract.qty_in_transit_kg)}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeClientContracts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Contrats clients ({activeClientContracts.length})
            </h2>
            <div className="space-y-3">
              {activeClientContracts.map((contract, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/clients/${contract.client_code}`)}
                  className="w-full bg-white rounded-xl border border-border p-4 text-left
                            hover:border-accent hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                    {contract.client_name}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    {formatDate(contract.date_start)} - {formatDate(contract.date_end)}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-danger">
                      A livrer: <strong>{formatWeight(contract.qty_remaining_kg)}</strong>
                      <span className="text-muted font-normal"> / {formatWeight(contract.qty_contracted_kg)}</span>
                    </span>
                    <span className="text-muted">|</span>
                    <span className="text-primary">
                      Prix: <strong>{formatPrice(contract.price_sell)}/kg</strong>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSupplierContracts.length === 0 && activeClientContracts.length === 0 && (
          <div className="text-center py-12 text-muted">
            Aucun contrat actif pour ce produit
          </div>
        )}
      </main>
    </div>
  );
}
