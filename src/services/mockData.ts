import type { Article, SupplierContract, ClientContract, Partner, Alert, ScheduledDelivery } from '../types';
import { addDays, subDays, format } from 'date-fns';

const today = new Date();
const generateId = () => Math.random().toString(36).substr(2, 9);

const generateDeliveries = (
  startDate: Date,
  totalQty: number,
  totalKg: number,
  numDeliveries: number
): ScheduledDelivery[] => {
  const deliveries: ScheduledDelivery[] = [];
  const qtyPerDelivery = Math.floor(totalQty / numDeliveries);
  const kgPerDelivery = totalKg / numDeliveries;

  for (let i = 0; i < numDeliveries; i++) {
    const expectedDate = addDays(startDate, i * 14 + Math.floor(Math.random() * 7));
    const isPast = expectedDate < today;
    const statuses: ScheduledDelivery['status'][] = isPast
      ? ['delivered', 'delivered', 'delivered', 'delayed']
      : ['scheduled', 'scheduled', 'in_transit'];

    deliveries.push({
      id: generateId(),
      expected_date: format(expectedDate, 'yyyy-MM-dd'),
      qty_units: i === numDeliveries - 1 ? totalQty - qtyPerDelivery * (numDeliveries - 1) : qtyPerDelivery,
      qty_kg: i === numDeliveries - 1 ? totalKg - kgPerDelivery * (numDeliveries - 1) : kgPerDelivery,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      actual_date: isPast ? format(addDays(expectedDate, Math.floor(Math.random() * 3)), 'yyyy-MM-dd') : undefined
    });
  }

  return deliveries;
};

export const articles: Article[] = [
  { sku: 'FAR-T45-001', name: 'Farine de blé T45', category: 'Farines', stock_physical_kg: 45000, unit_label: '12 palettes', strategic_priority: 'A', alert_threshold_kg: -50000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FAR-T55-001', name: 'Farine de blé T55', category: 'Farines', stock_physical_kg: 32000, unit_label: '8 palettes', strategic_priority: 'A', alert_threshold_kg: -30000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FAR-T65-001', name: 'Farine de blé T65', category: 'Farines', stock_physical_kg: 18000, unit_label: '5 palettes', strategic_priority: 'A', alert_threshold_kg: -40000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FAR-T80-001', name: 'Farine de blé T80', category: 'Farines', stock_physical_kg: 22000, unit_label: '6 palettes', strategic_priority: 'B', alert_threshold_kg: -20000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FAR-T110-001', name: 'Farine de blé T110', category: 'Farines', stock_physical_kg: 15000, unit_label: '4 palettes', strategic_priority: 'B', alert_threshold_kg: -15000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FAR-SEI-001', name: 'Farine de seigle', category: 'Farines', stock_physical_kg: 8000, unit_label: '2 palettes', strategic_priority: 'C', alert_threshold_kg: -10000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FAR-SAR-001', name: 'Farine de sarrasin', category: 'Farines', stock_physical_kg: 5000, unit_label: '2 palettes', strategic_priority: 'C', alert_threshold_kg: -5000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FAR-EPE-001', name: 'Farine d\'épeautre', category: 'Farines', stock_physical_kg: 6000, unit_label: '2 palettes', strategic_priority: 'C', alert_threshold_kg: -8000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'SUC-BLA-001', name: 'Sucre blanc cristallisé', category: 'Sucres', stock_physical_kg: 85000, unit_label: '22 palettes', strategic_priority: 'A', alert_threshold_kg: -60000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'SUC-ROU-001', name: 'Sucre roux de canne', category: 'Sucres', stock_physical_kg: 25000, unit_label: '7 palettes', strategic_priority: 'B', alert_threshold_kg: -20000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'SUC-INV-001', name: 'Sucre inverti', category: 'Sucres', stock_physical_kg: 12000, unit_label: '4 cuves', strategic_priority: 'A', alert_threshold_kg: -15000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'SUC-GLU-001', name: 'Sirop de glucose', category: 'Sucres', stock_physical_kg: 35000, unit_label: '8 cuves', strategic_priority: 'A', alert_threshold_kg: -25000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'SUC-ISO-001', name: 'Isomalt', category: 'Sucres', stock_physical_kg: 4500, unit_label: '2 palettes', strategic_priority: 'C', alert_threshold_kg: -5000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'SUC-DXT-001', name: 'Dextrose', category: 'Sucres', stock_physical_kg: 18000, unit_label: '5 palettes', strategic_priority: 'B', alert_threshold_kg: -12000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'BEU-TOU-001', name: 'Beurre de tourage 82%', category: 'Matières grasses', stock_physical_kg: 8500, unit_label: '3 palettes', strategic_priority: 'A', alert_threshold_kg: -12000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'BEU-PAT-001', name: 'Beurre pâtissier 84%', category: 'Matières grasses', stock_physical_kg: 6200, unit_label: '2 palettes', strategic_priority: 'A', alert_threshold_kg: -10000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'MAR-VEG-001', name: 'Margarine végétale', category: 'Matières grasses', stock_physical_kg: 12000, unit_label: '4 palettes', strategic_priority: 'B', alert_threshold_kg: -8000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'HUI-TOU-001', name: 'Huile de tournesol', category: 'Matières grasses', stock_physical_kg: 28000, unit_label: '6 cuves', strategic_priority: 'A', alert_threshold_kg: -20000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'HUI-COL-001', name: 'Huile de colza', category: 'Matières grasses', stock_physical_kg: 22000, unit_label: '5 cuves', strategic_priority: 'B', alert_threshold_kg: -15000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'HUI-OLI-001', name: 'Huile d\'olive vierge extra', category: 'Matières grasses', stock_physical_kg: 8000, unit_label: '2 cuves', strategic_priority: 'B', alert_threshold_kg: -6000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'CHO-NOI-001', name: 'Chocolat noir 70%', category: 'Chocolats', stock_physical_kg: 15000, unit_label: '5 palettes', strategic_priority: 'A', alert_threshold_kg: -12000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'CHO-LAI-001', name: 'Chocolat au lait 35%', category: 'Chocolats', stock_physical_kg: 18000, unit_label: '6 palettes', strategic_priority: 'A', alert_threshold_kg: -15000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'CHO-BLA-001', name: 'Chocolat blanc', category: 'Chocolats', stock_physical_kg: 9000, unit_label: '3 palettes', strategic_priority: 'B', alert_threshold_kg: -8000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'CAC-POU-001', name: 'Cacao en poudre', category: 'Chocolats', stock_physical_kg: 7500, unit_label: '3 palettes', strategic_priority: 'B', alert_threshold_kg: -6000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'CAC-BEU-001', name: 'Beurre de cacao', category: 'Chocolats', stock_physical_kg: 4200, unit_label: '2 palettes', strategic_priority: 'B', alert_threshold_kg: -4000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'LEV-BOU-001', name: 'Levure boulangère fraîche', category: 'Levures', stock_physical_kg: 2500, unit_label: '50 cartons', strategic_priority: 'A', alert_threshold_kg: -3000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'LEV-SEC-001', name: 'Levure sèche instantanée', category: 'Levures', stock_physical_kg: 3800, unit_label: '2 palettes', strategic_priority: 'A', alert_threshold_kg: -2500, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'LEV-CHI-001', name: 'Levure chimique', category: 'Levures', stock_physical_kg: 5500, unit_label: '3 palettes', strategic_priority: 'B', alert_threshold_kg: -4000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'OEU-LIQ-001', name: 'Oeufs liquides pasteurisés', category: 'Oeufs', stock_physical_kg: 12000, unit_label: '8 cuves', strategic_priority: 'A', alert_threshold_kg: -10000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'OEU-JAU-001', name: 'Jaunes d\'oeufs pasteurisés', category: 'Oeufs', stock_physical_kg: 4500, unit_label: '3 cuves', strategic_priority: 'A', alert_threshold_kg: -5000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'OEU-BLA-001', name: 'Blancs d\'oeufs pasteurisés', category: 'Oeufs', stock_physical_kg: 3200, unit_label: '2 cuves', strategic_priority: 'B', alert_threshold_kg: -3000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'LAI-ENT-001', name: 'Lait entier UHT', category: 'Produits laitiers', stock_physical_kg: 45000, unit_label: '15 palettes', strategic_priority: 'A', alert_threshold_kg: -30000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'LAI-ECR-001', name: 'Lait écrémé UHT', category: 'Produits laitiers', stock_physical_kg: 22000, unit_label: '8 palettes', strategic_priority: 'B', alert_threshold_kg: -15000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'CRE-FRA-001', name: 'Crème fraîche 35%', category: 'Produits laitiers', stock_physical_kg: 8500, unit_label: '4 palettes', strategic_priority: 'A', alert_threshold_kg: -8000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'LAI-POU-001', name: 'Lait en poudre entier', category: 'Produits laitiers', stock_physical_kg: 12000, unit_label: '4 palettes', strategic_priority: 'B', alert_threshold_kg: -10000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'AMI-MAI-001', name: 'Amidon de maïs', category: 'Amidons', stock_physical_kg: 25000, unit_label: '8 palettes', strategic_priority: 'B', alert_threshold_kg: -18000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'AMI-BLE-001', name: 'Amidon de blé', category: 'Amidons', stock_physical_kg: 15000, unit_label: '5 palettes', strategic_priority: 'B', alert_threshold_kg: -12000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'AMI-POM-001', name: 'Fécule de pomme de terre', category: 'Amidons', stock_physical_kg: 8000, unit_label: '3 palettes', strategic_priority: 'C', alert_threshold_kg: -6000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FRU-CON-001', name: 'Confiture d\'abricot', category: 'Fruits transformés', stock_physical_kg: 12000, unit_label: '4 palettes', strategic_priority: 'B', alert_threshold_kg: -8000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FRU-PUR-001', name: 'Purée de framboises', category: 'Fruits transformés', stock_physical_kg: 6500, unit_label: '2 palettes', strategic_priority: 'B', alert_threshold_kg: -5000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'FRU-SEC-001', name: 'Raisins secs sultanas', category: 'Fruits transformés', stock_physical_kg: 9000, unit_label: '3 palettes', strategic_priority: 'B', alert_threshold_kg: -7000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'NOI-AMA-001', name: 'Amandes entières', category: 'Fruits à coque', stock_physical_kg: 5500, unit_label: '2 palettes', strategic_priority: 'A', alert_threshold_kg: -5000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'NOI-NOI-001', name: 'Noisettes décortiquées', category: 'Fruits à coque', stock_physical_kg: 4200, unit_label: '2 palettes', strategic_priority: 'A', alert_threshold_kg: -4000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'NOI-PIS-001', name: 'Pistaches décortiquées', category: 'Fruits à coque', stock_physical_kg: 2800, unit_label: '1 palette', strategic_priority: 'B', alert_threshold_kg: -2500, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'NOI-NOC-001', name: 'Noix de coco râpée', category: 'Fruits à coque', stock_physical_kg: 3500, unit_label: '1 palette', strategic_priority: 'C', alert_threshold_kg: -3000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'SEL-FIN-001', name: 'Sel fin de cuisine', category: 'Assaisonnements', stock_physical_kg: 35000, unit_label: '12 palettes', strategic_priority: 'C', alert_threshold_kg: -20000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'SEL-GRO-001', name: 'Gros sel de Guérande', category: 'Assaisonnements', stock_physical_kg: 8000, unit_label: '3 palettes', strategic_priority: 'C', alert_threshold_kg: -5000, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'VAN-GOU-001', name: 'Gousses de vanille Madagascar', category: 'Arômes', stock_physical_kg: 120, unit_label: '4 cartons', strategic_priority: 'A', alert_threshold_kg: -100, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'VAN-EXT-001', name: 'Extrait de vanille naturel', category: 'Arômes', stock_physical_kg: 850, unit_label: '2 cartons', strategic_priority: 'A', alert_threshold_kg: -600, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
  { sku: 'ARO-CAF-001', name: 'Extrait de café', category: 'Arômes', stock_physical_kg: 1200, unit_label: '1 palette', strategic_priority: 'B', alert_threshold_kg: -800, last_updated: format(subDays(today, 1), 'yyyy-MM-dd') },
];

export const suppliers: Partner[] = [
  { id: 'sup-001', code: 'MOUPRO', name: 'Moulins de Provence', type: 'supplier', address: '45 Route des Alpilles', country: 'France', contact_name: 'Jean Dupont', contact_email: 'j.dupont@moulins-provence.fr', contact_phone: '+33 4 90 12 34 56', total_contracts: 18, active_contracts: 5, total_volume_kg: 2500000, avg_execution_rate: 94.5, avg_delay_days: 1.2, strategic_tier: 'strategic' },
  { id: 'sup-002', code: 'MINOCC', name: 'Minoterie d\'Occitanie', type: 'supplier', address: '12 Avenue du Midi', country: 'France', contact_name: 'Marie Martin', contact_email: 'm.martin@minoterie-occ.fr', contact_phone: '+33 5 61 23 45 67', total_contracts: 14, active_contracts: 4, total_volume_kg: 1800000, avg_execution_rate: 91.2, avg_delay_days: 2.1, strategic_tier: 'strategic' },
  { id: 'sup-003', code: 'SUCNOR', name: 'Sucrerie du Nord', type: 'supplier', address: '78 Rue de la Betterave', country: 'France', contact_name: 'Pierre Leroy', contact_email: 'p.leroy@sucrerie-nord.fr', contact_phone: '+33 3 20 34 56 78', total_contracts: 22, active_contracts: 6, total_volume_kg: 4200000, avg_execution_rate: 96.8, avg_delay_days: 0.8, strategic_tier: 'strategic' },
  { id: 'sup-004', code: 'TEREOS', name: 'Tereos Industries', type: 'supplier', address: '23 Boulevard Industriel', country: 'France', contact_name: 'Sophie Bernard', contact_email: 's.bernard@tereos.fr', contact_phone: '+33 3 22 45 67 89', total_contracts: 28, active_contracts: 8, total_volume_kg: 5500000, avg_execution_rate: 98.2, avg_delay_days: 0.5, strategic_tier: 'strategic' },
  { id: 'sup-005', code: 'LAIDEV', name: 'Laiterie de l\'Ouest', type: 'supplier', address: '56 Route de Nantes', country: 'France', contact_name: 'Alain Moreau', contact_email: 'a.moreau@laiterie-ouest.fr', contact_phone: '+33 2 40 56 78 90', total_contracts: 16, active_contracts: 5, total_volume_kg: 1200000, avg_execution_rate: 92.4, avg_delay_days: 1.5, strategic_tier: 'preferred' },
  { id: 'sup-006', code: 'BEURIV', name: 'Beurrerie de la Rivière', type: 'supplier', address: '89 Chemin du Pré Vert', country: 'France', contact_name: 'Christine Petit', contact_email: 'c.petit@beurrerie-riviere.fr', contact_phone: '+33 2 51 67 89 01', total_contracts: 12, active_contracts: 4, total_volume_kg: 450000, avg_execution_rate: 89.6, avg_delay_days: 2.8, strategic_tier: 'preferred' },
  { id: 'sup-007', code: 'VALRHO', name: 'Valrhona', type: 'supplier', address: '14 Avenue du Chocolat', country: 'France', contact_name: 'Marc Dubois', contact_email: 'm.dubois@valrhona.fr', contact_phone: '+33 4 75 78 90 12', total_contracts: 20, active_contracts: 6, total_volume_kg: 280000, avg_execution_rate: 97.5, avg_delay_days: 0.3, strategic_tier: 'strategic' },
  { id: 'sup-008', code: 'BARRYC', name: 'Barry Callebaut France', type: 'supplier', address: '67 Zone Industrielle Est', country: 'France', contact_name: 'Isabelle Roux', contact_email: 'i.roux@barry-callebaut.fr', contact_phone: '+33 1 45 89 01 23', total_contracts: 24, active_contracts: 7, total_volume_kg: 520000, avg_execution_rate: 95.8, avg_delay_days: 1.1, strategic_tier: 'strategic' },
  { id: 'sup-009', code: 'LESAFF', name: 'Lesaffre', type: 'supplier', address: '41 Rue des Ferments', country: 'France', contact_name: 'François Lambert', contact_email: 'f.lambert@lesaffre.fr', contact_phone: '+33 3 20 90 12 34', total_contracts: 15, active_contracts: 5, total_volume_kg: 85000, avg_execution_rate: 99.1, avg_delay_days: 0.2, strategic_tier: 'strategic' },
  { id: 'sup-010', code: 'OEUPRO', name: 'Oeufs de Provence', type: 'supplier', address: '34 Mas des Oliviers', country: 'France', contact_name: 'Nathalie Girard', contact_email: 'n.girard@oeufs-provence.fr', contact_phone: '+33 4 90 23 45 67', total_contracts: 10, active_contracts: 3, total_volume_kg: 180000, avg_execution_rate: 93.2, avg_delay_days: 1.8, strategic_tier: 'preferred' },
  { id: 'sup-011', code: 'HUILOR', name: 'Huilerie de l\'Or', type: 'supplier', address: '23 Chemin des Moulins', country: 'France', contact_name: 'Laurent Blanc', contact_email: 'l.blanc@huilerie-or.fr', contact_phone: '+33 4 66 34 56 78', total_contracts: 11, active_contracts: 4, total_volume_kg: 650000, avg_execution_rate: 94.7, avg_delay_days: 1.4, strategic_tier: 'preferred' },
  { id: 'sup-012', code: 'ROQUAM', name: 'Roquette Amidons', type: 'supplier', address: '90 Zone Agroalimentaire', country: 'France', contact_name: 'Philippe Meyer', contact_email: 'p.meyer@roquette.fr', contact_phone: '+33 3 21 45 67 89', total_contracts: 13, active_contracts: 4, total_volume_kg: 920000, avg_execution_rate: 96.3, avg_delay_days: 0.9, strategic_tier: 'strategic' },
  { id: 'sup-013', code: 'FRUFRA', name: 'Fruits de France', type: 'supplier', address: '56 Route des Vergers', country: 'France', contact_name: 'Sandrine Fournier', contact_email: 's.fournier@fruits-france.fr', contact_phone: '+33 4 75 56 78 90', total_contracts: 9, active_contracts: 3, total_volume_kg: 320000, avg_execution_rate: 88.9, avg_delay_days: 2.5, strategic_tier: 'standard' },
  { id: 'sup-014', code: 'AMACAL', name: 'Amandes de Californie Inc.', type: 'supplier', address: '1234 Almond Ave', country: 'USA', contact_name: 'John Smith', contact_email: 'j.smith@cal-almonds.com', contact_phone: '+1 559 123 4567', total_contracts: 8, active_contracts: 2, total_volume_kg: 120000, avg_execution_rate: 91.5, avg_delay_days: 3.2, strategic_tier: 'preferred' },
  { id: 'sup-015', code: 'NOITUR', name: 'Noisettes de Turquie', type: 'supplier', address: '45 Findik Caddesi', country: 'Turquie', contact_name: 'Mehmet Yilmaz', contact_email: 'm.yilmaz@noisettestr.com', contact_phone: '+90 312 456 7890', total_contracts: 7, active_contracts: 2, total_volume_kg: 95000, avg_execution_rate: 87.3, avg_delay_days: 4.1, strategic_tier: 'standard' },
  { id: 'sup-016', code: 'VANMAD', name: 'Vanille de Madagascar', type: 'supplier', address: '12 Avenue de l\'Indépendance', country: 'Madagascar', contact_name: 'Rabe Andriantsoa', contact_email: 'r.andriantsoa@vanille-mad.mg', contact_phone: '+261 20 22 345 67', total_contracts: 6, active_contracts: 2, total_volume_kg: 2500, avg_execution_rate: 85.4, avg_delay_days: 5.5, strategic_tier: 'standard' },
  { id: 'sup-017', code: 'SELGUE', name: 'Salines de Guérande', type: 'supplier', address: '78 Chemin des Marais', country: 'France', contact_name: 'Yves Le Gall', contact_email: 'y.legall@salines-guerande.fr', contact_phone: '+33 2 40 67 89 01', total_contracts: 5, active_contracts: 2, total_volume_kg: 180000, avg_execution_rate: 97.8, avg_delay_days: 0.4, strategic_tier: 'preferred' },
  { id: 'sup-018', code: 'CAFITA', name: 'Café Italia Export', type: 'supplier', address: '34 Via del Caffè', country: 'Italie', contact_name: 'Giuseppe Rossi', contact_email: 'g.rossi@cafe-italia.it', contact_phone: '+39 06 789 0123', total_contracts: 4, active_contracts: 1, total_volume_kg: 28000, avg_execution_rate: 94.2, avg_delay_days: 1.7, strategic_tier: 'standard' },
  { id: 'sup-019', code: 'LAISUI', name: 'Swiss Dairy Products', type: 'supplier', address: '89 Milchstrasse', country: 'Suisse', contact_name: 'Hans Mueller', contact_email: 'h.mueller@swiss-dairy.ch', contact_phone: '+41 31 234 5678', total_contracts: 6, active_contracts: 2, total_volume_kg: 85000, avg_execution_rate: 98.5, avg_delay_days: 0.3, strategic_tier: 'preferred' },
  { id: 'sup-020', code: 'COCOFI', name: 'Coconut Philippines', type: 'supplier', address: '23 Niyog Street', country: 'Philippines', contact_name: 'Maria Santos', contact_email: 'm.santos@coconut-ph.com', contact_phone: '+63 2 8765 4321', total_contracts: 3, active_contracts: 1, total_volume_kg: 45000, avg_execution_rate: 82.1, avg_delay_days: 6.2, strategic_tier: 'spot' },
  { id: 'sup-021', code: 'FARBRE', name: 'Farines de Bretagne', type: 'supplier', address: '67 Rue des Menhirs', country: 'France', contact_name: 'Yann Kervadec', contact_email: 'y.kervadec@farines-bretagne.fr', contact_phone: '+33 2 98 78 90 12', total_contracts: 12, active_contracts: 4, total_volume_kg: 1100000, avg_execution_rate: 93.8, avg_delay_days: 1.6, strategic_tier: 'preferred' },
  { id: 'sup-022', code: 'MOUCHA', name: 'Moulins de Champagne', type: 'supplier', address: '45 Avenue du Champagne', country: 'France', contact_name: 'Henri Moët', contact_email: 'h.moet@moulins-champagne.fr', contact_phone: '+33 3 26 89 01 23', total_contracts: 10, active_contracts: 3, total_volume_kg: 850000, avg_execution_rate: 95.1, avg_delay_days: 1.0, strategic_tier: 'preferred' },
  { id: 'sup-023', code: 'CRISTL', name: 'Cristalleries Sucres', type: 'supplier', address: '12 Rue de la Cristallisation', country: 'France', contact_name: 'Bernard Crystal', contact_email: 'b.crystal@cristalleries.fr', contact_phone: '+33 1 56 90 12 34', total_contracts: 8, active_contracts: 3, total_volume_kg: 1500000, avg_execution_rate: 97.2, avg_delay_days: 0.7, strategic_tier: 'preferred' },
  { id: 'sup-024', code: 'HUISOL', name: 'Huiles du Soleil', type: 'supplier', address: '89 Chemin du Soleil', country: 'France', contact_name: 'Claire Soleil', contact_email: 'c.soleil@huiles-soleil.fr', contact_phone: '+33 4 67 01 23 45', total_contracts: 7, active_contracts: 2, total_volume_kg: 420000, avg_execution_rate: 92.8, avg_delay_days: 1.9, strategic_tier: 'standard' },
  { id: 'sup-025', code: 'PISTIR', name: 'Pistaches d\'Iran', type: 'supplier', address: '56 Khiaban Pistachio', country: 'Iran', contact_name: 'Ali Rahimi', contact_email: 'a.rahimi@pist-iran.ir', contact_phone: '+98 21 8765 4321', total_contracts: 4, active_contracts: 1, total_volume_kg: 35000, avg_execution_rate: 84.5, avg_delay_days: 7.5, strategic_tier: 'spot' },
  { id: 'sup-026', code: 'RAITUR', name: 'Raisins de Turquie Export', type: 'supplier', address: '34 Uzum Sokak', country: 'Turquie', contact_name: 'Ahmet Demir', contact_email: 'a.demir@raisins-tr.com', contact_phone: '+90 232 345 6789', total_contracts: 5, active_contracts: 2, total_volume_kg: 85000, avg_execution_rate: 88.7, avg_delay_days: 3.8, strategic_tier: 'standard' },
  { id: 'sup-027', code: 'FRAMBO', name: 'Framboises du Berry', type: 'supplier', address: '78 Route des Fruits Rouges', country: 'France', contact_name: 'Lucie Berry', contact_email: 'l.berry@framboises-berry.fr', contact_phone: '+33 2 48 12 34 56', total_contracts: 6, active_contracts: 2, total_volume_kg: 48000, avg_execution_rate: 90.3, avg_delay_days: 2.2, strategic_tier: 'standard' },
  { id: 'sup-028', code: 'CONFAB', name: 'Confitures d\'Alsace', type: 'supplier', address: '23 Rue des Mirabelles', country: 'France', contact_name: 'Hans Muller', contact_email: 'h.muller@confitures-alsace.fr', contact_phone: '+33 3 88 23 45 67', total_contracts: 5, active_contracts: 2, total_volume_kg: 95000, avg_execution_rate: 93.6, avg_delay_days: 1.3, strategic_tier: 'standard' },
  { id: 'sup-029', code: 'CREMNO', name: 'Crèmerie du Nord', type: 'supplier', address: '45 Avenue des Pâturages', country: 'France', contact_name: 'Jacques Cremier', contact_email: 'j.cremier@cremerie-nord.fr', contact_phone: '+33 3 20 34 56 78', total_contracts: 9, active_contracts: 3, total_volume_kg: 380000, avg_execution_rate: 94.9, avg_delay_days: 1.1, strategic_tier: 'preferred' },
  { id: 'sup-030', code: 'FECAMP', name: 'Fécules de Campagne', type: 'supplier', address: '67 Route de la Pomme de Terre', country: 'France', contact_name: 'Pierre Patate', contact_email: 'p.patate@fecules-campagne.fr', contact_phone: '+33 3 29 45 67 89', total_contracts: 4, active_contracts: 1, total_volume_kg: 210000, avg_execution_rate: 91.8, avg_delay_days: 1.7, strategic_tier: 'standard' },
];

export const clients: Partner[] = [
  { id: 'cli-001', code: 'BOUMAG', name: 'Boulangerie Magnifique', type: 'client', address: '12 Rue du Pain', country: 'France', contact_name: 'Paul Boulanger', contact_email: 'p.boulanger@boul-magnifique.fr', contact_phone: '+33 1 42 12 34 56', total_contracts: 15, active_contracts: 5, total_volume_kg: 450000, avg_execution_rate: 96.2, avg_delay_days: 0.8, strategic_tier: 'strategic' },
  { id: 'cli-002', code: 'CARINT', name: 'Carrefour International', type: 'client', address: '1 Avenue de la Grande Distribution', country: 'France', contact_name: 'Marie Commerce', contact_email: 'm.commerce@carrefour.fr', contact_phone: '+33 1 45 23 45 67', total_contracts: 42, active_contracts: 12, total_volume_kg: 8500000, avg_execution_rate: 98.5, avg_delay_days: 0.3, strategic_tier: 'strategic' },
  { id: 'cli-003', code: 'SYSTEU', name: 'Système U Centrale', type: 'client', address: '45 Boulevard U', country: 'France', contact_name: 'Jean Hyper', contact_email: 'j.hyper@systeme-u.fr', contact_phone: '+33 2 41 34 56 78', total_contracts: 38, active_contracts: 10, total_volume_kg: 6200000, avg_execution_rate: 97.8, avg_delay_days: 0.5, strategic_tier: 'strategic' },
  { id: 'cli-004', code: 'PATPAR', name: 'Pâtisserie Parisienne', type: 'client', address: '78 Avenue des Champs-Élysées', country: 'France', contact_name: 'Pierre Gateau', contact_email: 'p.gateau@patisserie-paris.fr', contact_phone: '+33 1 48 45 67 89', total_contracts: 22, active_contracts: 7, total_volume_kg: 280000, avg_execution_rate: 94.5, avg_delay_days: 1.2, strategic_tier: 'preferred' },
  { id: 'cli-005', code: 'INDAGR', name: 'Industries Agro-Alimentaires du Sud', type: 'client', address: '23 Zone Industrielle Sud', country: 'France', contact_name: 'Marc Industrie', contact_email: 'm.industrie@indagr-sud.fr', contact_phone: '+33 4 91 56 78 90', total_contracts: 35, active_contracts: 9, total_volume_kg: 4800000, avg_execution_rate: 96.8, avg_delay_days: 0.7, strategic_tier: 'strategic' },
  { id: 'cli-006', code: 'BRIOPA', name: 'Brioche Pasquier', type: 'client', address: '56 Rue de la Brioche', country: 'France', contact_name: 'Louis Pasquier', contact_email: 'l.pasquier@brioche-pasquier.fr', contact_phone: '+33 2 41 67 89 01', total_contracts: 28, active_contracts: 8, total_volume_kg: 3200000, avg_execution_rate: 98.2, avg_delay_days: 0.4, strategic_tier: 'strategic' },
  { id: 'cli-007', code: 'CHOCBE', name: 'Chocolaterie de Belgique', type: 'client', address: '89 Rue du Chocolat', country: 'Belgique', contact_name: 'Marc Praline', contact_email: 'm.praline@choco-belge.be', contact_phone: '+32 2 789 0123', total_contracts: 18, active_contracts: 5, total_volume_kg: 420000, avg_execution_rate: 95.3, avg_delay_days: 1.0, strategic_tier: 'preferred' },
  { id: 'cli-008', code: 'BISCFR', name: 'Biscuiterie de France', type: 'client', address: '34 Avenue des Biscuits', country: 'France', contact_name: 'Sophie Biscuit', contact_email: 's.biscuit@biscuiterie-france.fr', contact_phone: '+33 2 40 90 12 34', total_contracts: 25, active_contracts: 7, total_volume_kg: 1850000, avg_execution_rate: 97.1, avg_delay_days: 0.6, strategic_tier: 'strategic' },
  { id: 'cli-009', code: 'GLACIA', name: 'Glacier Artisanal', type: 'client', address: '67 Rue des Glaces', country: 'France', contact_name: 'Bruno Sorbet', contact_email: 'b.sorbet@glacier-art.fr', contact_phone: '+33 4 75 01 23 45', total_contracts: 12, active_contracts: 4, total_volume_kg: 185000, avg_execution_rate: 93.8, avg_delay_days: 1.5, strategic_tier: 'standard' },
  { id: 'cli-010', code: 'LECGMS', name: 'Leclerc GMS', type: 'client', address: '90 Boulevard Leclerc', country: 'France', contact_name: 'Michel Edouard', contact_email: 'm.edouard@leclerc.fr', contact_phone: '+33 2 98 12 34 56', total_contracts: 40, active_contracts: 11, total_volume_kg: 7200000, avg_execution_rate: 98.1, avg_delay_days: 0.4, strategic_tier: 'strategic' },
  { id: 'cli-011', code: 'VIENOI', name: 'Viennoiserie Industrielle', type: 'client', address: '23 Rue du Croissant', country: 'France', contact_name: 'André Croissant', contact_email: 'a.croissant@viennoiserie-ind.fr', contact_phone: '+33 3 80 23 45 67', total_contracts: 20, active_contracts: 6, total_volume_kg: 1200000, avg_execution_rate: 95.9, avg_delay_days: 0.9, strategic_tier: 'preferred' },
  { id: 'cli-012', code: 'AUCHAN', name: 'Auchan Retail France', type: 'client', address: '200 Rue de la Recherche', country: 'France', contact_name: 'Laurent Hyper', contact_email: 'l.hyper@auchan.fr', contact_phone: '+33 3 28 34 56 78', total_contracts: 36, active_contracts: 10, total_volume_kg: 5800000, avg_execution_rate: 97.5, avg_delay_days: 0.5, strategic_tier: 'strategic' },
  { id: 'cli-013', code: 'TARTMA', name: 'Tartes et Macarons', type: 'client', address: '45 Rue Ladurée', country: 'France', contact_name: 'Céline Macaron', contact_email: 'c.macaron@tartes-macarons.fr', contact_phone: '+33 1 42 45 67 89', total_contracts: 14, active_contracts: 4, total_volume_kg: 145000, avg_execution_rate: 92.4, avg_delay_days: 1.8, strategic_tier: 'standard' },
  { id: 'cli-014', code: 'RESTCO', name: 'Restaurant Collectif National', type: 'client', address: '78 Avenue de la Restauration', country: 'France', contact_name: 'Chef Collectif', contact_email: 'chef@restco-national.fr', contact_phone: '+33 1 55 56 78 90', total_contracts: 30, active_contracts: 8, total_volume_kg: 2400000, avg_execution_rate: 96.3, avg_delay_days: 0.7, strategic_tier: 'strategic' },
  { id: 'cli-015', code: 'PANADE', name: 'Pain et Délices', type: 'client', address: '12 Place du Village', country: 'France', contact_name: 'François Pain', contact_email: 'f.pain@pain-delices.fr', contact_phone: '+33 4 90 67 89 01', total_contracts: 8, active_contracts: 3, total_volume_kg: 95000, avg_execution_rate: 91.2, avg_delay_days: 2.1, strategic_tier: 'standard' },
  { id: 'cli-016', code: 'CONFIT', name: 'Confiserie Traditionnelle', type: 'client', address: '56 Rue des Bonbons', country: 'France', contact_name: 'Suzy Sweet', contact_email: 's.sweet@confiserie-trad.fr', contact_phone: '+33 4 72 78 90 12', total_contracts: 16, active_contracts: 5, total_volume_kg: 380000, avg_execution_rate: 94.7, avg_delay_days: 1.1, strategic_tier: 'preferred' },
  { id: 'cli-017', code: 'INTERP', name: 'Intermarché Pro', type: 'client', address: '89 Avenue des Mousquetaires', country: 'France', contact_name: 'Alain Mousquetaire', contact_email: 'a.mousquetaire@intermarche.fr', contact_phone: '+33 2 28 89 01 23', total_contracts: 32, active_contracts: 9, total_volume_kg: 4500000, avg_execution_rate: 97.2, avg_delay_days: 0.6, strategic_tier: 'strategic' },
  { id: 'cli-018', code: 'BOUART', name: 'Boulangeries Artisanales Réunies', type: 'client', address: '23 Rue du Fournil', country: 'France', contact_name: 'Thomas Fournier', contact_email: 't.fournier@boul-artisanales.fr', contact_phone: '+33 5 56 90 12 34', total_contracts: 18, active_contracts: 6, total_volume_kg: 520000, avg_execution_rate: 93.5, avg_delay_days: 1.4, strategic_tier: 'preferred' },
  { id: 'cli-019', code: 'GELATI', name: 'Gelati Italia France', type: 'client', address: '45 Via Gelato', country: 'France', contact_name: 'Giovanni Gelato', contact_email: 'g.gelato@gelati-italia.fr', contact_phone: '+33 4 93 01 23 45', total_contracts: 10, active_contracts: 3, total_volume_kg: 125000, avg_execution_rate: 90.8, avg_delay_days: 2.3, strategic_tier: 'standard' },
  { id: 'cli-020', code: 'METRO', name: 'Metro Cash & Carry', type: 'client', address: '67 Zone Commerciale', country: 'France', contact_name: 'Eva Metro', contact_email: 'e.metro@metro.fr', contact_phone: '+33 1 49 12 34 56', total_contracts: 28, active_contracts: 8, total_volume_kg: 3800000, avg_execution_rate: 96.9, avg_delay_days: 0.5, strategic_tier: 'strategic' },
  { id: 'cli-021', code: 'PATPRO', name: 'Pâtissiers Professionnels', type: 'client', address: '90 Avenue de la Pâtisserie', country: 'France', contact_name: 'Chef Pâtissier', contact_email: 'chef@patissiers-pro.fr', contact_phone: '+33 1 42 23 45 67', total_contracts: 15, active_contracts: 5, total_volume_kg: 210000, avg_execution_rate: 94.1, avg_delay_days: 1.2, strategic_tier: 'preferred' },
  { id: 'cli-022', code: 'CREPES', name: 'Crêperies de Bretagne', type: 'client', address: '12 Place des Crêpes', country: 'France', contact_name: 'Yann Galette', contact_email: 'y.galette@creperies-bretagne.fr', contact_phone: '+33 2 98 34 56 78', total_contracts: 11, active_contracts: 4, total_volume_kg: 165000, avg_execution_rate: 92.6, avg_delay_days: 1.6, strategic_tier: 'standard' },
  { id: 'cli-023', code: 'BIOORG', name: 'Bio Organic Foods', type: 'client', address: '34 Rue du Bio', country: 'France', contact_name: 'Claire Nature', contact_email: 'c.nature@bio-organic.fr', contact_phone: '+33 4 67 45 67 89', total_contracts: 13, active_contracts: 4, total_volume_kg: 285000, avg_execution_rate: 91.3, avg_delay_days: 2.0, strategic_tier: 'standard' },
  { id: 'cli-024', code: 'TRAITE', name: 'Traiteur Excellence', type: 'client', address: '56 Avenue Gastronomique', country: 'France', contact_name: 'Chef Traiteur', contact_email: 'chef@traiteur-excellence.fr', contact_phone: '+33 1 47 56 78 90', total_contracts: 9, active_contracts: 3, total_volume_kg: 135000, avg_execution_rate: 95.2, avg_delay_days: 0.9, strategic_tier: 'preferred' },
  { id: 'cli-025', code: 'SUPERU', name: 'Super U Centrale', type: 'client', address: '78 Boulevard du Commerce', country: 'France', contact_name: 'Denis Super', contact_email: 'd.super@super-u.fr', contact_phone: '+33 2 41 67 89 01', total_contracts: 34, active_contracts: 9, total_volume_kg: 5200000, avg_execution_rate: 97.6, avg_delay_days: 0.4, strategic_tier: 'strategic' },
  { id: 'cli-026', code: 'PAINQU', name: 'Pain Quotidien Europe', type: 'client', address: '89 Rue du Pain Frais', country: 'Belgique', contact_name: 'Marc Pain', contact_email: 'm.pain@pain-quotidien.eu', contact_phone: '+32 2 890 1234', total_contracts: 20, active_contracts: 6, total_volume_kg: 680000, avg_execution_rate: 96.4, avg_delay_days: 0.8, strategic_tier: 'preferred' },
  { id: 'cli-027', code: 'LIDLFR', name: 'Lidl France', type: 'client', address: '23 Strasbourg Nord', country: 'France', contact_name: 'Hans Discount', contact_email: 'h.discount@lidl.fr', contact_phone: '+33 3 88 78 90 12', total_contracts: 30, active_contracts: 8, total_volume_kg: 4200000, avg_execution_rate: 98.3, avg_delay_days: 0.3, strategic_tier: 'strategic' },
  { id: 'cli-028', code: 'ALDIFR', name: 'Aldi France', type: 'client', address: '45 Route du Discount', country: 'France', contact_name: 'Fritz Aldi', contact_email: 'f.aldi@aldi.fr', contact_phone: '+33 3 20 89 01 23', total_contracts: 26, active_contracts: 7, total_volume_kg: 3600000, avg_execution_rate: 97.9, avg_delay_days: 0.4, strategic_tier: 'strategic' },
  { id: 'cli-029', code: 'CASINO', name: 'Casino Distribution', type: 'client', address: '67 Avenue Casino', country: 'France', contact_name: 'Jean Casino', contact_email: 'j.casino@casino.fr', contact_phone: '+33 4 77 90 12 34', total_contracts: 24, active_contracts: 7, total_volume_kg: 3100000, avg_execution_rate: 95.8, avg_delay_days: 0.7, strategic_tier: 'strategic' },
  { id: 'cli-030', code: 'MONOP', name: 'Monoprix', type: 'client', address: '90 Boulevard Haussmann', country: 'France', contact_name: 'Sophie Mono', contact_email: 's.mono@monoprix.fr', contact_phone: '+33 1 49 01 23 45', total_contracts: 22, active_contracts: 6, total_volume_kg: 1800000, avg_execution_rate: 96.1, avg_delay_days: 0.6, strategic_tier: 'preferred' },
  { id: 'cli-031', code: 'COOREP', name: 'Coopérative des Épiciers', type: 'client', address: '12 Place du Marché', country: 'France', contact_name: 'Pierre Épicier', contact_email: 'p.epicier@coop-epiciers.fr', contact_phone: '+33 5 56 12 34 56', total_contracts: 7, active_contracts: 2, total_volume_kg: 85000, avg_execution_rate: 89.5, avg_delay_days: 2.5, strategic_tier: 'spot' },
  { id: 'cli-032', code: 'FRANPR', name: 'Franprix', type: 'client', address: '34 Rue de Paris', country: 'France', contact_name: 'Marie Franprix', contact_email: 'm.franprix@franprix.fr', contact_phone: '+33 1 45 23 45 67', total_contracts: 18, active_contracts: 5, total_volume_kg: 1200000, avg_execution_rate: 94.8, avg_delay_days: 0.9, strategic_tier: 'preferred' },
  { id: 'cli-033', code: 'SPAALI', name: 'Spa Alimentaire Pro', type: 'client', address: '56 Spa Business Park', country: 'Belgique', contact_name: 'Jan Spa', contact_email: 'j.spa@spa-alimentaire.be', contact_phone: '+32 87 345 678', total_contracts: 8, active_contracts: 2, total_volume_kg: 145000, avg_execution_rate: 91.7, avg_delay_days: 1.8, strategic_tier: 'standard' },
  { id: 'cli-034', code: 'COFBOU', name: 'Cofidis Boulangerie', type: 'client', address: '78 Rue des Artisans', country: 'France', contact_name: 'René Artisan', contact_email: 'r.artisan@cofidis-boul.fr', contact_phone: '+33 3 20 34 56 78', total_contracts: 12, active_contracts: 4, total_volume_kg: 320000, avg_execution_rate: 93.2, avg_delay_days: 1.3, strategic_tier: 'standard' },
  { id: 'cli-035', code: 'PATFIN', name: 'Pâtisserie Fine Paris', type: 'client', address: '89 Avenue Montaigne', country: 'France', contact_name: 'Chef Étoilé', contact_email: 'chef@patisserie-fine.fr', contact_phone: '+33 1 47 45 67 89', total_contracts: 6, active_contracts: 2, total_volume_kg: 45000, avg_execution_rate: 97.5, avg_delay_days: 0.4, strategic_tier: 'preferred' },
  { id: 'cli-036', code: 'BOUCAM', name: 'Boulangeries du Campus', type: 'client', address: '23 Rue Universitaire', country: 'France', contact_name: 'Étienne Campus', contact_email: 'e.campus@boul-campus.fr', contact_phone: '+33 5 61 56 78 90', total_contracts: 9, active_contracts: 3, total_volume_kg: 165000, avg_execution_rate: 90.6, avg_delay_days: 2.1, strategic_tier: 'standard' },
  { id: 'cli-037', code: 'PITAPN', name: 'Pita Pan Mediterranean', type: 'client', address: '45 Rue du Levant', country: 'France', contact_name: 'Youssef Pita', contact_email: 'y.pita@pitapan.fr', contact_phone: '+33 4 91 67 89 01', total_contracts: 5, active_contracts: 2, total_volume_kg: 75000, avg_execution_rate: 88.9, avg_delay_days: 2.8, strategic_tier: 'spot' },
  { id: 'cli-038', code: 'SURGEL', name: 'Surgelés Gourmet', type: 'client', address: '67 Zone Frigorifique', country: 'France', contact_name: 'Froid Gourmet', contact_email: 'f.gourmet@surgeles-gourmet.fr', contact_phone: '+33 2 40 78 90 12', total_contracts: 14, active_contracts: 4, total_volume_kg: 480000, avg_execution_rate: 95.4, avg_delay_days: 0.8, strategic_tier: 'preferred' },
  { id: 'cli-039', code: 'PRIMIS', name: 'Primistore', type: 'client', address: '90 Rue du Commerce', country: 'France', contact_name: 'Lucas Prime', contact_email: 'l.prime@primistore.fr', contact_phone: '+33 1 42 89 01 23', total_contracts: 16, active_contracts: 5, total_volume_kg: 850000, avg_execution_rate: 94.3, avg_delay_days: 1.0, strategic_tier: 'preferred' },
  { id: 'cli-040', code: 'BIOCER', name: 'Bio Céréales France', type: 'client', address: '12 Chemin du Bio', country: 'France', contact_name: 'Léa Biologique', contact_email: 'l.biologique@bio-cereales.fr', contact_phone: '+33 4 66 90 12 34', total_contracts: 11, active_contracts: 3, total_volume_kg: 220000, avg_execution_rate: 92.1, avg_delay_days: 1.7, strategic_tier: 'standard' },
];

export const partners: Partner[] = [...suppliers, ...clients];

const createSupplierContracts = (): SupplierContract[] => {
  const contracts: SupplierContract[] = [];

  const contractData = [
    { sku: 'FAR-T65-001', supplierId: 'sup-001', qtyUnits: 8, unitType: 'camion', qtyKg: 192000, priceBuy: 0.89, status: 'active' as const, remaining: 5, transit: 1 },
    { sku: 'FAR-T65-001', supplierId: 'sup-002', qtyUnits: 6, unitType: 'camion', qtyKg: 144000, priceBuy: 0.92, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'FAR-T45-001', supplierId: 'sup-001', qtyUnits: 12, unitType: 'camion', qtyKg: 288000, priceBuy: 0.95, status: 'active' as const, remaining: 8, transit: 2 },
    { sku: 'FAR-T45-001', supplierId: 'sup-021', qtyUnits: 10, unitType: 'camion', qtyKg: 240000, priceBuy: 0.93, status: 'active' as const, remaining: 6, transit: 1 },
    { sku: 'FAR-T55-001', supplierId: 'sup-002', qtyUnits: 8, unitType: 'camion', qtyKg: 192000, priceBuy: 0.91, status: 'active' as const, remaining: 4, transit: 1 },
    { sku: 'FAR-T55-001', supplierId: 'sup-022', qtyUnits: 6, unitType: 'camion', qtyKg: 144000, priceBuy: 0.90, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'FAR-T80-001', supplierId: 'sup-001', qtyUnits: 5, unitType: 'camion', qtyKg: 120000, priceBuy: 0.88, status: 'active' as const, remaining: 3, transit: 0 },
    { sku: 'FAR-T110-001', supplierId: 'sup-021', qtyUnits: 4, unitType: 'camion', qtyKg: 96000, priceBuy: 0.87, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'FAR-SEI-001', supplierId: 'sup-022', qtyUnits: 3, unitType: 'camion', qtyKg: 72000, priceBuy: 1.15, status: 'active' as const, remaining: 2, transit: 0 },
    { sku: 'FAR-SAR-001', supplierId: 'sup-002', qtyUnits: 2, unitType: 'camion', qtyKg: 48000, priceBuy: 2.25, status: 'active' as const, remaining: 1, transit: 0 },
    { sku: 'FAR-EPE-001', supplierId: 'sup-001', qtyUnits: 3, unitType: 'camion', qtyKg: 72000, priceBuy: 1.85, status: 'active' as const, remaining: 2, transit: 0 },
    { sku: 'SUC-BLA-001', supplierId: 'sup-003', qtyUnits: 15, unitType: 'camion', qtyKg: 375000, priceBuy: 0.72, status: 'active' as const, remaining: 10, transit: 2 },
    { sku: 'SUC-BLA-001', supplierId: 'sup-004', qtyUnits: 20, unitType: 'camion', qtyKg: 500000, priceBuy: 0.70, status: 'active' as const, remaining: 12, transit: 3 },
    { sku: 'SUC-BLA-001', supplierId: 'sup-023', qtyUnits: 12, unitType: 'camion', qtyKg: 300000, priceBuy: 0.71, status: 'active' as const, remaining: 7, transit: 2 },
    { sku: 'SUC-ROU-001', supplierId: 'sup-003', qtyUnits: 6, unitType: 'camion', qtyKg: 150000, priceBuy: 0.85, status: 'active' as const, remaining: 4, transit: 1 },
    { sku: 'SUC-INV-001', supplierId: 'sup-004', qtyUnits: 8, unitType: 'cuve', qtyKg: 160000, priceBuy: 1.15, status: 'active' as const, remaining: 4, transit: 1 },
    { sku: 'SUC-GLU-001', supplierId: 'sup-003', qtyUnits: 10, unitType: 'cuve', qtyKg: 250000, priceBuy: 0.95, status: 'active' as const, remaining: 6, transit: 2 },
    { sku: 'SUC-ISO-001', supplierId: 'sup-004', qtyUnits: 3, unitType: 'palette', qtyKg: 45000, priceBuy: 2.80, status: 'active' as const, remaining: 2, transit: 0 },
    { sku: 'SUC-DXT-001', supplierId: 'sup-003', qtyUnits: 5, unitType: 'palette', qtyKg: 75000, priceBuy: 0.82, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'BEU-TOU-001', supplierId: 'sup-006', qtyUnits: 4, unitType: 'palette', qtyKg: 48000, priceBuy: 6.20, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'BEU-TOU-001', supplierId: 'sup-005', qtyUnits: 5, unitType: 'palette', qtyKg: 60000, priceBuy: 6.15, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'BEU-PAT-001', supplierId: 'sup-006', qtyUnits: 3, unitType: 'palette', qtyKg: 36000, priceBuy: 6.45, status: 'active' as const, remaining: 1, transit: 1 },
    { sku: 'MAR-VEG-001', supplierId: 'sup-005', qtyUnits: 5, unitType: 'palette', qtyKg: 75000, priceBuy: 2.10, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'HUI-TOU-001', supplierId: 'sup-011', qtyUnits: 8, unitType: 'cuve', qtyKg: 200000, priceBuy: 1.25, status: 'active' as const, remaining: 5, transit: 1 },
    { sku: 'HUI-TOU-001', supplierId: 'sup-024', qtyUnits: 6, unitType: 'cuve', qtyKg: 150000, priceBuy: 1.28, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'HUI-COL-001', supplierId: 'sup-011', qtyUnits: 6, unitType: 'cuve', qtyKg: 150000, priceBuy: 1.18, status: 'active' as const, remaining: 4, transit: 1 },
    { sku: 'HUI-OLI-001', supplierId: 'sup-024', qtyUnits: 4, unitType: 'cuve', qtyKg: 80000, priceBuy: 4.85, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'CHO-NOI-001', supplierId: 'sup-007', qtyUnits: 6, unitType: 'palette', qtyKg: 72000, priceBuy: 8.50, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'CHO-NOI-001', supplierId: 'sup-008', qtyUnits: 8, unitType: 'palette', qtyKg: 96000, priceBuy: 8.35, status: 'active' as const, remaining: 4, transit: 2 },
    { sku: 'CHO-LAI-001', supplierId: 'sup-007', qtyUnits: 8, unitType: 'palette', qtyKg: 96000, priceBuy: 7.20, status: 'active' as const, remaining: 4, transit: 2 },
    { sku: 'CHO-LAI-001', supplierId: 'sup-008', qtyUnits: 10, unitType: 'palette', qtyKg: 120000, priceBuy: 7.10, status: 'active' as const, remaining: 5, transit: 2 },
    { sku: 'CHO-BLA-001', supplierId: 'sup-007', qtyUnits: 4, unitType: 'palette', qtyKg: 48000, priceBuy: 7.80, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'CAC-POU-001', supplierId: 'sup-008', qtyUnits: 5, unitType: 'palette', qtyKg: 60000, priceBuy: 5.20, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'CAC-BEU-001', supplierId: 'sup-007', qtyUnits: 3, unitType: 'palette', qtyKg: 36000, priceBuy: 12.50, status: 'active' as const, remaining: 2, transit: 0 },
    { sku: 'LEV-BOU-001', supplierId: 'sup-009', qtyUnits: 200, unitType: 'carton', qtyKg: 10000, priceBuy: 3.80, status: 'active' as const, remaining: 120, transit: 30 },
    { sku: 'LEV-SEC-001', supplierId: 'sup-009', qtyUnits: 8, unitType: 'palette', qtyKg: 24000, priceBuy: 4.50, status: 'active' as const, remaining: 5, transit: 1 },
    { sku: 'LEV-CHI-001', supplierId: 'sup-009', qtyUnits: 6, unitType: 'palette', qtyKg: 36000, priceBuy: 2.20, status: 'active' as const, remaining: 4, transit: 1 },
    { sku: 'OEU-LIQ-001', supplierId: 'sup-010', qtyUnits: 12, unitType: 'cuve', qtyKg: 96000, priceBuy: 2.85, status: 'active' as const, remaining: 7, transit: 2 },
    { sku: 'OEU-JAU-001', supplierId: 'sup-010', qtyUnits: 6, unitType: 'cuve', qtyKg: 36000, priceBuy: 4.20, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'OEU-BLA-001', supplierId: 'sup-010', qtyUnits: 4, unitType: 'cuve', qtyKg: 24000, priceBuy: 3.50, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'LAI-ENT-001', supplierId: 'sup-005', qtyUnits: 18, unitType: 'palette', qtyKg: 270000, priceBuy: 0.92, status: 'active' as const, remaining: 10, transit: 3 },
    { sku: 'LAI-ENT-001', supplierId: 'sup-019', qtyUnits: 10, unitType: 'palette', qtyKg: 150000, priceBuy: 0.95, status: 'active' as const, remaining: 6, transit: 2 },
    { sku: 'LAI-ECR-001', supplierId: 'sup-005', qtyUnits: 10, unitType: 'palette', qtyKg: 150000, priceBuy: 0.85, status: 'active' as const, remaining: 6, transit: 2 },
    { sku: 'CRE-FRA-001', supplierId: 'sup-029', qtyUnits: 6, unitType: 'palette', qtyKg: 60000, priceBuy: 3.20, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'LAI-POU-001', supplierId: 'sup-019', qtyUnits: 5, unitType: 'palette', qtyKg: 75000, priceBuy: 3.85, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'AMI-MAI-001', supplierId: 'sup-012', qtyUnits: 10, unitType: 'palette', qtyKg: 150000, priceBuy: 0.75, status: 'active' as const, remaining: 6, transit: 2 },
    { sku: 'AMI-BLE-001', supplierId: 'sup-012', qtyUnits: 6, unitType: 'palette', qtyKg: 90000, priceBuy: 0.82, status: 'active' as const, remaining: 4, transit: 1 },
    { sku: 'AMI-POM-001', supplierId: 'sup-030', qtyUnits: 4, unitType: 'palette', qtyKg: 60000, priceBuy: 0.95, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'FRU-CON-001', supplierId: 'sup-028', qtyUnits: 5, unitType: 'palette', qtyKg: 75000, priceBuy: 2.40, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'FRU-CON-001', supplierId: 'sup-013', qtyUnits: 4, unitType: 'palette', qtyKg: 60000, priceBuy: 2.35, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'FRU-PUR-001', supplierId: 'sup-027', qtyUnits: 3, unitType: 'palette', qtyKg: 45000, priceBuy: 4.80, status: 'active' as const, remaining: 2, transit: 0 },
    { sku: 'FRU-SEC-001', supplierId: 'sup-026', qtyUnits: 4, unitType: 'palette', qtyKg: 60000, priceBuy: 2.15, status: 'active' as const, remaining: 2, transit: 1 },
    { sku: 'NOI-AMA-001', supplierId: 'sup-014', qtyUnits: 3, unitType: 'palette', qtyKg: 36000, priceBuy: 9.50, status: 'active' as const, remaining: 2, transit: 0 },
    { sku: 'NOI-NOI-001', supplierId: 'sup-015', qtyUnits: 3, unitType: 'palette', qtyKg: 36000, priceBuy: 8.20, status: 'active' as const, remaining: 2, transit: 0 },
    { sku: 'NOI-PIS-001', supplierId: 'sup-025', qtyUnits: 2, unitType: 'palette', qtyKg: 24000, priceBuy: 18.50, status: 'active' as const, remaining: 1, transit: 0 },
    { sku: 'NOI-NOC-001', supplierId: 'sup-020', qtyUnits: 2, unitType: 'palette', qtyKg: 30000, priceBuy: 3.20, status: 'active' as const, remaining: 1, transit: 0 },
    { sku: 'SEL-FIN-001', supplierId: 'sup-017', qtyUnits: 15, unitType: 'palette', qtyKg: 225000, priceBuy: 0.18, status: 'active' as const, remaining: 9, transit: 2 },
    { sku: 'SEL-GRO-001', supplierId: 'sup-017', qtyUnits: 5, unitType: 'palette', qtyKg: 75000, priceBuy: 0.45, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'VAN-GOU-001', supplierId: 'sup-016', qtyUnits: 10, unitType: 'carton', qtyKg: 500, priceBuy: 450.00, status: 'active' as const, remaining: 6, transit: 1 },
    { sku: 'VAN-EXT-001', supplierId: 'sup-016', qtyUnits: 5, unitType: 'carton', qtyKg: 2500, priceBuy: 85.00, status: 'active' as const, remaining: 3, transit: 1 },
    { sku: 'ARO-CAF-001', supplierId: 'sup-018', qtyUnits: 3, unitType: 'palette', qtyKg: 9000, priceBuy: 12.50, status: 'active' as const, remaining: 2, transit: 0 },
  ];

  contractData.forEach((c, index) => {
    const supplier = suppliers.find(s => s.id === c.supplierId)!;
    const executed = c.qtyUnits - c.remaining - c.transit;

    contracts.push({
      id: `sc-${String(index + 1).padStart(3, '0')}`,
      supplier_name: supplier.name,
      supplier_code: supplier.code,
      sku: c.sku,
      supplier_sku: `${supplier.code}-${c.sku}`,
      dates: {
        start: format(subDays(today, 60 + Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
        end: format(addDays(today, 120 + Math.floor(Math.random() * 60)), 'yyyy-MM-dd'),
      },
      price_buy: c.priceBuy,
      price_unit: 'kg',
      incoterm: ['DAP', 'EXW', 'FOB', 'CIF'][Math.floor(Math.random() * 4)],
      qty_total_units: c.qtyUnits,
      qty_executed_units: executed,
      qty_remaining_units: c.remaining,
      qty_transit_units: c.transit,
      unit_type: c.unitType,
      qty_total_kg: c.qtyKg,
      deliveries: generateDeliveries(subDays(today, 30), c.qtyUnits, c.qtyKg, Math.max(2, Math.floor(c.qtyUnits / 2))),
      status: c.status,
      notes: '',
    });
  });

  return contracts;
};

const createClientContracts = (): ClientContract[] => {
  const contracts: ClientContract[] = [];

  const contractData = [
    { sku: 'FAR-T65-001', clientId: 'cli-001', qtyKg: 85000, priceSell: 1.25, delivered: 35000, ordered: 15000 },
    { sku: 'FAR-T65-001', clientId: 'cli-002', qtyKg: 250000, priceSell: 1.15, delivered: 120000, ordered: 45000 },
    { sku: 'FAR-T65-001', clientId: 'cli-006', qtyKg: 180000, priceSell: 1.18, delivered: 80000, ordered: 35000 },
    { sku: 'FAR-T65-001', clientId: 'cli-010', qtyKg: 220000, priceSell: 1.12, delivered: 95000, ordered: 40000 },
    { sku: 'FAR-T45-001', clientId: 'cli-002', qtyKg: 180000, priceSell: 1.28, delivered: 90000, ordered: 30000 },
    { sku: 'FAR-T45-001', clientId: 'cli-003', qtyKg: 150000, priceSell: 1.30, delivered: 70000, ordered: 25000 },
    { sku: 'FAR-T45-001', clientId: 'cli-006', qtyKg: 120000, priceSell: 1.32, delivered: 55000, ordered: 20000 },
    { sku: 'FAR-T45-001', clientId: 'cli-008', qtyKg: 95000, priceSell: 1.35, delivered: 40000, ordered: 18000 },
    { sku: 'FAR-T55-001', clientId: 'cli-001', qtyKg: 65000, priceSell: 1.22, delivered: 28000, ordered: 12000 },
    { sku: 'FAR-T55-001', clientId: 'cli-011', qtyKg: 110000, priceSell: 1.18, delivered: 50000, ordered: 20000 },
    { sku: 'FAR-T55-001', clientId: 'cli-018', qtyKg: 85000, priceSell: 1.20, delivered: 35000, ordered: 15000 },
    { sku: 'FAR-T80-001', clientId: 'cli-023', qtyKg: 45000, priceSell: 1.15, delivered: 18000, ordered: 8000 },
    { sku: 'FAR-T110-001', clientId: 'cli-040', qtyKg: 35000, priceSell: 1.12, delivered: 12000, ordered: 6000 },
    { sku: 'FAR-SEI-001', clientId: 'cli-022', qtyKg: 28000, priceSell: 1.55, delivered: 10000, ordered: 5000 },
    { sku: 'FAR-SAR-001', clientId: 'cli-022', qtyKg: 18000, priceSell: 2.85, delivered: 6000, ordered: 3000 },
    { sku: 'FAR-EPE-001', clientId: 'cli-023', qtyKg: 22000, priceSell: 2.35, delivered: 8000, ordered: 4000 },
    { sku: 'SUC-BLA-001', clientId: 'cli-002', qtyKg: 320000, priceSell: 0.95, delivered: 180000, ordered: 50000 },
    { sku: 'SUC-BLA-001', clientId: 'cli-003', qtyKg: 280000, priceSell: 0.92, delivered: 150000, ordered: 45000 },
    { sku: 'SUC-BLA-001', clientId: 'cli-005', qtyKg: 450000, priceSell: 0.88, delivered: 280000, ordered: 60000 },
    { sku: 'SUC-BLA-001', clientId: 'cli-010', qtyKg: 350000, priceSell: 0.90, delivered: 200000, ordered: 55000 },
    { sku: 'SUC-BLA-001', clientId: 'cli-016', qtyKg: 85000, priceSell: 0.98, delivered: 40000, ordered: 15000 },
    { sku: 'SUC-ROU-001', clientId: 'cli-004', qtyKg: 35000, priceSell: 1.15, delivered: 15000, ordered: 6000 },
    { sku: 'SUC-ROU-001', clientId: 'cli-016', qtyKg: 28000, priceSell: 1.18, delivered: 10000, ordered: 5000 },
    { sku: 'SUC-INV-001', clientId: 'cli-004', qtyKg: 45000, priceSell: 1.55, delivered: 18000, ordered: 8000 },
    { sku: 'SUC-INV-001', clientId: 'cli-007', qtyKg: 38000, priceSell: 1.52, delivered: 15000, ordered: 7000 },
    { sku: 'SUC-INV-001', clientId: 'cli-016', qtyKg: 55000, priceSell: 1.48, delivered: 25000, ordered: 10000 },
    { sku: 'SUC-GLU-001', clientId: 'cli-005', qtyKg: 85000, priceSell: 1.25, delivered: 40000, ordered: 15000 },
    { sku: 'SUC-GLU-001', clientId: 'cli-016', qtyKg: 65000, priceSell: 1.28, delivered: 30000, ordered: 12000 },
    { sku: 'SUC-ISO-001', clientId: 'cli-016', qtyKg: 18000, priceSell: 3.50, delivered: 6000, ordered: 3000 },
    { sku: 'SUC-DXT-001', clientId: 'cli-005', qtyKg: 42000, priceSell: 1.08, delivered: 18000, ordered: 8000 },
    { sku: 'BEU-TOU-001', clientId: 'cli-004', qtyKg: 28000, priceSell: 7.85, delivered: 12000, ordered: 5000 },
    { sku: 'BEU-TOU-001', clientId: 'cli-006', qtyKg: 45000, priceSell: 7.65, delivered: 20000, ordered: 8000 },
    { sku: 'BEU-TOU-001', clientId: 'cli-011', qtyKg: 35000, priceSell: 7.75, delivered: 14000, ordered: 6000 },
    { sku: 'BEU-PAT-001', clientId: 'cli-004', qtyKg: 22000, priceSell: 8.15, delivered: 8000, ordered: 4000 },
    { sku: 'BEU-PAT-001', clientId: 'cli-021', qtyKg: 18000, priceSell: 8.25, delivered: 6000, ordered: 3000 },
    { sku: 'MAR-VEG-001', clientId: 'cli-011', qtyKg: 35000, priceSell: 2.65, delivered: 15000, ordered: 6000 },
    { sku: 'MAR-VEG-001', clientId: 'cli-038', qtyKg: 28000, priceSell: 2.70, delivered: 10000, ordered: 5000 },
    { sku: 'HUI-TOU-001', clientId: 'cli-002', qtyKg: 85000, priceSell: 1.65, delivered: 40000, ordered: 15000 },
    { sku: 'HUI-TOU-001', clientId: 'cli-005', qtyKg: 120000, priceSell: 1.58, delivered: 60000, ordered: 20000 },
    { sku: 'HUI-TOU-001', clientId: 'cli-014', qtyKg: 65000, priceSell: 1.62, delivered: 28000, ordered: 12000 },
    { sku: 'HUI-COL-001', clientId: 'cli-005', qtyKg: 85000, priceSell: 1.52, delivered: 40000, ordered: 15000 },
    { sku: 'HUI-COL-001', clientId: 'cli-023', qtyKg: 45000, priceSell: 1.55, delivered: 18000, ordered: 8000 },
    { sku: 'HUI-OLI-001', clientId: 'cli-004', qtyKg: 18000, priceSell: 6.20, delivered: 6000, ordered: 3000 },
    { sku: 'HUI-OLI-001', clientId: 'cli-024', qtyKg: 12000, priceSell: 6.35, delivered: 4000, ordered: 2000 },
    { sku: 'CHO-NOI-001', clientId: 'cli-004', qtyKg: 35000, priceSell: 10.80, delivered: 15000, ordered: 6000 },
    { sku: 'CHO-NOI-001', clientId: 'cli-007', qtyKg: 55000, priceSell: 10.50, delivered: 25000, ordered: 10000 },
    { sku: 'CHO-NOI-001', clientId: 'cli-021', qtyKg: 28000, priceSell: 10.95, delivered: 10000, ordered: 5000 },
    { sku: 'CHO-LAI-001', clientId: 'cli-004', qtyKg: 42000, priceSell: 9.15, delivered: 18000, ordered: 7000 },
    { sku: 'CHO-LAI-001', clientId: 'cli-007', qtyKg: 65000, priceSell: 8.90, delivered: 30000, ordered: 12000 },
    { sku: 'CHO-LAI-001', clientId: 'cli-008', qtyKg: 38000, priceSell: 9.05, delivered: 15000, ordered: 6000 },
    { sku: 'CHO-BLA-001', clientId: 'cli-007', qtyKg: 32000, priceSell: 9.85, delivered: 12000, ordered: 5000 },
    { sku: 'CHO-BLA-001', clientId: 'cli-021', qtyKg: 22000, priceSell: 9.95, delivered: 8000, ordered: 4000 },
    { sku: 'CAC-POU-001', clientId: 'cli-004', qtyKg: 25000, priceSell: 6.65, delivered: 10000, ordered: 4000 },
    { sku: 'CAC-POU-001', clientId: 'cli-007', qtyKg: 18000, priceSell: 6.55, delivered: 6000, ordered: 3000 },
    { sku: 'CAC-BEU-001', clientId: 'cli-007', qtyKg: 15000, priceSell: 15.80, delivered: 5000, ordered: 2500 },
    { sku: 'LEV-BOU-001', clientId: 'cli-001', qtyKg: 4500, priceSell: 4.85, delivered: 2000, ordered: 800 },
    { sku: 'LEV-BOU-001', clientId: 'cli-018', qtyKg: 3800, priceSell: 4.90, delivered: 1500, ordered: 600 },
    { sku: 'LEV-SEC-001', clientId: 'cli-006', qtyKg: 8500, priceSell: 5.75, delivered: 3500, ordered: 1200 },
    { sku: 'LEV-SEC-001', clientId: 'cli-008', qtyKg: 6200, priceSell: 5.80, delivered: 2500, ordered: 900 },
    { sku: 'LEV-CHI-001', clientId: 'cli-008', qtyKg: 12000, priceSell: 2.85, delivered: 5000, ordered: 2000 },
    { sku: 'OEU-LIQ-001', clientId: 'cli-004', qtyKg: 35000, priceSell: 3.65, delivered: 15000, ordered: 6000 },
    { sku: 'OEU-LIQ-001', clientId: 'cli-006', qtyKg: 42000, priceSell: 3.55, delivered: 18000, ordered: 7000 },
    { sku: 'OEU-LIQ-001', clientId: 'cli-011', qtyKg: 28000, priceSell: 3.60, delivered: 12000, ordered: 5000 },
    { sku: 'OEU-JAU-001', clientId: 'cli-004', qtyKg: 15000, priceSell: 5.35, delivered: 5000, ordered: 2500 },
    { sku: 'OEU-JAU-001', clientId: 'cli-021', qtyKg: 12000, priceSell: 5.45, delivered: 4000, ordered: 2000 },
    { sku: 'OEU-BLA-001', clientId: 'cli-004', qtyKg: 10000, priceSell: 4.45, delivered: 3500, ordered: 1500 },
    { sku: 'OEU-BLA-001', clientId: 'cli-013', qtyKg: 8000, priceSell: 4.55, delivered: 2500, ordered: 1200 },
    { sku: 'LAI-ENT-001', clientId: 'cli-002', qtyKg: 125000, priceSell: 1.18, delivered: 65000, ordered: 20000 },
    { sku: 'LAI-ENT-001', clientId: 'cli-005', qtyKg: 95000, priceSell: 1.15, delivered: 50000, ordered: 15000 },
    { sku: 'LAI-ENT-001', clientId: 'cli-014', qtyKg: 85000, priceSell: 1.20, delivered: 40000, ordered: 15000 },
    { sku: 'LAI-ECR-001', clientId: 'cli-005', qtyKg: 65000, priceSell: 1.08, delivered: 30000, ordered: 10000 },
    { sku: 'LAI-ECR-001', clientId: 'cli-009', qtyKg: 28000, priceSell: 1.12, delivered: 12000, ordered: 5000 },
    { sku: 'CRE-FRA-001', clientId: 'cli-004', qtyKg: 22000, priceSell: 4.05, delivered: 8000, ordered: 4000 },
    { sku: 'CRE-FRA-001', clientId: 'cli-009', qtyKg: 18000, priceSell: 4.15, delivered: 6000, ordered: 3000 },
    { sku: 'CRE-FRA-001', clientId: 'cli-021', qtyKg: 15000, priceSell: 4.10, delivered: 5000, ordered: 2500 },
    { sku: 'LAI-POU-001', clientId: 'cli-005', qtyKg: 35000, priceSell: 4.85, delivered: 15000, ordered: 6000 },
    { sku: 'LAI-POU-001', clientId: 'cli-008', qtyKg: 28000, priceSell: 4.90, delivered: 10000, ordered: 5000 },
    { sku: 'AMI-MAI-001', clientId: 'cli-005', qtyKg: 55000, priceSell: 0.98, delivered: 25000, ordered: 10000 },
    { sku: 'AMI-MAI-001', clientId: 'cli-008', qtyKg: 42000, priceSell: 1.02, delivered: 18000, ordered: 8000 },
    { sku: 'AMI-BLE-001', clientId: 'cli-005', qtyKg: 38000, priceSell: 1.08, delivered: 15000, ordered: 6000 },
    { sku: 'AMI-BLE-001', clientId: 'cli-006', qtyKg: 32000, priceSell: 1.05, delivered: 12000, ordered: 5000 },
    { sku: 'AMI-POM-001', clientId: 'cli-022', qtyKg: 18000, priceSell: 1.22, delivered: 6000, ordered: 3000 },
    { sku: 'FRU-CON-001', clientId: 'cli-001', qtyKg: 25000, priceSell: 3.05, delivered: 10000, ordered: 4000 },
    { sku: 'FRU-CON-001', clientId: 'cli-004', qtyKg: 32000, priceSell: 2.98, delivered: 14000, ordered: 5000 },
    { sku: 'FRU-CON-001', clientId: 'cli-011', qtyKg: 28000, priceSell: 3.02, delivered: 10000, ordered: 5000 },
    { sku: 'FRU-PUR-001', clientId: 'cli-004', qtyKg: 18000, priceSell: 6.15, delivered: 6000, ordered: 3000 },
    { sku: 'FRU-PUR-001', clientId: 'cli-009', qtyKg: 12000, priceSell: 6.25, delivered: 4000, ordered: 2000 },
    { sku: 'FRU-SEC-001', clientId: 'cli-006', qtyKg: 22000, priceSell: 2.75, delivered: 8000, ordered: 4000 },
    { sku: 'FRU-SEC-001', clientId: 'cli-008', qtyKg: 18000, priceSell: 2.80, delivered: 6000, ordered: 3000 },
    { sku: 'NOI-AMA-001', clientId: 'cli-004', qtyKg: 15000, priceSell: 12.15, delivered: 5000, ordered: 2500 },
    { sku: 'NOI-AMA-001', clientId: 'cli-007', qtyKg: 18000, priceSell: 11.95, delivered: 6000, ordered: 3000 },
    { sku: 'NOI-AMA-001', clientId: 'cli-021', qtyKg: 12000, priceSell: 12.25, delivered: 4000, ordered: 2000 },
    { sku: 'NOI-NOI-001', clientId: 'cli-004', qtyKg: 12000, priceSell: 10.55, delivered: 4000, ordered: 2000 },
    { sku: 'NOI-NOI-001', clientId: 'cli-007', qtyKg: 15000, priceSell: 10.35, delivered: 5000, ordered: 2500 },
    { sku: 'NOI-PIS-001', clientId: 'cli-004', qtyKg: 8000, priceSell: 23.50, delivered: 2500, ordered: 1200 },
    { sku: 'NOI-PIS-001', clientId: 'cli-013', qtyKg: 5000, priceSell: 24.00, delivered: 1500, ordered: 800 },
    { sku: 'NOI-NOC-001', clientId: 'cli-007', qtyKg: 10000, priceSell: 4.15, delivered: 3500, ordered: 1500 },
    { sku: 'NOI-NOC-001', clientId: 'cli-008', qtyKg: 8000, priceSell: 4.20, delivered: 2500, ordered: 1200 },
    { sku: 'SEL-FIN-001', clientId: 'cli-002', qtyKg: 85000, priceSell: 0.25, delivered: 45000, ordered: 12000 },
    { sku: 'SEL-FIN-001', clientId: 'cli-005', qtyKg: 65000, priceSell: 0.24, delivered: 30000, ordered: 10000 },
    { sku: 'SEL-FIN-001', clientId: 'cli-014', qtyKg: 55000, priceSell: 0.26, delivered: 25000, ordered: 8000 },
    { sku: 'SEL-GRO-001', clientId: 'cli-022', qtyKg: 18000, priceSell: 0.58, delivered: 6000, ordered: 3000 },
    { sku: 'SEL-GRO-001', clientId: 'cli-024', qtyKg: 12000, priceSell: 0.62, delivered: 4000, ordered: 2000 },
    { sku: 'VAN-GOU-001', clientId: 'cli-004', qtyKg: 180, priceSell: 580.00, delivered: 60, ordered: 30 },
    { sku: 'VAN-GOU-001', clientId: 'cli-007', qtyKg: 150, priceSell: 565.00, delivered: 50, ordered: 25 },
    { sku: 'VAN-GOU-001', clientId: 'cli-021', qtyKg: 120, priceSell: 595.00, delivered: 35, ordered: 20 },
    { sku: 'VAN-EXT-001', clientId: 'cli-004', qtyKg: 850, priceSell: 108.00, delivered: 300, ordered: 120 },
    { sku: 'VAN-EXT-001', clientId: 'cli-007', qtyKg: 650, priceSell: 105.00, delivered: 220, ordered: 100 },
    { sku: 'ARO-CAF-001', clientId: 'cli-004', qtyKg: 3500, priceSell: 15.85, delivered: 1200, ordered: 500 },
    { sku: 'ARO-CAF-001', clientId: 'cli-009', qtyKg: 2800, priceSell: 16.20, delivered: 900, ordered: 400 },
  ];

  contractData.forEach((c, index) => {
    const client = clients.find(cl => cl.id === c.clientId)!;

    contracts.push({
      id: `cc-${String(index + 1).padStart(3, '0')}`,
      client_name: client.name,
      client_code: client.code,
      sku: c.sku,
      dates: {
        start: format(subDays(today, 90 + Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
        end: format(addDays(today, 90 + Math.floor(Math.random() * 90)), 'yyyy-MM-dd'),
      },
      price_sell: c.priceSell,
      price_unit: 'kg',
      qty_total_kg: c.qtyKg,
      qty_delivered_kg: c.delivered,
      qty_ordered_kg: c.ordered,
      deliveries: generateDeliveries(subDays(today, 60), Math.ceil(c.qtyKg / 5000), c.qtyKg, Math.max(3, Math.ceil(c.qtyKg / 15000))),
      status: 'active',
      payment_terms: ['30 jours fin de mois', '45 jours', '60 jours', 'Comptant'][Math.floor(Math.random() * 4)],
      notes: '',
    });
  });

  return contracts;
};

export const supplierContracts: SupplierContract[] = createSupplierContracts();
export const clientContracts: ClientContract[] = createClientContracts();

export const alerts: Alert[] = [
  { id: 'alert-001', created_at: format(subDays(today, 0), "yyyy-MM-dd'T'HH:mm:ss"), type: 'position_critical', severity: 'critical', sku: 'FAR-T65-001', message: 'Position critique sur Farine de blé T65 : déficit de 65 T avec livraison client dans 3 jours', is_read: false, is_resolved: false },
  { id: 'alert-002', created_at: format(subDays(today, 0), "yyyy-MM-dd'T'HH:mm:ss"), type: 'position_short', severity: 'warning', sku: 'SUC-INV-001', message: 'Position déficitaire sur Sucre inverti : -12.8 T', is_read: false, is_resolved: false },
  { id: 'alert-003', created_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss"), type: 'position_short', severity: 'warning', sku: 'BEU-TOU-001', message: 'Position déficitaire sur Beurre de tourage 82% : -8.5 T', is_read: false, is_resolved: false },
  { id: 'alert-004', created_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss"), type: 'delivery_delayed', severity: 'warning', partner_id: 'sup-015', contract_id: 'sc-054', message: 'Livraison retardée : Noisettes de Turquie - 3 jours de retard', is_read: true, is_resolved: false },
  { id: 'alert-005', created_at: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss"), type: 'contract_expiring', severity: 'info', contract_id: 'sc-012', sku: 'SUC-BLA-001', message: 'Contrat Sucrerie du Nord expire dans 30 jours', is_read: true, is_resolved: false },
  { id: 'alert-006', created_at: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss"), type: 'position_short', severity: 'warning', sku: 'CHO-NOI-001', message: 'Position déficitaire sur Chocolat noir 70% : -15.2 T', is_read: true, is_resolved: false },
  { id: 'alert-007', created_at: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss"), type: 'threshold_breach', severity: 'critical', sku: 'VAN-GOU-001', message: 'Seuil critique atteint sur Gousses de vanille Madagascar', is_read: true, is_resolved: true },
  { id: 'alert-008', created_at: format(subDays(today, 4), "yyyy-MM-dd'T'HH:mm:ss"), type: 'delivery_delayed', severity: 'warning', partner_id: 'sup-020', contract_id: 'sc-056', message: 'Livraison retardée : Coconut Philippines - 5 jours de retard', is_read: true, is_resolved: true },
  { id: 'alert-009', created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"), type: 'position_short', severity: 'warning', sku: 'NOI-AMA-001', message: 'Position déficitaire sur Amandes entières : -5.5 T', is_read: true, is_resolved: false },
  { id: 'alert-010', created_at: format(subDays(today, 6), "yyyy-MM-dd'T'HH:mm:ss"), type: 'contract_expiring', severity: 'info', contract_id: 'cc-045', message: 'Contrat Chocolaterie de Belgique expire dans 45 jours', is_read: true, is_resolved: false },
];

export const getArticleBySku = (sku: string): Article | undefined =>
  articles.find(a => a.sku === sku);

export const getSupplierContractsBySku = (sku: string): SupplierContract[] =>
  supplierContracts.filter(c => c.sku === sku && c.status === 'active');

export const getClientContractsBySku = (sku: string): ClientContract[] =>
  clientContracts.filter(c => c.sku === sku && c.status === 'active');

export const getPartnerById = (id: string): Partner | undefined =>
  partners.find(p => p.id === id);

export const getPartnerByCode = (code: string): Partner | undefined =>
  partners.find(p => p.code === code);

export const getSupplierContractsByPartner = (partnerId: string): SupplierContract[] => {
  const partner = getPartnerById(partnerId);
  if (!partner) return [];
  return supplierContracts.filter(c => c.supplier_code === partner.code);
};

export const getClientContractsByPartner = (partnerId: string): ClientContract[] => {
  const partner = getPartnerById(partnerId);
  if (!partner) return [];
  return clientContracts.filter(c => c.client_code === partner.code);
};

export const getUnreadAlertsCount = (): number =>
  alerts.filter(a => !a.is_read).length;

export const getUnresolvedAlerts = (): Alert[] =>
  alerts.filter(a => !a.is_resolved);

export const getCriticalAlerts = (): Alert[] =>
  alerts.filter(a => a.severity === 'critical' && !a.is_resolved);
