import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, ChevronRight, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export function ProductListNew() {
  const navigate = useNavigate();
  const { positions } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'short' | 'long'>('all');

  const filtered = useMemo(() => {
    let result = positions;

    if (filter === 'critical') {
      result = result.filter(p => p.status === 'CRITICAL');
    } else if (filter === 'short') {
      result = result.filter(p => p.status === 'SHORT' || p.status === 'CRITICAL');
    } else if (filter === 'long') {
      result = result.filter(p => p.status === 'LONG');
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.article_name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => a.net_position_kg - b.net_position_kg);
  }, [positions, search, filter]);

  const stats = useMemo(() => ({
    total: positions.length,
    critical: positions.filter(p => p.status === 'CRITICAL').length,
    short: positions.filter(p => p.status === 'SHORT').length,
    long: positions.filter(p => p.status === 'LONG').length
  }), [positions]);

  const formatWeight = (kg: number) => {
    if (Math.abs(kg) >= 1000) return `${(kg / 1000).toFixed(1)} T`;
    return `${Math.round(kg)} kg`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-danger bg-danger/10';
      case 'SHORT': return 'text-warning bg-warning/10';
      case 'LONG': return 'text-success bg-success/10';
      default: return 'text-muted bg-muted/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRITICAL': return <AlertTriangle className="w-4 h-4" />;
      case 'SHORT': return <TrendingDown className="w-4 h-4" />;
      case 'LONG': return <TrendingUp className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-accent" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Package className="w-7 h-7 text-accent" />
            Produits
          </h1>
          <p className="text-muted mt-1">{stats.total} references</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === 'all'
                ? 'bg-primary text-white border-primary'
                : 'bg-white border-border hover:border-primary'
            }`}
          >
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs opacity-80">Tous</div>
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === 'critical'
                ? 'bg-danger text-white border-danger'
                : 'bg-white border-border hover:border-danger'
            }`}
          >
            <div className="text-lg font-bold">{stats.critical}</div>
            <div className="text-xs opacity-80">Critiques</div>
          </button>
          <button
            onClick={() => setFilter('short')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === 'short'
                ? 'bg-warning text-white border-warning'
                : 'bg-white border-border hover:border-warning'
            }`}
          >
            <div className="text-lg font-bold">{stats.short}</div>
            <div className="text-xs opacity-80">Courts</div>
          </button>
          <button
            onClick={() => setFilter('long')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === 'long'
                ? 'bg-success text-white border-success'
                : 'bg-white border-border hover:border-success'
            }`}
          >
            <div className="text-lg font-bold">{stats.long}</div>
            <div className="text-xs opacity-80">Longs</div>
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full h-12 pl-12 pr-4 bg-white rounded-xl border border-border
                      text-primary placeholder-muted
                      focus:border-primary focus:ring-4 focus:ring-primary/10
                      transition-all"
          />
        </div>

        <div className="space-y-3">
          {filtered.map(position => (
            <button
              key={position.sku}
              onClick={() => navigate(`/produits/${position.sku}`)}
              className="w-full bg-white rounded-xl border border-border p-4
                        hover:border-accent hover:shadow-md
                        transition-all text-left group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-primary group-hover:text-accent transition-colors truncate">
                      {position.article_name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(position.status)}`}>
                      {getStatusIcon(position.status)}
                      {position.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted">SKU: {position.sku}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-primary">
                      Stock: <strong>{formatWeight(position.stock_kg)}</strong>
                    </span>
                    <span className="text-muted">|</span>
                    <span className={position.net_position_kg >= 0 ? 'text-success' : 'text-danger'}>
                      Position: <strong>{position.net_position_kg >= 0 ? '+' : ''}{formatWeight(position.net_position_kg)}</strong>
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              Aucun produit trouve
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
