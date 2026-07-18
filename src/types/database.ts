// Generated TypeScript types for IterateTrack Supabase schema

export type Stage = 'intake' | 'discovery' | 'shaping' | 'delivery' | 'live' | 'retirement'
export type OrgRole = 'admin' | 'pm' | 'contributor' | 'viewer'
export type ActivityType = 'item_created' | 'stage_change' | 'status_change' | 'comment' | 'artifact_update' | 'gate_approval'
export type GateDecision = 'approved' | 'rejected' | 'conditional'
export type Urgency = 'low' | 'medium' | 'high'

// ── Intake statuses
export type IntakeStatus = 'submitted' | 'needs_context' | 'triaged' | 'accepted_for_discovery' | 'rejected'
// ── Discovery statuses
export type DiscoveryStatus = 'discovery_planned' | 'research_in_progress' | 'synthesis' | 'problem_validated' | 'problem_invalidated' | 'discovery_complete'
// ── Shaping statuses
export type ShapingStatus = 'shaping_in_progress' | 'eng_review' | 'design_review' | 'compliance_review' | 'ready_for_approval' | 'approved'
// ── Delivery statuses
export type DeliveryStatus = 'development_in_progress' | 'qa_validation' | 'blocked' | 'release_ready' | 'released'
// ── Live statuses
export type LiveStatus = 'soft_launch' | 'ga' | 'monitoring' | 'iterating' | 'stable'
// ── Retirement statuses
export type RetirementStatus = 'retirement_planned' | 'deprecated' | 'migration_in_progress' | 'sunset_complete' | 'archived'

export type ItemStatus = IntakeStatus | DiscoveryStatus | ShapingStatus | DeliveryStatus | LiveStatus | RetirementStatus

export type ArtifactType =
  // Intake
  | 'intake_submission' | 'triage_decision' | 'intake_one_pager'
  // Discovery
  | 'discovery_brief' | 'research_notes' | 'data_summary' | 'assumptions_log'
  | 'risks_log' | 'alternatives' | 'draft_prd' | 'decision_record'
  // Shaping
  | 'final_prd' | 'ux_flows' | 'tech_approach' | 'tradeoff_log'
  | 'effort_assessment' | 'compliance_review' | 'rollout_plan'
  | 'metrics_definition' | 'approval_record'
  // Delivery
  | 'test_plan' | 'qa_signoff' | 'security_review' | 'compliance_checklist'
  | 'release_notes' | 'runbook' | 'release_readiness'
  // Live
  | 'launch_announcement' | 'monitoring_setup' | 'feedback_log'
  | 'incident_report' | 'post_launch_review'
  // Retirement
  | 'retirement_decision' | 'deprecation_notice' | 'comms_plan'
  | 'migration_guide' | 'sunset_checklist' | 'retro_summary'

export type Category = 'Growth' | 'Compliance' | 'Reliability' | 'UX' | 'Cost' | 'Risk'

// ── Row types ──────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface OrgMember {
  id: string
  org_id: string
  user_id: string
  role: OrgRole
  created_at: string
  // joined relations
  profile?: Profile
}

export interface Item {
  id: string
  org_id: string
  title: string
  problem_statement: string | null
  stage: Stage
  status: ItemStatus
  categories: Category[]
  product_area: string | null
  urgency: Urgency | null
  owner_id: string | null
  requester_id: string | null
  source: string | null
  source_links: string[]
  archived_at: string | null
  created_at: string
  updated_at: string
  // joined relations
  owner?: Profile
  requester?: Profile
}

export interface Artifact {
  id: string
  item_id: string
  stage: Stage
  artifact_type: ArtifactType
  data: Record<string, unknown>
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLogEntry {
  id: string
  item_id: string
  org_id: string
  actor_id: string | null
  type: ActivityType
  payload: Record<string, unknown>
  created_at: string
  // joined
  actor?: Profile
}

export interface GateApproval {
  id: string
  item_id: string
  stage: Stage
  gate_type: string
  approver_id: string | null
  decision: GateDecision | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  approver?: Profile
}

// ── Artifact data shapes (typed JSONB) ────────────────────────

export interface IntakeSubmissionData {
  submitted_by?: string
  source?: string
  source_links?: string[]
  problem_statement?: string
  who_is_affected?: string
  frequency_scale?: string
  rough_impact?: string
  categories?: Category[]
  product_area?: string
  urgency?: Urgency
  deadline?: string
  notes?: string
}

export interface TriageDecisionData {
  reviewed_by?: string
  quality_bar?: {
    is_problem_not_solution?: boolean
    source_attached?: boolean
    not_duplicate?: boolean
    linked_items?: string[]
    affected_users_identified?: boolean
    category_tagged?: boolean
    owner_can_be_named?: boolean
  }
  initial_assessment?: string
  decision?: 'accepted' | 'needs_context' | 'rejected'
  rationale?: string
  owner_id?: string
  next_step?: string
  requester_loop_closed?: boolean
  rejection_message?: string
}

export interface DiscoveryBriefData {
  owner?: string
  window_start?: string
  window_end?: string
  expanded_problem?: string
  background?: string
  hypotheses?: string[]
  validated_looks_like?: string
  method?: string[]
  constraints?: string
}

export interface ResearchNotesData {
  sessions?: Array<{
    participant: string
    date: string
    interviewer: string
    goal: string
    findings: Array<{ finding: string; evidence: string }>
    surprises: string
    followups: string
  }>
  synthesis?: {
    themes: Array<{ theme: string; count: number; impact: string }>
    top_insights: string
    what_this_changes: string
  }
}

export interface DecisionRecordData {
  decided_by?: string
  decision?: 'proceed' | 'iterate' | 'kill'
  rationale?: string
  unknowns_for_shaping?: string[]
  kill_reason?: string
  archive_location?: string
}

export interface FinalPRDData {
  status?: string
  version?: string
  problem?: string
  goals?: string[]
  non_goals?: string[]
  target_users?: string
  solution_overview?: string
  scope_mvp?: string[]
  scope_later?: string[]
  acceptance_criteria?: Array<{ criterion: string; met?: boolean }>
  dependencies?: string[]
  open_questions?: string[]
  risks?: string[]
}

export interface MetricsDefinitionData {
  success_metrics?: Array<{
    metric: string
    definition: string
    source: string
    target: string
    baseline: string
  }>
  guardrail_metrics?: Array<{
    metric: string
    threshold: string
    source: string
  }>
}

export interface ApprovalRecordData {
  version?: string
  sign_offs?: Array<{
    role: string
    name: string
    approved: boolean
  }>
  approved_date?: string
  scope_locked_at?: string
}

export interface PostLaunchReviewData {
  reviewed?: string
  window_measured?: string
  success_metrics?: Array<{
    metric: string
    target: string
    actual: string
    met: boolean
  }>
  guardrails_held?: boolean
  what_worked?: string
  what_didnt?: string
  decision?: 'scale' | 'iterate' | 'hold' | 'rollback'
  iteration_items?: string[]
}

export interface RetirementDecisionData {
  decided_by?: string
  trigger?: string[]
  evidence?: string
  replacement?: string
  target_sunset_date?: string
}

export interface SunsetChecklistData {
  new_usage_disabled?: boolean
  users_migrated?: boolean
  feature_flags_removed?: boolean
  code_removed?: boolean
  docs_archived?: boolean
  monitoring_removed?: boolean
  no_remaining_dependencies?: boolean
  sign_offs?: Array<{ role: string; name: string; signed: boolean }>
}
