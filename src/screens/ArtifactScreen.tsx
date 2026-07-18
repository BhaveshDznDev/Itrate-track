import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useItem } from '../hooks/useItems'
import { useArtifacts } from '../hooks/useArtifacts'
import { useAuth } from '../hooks/useAuth'
import { useOrg } from '../hooks/useOrg'
import { AppLayout } from '../components/layout/AppLayout'
import { Button, Input, Textarea, Card, Spinner, EmptyState, Checkbox, Divider } from '../components/ui'
import { STAGE_LABELS } from '../lib/utils'
import type { ArtifactType } from '../types/database'
import { ChevronRight, Save } from 'lucide-react'

// Map URL path segment → artifact_type
const PATH_TO_ARTIFACT: Record<string, ArtifactType> = {
  'intake-submission': 'intake_submission',
  'triage': 'triage_decision',
  'intake-one-pager': 'intake_one_pager',
  'discovery-brief': 'discovery_brief',
  'research-notes': 'research_notes',
  'data-summary': 'data_summary',
  'assumptions': 'assumptions_log',
  'risks': 'risks_log',
  'alternatives': 'alternatives',
  'draft-prd': 'draft_prd',
  'decision-record': 'decision_record',
  'final-prd': 'final_prd',
  'ux-flows': 'ux_flows',
  'tech-approach': 'tech_approach',
  'tradeoff-log': 'tradeoff_log',
  'effort-assessment': 'effort_assessment',
  'rollout-plan': 'rollout_plan',
  'metrics': 'metrics_definition',
  'approval': 'approval_record',
  'test-plan': 'test_plan',
  'qa-signoff': 'qa_signoff',
  'release-notes': 'release_notes',
  'runbook': 'runbook',
  'release-readiness': 'release_readiness',
  'launch': 'launch_announcement',
  'monitoring': 'monitoring_setup',
  'feedback': 'feedback_log',
  'post-launch': 'post_launch_review',
  'retirement-decision': 'retirement_decision',
  'deprecation': 'deprecation_notice',
  'migration': 'migration_guide',
  'sunset-checklist': 'sunset_checklist',
  'retro': 'retro_summary',
}

const ARTIFACT_TITLES: Record<ArtifactType, string> = {
  intake_submission: 'Intake Submission Form',
  triage_decision: 'Triage Checklist & Decision',
  intake_one_pager: 'Intake One-Pager',
  discovery_brief: 'Discovery Brief',
  research_notes: 'Research Notes',
  data_summary: 'Data Analysis Summary',
  assumptions_log: 'Assumptions & Hypotheses Log',
  risks_log: 'Risks & Unknowns Log',
  alternatives: 'Alternatives Considered',
  draft_prd: 'Draft PRD (Discovery)',
  decision_record: 'Discovery Decision Record',
  final_prd: 'Final PRD',
  ux_flows: 'UX Flows / Spec',
  tech_approach: 'Technical Approach Summary',
  tradeoff_log: 'Tradeoff Decision Log',
  effort_assessment: 'Effort & Dependency Assessment',
  compliance_review: 'Compliance / Security Review',
  rollout_plan: 'Rollout & Rollback Plan',
  metrics_definition: 'Metrics Definition',
  approval_record: 'PRD Approval Record',
  test_plan: 'Test Plan & Results',
  qa_signoff: 'QA Sign-off',
  security_review: 'Security Review Notes',
  compliance_checklist: 'Compliance Validation Checklist',
  release_notes: 'Release Notes / Enablement',
  runbook: 'Operational Runbook',
  release_readiness: 'Release Readiness Approval',
  launch_announcement: 'Launch Announcement',
  monitoring_setup: 'Monitoring & Alerting Setup',
  feedback_log: 'Customer Feedback Log',
  incident_report: 'Incident Report',
  post_launch_review: 'Post-Launch Review',
  retirement_decision: 'Retirement Decision Record',
  deprecation_notice: 'Deprecation Notice',
  comms_plan: 'Customer / Internal Comms Plan',
  migration_guide: 'Migration / Replacement Guide',
  sunset_checklist: 'Decommission / Sunset Checklist',
  retro_summary: 'Retro / Learnings Summary',
}

// ── Generic field editor ──────────────────────────────────────
function FieldEditor({
  data,
  onChange,
}: {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}) {
  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value })
  }

  function StringField({ label, field, placeholder, multiline = false, rows = 3 }: {
    label: string; field: string; placeholder?: string; multiline?: boolean; rows?: number
  }) {
    if (multiline) {
      return (
        <Textarea
          label={label}
          value={(data[field] as string) || ''}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          className={`min-h-[${rows * 24}px]`}
        />
      )
    }
    return (
      <Input
        label={label}
        value={(data[field] as string) || ''}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
      />
    )
  }

  function ArrayField({ label, field, placeholder }: { label: string; field: string; placeholder?: string }) {
    const arr = (data[field] as string[]) || []
    return (
      <div>
        <label className="text-sm font-medium text-ink block mb-2">{label}</label>
        <div className="space-y-2">
          {arr.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 px-3 h-9 rounded-lg border border-border-strong text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-action"
                value={item}
                placeholder={placeholder}
                onChange={e => {
                  const next = [...arr]
                  next[i] = e.target.value
                  set(field, next)
                }}
              />
              <Button variant="ghost" size="sm" onClick={() => set(field, arr.filter((_, j) => j !== i))}>×</Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={() => set(field, [...arr, ''])}>+ Add</Button>
        </div>
      </div>
    )
  }

  function CheckField({ label, field }: { label: string; field: string }) {
    return (
      <Checkbox
        checked={!!(data[field])}
        onChange={v => set(field, v)}
        label={label}
      />
    )
  }

  function DecisionField({ field, options }: { field: string; options: string[] }) {
    const current = data[field] as string
    return (
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => set(field, opt)}
            className={`text-sm px-4 h-9 rounded-lg border transition-colors ${
              current === opt
                ? 'bg-action text-white border-action'
                : 'bg-surface text-ink-secondary border-border-subtle hover:border-border-strong'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  // Render fields based on the data keys present + artifact type heuristics
  // This is a generic editor — structured forms per artifact type
  const artifactKey = Object.keys(PATH_TO_ARTIFACT).find(k => true) // handled by parent

  return (
    <div className="space-y-5">
      {/* Render all existing string fields */}
      {Object.entries(data).map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        if (typeof value === 'string') {
          const isLong = value.length > 80 || key.includes('statement') || key.includes('notes') || key.includes('summary') || key.includes('rationale') || key.includes('assessment') || key.includes('approach')
          return (
            <div key={key}>
              {isLong ? (
                <Textarea label={label} value={value} onChange={e => set(key, e.target.value)} />
              ) : (
                <Input label={label} value={value} onChange={e => set(key, e.target.value)} />
              )}
            </div>
          )
        }
        if (typeof value === 'boolean') {
          return <CheckField key={key} label={label} field={key} />
        }
        return null
      })}
    </div>
  )
}

// ── Structured forms per artifact type ───────────────────────
function ArtifactForm({
  artifactType,
  data,
  onChange,
}: {
  artifactType: ArtifactType
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}) {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function str(k: string) { return (data[k] as string) || '' }
  function arr(k: string) { return (data[k] as string[]) || [] }
  function bool(k: string) { return !!(data[k]) }

  function SF({ label, field, placeholder, rows }: { label: string; field: string; placeholder?: string; rows?: number }) {
    if (rows || (placeholder && placeholder.length > 60)) {
      return <Textarea label={label} value={str(field)} onChange={e => set(field, e.target.value)} placeholder={placeholder} className={rows ? `min-h-[${rows * 20 + 40}px]` : undefined} />
    }
    return <Input label={label} value={str(field)} onChange={e => set(field, e.target.value)} placeholder={placeholder} />
  }

  function CB({ label, field }: { label: string; field: string }) {
    return <Checkbox checked={bool(field)} onChange={v => set(field, v)} label={label} />
  }

  switch (artifactType) {
    case 'triage_decision': {
      const qb = (data.quality_bar as Record<string, boolean>) || {}
      function setQb(k: string, v: boolean) { set('quality_bar', { ...qb, [k]: v }) }
      return (
        <div className="space-y-5">
          <SF label="Reviewed by" field="reviewed_by" placeholder="PM name" />
          <div>
            <label className="text-sm font-medium text-ink block mb-3">Quality bar checklist</label>
            <div className="space-y-2.5">
              <Checkbox checked={!!qb.is_problem_not_solution} onChange={v => setQb('is_problem_not_solution', v)} label="Problem statement is a problem, not a solution" />
              <Checkbox checked={!!qb.source_attached} onChange={v => setQb('source_attached', v)} label="Source / evidence attached" />
              <Checkbox checked={!!qb.not_duplicate} onChange={v => setQb('not_duplicate', v)} label="Not a duplicate (searched existing intake)" />
              <Checkbox checked={!!qb.affected_users_identified} onChange={v => setQb('affected_users_identified', v)} label="Affected users identified" />
              <Checkbox checked={!!qb.category_tagged} onChange={v => setQb('category_tagged', v)} label="Category + product area tagged" />
              <Checkbox checked={!!qb.owner_can_be_named} onChange={v => setQb('owner_can_be_named', v)} label="Owner can be named" />
            </div>
          </div>
          <SF label="Initial assessment" field="initial_assessment" placeholder="Is this real? How big? Who cares?" rows={3} />
          <div>
            <label className="text-sm font-medium text-ink block mb-2">Decision</label>
            <div className="flex gap-2">
              {(['accepted', 'needs_context', 'rejected'] as const).map(d => (
                <button key={d} onClick={() => set('decision', d)}
                  className={`text-sm px-4 h-9 rounded-lg border transition-colors ${str('decision') === d ? 'bg-action text-white border-action' : 'bg-surface text-ink-secondary border-border-subtle hover:border-border-strong'}`}>
                  {d === 'accepted' ? 'Accept' : d === 'needs_context' ? 'Needs Context' : 'Reject'}
                </button>
              ))}
            </div>
          </div>
          <SF label="Rationale" field="rationale" placeholder="Why — required especially for reject" rows={2} />
          <SF label="Next step" field="next_step" placeholder="e.g. Create One-Pager, schedule discovery" />
        </div>
      )
    }

    case 'discovery_brief':
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <SF label="Discovery window start" field="window_start" placeholder="YYYY-MM-DD" />
            <SF label="Discovery window end" field="window_end" placeholder="YYYY-MM-DD" />
          </div>
          <SF label="Expanded problem" field="expanded_problem" placeholder="The problem in full context" rows={4} />
          <SF label="Background" field="background" placeholder="History, prior attempts, related work" rows={3} />
          <SF label="What 'validated' looks like" field="validated_looks_like" placeholder="Explicit success signals for this discovery" rows={2} />
          <SF label="Constraints known" field="constraints" placeholder="Legal, infra, cost, time constraints" rows={2} />
        </div>
      )

    case 'decision_record':
      return (
        <div className="space-y-5">
          <SF label="Decided by" field="decided_by" placeholder="PM name" />
          <div>
            <label className="text-sm font-medium text-ink block mb-2">Decision</label>
            <div className="flex gap-2">
              {(['proceed', 'iterate', 'kill'] as const).map(d => (
                <button key={d} onClick={() => set('decision', d)}
                  className={`text-sm px-4 h-9 rounded-lg border transition-colors capitalize ${str('decision') === d ? 'bg-action text-white border-action' : 'bg-surface text-ink-secondary border-border-subtle hover:border-border-strong'}`}>
                  {d === 'proceed' ? '✓ Proceed to Shaping' : d === 'iterate' ? '↻ Iterate' : '✕ Kill'}
                </button>
              ))}
            </div>
          </div>
          <SF label="Rationale (why now)" field="rationale" placeholder="Why move forward / iterate / kill" rows={3} />
          <SF label="Kill reason + archive location" field="kill_reason" placeholder="If killed: reason and where docs are archived" rows={2} />
        </div>
      )

    case 'final_prd':
      return (
        <div className="space-y-5">
          <SF label="Problem" field="problem" placeholder="Carried and sharpened from Discovery" rows={3} />
          <SF label="Solution overview" field="solution_overview" placeholder="Chosen approach in plain language" rows={3} />
          <SF label="Target users" field="target_users" placeholder="Personas, segments" />
          <SF label="Scope — MVP" field="scope_mvp" placeholder="What ships first" rows={3} />
          <SF label="Scope — Later" field="scope_later" placeholder="Explicitly deferred items" rows={2} />
          <SF label="Dependencies" field="dependencies" placeholder="Teams, systems, vendors" rows={2} />
          <SF label="Risks" field="risks" placeholder="Key risks to address" rows={2} />
          <SF label="Open questions" field="open_questions" placeholder="Remaining unknowns" rows={2} />
        </div>
      )

    case 'metrics_definition':
      return (
        <div className="space-y-5">
          <SF label="Success metrics" field="success_metrics_raw" placeholder="List success metrics, definitions, sources, targets, and baselines" rows={5} />
          <SF label="Guardrail metrics (must NOT degrade)" field="guardrail_metrics_raw" placeholder="e.g. p95 latency, error rate, churn — with thresholds" rows={3} />
        </div>
      )

    case 'approval_record': {
      const signOffs = (data.sign_offs as Array<{ role: string; name: string; approved: boolean }>) || []
      const roles = ['PM', 'Eng lead', 'Design', 'Compliance/Security', 'Other']
      return (
        <div className="space-y-5">
          <SF label="PRD version" field="version" placeholder="e.g. v1.2" />
          <SF label="Approved date" field="approved_date" placeholder="YYYY-MM-DD" />
          <div>
            <label className="text-sm font-medium text-ink block mb-3">Sign-offs</label>
            <div className="space-y-2.5">
              {roles.map(role => {
                const entry = signOffs.find(s => s.role === role) || { role, name: '', approved: false }
                const update = (changes: Partial<typeof entry>) => {
                  const next = signOffs.filter(s => s.role !== role)
                  set('sign_offs', [...next, { ...entry, ...changes }])
                }
                return (
                  <div key={role} className="flex items-center gap-3">
                    <Checkbox checked={entry.approved} onChange={v => update({ approved: v })} />
                    <span className="text-sm text-ink w-32 flex-shrink-0">{role}</span>
                    <input
                      className="flex-1 px-3 h-8 rounded border border-border-subtle text-sm text-ink bg-surface focus:outline-none focus:ring-1 focus:ring-action"
                      placeholder="Name"
                      value={entry.name}
                      onChange={e => update({ name: e.target.value })}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    case 'release_readiness': {
      const checks = [
        { field: 'acceptance_criteria_met', label: 'Meets acceptance criteria (QA sign-off attached)' },
        { field: 'monitoring_in_place', label: 'Monitoring + alerts in place (runbook linked)' },
        { field: 'rollback_plan_executable', label: 'Rollback plan executable and tested' },
        { field: 'release_notes_ready', label: 'Release notes ready' },
        { field: 'security_compliance_signoff', label: 'Security / compliance sign-offs (if applicable)' },
        { field: 'owner_assigned', label: 'Owner assigned for post-launch period' },
      ]
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {checks.map(({ field, label }) => (
              <CB key={field} label={label} field={field} />
            ))}
          </div>
          <SF label="Approved by (Eng lead + PM)" field="approved_by" placeholder="Names" />
          <div>
            <label className="text-sm font-medium text-ink block mb-2">GO / NO-GO</label>
            <div className="flex gap-2">
              {['GO', 'NO-GO'].map(d => (
                <button key={d} onClick={() => set('go_nogo', d)}
                  className={`text-sm px-5 h-9 rounded-lg border transition-colors ${str('go_nogo') === d ? d === 'GO' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600' : 'bg-surface text-ink-secondary border-border-subtle hover:border-border-strong'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    case 'sunset_checklist': {
      const checks = [
        { field: 'new_usage_disabled', label: 'New usage disabled' },
        { field: 'users_migrated', label: 'Existing users / data migrated' },
        { field: 'feature_flags_removed', label: 'Feature flags removed' },
        { field: 'code_removed', label: 'Code + dependencies removed (cleanup PRs linked)' },
        { field: 'docs_archived', label: 'Docs updated / archived' },
        { field: 'monitoring_removed', label: 'Monitoring + alerts removed' },
        { field: 'no_remaining_dependencies', label: 'No remaining dependencies (verified)' },
      ]
      return (
        <div className="space-y-3">
          {checks.map(({ field, label }) => <CB key={field} label={label} field={field} />)}
        </div>
      )
    }

    case 'post_launch_review': {
      return (
        <div className="space-y-5">
          <SF label="Review date" field="reviewed" placeholder="YYYY-MM-DD" />
          <SF label="Measurement window" field="window_measured" placeholder="e.g. 4 weeks post-launch" />
          <SF label="Success metrics (metric / target / actual / met?)" field="success_metrics_raw" rows={4} placeholder="One metric per line: Metric | Target | Actual | Met Y/N" />
          <Checkbox checked={bool('guardrails_held')} onChange={v => set('guardrails_held', v)} label="All guardrail metrics held" />
          <SF label="What worked" field="what_worked" rows={3} />
          <SF label="What didn't work" field="what_didnt" rows={3} />
          <div>
            <label className="text-sm font-medium text-ink block mb-2">Decision</label>
            <div className="flex gap-2 flex-wrap">
              {(['scale', 'iterate', 'hold', 'rollback'] as const).map(d => (
                <button key={d} onClick={() => set('decision', d)}
                  className={`text-sm px-4 h-9 rounded-lg border transition-colors capitalize ${str('decision') === d ? 'bg-action text-white border-action' : 'bg-surface text-ink-secondary border-border-subtle hover:border-border-strong'}`}>
                  {d === 'scale' ? '↑ Scale rollout' : d === 'iterate' ? '↻ Iterate' : d === 'hold' ? '— Hold/stable' : '↓ Roll back'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Default: generic textarea editor for all other artifact types
    default:
      return (
        <div className="space-y-5">
          <Textarea
            label="Content"
            value={str('content')}
            onChange={e => set('content', e.target.value)}
            placeholder="Fill in this artifact based on the stage guidelines..."
            className="min-h-[300px]"
          />
        </div>
      )
  }
}

// ── Main screen ───────────────────────────────────────────────
export function ArtifactScreen() {
  const { id, artifactPath } = useParams<{ id: string; artifactPath: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { org } = useOrg()
  const { item, loading: itemLoading } = useItem(id)
  const { artifacts, loading: artLoading, upsertArtifact, getArtifact, refresh } = useArtifacts(id)

  const artifactType = PATH_TO_ARTIFACT[artifactPath || '']
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!artLoading && artifactType) {
      const existing = getArtifact(artifactType)
      if (existing) setFormData(existing)
    }
  }, [artLoading, artifactType, artifacts])

  if (itemLoading || artLoading) {
    return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>
  }
  if (!item || !artifactType) {
    return <AppLayout><EmptyState title="Not found" description="Artifact not found." /></AppLayout>
  }

  async function handleSave() {
    if (!user || !org || !item) return
    setSaving(true)
    try {
      await upsertArtifact(artifactType, item.stage, formData, user.id, org.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-ink-tertiary mb-6">
          <button onClick={() => navigate(`/items/${item.id}`)} className="hover:text-ink">
            {item.title}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink">{ARTIFACT_TITLES[artifactType]}</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink font-display">
              {ARTIFACT_TITLES[artifactType]}
            </h1>
            <p className="text-sm text-ink-secondary mt-0.5">
              {STAGE_LABELS[item.stage]} stage · {item.title}
            </p>
          </div>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </div>

        <Card padding="lg">
          <ArtifactForm
            artifactType={artifactType}
            data={formData}
            onChange={setFormData}
          />
        </Card>
      </div>
    </AppLayout>
  )
}
