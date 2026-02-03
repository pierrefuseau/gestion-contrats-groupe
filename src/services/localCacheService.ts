import type { Article, SupplierContract, ClientContract } from '../types';

const CACHE_KEY = 'fuseau_data_cache';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

interface CachedData {
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
  timestamp: number;
}

export function saveToCache(data: Omit<CachedData, 'timestamp'>): void {
  try {
    const cacheData: CachedData = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save to local cache:', error);
  }
}

export function loadFromCache(): Omit<CachedData, 'timestamp'> | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);

    if (!isCacheValid(data.timestamp)) {
      clearCache();
      return null;
    }

    return {
      articles: data.articles,
      supplierContracts: data.supplierContracts,
      clientContracts: data.clientContracts
    };
  } catch (error) {
    console.warn('Failed to load from local cache:', error);
    return null;
  }
}

export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION_MS;
}

export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear local cache:', error);
  }
}

export function getCacheAge(): number | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    return Date.now() - data.timestamp;
  } catch {
    return null;
  }
}
