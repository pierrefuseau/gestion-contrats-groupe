import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const variantClasses = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  info: 'bg-blue-100 text-blue-800',
  muted: 'bg-slate-200 text-slate-600'
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs'
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  pulse = false,
  className
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-md',
        variantClasses[variant],
        sizeClasses[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'LONG' | 'SHORT' | 'CRITICAL';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const labels = {
    LONG: 'EXCÉDENT',
    SHORT: 'DÉFICIT',
    CRITICAL: 'CRITIQUE'
  };

  const variants: Record<string, BadgeProps['variant']> = {
    LONG: 'success',
    SHORT: 'warning',
    CRITICAL: 'danger'
  };

  return (
    <Badge
      variant={variants[status]}
      pulse={status === 'CRITICAL'}
      className={className}
    >
      {labels[status]}
    </Badge>
  );
}

interface UrgencyBadgeProps {
  urgency: 'CRITIQUE' | 'ATTENTION' | 'SURVEILLANCE' | 'OK';
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const classes = {
    CRITIQUE: 'bg-rose-600 text-white animate-pulse',
    ATTENTION: 'bg-amber-500 text-white',
    SURVEILLANCE: 'bg-blue-500 text-white',
    OK: 'bg-slate-200 text-slate-600'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md',
        classes[urgency],
        className
      )}
    >
      {urgency}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: 'A' | 'B' | 'C';
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const classes = {
    A: 'bg-rose-100 text-rose-700 border border-rose-200',
    B: 'bg-amber-100 text-amber-700 border border-amber-200',
    C: 'bg-slate-100 text-slate-600 border border-slate-200'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded',
        classes[priority],
        className
      )}
    >
      {priority}
    </span>
  );
}

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600',
        className
      )}
    >
      {category}
    </span>
  );
}
