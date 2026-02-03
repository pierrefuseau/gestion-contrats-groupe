import type { Article, SupplierContract, ClientContract } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || '1THGnjS_6ef6gf8HkYEIPiDbjymDJ8KbF-J4yGSctUsE';
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;

async function fetchSheetData(sheetName: string): Promise<any[][]> {
  const url = `${BASE_URL}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur chargement ${sheetName}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.values || [];
}

function parseFrenchDate(dateStr: string): string {
  if (!dateStr) return '';

  const match = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return dateStr;
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const cleaned = String(value).replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export async function fetchArticles(): Promise<Article[]> {
  const rows = await fetchSheetData('articles');

  return rows.slice(1).map(row => ({
    sku: String(row[0] || ''),
    name: String(row[1] || ''),
    stock_uvc: parseNumber(row[2]),
    stock_kg: parseNumber(row[3])
  })).filter(a => a.sku);
}

export async function fetchSupplierContracts(): Promise<SupplierContract[]> {
  const rows = await fetchSheetData('contrats_fournisseurs');

  return rows.slice(1).map(row => {
    const qty_contracted_uvc = parseNumber(row[8]);
    const qty_contracted_kg = parseNumber(row[9]);
    const qty_ordered_uvc = parseNumber(row[10]);
    const qty_received_uvc = parseNumber(row[11]);
    const qty_in_transit_uvc = parseNumber(row[12]);

    const qty_remaining_uvc = qty_contracted_uvc - qty_ordered_uvc;

    const uvc_to_kg = qty_contracted_uvc > 0 ? qty_contracted_kg / qty_contracted_uvc : 0;

    const dateEnd = parseFrenchDate(String(row[7] || ''));
    const isExpired = dateEnd && new Date(dateEnd) < new Date();
    const isFullyDelivered = qty_remaining_uvc <= 0;
    const status = (isExpired || isFullyDelivered) ? 'completed' : 'active';

    return {
      supplier_code: String(row[0] || ''),
      supplier_name: String(row[1] || ''),
      sku: String(row[2] || ''),
      supplier_sku: String(row[3] || ''),
      article_name: String(row[4] || ''),
      price_buy: parseNumber(row[5]),
      date_start: parseFrenchDate(String(row[6] || '')),
      date_end: parseFrenchDate(String(row[7] || '')),
      qty_contracted_uvc,
      qty_contracted_kg,
      qty_ordered_uvc,
      qty_received_uvc,
      qty_in_transit_uvc,
      qty_remaining_uvc,
      qty_remaining_kg: qty_remaining_uvc * uvc_to_kg,
      qty_in_transit_kg: qty_in_transit_uvc * uvc_to_kg,
      status
    };
  }).filter(c => c.sku) as SupplierContract[];
}

export async function fetchClientContracts(): Promise<ClientContract[]> {
  const rows = await fetchSheetData('contrats_clients');

  return rows.slice(1).map(row => {
    const qty_contracted_uvc = parseNumber(row[8]);
    const qty_contracted_kg = parseNumber(row[9]);
    const qty_purchased_uvc = parseNumber(row[10]);
    const qty_purchased_kg = parseNumber(row[11]);

    const qty_remaining_uvc = qty_contracted_uvc - qty_purchased_uvc;
    const qty_remaining_kg = qty_contracted_kg - qty_purchased_kg;

    const dateEnd = parseFrenchDate(String(row[6] || ''));
    const isExpired = dateEnd && new Date(dateEnd) < new Date();
    const isFullyDelivered = qty_remaining_uvc <= 0;
    const status = (isExpired || isFullyDelivered) ? 'completed' : 'active';

    return {
      contract_id: String(row[0] || ''),
      client_code: String(row[1] || ''),
      client_name: String(row[2] || ''),
      sku: String(row[3] || ''),
      article_name: String(row[4] || ''),
      date_start: parseFrenchDate(String(row[5] || '')),
      date_end: parseFrenchDate(String(row[6] || '')),
      price_sell: parseNumber(row[7]),
      qty_contracted_uvc,
      qty_contracted_kg,
      qty_purchased_uvc,
      qty_purchased_kg,
      qty_remaining_uvc,
      qty_remaining_kg,
      status
    };
  }).filter(c => c.sku) as ClientContract[];
}

export async function fetchAllData(): Promise<{
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
}> {
  const [articles, supplierContracts, clientContracts] = await Promise.all([
    fetchArticles(),
    fetchSupplierContracts(),
    fetchClientContracts()
  ]);

  return { articles, supplierContracts, clientContracts };
}
