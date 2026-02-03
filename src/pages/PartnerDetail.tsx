import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Building2, FileText } from 'lucide-react';
import { Card } from '../components/common';
import { Button } from '../components/common/Button';
import { useData } from '../contexts/DataContext';
import { formatWeight, formatPrice, formatDateRange, formatPercent } from '../utils/formatters';

export function PartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { partners, supplierContracts, clientContracts } = useData();

  const partner = partners.find(p => p.code === id);

  const partnerSupplierContracts = useMemo(
    () => (partner ? supplierContracts.filter(c => c.supplier_code === partner.code) : []),
    [partner, supplierContracts]
  );

  const partnerClientContracts = useMemo(
    () => (partner ? clientContracts.filter(c => c.client_code === partner.code) : []),
    [partner, clientContracts]
  );

  if (!partner) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-slate-300" />
          <p className="mt-4 text-slate-500">Partenaire non trouve</p>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const isSupplier = partner.type === 'supplier';
  const isClient = partner.type === 'client';

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{partner.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-sm text-slate-500">{partner.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isSupplier ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {isSupplier ? 'Fournisseur' : 'Client'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500">Contrats</p>
          <p className="text-2xl font-bold text-slate-900">{partner.contracts_count}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-slate-500">Volume Total</p>
          <p className="text-2xl font-bold text-slate-900">{formatWeight(partner.total_volume_kg)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-slate-500">Type</p>
          <p className="text-2xl font-bold text-slate-900">
            {isSupplier ? 'Fournisseur' : 'Client'}
          </p>
        </Card>
      </div>

      {isSupplier && partnerSupplierContracts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Contrats Fournisseur ({partnerSupplierContracts.length})
          </h2>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Produit
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Periode
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Prix
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Contracte
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Reste
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Execution
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnerSupplierContracts.map((contract, idx) => {
                    const executionPct = contract.qty_contracted_kg > 0
                      ? ((contract.qty_contracted_kg - contract.qty_remaining_kg) / contract.qty_contracted_kg) * 100
                      : 0;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/product/${encodeURIComponent(contract.sku)}`)}
                      >
                        <td className="px-4 py-3">
                          <Link
                            to={`/product/${encodeURIComponent(contract.sku)}`}
                            className="text-sm font-medium text-slate-900 hover:text-blue-600"
                          >
                            {contract.article_name || contract.sku}
                          </Link>
                          <p className="text-xs text-slate-500">{contract.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateRange(contract.date_start, contract.date_end)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                          {formatPrice(contract.price_buy)}/kg
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                          {formatWeight(contract.qty_contracted_kg)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-emerald-600 text-right">
                          {formatWeight(contract.qty_remaining_kg)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                          {formatPercent(executionPct)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {isClient && partnerClientContracts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Contrats Client ({partnerClientContracts.length})
          </h2>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Produit
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Periode
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Prix
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Contracte
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Reste
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                      Execution
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnerClientContracts.map((contract) => {
                    const executionPct = contract.qty_contracted_kg > 0
                      ? (contract.qty_purchased_kg / contract.qty_contracted_kg) * 100
                      : 0;
                    return (
                      <tr
                        key={contract.contract_id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/product/${encodeURIComponent(contract.sku)}`)}
                      >
                        <td className="px-4 py-3">
                          <Link
                            to={`/product/${encodeURIComponent(contract.sku)}`}
                            className="text-sm font-medium text-slate-900 hover:text-blue-600"
                          >
                            {contract.article_name || contract.sku}
                          </Link>
                          <p className="text-xs text-slate-500">{contract.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateRange(contract.date_start, contract.date_end)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                          {formatPrice(contract.price_sell)}/kg
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                          {formatWeight(contract.qty_contracted_kg)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-rose-600 text-right">
                          {formatWeight(contract.qty_remaining_kg)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                          {formatPercent(executionPct)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
