-- ─────────────────────────────────────────────────────────────
-- IterateTrack — Initial Schema
-- Run this in your Supabase SQL editor after creating the project.
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ORGANIZATIONS ───────────────────────────────────────────
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROFILES (extends auth.users) ───────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── ORG MEMBERS ─────────────────────────────────────────────
CREATE TABLE org_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'pm', 'contributor', 'viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_org_members_org  ON org_members(org_id);

-- ─── ITEMS (core entity) ─────────────────────────────────────
CREATE TABLE items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  problem_statement TEXT,
  stage        TEXT NOT NULL DEFAULT 'intake'
                 CHECK (stage IN ('intake','discovery','shaping','delivery','live','retirement')),
  status       TEXT NOT NULL DEFAULT 'submitted',
  categories   TEXT[] NOT NULL DEFAULT '{}',
  product_area TEXT,
  urgency      TEXT CHECK (urgency IN ('low','medium','high')),
  owner_id     UUID REFERENCES profiles(id),
  requester_id UUID REFERENCES profiles(id),
  source       TEXT,
  source_links TEXT[] NOT NULL DEFAULT '{}',
  archived_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_org   ON items(org_id);
CREATE INDEX idx_items_stage ON items(org_id, stage);
CREATE INDEX idx_items_owner ON items(owner_id);

-- ─── ARTIFACTS ───────────────────────────────────────────────
-- One row per (item, artifact_type). data is a typed JSONB blob.
CREATE TABLE artifacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  stage         TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  -- artifact_type values:
  --  intake: 'intake_submission' | 'triage_decision' | 'intake_one_pager'
  --  discovery: 'discovery_brief' | 'research_notes' | 'data_summary' |
  --             'assumptions_log' | 'risks_log' | 'alternatives' | 'draft_prd' | 'decision_record'
  --  shaping: 'final_prd' | 'ux_flows' | 'tech_approach' | 'tradeoff_log' |
  --           'effort_assessment' | 'compliance_review' | 'rollout_plan' |
  --           'metrics_definition' | 'approval_record'
  --  delivery: 'implementation_tickets' | 'test_plan' | 'qa_signoff' |
  --            'security_review' | 'compliance_checklist' | 'release_notes' |
  --            'runbook' | 'release_readiness'
  --  live: 'launch_announcement' | 'monitoring_setup' | 'feedback_log' |
  --        'incident_report' | 'post_launch_review'
  --  retirement: 'retirement_decision' | 'deprecation_notice' | 'comms_plan' |
  --              'migration_guide' | 'sunset_checklist' | 'retro_summary'
  data          JSONB NOT NULL DEFAULT '{}',
  created_by    UUID REFERENCES profiles(id),
  updated_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id, artifact_type)
);

CREATE INDEX idx_artifacts_item ON artifacts(item_id);

-- ─── ACTIVITY LOG ────────────────────────────────────────────
CREATE TABLE activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES profiles(id),
  type        TEXT NOT NULL CHECK (type IN (
                'item_created','stage_change','status_change',
                'comment','artifact_update','gate_approval')),
  payload     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_item ON activity_log(item_id);
CREATE INDEX idx_activity_org  ON activity_log(org_id);

-- ─── GATE APPROVALS ──────────────────────────────────────────
CREATE TABLE gate_approvals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  stage       TEXT NOT NULL,
  gate_type   TEXT NOT NULL,
  approver_id UUID REFERENCES profiles(id),
  decision    TEXT CHECK (decision IN ('approved','rejected','conditional')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gates_item ON gate_approvals(item_id);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON gate_approvals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
