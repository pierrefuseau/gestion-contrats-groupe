export function formatWeight(kg: number): string {
  if (Math.abs(kg) >= 1000) {
    return `${(kg / 1000).toFixed(2)} T`;
  }
  return `${Math.round(kg)} kg`;
}

export function formatWeightDual(kg: number, uvc: number): { primary: string; secondary: string } {
  return {
    primary: formatWeight(kg),
    secondary: `${uvc.toLocaleString('fr-FR')} UVC`
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

export function formatPricePerKg(price: number): string {
  return `${formatPrice(price)}/kg`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return '-';

  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function getStatusColors(status: 'LONG' | 'SHORT' | 'CRITICAL'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'LONG':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'SHORT':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'CRITICAL':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  }
}

export function getStatusLabel(status: 'LONG' | 'SHORT' | 'CRITICAL'): string {
  switch (status) {
    case 'LONG': return 'EXCEDENT';
    case 'SHORT': return 'DEFICIT';
    case 'CRITICAL': return 'CRITIQUE';
  }
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} M\u00A0EUR`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} k\u00A0EUR`;
  }
  return formatPrice(value);
}

export function formatRelativeDate(isoDate: string): string {
  if (!isoDate) return '-';

  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;

  return formatDate(isoDate);
}

const UNIT_MAP: Record<string, string> = {
  'kg': 'kg',
  'kilo': 'kg',
  'kilogramme': 'kg',
  'kilogrammes': 'kg',
  'uvc': 'pce',
  'unité': 'pce',
  'unite': 'pce',
  'pièce': 'pce',
  'piece': 'pce',
  'pièces': 'pce',
  'pieces': 'pce',
  'pce': 'pce',
  'l': 'L',
  'litre': 'L',
  'litres': 'L',
  't': 'T',
  'tonne': 'T',
  'tonnes': 'T',
  'carton': 'crt',
  'crt': 'crt',
  'palette': 'pal',
  'pal': 'pal',
};

export function normalizeUnit(unit: string): string {
  if (!unit) return 'kg';
  const unitLower = unit.toLowerCase().trim();
  return UNIT_MAP[unitLower] || unit;
}

export function formatPriceWithUnit(price: number, unit: string): string {
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(price);

  const normalizedUnit = normalizeUnit(unit);
  return `${formattedPrice}/${normalizedUnit}`;
}

export function isPriceByWeight(unit: string): boolean {
  if (!unit) return true;
  const unitLower = unit.toLowerCase().trim();
  return ['kg', 'kilo', 'kilogramme', 'kilogrammes', 't', 'tonne', 'tonnes'].includes(unitLower);
}

export function calculateTotalValue(
  price: number,
  unit: string,
  qtyKg: number,
  qtyUvc: number
): number {
  if (isPriceByWeight(unit)) {
    return price * qtyKg;
  }
  return price * qtyUvc;
}
