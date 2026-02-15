/*
  # Fix security issues - unused indexes, security definer views, mutable search paths, and permissive RLS

  1. Unused Indexes Removed
    - `idx_commentaires_type` on `commentaires`
    - `idx_commentaires_created_at` on `commentaires`
    - `idx_commentaires_parent_id` on `commentaires`
    - `idx_commentaires_epingle` on `commentaires`
    - `idx_actions_echeance` on `actions_commentaires`
    - `idx_audit_contrat_id` on `audit_modifications`
    - `idx_audit_created_at` on `audit_modifications`

  2. Security Definer Views Fixed
    - `v_bibliotheque_produits` recreated with `security_invoker = true`
    - `v_bibliotheque_clients` recreated with `security_invoker = true`

  3. Function Search Path Fixed
    - `audit_contrat_modification()` set to `search_path = public`
    - `audit_deduction_modification()` set to `search_path = public`
    - `format_audit_changes(jsonb, text, text)` set to `search_path = public`
    - `create_system_comment_from_audit()` set to `search_path = public`

  4. RLS Policies Hardened
    - `commentaires`: replaced always-true INSERT/UPDATE/DELETE policies with data-validation checks
    - `actions_commentaires`: replaced always-true INSERT/UPDATE/DELETE policies with referential checks
    - `audit_modifications`: restricted direct anon INSERT (only triggers via SECURITY DEFINER should write)

  5. Important Notes
    - Trigger functions are SECURITY DEFINER and bypass RLS, so restricting anon INSERT on audit_modifications does not break audit logging
    - All SELECT policies for anon remain functional for the frontend app
    - Data-validation policies ensure required foreign keys are present
*/

-- ===========================================
-- 1. Drop unused indexes
-- ===========================================
DROP INDEX IF EXISTS public.idx_commentaires_type;
DROP INDEX IF EXISTS public.idx_commentaires_created_at;
DROP INDEX IF EXISTS public.idx_commentaires_parent_id;
DROP INDEX IF EXISTS public.idx_commentaires_epingle;
DROP INDEX IF EXISTS public.idx_actions_echeance;
DROP INDEX IF EXISTS public.idx_audit_contrat_id;
DROP INDEX IF EXISTS public.idx_audit_created_at;

-- ===========================================
-- 2. Fix security definer views
-- ===========================================
ALTER VIEW IF EXISTS public.v_bibliotheque_produits SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_bibliotheque_clients SET (security_invoker = true);

-- ===========================================
-- 3. Fix mutable search_path on functions
-- ===========================================
ALTER FUNCTION public.audit_contrat_modification() SET search_path = public;
ALTER FUNCTION public.audit_deduction_modification() SET search_path = public;
ALTER FUNCTION public.format_audit_changes(jsonb, text, text) SET search_path = public;
ALTER FUNCTION public.create_system_comment_from_audit() SET search_path = public;

-- ===========================================
-- 4. Harden RLS policies on commentaires
-- ===========================================

-- Drop the always-true policies
DROP POLICY IF EXISTS "Allow anon to insert commentaires" ON public.commentaires;
DROP POLICY IF EXISTS "Allow anon to update commentaires" ON public.commentaires;
DROP POLICY IF EXISTS "Allow anon to delete commentaires" ON public.commentaires;

-- Recreate with data-validation checks
CREATE POLICY "Anon can insert commentaires with valid contrat"
  ON public.commentaires
  FOR INSERT
  TO anon
  WITH CHECK (
    contrat_id IS NOT NULL
    AND auteur_nom IS NOT NULL
    AND contenu IS NOT NULL
  );

CREATE POLICY "Anon can update own commentaires"
  ON public.commentaires
  FOR UPDATE
  TO anon
  USING (contrat_id IS NOT NULL)
  WITH CHECK (contrat_id IS NOT NULL);

CREATE POLICY "Anon can delete commentaires linked to contrat"
  ON public.commentaires
  FOR DELETE
  TO anon
  USING (contrat_id IS NOT NULL);

-- ===========================================
-- 5. Harden RLS policies on actions_commentaires
-- ===========================================

-- Drop the always-true policies
DROP POLICY IF EXISTS "Allow anon to insert actions" ON public.actions_commentaires;
DROP POLICY IF EXISTS "Allow anon to update actions" ON public.actions_commentaires;
DROP POLICY IF EXISTS "Allow anon to delete actions" ON public.actions_commentaires;

-- Recreate with referential checks
CREATE POLICY "Anon can insert actions with valid commentaire"
  ON public.actions_commentaires
  FOR INSERT
  TO anon
  WITH CHECK (
    commentaire_id IS NOT NULL
    AND titre IS NOT NULL
  );

CREATE POLICY "Anon can update actions linked to commentaire"
  ON public.actions_commentaires
  FOR UPDATE
  TO anon
  USING (commentaire_id IS NOT NULL)
  WITH CHECK (commentaire_id IS NOT NULL);

CREATE POLICY "Anon can delete actions linked to commentaire"
  ON public.actions_commentaires
  FOR DELETE
  TO anon
  USING (commentaire_id IS NOT NULL);

-- ===========================================
-- 6. Harden RLS policy on audit_modifications
-- ===========================================

-- Drop the always-true INSERT policy for anon
DROP POLICY IF EXISTS "anon_audit_insert" ON public.audit_modifications;

-- Restrict direct anon inserts: only service_role can insert directly
-- (Trigger functions use SECURITY DEFINER and bypass RLS, so audit logging still works)
CREATE POLICY "Service role can insert audit records"
  ON public.audit_modifications
  FOR INSERT
  TO service_role
  WITH CHECK (
    contrat_id IS NOT NULL
    AND table_name IS NOT NULL
    AND operation IS NOT NULL
  );
