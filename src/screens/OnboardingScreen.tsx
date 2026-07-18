import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Spinner } from '../components/ui'
import { Layers } from 'lucide-react'

export function OnboardingScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orgName, setOrgName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function createOrg() {
    if (!orgName.trim() || !user) return
    setSaving(true)
    setError('')
    try {
      const slug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36)
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({ name: orgName.trim(), slug })
        .select()
        .single()
      if (orgErr) throw orgErr
      const { error: memberErr } = await supabase
        .from('org_members')
        .insert({ org_id: org.id, user_id: user.id, role: 'admin' })
      if (memberErr) throw memberErr
      localStorage.setItem('iterate_org_id', org.id)
      navigate('/')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-action flex items-center justify-center mb-4 shadow-card">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-ink font-display">Create your workspace</h1>
          <p className="text-sm text-ink-secondary mt-1 text-center">
            Your team's product lifecycle lives here.
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-border-subtle shadow-overlay p-8 space-y-5">
          <Input
            label="Organization name"
            placeholder="Acme Corp"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createOrg()}
            error={error}
            autoFocus
          />
          <Button
            size="lg"
            className="w-full"
            onClick={createOrg}
            loading={saving}
            disabled={!orgName.trim()}
          >
            Create workspace
          </Button>
        </div>
      </div>
    </div>
  )
}
