/*
  # Recreate FUSEAU Views

  1. Views
    - `suppliers_view` - Fournisseurs agreges depuis contrats actifs
    - `clients_view` - Clients agreges depuis contrats actifs
    - `positions_view` - Positions nettes par SKU
*/

-- ============================================
-- VUE: suppliers_view (fournisseurs agreges)
-- ============================================
CREATE OR REPLACE VIEW suppliers_view AS
SELECT 
  supplier_code as code,
  MAX(supplier_name) as name,
  'supplier' as type,
  COUNT(*) FILTER (WHERE status = 'active') as contracts_count,
  COALESCE(SUM(CASE WHEN status = 'active' THEN qty_contracted_kg ELSE 0 END), 0) as total_volume_kg
FROM supplier_contracts
GROUP BY supplier_code
HAVING COUNT(*) FILTER (WHERE status = 'active') > 0
ORDER BY total_volume_kg DESC;

-- ============================================
-- VUE: clients_view (clients agreges)
-- ============================================
CREATE OR REPLACE VIEW clients_view AS
SELECT 
  client_code as code,
  MAX(client_name) as name,
  'client' as type,
  COUNT(*) FILTER (WHERE status = 'active') as contracts_count,
  COALESCE(SUM(CASE WHEN status = 'active' THEN qty_contracted_kg ELSE 0 END), 0) as total_volume_kg
FROM client_contracts
GROUP BY client_code
HAVING COUNT(*) FILTER (WHERE status = 'active') > 0
ORDER BY total_volume_kg DESC;

-- ============================================
-- VUE: positions_view (positions par SKU)
-- ============================================
CREATE OR REPLACE VIEW positions_view AS
WITH article_base AS (
  SELECT 
    LOWER(sku) as sku_lower,
    sku,
    name as article_name,
    stock_uvc,
    stock_kg
  FROM articles
),
supplier_agg AS (
  SELECT 
    LOWER(sku) as sku_lower,
    COALESCE(SUM(CASE WHEN status = 'active' THEN qty_remaining_uvc ELSE 0 END), 0) as supply_remaining_uvc,
    COALESCE(SUM(CASE WHEN status = 'active' THEN qty_remaining_kg ELSE 0 END), 0) as supply_remaining_kg,
    COALESCE(SUM(CASE WHEN status = 'active' THEN qty_in_transit_uvc ELSE 0 END), 0) as supply_in_transit_uvc,
    COALESCE(SUM(CASE WHEN status = 'active' THEN qty_in_transit_kg ELSE 0 END), 0) as supply_in_transit_kg,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as supplier_contracts_count,
    CASE 
      WHEN SUM(CASE WHEN status = 'active' THEN qty_contracted_kg ELSE 0 END) > 0 
      THEN SUM(CASE WHEN status = 'active' THEN price_buy * qty_contracted_kg ELSE 0 END) / 
           NULLIF(SUM(CASE WHEN status = 'active' THEN qty_contracted_kg ELSE 0 END), 0)
      ELSE 0 
    END as avg_buy_price
  FROM supplier_contracts
  GROUP BY LOWER(sku)
),
client_agg AS (
  SELECT 
    LOWER(sku) as sku_lower,
    COALESCE(SUM(CASE WHEN status = 'active' THEN qty_remaining_uvc ELSE 0 END), 0) as demand_remaining_uvc,
    COALESCE(SUM(CASE WHEN status = 'active' THEN qty_remaining_kg ELSE 0 END), 0) as demand_remaining_kg,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as client_contracts_count,
    CASE 
      WHEN SUM(CASE WHEN status = 'active' THEN qty_contracted_kg ELSE 0 END) > 0 
      THEN SUM(CASE WHEN status = 'active' THEN price_sell * qty_contracted_kg ELSE 0 END) / 
           NULLIF(SUM(CASE WHEN status = 'active' THEN qty_contracted_kg ELSE 0 END), 0)
      ELSE 0 
    END as avg_sell_price
  FROM client_contracts
  GROUP BY LOWER(sku)
),
all_skus AS (
  SELECT DISTINCT sku_lower FROM (
    SELECT LOWER(sku) as sku_lower FROM articles WHERE sku IS NOT NULL AND sku != ''
    UNION
    SELECT LOWER(sku) as sku_lower FROM supplier_contracts WHERE sku IS NOT NULL AND sku != ''
    UNION
    SELECT LOWER(sku) as sku_lower FROM client_contracts WHERE sku IS NOT NULL AND sku != ''
  ) combined
)
SELECT 
  all_skus.sku_lower,
  COALESCE(a.sku, UPPER(all_skus.sku_lower)) as sku,
  COALESCE(a.article_name, 
    (SELECT article_name FROM supplier_contracts WHERE LOWER(sku) = all_skus.sku_lower LIMIT 1),
    (SELECT article_name FROM client_contracts WHERE LOWER(sku) = all_skus.sku_lower LIMIT 1),
    UPPER(all_skus.sku_lower)
  ) as article_name,
  COALESCE(a.stock_uvc, 0)::INTEGER as stock_uvc,
  COALESCE(a.stock_kg, 0)::NUMERIC as stock_kg,
  COALESCE(s.supply_remaining_uvc, 0)::INTEGER as supply_remaining_uvc,
  COALESCE(s.supply_remaining_kg, 0)::NUMERIC as supply_remaining_kg,
  COALESCE(s.supply_in_transit_uvc, 0)::INTEGER as supply_in_transit_uvc,
  COALESCE(s.supply_in_transit_kg, 0)::NUMERIC as supply_in_transit_kg,
  COALESCE(c.demand_remaining_uvc, 0)::INTEGER as demand_remaining_uvc,
  COALESCE(c.demand_remaining_kg, 0)::NUMERIC as demand_remaining_kg,
  (COALESCE(a.stock_kg, 0) + COALESCE(s.supply_remaining_kg, 0) + COALESCE(s.supply_in_transit_kg, 0))::NUMERIC as total_available_kg,
  (COALESCE(a.stock_kg, 0) + COALESCE(s.supply_remaining_kg, 0) + COALESCE(s.supply_in_transit_kg, 0) - COALESCE(c.demand_remaining_kg, 0))::NUMERIC as net_position_kg,
  (COALESCE(a.stock_uvc, 0) + COALESCE(s.supply_remaining_uvc, 0) + COALESCE(s.supply_in_transit_uvc, 0) - COALESCE(c.demand_remaining_uvc, 0))::INTEGER as net_position_uvc,
  CASE 
    WHEN (COALESCE(a.stock_kg, 0) + COALESCE(s.supply_remaining_kg, 0) + COALESCE(s.supply_in_transit_kg, 0) - COALESCE(c.demand_remaining_kg, 0)) < -100 THEN 'CRITICAL'
    WHEN (COALESCE(a.stock_kg, 0) + COALESCE(s.supply_remaining_kg, 0) + COALESCE(s.supply_in_transit_kg, 0) - COALESCE(c.demand_remaining_kg, 0)) < 0 THEN 'SHORT'
    ELSE 'LONG'
  END as status,
  COALESCE(s.supplier_contracts_count, 0)::INTEGER as supplier_contracts,
  COALESCE(c.client_contracts_count, 0)::INTEGER as client_contracts,
  COALESCE(s.avg_buy_price, 0)::NUMERIC as avg_buy_price,
  COALESCE(c.avg_sell_price, 0)::NUMERIC as avg_sell_price,
  CASE 
    WHEN COALESCE(s.avg_buy_price, 0) > 0 
    THEN ((COALESCE(c.avg_sell_price, 0) - COALESCE(s.avg_buy_price, 0)) / s.avg_buy_price * 100)
    ELSE 0 
  END::NUMERIC as margin_percent
FROM all_skus
LEFT JOIN article_base a ON a.sku_lower = all_skus.sku_lower
LEFT JOIN supplier_agg s ON s.sku_lower = all_skus.sku_lower
LEFT JOIN client_agg c ON c.sku_lower = all_skus.sku_lower
ORDER BY net_position_kg ASC;