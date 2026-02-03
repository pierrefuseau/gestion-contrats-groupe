import type { Article, SupplierContract, ClientContract, Partner, PositionSummary } from '../types';

interface JsonSupplier {
  code: string;
  name: string;
  activeContracts: number;
  totalEngagedKg: number;
  totalEngagedValue: number;
}

interface JsonClient {
  code: string;
  name: string;
  activeContracts: number;
  totalEngagedKg: number;
  totalEngagedValue: number;
}

interface JsonProduct {
  sku: string;
  name: string;
  stockUvc: number;
  stockKg: number;
  supplierContractsCount: number;
  clientContractsCount: number;
  supplierEngagedKg: number;
  clientEngagedKg: number;
  netPositionKg: number;
  positionStatus: 'LONG' | 'SHORT' | 'CRITICAL';
}

interface JsonSupplierContract {
  id: string;
  supplierCode: string;
  supplierName: string;
  sku: string;
  supplierSku: string;
  articleName: string;
  priceBuy: number;
  priceUnit: string;
  dateStart: string;
  dateEnd: string;
  qtyContractedUvc: number;
  qtyContractedKg: number;
  qtyOrderedUvc: number;
  qtyReceivedUvc: number;
  qtyReceivedKg: number;
  qtyInTransitUvc: number;
  qtyRemainingKg: number;
  qtyRemainingUvc: number;
  qtyInTransitKg: number;
  status: 'active' | 'completed';
}

interface JsonClientContract {
  id: string;
  clientCode: string;
  clientName: string;
  sku: string;
  articleName: string;
  dateStart: string;
  dateEnd: string;
  priceSell: number;
  priceUnit: string;
  qtyContractedUvc: number;
  qtyContractedKg: number;
  qtyDeliveredUvc: number;
  qtyDeliveredKg: number;
  qtyRemainingUvc: number;
  qtyRemainingKg: number;
  status: 'active' | 'completed';
}

interface JsonData {
  metadata: {
    generatedAt: string;
    version: string;
    counts: {
      suppliers: number;
      clients: number;
      products: number;
      supplierContracts: number;
      clientContracts: number;
    };
  };
  suppliers: JsonSupplier[];
  clients: JsonClient[];
  products: JsonProduct[];
  supplierContracts: JsonSupplierContract[];
  clientContracts: JsonClientContract[];
  indexes: {
    suppliersByCode: Record<string, number>;
    clientsByCode: Record<string, number>;
    productsBySku: Record<string, number>;
    contractsBySupplier: Record<string, number[]>;
    contractsByClient: Record<string, number[]>;
    contractsByProduct: Record<string, { supplier: number[]; client: number[] }>;
  };
}

interface LoadedData {
  articles: Article[];
  supplierContracts: SupplierContract[];
  clientContracts: ClientContract[];
  suppliers: Partner[];
  clients: Partner[];
  positions: PositionSummary[];
  metadata: JsonData['metadata'];
  indexes: {
    articlesBySku: Map<string, Article>;
    supplierContractsBySku: Map<string, SupplierContract[]>;
    clientContractsBySku: Map<string, ClientContract[]>;
    supplierContractsByCode: Map<string, SupplierContract[]>;
    clientContractsByCode: Map<string, ClientContract[]>;
    partnersByCode: Map<string, Partner>;
    positionsBySku: Map<string, PositionSummary>;
  };
}

let cachedData: LoadedData | null = null;

function convertSupplierContract(json: JsonSupplierContract): SupplierContract {
  const conversionFactor = json.qtyContractedUvc > 0 ? json.qtyContractedKg / json.qtyContractedUvc : 0;
  return {
    supplier_code: json.supplierCode,
    supplier_name: json.supplierName,
    sku: json.sku,
    supplier_sku: json.supplierSku || '',
    article_name: json.articleName,
    price_buy: json.priceBuy,
    price_unit: json.priceUnit || 'KG',
    date_start: json.dateStart,
    date_end: json.dateEnd,
    qty_contracted_uvc: json.qtyContractedUvc || 0,
    qty_contracted_kg: json.qtyContractedKg,
    qty_ordered_uvc: json.qtyOrderedUvc || 0,
    qty_received_uvc: json.qtyReceivedUvc || 0,
    qty_in_transit_uvc: json.qtyInTransitUvc || 0,
    qty_remaining_uvc: json.qtyRemainingUvc || Math.round(Math.max(0, (json.qtyContractedUvc || 0) - (json.qtyOrderedUvc || 0))),
    qty_remaining_kg: json.qtyRemainingKg,
    qty_in_transit_kg: json.qtyInTransitKg || (json.qtyInTransitUvc || 0) * conversionFactor,
    status: json.status
  };
}

function convertClientContract(json: JsonClientContract): ClientContract {
  return {
    contract_id: json.id,
    client_code: json.clientCode,
    client_name: json.clientName,
    sku: json.sku,
    article_name: json.articleName,
    date_start: json.dateStart,
    date_end: json.dateEnd,
    price_sell: json.priceSell,
    qty_contracted_uvc: json.qtyContractedUvc || 0,
    qty_contracted_kg: json.qtyContractedKg,
    qty_purchased_uvc: json.qtyDeliveredUvc || 0,
    qty_purchased_kg: json.qtyDeliveredKg || 0,
    qty_remaining_uvc: json.qtyRemainingUvc || Math.round(Math.max(0, (json.qtyContractedUvc || 0) - (json.qtyDeliveredUvc || 0))),
    qty_remaining_kg: json.qtyRemainingKg,
    status: json.status
  };
}

function convertProduct(json: JsonProduct): Article {
  return {
    sku: json.sku,
    name: json.name,
    stock_uvc: json.stockUvc,
    stock_kg: json.stockKg
  };
}

function buildPositions(
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): PositionSummary[] {
  const skuSet = new Set<string>();
  articles.forEach(a => skuSet.add(a.sku));
  supplierContracts.forEach(c => skuSet.add(c.sku));
  clientContracts.forEach(c => skuSet.add(c.sku));

  const positions: PositionSummary[] = [];

  skuSet.forEach(sku => {
    const article = articles.find(a => a.sku === sku);
    const supContracts = supplierContracts.filter(c => c.sku === sku && c.status === 'active');
    const cliContracts = clientContracts.filter(c => c.sku === sku && c.status === 'active');

    const stock_kg = article?.stock_kg || 0;
    const stock_uvc = article?.stock_uvc || 0;
    const supply_remaining_kg = supContracts.reduce((sum, c) => sum + c.qty_remaining_kg, 0);
    const supply_remaining_uvc = supContracts.reduce((sum, c) => sum + c.qty_remaining_uvc, 0);
    const supply_in_transit_kg = supContracts.reduce((sum, c) => sum + c.qty_in_transit_kg, 0);
    const supply_in_transit_uvc = supContracts.reduce((sum, c) => sum + c.qty_in_transit_uvc, 0);
    const demand_remaining_kg = cliContracts.reduce((sum, c) => sum + c.qty_remaining_kg, 0);
    const demand_remaining_uvc = cliContracts.reduce((sum, c) => sum + c.qty_remaining_uvc, 0);
    const total_available_kg = stock_kg + supply_remaining_kg + supply_in_transit_kg;
    const net_position_kg = total_available_kg - demand_remaining_kg;
    const net_position_uvc = stock_uvc + supply_remaining_uvc + supply_in_transit_uvc - demand_remaining_uvc;

    let status: 'LONG' | 'SHORT' | 'CRITICAL' = 'LONG';
    if (net_position_kg < -100) {
      status = 'CRITICAL';
    } else if (net_position_kg < 0) {
      status = 'SHORT';
    }

    const totalBuyValue = supContracts.reduce((sum, c) => sum + (c.price_buy * c.qty_contracted_kg), 0);
    const totalBuyQty = supContracts.reduce((sum, c) => sum + c.qty_contracted_kg, 0);
    const avg_buy_price = totalBuyQty > 0 ? totalBuyValue / totalBuyQty : 0;

    const totalSellValue = cliContracts.reduce((sum, c) => sum + (c.price_sell * c.qty_contracted_kg), 0);
    const totalSellQty = cliContracts.reduce((sum, c) => sum + c.qty_contracted_kg, 0);
    const avg_sell_price = totalSellQty > 0 ? totalSellValue / totalSellQty : 0;

    const margin_percent = avg_buy_price > 0 ? ((avg_sell_price - avg_buy_price) / avg_buy_price) * 100 : 0;

    const articleName = article?.name || supContracts[0]?.article_name || cliContracts[0]?.article_name || sku;

    positions.push({
      sku,
      article_name: articleName,
      stock_kg,
      stock_uvc,
      supply_remaining_kg,
      supply_remaining_uvc,
      supply_in_transit_kg,
      supply_in_transit_uvc,
      demand_remaining_kg,
      demand_remaining_uvc,
      total_available_kg,
      net_position_kg,
      net_position_uvc,
      status,
      supplier_contracts: supContracts.length,
      client_contracts: cliContracts.length,
      avg_buy_price,
      avg_sell_price,
      margin_percent
    });
  });

  return positions.sort((a, b) => a.net_position_kg - b.net_position_kg);
}

function buildIndexes(
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[],
  suppliers: Partner[],
  clients: Partner[],
  positions: PositionSummary[]
): LoadedData['indexes'] {
  const articlesBySku = new Map<string, Article>();
  articles.forEach(a => articlesBySku.set(a.sku.toLowerCase(), a));

  const supplierContractsBySku = new Map<string, SupplierContract[]>();
  const supplierContractsByCode = new Map<string, SupplierContract[]>();
  supplierContracts.forEach(c => {
    const skuKey = c.sku.toLowerCase();
    if (!supplierContractsBySku.has(skuKey)) {
      supplierContractsBySku.set(skuKey, []);
    }
    supplierContractsBySku.get(skuKey)!.push(c);

    const codeKey = c.supplier_code;
    if (!supplierContractsByCode.has(codeKey)) {
      supplierContractsByCode.set(codeKey, []);
    }
    supplierContractsByCode.get(codeKey)!.push(c);
  });

  const clientContractsBySku = new Map<string, ClientContract[]>();
  const clientContractsByCode = new Map<string, ClientContract[]>();
  clientContracts.forEach(c => {
    const skuKey = c.sku.toLowerCase();
    if (!clientContractsBySku.has(skuKey)) {
      clientContractsBySku.set(skuKey, []);
    }
    clientContractsBySku.get(skuKey)!.push(c);

    const codeKey = c.client_code;
    if (!clientContractsByCode.has(codeKey)) {
      clientContractsByCode.set(codeKey, []);
    }
    clientContractsByCode.get(codeKey)!.push(c);
  });

  const partnersByCode = new Map<string, Partner>();
  suppliers.forEach(s => partnersByCode.set(s.code, s));
  clients.forEach(c => partnersByCode.set(c.code, c));

  const positionsBySku = new Map<string, PositionSummary>();
  positions.forEach(p => positionsBySku.set(p.sku.toLowerCase(), p));

  return {
    articlesBySku,
    supplierContractsBySku,
    clientContractsBySku,
    supplierContractsByCode,
    clientContractsByCode,
    partnersByCode,
    positionsBySku
  };
}

export async function loadStaticData(): Promise<LoadedData> {
  if (cachedData) {
    return cachedData;
  }

  const startTime = performance.now();

  const response = await fetch('/data.json');
  if (!response.ok) {
    throw new Error(`Impossible de charger les donnees: ${response.status}`);
  }

  const json: JsonData = await response.json();

  const articles = json.products.map(convertProduct);
  const supplierContracts = json.supplierContracts.map(convertSupplierContract);
  const clientContracts = json.clientContracts.map(convertClientContract);

  const suppliers: Partner[] = json.suppliers.map(s => ({
    code: s.code,
    name: s.name,
    type: 'supplier' as const,
    contracts_count: s.activeContracts,
    total_volume_kg: s.totalEngagedKg
  }));

  const clients: Partner[] = json.clients.map(c => ({
    code: c.code,
    name: c.name,
    type: 'client' as const,
    contracts_count: c.activeContracts,
    total_volume_kg: c.totalEngagedKg
  }));

  const positions = buildPositions(articles, supplierContracts, clientContracts);
  const indexes = buildIndexes(articles, supplierContracts, clientContracts, suppliers, clients, positions);

  cachedData = {
    articles,
    supplierContracts,
    clientContracts,
    suppliers,
    clients,
    positions,
    metadata: json.metadata,
    indexes
  };

  const loadTime = performance.now() - startTime;
  console.log(`Donnees chargees en ${loadTime.toFixed(0)}ms:`, json.metadata.counts);

  return cachedData;
}

export function getLoadedData(): LoadedData | null {
  return cachedData;
}

export function clearCache(): void {
  cachedData = null;
}
