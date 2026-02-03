import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Article, SupplierContract, ClientContract, Partner, PositionSummary } from '../types';
import { initializeData } from '../services/syncService';
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

function calculatePartners(
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): { suppliers: Partner[]; clients: Partner[] } {
  const supplierMap = new Map<string, { name: string; contracts: number; volumeKg: number }>();
  const clientMap = new Map<string, { name: string; contracts: number; volumeKg: number }>();

  supplierContracts.forEach(contract => {
    if (contract.status === 'active') {
      const existing = supplierMap.get(contract.supplier_code);
      if (existing) {
        existing.contracts++;
        existing.volumeKg += contract.qty_contracted_kg;
      } else {
        supplierMap.set(contract.supplier_code, {
          name: contract.supplier_name,
          contracts: 1,
          volumeKg: contract.qty_contracted_kg
        });
      }
    }
  });

  clientContracts.forEach(contract => {
    if (contract.status === 'active') {
      const existing = clientMap.get(contract.client_code);
      if (existing) {
        existing.contracts++;
        existing.volumeKg += contract.qty_contracted_kg;
      } else {
        clientMap.set(contract.client_code, {
          name: contract.client_name,
          contracts: 1,
          volumeKg: contract.qty_contracted_kg
        });
      }
    }
  });

  const suppliers: Partner[] = Array.from(supplierMap.entries()).map(([code, data]) => ({
    code,
    name: data.name,
    type: 'supplier' as const,
    contracts_count: data.contracts,
    total_volume_kg: data.volumeKg
  }));

  const clients: Partner[] = Array.from(clientMap.entries()).map(([code, data]) => ({
    code,
    name: data.name,
    type: 'client' as const,
    contracts_count: data.contracts,
    total_volume_kg: data.volumeKg
  }));

  return { suppliers, clients };
}

function calculatePositions(
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): PositionSummary[] {
  const skuSet = new Set<string>();
  articles.forEach(a => skuSet.add(a.sku));
  supplierContracts.forEach(c => skuSet.add(c.sku));
  clientContracts.forEach(c => skuSet.add(c.sku));

  const positions: PositionSummary[] = [];

  skuSet.forEach(sku => {
    const article = articles.find(a => a.sku === sku);
    const supContracts = supplierContracts.filter(c => c.sku === sku && c.status === 'active');
    const cliContracts = clientContracts.filter(c => c.sku === sku && c.status === 'active');

    const stock_kg = article?.stock_kg || 0;
    const stock_uvc = article?.stock_uvc || 0;
    const supply_remaining_kg = supContracts.reduce((sum, c) => sum + c.qty_remaining_kg, 0);
    const supply_remaining_uvc = supContracts.reduce((sum, c) => sum + c.qty_remaining_uvc, 0);
    const supply_in_transit_kg = supContracts.reduce((sum, c) => sum + c.qty_in_transit_kg, 0);
    const supply_in_transit_uvc = supContracts.reduce((sum, c) => sum + c.qty_in_transit_uvc, 0);
    const demand_remaining_kg = cliContracts.reduce((sum, c) => sum + c.qty_remaining_kg, 0);
    const demand_remaining_uvc = cliContracts.reduce((sum, c) => sum + c.qty_remaining_uvc, 0);
    const total_available_kg = stock_kg + supply_remaining_kg + supply_in_transit_kg;
    const net_position_kg = total_available_kg - demand_remaining_kg;
    const net_position_uvc = stock_uvc + supply_remaining_uvc + supply_in_transit_uvc - demand_remaining_uvc;

    let status: 'LONG' | 'SHORT' | 'CRITICAL' = 'LONG';
    if (net_position_kg < -100) {
      status = 'CRITICAL';
    } else if (net_position_kg < 0) {
      status = 'SHORT';
    }

    const totalBuyValue = supContracts.reduce((sum, c) => sum + (c.price_buy * c.qty_contracted_kg), 0);
    const totalBuyQty = supContracts.reduce((sum, c) => sum + c.qty_contracted_kg, 0);
    const avg_buy_price = totalBuyQty > 0 ? totalBuyValue / totalBuyQty : 0;

    const totalSellValue = cliContracts.reduce((sum, c) => sum + (c.price_sell * c.qty_contracted_kg), 0);
    const totalSellQty = cliContracts.reduce((sum, c) => sum + c.qty_contracted_kg, 0);
    const avg_sell_price = totalSellQty > 0 ? totalSellValue / totalSellQty : 0;

    const margin_percent = avg_buy_price > 0 ? ((avg_sell_price - avg_buy_price) / avg_buy_price) * 100 : 0;

    const articleName = article?.name || supContracts[0]?.article_name || cliContracts[0]?.article_name || sku;

    positions.push({
      sku,
      article_name: articleName,
      stock_kg,
      stock_uvc,
      supply_remaining_kg,
      supply_remaining_uvc,
      supply_in_transit_kg,
      supply_in_transit_uvc,
      demand_remaining_kg,
      demand_remaining_uvc,
      total_available_kg,
      net_position_kg,
      net_position_uvc,
      status,
      supplier_contracts: supContracts.length,
      client_contracts: cliContracts.length,
      avg_buy_price,
      avg_sell_price,
      margin_percent
    });
  });

  return positions.sort((a, b) => a.net_position_kg - b.net_position_kg);
}

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

      const data = await initializeData(
        (message) => console.log(message),
        (freshData) => {
          setArticles(freshData.articles);
          setSupplierContracts(freshData.supplierContracts);
          setClientContracts(freshData.clientContracts);

          const { suppliers: newSuppliers, clients: newClients } = calculatePartners(freshData.supplierContracts, freshData.clientContracts);
          setSuppliers(newSuppliers);
          setClients(newClients);

          const newPositions = calculatePositions(freshData.articles, freshData.supplierContracts, freshData.clientContracts);
          setPositions(newPositions);

          buildSearchIndexesFromData(freshData.articles, freshData.supplierContracts, freshData.clientContracts);
          setLastUpdated(new Date());
        }
      );

      setArticles(data.articles);
      setSupplierContracts(data.supplierContracts);
      setClientContracts(data.clientContracts);

      const { suppliers: initialSuppliers, clients: initialClients } = calculatePartners(data.supplierContracts, data.clientContracts);
      setSuppliers(initialSuppliers);
      setClients(initialClients);

      const initialPositions = calculatePositions(data.articles, data.supplierContracts, data.clientContracts);
      setPositions(initialPositions);

      buildSearchIndexesFromData(data.articles, data.supplierContracts, data.clientContracts);
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
