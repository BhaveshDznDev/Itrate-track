import { useEffect, useState, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import type { Organization, OrgMember } from '../types/database'

interface OrgState {
  org: Organization | null
  membership: OrgMember | null
  loading: boolean
  error: string | null
  setOrg: (org: Organization | null) => void
}

export const OrgContext = createContext<OrgState>({
  org: null, membership: null, loading: true, error: null, setOrg: () => {},
})

export function useOrg() {
  return useContext(OrgContext)
}

export function useOrgState(userId: string | undefined): OrgState {
  const [org, setOrg] = useState<Organization | null>(null)
  const [membership, setMembership] = useState<OrgMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    const stored = localStorage.getItem('iterate_org_id')
    fetchOrg(userId, stored || undefined)
  }, [userId])

  async function fetchOrg(userId: string, preferredOrgId?: string) {
    try {
      const { data: memberships, error: mErr } = await supabase
        .from('org_members')
        .select('*, organizations(*)')
        .eq('user_id', userId)
        .limit(10)
      if (mErr) throw mErr
      if (!memberships || memberships.length === 0) {
        setOrg(null); setMembership(null); setLoading(false); return
      }
      const preferred = preferredOrgId
        ? memberships.find(m => m.org_id === preferredOrgId)
        : null
      const selected = preferred || memberships[0]
      setOrg((selected as any).organizations)
      setMembership(selected)
      localStorage.setItem('iterate_org_id', selected.org_id)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { org, membership, loading, error, setOrg }
}
