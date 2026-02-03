import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider, useData } from './contexts/DataContext';
import { Home } from './pages/Home';
import { SupplierList } from './pages/SupplierList';
import { SupplierDetail } from './pages/SupplierDetail';
import { ClientList } from './pages/ClientList';
import { ClientDetail } from './pages/ClientDetail';
import { ProductListNew } from './pages/ProductListNew';
import { ProductDetailNew } from './pages/ProductDetailNew';
import { SyncNotification } from './components/SyncNotification';

function AppContent() {
  const { syncError, dismissSyncError } = useData();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fournisseurs" element={<SupplierList />} />
        <Route path="/fournisseurs/:code" element={<SupplierDetail />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/:code" element={<ClientDetail />} />
        <Route path="/produits" element={<ProductListNew />} />
        <Route path="/produits/:sku" element={<ProductDetailNew />} />
      </Routes>
      <SyncNotification message={syncError} onDismiss={dismissSyncError} />
    </>
  );
}

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
