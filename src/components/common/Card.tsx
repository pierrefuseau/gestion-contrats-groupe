import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-slate-200 shadow-sm',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between', className)}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'danger' | 'warning' | 'success';
  className?: string;
}

export function KPICard({
  label,
  value,
  subValue,
  icon,
  trend,
  variant = 'default',
  className
}: KPICardProps) {
  const variantStyles = {
    default: 'bg-white',
    danger: 'bg-rose-50 border-rose-200',
    warning: 'bg-amber-50 border-amber-200',
    success: 'bg-emerald-50 border-emerald-200'
  };

  const valueStyles = {
    default: 'text-slate-900',
    danger: 'text-rose-700',
    warning: 'text-amber-700',
    success: 'text-emerald-700'
  };

  return (
    <div
      className={clsx(
        'rounded-lg border p-4 shadow-sm',
        variantStyles[variant],
        variant === 'default' ? 'border-slate-200' : '',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={clsx('text-3xl font-bold', valueStyles[variant])}>
          {value}
        </span>
        {trend && (
          <span
            className={clsx(
              'text-sm font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {subValue && (
        <p className="mt-1 text-sm text-slate-500">{subValue}</p>
      )}
    </div>
  );
}

interface RiskCardProps {
  sku: string;
  name: string;
  position: number;
  urgency: 'CRITIQUE' | 'ATTENTION' | 'SURVEILLANCE' | 'OK';
  daysToDelivery: number | null;
  onClick?: () => void;
  className?: string;
}

export function RiskCard({
  sku,
  name,
  position,
  urgency,
  daysToDelivery,
  onClick,
  className
}: RiskCardProps) {
  const urgencyStyles = {
    CRITIQUE: 'border-rose-300 bg-rose-50',
    ATTENTION: 'border-amber-300 bg-amber-50',
    SURVEILLANCE: 'border-blue-300 bg-blue-50',
    OK: 'border-slate-200 bg-white'
  };

  const urgencyIndicator = {
    CRITIQUE: 'bg-rose-500',
    ATTENTION: 'bg-amber-500',
    SURVEILLANCE: 'bg-blue-500',
    OK: 'bg-slate-400'
  };

  const formattedPosition = position < 0
    ? `-${(Math.abs(position) / 1000).toFixed(1)} T`
    : `+${(position / 1000).toFixed(1)} T`;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left rounded-lg border-2 p-4 transition-all hover:shadow-md cursor-pointer',
        urgencyStyles[urgency],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'w-3 h-3 rounded-full mt-1 shrink-0',
            urgencyIndicator[urgency],
            urgency === 'CRITIQUE' && 'animate-pulse'
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'px-1.5 py-0.5 text-xs font-bold rounded',
                urgency === 'CRITIQUE' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
              )}
            >
              {urgency}
            </span>
          </div>
          <h4 className="mt-1.5 font-semibold text-slate-900 truncate">{name}</h4>
          <p className="text-xs text-slate-500">{sku}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">{formattedPosition}</span>
            {daysToDelivery !== null && (
              <span className="text-xs text-slate-500">
                Livraison: {daysToDelivery}j
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
