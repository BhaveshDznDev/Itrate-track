import { useNavigate } from 'react-router-dom'
import { useOrg } from '../hooks/useOrg'
import { useItems } from '../hooks/useItems'
import { AppLayout } from '../components/layout/AppLayout'
import { Button, Avatar, EmptyState, Spinner, Tag } from '../components/ui'
import {
  STAGE_LABELS, STAGE_COLORS, STATUS_LABELS, CATEGORY_COLORS,
  STATUSES_BY_STAGE, timeAgo
} from '../lib/utils'
import type { Stage, Item, ItemStatus } from '../types/database'
import { Plus, ChevronRight } from 'lucide-react'

interface StageListScreenProps {
  stage: Stage
}

function ItemCard({ item }: { item: Item }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/items/${item.id}`)}
      className="flex items-start gap-4 px-5 py-4 hover:bg-surface-secondary cursor-pointer border-b border-border-subtle last:border-0 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-ink truncate">{item.title}</p>
        </div>
        {item.problem_statement && (
          <p className="text-xs text-ink-secondary mt-0.5 line-clamp-1">{item.problem_statement}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_COLORS[item.stage]}`}>
            {STATUS_LABELS[item.status]}
          </span>
          {item.categories.map(cat => (
            <Tag key={cat} className={CATEGORY_COLORS[cat]}>{cat}</Tag>
          ))}
          <span className="text-xs text-ink-tertiary">{timeAgo(item.updated_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        {item.owner && <Avatar name={item.owner.full_name} size="sm" />}
        <ChevronRight className="w-4 h-4 text-ink-tertiary group-hover:text-ink transition-colors" />
      </div>
    </div>
  )
}

export function StageListScreen({ stage }: StageListScreenProps) {
  const navigate = useNavigate()
  const { org } = useOrg()
  const { items, loading } = useItems(org?.id, stage)

  const statuses = STATUSES_BY_STAGE[stage]
  const byStatus = statuses.reduce<Record<ItemStatus, Item[]>>((acc, s) => {
    acc[s.value] = items.filter(i => i.status === s.value)
    return acc
  }, {} as Record<ItemStatus, Item[]>)

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink font-display">{STAGE_LABELS[stage]}</h1>
            <p className="text-sm text-ink-secondary mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          {stage === 'intake' && (
            <Button onClick={() => navigate('/intake/new')}>
              <Plus className="w-4 h-4 mr-1.5" /> New item
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState
            title={`No items in ${STAGE_LABELS[stage]}`}
            description={stage === 'intake' ? 'Submit your first item to start tracking product work.' : `Items move here from the previous stage.`}
            action={stage === 'intake' ? (
              <Button onClick={() => navigate('/intake/new')}>Submit first item</Button>
            ) : undefined}
          />
        ) : (
          <div className="space-y-6">
            {statuses.map(({ value: statusValue, label: statusLabel }) => {
              const statusItems = byStatus[statusValue] || []
              if (statusItems.length === 0) return null
              return (
                <div key={statusValue}>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-sm font-semibold text-ink">{statusLabel}</h2>
                    <span className="text-xs text-ink-tertiary">{statusItems.length}</span>
                  </div>
                  <div className="bg-surface rounded-xl border border-border-subtle shadow-card overflow-hidden">
                    {statusItems.map(item => <ItemCard key={item.id} item={item} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
