import { formatWeight } from '../../utils/formatters';
import type { PositionSummary } from '../../types';

interface Props {
  position: PositionSummary;
}

export function PositionBreakdown({ position }: Props) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm">
      <table className="w-full">
        <tbody>
          <tr className="text-emerald-700">
            <td className="py-1">Stock physique</td>
            <td className="text-right py-1">+ {formatWeight(position.stock_kg)}</td>
          </tr>
          <tr className="text-emerald-600">
            <td className="py-1">En transit fournisseur</td>
            <td className="text-right py-1">+ {formatWeight(position.supply_in_transit_kg)}</td>
          </tr>
          <tr className="text-emerald-600">
            <td className="py-1">Reste a recevoir</td>
            <td className="text-right py-1">+ {formatWeight(position.supply_remaining_kg)}</td>
          </tr>

          <tr>
            <td colSpan={2} className="border-t border-slate-300 pt-3 pb-1">
              <div className="flex justify-between font-semibold">
                <span>DISPONIBLE TOTAL</span>
                <span className="text-emerald-700">{formatWeight(position.total_available_kg)}</span>
              </div>
            </td>
          </tr>

          <tr className="text-rose-600">
            <td className="pt-3 pb-1">Engagements clients</td>
            <td className="text-right pt-3 pb-1">- {formatWeight(position.demand_remaining_kg)}</td>
          </tr>

          <tr>
            <td colSpan={2} className="border-t-2 border-slate-400 pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>POSITION NETTE</span>
                <span className={position.net_position_kg >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {position.net_position_kg >= 0 ? '+' : ''}{formatWeight(position.net_position_kg)}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
