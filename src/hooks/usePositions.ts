import { useMemo } from 'react';
import type { Article, SupplierContract, ClientContract, PositionSummary } from '../types';
import { calculateNetPosition, getRiskScores, getAverageMargin, getTotalCommittedValue } from '../utils/calculations';

export function usePositions(
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
) {
  const positions = useMemo(() => {
    return articles.map(article => {
      const articleSupplierContracts = supplierContracts.filter(
        c => c.sku === article.sku
      );
      const articleClientContracts = clientContracts.filter(
        c => c.sku === article.sku
      );

      return calculateNetPosition(
        article,
        articleSupplierContracts,
        articleClientContracts
      );
    });
  }, [articles, supplierContracts, clientContracts]);

  const stats = useMemo(() => {
    const shortPositions = positions.filter(p => p.status === 'SHORT');
    const criticalPositions = positions.filter(p => p.status === 'CRITICAL');
    const activeSupplierContracts = supplierContracts.filter(c => c.status === 'active');
    const activeClientContracts = clientContracts.filter(c => c.status === 'active');

    return {
      totalProducts: positions.length,
      shortCount: shortPositions.length,
      criticalCount: criticalPositions.length,
      activeContracts: activeSupplierContracts.length + activeClientContracts.length,
      totalCommittedValue: getTotalCommittedValue(positions),
      averageMargin: getAverageMargin(positions)
    };
  }, [positions, supplierContracts, clientContracts]);

  const riskScores = useMemo(() => getRiskScores(positions), [positions]);

  return {
    positions,
    stats,
    riskScores
  };
}

export function usePositionBySku(
  sku: string,
  articles: Article[],
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): PositionSummary | null {
  return useMemo(() => {
    const article = articles.find(a => a.sku === sku);
    if (!article) return null;

    const articleSupplierContracts = supplierContracts.filter(
      c => c.sku === sku
    );
    const articleClientContracts = clientContracts.filter(
      c => c.sku === sku
    );

    return calculateNetPosition(
      article,
      articleSupplierContracts,
      articleClientContracts
    );
  }, [sku, articles, supplierContracts, clientContracts]);
}
