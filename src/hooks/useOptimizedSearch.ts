import { useMemo, useState, useCallback, useTransition } from 'react';

interface SearchableItem {
  [key: string]: unknown;
}

interface UseOptimizedSearchOptions<T> {
  data: T[];
  searchKeys: (keyof T)[];
}

function buildSearchIndex<T extends SearchableItem>(
  data: T[],
  searchKeys: (keyof T)[]
): Map<T, string> {
  const index = new Map<T, string>();

  for (const item of data) {
    const searchableText = searchKeys
      .map(key => String(item[key] ?? '').toLowerCase())
      .join(' ');
    index.set(item, searchableText);
  }

  return index;
}

export function useOptimizedSearch<T extends SearchableItem>({
  data,
  searchKeys
}: UseOptimizedSearchOptions<T>) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const searchIndex = useMemo(
    () => buildSearchIndex(data, searchKeys),
    [data, searchKeys]
  );

  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    startTransition(() => {
      setDebouncedQuery(value.toLowerCase().trim());
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!debouncedQuery) return data;

    const terms = debouncedQuery.split(/\s+/).filter(Boolean);

    return data.filter(item => {
      const searchableText = searchIndex.get(item) || '';
      return terms.every(term => searchableText.includes(term));
    });
  }, [data, debouncedQuery, searchIndex]);

  return {
    query,
    setQuery: handleSearch,
    filteredData,
    isSearching: isPending,
    resultCount: filteredData.length,
    totalCount: data.length
  };
}
