import { useMemo } from 'react';
import type { Article, SupplierContract, ClientContract, PositionSummary } from '../types';
import { calculatePosition, calculateAllPositions } from '../utils/calculations';

export function usePositions(
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
) {
  const positions = useMemo(
    () => calculateAllPositions(articles, supplierContracts, clientContracts),
    [articles, supplierContracts, clientContracts]
  );

  const stats = useMemo(() => {
    const shortPositions = positions.filter(p => p.status === 'SHORT');
    const criticalPositions = positions.filter(p => p.status === 'CRITICAL');
    const activeSupplierContracts = supplierContracts.filter(c => c.status === 'active');
    const activeClientContracts = clientContracts.filter(c => c.status === 'active');

    const totalCommittedValue = positions.reduce((sum, p) => {
      return sum + Math.abs(p.net_position_kg * (p.avg_sell_price || p.avg_buy_price || 0));
    }, 0);

    const avgMargin = positions.length > 0
      ? positions.reduce((sum, p) => sum + (p.margin_percent || 0), 0) / positions.length
      : 0;

    return {
      totalProducts: positions.length,
      shortCount: shortPositions.length,
      criticalCount: criticalPositions.length,
      activeContracts: activeSupplierContracts.length + activeClientContracts.length,
      totalCommittedValue,
      averageMargin: avgMargin
    };
  }, [positions, supplierContracts, clientContracts]);

  return {
    positions,
    stats
  };
}

export function usePositionBySku(
  sku: string,
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): PositionSummary | null {
  return useMemo(() => {
    const skuLower = sku.toLowerCase();
    const article = articles.find(a => a.sku.toLowerCase() === skuLower);
    if (!article) return null;

    const articleSupplierContracts = supplierContracts.filter(c => c.sku.toLowerCase() === skuLower);
    const articleClientContracts = clientContracts.filter(c => c.sku.toLowerCase() === skuLower);

    return calculatePosition(article, articleSupplierContracts, articleClientContracts);
  }, [sku, articles, supplierContracts, clientContracts]);
}
