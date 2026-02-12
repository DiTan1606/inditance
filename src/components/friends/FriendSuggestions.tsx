'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

/* eslint-disable @next/next/no-img-element */

export function FriendSuggestions() {
  const [profiles, setProfiles] = useState<(Profile & { id: string })[]>([])
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

      const excludeIds = new Set<string>([user.id])
      ;(friendships || []).forEach((f) => {
        excludeIds.add(f.user_id)
        excludeIds.add(f.friend_id)
      })

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, dob, role, created_at, updated_at')

      const filtered = (allProfiles || []).filter((p) => !excludeIds.has(p.id)).slice(0, 10)
      setProfiles(filtered as (Profile & { id: string })[])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) {
    return <div className="text-zinc-500 text-sm">Đang tải...</div>
  }

  if (profiles.length === 0) {
    return <div className="text-zinc-500 text-sm">Không có gợi ý kết bạn</div>
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-white text-sm mb-3">Gợi ý kết bạn</h3>
      {profiles.map((p) => (
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
