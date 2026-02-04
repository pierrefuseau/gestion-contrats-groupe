/*
  # Fix Security Issues

  1. Unused Indexes Removal
    - Drop `idx_supplier_contracts_sku` (unused)
    - Drop `idx_client_contracts_sku` (unused)
    - Drop `idx_supplier_contracts_supplier_code` (unused)
    - Drop `idx_client_contracts_client_code` (unused)
    - Drop `idx_supplier_contracts_status` (unused)
    - Drop `idx_client_contracts_status` (unused)

  2. RLS Policy Fixes
    - Remove overly permissive INSERT/UPDATE/DELETE policies for anonymous users
    - Tables affected: articles, client_contracts, supplier_contracts, data_sync_log
    - Keep SELECT policies for read access
    - This makes tables read-only for anonymous users (data sync should use service role)

  3. Security Notes
    - Anonymous users can only READ data
    - Write operations require authenticated access or service role key
    - Data sync operations should be performed via edge functions using service role
*/

-- =====================================================
-- 1. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_supplier_contracts_sku;
DROP INDEX IF EXISTS idx_client_contracts_sku;
DROP INDEX IF EXISTS idx_supplier_contracts_supplier_code;
DROP INDEX IF EXISTS idx_client_contracts_client_code;
DROP INDEX IF EXISTS idx_supplier_contracts_status;
DROP INDEX IF EXISTS idx_client_contracts_status;

-- =====================================================
-- 2. FIX RLS POLICIES - ARTICLES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow anonymous delete from articles" ON articles;
DROP POLICY IF EXISTS "Allow anonymous insert to articles" ON articles;
DROP POLICY IF EXISTS "Allow anonymous update to articles" ON articles;

CREATE POLICY "Service role can insert articles"
  ON articles FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update articles"
  ON articles FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete articles"
  ON articles FOR DELETE
  TO service_role
  USING (true);

-- =====================================================
-- 3. FIX RLS POLICIES - CLIENT_CONTRACTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow anonymous delete from client_contracts" ON client_contracts;
DROP POLICY IF EXISTS "Allow anonymous insert to client_contracts" ON client_contracts;
DROP POLICY IF EXISTS "Allow anonymous update to client_contracts" ON client_contracts;

CREATE POLICY "Service role can insert client_contracts"
  ON client_contracts FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update client_contracts"
  ON client_contracts FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete client_contracts"
  ON client_contracts FOR DELETE
  TO service_role
  USING (true);

-- =====================================================
-- 4. FIX RLS POLICIES - SUPPLIER_CONTRACTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow anonymous delete from supplier_contracts" ON supplier_contracts;
DROP POLICY IF EXISTS "Allow anonymous insert to supplier_contracts" ON supplier_contracts;
DROP POLICY IF EXISTS "Allow anonymous update to supplier_contracts" ON supplier_contracts;

CREATE POLICY "Service role can insert supplier_contracts"
  ON supplier_contracts FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update supplier_contracts"
  ON supplier_contracts FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete supplier_contracts"
  ON supplier_contracts FOR DELETE
  TO service_role
  USING (true);

-- =====================================================
-- 5. FIX RLS POLICIES - DATA_SYNC_LOG TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow anonymous insert to data_sync_log" ON data_sync_log;

CREATE POLICY "Service role can insert data_sync_log"
  ON data_sync_log FOR INSERT
  TO service_role
  WITH CHECK (true);