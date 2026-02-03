import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Factory, Users, Package } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export function Home() {
  const navigate = useNavigate();
  const { articles, supplierContracts, clientContracts, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const stats = useMemo(() => {
    const uniqueSuppliers = new Set(
      supplierContracts.filter(c => c.status === 'active').map(c => c.supplier_code)
    ).size;
    const uniqueClients = new Set(
      clientContracts.filter(c => c.status === 'active').map(c => c.client_code)
    ).size;
    const totalProducts = articles.length;
    return { uniqueSuppliers, uniqueClients, totalProducts };
  }, [articles, supplierContracts, clientContracts]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;

    const q = searchQuery.toLowerCase();

    const suppliers = [...new Map(
      supplierContracts
        .filter(c => c.supplier_name.toLowerCase().includes(q) || c.supplier_code.toLowerCase().includes(q))
        .map(c => [c.supplier_code, { code: c.supplier_code, name: c.supplier_name }])
    ).values()].slice(0, 5);

    const clients = [...new Map(
      clientContracts
        .filter(c => c.client_name.toLowerCase().includes(q) || c.client_code.toLowerCase().includes(q))
        .map(c => [c.client_code, { code: c.client_code, name: c.client_name }])
    ).values()].slice(0, 5);

    const products = articles
      .filter(a => a.name.toLowerCase().includes(q) || a.sku.toLowerCase().includes(q))
      .slice(0, 5);

    return { suppliers, clients, products };
  }, [searchQuery, supplierContracts, clientContracts, articles]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>('input[type="text"]');
      input?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Chargement des donnees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        <img
          src="/logo_fuseau_hd.png"
          alt="Groupe FUSEAU"
          className="h-20 object-contain mb-6"
        />

        <h1 className="text-3xl font-bold text-primary mb-2 text-center">
          Gestion Contrats
        </h1>

        <div className="w-full max-w-xl relative mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Rechercher un fournisseur, client ou produit..."
              className="w-full h-14 pl-12 pr-20 bg-white rounded-xl border border-border
                         text-primary placeholder-muted
                         focus:border-primary focus:ring-4 focus:ring-primary/10
                         shadow-sm transition-all"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2
                           hidden sm:inline-flex items-center gap-1
                           px-2 py-1 text-xs text-muted bg-surface-alt rounded border border-border">
              Ctrl+K
            </kbd>
          </div>

          {showResults && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl
                           shadow-xl border border-border overflow-hidden z-50 max-h-96 overflow-y-auto">

              {searchResults.suppliers.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide">
                    Fournisseurs
                  </div>
                  {searchResults.suppliers.map(s => (
                    <button
                      key={s.code}
                      onClick={() => {
                        navigate(`/fournisseurs/${s.code}`);
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-lg
                                hover:bg-surface-alt transition-colors text-left"
                    >
                      <Factory className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium text-primary">{s.name}</div>
                        <div className="text-sm text-muted">{s.code}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.clients.length > 0 && (
                <div className="p-2 border-t border-border">
                  <div className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide">
                    Clients
                  </div>
                  {searchResults.clients.map(c => (
                    <button
                      key={c.code}
                      onClick={() => {
                        navigate(`/clients/${c.code}`);
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-lg
                                hover:bg-surface-alt transition-colors text-left"
                    >
                      <Users className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium text-primary">{c.name}</div>
                        <div className="text-sm text-muted">{c.code}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.products.length > 0 && (
                <div className="p-2 border-t border-border">
                  <div className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide">
                    Produits
                  </div>
                  {searchResults.products.map(p => (
                    <button
                      key={p.sku}
                      onClick={() => {
                        navigate(`/produits/${p.sku}`);
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-lg
                                hover:bg-surface-alt transition-colors text-left"
                    >
                      <Package className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium text-primary">{p.name}</div>
                        <div className="text-sm text-muted">{p.sku}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.suppliers.length === 0 &&
               searchResults.clients.length === 0 &&
               searchResults.products.length === 0 && (
                <div className="p-6 text-center text-muted">
                  Aucun resultat pour "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <button
            onClick={() => navigate('/fournisseurs')}
            className="group w-52 h-44 bg-white rounded-2xl border border-border
                      shadow-sm hover:shadow-lg hover:-translate-y-1
                      transition-all duration-200 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center
                          group-hover:bg-accent/10 transition-colors">
              <Factory className="w-8 h-8 text-accent" />
            </div>
            <span className="text-lg font-semibold text-primary">Fournisseurs</span>
            <span className="text-sm text-muted">{stats.uniqueSuppliers} actifs</span>
          </button>

          <button
            onClick={() => navigate('/clients')}
            className="group w-52 h-44 bg-white rounded-2xl border border-border
                      shadow-sm hover:shadow-lg hover:-translate-y-1
                      transition-all duration-200 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center
                          group-hover:bg-accent/10 transition-colors">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <span className="text-lg font-semibold text-primary">Clients</span>
            <span className="text-sm text-muted">{stats.uniqueClients} actifs</span>
          </button>

          <button
            onClick={() => navigate('/produits')}
            className="group w-52 h-44 bg-white rounded-2xl border border-border
                      shadow-sm hover:shadow-lg hover:-translate-y-1
                      transition-all duration-200 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center
                          group-hover:bg-accent/10 transition-colors">
              <Package className="w-8 h-8 text-accent" />
            </div>
            <span className="text-lg font-semibold text-primary">Produits</span>
            <span className="text-sm text-muted">{stats.totalProducts} references</span>
          </button>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted">
        2026 Groupe FUSEAU - Tous droits reserves
      </footer>

      {showResults && searchQuery && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
