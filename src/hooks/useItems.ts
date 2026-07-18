import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Item, Stage, ItemStatus } from '../types/database'

export function useItems(orgId: string | undefined, stage?: Stage) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      let q = supabase
        .from('items')
        .select('*, owner:profiles!items_owner_id_fkey(id, full_name, avatar_url), requester:profiles!items_requester_id_fkey(id, full_name, avatar_url)')
        .eq('org_id', orgId)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
      if (stage) q = q.eq('stage', stage)
      const { data, error: e } = await q
      if (e) throw e
      setItems((data as Item[]) || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [orgId, stage])

  useEffect(() => { fetch() }, [fetch])

  return { items, loading, error, refresh: fetch }
}

export function useItem(itemId: string | undefined) {
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!itemId) return
    setLoading(true)
    try {
      const { data, error: e } = await supabase
        .from('items')
        .select('*, owner:profiles!items_owner_id_fkey(id, full_name, avatar_url), requester:profiles!items_requester_id_fkey(id, full_name, avatar_url)')
        .eq('id', itemId)
        .single()
      if (e) throw e
      setItem(data as Item)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => { fetch() }, [fetch])

  return { item, loading, error, refresh: fetch }
}

export async function updateItemStatus(itemId: string, status: ItemStatus, userId: string, orgId: string) {
  const { error } = await supabase
    .from('items')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', itemId)
  if (error) throw error
  await supabase.from('activity_log').insert({
    item_id: itemId,
    org_id: orgId,
    actor_id: userId,
    type: 'status_change',
    payload: { status },
  })
}

export async function updateItemStage(itemId: string, stage: Stage, status: ItemStatus, userId: string, orgId: string) {
  const { error } = await supabase
    .from('items')
    .update({ stage, status, updated_at: new Date().toISOString() })
    .eq('id', itemId)
  if (error) throw error
  await supabase.from('activity_log').insert({
    item_id: itemId,
    org_id: orgId,
    actor_id: userId,
    type: 'stage_change',
    payload: { stage, status },
  })
}
