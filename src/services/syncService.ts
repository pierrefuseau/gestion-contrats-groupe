import { fetchAllData as fetchFromGoogleSheets } from './googleSheetsApi';
import { saveToCache, loadFromCache } from './localCacheService';
import type { Article, SupplierContract, ClientContract } from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  counts?: { articles: number; suppliers: number; clients: number };
  source?: 'google_sheets' | 'local_cache';
}

export interface DataResult {
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
}

type DataUpdateCallback = (data: DataResult) => void;

export async function syncFromGoogleSheets(): Promise<SyncResult> {
  try {
    console.log('Fetching from Google Sheets...');
    const data = await fetchFromGoogleSheets();

    saveToCache(data);
    console.log('Data saved to local cache');

    return {
      success: true,
      message: `Donnees chargees: ${data.articles.length} articles`,
      counts: {
        articles: data.articles.length,
        suppliers: data.supplierContracts.length,
        clients: data.clientContracts.length
      },
      source: 'google_sheets'
    };
  } catch (error) {
    console.error('Google Sheets fetch error:', error);
    return {
      success: false,
      message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
}

export async function initializeData(
  onProgress?: (message: string) => void,
  onDataUpdate?: DataUpdateCallback
): Promise<DataResult> {
  const cachedData = loadFromCache();

  if (cachedData) {
    onProgress?.('Chargement depuis le cache...');
    console.log('Loaded from local cache');

    fetchFromGoogleSheets()
      .then(freshData => {
        saveToCache(freshData);
        console.log('Fresh data loaded from Google Sheets');
        onDataUpdate?.(freshData);
      })
      .catch(error => {
        console.error('Background refresh failed:', error);
      });

    return cachedData;
  }

  onProgress?.('Chargement des donnees...');

  const freshData = await fetchFromGoogleSheets();
  saveToCache(freshData);
  console.log('Initial data loaded from Google Sheets');

  return freshData;
}
