import Dexie, { type Table } from 'dexie';
import type { Article, SupplierContract, ClientContract } from '../types';

export interface SyncMetadata {
  id: string;
  lastSync: Date;
  rowCount: number;
}

export class FuseauDatabase extends Dexie {
  articles!: Table<Article, string>;
  supplierContracts!: Table<SupplierContract, string>;
  clientContracts!: Table<ClientContract, string>;
  syncMetadata!: Table<SyncMetadata, string>;

  constructor() {
    super('FuseauContractsDB');

    this.version(1).stores({
      articles: 'sku, name',
      supplierContracts: '[supplier_code+sku+date_start], supplier_code, supplier_name, sku, article_name, status',
      clientContracts: 'contract_id, client_code, client_name, sku, article_name, status',
      syncMetadata: 'id'
    });
  }
}

export const db = new FuseauDatabase();

export async function needsSync(maxAgeMinutes: number = 60): Promise<boolean> {
  const meta = await db.syncMetadata.get('lastSync');
  if (!meta) return true;

  const ageMs = Date.now() - meta.lastSync.getTime();
  const ageMinutes = ageMs / (1000 * 60);

  return ageMinutes > maxAgeMinutes;
}

export async function markSyncComplete(counts: { articles: number; suppliers: number; clients: number }) {
  await db.syncMetadata.put({
    id: 'lastSync',
    lastSync: new Date(),
    rowCount: counts.articles + counts.suppliers + counts.clients
  });
}

export async function getLastSyncTime(): Promise<Date | null> {
  const meta = await db.syncMetadata.get('lastSync');
  return meta ? meta.lastSync : null;
}

export async function hasLocalData(): Promise<boolean> {
  const count = await db.articles.count();
  return count > 0;
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.articles, db.supplierContracts, db.clientContracts, db.syncMetadata], async () => {
    await db.articles.clear();
    await db.supplierContracts.clear();
    await db.clientContracts.clear();
    await db.syncMetadata.clear();
  });
}
