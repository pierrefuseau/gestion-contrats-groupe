import type { Article, SupplierContract, ClientContract, PositionSummary, Partner } from '../types';

export interface DataIndexes {
  articlesBySku: Map<string, Article>;
  supplierContractsBySku: Map<string, SupplierContract[]>;
  clientContractsBySku: Map<string, ClientContract[]>;
  positionsBySku: Map<string, PositionSummary>;
  partnersByCode: Map<string, Partner>;
}

export function buildContractIndexes(
  supplierContracts: SupplierContract[],
  clientContracts: ClientContract[]
): {
  supplierContractsBySku: Map<string, SupplierContract[]>;
  clientContractsBySku: Map<string, ClientContract[]>;
} {
  const supplierContractsBySku = new Map<string, SupplierContract[]>();
  const clientContractsBySku = new Map<string, ClientContract[]>();

  for (const contract of supplierContracts) {
    const key = contract.sku.toLowerCase();
    const existing = supplierContractsBySku.get(key);
    if (existing) {
      existing.push(contract);
    } else {
      supplierContractsBySku.set(key, [contract]);
    }
  }

  for (const contract of clientContracts) {
    const key = contract.sku.toLowerCase();
    const existing = clientContractsBySku.get(key);
    if (existing) {
      existing.push(contract);
    } else {
      clientContractsBySku.set(key, [contract]);
    }
  }

  return { supplierContractsBySku, clientContractsBySku };
}

export function buildArticleIndex(articles: Article[]): Map<string, Article> {
  const index = new Map<string, Article>();
  for (const article of articles) {
    index.set(article.sku.toLowerCase(), article);
  }
  return index;
}

export function buildPositionIndex(positions: PositionSummary[]): Map<string, PositionSummary> {
  const index = new Map<string, PositionSummary>();
  for (const position of positions) {
    index.set(position.sku.toLowerCase(), position);
  }
  return index;
}

export function buildPartnerIndex(partners: Partner[]): Map<string, Partner> {
  const index = new Map<string, Partner>();
  for (const partner of partners) {
    index.set(partner.code, partner);
  }
  return index;
}
