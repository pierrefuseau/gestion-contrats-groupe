import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Article, SupplierContract, ClientContract, Partner, PositionSummary } from '../types';
import { useSheetData } from '../hooks/useSheetData';
import { calculateAllPositions, getPartners } from '../utils/calculations';

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

  const criticalPositions = useMemo(
    () => positions.filter(p => p.status === 'CRITICAL').sort((a, b) => a.net_position_kg - b.net_position_kg),
    [positions]
  );

  const shortPositions = useMemo(
    () => positions.filter(p => p.status === 'SHORT' || p.status === 'CRITICAL').sort((a, b) => a.net_position_kg - b.net_position_kg),
    [positions]
  );

  const getArticleBySku = (sku: string) =>
    sheetData.articles.find(a => a.sku === sku);

  const getSupplierContractsBySku = (sku: string) =>
    sheetData.supplierContracts.filter(c => c.sku === sku);

  const getClientContractsBySku = (sku: string) =>
    sheetData.clientContracts.filter(c => c.sku === sku);

  const getPartnerByCode = (code: string) =>
    partners.find(p => p.code === code);

  const getPositionBySku = (sku: string) =>
    positions.find(p => p.sku === sku);

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
