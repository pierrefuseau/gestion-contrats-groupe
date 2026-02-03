import type { Article, SupplierContract, ClientContract, PositionSummary, Partner } from '../types';

export function calculatePosition(
  article: Article,
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): PositionSummary {
  const activeSupplier = supplierContracts.filter(c => c.status === 'active');
  const activeClient = clientContracts.filter(c => c.status === 'active');

  const supply_remaining_kg = activeSupplier.reduce((sum, c) => sum + c.qty_remaining_kg, 0);
  const supply_remaining_uvc = activeSupplier.reduce((sum, c) => sum + c.qty_remaining_uvc, 0);
  const supply_in_transit_kg = activeSupplier.reduce((sum, c) => sum + c.qty_in_transit_kg, 0);
  const supply_in_transit_uvc = activeSupplier.reduce((sum, c) => sum + c.qty_in_transit_uvc, 0);

  const demand_remaining_kg = activeClient.reduce((sum, c) => sum + c.qty_remaining_kg, 0);
  const demand_remaining_uvc = activeClient.reduce((sum, c) => sum + c.qty_remaining_uvc, 0);

  const total_available_kg = article.stock_kg + supply_remaining_kg + supply_in_transit_kg;
  const total_available_uvc = article.stock_uvc + supply_remaining_uvc + supply_in_transit_uvc;

  const net_position_kg = total_available_kg - demand_remaining_kg;
  const net_position_uvc = total_available_uvc - demand_remaining_uvc;

  let status: 'LONG' | 'SHORT' | 'CRITICAL';
  if (net_position_kg < -1000) {
    status = 'CRITICAL';
  } else if (net_position_kg < 0) {
    status = 'SHORT';
  } else {
    status = 'LONG';
  }

  const totalBuyValue = activeSupplier.reduce((sum, c) => sum + (c.price_buy * c.qty_contracted_kg), 0);
  const totalBuyQty = activeSupplier.reduce((sum, c) => sum + c.qty_contracted_kg, 0);
  const avg_buy_price = totalBuyQty > 0 ? totalBuyValue / totalBuyQty : 0;

  const totalSellValue = activeClient.reduce((sum, c) => sum + (c.price_sell * c.qty_contracted_kg), 0);
  const totalSellQty = activeClient.reduce((sum, c) => sum + c.qty_contracted_kg, 0);
  const avg_sell_price = totalSellQty > 0 ? totalSellValue / totalSellQty : 0;

  const margin_percent = avg_buy_price > 0
    ? ((avg_sell_price - avg_buy_price) / avg_buy_price) * 100
    : 0;

  return {
    sku: article.sku,
    article_name: article.name,
    stock_kg: article.stock_kg,
    stock_uvc: article.stock_uvc,
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
    supplier_contracts: activeSupplier.length,
    client_contracts: activeClient.length,
    avg_buy_price,
    avg_sell_price,
    margin_percent
  };
}

export function calculateAllPositions(
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): PositionSummary[] {
  return articles.map(article => {
    const skuLower = article.sku.toLowerCase();
    const supplierForArticle = supplierContracts.filter(c => c.sku.toLowerCase() === skuLower);
    const clientForArticle = clientContracts.filter(c => c.sku.toLowerCase() === skuLower);
    return calculatePosition(article, supplierForArticle, clientForArticle);
  });
}

export function simulateNewClientContract(
  currentPosition: PositionSummary,
  newContractKg: number
): {
  current: number;
  after: number;
  statusBefore: string;
  statusAfter: string;
  warning: string | null;
} {
  const after = currentPosition.net_position_kg - newContractKg;

  let statusAfter: 'LONG' | 'SHORT' | 'CRITICAL';
  if (after < -1000) {
    statusAfter = 'CRITICAL';
  } else if (after < 0) {
    statusAfter = 'SHORT';
  } else {
    statusAfter = 'LONG';
  }

  const warning = statusAfter !== 'LONG' && currentPosition.status === 'LONG'
    ? `Ce contrat creerait un deficit de ${Math.abs(after).toFixed(0)} kg`
    : null;

  return {
    current: currentPosition.net_position_kg,
    after,
    statusBefore: currentPosition.status,
    statusAfter,
    warning
  };
}

export function getPartners(
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): Partner[] {
  const suppliers = new Map<string, Partner>();
  const clients = new Map<string, Partner>();

  supplierContracts.forEach(c => {
    const existing = suppliers.get(c.supplier_code);
    if (existing) {
      existing.contracts_count++;
      existing.total_volume_kg += c.qty_contracted_kg;
    } else {
      suppliers.set(c.supplier_code, {
        code: c.supplier_code,
        name: c.supplier_name,
        type: 'supplier',
        contracts_count: 1,
        total_volume_kg: c.qty_contracted_kg
      });
    }
  });

  clientContracts.forEach(c => {
    const existing = clients.get(c.client_code);
    if (existing) {
      existing.contracts_count++;
      existing.total_volume_kg += c.qty_contracted_kg;
    } else {
      clients.set(c.client_code, {
        code: c.client_code,
        name: c.client_name,
        type: 'client',
        contracts_count: 1,
        total_volume_kg: c.qty_contracted_kg
      });
    }
  });

  return [...suppliers.values(), ...clients.values()];
}

export function getMarginPercentage(buyPrice: number, sellPrice: number): number {
  if (buyPrice === 0) return 0;
  return ((sellPrice - buyPrice) / buyPrice) * 100;
}
