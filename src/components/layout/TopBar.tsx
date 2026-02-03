import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  LayoutDashboard,
  Package,
  FileText,
  Calendar,
  Wheat,
  RefreshCw
} from 'lucide-react';
import { Omnisearch } from './Omnisearch';
import { AlertsDropdown } from './AlertsDropdown';
import { useData } from '../../contexts/DataContext';

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/products', label: 'Produits', icon: Package },
  { path: '/contracts/new', label: 'Nouveau contrat', icon: FileText },
  { path: '/timeline', label: 'Planning', icon: Calendar }
];

export function TopBar() {
  const location = useLocation();
  const { lastUpdated, isLoading, forceRefresh } = useData();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-slate-200">
      <div className="flex items-center h-full px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Wheat className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 hidden sm:block">
            AgriTrade
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <Omnisearch />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>
              MAJ: {lastUpdated ? format(lastUpdated, 'HH:mm', { locale: fr }) : '-'}
            </span>
            <button
              onClick={forceRefresh}
              disabled={isLoading}
              className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-colors"
              title="Actualiser les donnees"
            >
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          </div>
          <AlertsDropdown />
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-slate-600">DG</span>
          </div>
        </div>
      </div>
    </header>
  );
}
