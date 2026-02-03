import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import type { Article, Partner, SupplierContract } from '../types';

export interface SearchResult {
  type: 'product' | 'partner' | 'contract';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

const FUSE_OPTIONS = {
  threshold: 0.4,
  includeScore: true
};

export function useSearch(
  articles: Article[],
  partners: Partner[],
  supplierContracts: SupplierContract[]
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const productFuseRef = useRef<Fuse<Article> | null>(null);
  const partnerFuseRef = useRef<Fuse<Partner> | null>(null);
  const contractFuseRef = useRef<Fuse<SupplierContract> | null>(null);
  const lastDataLengthRef = useRef({ articles: 0, partners: 0, contracts: 0 });

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const productFuse = useMemo(() => {
    if (
      productFuseRef.current &&
      lastDataLengthRef.current.articles === articles.length
    ) {
      return productFuseRef.current;
    }
    lastDataLengthRef.current.articles = articles.length;
    productFuseRef.current = new Fuse(articles, {
      ...FUSE_OPTIONS,
      keys: [
        { name: 'name', weight: 1.0 },
        { name: 'sku', weight: 0.8 }
      ]
    });
    return productFuseRef.current;
  }, [articles]);

  const partnerFuse = useMemo(() => {
    if (
      partnerFuseRef.current &&
      lastDataLengthRef.current.partners === partners.length
    ) {
      return partnerFuseRef.current;
    }
    lastDataLengthRef.current.partners = partners.length;
    partnerFuseRef.current = new Fuse(partners, {
      ...FUSE_OPTIONS,
      keys: [
        { name: 'name', weight: 1.0 },
        { name: 'code', weight: 0.8 }
      ]
    });
    return partnerFuseRef.current;
  }, [partners]);

  const contractFuse = useMemo(() => {
    if (
      contractFuseRef.current &&
      lastDataLengthRef.current.contracts === supplierContracts.length
    ) {
      return contractFuseRef.current;
    }
    lastDataLengthRef.current.contracts = supplierContracts.length;
    contractFuseRef.current = new Fuse(supplierContracts, {
      ...FUSE_OPTIONS,
      keys: [
        { name: 'supplier_sku', weight: 0.6 },
        { name: 'supplier_name', weight: 0.8 }
      ]
    });
    return contractFuseRef.current;
  }, [supplierContracts]);

  const results = useMemo((): SearchResult[] => {
    if (debouncedQuery.length < 2) return [];

    const productResults = productFuse.search(debouncedQuery).slice(0, 4).map(result => ({
      type: 'product' as const,
      id: result.item.sku,
      title: result.item.name,
      subtitle: result.item.sku,
      link: `/produits/${encodeURIComponent(result.item.sku)}`
    }));

    const partnerResults = partnerFuse.search(debouncedQuery).slice(0, 3).map(result => ({
      type: 'partner' as const,
      id: result.item.code,
      title: result.item.name,
      subtitle: `${result.item.type === 'supplier' ? 'Fournisseur' : 'Client'} - ${result.item.code}`,
      link: `/partenaires/${result.item.type === 'supplier' ? 'fournisseur' : 'client'}/${result.item.code}`
    }));

    const contractResults = contractFuse.search(debouncedQuery).slice(0, 3).map(result => ({
      type: 'contract' as const,
      id: `${result.item.supplier_code}-${result.item.sku}`,
      title: result.item.supplier_name,
      subtitle: `Contrat: ${result.item.supplier_sku || result.item.sku}`,
      link: `/produits/${encodeURIComponent(result.item.sku)}`
    }));

    return [...productResults, ...partnerResults, ...contractResults];
  }, [debouncedQuery, productFuse, partnerFuse, contractFuse]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
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
        { name: 'sku', weight: 0.8 }
      ],
      threshold: 0.4
    });

    return fuse.search(query).slice(0, 10).map(r => r.item);
  }, []);
}

export function usePartnerSearch(type?: 'supplier' | 'client') {
  return useCallback(
    (items: Partner[], query: string) => {
      const filtered = type ? items.filter(p => p.type === type) : items;

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
