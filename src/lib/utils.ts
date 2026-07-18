import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import type { Stage, ItemStatus, Category } from '../types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

export const STAGE_ORDER: Stage[] = [
  'intake', 'discovery', 'shaping', 'delivery', 'live', 'retirement',
]

export const STAGE_LABELS: Record<Stage, string> = {
  intake: 'Intake',
  discovery: 'Discovery',
  shaping: 'Shaping',
  delivery: 'Delivery',
  live: 'Live',
  retirement: 'Retirement',
}

export const STAGE_COLORS: Record<Stage, string> = {
  intake: 'bg-ink-secondary/10 text-ink-secondary',
  discovery: 'bg-action/10 text-action',
  shaping: 'bg-purple-100 text-purple-700',
  delivery: 'bg-amber-100 text-amber-700',
  live: 'bg-green-100 text-green-700',
  retirement: 'bg-red-100 text-red-700',
}

export const STAGE_DOT_COLORS: Record<Stage, string> = {
  intake: 'bg-ink-secondary',
  discovery: 'bg-action',
  shaping: 'bg-purple-600',
  delivery: 'bg-amber-600',
  live: 'bg-green-600',
  retirement: 'bg-red-600',
}

export const STATUSES_BY_STAGE: Record<Stage, { value: ItemStatus; label: string }[]> = {
  intake: [
    { value: 'submitted', label: 'Submitted' },
    { value: 'needs_context', label: 'Needs Context' },
    { value: 'triaged', label: 'Triaged' },
    { value: 'accepted_for_discovery', label: 'Accepted for Discovery' },
    { value: 'rejected', label: 'Rejected' },
  ],
  discovery: [
    { value: 'discovery_planned', label: 'Discovery Planned' },
    { value: 'research_in_progress', label: 'Research in Progress' },
    { value: 'synthesis', label: 'Synthesis' },
    { value: 'problem_validated', label: 'Problem Validated' },
    { value: 'problem_invalidated', label: 'Problem Invalidated' },
    { value: 'discovery_complete', label: 'Discovery Complete' },
  ],
  shaping: [
    { value: 'shaping_in_progress', label: 'Shaping in Progress' },
    { value: 'eng_review', label: 'Eng Review' },
    { value: 'design_review', label: 'Design Review' },
    { value: 'compliance_review', label: 'Compliance Review' },
    { value: 'ready_for_approval', label: 'Ready for Approval' },
    { value: 'approved', label: 'Approved' },
  ],
  delivery: [
    { value: 'development_in_progress', label: 'Development in Progress' },
    { value: 'qa_validation', label: 'QA / Validation' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'release_ready', label: 'Release Ready' },
    { value: 'released', label: 'Released' },
  ],
  live: [
    { value: 'soft_launch', label: 'Soft Launch' },
    { value: 'ga', label: 'GA' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'iterating', label: 'Iterating' },
    { value: 'stable', label: 'Stable' },
  ],
  retirement: [
    { value: 'retirement_planned', label: 'Retirement Planned' },
    { value: 'deprecated', label: 'Deprecated' },
    { value: 'migration_in_progress', label: 'Migration in Progress' },
    { value: 'sunset_complete', label: 'Sunset Complete' },
    { value: 'archived', label: 'Archived' },
  ],
}

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(STATUSES_BY_STAGE).flat().map(s => [s.value, s.label])
)

export const CATEGORIES: Category[] = ['Growth', 'Compliance', 'Reliability', 'UX', 'Cost', 'Risk']

export const CATEGORY_COLORS: Record<Category, string> = {
  Growth: 'bg-green-100 text-green-700',
  Compliance: 'bg-blue-100 text-blue-700',
  Reliability: 'bg-orange-100 text-orange-700',
  UX: 'bg-purple-100 text-purple-700',
  Cost: 'bg-yellow-100 text-yellow-700',
  Risk: 'bg-red-100 text-red-700',
}

export const GATE_EXIT_CONDITIONS: Record<Stage, string[]> = {
  intake: [
    'Clear problem statement (problem, not solution)',
    'Named PM owner',
    'Evidence / source attached',
  ],
  discovery: [
    'Problem validated or explicitly killed',
    'Clear "why now" rationale documented',
    'Key unknowns enumerated for Shaping',
  ],
  shaping: [
    'Final PRD approved',
    'Engineering feasibility reviewed',
    'Dependencies understood',
    'Rollout / rollback documented',
  ],
  delivery: [
    'Meets all acceptance criteria (QA sign-off)',
    'Monitoring + alerts in place',
    'Rollback plan executable',
    'Release notes ready',
  ],
  live: [
    'Feature meets success metrics and is stable',
    'Post-launch review completed',
    'Decision recorded: scale / iterate / hold',
  ],
  retirement: [
    'Feature fully removed',
    'No remaining dependencies',
    'Docs archived',
    'Learnings captured',
  ],
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
