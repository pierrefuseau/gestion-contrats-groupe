import { useState, useEffect, useCallback, useRef } from 'react';
import type { Article, SupplierContract, ClientContract } from '../types';
import { fetchAllData } from '../services/dataService';
import { getFromCache, saveToCache, clearCache } from '../services/dataCache';

interface SheetDataState {
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

interface SheetData extends SheetDataState {
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export function useSheetData(): SheetData {
  const [state, setState] = useState<SheetDataState>({
    articles: [],
    supplierContracts: [],
    clientContracts: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const loadingRef = useRef(false);

  const loadFromApi = useCallback(async (forceRefresh: boolean = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!forceRefresh) {
        const cached = getFromCache();
        if (cached) {
          setState({
            articles: cached.articles,
            supplierContracts: cached.supplierContracts,
            clientContracts: cached.clientContracts,
            isLoading: false,
            error: null,
            lastUpdated: new Date(cached.timestamp)
          });
          loadingRef.current = false;
          return;
        }
      }

      const data = await fetchAllData(forceRefresh);

      saveToCache({
        articles: data.articles,
        supplierContracts: data.supplierContracts,
        clientContracts: data.clientContracts
      });

      setState({
        articles: data.articles,
        supplierContracts: data.supplierContracts,
        clientContracts: data.clientContracts,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error
      }));
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadFromApi(false);
  }, [loadFromApi]);

  const forceRefresh = useCallback(async () => {
    clearCache();
    await loadFromApi(true);
  }, [loadFromApi]);

  useEffect(() => {
    loadFromApi(false);
  }, [loadFromApi]);

  return {
    ...state,
    refresh,
    forceRefresh
  };
}
