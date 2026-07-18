import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useItem, updateItemStatus, updateItemStage } from '../hooks/useItems'
import { useArtifacts } from '../hooks/useArtifacts'
import { useAuth } from '../hooks/useAuth'
import { useOrg } from '../hooks/useOrg'
import { AppLayout } from '../components/layout/AppLayout'
import { Button, Card, Badge, Avatar, Spinner, EmptyState, Tag, Divider } from '../components/ui'
import {
  STAGE_ORDER, STAGE_LABELS, STAGE_COLORS, STAGE_DOT_COLORS,
  STATUS_LABELS, STATUSES_BY_STAGE, CATEGORY_COLORS, GATE_EXIT_CONDITIONS,
  timeAgo, formatDate, getInitials
} from '../lib/utils'
import type { Stage, ItemStatus } from '../types/database'
import { ArrowRight, ArrowLeft, ChevronRight, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

// Stage artifact links
const STAGE_ARTIFACTS: Record<Stage, { label: string; path: string }[]> = {
  intake: [
    { label: 'Submission Form', path: 'intake-submission' },
    { label: 'Triage Decision', path: 'triage' },
    { label: 'One-Pager', path: 'intake-one-pager' },
  ],
  discovery: [
    { label: 'Discovery Brief', path: 'discovery-brief' },
    { label: 'Research Notes', path: 'research-notes' },
    { label: 'Data Summary', path: 'data-summary' },
    { label: 'Assumptions Log', path: 'assumptions' },
    { label: 'Risks Log', path: 'risks' },
    { label: 'Alternatives', path: 'alternatives' },
    { label: 'Draft PRD', path: 'draft-prd' },
    { label: 'Decision Record', path: 'decision-record' },
  ],
  shaping: [
    { label: 'Final PRD', path: 'final-prd' },
    { label: 'UX Flows', path: 'ux-flows' },
    { label: 'Tech Approach', path: 'tech-approach' },
    { label: 'Tradeoff Log', path: 'tradeoff-log' },
    { label: 'Effort Assessment', path: 'effort-assessment' },
    { label: 'Rollout Plan', path: 'rollout-plan' },
    { label: 'Metrics Definition', path: 'metrics' },
    { label: 'Approval Record', path: 'approval' },
  ],
  delivery: [
    { label: 'Test Plan', path: 'test-plan' },
    { label: 'QA Sign-off', path: 'qa-signoff' },
    { label: 'Release Notes', path: 'release-notes' },
    { label: 'Runbook', path: 'runbook' },
    { label: 'Release Readiness', path: 'release-readiness' },
  ],
  live: [
    { label: 'Launch Announcement', path: 'launch' },
    { label: 'Monitoring Setup', path: 'monitoring' },
    { label: 'Feedback Log', path: 'feedback' },
    { label: 'Post-Launch Review', path: 'post-launch' },
  ],
  retirement: [
    { label: 'Retirement Decision', path: 'retirement-decision' },
    { label: 'Deprecation Notice', path: 'deprecation' },
    { label: 'Migration Guide', path: 'migration' },
    { label: 'Sunset Checklist', path: 'sunset-checklist' },
    { label: 'Retro Summary', path: 'retro' },
  ],
}

const NEXT_STAGE_STATUS: Partial<Record<Stage, ItemStatus>> = {
  intake: 'discovery_planned',
  discovery: 'shaping_in_progress',
  shaping: 'development_in_progress',
  delivery: 'soft_launch',
  live: 'retirement_planned',
}

export function ItemDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { org } = useOrg()
  const { item, loading, error, refresh } = useItem(id)
  const { artifacts } = useArtifacts(id)
  const [advancing, setAdvancing] = useState(false)

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Spinner /></div>
      </AppLayout>
    )
  }
  if (error || !item) {
    return (
      <AppLayout>
        <EmptyState title="Item not found" description={error || 'This item may have been archived.'} />
      </AppLayout>
    )
  }

  const stageIndex = STAGE_ORDER.indexOf(item.stage)
  const nextStage = STAGE_ORDER[stageIndex + 1] as Stage | undefined
  const prevStage = stageIndex > 0 ? STAGE_ORDER[stageIndex - 1] as Stage : null
  const gateItems = GATE_EXIT_CONDITIONS[item.stage]
  const stageArtifacts = STAGE_ARTIFACTS[item.stage]

  async function advanceStage() {
    if (!nextStage || !user || !org) return
    setAdvancing(true)
    try {
      const nextStatus = NEXT_STAGE_STATUS[item!.stage] || 'submitted'
      await updateItemStage(item!.id, nextStage, nextStatus as ItemStatus, user.id, org.id)
      await refresh()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setAdvancing(false)
    }
  }

  const statusOptions = STATUSES_BY_STAGE[item.stage]

  async function handleStatusChange(newStatus: string) {
    if (!user || !org) return
    try {
      await updateItemStatus(item!.id, newStatus as ItemStatus, user.id, org.id)
      await refresh()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-ink-tertiary mb-6">
          <button onClick={() => navigate(-1)} className="hover:text-ink transition-colors">← Back</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${STAGE_COLORS[item.stage]} px-2 py-0.5 rounded-full text-xs`}>
            {STAGE_LABELS[item.stage]}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + status */}
            <div>
              <h1 className="text-2xl font-semibold text-ink font-display mb-3">{item.title}</h1>
              {item.problem_statement && (
                <p className="text-base text-ink-secondary leading-relaxed">{item.problem_statement}</p>
              )}
            </div>

            {/* Stage pipeline */}
            <Card padding="sm">
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                {STAGE_ORDER.map((stage, i) => {
                  const isPast = stageIndex > i
                  const isCurrent = stageIndex === i
                  return (
                    <div key={stage} className="flex items-center gap-1 flex-shrink-0">
                      <div className={`flex flex-col items-center gap-1`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isPast ? 'border-action bg-action' : isCurrent ? 'border-action bg-white' : 'border-border-subtle bg-white'
                        }`}>
                          {isPast ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : isCurrent ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-action" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-border-subtle" />
                          )}
                        </div>
                        <span className={`text-2xs font-medium ${isCurrent ? 'text-action' : isPast ? 'text-ink-secondary' : 'text-ink-tertiary'}`}>
                          {STAGE_LABELS[stage]}
                        </span>
                      </div>
                      {i < STAGE_ORDER.length - 1 && (
                        <div className={`h-0.5 w-6 flex-shrink-0 mb-4 ${stageIndex > i ? 'bg-action' : 'bg-border-subtle'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Artifacts for this stage */}
            <div>
              <h2 className="text-base font-semibold text-ink mb-3">
                {STAGE_LABELS[item.stage]} artifacts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stageArtifacts.map(artifact => {
                  const hasData = artifacts.some(a => a.artifact_type.includes(artifact.path.replace(/-/g, '_')))
                  return (
                    <button
                      key={artifact.path}
                      onClick={() => navigate(`/items/${item.id}/artifacts/${artifact.path}`)}
                      className="flex items-center gap-3 px-4 py-3.5 bg-surface rounded-xl border border-border-subtle shadow-card hover:shadow-card-hover transition-all text-left group"
                    >
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${hasData ? 'text-action' : 'text-border-strong'}`}>
                        {hasData ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-medium text-ink flex-1">{artifact.label}</span>
                      <ChevronRight className="w-4 h-4 text-ink-tertiary group-hover:text-ink transition-colors" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Gate checklist */}
            <Card padding="md">
              <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-ink-secondary" />
                Exit gate for {STAGE_LABELS[item.stage]}
              </h3>
              <ul className="space-y-2">
                {gateItems.map((condition, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <Circle className="w-4 h-4 text-border-strong mt-0.5 flex-shrink-0" />
                    {condition}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status + advance */}
            <Card padding="md">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide block mb-2">Status</label>
                  <select
                    value={item.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    className="w-full px-3 h-9 rounded-lg border border-border-subtle text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-action"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <Divider />

                {nextStage && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={advanceStage}
                    loading={advancing}
                  >
                    Move to {STAGE_LABELS[nextStage]} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </Card>

            {/* Metadata */}
            <Card padding="md">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Owner</p>
                  {item.owner ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={item.owner.full_name} size="sm" />
                      <span className="text-sm text-ink">{item.owner.full_name}</span>
                    </div>
                  ) : <p className="text-sm text-ink-tertiary">Unassigned</p>}
                </div>
                <Divider />
                <div>
                  <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Requester</p>
                  {item.requester ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={item.requester.full_name} size="sm" />
                      <span className="text-sm text-ink">{item.requester.full_name}</span>
                    </div>
                  ) : <p className="text-sm text-ink-tertiary">—</p>}
                </div>
                {item.categories.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-2">Categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.categories.map(cat => (
                          <Tag key={cat} className={CATEGORY_COLORS[cat]}>{cat}</Tag>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {item.urgency && (
                  <>
                    <Divider />
                    <div>
                      <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-1">Urgency</p>
                      <p className="text-sm text-ink capitalize">{item.urgency}</p>
                    </div>
                  </>
                )}
                <Divider />
                <div className="space-y-1">
                  <p className="text-xs text-ink-tertiary flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Created {formatDate(item.created_at)}
                  </p>
                  <p className="text-xs text-ink-tertiary">Updated {timeAgo(item.updated_at)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
