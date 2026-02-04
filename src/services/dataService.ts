import { supabase } from '../lib/supabase';
import type { Article, SupplierContract, ClientContract, Partner, PositionSummary } from '../types';

export async function loadArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('sku, name, stock_uvc, stock_kg');

  if (error) {
    console.error('Erreur chargement articles:', error);
    return [];
  }

  return (data || []).map(row => ({
    sku: row.sku,
    name: row.name || '',
    stock_uvc: Number(row.stock_uvc) || 0,
    stock_kg: Number(row.stock_kg) || 0
  }));
}

export async function loadSupplierContracts(): Promise<SupplierContract[]> {
  const { data, error } = await supabase
    .from('supplier_contracts')
    .select('*');

  if (error) {
    console.error('Erreur chargement contrats fournisseurs:', error);
    return [];
  }

  return (data || []).map(row => ({
    supplier_code: row.supplier_code || '',
    supplier_name: row.supplier_name || 'Fournisseur Inconnu',
    sku: row.sku || '',
    supplier_sku: row.supplier_sku || '',
    article_name: row.article_name || '',
    price_buy: Number(row.price_buy) || 0,
    price_unit: row.price_unit || 'KG',
    date_start: row.date_start || '',
    date_end: row.date_end || '',
    qty_contracted_uvc: Number(row.qty_contracted_uvc) || 0,
    qty_contracted_kg: Number(row.qty_contracted_kg) || 0,
    qty_ordered_uvc: Number(row.qty_ordered_uvc) || 0,
    qty_received_uvc: Number(row.qty_received_uvc) || 0,
    qty_in_transit_uvc: Number(row.qty_in_transit_uvc) || 0,
    qty_remaining_uvc: Number(row.qty_remaining_uvc) || 0,
    qty_remaining_kg: Number(row.qty_remaining_kg) || 0,
    qty_in_transit_kg: Number(row.qty_in_transit_kg) || 0,
    status: (row.status === 'completed' ? 'completed' : 'active') as 'active' | 'completed'
  }));
}

export async function loadClientContracts(): Promise<ClientContract[]> {
  const { data, error } = await supabase
    .from('client_contracts')
    .select('*');

  if (error) {
    console.error('Erreur chargement contrats clients:', error);
    return [];
  }

  return (data || []).map(row => ({
    contract_id: row.contract_id || '',
    client_code: row.client_code || '',
    client_name: row.client_name || 'Client Inconnu',
    sku: row.sku || '',
    article_name: row.article_name || '',
    date_start: row.date_start || '',
    date_end: row.date_end || '',
    price_sell: Number(row.price_sell) || 0,
    qty_contracted_uvc: Number(row.qty_contracted_uvc) || 0,
    qty_contracted_kg: Number(row.qty_contracted_kg) || 0,
    qty_purchased_uvc: Number(row.qty_purchased_uvc) || 0,
    qty_purchased_kg: Number(row.qty_purchased_kg) || 0,
    qty_remaining_uvc: Number(row.qty_remaining_uvc) || 0,
    qty_remaining_kg: Number(row.qty_remaining_kg) || 0,
    status: (row.status === 'completed' ? 'completed' : 'active') as 'active' | 'completed'
  }));
}

export async function loadSuppliers(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('suppliers_view')
    .select('*');

  if (error) {
    console.error('Erreur chargement fournisseurs:', error);
    return [];
  }

  return (data || []).map(row => ({
    code: row.code || '',
    name: row.name || 'Fournisseur Inconnu',
    type: 'supplier' as const,
    contracts_count: Number(row.contracts_count) || 0,
    total_volume_kg: Number(row.total_volume_kg) || 0
  }));
}

export async function loadClients(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('clients_view')
    .select('*');

  if (error) {
    console.error('Erreur chargement clients:', error);
    return [];
  }

  return (data || []).map(row => ({
    code: row.code || '',
    name: row.name || 'Client Inconnu',
    type: 'client' as const,
    contracts_count: Number(row.contracts_count) || 0,
    total_volume_kg: Number(row.total_volume_kg) || 0
  }));
}

export async function loadPositions(): Promise<PositionSummary[]> {
  const { data, error } = await supabase
    .from('positions_view')
    .select('*');

  if (error) {
    console.error('Erreur chargement positions:', error);
    return [];
  }

  return (data || []).map(row => ({
    sku: row.sku || '',
    article_name: row.article_name || '',
    stock_kg: Number(row.stock_kg) || 0,
    stock_uvc: Number(row.stock_uvc) || 0,
    supply_remaining_kg: Number(row.supply_remaining_kg) || 0,
    supply_remaining_uvc: Number(row.supply_remaining_uvc) || 0,
    supply_in_transit_kg: Number(row.supply_in_transit_kg) || 0,
    supply_in_transit_uvc: Number(row.supply_in_transit_uvc) || 0,
    demand_remaining_kg: Number(row.demand_remaining_kg) || 0,
    demand_remaining_uvc: Number(row.demand_remaining_uvc) || 0,
    total_available_kg: Number(row.total_available_kg) || 0,
    net_position_kg: Number(row.net_position_kg) || 0,
    net_position_uvc: Number(row.net_position_uvc) || 0,
    status: (row.status === 'CRITICAL' ? 'CRITICAL' : row.status === 'SHORT' ? 'SHORT' : 'LONG') as 'LONG' | 'SHORT' | 'CRITICAL',
    supplier_contracts: Number(row.supplier_contracts) || 0,
    client_contracts: Number(row.client_contracts) || 0,
    avg_buy_price: Number(row.avg_buy_price) || 0,
    avg_sell_price: Number(row.avg_sell_price) || 0,
    margin_percent: Number(row.margin_percent) || 0
  }));
}

export async function loadAllData(): Promise<{
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
  suppliers: Partner[];
  clients: Partner[];
  positions: PositionSummary[];
}> {
  const [articles, supplierContracts, clientContracts, suppliers, clients, positions] = await Promise.all([
    loadArticles(),
    loadSupplierContracts(),
    loadClientContracts(),
    loadSuppliers(),
    loadClients(),
    loadPositions()
  ]);

  return { articles, supplierContracts, clientContracts, suppliers, clients, positions };
}
