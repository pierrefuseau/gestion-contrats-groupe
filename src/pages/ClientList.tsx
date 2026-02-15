import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { PageHeader } from '../components/PageHeader';

export function ClientList() {
  const navigate = useNavigate();
  const { clientContracts } = useData();
  const [search, setSearch] = useState('');

  const clients = useMemo(() => {
    const map = new Map<string, {
      code: string;
      name: string;
      contractsCount: number;
      totalKg: number;
    }>();

    clientContracts
      .filter(c => c.status === 'active')
      .forEach(c => {
        const existing = map.get(c.client_code);
        if (existing) {
          existing.contractsCount++;
          existing.totalKg += c.qty_remaining_kg;
        } else {
          map.set(c.client_code, {
            code: c.client_code,
            name: c.client_name,
            contractsCount: 1,
            totalKg: c.qty_remaining_kg
          });
        }
      });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [clientContracts]);

  const filtered = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [clients, search]);

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
            <Users className="w-7 h-7 text-accent" />
            Clients
          </h1>
          <p className="text-muted mt-1">{clients.length} clients actifs</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full h-10 pl-12 pr-4 bg-white rounded-lg border border-border
                      text-primary placeholder-text-light text-sm
                      focus:border-accent focus:ring-4 focus:ring-accent/10
                      transition-all duration-150"
          />
        </div>

        <div className="space-y-3">
          {filtered.map(client => (
            <button
              key={client.code}
              onClick={() => navigate(`/clients/${client.code}`)}
              className="w-full bg-white rounded-xl border border-border p-4
                        hover:shadow-md hover:-translate-y-px
                        transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                    {client.name}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Code: {client.code} | {client.contractsCount} contrat{client.contractsCount > 1 ? 's' : ''} actif{client.contractsCount > 1 ? 's' : ''} | {formatWeight(client.totalKg)} engagees
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              Aucun client trouve
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
