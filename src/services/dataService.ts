import { supabase } from './supabase';
import { fetchAllData as fetchFromGoogleSheets } from './googleSheetsApi';
import type { Article, SupplierContract, ClientContract } from '../types';

interface DataResponse {
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
  source: 'supabase' | 'google_sheets';
}

async function getLastSyncTime(): Promise<Date | null> {
  const { data } = await supabase
    .from('data_sync_log')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? new Date(data.synced_at) : null;
}

async function fetchFromSupabase(): Promise<DataResponse | null> {
  const [articlesResult, supplierResult, clientResult] = await Promise.all([
    supabase.from('articles').select('*'),
    supabase.from('supplier_contracts').select('*'),
    supabase.from('client_contracts').select('*')
  ]);

  if (articlesResult.error || supplierResult.error || clientResult.error) {
    return null;
  }

  if (!articlesResult.data?.length) {
    return null;
  }

  const articles: Article[] = articlesResult.data.map(row => ({
    sku: row.sku,
    name: row.name,
    stock_uvc: row.stock_uvc,
    stock_kg: Number(row.stock_kg)
  }));

  const supplierContracts: SupplierContract[] = supplierResult.data.map(row => ({
    supplier_code: row.supplier_code,
    supplier_name: row.supplier_name,
    sku: row.sku,
    supplier_sku: row.supplier_sku || '',
    article_name: row.article_name,
    price_buy: Number(row.price_buy),
    date_start: row.date_start || '',
    date_end: row.date_end || '',
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

  const clientContracts: ClientContract[] = clientResult.data.map(row => ({
    contract_id: row.contract_id,
    client_code: row.client_code,
    client_name: row.client_name,
    sku: row.sku,
    article_name: row.article_name,
    date_start: row.date_start || '',
    date_end: row.date_end || '',
    price_sell: Number(row.price_sell),
    qty_contracted_uvc: row.qty_contracted_uvc,
    qty_contracted_kg: Number(row.qty_contracted_kg),
    qty_purchased_uvc: row.qty_purchased_uvc,
    qty_purchased_kg: Number(row.qty_purchased_kg),
    qty_remaining_uvc: row.qty_remaining_uvc,
    qty_remaining_kg: Number(row.qty_remaining_kg),
    status: row.status as 'active' | 'completed'
  }));

  return { articles, supplierContracts, clientContracts, source: 'supabase' };
}

async function syncToSupabase(data: Omit<DataResponse, 'source'>): Promise<void> {
  const { articles, supplierContracts, clientContracts } = data;

  await supabase.from('articles').delete().neq('sku', '');
  await supabase.from('supplier_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('client_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (articles.length > 0) {
    const articleRows = articles.map(a => ({
      sku: a.sku,
      name: a.name,
      stock_uvc: a.stock_uvc,
      stock_kg: a.stock_kg,
      updated_at: new Date().toISOString()
    }));

    for (let i = 0; i < articleRows.length; i += 500) {
      await supabase.from('articles').insert(articleRows.slice(i, i + 500));
    }
  }

  if (supplierContracts.length > 0) {
    const supplierRows = supplierContracts.map(c => ({
      supplier_code: c.supplier_code,
      supplier_name: c.supplier_name,
      sku: c.sku,
      supplier_sku: c.supplier_sku,
      article_name: c.article_name,
      price_buy: c.price_buy,
      date_start: c.date_start || null,
      date_end: c.date_end || null,
      qty_contracted_uvc: c.qty_contracted_uvc,
      qty_contracted_kg: c.qty_contracted_kg,
      qty_ordered_uvc: c.qty_ordered_uvc,
      qty_received_uvc: c.qty_received_uvc,
      qty_in_transit_uvc: c.qty_in_transit_uvc,
      qty_remaining_uvc: c.qty_remaining_uvc,
      qty_remaining_kg: c.qty_remaining_kg,
      qty_in_transit_kg: c.qty_in_transit_kg,
      status: c.status
    }));

    for (let i = 0; i < supplierRows.length; i += 500) {
      await supabase.from('supplier_contracts').insert(supplierRows.slice(i, i + 500));
    }
  }

  if (clientContracts.length > 0) {
    const clientRows = clientContracts.map(c => ({
      contract_id: c.contract_id,
      client_code: c.client_code,
      client_name: c.client_name,
      sku: c.sku,
      article_name: c.article_name,
      date_start: c.date_start || null,
      date_end: c.date_end || null,
      price_sell: c.price_sell,
      qty_contracted_uvc: c.qty_contracted_uvc,
      qty_contracted_kg: c.qty_contracted_kg,
      qty_purchased_uvc: c.qty_purchased_uvc,
      qty_purchased_kg: c.qty_purchased_kg,
      qty_remaining_uvc: c.qty_remaining_uvc,
      qty_remaining_kg: c.qty_remaining_kg,
      status: c.status
    }));

    for (let i = 0; i < clientRows.length; i += 500) {
      await supabase.from('client_contracts').insert(clientRows.slice(i, i + 500));
    }
  }

  await supabase.from('data_sync_log').insert({
    source: 'google_sheets',
    articles_count: articles.length,
    supplier_contracts_count: supplierContracts.length,
    client_contracts_count: clientContracts.length
  });
}

function shouldRefreshFromSource(lastSync: Date | null): boolean {
  if (!lastSync) return true;

  const now = new Date();
  const syncDate = lastSync.toDateString();
  const todayDate = now.toDateString();

  if (syncDate !== todayDate) {
    return true;
  }

  const sixAM = new Date(now);
  sixAM.setHours(6, 0, 0, 0);

  if (now >= sixAM && lastSync < sixAM) {
    return true;
  }

  return false;
}

export async function fetchAllData(forceRefresh: boolean = false): Promise<DataResponse> {
  if (!forceRefresh) {
    const lastSync = await getLastSyncTime();

    if (!shouldRefreshFromSource(lastSync)) {
      const supabaseData = await fetchFromSupabase();
      if (supabaseData) {
        return supabaseData;
      }
    }
  }

  const googleData = await fetchFromGoogleSheets();

  syncToSupabase(googleData).catch(console.error);

  return { ...googleData, source: 'google_sheets' };
}

export async function getDataSource(): Promise<{ source: 'supabase' | 'google_sheets' | 'none'; lastSync: Date | null }> {
  const lastSync = await getLastSyncTime();
  const supabaseData = await fetchFromSupabase();

  return {
    source: supabaseData ? 'supabase' : lastSync ? 'google_sheets' : 'none',
    lastSync
  };
}
