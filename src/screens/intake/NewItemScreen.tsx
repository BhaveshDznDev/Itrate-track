import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useOrg } from '../../hooks/useOrg'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button, Input, Textarea, Select, Card } from '../../components/ui'
import { CATEGORIES } from '../../lib/utils'
import type { Category, Urgency } from '../../types/database'

const SOURCE_OPTIONS = [
  { value: 'customer_ticket', label: 'Customer ticket' },
  { value: 'sales_call', label: 'Sales call' },
  { value: 'support', label: 'Support' },
  { value: 'compliance', label: 'Compliance need' },
  { value: 'internal', label: 'Internal insight' },
  { value: 'other', label: 'Other' },
]

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function NewItemScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { org } = useOrg()

  const [title, setTitle] = useState('')
  const [problemStatement, setProblemStatement] = useState('')
  const [source, setSource] = useState('')
  const [sourceLinks, setSourceLinks] = useState('')
  const [whoAffected, setWhoAffected] = useState('')
  const [frequencyScale, setFrequencyScale] = useState('')
  const [roughImpact, setRoughImpact] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [productArea, setProductArea] = useState('')
  const [urgency, setUrgency] = useState<Urgency | ''>('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleCategory(cat: Category) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!problemStatement.trim()) e.problemStatement = 'Problem statement is required'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    if (!user || !org) return

    setSaving(true)
    try {
      // Create item
      const { data: item, error: itemErr } = await supabase
        .from('items')
        .insert({
          org_id: org.id,
          title: title.trim(),
          problem_statement: problemStatement.trim(),
          stage: 'intake',
          status: 'submitted',
          categories: selectedCategories,
          product_area: productArea || null,
          urgency: urgency || null,
          requester_id: user.id,
          source: source || null,
          source_links: sourceLinks.split('\n').map(l => l.trim()).filter(Boolean),
        })
        .select()
        .single()
      if (itemErr) throw itemErr

      // Create intake_submission artifact
      await supabase.from('artifacts').insert({
        item_id: item.id,
        stage: 'intake',
        artifact_type: 'intake_submission',
        data: {
          submitted_by: user.user_metadata?.full_name || user.email,
          source, source_links: sourceLinks.split('\n').map(l => l.trim()).filter(Boolean),
          problem_statement: problemStatement.trim(),
          who_is_affected: whoAffected, frequency_scale: frequencyScale,
          rough_impact: roughImpact, categories: selectedCategories,
          product_area: productArea, urgency, deadline, notes,
        },
        created_by: user.id,
        updated_by: user.id,
      })

      // Activity log
      await supabase.from('activity_log').insert({
        item_id: item.id, org_id: org.id, actor_id: user.id,
        type: 'item_created', payload: { title: item.title, stage: 'intake' },
      })

      navigate(`/items/${item.id}`)
    } catch (e: any) {
      setErrors({ _: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-sm text-ink-secondary hover:text-ink mb-3 block">
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-ink font-display">Submit an intake item</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Capture the problem clearly — no solutions yet. This is Intake.
          </p>
        </div>

        {errors._ && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errors._}
          </div>
        )}

        <div className="space-y-5">
          <Input
            label="Title"
            placeholder="Short, descriptive name for this item"
            value={title}
            onChange={e => setTitle(e.target.value)}
            error={errors.title}
          />

          <Textarea
            label="Problem statement"
            placeholder="What's wrong, for whom, and why it matters — NO solutions here."
            value={problemStatement}
            onChange={e => setProblemStatement(e.target.value)}
            error={errors.problemStatement}
            className="min-h-[100px]"
            hint="1–3 lines: what's wrong · for whom · why it matters. Not a solution."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Source"
              options={SOURCE_OPTIONS}
              placeholder="Select source..."
              value={source}
              onChange={e => setSource(e.target.value)}
            />
            <Select
              label="Urgency"
              options={URGENCY_OPTIONS}
              placeholder="Select urgency..."
              value={urgency}
              onChange={e => setUrgency(e.target.value as Urgency)}
            />
          </div>

          <Textarea
            label="Source links"
            placeholder="Paste URLs, one per line (ticket, call notes, email...)"
            value={sourceLinks}
            onChange={e => setSourceLinks(e.target.value)}
            className="min-h-[60px]"
          />

          <Input
            label="Who is affected"
            placeholder="e.g. Enterprise customers, support team, onboarding users"
            value={whoAffected}
            onChange={e => setWhoAffected(e.target.value)}
          />

          <Input
            label="How often / how many"
            placeholder="e.g. ~15 tickets/week, 3 enterprise accounts"
            value={frequencyScale}
            onChange={e => setFrequencyScale(e.target.value)}
          />

          <Textarea
            label="Rough impact (qualitative)"
            placeholder="e.g. Revenue at risk, high churn signal, compliance obligation"
            value={roughImpact}
            onChange={e => setRoughImpact(e.target.value)}
            className="min-h-[60px]"
          />

          <div>
            <label className="text-sm font-medium text-ink block mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-sm px-3 h-8 rounded-full border transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-action text-white border-action'
                      : 'bg-surface text-ink-secondary border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product area"
              placeholder="e.g. Checkout, Onboarding"
              value={productArea}
              onChange={e => setProductArea(e.target.value)}
            />
            <Input
              label="Deadline (optional)"
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          <Textarea
            label="Notes (optional)"
            placeholder="Anything else the PM should know"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="min-h-[60px]"
          />

          <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
            <Button size="lg" onClick={handleSubmit} loading={saving}>
              Submit to Intake
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
