import { clsx } from 'clsx';
import { formatWeight } from '../../utils/formatters';

interface WeightDisplayProps {
  kg: number;
  units?: number;
  unitType?: string;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WeightDisplay({
  kg,
  units,
  unitType,
  showSign = false,
  size = 'md',
  className
}: WeightDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const formatted = formatWeight(kg);
  const sign = showSign && kg > 0 ? '+' : '';

  const pluralizeUnit = (unit: string, count: number): string => {
    const plurals: Record<string, string> = {
      camion: 'camions',
      palette: 'palettes',
      conteneur: 'conteneurs',
      cuve: 'cuves',
      carton: 'cartons'
    };
    return count > 1 ? plurals[unit] || unit : unit;
  };

  return (
    <div className={clsx('flex flex-col', className)}>
      <span className={clsx('font-semibold text-slate-900', sizeClasses[size])}>
        {sign}{formatted}
      </span>
      {units !== undefined && unitType && (
        <span className="text-xs text-slate-500">
          ({units} {pluralizeUnit(unitType, units)})
        </span>
      )}
    </div>
  );
}

interface PositionDisplayProps {
  kg: number;
  status: 'LONG' | 'SHORT' | 'CRITICAL';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PositionDisplay({
  kg,
  status,
  size = 'md',
  className
}: PositionDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const statusColors = {
    LONG: 'text-emerald-700',
    SHORT: 'text-amber-700',
    CRITICAL: 'text-rose-700'
  };

  const sign = kg >= 0 ? '+' : '';
  const formatted = formatWeight(kg);

  return (
    <span
      className={clsx(
        'font-bold',
        sizeClasses[size],
        statusColors[status],
        className
      )}
    >
      {sign}{formatted}
    </span>
  );
}

interface PositionGaugeProps {
  available: number;
  committed: number;
  netPosition: number;
  status: 'LONG' | 'SHORT' | 'CRITICAL';
  className?: string;
}

export function PositionGauge({
  available,
  committed,
  netPosition,
  status,
  className
}: PositionGaugeProps) {
  const total = Math.max(available, committed);
  const availablePct = total > 0 ? (available / total) * 100 : 50;
  const committedPct = total > 0 ? (committed / total) * 100 : 50;

  const statusColors = {
    LONG: { bar: 'bg-emerald-500', text: 'text-emerald-700' },
    SHORT: { bar: 'bg-amber-500', text: 'text-amber-700' },
    CRITICAL: { bar: 'bg-rose-500', text: 'text-rose-700' }
  };

  const statusLabels = {
    LONG: 'EXCÉDENT',
    SHORT: 'DÉFICIT',
    CRITICAL: 'CRITIQUE'
  };

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-slate-500">DISPONIBLE</span>
          <p className="text-lg font-bold text-slate-900">{formatWeight(available)}</p>
        </div>
        <div className="text-right">
          <span className="text-slate-500">ENGAGÉ</span>
          <p className="text-lg font-bold text-slate-900">{formatWeight(committed)}</p>
        </div>
      </div>

      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-emerald-400 transition-all"
          style={{ width: `${Math.min(availablePct, 100)}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-rose-400 transition-all"
          style={{ width: `${Math.min(committedPct, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="text-sm text-slate-500">POSITION NETTE:</span>
        <span className={clsx('text-xl font-bold', statusColors[status].text)}>
          {netPosition >= 0 ? '+' : ''}{formatWeight(netPosition)}
        </span>
        <span
          className={clsx(
            'px-2 py-0.5 text-xs font-bold rounded text-white',
            statusColors[status].bar
          )}
        >
          {statusLabels[status]}
        </span>
      </div>
    </div>
  );
}
