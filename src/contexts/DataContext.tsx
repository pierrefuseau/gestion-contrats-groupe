import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Article, SupplierContract, ClientContract, Partner, PositionSummary } from '../types';
import { loadAllData } from '../services/dataService';

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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await loadAllData();

      setArticles(data.articles);
      setSupplierContracts(data.supplierContracts);
      setClientContracts(data.clientContracts);
      setSuppliers(data.suppliers);
      setClients(data.clients);
      setPositions(data.positions);
      setLastUpdated(new Date());
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
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const forceRefresh = useCallback(async () => {
    await loadData();
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

  const indexes = useMemo(() => {
    const articlesBySku = new Map<string, Article>();
    articles.forEach(a => articlesBySku.set(a.sku.toLowerCase(), a));

    const supplierContractsBySku = new Map<string, SupplierContract[]>();
    const supplierContractsByCode = new Map<string, SupplierContract[]>();
    supplierContracts.forEach(c => {
      const skuKey = c.sku.toLowerCase();
      if (!supplierContractsBySku.has(skuKey)) {
        supplierContractsBySku.set(skuKey, []);
      }
      supplierContractsBySku.get(skuKey)!.push(c);

      const codeKey = c.supplier_code;
      if (!supplierContractsByCode.has(codeKey)) {
        supplierContractsByCode.set(codeKey, []);
      }
      supplierContractsByCode.get(codeKey)!.push(c);
    });

    const clientContractsBySku = new Map<string, ClientContract[]>();
    const clientContractsByCode = new Map<string, ClientContract[]>();
    clientContracts.forEach(c => {
      const skuKey = c.sku.toLowerCase();
      if (!clientContractsBySku.has(skuKey)) {
        clientContractsBySku.set(skuKey, []);
      }
      clientContractsBySku.get(skuKey)!.push(c);

      const codeKey = c.client_code;
      if (!clientContractsByCode.has(codeKey)) {
        clientContractsByCode.set(codeKey, []);
      }
      clientContractsByCode.get(codeKey)!.push(c);
    });

    const partnersByCode = new Map<string, Partner>();
    partners.forEach(p => partnersByCode.set(p.code, p));

    const positionsBySku = new Map<string, PositionSummary>();
    positions.forEach(p => positionsBySku.set(p.sku.toLowerCase(), p));

    return {
      articlesBySku,
      supplierContractsBySku,
      clientContractsBySku,
      supplierContractsByCode,
      clientContractsByCode,
      partnersByCode,
      positionsBySku
    };
  }, [articles, supplierContracts, clientContracts, partners, positions]);

  const getArticleBySku = useCallback(
    (sku: string) => {
      return indexes.articlesBySku.get(sku.toLowerCase());
    },
    [indexes]
  );

  const getSupplierContractsBySku = useCallback(
    (sku: string) => {
      return indexes.supplierContractsBySku.get(sku.toLowerCase()) || [];
    },
    [indexes]
  );

  const getClientContractsBySku = useCallback(
    (sku: string) => {
      return indexes.clientContractsBySku.get(sku.toLowerCase()) || [];
    },
    [indexes]
  );

  const getPartnerByCode = useCallback(
    (code: string) => {
      return indexes.partnersByCode.get(code);
    },
    [indexes]
  );

  const getPositionBySku = useCallback(
    (sku: string) => {
      return indexes.positionsBySku.get(sku.toLowerCase());
    },
    [indexes]
  );

  const getSupplierContractsByCode = useCallback(
    (code: string) => {
      return indexes.supplierContractsByCode.get(code) || [];
    },
    [indexes]
  );

  const getClientContractsByCode = useCallback(
    (code: string) => {
      return indexes.clientContractsByCode.get(code) || [];
    },
    [indexes]
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
