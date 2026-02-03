/*
  # Add write policies for data synchronization

  1. Changes
    - Add INSERT policy for articles table
    - Add UPDATE policy for articles table
    - Add DELETE policy for articles table
    - Add INSERT policy for supplier_contracts table
    - Add UPDATE policy for supplier_contracts table
    - Add DELETE policy for supplier_contracts table
    - Add INSERT policy for client_contracts table
    - Add UPDATE policy for client_contracts table
    - Add DELETE policy for client_contracts table
    - Add INSERT policy for data_sync_log table

  2. Security
    - Policies allow anonymous access for this internal application
    - This enables Google Sheets sync to write data to Supabase
*/

CREATE POLICY "Allow anonymous insert to articles"
  ON articles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to articles"
  ON articles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from articles"
  ON articles FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert to supplier_contracts"
  ON supplier_contracts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to supplier_contracts"
  ON supplier_contracts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from supplier_contracts"
  ON supplier_contracts FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert to client_contracts"
  ON client_contracts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to client_contracts"
  ON client_contracts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from client_contracts"
  ON client_contracts FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert to data_sync_log"
  ON data_sync_log FOR INSERT
  TO anon
  WITH CHECK (true);
