export const UI_STRINGS = {
  nav_suppliers: 'Fournisseurs',
  nav_clients: 'Clients',
  nav_products: 'Produits',

  status_long: 'EXCÉDENT',
  status_short: 'DÉFICIT',
  status_critical: 'CRITIQUE',

  urgency_critique: 'CRITIQUE',
  urgency_attention: 'ATTENTION',
  urgency_surveillance: 'SURVEILLANCE',
  urgency_ok: 'OK',

  action_export: 'Exporter',
  action_filter: 'Filtrer',
  action_search: 'Rechercher...',
  action_save: 'Enregistrer',
  action_cancel: 'Annuler',
  action_back: 'Retour',
  action_view_all: 'Voir tout',

  label_supplier: 'Fournisseur',
  label_client: 'Client',
  label_product: 'Produit',
  label_stock: 'Stock physique',
  label_position: 'Position nette',
  label_remaining: 'Reste à livrer',
  label_transit: 'En transit',
  label_delivered: 'Livré',
  label_committed: 'Engagé',
  label_price_buy: "Prix d'achat",
  label_price_sell: 'Prix de vente',
  label_margin: 'Marge',
  label_dates: 'Période',
  label_category: 'Catégorie',
  label_status: 'Statut',
  label_urgency: 'Urgence',
  label_priority: 'Priorité',

  unit_kg: 'kg',
  unit_tonne: 'T',
  unit_truck: 'camion(s)',
  unit_pallet: 'palette(s)',
  unit_container: 'conteneur(s)',

  msg_no_risk: 'Aucune position à risque',
  msg_simulation_ok: "Ce contrat n'impacte pas négativement la position",
  msg_simulation_warning: 'Ce contrat créerait un déficit',
  msg_no_data: 'Aucune donnée disponible',
  msg_loading: 'Chargement...',

  kpi_positions_short: 'Positions DÉFICIT',
  kpi_positions_critical: 'Positions CRITIQUES',
  kpi_active_contracts: 'Contrats Actifs',
  kpi_committed_value: 'Valeur Engagée',
  kpi_avg_margin: 'Marge Moyenne',

  section_immediate_risks: 'Risques Immédiats',
  section_upcoming_deliveries: 'Prochaines Livraisons',
  section_recent_alerts: 'Alertes Récentes',
  section_supply: 'Achats / Entrées',
  section_demand: 'Ventes / Sorties',
  section_position_breakdown: 'Décomposition Position',
  section_pricing_summary: 'Récapitulatif Prix',

  contract_type_supplier: 'Contrat Fournisseur',
  contract_type_client: 'Contrat Client',
} as const;

export const CATEGORIES = [
  'Farines',
  'Sucres',
  'Matières grasses',
  'Chocolats',
  'Levures',
  'Oeufs',
  'Produits laitiers',
  'Amidons',
  'Fruits transformés',
  'Fruits à coque',
  'Assaisonnements',
  'Arômes'
] as const;

export const INCOTERMS = ['DAP', 'EXW', 'FOB', 'CIF', 'CFR', 'DDP'] as const;

export const PAYMENT_TERMS = [
  'Comptant',
  '30 jours',
  '30 jours fin de mois',
  '45 jours',
  '60 jours',
  '90 jours'
] as const;

export const UNIT_TYPES = [
  { value: 'camion', label: 'Camion(s)' },
  { value: 'palette', label: 'Palette(s)' },
  { value: 'conteneur', label: 'Conteneur(s)' },
  { value: 'cuve', label: 'Cuve(s)' },
  { value: 'carton', label: 'Carton(s)' }
] as const;

export const STRATEGIC_TIERS = {
  strategic: { label: 'Stratégique', color: 'emerald' },
  preferred: { label: 'Privilégié', color: 'blue' },
  standard: { label: 'Standard', color: 'slate' },
  spot: { label: 'Spot', color: 'amber' }
} as const;

export const STATUS_COLORS = {
  LONG: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  SHORT: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800'
  },
  CRITICAL: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    accent: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800'
  }
} as const;

export const URGENCY_COLORS = {
  CRITIQUE: 'bg-rose-600 text-white',
  ATTENTION: 'bg-amber-500 text-white',
  SURVEILLANCE: 'bg-blue-500 text-white',
  OK: 'bg-slate-200 text-slate-600'
} as const;

export const SEVERITY_COLORS = {
  critical: 'bg-rose-100 text-rose-800 border-rose-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200'
} as const;

export const ALERT_TYPE_LABELS = {
  position_short: 'Position déficitaire',
  position_critical: 'Position critique',
  delivery_delayed: 'Livraison retardée',
  contract_expiring: 'Contrat expirant',
  threshold_breach: 'Seuil franchi'
} as const;
