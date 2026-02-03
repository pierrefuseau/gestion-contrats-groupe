import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Article, SupplierContract, ClientContract, Partner, PositionSummary } from '../types';
import { loadStaticData, getLoadedData, clearCache } from '../data/staticDataLoader';
import { buildSearchIndexesFromData } from '../services/searchEngine';

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
  getSupplierContractsByCode: (code: string) => SupplierContract[];
  getClientContractsByCode: (code: string) => ClientContract[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [supplierContracts, setSupplierContracts] = useState<SupplierContract[]>([]);
  const [clientContracts, setClientContracts] = useState<ClientContract[]>([]);
  const [suppliers, setSuppliers] = useState<Partner[]>([]);
  const [clients, setClients] = useState<Partner[]>([]);
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (force: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (force) {
        clearCache();
      }

      const data = await loadStaticData();

      setArticles(data.articles);
      setSupplierContracts(data.supplierContracts);
      setClientContracts(data.clientContracts);
      setSuppliers(data.suppliers);
      setClients(data.clients);
      setPositions(data.positions);

      buildSearchIndexesFromData(data.articles, data.supplierContracts, data.clientContracts);

      if (data.metadata?.generatedAt) {
        setLastUpdated(new Date(data.metadata.generatedAt));
      } else {
        setLastUpdated(new Date());
      }

      setIsReady(true);
    } catch (err) {
      const loadError = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(loadError);
      console.error('Erreur chargement:', loadError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  const forceRefresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const partners = useMemo(() => [...suppliers, ...clients], [suppliers, clients]);

  const criticalPositions = useMemo(
    () => positions.filter(p => p.status === 'CRITICAL').sort((a, b) => a.net_position_kg - b.net_position_kg),
    [positions]
  );

  const shortPositions = useMemo(
    () => positions.filter(p => p.status === 'SHORT' || p.status === 'CRITICAL').sort((a, b) => a.net_position_kg - b.net_position_kg),
    [positions]
  );

  const getArticleBySku = useCallback(
    (sku: string) => {
      const data = getLoadedData();
      return data?.indexes.articlesBySku.get(sku.toLowerCase());
    },
    []
  );

  const getSupplierContractsBySku = useCallback(
    (sku: string) => {
      const data = getLoadedData();
      return data?.indexes.supplierContractsBySku.get(sku.toLowerCase()) || [];
    },
    []
  );

  const getClientContractsBySku = useCallback(
    (sku: string) => {
      const data = getLoadedData();
      return data?.indexes.clientContractsBySku.get(sku.toLowerCase()) || [];
    },
    []
  );

  const getPartnerByCode = useCallback(
    (code: string) => {
      const data = getLoadedData();
      return data?.indexes.partnersByCode.get(code);
    },
    []
  );

  const getPositionBySku = useCallback(
    (sku: string) => {
      const data = getLoadedData();
      return data?.indexes.positionsBySku.get(sku.toLowerCase());
    },
    []
  );

  const getSupplierContractsByCode = useCallback(
    (code: string) => {
      const data = getLoadedData();
      return data?.indexes.supplierContractsByCode.get(code) || [];
    },
    []
  );

  const getClientContractsByCode = useCallback(
    (code: string) => {
      const data = getLoadedData();
      return data?.indexes.clientContractsByCode.get(code) || [];
    },
    []
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
      getPositionBySku,
      getSupplierContractsByCode,
      getClientContractsByCode
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
