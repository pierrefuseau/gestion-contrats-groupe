import { Truck } from 'lucide-react';
import { formatWeight, formatPrice, formatDate } from '../../utils/formatters';
import type { SupplierContract } from '../../types';

interface Props {
  contracts: SupplierContract[];
}

export function SupplierContractsTable({ contracts }: Props) {
  if (contracts.length === 0) {
    return <p className="text-slate-500 italic">Aucun contrat fournisseur actif</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-left p-3 font-medium text-slate-700">Fournisseur</th>
            <th className="text-left p-3 font-medium text-slate-700">Periode</th>
            <th className="text-right p-3 font-medium text-slate-700">Prix</th>
            <th className="text-right p-3 font-medium text-slate-700">Reste a livrer</th>
            <th className="text-right p-3 font-medium text-slate-700">En transit</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract, idx) => (
            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="p-3">
                <div className="font-medium text-slate-900">{contract.supplier_name}</div>
                <div className="text-xs text-slate-500">{contract.supplier_code}</div>
              </td>
              <td className="p-3 text-slate-600">
                <div>{formatDate(contract.date_start)}</div>
                <div className="text-xs text-slate-400">au {formatDate(contract.date_end)}</div>
              </td>
              <td className="p-3 text-right text-slate-700">{formatPrice(contract.price_buy)}/kg</td>
              <td className="p-3 text-right">
                <div className="font-semibold text-slate-900">{formatWeight(contract.qty_remaining_kg)}</div>
                <div className="text-xs text-slate-500">{contract.qty_remaining_uvc.toLocaleString('fr-FR')} UVC</div>
              </td>
              <td className="p-3 text-right">
                {contract.qty_in_transit_kg > 0 ? (
                  <span className="inline-flex items-center gap-1 text-blue-600">
                    <Truck className="w-4 h-4" />
                    {formatWeight(contract.qty_in_transit_kg)}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
