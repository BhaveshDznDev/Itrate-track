-- ─────────────────────────────────────────────────────────────
-- IterateTrack — Row Level Security
-- Default: locked down. Explicitly opened per table.
-- ─────────────────────────────────────────────────────────────

-- Helper: is the current user a member of a given org?
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = $1
      AND org_members.user_id = auth.uid()
  );
$$;

-- Helper: what role does the current user have in an org?
CREATE OR REPLACE FUNCTION org_role(org_id UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM org_members
  WHERE org_members.org_id = $1
    AND org_members.user_id = auth.uid()
  LIMIT 1;
$$;

-- Helper: is user admin or pm in the org?
CREATE OR REPLACE FUNCTION is_org_pm_or_admin(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT org_role($1) IN ('admin', 'pm');
$$;

-- ─── ORGANIZATIONS ───────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Members can read their org
CREATE POLICY "members_read_org" ON organizations
  FOR SELECT USING (is_org_member(id));

-- Admins can update their org
CREATE POLICY "admins_update_org" ON organizations
  FOR UPDATE USING (org_role(id) = 'admin');

-- Any authenticated user can create an org (they become admin in the same transaction)
CREATE POLICY "auth_users_create_org" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ─── PROFILES ────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read any profile (needed for displaying names in shared orgs)
CREATE POLICY "authenticated_read_profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only update their own profile
CREATE POLICY "own_profile_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ─── ORG MEMBERS ─────────────────────────────────────────────
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Members can see who else is in their org
CREATE POLICY "members_read_org_members" ON org_members
  FOR SELECT USING (is_org_member(org_id));

-- Admins can manage membership
CREATE POLICY "admins_manage_members" ON org_members
  FOR ALL USING (org_role(org_id) = 'admin');

-- Users can see their own memberships (for org-switching)
CREATE POLICY "own_memberships" ON org_members
  FOR SELECT USING (user_id = auth.uid());

-- ─── ITEMS ───────────────────────────────────────────────────
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- All org members can read items
CREATE POLICY "members_read_items" ON items
  FOR SELECT USING (is_org_member(org_id));

-- PMs and admins can create items
CREATE POLICY "pm_create_items" ON items
  FOR INSERT WITH CHECK (is_org_pm_or_admin(org_id));

-- PMs and admins can update items; contributors can update items they own
CREATE POLICY "pm_update_items" ON items
  FOR UPDATE USING (
    is_org_pm_or_admin(org_id)
    OR (org_role(org_id) = 'contributor' AND owner_id = auth.uid())
  );

-- Only admins can delete items
CREATE POLICY "admin_delete_items" ON items
  FOR DELETE USING (org_role(org_id) = 'admin');

-- ─── ARTIFACTS ───────────────────────────────────────────────
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

-- All members of the item's org can read artifacts
CREATE POLICY "members_read_artifacts" ON artifacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = artifacts.item_id
        AND is_org_member(items.org_id)
    )
  );

-- PMs, admins, and contributors can upsert artifacts
CREATE POLICY "pm_upsert_artifacts" ON artifacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = artifacts.item_id
        AND is_org_pm_or_admin(items.org_id)
    )
  );

-- ─── ACTIVITY LOG ────────────────────────────────────────────
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- All org members can read activity
CREATE POLICY "members_read_activity" ON activity_log
  FOR SELECT USING (is_org_member(org_id));

-- Any org member can insert activity (comments, etc.)
CREATE POLICY "members_insert_activity" ON activity_log
  FOR INSERT WITH CHECK (is_org_member(org_id));

-- ─── GATE APPROVALS ──────────────────────────────────────────
ALTER TABLE gate_approvals ENABLE ROW LEVEL SECURITY;

-- All org members can read gate approvals
CREATE POLICY "members_read_gates" ON gate_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = gate_approvals.item_id
        AND is_org_member(items.org_id)
    )
  );

-- PMs and admins can create/update gate approvals
CREATE POLICY "pm_manage_gates" ON gate_approvals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = gate_approvals.item_id
        AND is_org_pm_or_admin(items.org_id)
    )
  );
