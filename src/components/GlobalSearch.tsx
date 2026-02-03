import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Factory, Users, Package, X } from 'lucide-react';
import { globalSearch, type SearchResult } from '../services/searchEngine';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 50);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchResults = globalSearch(debouncedQuery, 15);
    setResults(searchResults);
  }, [debouncedQuery]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }

      if (e.key === 'Escape') {
        clear();
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clear]);

  useEffect(() => {
    const handleKeyNav = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          navigateToResult(selected);
        }
      }
    };

    document.addEventListener('keydown', handleKeyNav);
    return () => document.removeEventListener('keydown', handleKeyNav);
  }, [isOpen, results, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToResult = (result: SearchResult) => {
    switch (result.type) {
      case 'supplier':
        navigate(`/fournisseurs/${result.code}`);
        break;
      case 'client':
        navigate(`/clients/${result.code}`);
        break;
      case 'product':
        navigate(`/produits/${result.code}`);
        break;
    }
    clear();
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'supplier': return <Factory className="w-4 h-4 text-accent" />;
      case 'client': return <Users className="w-4 h-4 text-accent" />;
      case 'product': return <Package className="w-4 h-4 text-accent" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'supplier': return 'Fournisseur';
      case 'client': return 'Client';
      case 'product': return 'Produit';
      default: return '';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un fournisseur, client ou produit..."
          className="w-full h-14 pl-12 pr-20 bg-white rounded-xl border border-border
                     text-primary placeholder-muted
                     focus:border-primary focus:ring-4 focus:ring-primary/10
                     shadow-sm transition-all"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={clear}
              className="p-1 hover:bg-surface-alt rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          )}
          {!query && (
            <kbd className="hidden sm:inline-flex items-center gap-1
                           px-2 py-1 text-xs text-muted bg-surface-alt rounded border border-border">
              Ctrl+K
            </kbd>
          )}
        </div>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl
                       shadow-xl border border-border overflow-hidden z-50 max-h-96 overflow-y-auto">

          {results.length === 0 && (
            <div className="p-6 text-center text-muted">
              Aucun resultat pour "{query}"
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => navigateToResult(result)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                             ${index === selectedIndex ? 'bg-surface-alt' : 'hover:bg-surface-alt'}`}
                >
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary truncate">
                      {result.primaryText}
                    </div>
                    <div className="text-sm text-muted truncate">
                      {result.secondaryText}
                    </div>
                  </div>
                  <span className="text-xs text-muted bg-surface-alt px-2 py-1 rounded">
                    {getTypeLabel(result.type)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-border text-xs text-muted flex justify-between">
              <span>{results.length} resultats</span>
              <span>navigation: fleches - selection: entree - fermer: esc</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
