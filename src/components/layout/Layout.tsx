import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { useData } from '../../contexts/DataContext';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { ErrorPage } from '../common/ErrorDisplay';

export function Layout() {
  const { isLoading, error, articles, forceRefresh } = useData();

  if (error && articles.length === 0) {
    return <ErrorPage error={error} onRetry={forceRefresh} isRetrying={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {isLoading && articles.length === 0 && <LoadingOverlay />}
      <TopBar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
