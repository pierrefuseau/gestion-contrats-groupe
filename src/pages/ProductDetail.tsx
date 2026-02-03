import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, Plus } from 'lucide-react';
import { Card } from '../components/common';
import { Button } from '../components/common/Button';
import { PositionBreakdown, SupplierContractsTable, ClientContractsTable } from '../components/product';
import { useData } from '../contexts/DataContext';
import { formatWeight, formatPrice, formatPercent, getStatusColors, getStatusLabel } from '../utils/formatters';

export function ProductDetail() {
  const { sku } = useParams<{ sku: string }>();
  const navigate = useNavigate();
  const { getPositionBySku, getSupplierContractsBySku, getClientContractsBySku } = useData();

  const position = getPositionBySku(sku || '');
  const supplierContracts = getSupplierContractsBySku(sku || '');
  const clientContracts = getClientContractsBySku(sku || '');

  if (!position) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-slate-300" />
          <p className="mt-4 text-slate-500">Produit non trouve</p>
          <Button
            variant="secondary"
            onClick={() => navigate('/products')}
            className="mt-4"
          >
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  const colors = getStatusColors(position.status);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {position.article_name}
          </h1>
          <span className="font-mono text-sm text-slate-500">{position.sku}</span>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
          {getStatusLabel(position.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-slate-500">Stock</p>
          <p className="text-xl font-bold text-slate-900">{formatWeight(position.stock_kg)}</p>
          <p className="text-xs text-slate-400">{position.stock_uvc.toLocaleString('fr-FR')} UVC</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-slate-500">Position Nette</p>
          <p className={`text-xl font-bold ${colors.text}`}>
            {position.net_position_kg >= 0 ? '+' : ''}{formatWeight(position.net_position_kg)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-slate-500">A recevoir</p>
          <p className="text-xl font-bold text-emerald-600">+{formatWeight(position.supply_remaining_kg)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-slate-500">A livrer</p>
          <p className="text-xl font-bold text-rose-600">-{formatWeight(position.demand_remaining_kg)}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Decomposition de la Position</h3>
        <PositionBreakdown position={position} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="none">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              Contrats Fournisseurs ({supplierContracts.filter(c => c.qty_remaining_kg > 0 || c.qty_remaining_uvc > 0).length})
            </h3>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate(`/contracts/new?type=supplier&sku=${encodeURIComponent(sku || '')}`)}
            >
              Nouveau
            </Button>
          </div>
          <div className="p-4">
            <SupplierContractsTable contracts={supplierContracts.filter(c => c.qty_remaining_kg > 0 || c.qty_remaining_uvc > 0)} />
          </div>
        </Card>

        <Card padding="none">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-rose-600" />
              Contrats Clients ({clientContracts.filter(c => c.qty_remaining_kg > 0 || c.qty_remaining_uvc > 0).length})
            </h3>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate(`/contracts/new?type=client&sku=${encodeURIComponent(sku || '')}`)}
            >
              Nouveau
            </Button>
          </div>
          <div className="p-4">
            <ClientContractsTable contracts={clientContracts.filter(c => c.qty_remaining_kg > 0 || c.qty_remaining_uvc > 0)} />
          </div>
        </Card>
      </div>

      <Card className="bg-slate-900 text-white">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-sm text-slate-400">PMP Achat</p>
            <p className="text-xl font-bold">{formatPrice(position.avg_buy_price)}/kg</p>
          </div>
          <div className="h-12 w-px bg-slate-700" />
          <div>
            <p className="text-sm text-slate-400">PMP Vente</p>
            <p className="text-xl font-bold">{formatPrice(position.avg_sell_price)}/kg</p>
          </div>
          <div className="h-12 w-px bg-slate-700" />
          <div>
            <p className="text-sm text-slate-400">Marge</p>
            <p className={`text-xl font-bold ${position.margin_percent > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatPercent(position.margin_percent)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
