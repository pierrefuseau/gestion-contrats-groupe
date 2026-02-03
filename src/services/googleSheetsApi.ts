import type { Article, SupplierContract, ClientContract } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;

async function fetchSheetData(sheetName: string, range: string = 'A:Z'): Promise<string[][]> {
  const url = `${BASE_URL}/values/${encodeURIComponent(sheetName)}!${range}?key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur lors du chargement de ${sheetName}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.values || [];
}

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? '';
    });
    return obj;
  });
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  const frenchMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (frenchMatch) {
    return `${frenchMatch[3]}-${frenchMatch[2]}-${frenchMatch[1]}`;
  }

  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
  }

  return new Date().toISOString().split('T')[0];
}

function parseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.toString().replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function calculateStatus(dateEnd: string, qtyRemaining: number): 'active' | 'completed' {
  const endDate = new Date(dateEnd);
  const today = new Date();

  if (qtyRemaining <= 0 || endDate < today) {
    return 'completed';
  }
  return 'active';
}

export async function fetchArticles(): Promise<Article[]> {
  const rows = await fetchSheetData('articles');
  const rawData = rowsToObjects(rows);

  return rawData
    .filter(row => row['Code article'])
    .map(row => ({
      sku: row['Code article'],
      name: row['Libellé article'] || row['Code article'],
      stock_uvc: parseNumber(row['Stock UVC']),
      stock_kg: parseNumber(row['Stock KG'])
    }));
}

export async function fetchSupplierContracts(): Promise<SupplierContract[]> {
  const rows = await fetchSheetData('contrats_fournisseurs');
  const rawData = rowsToObjects(rows);

  return rawData
    .filter(row => row['Code Fournisseur'] || row['Code article'])
    .map(row => {
      const qty_contracted_uvc = parseNumber(row['Quantite contractee UVC']);
      const qty_contracted_kg = parseNumber(row['Quantite contractee KG']);
      const qty_ordered_uvc = parseNumber(row['Quantite commandee UVC']);
      const qty_received_uvc = parseNumber(row['Quantite receptionnee UVC']);
      const qty_in_transit_uvc = parseNumber(row['Quantite en transit UVC']);

      const qty_remaining_uvc = qty_contracted_uvc - qty_received_uvc;
      const conversionRate = qty_contracted_uvc > 0 ? qty_contracted_kg / qty_contracted_uvc : 0;
      const qty_remaining_kg = qty_remaining_uvc * conversionRate;
      const qty_in_transit_kg = qty_in_transit_uvc * conversionRate;

      const date_end = parseDate(row['Date fin']);

      return {
        supplier_code: row['Code Fournisseur'] || '',
        supplier_name: row['Raison sociale fournisseur'] || 'Fournisseur inconnu',
        sku: row['Code article'] || '',
        supplier_sku: row['Code article fournisseur'] || '',
        article_name: row['Libelle article'] || '',
        price_buy: parseNumber(row['Prix achat']),
        date_start: parseDate(row['Date debut']),
        date_end,
        qty_contracted_uvc,
        qty_contracted_kg,
        qty_ordered_uvc,
        qty_received_uvc,
        qty_in_transit_uvc,
        qty_remaining_uvc,
        qty_remaining_kg,
        qty_in_transit_kg,
        status: calculateStatus(date_end, qty_remaining_uvc)
      };
    });
}

export async function fetchClientContracts(): Promise<ClientContract[]> {
  const rows = await fetchSheetData('contrats_clients');
  const rawData = rowsToObjects(rows);

  return rawData
    .filter(row => row['ID contrat'] || row['Code article'])
    .map(row => {
      const qty_contracted_uvc = parseNumber(row['Quantite contractee UVC']);
      const qty_contracted_kg = parseNumber(row['Quantite contractee KG']);
      const qty_purchased_uvc = parseNumber(row['Quantite achetee UVC']);
      const qty_purchased_kg = parseNumber(row['Quantite achetee KG']);

      const qty_remaining_uvc = qty_contracted_uvc - qty_purchased_uvc;
      const qty_remaining_kg = qty_contracted_kg - qty_purchased_kg;

      const date_end = parseDate(row['Date fin']);

      return {
        contract_id: row['ID contrat'] || crypto.randomUUID(),
        client_code: row['Code client'] || '',
        client_name: row['Nom client'] || 'Client inconnu',
        sku: row['Code article'] || '',
        article_name: row['Libelle article'] || '',
        date_start: parseDate(row['Date debut']),
        date_end,
        price_sell: parseNumber(row['Prix vente']),
        qty_contracted_uvc,
        qty_contracted_kg,
        qty_purchased_uvc,
        qty_purchased_kg,
        qty_remaining_uvc,
        qty_remaining_kg,
        status: calculateStatus(date_end, qty_remaining_uvc)
      };
    });
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
