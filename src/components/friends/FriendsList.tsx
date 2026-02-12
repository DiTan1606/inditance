'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

/* eslint-disable @next/next/no-img-element */

export function FriendsList() {
  const [friends, setFriends] = useState<(Profile & { id: string })[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setCurrentUserId(user.id)

      const { data: friendships } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const friendIds = new Set<string>()
      ;(friendships || []).forEach((f) => {
        const otherId = f.user_id === user.id ? f.friend_id : f.user_id
        friendIds.add(otherId)
      })

      if (friendIds.size === 0) {
        setFriends([])
        setLoading(false)
        return
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, dob, role, created_at, updated_at')
        .in('id', Array.from(friendIds))

      setFriends((profiles || []) as (Profile & { id: string })[])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) {
    return <div className="text-zinc-500 text-sm">Đang tải...</div>
  }

  if (friends.length === 0) {
    return <div className="text-zinc-500 text-sm">Chưa có bạn bè</div>
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-white text-sm mb-3">Bạn bè</h3>
      {friends.map((p) => (
        <Link
          key={p.id}
          href={`/profile/${p.id}`}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
            {p.avatar_url ? (
              <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">👤</div>
            )}
          </div>
          <span className="text-sm text-white truncate flex-1">
            {p.username || 'Chưa đặt tên'}
          </span>
        </Link>
      ))}
    </div>
  )
}
