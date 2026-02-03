import Fuse, { type IFuseOptions } from 'fuse.js';
import { getAllData } from './supabaseDataService';
import type { Article, SupplierContract, ClientContract } from '../types';

export interface SearchResult {
  type: 'supplier' | 'client' | 'product';
  id: string;
  primaryText: string;
  secondaryText: string;
  code: string;
  data: { code: string; name: string } | Article;
}

interface UniqueEntity {
  code: string;
  name: string;
}

let fuseSuppliers: Fuse<UniqueEntity> | null = null;
let fuseClients: Fuse<UniqueEntity> | null = null;
let fuseProducts: Fuse<Article> | null = null;

let uniqueSuppliers: Map<string, UniqueEntity> = new Map();
let uniqueClients: Map<string, UniqueEntity> = new Map();
let allArticles: Article[] = [];

const FUSE_OPTIONS_ENTITIES: IFuseOptions<UniqueEntity> = {
  keys: ['name', 'code'],
  threshold: 0.3,
  distance: 100,
  minMatchCharLength: 2,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true,
};

const FUSE_OPTIONS_PRODUCTS: IFuseOptions<Article> = {
  keys: ['name', 'sku'],
  threshold: 0.3,
  distance: 100,
  minMatchCharLength: 2,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true,
};

export async function refreshSearchIndexes(): Promise<void> {
  console.log('Construction des index de recherche...');
  const startTime = performance.now();

  const { articles, supplierContracts, clientContracts } = await getAllData();

  uniqueSuppliers.clear();
  supplierContracts.forEach(c => {
    if (!uniqueSuppliers.has(c.supplier_code)) {
      uniqueSuppliers.set(c.supplier_code, {
        code: c.supplier_code,
        name: c.supplier_name
      });
    }
  });

  uniqueClients.clear();
  clientContracts.forEach(c => {
    if (!uniqueClients.has(c.client_code)) {
      uniqueClients.set(c.client_code, {
        code: c.client_code,
        name: c.client_name
      });
    }
  });

  allArticles = articles;

  fuseSuppliers = new Fuse(Array.from(uniqueSuppliers.values()), FUSE_OPTIONS_ENTITIES);
  fuseClients = new Fuse(Array.from(uniqueClients.values()), FUSE_OPTIONS_ENTITIES);
  fuseProducts = new Fuse(allArticles, FUSE_OPTIONS_PRODUCTS);

  const endTime = performance.now();
  console.log(`Index crees en ${(endTime - startTime).toFixed(1)}ms:`, {
    suppliers: uniqueSuppliers.size,
    clients: uniqueClients.size,
    products: allArticles.length
  });
}

export function buildSearchIndexesFromData(
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): void {
  console.log('Construction des index de recherche depuis les donnees...');
  const startTime = performance.now();

  uniqueSuppliers.clear();
  supplierContracts.forEach(c => {
    if (!uniqueSuppliers.has(c.supplier_code)) {
      uniqueSuppliers.set(c.supplier_code, {
        code: c.supplier_code,
        name: c.supplier_name
      });
    }
  });

  uniqueClients.clear();
  clientContracts.forEach(c => {
    if (!uniqueClients.has(c.client_code)) {
      uniqueClients.set(c.client_code, {
        code: c.client_code,
        name: c.client_name
      });
    }
  });

  allArticles = articles;

  fuseSuppliers = new Fuse(Array.from(uniqueSuppliers.values()), FUSE_OPTIONS_ENTITIES);
  fuseClients = new Fuse(Array.from(uniqueClients.values()), FUSE_OPTIONS_ENTITIES);
  fuseProducts = new Fuse(allArticles, FUSE_OPTIONS_PRODUCTS);

  const endTime = performance.now();
  console.log(`Index crees en ${(endTime - startTime).toFixed(1)}ms:`, {
    suppliers: uniqueSuppliers.size,
    clients: uniqueClients.size,
    products: allArticles.length
  });
}

function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} T`;
  return `${Math.round(kg)} kg`;
}

export function globalSearch(query: string, maxResults: number = 15): SearchResult[] {
  if (!query || query.length < 2) return [];
  if (!fuseSuppliers || !fuseClients || !fuseProducts) {
    console.warn('Index de recherche non initialises');
    return [];
  }

  const startTime = performance.now();
  const results: SearchResult[] = [];
  const perCategory = Math.ceil(maxResults / 3);

  const supplierResults = fuseSuppliers.search(query, { limit: perCategory });
  supplierResults.forEach(r => {
    results.push({
      type: 'supplier',
      id: r.item.code,
      primaryText: r.item.name,
      secondaryText: `Code: ${r.item.code}`,
      code: r.item.code,
      data: r.item
    });
  });

  const clientResults = fuseClients.search(query, { limit: perCategory });
  clientResults.forEach(r => {
    results.push({
      type: 'client',
      id: r.item.code,
      primaryText: r.item.name,
      secondaryText: `Code: ${r.item.code}`,
      code: r.item.code,
      data: r.item
    });
  });

  const productResults = fuseProducts.search(query, { limit: perCategory });
  productResults.forEach(r => {
    results.push({
      type: 'product',
      id: r.item.sku,
      primaryText: r.item.name,
      secondaryText: `SKU: ${r.item.sku} - Stock: ${formatWeight(r.item.stock_kg)}`,
      code: r.item.sku,
      data: r.item
    });
  });

  const endTime = performance.now();
  console.log(`Recherche "${query}" en ${(endTime - startTime).toFixed(1)}ms -> ${results.length} resultats`);

  return results;
}

export function searchSuppliers(query: string, limit: number = 20): UniqueEntity[] {
  if (!query || !fuseSuppliers) return Array.from(uniqueSuppliers.values());
  return fuseSuppliers.search(query, { limit }).map(r => r.item);
}

export function searchClients(query: string, limit: number = 20): UniqueEntity[] {
  if (!query || !fuseClients) return Array.from(uniqueClients.values());
  return fuseClients.search(query, { limit }).map(r => r.item);
}

export function searchProducts(query: string, limit: number = 50): Article[] {
  if (!query || !fuseProducts) return allArticles;
  return fuseProducts.search(query, { limit }).map(r => r.item);
}

export function getAllSuppliers(): UniqueEntity[] {
  return Array.from(uniqueSuppliers.values());
}

export function getAllClients(): UniqueEntity[] {
  return Array.from(uniqueClients.values());
}

export function getAllArticles(): Article[] {
  return allArticles;
}
