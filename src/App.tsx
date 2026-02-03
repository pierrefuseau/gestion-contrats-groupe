import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { DataProvider } from './contexts/DataContext';
import {
  Dashboard,
  ProductList,
  ProductDetail,
  PartnerDetail,
  ContractForm,
  AlertsCenter
} from './pages';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:sku" element={<ProductDetail />} />
            <Route path="/partner/:id" element={<PartnerDetail />} />
            <Route path="/contracts/new" element={<ContractForm />} />
            <Route path="/alerts" element={<AlertsCenter />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
