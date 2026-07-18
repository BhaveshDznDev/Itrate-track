import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Artifact, ArtifactType, Stage } from '../types/database'

export function useArtifacts(itemId: string | undefined) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!itemId) return
    setLoading(true)
    try {
      const { data, error: e } = await supabase
        .from('artifacts')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true })
      if (e) throw e
      setArtifacts(data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => { fetch() }, [fetch])

  function getArtifact<T = Record<string, unknown>>(type: ArtifactType): T | null {
    const a = artifacts.find(a => a.artifact_type === type)
    return a ? (a.data as T) : null
  }

  async function upsertArtifact(
    type: ArtifactType,
    stage: Stage,
    data: Record<string, unknown>,
    userId: string,
    orgId: string
  ) {
    if (!itemId) return
    const existing = artifacts.find(a => a.artifact_type === type)
    if (existing) {
      const { error } = await supabase
        .from('artifacts')
        .update({ data, updated_by: userId, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('artifacts')
        .insert({ item_id: itemId, stage, artifact_type: type, data, created_by: userId, updated_by: userId })
      if (error) throw error
    }
    // Log activity
    await supabase.from('activity_log').insert({
      item_id: itemId,
      org_id: orgId,
      actor_id: userId,
      type: 'artifact_update',
      payload: { artifact_type: type },
    })
    await fetch()
  }

  return { artifacts, loading, error, getArtifact, upsertArtifact, refresh: fetch }
}
