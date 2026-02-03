import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Search, X, Check } from 'lucide-react';

interface SearchComboboxProps<T> {
  label?: string;
  placeholder?: string;
  items: T[];
  value: T | null;
  onChange: (item: T | null) => void;
  getItemLabel: (item: T) => string;
  getItemValue: (item: T) => string;
  getItemSubLabel?: (item: T) => string;
  filterItems: (items: T[], query: string) => T[];
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchCombobox<T>({
  label,
  placeholder = 'Rechercher...',
  items,
  value,
  onChange,
  getItemLabel,
  getItemValue,
  getItemSubLabel,
  filterItems,
  error,
  disabled,
  className
}: SearchComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredItems = query.length >= 2 ? filterItems(items, query) : items.slice(0, 10);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          onChange(filteredItems[highlightedIndex]);
          setQuery('');
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (item: T) => {
    onChange(item);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>

        {value ? (
          <div
            className={clsx(
              'flex items-center justify-between w-full rounded-lg border px-3 py-2 pl-10',
              error ? 'border-rose-300' : 'border-slate-300',
              disabled ? 'bg-slate-50' : 'bg-white'
            )}
          >
            <div className="min-w-0">
              <span className="block text-sm font-medium text-slate-900 truncate">
                {getItemLabel(value)}
              </span>
              {getItemSubLabel && (
                <span className="block text-xs text-slate-500 truncate">
                  {getItemSubLabel(value)}
                </span>
              )}
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-lg border px-3 py-2 pl-10 text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500',
              'disabled:bg-slate-50 disabled:text-slate-500'
            )}
          />
        )}
      </div>

      {isOpen && !value && filteredItems.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredItems.map((item, index) => (
            <li
              key={getItemValue(item)}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={clsx(
                'px-3 py-2 cursor-pointer',
                index === highlightedIndex
                  ? 'bg-slate-100'
                  : 'hover:bg-slate-50'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900 truncate">
                    {getItemLabel(item)}
                  </span>
                  {getItemSubLabel && (
                    <span className="block text-xs text-slate-500 truncate">
                      {getItemSubLabel(item)}
                    </span>
                  )}
                </div>
                {value && getItemValue(value) === getItemValue(item) && (
                  <Check className="w-4 h-4 text-slate-900" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !value && query.length >= 2 && filteredItems.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm text-slate-500">
          Aucun résultat
        </div>
      )}

      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
