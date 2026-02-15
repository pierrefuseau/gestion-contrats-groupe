import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Factory, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { PageHeader } from '../components/PageHeader';

export function SupplierList() {
  const navigate = useNavigate();
  const { supplierContracts } = useData();
  const [search, setSearch] = useState('');

  const suppliers = useMemo(() => {
    const map = new Map<string, {
      code: string;
      name: string;
      contractsCount: number;
      totalKg: number;
    }>();

    supplierContracts
      .filter(c => c.status === 'active')
      .forEach(c => {
        const existing = map.get(c.supplier_code);
        if (existing) {
          existing.contractsCount++;
          existing.totalKg += c.qty_remaining_kg;
        } else {
          map.set(c.supplier_code, {
            code: c.supplier_code,
            name: c.supplier_name,
            contractsCount: 1,
            totalKg: c.qty_remaining_kg
          });
        }
      });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [supplierContracts]);

  const filtered = useMemo(() => {
    if (!search) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  const formatWeight = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)} T`;
    return `${Math.round(kg)} kg`;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Factory className="w-7 h-7 text-accent" />
            Fournisseurs
          </h1>
          <p className="text-muted mt-1">{suppliers.length} fournisseurs actifs</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un fournisseur..."
            className="w-full h-10 pl-12 pr-4 bg-white rounded-lg border border-border
                      text-primary placeholder-text-light text-sm
                      focus:border-accent focus:ring-4 focus:ring-accent/10
                      transition-all duration-150"
          />
        </div>

        <div className="space-y-3">
          {filtered.map(supplier => (
            <button
              key={supplier.code}
              onClick={() => navigate(`/fournisseurs/${supplier.code}`)}
              className="w-full bg-white rounded-xl border border-border p-4
                        hover:shadow-md hover:-translate-y-px
                        transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                    {supplier.name}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Code: {supplier.code} | {supplier.contractsCount} contrat{supplier.contractsCount > 1 ? 's' : ''} actif{supplier.contractsCount > 1 ? 's' : ''} | {formatWeight(supplier.totalKg)} engagees
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              Aucun fournisseur trouve
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
