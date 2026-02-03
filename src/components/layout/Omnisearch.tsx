import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Users, FileText, X } from 'lucide-react';
import { useSearch, type SearchResult } from '../../hooks/useSearch';
import { useData } from '../../contexts/DataContext';

export function Omnisearch() {
  const navigate = useNavigate();
  const { articles, partners, supplierContracts } = useData();
  const { query, setQuery, results, isOpen, setIsOpen, clearSearch } = useSearch(
    articles,
    partners,
    supplierContracts
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsOpen]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.link);
    clearSearch();
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'partner':
        return <Users className="w-4 h-4" />;
      case 'contract':
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return 'Produit';
      case 'partner':
        return 'Partenaire';
      case 'contract':
        return 'Contrat';
    }
  };

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) acc[result.type] = [];
      acc[result.type].push(result);
      return acc;
    },
    {} as Record<SearchResult['type'], SearchResult[]>
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un produit, partenaire, contrat..."
          className="w-full h-10 pl-10 pr-20 bg-slate-100 border-0 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs text-slate-400 bg-slate-200 rounded">
          Ctrl K
        </kbd>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {Object.entries(groupedResults).map(([type, items]) => (
            <div key={type}>
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  {getTypeLabel(type as SearchResult['type'])}
                </span>
              </div>
              <ul>
                {items.map(result => (
                  <li key={result.id}>
                    <button
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
                        {getIcon(result.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-sm text-slate-500">
          Aucun resultat pour "{query}"
        </div>
      )}
    </div>
  );
}
