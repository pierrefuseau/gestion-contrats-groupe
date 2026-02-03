import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { Article, Partner, SupplierContract } from '../types';

export interface SearchResult {
  type: 'product' | 'partner' | 'contract';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export function useSearch(
  articles: Article[],
  partners: Partner[],
  supplierContracts: SupplierContract[]
) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const productFuse = useMemo(() => new Fuse(articles, {
    keys: [
      { name: 'name', weight: 1.0 },
      { name: 'sku', weight: 0.8 },
      { name: 'category', weight: 0.5 }
    ],
    threshold: 0.4,
    includeScore: true
  }), [articles]);

  const partnerFuse = useMemo(() => new Fuse(partners, {
    keys: [
      { name: 'name', weight: 1.0 },
      { name: 'code', weight: 0.8 }
    ],
    threshold: 0.4,
    includeScore: true
  }), [partners]);

  const contractFuse = useMemo(() => new Fuse(supplierContracts, {
    keys: [
      { name: 'supplier_sku', weight: 0.6 },
      { name: 'supplier_name', weight: 0.8 }
    ],
    threshold: 0.4,
    includeScore: true
  }), [supplierContracts]);

  const results = useMemo((): SearchResult[] => {
    if (query.length < 2) return [];

    const productResults = productFuse.search(query).slice(0, 4).map(result => ({
      type: 'product' as const,
      id: result.item.sku,
      title: result.item.name,
      subtitle: result.item.sku,
      link: `/product/${encodeURIComponent(result.item.sku)}`
    }));

    const partnerResults = partnerFuse.search(query).slice(0, 3).map(result => ({
      type: 'partner' as const,
      id: result.item.id,
      title: result.item.name,
      subtitle: `${result.item.type === 'supplier' ? 'Fournisseur' : result.item.type === 'client' ? 'Client' : 'Les deux'} - ${result.item.code}`,
      link: `/partner/${result.item.id}`
    }));

    const contractResults = contractFuse.search(query).slice(0, 3).map(result => ({
      type: 'contract' as const,
      id: result.item.id,
      title: `${result.item.supplier_name}`,
      subtitle: `Contrat: ${result.item.supplier_sku}`,
      link: `/product/${encodeURIComponent(result.item.sku)}`
    }));

    return [...productResults, ...partnerResults, ...contractResults];
  }, [query, productFuse, partnerFuse, contractFuse]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    clearSearch
  };
}

export function useArticleSearch() {
  return useCallback((items: Article[], query: string) => {
    if (query.length < 2) return items.slice(0, 10);

    const fuse = new Fuse(items, {
      keys: [
        { name: 'name', weight: 1.0 },
        { name: 'sku', weight: 0.8 },
        { name: 'category', weight: 0.5 }
      ],
      threshold: 0.4
    });

    return fuse.search(query).slice(0, 10).map(r => r.item);
  }, []);
}

export function usePartnerSearch(type?: 'supplier' | 'client') {
  return useCallback(
    (items: Partner[], query: string) => {
      const filtered = type ? items.filter(p => p.type === type || p.type === 'both') : items;

      if (query.length < 2) return filtered.slice(0, 10);

      const fuse = new Fuse(filtered, {
        keys: ['name', 'code'],
        threshold: 0.4
      });

      return fuse.search(query).slice(0, 10).map(r => r.item);
    },
    [type]
  );
}
