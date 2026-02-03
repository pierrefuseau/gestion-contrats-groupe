import type { Article, SupplierContract, ClientContract } from '../types';

const CACHE_KEY = 'agritrade_data_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData {
  timestamp: number;
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
}

export function getFromCache(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function saveToCache(data: Omit<CacheData, 'timestamp'>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  } catch {
    // Storage quota exceeded or other error - ignore
  }
}

export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
