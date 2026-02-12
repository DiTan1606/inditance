'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createNotification } from '@/lib/notifications'

export type FriendshipState = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected' | 'loading'

export function useFriendship(currentUserId: string | undefined, targetUserId: string | undefined) {
  const [state, setState] = useState<FriendshipState>('loading')

  useEffect(() => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setState('none')
      return
    }

    async function fetch() {
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('friendships')
        .select('user_id, friend_id, status')
        .or(`user_id.eq.${currentUserId},user_id.eq.${targetUserId}`)

      const friendship = (rows || []).find(
        (r) =>
          (r.user_id === currentUserId && r.friend_id === targetUserId) ||
          (r.user_id === targetUserId && r.friend_id === currentUserId)
      )

      if (!friendship) {
        setState('none')
        return
      }

      if (friendship.status === 'accepted') {
        setState('accepted')
      } else if (friendship.status === 'pending') {
        setState(friendship.user_id === currentUserId ? 'pending_sent' : 'pending_received')
      } else {
        setState('rejected')
      }
    }

    fetch()
  }, [currentUserId, targetUserId])

  async function sendRequest() {
    if (!currentUserId || !targetUserId) return
    setState('loading')
    const supabase = createClient()
    await supabase.from('friendships').insert({
      user_id: currentUserId,
      friend_id: targetUserId,
      status: 'pending',
    })
    createNotification(supabase, targetUserId, 'friend_request', currentUserId)
    setState('pending_sent')
  }

  async function acceptRequest() {
    if (!currentUserId || !targetUserId) return
    setState('loading')
    const supabase = createClient()
    const { data: rows } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id')
      .or(`user_id.eq.${targetUserId},user_id.eq.${currentUserId}`)

    const row = (rows || []).find(
      (r) =>
        (r.user_id === targetUserId && r.friend_id === currentUserId) ||
        (r.user_id === currentUserId && r.friend_id === targetUserId)
    )
    if (row) {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', row.id)
      createNotification(supabase, targetUserId, 'friend_accepted', currentUserId)
    }
    setState('accepted')
  }

  async function deleteFriendship() {
    if (!currentUserId || !targetUserId) return
    const supabase = createClient()
    const { data: rows } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id')
      .or(`user_id.eq.${targetUserId},user_id.eq.${currentUserId}`)

    const row = (rows || []).find(
      (r) =>
        (r.user_id === targetUserId && r.friend_id === currentUserId) ||
        (r.user_id === currentUserId && r.friend_id === targetUserId)
    )
    if (row) {
      await supabase.from('friendships').delete().eq('id', row.id)
    }
  }

  async function rejectRequest() {
    setState('loading')
    await deleteFriendship()
    setState('none')
  }

  async function unfriend() {
    setState('loading')
    await deleteFriendship()
    setState('none')
  }

  return { state, sendRequest, acceptRequest, rejectRequest, unfriend }
}
