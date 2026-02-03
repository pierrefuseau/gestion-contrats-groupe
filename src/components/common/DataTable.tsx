import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
  getValue?: (item: T) => string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Aucune donnée',
  className,
  compact = false
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    if (sortKey === column.key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(column.key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    const column = columns.find(c => c.key === sortKey);
    if (!column?.getValue) return data;

    return [...data].sort((a, b) => {
      const aValue = column.getValue!(a);
      const bValue = column.getValue!(b);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [data, columns, sortKey, sortDirection]);

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable) return null;

    if (sortKey !== column.key) {
      return <ChevronsUpDown className="w-4 h-4 text-slate-400" />;
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-slate-700" />
    ) : (
      <ChevronDown className="w-4 h-4 text-slate-700" />
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map(column => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={clsx(
                  'text-left text-xs font-semibold text-slate-500 uppercase tracking-wider',
                  compact ? 'px-3 py-2' : 'px-4 py-3',
                  column.sortable && 'cursor-pointer select-none hover:text-slate-700'
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  <SortIcon column={column} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedData.map(item => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={clsx(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-slate-50'
              )}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={clsx(
                    'text-sm text-slate-900',
                    compact ? 'px-3 py-2' : 'px-4 py-3'
                  )}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  size = 'md',
  showLabel = true,
  className
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const getColor = () => {
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2'
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div
        className={clsx(
          'flex-1 bg-slate-100 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={clsx('h-full rounded-full transition-all', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 w-10 text-right">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
