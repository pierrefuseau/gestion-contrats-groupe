import {
  getAllData,
  markSyncComplete,
  upsertArticles,
  upsertSupplierContracts,
  upsertClientContracts
} from './supabaseDataService';
import { fetchAllData as fetchFromGoogleSheets } from './googleSheetsApi';
import { saveToCache, loadFromCache } from './localCacheService';
import type { Article, SupplierContract, ClientContract } from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  counts?: { articles: number; suppliers: number; clients: number };
  source?: 'google_sheets' | 'cache' | 'local_cache';
}

export interface DataResult {
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
}

type SyncErrorCallback = (error: string) => void;
type DataUpdateCallback = (data: DataResult) => void;

let syncErrorCallback: SyncErrorCallback | null = null;

export function onSyncError(callback: SyncErrorCallback): void {
  syncErrorCallback = callback;
}

async function syncToSupabase(data: DataResult): Promise<SyncResult> {
  try {
    await upsertArticles(data.articles);
    await upsertSupplierContracts(data.supplierContracts);
    await upsertClientContracts(data.clientContracts);

    const counts = {
      articles: data.articles.length,
      suppliers: data.supplierContracts.length,
      clients: data.clientContracts.length
    };
    await markSyncComplete(counts);

    console.log('Supabase sync completed:', counts);

    return {
      success: true,
      message: `Synchronisation Supabase reussie`,
      counts,
      source: 'google_sheets'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Supabase sync failed:', errorMessage);
    syncErrorCallback?.(`La synchronisation vers Supabase a echoue: ${errorMessage}`);
    return {
      success: false,
      message: errorMessage
    };
  }
}

export async function syncFromGoogleSheets(): Promise<SyncResult> {
  try {
    console.log('Fetching from Google Sheets...');
    const data = await fetchFromGoogleSheets();

    saveToCache(data);
    console.log('Data saved to local cache');

    syncToSupabase(data);

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

export async function loadAllData(): Promise<DataResult> {
  return getAllData();
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

        syncToSupabase(freshData);
      })
      .catch(error => {
        console.error('Background refresh failed:', error);
      });

    return cachedData;
  }

  onProgress?.('Chargement des donnees...');

  try {
    const freshData = await fetchFromGoogleSheets();
    saveToCache(freshData);
    console.log('Initial data loaded from Google Sheets');

    syncToSupabase(freshData);

    return freshData;
  } catch (googleError) {
    console.error('Google Sheets failed, trying Supabase:', googleError);

    try {
      const supabaseData = await getAllData();
      if (supabaseData.articles.length > 0) {
        return supabaseData;
      }
    } catch (supabaseError) {
      console.error('Supabase fallback failed:', supabaseError);
    }

    throw googleError;
  }
}
