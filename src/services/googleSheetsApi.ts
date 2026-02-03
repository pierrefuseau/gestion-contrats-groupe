import type { Article, SupplierContract, ClientContract } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || '1THGnjS_6ef6gf8HkYEIPiDbjymDJ8KbF-J4yGSctUsE';

function parseNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  const str = String(value)
    .replace(/\s/g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.-]/g, '');

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function parseInteger(value: unknown): number {
  return Math.round(parseNumber(value));
}

function parseDate(value: unknown): string {
  if (!value) return '';
  const str = String(value).trim();

  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return str;
}

function parseString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function calculateStatus(qtyRemainingUvc: number, qtyRemainingKg: number): 'active' | 'completed' {
  if (qtyRemainingUvc > 0 || qtyRemainingKg > 0) return 'active';
  return 'completed';
}

async function fetchSheetData(sheetName: string): Promise<unknown[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API Google Sheets (${sheetName}): ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.values || [];
}

export async function fetchArticles(): Promise<Article[]> {
  const rows = await fetchSheetData('articles');

  return rows.slice(1)
    .map(row => ({
      sku: parseString(row[0]),
      name: parseString(row[1]),
      stock_uvc: parseInteger(row[2]),
      stock_kg: parseNumber(row[3])
    }))
    .filter(a => a.sku !== '');
}

export async function fetchSupplierContracts(): Promise<SupplierContract[]> {
  const rows = await fetchSheetData('contrats_fournisseurs');

  return rows.slice(1)
    .map(row => {
      const supplier_code = parseString(row[0]);
      const supplier_name = parseString(row[1]) || 'Fournisseur Inconnu';
      const sku = parseString(row[2]);
      const supplier_sku = parseString(row[3]);
      const article_name = parseString(row[4]);
      const price_buy = parseNumber(row[5]);
      const date_start = parseDate(row[6]);
      const date_end = parseDate(row[7]);
      const qty_contracted_uvc = parseInteger(row[8]);
      const qty_contracted_kg = parseNumber(row[9]);
      const qty_ordered_uvc = parseInteger(row[10]);
      const qty_received_uvc = parseInteger(row[11]);
      const qty_in_transit_uvc = parseInteger(row[12]);

      const qty_remaining_uvc = Math.round(Math.max(0, qty_contracted_uvc - qty_ordered_uvc));
      const conversionFactor = qty_contracted_uvc > 0 ? qty_contracted_kg / qty_contracted_uvc : 0;
      const qty_remaining_kg = qty_remaining_uvc * conversionFactor;
      const qty_in_transit_kg = qty_in_transit_uvc * conversionFactor;

      const status = calculateStatus(qty_remaining_uvc, qty_remaining_kg);

      return {
        supplier_code,
        supplier_name,
        sku,
        supplier_sku,
        article_name,
        price_buy,
        date_start,
        date_end,
        qty_contracted_uvc,
        qty_contracted_kg,
        qty_ordered_uvc,
        qty_received_uvc,
        qty_in_transit_uvc,
        qty_remaining_uvc,
        qty_remaining_kg,
        qty_in_transit_kg,
        status
      };
    })
    .filter(c => c.sku !== '');
}

export async function fetchClientContracts(): Promise<ClientContract[]> {
  const rows = await fetchSheetData('contrats_clients');

  return rows.slice(1)
    .map(row => {
      const contract_id = parseString(row[0]);
      const client_code = parseString(row[1]);
      const client_name = parseString(row[2]) || 'Client Inconnu';
      const sku = parseString(row[3]);
      const article_name = parseString(row[4]);
      const date_start = parseDate(row[5]);
      const date_end = parseDate(row[6]);
      const price_sell = parseNumber(row[7]);
      const qty_contracted_uvc = parseInteger(row[8]);
      const qty_contracted_kg = parseNumber(row[9]);
      const qty_purchased_uvc = parseInteger(row[10]);
      const qty_purchased_kg = parseNumber(row[11]);

      const qty_remaining_uvc = Math.round(Math.max(0, qty_contracted_uvc - qty_purchased_uvc));
      const qty_remaining_kg = Math.max(0, qty_contracted_kg - qty_purchased_kg);

      const status = calculateStatus(qty_remaining_uvc, qty_remaining_kg);

      return {
        contract_id,
        client_code,
        client_name,
        sku,
        article_name,
        date_start,
        date_end,
        price_sell,
        qty_contracted_uvc,
        qty_contracted_kg,
        qty_purchased_uvc,
        qty_purchased_kg,
        qty_remaining_uvc,
        qty_remaining_kg,
        status
      };
    })
    .filter(c => c.sku !== '');
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

  console.log(`Donnees chargees: ${articles.length} articles, ${supplierContracts.length} contrats fournisseurs, ${clientContracts.length} contrats clients`);

  return { articles, supplierContracts, clientContracts };
}
