import { supabase } from './supabase';
import type { Article, SupplierContract, ClientContract } from '../types';

export interface SyncMetadata {
  id: string;
  synced_at: Date;
  articles_count: number;
  supplier_contracts_count: number;
  client_contracts_count: number;
}

export async function getArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function getSupplierContracts(): Promise<SupplierContract[]> {
  const { data, error } = await supabase
    .from('supplier_contracts')
    .select('*');

  if (error) throw error;
  return (data || []).map(row => ({
    supplier_code: row.supplier_code,
    supplier_name: row.supplier_name,
    sku: row.sku,
    supplier_sku: row.supplier_sku || '',
    article_name: row.article_name,
    price_buy: Number(row.price_buy),
    date_start: row.date_start,
    date_end: row.date_end,
    qty_contracted_uvc: row.qty_contracted_uvc,
    qty_contracted_kg: Number(row.qty_contracted_kg),
    qty_ordered_uvc: row.qty_ordered_uvc,
    qty_received_uvc: row.qty_received_uvc,
    qty_in_transit_uvc: row.qty_in_transit_uvc,
    qty_remaining_uvc: row.qty_remaining_uvc,
    qty_remaining_kg: Number(row.qty_remaining_kg),
    qty_in_transit_kg: Number(row.qty_in_transit_kg),
    status: row.status as 'active' | 'completed'
  }));
}

export async function getClientContracts(): Promise<ClientContract[]> {
  const { data, error } = await supabase
    .from('client_contracts')
    .select('*');

  if (error) throw error;
  return (data || []).map(row => ({
    contract_id: row.contract_id,
    client_code: row.client_code,
    client_name: row.client_name,
    sku: row.sku,
    article_name: row.article_name,
    date_start: row.date_start,
    date_end: row.date_end,
    price_sell: Number(row.price_sell),
    qty_contracted_uvc: row.qty_contracted_uvc,
    qty_contracted_kg: Number(row.qty_contracted_kg),
    qty_purchased_uvc: row.qty_purchased_uvc,
    qty_purchased_kg: Number(row.qty_purchased_kg),
    qty_remaining_uvc: row.qty_remaining_uvc,
    qty_remaining_kg: Number(row.qty_remaining_kg),
    status: row.status as 'active' | 'completed'
  }));
}

export async function getAllData(): Promise<{
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
}> {
  const [articles, supplierContracts, clientContracts] = await Promise.all([
    getArticles(),
    getSupplierContracts(),
    getClientContracts()
  ]);

  return { articles, supplierContracts, clientContracts };
}

export async function needsSync(maxAgeMinutes: number = 60): Promise<boolean> {
  const { data, error } = await supabase
    .from('data_sync_log')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return true;

  const syncedAt = new Date(data.synced_at);
  const ageMs = Date.now() - syncedAt.getTime();
  const ageMinutes = ageMs / (1000 * 60);

  return ageMinutes > maxAgeMinutes;
}

export async function markSyncComplete(counts: { articles: number; suppliers: number; clients: number }): Promise<void> {
  const { error } = await supabase
    .from('data_sync_log')
    .insert({
      source: 'google_sheets',
      articles_count: counts.articles,
      supplier_contracts_count: counts.suppliers,
      client_contracts_count: counts.clients
    });

  if (error) throw error;
}

export async function getLastSyncTime(): Promise<Date | null> {
  const { data, error } = await supabase
    .from('data_sync_log')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return new Date(data.synced_at);
}

export async function hasData(): Promise<boolean> {
  const { count, error } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  if (error) return false;
  return (count || 0) > 0;
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    supabase.from('articles').delete().neq('sku', ''),
    supabase.from('supplier_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('client_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  ]);
}

const BATCH_SIZE = 100;

function sanitizeNumber(value: number): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0;
  }
  return value;
}

function sanitizeDate(value: string | null | undefined): string | null {
  if (!value || value === '' || value === 'Invalid Date') {
    return null;
  }
  return value;
}

async function batchOperation<T>(
  items: T[],
  operation: (batch: T[], batchIndex: number) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE);
    await operation(batch, batchIndex);
  }
}

export async function upsertArticles(articles: Article[]): Promise<void> {
  if (articles.length === 0) return;

  await batchOperation(articles, async (batch, batchIndex) => {
    const mappedBatch = batch.map(a => ({
      sku: a.sku,
      name: a.name,
      stock_uvc: Math.round(sanitizeNumber(a.stock_uvc)),
      stock_kg: sanitizeNumber(a.stock_kg),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('articles')
      .upsert(mappedBatch, { onConflict: 'sku' });

    if (error) {
      console.error(`Articles batch ${batchIndex} failed:`, error.message, mappedBatch[0]);
      throw error;
    }
  });
}

export async function upsertSupplierContracts(contracts: SupplierContract[]): Promise<void> {
  if (contracts.length === 0) return;

  await supabase.from('supplier_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  await batchOperation(contracts, async (batch, batchIndex) => {
    const mappedBatch = batch.map(c => ({
      supplier_code: c.supplier_code,
      supplier_name: c.supplier_name,
      sku: c.sku,
      supplier_sku: c.supplier_sku || null,
      article_name: c.article_name,
      price_buy: sanitizeNumber(c.price_buy),
      date_start: sanitizeDate(c.date_start),
      date_end: sanitizeDate(c.date_end),
      qty_contracted_uvc: Math.round(sanitizeNumber(c.qty_contracted_uvc)),
      qty_contracted_kg: sanitizeNumber(c.qty_contracted_kg),
      qty_ordered_uvc: Math.round(sanitizeNumber(c.qty_ordered_uvc)),
      qty_received_uvc: Math.round(sanitizeNumber(c.qty_received_uvc)),
      qty_in_transit_uvc: Math.round(sanitizeNumber(c.qty_in_transit_uvc)),
      qty_remaining_uvc: Math.round(sanitizeNumber(c.qty_remaining_uvc)),
      qty_remaining_kg: sanitizeNumber(c.qty_remaining_kg),
      qty_in_transit_kg: sanitizeNumber(c.qty_in_transit_kg),
      status: c.status || 'active',
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('supplier_contracts')
      .insert(mappedBatch);

    if (error) {
      console.error(`Supplier contracts batch ${batchIndex} failed:`, error.message, mappedBatch[0]);
      throw error;
    }
  });
}

export async function upsertClientContracts(contracts: ClientContract[]): Promise<void> {
  if (contracts.length === 0) return;

  await supabase.from('client_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  await batchOperation(contracts, async (batch, batchIndex) => {
    const mappedBatch = batch.map(c => ({
      contract_id: c.contract_id,
      client_code: c.client_code,
      client_name: c.client_name,
      sku: c.sku,
      article_name: c.article_name,
      date_start: sanitizeDate(c.date_start),
      date_end: sanitizeDate(c.date_end),
      price_sell: sanitizeNumber(c.price_sell),
      qty_contracted_uvc: Math.round(sanitizeNumber(c.qty_contracted_uvc)),
      qty_contracted_kg: sanitizeNumber(c.qty_contracted_kg),
      qty_purchased_uvc: Math.round(sanitizeNumber(c.qty_purchased_uvc)),
      qty_purchased_kg: sanitizeNumber(c.qty_purchased_kg),
      qty_remaining_uvc: Math.round(sanitizeNumber(c.qty_remaining_uvc)),
      qty_remaining_kg: sanitizeNumber(c.qty_remaining_kg),
      status: c.status || 'active',
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('client_contracts')
      .insert(mappedBatch);

    if (error) {
      console.error(`Client contracts batch ${batchIndex} failed:`, error.message, mappedBatch[0]);
      throw error;
    }
  });
}
