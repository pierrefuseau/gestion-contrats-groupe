import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import type { Article, SupplierContract, ClientContract, Partner, PositionSummary } from '../types';
import { useSheetData } from '../hooks/useSheetData';
import { calculateAllPositions, getPartners } from '../utils/calculations';
import { buildContractIndexes, buildArticleIndex, buildPositionIndex, buildPartnerIndex } from '../services/dataIndex';

interface DataContextType {
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
  partners: Partner[];
  positions: PositionSummary[];
  criticalPositions: PositionSummary[];
  shortPositions: PositionSummary[];
  isLoading: boolean;
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
  const sheetData = useSheetData();

  const partners = useMemo(
    () => getPartners(sheetData.supplierContracts, sheetData.clientContracts),
    [sheetData.supplierContracts, sheetData.clientContracts]
  );

  const positions = useMemo(
    () => calculateAllPositions(sheetData.articles, sheetData.supplierContracts, sheetData.clientContracts),
    [sheetData.articles, sheetData.supplierContracts, sheetData.clientContracts]
  );

  const contractIndexes = useMemo(
    () => buildContractIndexes(sheetData.supplierContracts, sheetData.clientContracts),
    [sheetData.supplierContracts, sheetData.clientContracts]
  );

  const articleIndex = useMemo(
    () => buildArticleIndex(sheetData.articles),
    [sheetData.articles]
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
      ...sheetData,
      partners,
      positions,
      criticalPositions,
      shortPositions,
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
