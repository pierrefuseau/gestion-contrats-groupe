import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { Card } from '../components/common';
import { Button } from '../components/common/Button';
import { useData } from '../contexts/DataContext';
import { simulateNewClientContract } from '../utils/calculations';
import { formatWeight } from '../utils/formatters';
import type { Article, Partner } from '../types';

type ContractType = 'supplier' | 'client';

export function ContractForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { articles, partners, positions } = useData();

  const initialType = searchParams.get('type') as ContractType | null;
  const initialSku = searchParams.get('sku');

  const [contractType, setContractType] = useState<ContractType>(initialType || 'supplier');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(
    initialSku ? articles.find(a => a.sku === initialSku) || null : null
  );
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [notes, setNotes] = useState('');

  const relevantPartners = useMemo(() => {
    return contractType === 'supplier'
      ? partners.filter(p => p.type === 'supplier')
      : partners.filter(p => p.type === 'client');
  }, [contractType, partners]);

  const quantityInKg = useMemo(() => {
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return null;
    return quantityUnit === 'tonne' ? qty * 1000 : qty;
  }, [quantity, quantityUnit]);

  const simulation = useMemo(() => {
    if (contractType === 'client' && selectedArticle && quantityInKg) {
      const position = positions.find(p => p.sku === selectedArticle.sku);
      if (position) {
        return simulateNewClientContract(position, quantityInKg);
      }
    }
    return null;
  }, [contractType, selectedArticle, quantityInKg, positions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Contrat cree avec succes !');
    navigate(selectedArticle ? `/product/${encodeURIComponent(selectedArticle.sku)}` : '/products');
  };

  const isValid =
    selectedArticle &&
    selectedPartner &&
    startDate &&
    endDate &&
    price &&
    quantity &&
    new Date(endDate) > new Date(startDate);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau contrat</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Type de contrat
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contractType"
                value="supplier"
                checked={contractType === 'supplier'}
                onChange={() => {
                  setContractType('supplier');
                  setSelectedPartner(null);
                }}
                className="w-4 h-4 text-slate-900"
              />
              <span>Contrat Fournisseur</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contractType"
                value="client"
                checked={contractType === 'client'}
                onChange={() => {
                  setContractType('client');
                  setSelectedPartner(null);
                }}
                className="w-4 h-4 text-slate-900"
              />
              <span>Contrat Client</span>
            </label>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-slate-900">Informations generales</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Produit *
            </label>
            <select
              value={selectedArticle?.sku || ''}
              onChange={e => setSelectedArticle(articles.find(a => a.sku === e.target.value) || null)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Selectionner un produit</option>
              {articles.map(a => (
                <option key={a.sku} value={a.sku}>
                  {a.name} ({a.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {contractType === 'supplier' ? 'Fournisseur *' : 'Client *'}
            </label>
            <select
              value={selectedPartner?.code || ''}
              onChange={e => setSelectedPartner(partners.find(p => p.code === e.target.value) || null)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Selectionner un {contractType === 'supplier' ? 'fournisseur' : 'client'}</option>
              {relevantPartners.map(p => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date de debut *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date de fin *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {endDate && startDate && new Date(endDate) <= new Date(startDate) && (
                <p className="text-xs text-rose-600 mt-1">La date de fin doit etre apres la date de debut</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-slate-900">Prix et quantites</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {contractType === 'supplier' ? "Prix d'achat (EUR/kg) *" : 'Prix de vente (EUR/kg) *'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantite totale *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="0"
                  className="flex-1 h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <select
                  value={quantityUnit}
                  onChange={e => setQuantityUnit(e.target.value)}
                  className="w-28 h-10 px-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="kg">kg</option>
                  <option value="tonne">tonnes</option>
                </select>
              </div>
              {quantityInKg && (
                <p className="text-xs text-slate-500 mt-1">= {formatWeight(quantityInKg)}</p>
              )}
            </div>
          </div>
        </Card>

        {contractType === 'client' && simulation && (
          <Card
            className={
              simulation.warning
                ? 'border-amber-300 bg-amber-50'
                : 'border-emerald-300 bg-emerald-50'
            }
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  simulation.warning ? 'bg-amber-100' : 'bg-emerald-100'
                }`}
              >
                {simulation.warning ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-900">Simulation d'impact</h3>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Position actuelle:</span>
                    <span
                      className={`font-medium ${
                        simulation.current >= 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {simulation.current >= 0 ? '+' : ''}
                      {formatWeight(simulation.current)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ce contrat:</span>
                    <span className="font-medium text-rose-700">
                      - {formatWeight(quantityInKg || 0)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between">
                    <span className="font-medium text-slate-900">Position apres:</span>
                    <span
                      className={`font-bold ${
                        simulation.after >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {simulation.after >= 0 ? '+' : ''}
                      {formatWeight(simulation.after)}
                      {simulation.statusBefore !== simulation.statusAfter && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                          {simulation.statusAfter}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                {simulation.warning && (
                  <p className="mt-2 text-sm text-amber-800 font-medium">
                    {simulation.warning}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card className="space-y-4">
          <h2 className="font-semibold text-slate-900">Notes</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes additionnelles..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={!isValid}>
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
