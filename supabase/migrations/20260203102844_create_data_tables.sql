/*
  # Create AgriTrade Data Tables

  1. New Tables
    - `articles`
      - `sku` (text, primary key) - Unique product identifier
      - `name` (text) - Product name
      - `stock_uvc` (integer) - Stock in units
      - `stock_kg` (numeric) - Stock in kilograms
      - `updated_at` (timestamptz) - Last update timestamp

    - `supplier_contracts`
      - `id` (uuid, primary key) - Auto-generated ID
      - `supplier_code` (text) - Supplier identifier
      - `supplier_name` (text) - Supplier name
      - `sku` (text) - Product SKU reference
      - `supplier_sku` (text) - Supplier's product reference
      - `article_name` (text) - Product name
      - `price_buy` (numeric) - Purchase price
      - `date_start` (date) - Contract start date
      - `date_end` (date) - Contract end date
      - `qty_contracted_uvc` (integer) - Contracted quantity in units
      - `qty_contracted_kg` (numeric) - Contracted quantity in kg
      - `qty_ordered_uvc` (integer) - Ordered quantity
      - `qty_received_uvc` (integer) - Received quantity
      - `qty_in_transit_uvc` (integer) - In transit quantity
      - `qty_remaining_uvc` (integer) - Remaining quantity in units
      - `qty_remaining_kg` (numeric) - Remaining quantity in kg
      - `qty_in_transit_kg` (numeric) - In transit quantity in kg
      - `status` (text) - Contract status (active/completed)

    - `client_contracts`
      - `id` (uuid, primary key) - Auto-generated ID
      - `contract_id` (text) - Contract reference
      - `client_code` (text) - Client identifier
      - `client_name` (text) - Client name
      - `sku` (text) - Product SKU reference
      - `article_name` (text) - Product name
      - `date_start` (date) - Contract start date
      - `date_end` (date) - Contract end date
      - `price_sell` (numeric) - Selling price
      - `qty_contracted_uvc` (integer) - Contracted quantity in units
      - `qty_contracted_kg` (numeric) - Contracted quantity in kg
      - `qty_purchased_uvc` (integer) - Purchased quantity
      - `qty_purchased_kg` (numeric) - Purchased quantity in kg
      - `qty_remaining_uvc` (integer) - Remaining quantity in units
      - `qty_remaining_kg` (numeric) - Remaining quantity in kg
      - `status` (text) - Contract status (active/completed)

    - `data_sync_log`
      - `id` (uuid, primary key) - Auto-generated ID
      - `synced_at` (timestamptz) - Sync timestamp
      - `source` (text) - Data source (google_sheets)
      - `articles_count` (integer) - Number of articles synced
      - `supplier_contracts_count` (integer) - Number of supplier contracts synced
      - `client_contracts_count` (integer) - Number of client contracts synced

  2. Indexes
    - Index on `supplier_contracts.sku` for fast lookups
    - Index on `client_contracts.sku` for fast lookups
    - Index on `supplier_contracts.supplier_code` for partner queries
    - Index on `client_contracts.client_code` for partner queries
    - Index on `supplier_contracts.status` for filtering
    - Index on `client_contracts.status` for filtering

  3. Security
    - Enable RLS on all tables
    - Allow anonymous read access for public data display
*/

CREATE TABLE IF NOT EXISTS articles (
  sku text PRIMARY KEY,
  name text NOT NULL,
  stock_uvc integer NOT NULL DEFAULT 0,
  stock_kg numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code text NOT NULL,
  supplier_name text NOT NULL,
  sku text NOT NULL,
  supplier_sku text,
  article_name text NOT NULL,
  price_buy numeric NOT NULL DEFAULT 0,
  date_start date,
  date_end date,
  qty_contracted_uvc integer NOT NULL DEFAULT 0,
  qty_contracted_kg numeric NOT NULL DEFAULT 0,
  qty_ordered_uvc integer NOT NULL DEFAULT 0,
  qty_received_uvc integer NOT NULL DEFAULT 0,
  qty_in_transit_uvc integer NOT NULL DEFAULT 0,
  qty_remaining_uvc integer NOT NULL DEFAULT 0,
  qty_remaining_kg numeric NOT NULL DEFAULT 0,
  qty_in_transit_kg numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id text NOT NULL,
  client_code text NOT NULL,
  client_name text NOT NULL,
  sku text NOT NULL,
  article_name text NOT NULL,
  date_start date,
  date_end date,
  price_sell numeric NOT NULL DEFAULT 0,
  qty_contracted_uvc integer NOT NULL DEFAULT 0,
  qty_contracted_kg numeric NOT NULL DEFAULT 0,
  qty_purchased_uvc integer NOT NULL DEFAULT 0,
  qty_purchased_kg numeric NOT NULL DEFAULT 0,
  qty_remaining_uvc integer NOT NULL DEFAULT 0,
  qty_remaining_kg numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at timestamptz DEFAULT now(),
  source text NOT NULL DEFAULT 'google_sheets',
  articles_count integer NOT NULL DEFAULT 0,
  supplier_contracts_count integer NOT NULL DEFAULT 0,
  client_contracts_count integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_supplier_contracts_sku ON supplier_contracts(sku);
CREATE INDEX IF NOT EXISTS idx_client_contracts_sku ON client_contracts(sku);
CREATE INDEX IF NOT EXISTS idx_supplier_contracts_supplier_code ON supplier_contracts(supplier_code);
CREATE INDEX IF NOT EXISTS idx_client_contracts_client_code ON client_contracts(client_code);
CREATE INDEX IF NOT EXISTS idx_supplier_contracts_status ON supplier_contracts(status);
CREATE INDEX IF NOT EXISTS idx_client_contracts_status ON client_contracts(status);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to articles"
  ON articles
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read access to supplier_contracts"
  ON supplier_contracts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read access to client_contracts"
  ON client_contracts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read access to data_sync_log"
  ON data_sync_log
  FOR SELECT
  TO anon
  USING (true);
