import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Factory, FileText, Scale, Euro, Package, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatPriceWithUnit, calculateTotalValue } from '../utils/formatters';

export function SupplierDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { supplierContracts } = useData();

  const contracts = useMemo(() => {
    return supplierContracts
      .filter(c => c.supplier_code === code)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        const dateA = a.date_start ? new Date(a.date_start).getTime() : 0;
        const dateB = b.date_start ? new Date(b.date_start).getTime() : 0;
        return dateB - dateA;
      });
  }, [supplierContracts, code]);

  const activeContracts = contracts.filter(c => c.status === 'active');
  const completedContracts = contracts.filter(c => c.status === 'completed');
  const supplierName = contracts[0]?.supplier_name || 'Fournisseur';

  const stats = useMemo(() => ({
    contractsCount: activeContracts.length,
    totalKg: activeContracts.reduce((sum, c) => sum + c.qty_remaining_kg, 0),
    totalValue: activeContracts.reduce((sum, c) => sum + calculateTotalValue(
      c.price_buy,
      c.price_unit,
      c.qty_remaining_kg,
      c.qty_remaining_uvc
    ), 0)
  }), [activeContracts]);

  const formatWeight = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)} T`;
    return `${Math.round(kg)} kg`;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (contracts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-border px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/fournisseurs')}
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Fournisseurs</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-accent" />
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-primary mb-2">Fournisseur introuvable</h1>
          <p className="text-muted">Aucun fournisseur avec le code "{code}"</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/fournisseurs')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Fournisseurs</span>
          </button>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-accent" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Factory className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">{supplierName}</h1>
              <p className="text-muted">Code: {code}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <FileText className="w-5 h-5 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{stats.contractsCount}</div>
            <div className="text-sm text-muted">Contrats actifs</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <Scale className="w-5 h-5 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{formatWeight(stats.totalKg)}</div>
            <div className="text-sm text-muted">Engagees</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <Euro className="w-5 h-5 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{formatPrice(stats.totalValue)}</div>
            <div className="text-sm text-muted">Valeur</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-primary mb-4">Contrats actifs</h2>
          <div className="space-y-3">
            {activeContracts.map((contract, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/produits/${contract.sku}`)}
                className="w-full bg-white rounded-xl border border-border p-4 text-left
                          hover:border-accent hover:shadow-md transition-all group"
              >
                <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                  {contract.article_name}
                </h3>
                <p className="text-sm text-muted mt-1">
                  SKU: {contract.sku} | {formatDate(contract.date_start)} - {formatDate(contract.date_end)}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-primary">
                    Reste: <strong>{formatWeight(contract.qty_remaining_kg)}</strong>
                  </span>
                  <span className="text-muted">|</span>
                  <span className="text-primary">
                    Prix: <strong>{formatPriceWithUnit(contract.price_buy, contract.price_unit)}</strong>
                  </span>
                  {contract.qty_in_transit_kg > 0 && (
                    <>
                      <span className="text-muted">|</span>
                      <span className="text-warning">
                        En transit: {formatWeight(contract.qty_in_transit_kg)}
                      </span>
                    </>
                  )}
                </div>
              </button>
            ))}

            {activeContracts.length === 0 && (
              <div className="text-center py-8 text-muted">
                Aucun contrat actif
              </div>
            )}
          </div>
        </div>

        {completedContracts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">Contrats termines</h2>
            <div className="space-y-3">
              {completedContracts.slice(0, 5).map((contract, idx) => (
                <div
                  key={idx}
                  className="bg-surface-alt rounded-xl border border-border p-4 opacity-60"
                >
                  <h3 className="font-semibold text-primary">{contract.article_name}</h3>
                  <p className="text-sm text-muted mt-1">
                    {formatDate(contract.date_start)} - {formatDate(contract.date_end)} | {formatWeight(contract.qty_contracted_kg)} contractees
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
