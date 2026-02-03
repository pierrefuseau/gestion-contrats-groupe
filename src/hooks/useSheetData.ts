import { useState, useEffect, useCallback } from 'react';
import type { Article, SupplierContract, ClientContract } from '../types';
import { fetchAllData } from '../services/googleSheetsApi';
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

  const loadFromApi = useCallback(async (skipCache: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!skipCache) {
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
          return;
        }
      }

      const data = await fetchAllData();

      saveToCache(data);

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
