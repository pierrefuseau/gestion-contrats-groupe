import {
  getAllData,
  markSyncComplete,
  needsSync,
  hasData,
  upsertArticles,
  upsertSupplierContracts,
  upsertClientContracts
} from './supabaseDataService';
import { fetchAllData as fetchFromGoogleSheets } from './googleSheetsApi';
import type { Article, SupplierContract, ClientContract } from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  counts?: { articles: number; suppliers: number; clients: number };
  source?: 'google_sheets' | 'cache';
}

export async function syncFromGoogleSheets(force: boolean = false): Promise<SyncResult> {
  try {
    if (!force && !(await needsSync(60))) {
      return {
        success: true,
        message: 'Donnees a jour (synchronisees il y a moins d\'une heure)',
        source: 'cache'
      };
    }

    console.log('Synchronisation Google Sheets -> Supabase...');

    const { articles, supplierContracts, clientContracts } = await fetchFromGoogleSheets();

    await upsertArticles(articles);
    await upsertSupplierContracts(supplierContracts);
    await upsertClientContracts(clientContracts);

    const counts = {
      articles: articles.length,
      suppliers: supplierContracts.length,
      clients: clientContracts.length
    };
    await markSyncComplete(counts);

    console.log('Synchronisation terminee:', counts);

    return {
      success: true,
      message: `Synchronisation reussie: ${counts.articles} articles, ${counts.suppliers} contrats fournisseurs, ${counts.clients} contrats clients`,
      counts,
      source: 'google_sheets'
    };

  } catch (error) {
    console.error('Erreur synchronisation:', error);
    return {
      success: false,
      message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
}

export async function loadAllData(): Promise<{
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
}> {
  return getAllData();
}

export async function initializeData(onProgress?: (message: string) => void): Promise<{
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
}> {
  const dataExists = await hasData();

  if (dataExists) {
    onProgress?.('Chargement depuis Supabase...');
    const data = await getAllData();

    needsSync(60).then(async (needsUpdate) => {
      if (needsUpdate) {
        console.log('Synchronisation en arriere-plan...');
        await syncFromGoogleSheets();
      }
    });

    return data;
  }

  onProgress?.('Premier chargement des donnees...');
  const result = await syncFromGoogleSheets(true);

  if (!result.success) {
    throw new Error(result.message);
  }

  return getAllData();
}
