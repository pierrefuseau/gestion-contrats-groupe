import { formatWeight, formatPrice, formatDate, formatPercent } from '../../utils/formatters';
import type { ClientContract } from '../../types';

interface Props {
  contracts: ClientContract[];
}

export function ClientContractsTable({ contracts }: Props) {
  if (contracts.length === 0) {
    return <p className="text-slate-500 italic">Aucun contrat client actif</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-left p-3 font-medium text-slate-700">Client</th>
            <th className="text-left p-3 font-medium text-slate-700">Periode</th>
            <th className="text-right p-3 font-medium text-slate-700">Prix</th>
            <th className="text-right p-3 font-medium text-slate-700">Engage</th>
            <th className="text-right p-3 font-medium text-slate-700">Livre</th>
            <th className="text-right p-3 font-medium text-slate-700">Reste</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => {
            const progress = contract.qty_contracted_kg > 0
              ? (contract.qty_purchased_kg / contract.qty_contracted_kg) * 100
              : 0;

            return (
              <tr key={contract.contract_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-3">
                  <div className="font-medium text-slate-900">{contract.client_name}</div>
                  <div className="text-xs text-slate-500">#{contract.contract_id}</div>
                </td>
                <td className="p-3 text-slate-600">
                  <div>{formatDate(contract.date_start)}</div>
                  <div className="text-xs text-slate-400">au {formatDate(contract.date_end)}</div>
                </td>
                <td className="p-3 text-right text-slate-700">{formatPrice(contract.price_sell)}/kg</td>
                <td className="p-3 text-right text-slate-700">{formatWeight(contract.qty_contracted_kg)}</td>
                <td className="p-3 text-right">
                  <div className="text-slate-700">{formatWeight(contract.qty_purchased_kg)}</div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500">{formatPercent(progress)}</div>
                </td>
                <td className="p-3 text-right font-semibold text-rose-600">
                  {formatWeight(contract.qty_remaining_kg)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
