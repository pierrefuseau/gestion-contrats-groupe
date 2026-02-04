/*
  # Fix Security Issues - Unused Indexes and Security Definer Views

  1. Dropped Unused Indexes
    - `idx_articles_name_gin` on articles table
    - `idx_supplier_contracts_sku` on supplier_contracts table
    - `idx_supplier_contracts_supplier_code` on supplier_contracts table
    - `idx_supplier_contracts_status` on supplier_contracts table
    - `idx_supplier_contracts_date_end` on supplier_contracts table
    - `idx_client_contracts_sku` on client_contracts table
    - `idx_client_contracts_client_code` on client_contracts table
    - `idx_client_contracts_status` on client_contracts table
    - `idx_client_contracts_date_end` on client_contracts table

  2. Security Changes
    - Recreated `clients_view` with SECURITY INVOKER
    - Recreated `suppliers_view` with SECURITY INVOKER
    - Recreated `positions_view` with SECURITY INVOKER

  Note: SECURITY INVOKER ensures queries run with the permissions of the
  calling user rather than the view owner, which is more secure.
*/

-- Drop unused indexes
DROP INDEX IF EXISTS public.idx_articles_name_gin;
DROP INDEX IF EXISTS public.idx_supplier_contracts_sku;
DROP INDEX IF EXISTS public.idx_supplier_contracts_supplier_code;
DROP INDEX IF EXISTS public.idx_supplier_contracts_status;
DROP INDEX IF EXISTS public.idx_supplier_contracts_date_end;
DROP INDEX IF EXISTS public.idx_client_contracts_sku;
DROP INDEX IF EXISTS public.idx_client_contracts_client_code;
DROP INDEX IF EXISTS public.idx_client_contracts_status;
DROP INDEX IF EXISTS public.idx_client_contracts_date_end;

-- Recreate clients_view with SECURITY INVOKER
DROP VIEW IF EXISTS public.clients_view;
CREATE VIEW public.clients_view
WITH (security_invoker = true)
AS
SELECT DISTINCT
  client_code,
  client_name,
  COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
  SUM(qty_remaining_kg) FILTER (WHERE status = 'active') as total_remaining_kg
FROM public.client_contracts
GROUP BY client_code, client_name
ORDER BY client_name;

-- Recreate suppliers_view with SECURITY INVOKER
DROP VIEW IF EXISTS public.suppliers_view;
CREATE VIEW public.suppliers_view
WITH (security_invoker = true)
AS
SELECT DISTINCT
  supplier_code,
  supplier_name,
  COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
  SUM(qty_remaining_kg) FILTER (WHERE status = 'active') as total_remaining_kg
FROM public.supplier_contracts
GROUP BY supplier_code, supplier_name
ORDER BY supplier_name;

-- Recreate positions_view with SECURITY INVOKER
DROP VIEW IF EXISTS public.positions_view;
CREATE VIEW public.positions_view
WITH (security_invoker = true)
AS
SELECT
  a.sku,
  a.name as article_name,
  COALESCE(a.stock_kg, 0) as stock_kg,
  COALESCE(sc_agg.supply_remaining_kg, 0) as supply_remaining_kg,
  COALESCE(sc_agg.supply_in_transit_kg, 0) as supply_in_transit_kg,
  COALESCE(cc_agg.demand_remaining_kg, 0) as demand_remaining_kg,
  COALESCE(a.stock_kg, 0) + COALESCE(sc_agg.supply_remaining_kg, 0) - COALESCE(cc_agg.demand_remaining_kg, 0) as net_position_kg,
  COALESCE(sc_agg.avg_buy_price, 0) as avg_buy_price,
  COALESCE(cc_agg.avg_sell_price, 0) as avg_sell_price,
  CASE
    WHEN COALESCE(sc_agg.avg_buy_price, 0) > 0
    THEN ((COALESCE(cc_agg.avg_sell_price, 0) - COALESCE(sc_agg.avg_buy_price, 0)) / sc_agg.avg_buy_price) * 100
    ELSE 0
  END as margin_percent,
  CASE
    WHEN COALESCE(a.stock_kg, 0) + COALESCE(sc_agg.supply_remaining_kg, 0) - COALESCE(cc_agg.demand_remaining_kg, 0) < -1000 THEN 'CRITICAL'
    WHEN COALESCE(a.stock_kg, 0) + COALESCE(sc_agg.supply_remaining_kg, 0) - COALESCE(cc_agg.demand_remaining_kg, 0) < 0 THEN 'SHORT'
    WHEN COALESCE(a.stock_kg, 0) + COALESCE(sc_agg.supply_remaining_kg, 0) - COALESCE(cc_agg.demand_remaining_kg, 0) > 1000 THEN 'LONG'
    ELSE 'BALANCED'
  END as status
FROM public.articles a
LEFT JOIN (
  SELECT
    sku,
    SUM(qty_remaining_kg) as supply_remaining_kg,
    SUM(qty_in_transit_kg) as supply_in_transit_kg,
    SUM(price_buy * qty_remaining_kg) / NULLIF(SUM(qty_remaining_kg), 0) as avg_buy_price
  FROM public.supplier_contracts
  WHERE status = 'active'
  GROUP BY sku
) sc_agg ON a.sku = sc_agg.sku
LEFT JOIN (
  SELECT
    sku,
    SUM(qty_remaining_kg) as demand_remaining_kg,
    SUM(price_sell * qty_remaining_kg) / NULLIF(SUM(qty_remaining_kg), 0) as avg_sell_price
  FROM public.client_contracts
  WHERE status = 'active'
  GROUP BY sku
) cc_agg ON a.sku = cc_agg.sku
WHERE EXISTS (
  SELECT 1 FROM public.supplier_contracts sc WHERE sc.sku = a.sku AND sc.status = 'active'
) OR EXISTS (
  SELECT 1 FROM public.client_contracts cc WHERE cc.sku = a.sku AND cc.status = 'active'
);
