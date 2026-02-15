import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Users, Package, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { GlobalSearch } from '../components/GlobalSearch';
import { LoadingScreen } from '../components/LoadingScreen';

export function Home() {
  const navigate = useNavigate();
  const { positions, supplierContracts, clientContracts, isLoading, isReady, lastUpdated, forceRefresh } = useData();

  const stats = useMemo(() => {
    const uniqueSuppliers = new Set(
      supplierContracts.filter(c => c.status === 'active').map(c => c.supplier_code)
    ).size;
    const uniqueClients = new Set(
      clientContracts.filter(c => c.status === 'active').map(c => c.client_code)
    ).size;
    const totalProducts = positions.length;
    return { uniqueSuppliers, uniqueClients, totalProducts };
  }, [positions, supplierContracts, clientContracts]);

  if (isLoading && !isReady) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        <img
          src="/logo_fuseau_hd.png"
          alt="Groupe FUSEAU"
          className="h-20 object-contain mb-6"
        />

        <h1 className="text-2xl font-bold text-primary mb-2 text-center">
          Gestion Contrats
        </h1>

        <div className="w-full max-w-xl mb-12">
          <GlobalSearch />
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <button
            onClick={() => navigate('/fournisseurs')}
            className="group w-52 h-44 bg-white rounded-xl border border-border
                      shadow hover:shadow-md hover:-translate-y-1
                      transition-all duration-200 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-14 h-14 rounded-lg bg-success flex items-center justify-center
                          group-hover:scale-105 transition-transform">
              <Factory className="w-7 h-7 text-white" />
            </div>
            <span className="text-lg font-semibold text-primary">Fournisseurs</span>
            <span className="text-sm text-muted">{stats.uniqueSuppliers} actifs</span>
          </button>

          <button
            onClick={() => navigate('/clients')}
            className="group w-52 h-44 bg-white rounded-xl border border-border
                      shadow hover:shadow-md hover:-translate-y-1
                      transition-all duration-200 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-14 h-14 rounded-lg bg-info flex items-center justify-center
                          group-hover:scale-105 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <span className="text-lg font-semibold text-primary">Clients</span>
            <span className="text-sm text-muted">{stats.uniqueClients} actifs</span>
          </button>

          <button
            onClick={() => navigate('/produits')}
            className="group w-52 h-44 bg-white rounded-xl border border-border
                      shadow hover:shadow-md hover:-translate-y-1
                      transition-all duration-200 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center
                          group-hover:scale-105 transition-transform">
              <Package className="w-7 h-7 text-white" />
            </div>
            <span className="text-lg font-semibold text-primary">Produits</span>
            <span className="text-sm text-muted">{stats.totalProducts} references</span>
          </button>
        </div>

        <button
          onClick={forceRefresh}
          disabled={isLoading}
          className="mt-8 flex items-center gap-2 px-4 py-2 text-sm text-muted
                    hover:text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Synchronisation...' : 'Synchroniser les donnees'}
        </button>

        {lastUpdated && (
          <p className="mt-2 text-xs text-text-light">
            Derniere sync: {lastUpdated.toLocaleTimeString('fr-FR')}
          </p>
        )}
      </main>

      <footer className="py-6 text-center text-sm text-text-light">
        2026 Groupe FUSEAU - Tous droits reserves
      </footer>
    </div>
  );
}
