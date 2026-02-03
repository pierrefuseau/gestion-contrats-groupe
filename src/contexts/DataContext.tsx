import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Article, SupplierContract, ClientContract, Partner, PositionSummary } from '../types';
import { initializeData, syncFromGoogleSheets, loadAllData } from '../services/syncService';
import { buildSearchIndexesFromData } from '../services/searchEngine';
import { calculateAllPositions, getPartners } from '../utils/calculations';
import { buildContractIndexes, buildArticleIndex, buildPositionIndex, buildPartnerIndex } from '../services/dataIndex';
import { getLastSyncTime } from '../services/supabaseDataService';

interface DataContextType {
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
  partners: Partner[];
  positions: PositionSummary[];
  criticalPositions: PositionSummary[];
  shortPositions: PositionSummary[];
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  getArticleBySku: (sku: string) => Article | undefined;
  getSupplierContractsBySku: (sku: string) => SupplierContract[];
  getClientContractsBySku: (sku: string) => ClientContract[];
  getPartnerByCode: (code: string) => Partner | undefined;
  getPositionBySku: (sku: string) => PositionSummary | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [supplierContracts, setSupplierContracts] = useState<SupplierContract[]>([]);
  const [clientContracts, setClientContracts] = useState<ClientContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (force: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (force) {
        const result = await syncFromGoogleSheets(true);
        if (!result.success) {
          throw new Error(result.message);
        }
        const data = await loadAllData();
        setArticles(data.articles);
        setSupplierContracts(data.supplierContracts);
        setClientContracts(data.clientContracts);
        buildSearchIndexesFromData(data.articles, data.supplierContracts, data.clientContracts);
      } else {
        const data = await initializeData();
        setArticles(data.articles);
        setSupplierContracts(data.supplierContracts);
        setClientContracts(data.clientContracts);
        buildSearchIndexesFromData(data.articles, data.supplierContracts, data.clientContracts);
      }

      const syncTime = await getLastSyncTime();
      setLastUpdated(syncTime);
      setIsReady(true);
    } catch (err) {
      const loadError = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(loadError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await syncFromGoogleSheets();
        if (result.success && result.source === 'google_sheets') {
          const data = await loadAllData();
          setArticles(data.articles);
          setSupplierContracts(data.supplierContracts);
          setClientContracts(data.clientContracts);
          buildSearchIndexesFromData(data.articles, data.supplierContracts, data.clientContracts);
          const syncTime = await getLastSyncTime();
          setLastUpdated(syncTime);
        }
      } catch (err) {
        console.error('Erreur sync background:', err);
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refresh = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  const forceRefresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const partners = useMemo(
    () => getPartners(supplierContracts, clientContracts),
    [supplierContracts, clientContracts]
  );

  const positions = useMemo(
    () => calculateAllPositions(articles, supplierContracts, clientContracts),
    [articles, supplierContracts, clientContracts]
  );

  const contractIndexes = useMemo(
    () => buildContractIndexes(supplierContracts, clientContracts),
    [supplierContracts, clientContracts]
  );

  const articleIndex = useMemo(
    () => buildArticleIndex(articles),
    [articles]
  );

  const positionIndex = useMemo(
    () => buildPositionIndex(positions),
    [positions]
  );

  const partnerIndex = useMemo(
    () => buildPartnerIndex(partners),
    [partners]
  );

  const criticalPositions = useMemo(
    () => positions.filter(p => p.status === 'CRITICAL').sort((a, b) => a.net_position_kg - b.net_position_kg),
    [positions]
  );

  const shortPositions = useMemo(
    () => positions.filter(p => p.status === 'SHORT' || p.status === 'CRITICAL').sort((a, b) => a.net_position_kg - b.net_position_kg),
    [positions]
  );

  const getArticleBySku = useCallback(
    (sku: string) => articleIndex.get(sku.toLowerCase()),
    [articleIndex]
  );

  const getSupplierContractsBySku = useCallback(
    (sku: string) => contractIndexes.supplierContractsBySku.get(sku.toLowerCase()) || [],
    [contractIndexes]
  );

  const getClientContractsBySku = useCallback(
    (sku: string) => contractIndexes.clientContractsBySku.get(sku.toLowerCase()) || [],
    [contractIndexes]
  );

  const getPartnerByCode = useCallback(
    (code: string) => partnerIndex.get(code),
    [partnerIndex]
  );

  const getPositionBySku = useCallback(
    (sku: string) => positionIndex.get(sku.toLowerCase()),
    [positionIndex]
  );

  return (
    <DataContext.Provider value={{
      articles,
      supplierContracts,
      clientContracts,
      partners,
      positions,
      criticalPositions,
      shortPositions,
      isLoading,
      isReady,
      error,
      lastUpdated,
      refresh,
      forceRefresh,
      getArticleBySku,
      getSupplierContractsBySku,
      getClientContractsBySku,
      getPartnerByCode,
      getPositionBySku
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
