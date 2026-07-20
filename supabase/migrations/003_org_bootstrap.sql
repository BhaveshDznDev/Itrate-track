-- ─────────────────────────────────────────────────────────────
-- IterateTrack — Org creation bootstrap fix
-- admins_manage_members requires org_role(org_id) = 'admin', which
-- makes it impossible to insert the *first* member of a brand new
-- org (nobody is admin yet). Add a narrow policy that only allows
-- a user to insert themselves as admin when the org has no members.
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "bootstrap_first_admin" ON org_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'
    AND NOT EXISTS (
      SELECT 1 FROM org_members m WHERE m.org_id = org_members.org_id
    )
  );
