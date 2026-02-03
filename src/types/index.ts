export interface Article {
  sku: string;
  name: string;
  stock_uvc: number;
  stock_kg: number;
}

export interface SupplierContract {
  supplier_code: string;
  supplier_name: string;
  sku: string;
  supplier_sku: string;
  article_name: string;
  price_buy: number;
  price_unit: string;
  date_start: string;
  date_end: string;
  qty_contracted_uvc: number;
  qty_contracted_kg: number;
  qty_ordered_uvc: number;
  qty_received_uvc: number;
  qty_in_transit_uvc: number;
  qty_remaining_uvc: number;
  qty_remaining_kg: number;
  qty_in_transit_kg: number;
  status: 'active' | 'completed';
}

export interface ClientContract {
  contract_id: string;
  client_code: string;
  client_name: string;
  sku: string;
  article_name: string;
  date_start: string;
  date_end: string;
  price_sell: number;
  qty_contracted_uvc: number;
  qty_contracted_kg: number;
  qty_purchased_uvc: number;
  qty_purchased_kg: number;
  qty_remaining_uvc: number;
  qty_remaining_kg: number;
  status: 'active' | 'completed';
}

export interface PositionSummary {
  sku: string;
  article_name: string;
  stock_kg: number;
  stock_uvc: number;
  supply_remaining_kg: number;
  supply_remaining_uvc: number;
  supply_in_transit_kg: number;
  supply_in_transit_uvc: number;
  demand_remaining_kg: number;
  demand_remaining_uvc: number;
  total_available_kg: number;
  net_position_kg: number;
  net_position_uvc: number;
  status: 'LONG' | 'SHORT' | 'CRITICAL';
  supplier_contracts: number;
  client_contracts: number;
  avg_buy_price: number;
  avg_sell_price: number;
  margin_percent: number;
}

export interface Partner {
  code: string;
  name: string;
  type: 'supplier' | 'client';
  contracts_count: number;
  total_volume_kg: number;
}

export interface Alert {
  id: string;
  created_at: string;
  type: 'position_short' | 'position_critical' | 'contract_expiring';
  severity: 'critical' | 'warning' | 'info';
  sku?: string;
  message: string;
  is_read: boolean;
}
