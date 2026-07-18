import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrg } from '../hooks/useOrg'
import { useItems } from '../hooks/useItems'
import { AppLayout } from '../components/layout/AppLayout'
import { Button, Badge, Avatar, EmptyState, Spinner, Tag } from '../components/ui'
import {
  STAGE_ORDER, STAGE_LABELS, STAGE_COLORS, STAGE_DOT_COLORS,
  STATUS_LABELS, CATEGORY_COLORS, timeAgo
} from '../lib/utils'
import type { Item, Stage } from '../types/database'
import { Plus, Filter, Search } from 'lucide-react'

const STAGE_NEXT: Record<Stage, Stage | null> = {
  intake: 'discovery', discovery: 'shaping', shaping: 'delivery',
  delivery: 'live', live: 'retirement', retirement: null,
}

function ItemRow({ item }: { item: Item }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/items/${item.id}`)}
      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary cursor-pointer border-b border-border-subtle last:border-0 transition-colors"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STAGE_DOT_COLORS[item.stage]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{item.title}</p>
        <p className="text-xs text-ink-tertiary mt-0.5 truncate">
          {STATUS_LABELS[item.status]} · {timeAgo(item.updated_at)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.categories.slice(0, 2).map(cat => (
          <Tag key={cat} className={CATEGORY_COLORS[cat]}>{cat}</Tag>
        ))}
        <Tag className={STAGE_COLORS[item.stage]}>{STAGE_LABELS[item.stage]}</Tag>
        {item.owner && <Avatar name={item.owner.full_name} size="sm" />}
      </div>
    </div>
  )
}

export function PipelineScreen() {
  const navigate = useNavigate()
  const { org } = useOrg()
  const { items, loading } = useItems(org?.id)
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState<Stage | 'all'>('all')

  const filtered = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesStage = filterStage === 'all' || item.stage === filterStage
    return matchesSearch && matchesStage
  })

  const byStage = STAGE_ORDER.reduce<Record<Stage, Item[]>>((acc, s) => {
    acc[s] = filtered.filter(i => i.stage === s)
    return acc
  }, {} as Record<Stage, Item[]>)

  return (
    <AppLayout>
      <div className="px-6 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink font-display">Pipeline</h1>
            <p className="text-sm text-ink-secondary mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''} across all stages
            </p>
          </div>
          <Button onClick={() => navigate('/intake/new')}>
            <Plus className="w-4 h-4 mr-1.5" /> New item
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-9 rounded-lg border border-border-subtle text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-action placeholder:text-ink-tertiary"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterStage('all')}
              className={`text-xs font-medium px-3 h-7 rounded-full transition-colors ${
                filterStage === 'all' ? 'bg-ink text-white' : 'bg-surface-secondary text-ink-secondary hover:text-ink'
              }`}
            >All</button>
            {STAGE_ORDER.map(s => (
              <button
                key={s}
                onClick={() => setFilterStage(filterStage === s ? 'all' : s)}
                className={`text-xs font-medium px-3 h-7 rounded-full transition-colors ${
                  filterStage === s ? 'bg-ink text-white' : 'bg-surface-secondary text-ink-secondary hover:text-ink'
                }`}
              >
                {STAGE_LABELS[s]}
                {byStage[s]?.length > 0 && (
                  <span className="ml-1.5 opacity-60">{byStage[s].length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Plus className="w-10 h-10" />}
            title="No items yet"
            description="Start by submitting an idea or request to intake."
            action={<Button onClick={() => navigate('/intake/new')}>Submit first item</Button>}
          />
        ) : (
          <div className="space-y-6">
            {STAGE_ORDER.map(stage => {
              const stageItems = byStage[stage]
              if (filterStage !== 'all' && filterStage !== stage) return null
              if (stageItems.length === 0 && filterStage === 'all') return null
              return (
                <div key={stage}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${STAGE_DOT_COLORS[stage]}`} />
                    <h2 className="text-sm font-semibold text-ink">{STAGE_LABELS[stage]}</h2>
                    <span className="text-xs text-ink-tertiary ml-1">{stageItems.length}</span>
                  </div>
                  {stageItems.length === 0 ? (
                    <p className="text-sm text-ink-tertiary pl-4 py-2">No items in {STAGE_LABELS[stage]}</p>
                  ) : (
                    <div className="bg-surface rounded-xl border border-border-subtle shadow-card overflow-hidden">
                      {stageItems.map(item => <ItemRow key={item.id} item={item} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
