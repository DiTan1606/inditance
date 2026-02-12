'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/* eslint-disable @next/next/no-img-element */

interface NotificationItem {
  id: string
  type: string
  actor_id: string | null
  reference_id: string | null
  read: boolean
  created_at: string
  actors?: { username: string | null; avatar_url: string | null } | null
}

export function NotificationsList() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: notifs } = await supabase
        .from('notifications')
        .select('id, type, actor_id, reference_id, read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      const actorIds = [...new Set((notifs || []).map((n) => n.actor_id).filter(Boolean) as string[])]
      let profilesMap: Record<string, { username: string | null; avatar_url: string | null }> = {}
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', actorIds)
        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = { username: p.username, avatar_url: p.avatar_url }
          return acc
        }, {} as Record<string, { username: string | null; avatar_url: string | null }>)
      }

      const itemsWithActors = (notifs || []).map((n) => ({
        ...n,
        actors: n.actor_id ? profilesMap[n.actor_id] || null : null,
      }))

      setItems(itemsWithActors as NotificationItem[])
      setLoading(false)
    }
    fetch()
  }, [])

  async function markAsRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function getLink(item: NotificationItem) {
    if (item.type === 'like' || item.type === 'comment') {
      return item.reference_id ? `/?post=${item.reference_id}` : '/'
    }
    if (item.type === 'friend_request' || item.type === 'friend_accepted') {
      return item.actor_id ? `/profile/${item.actor_id}` : '/'
    }
    return '/'
  }

  function getLabel(item: NotificationItem) {
    const name = (item.actors as { username?: string | null } | undefined)?.username || 'Ai đó'
    switch (item.type) {
      case 'like':
        return `${name} đã thích bài viết của bạn`
      case 'comment':
        return `${name} đã bình luận bài viết của bạn`
      case 'friend_request':
        return `${name} đã gửi lời mời kết bạn`
      case 'friend_accepted':
        return `${name} đã chấp nhận lời mời kết bạn`
      default:
        return 'Thông báo mới'
    }
  }

  if (loading) {
    return <div className="text-zinc-500 text-sm">Đang tải...</div>
  }

  if (items.length === 0) {
    return <div className="text-zinc-500 text-sm">Chưa có thông báo</div>
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-white text-sm mb-3">Thông báo</h3>
      {items.map((item) => (
        <Link
          key={item.id}
          href={getLink(item)}
          onClick={() => !item.read && markAsRead(item.id)}
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            item.read ? 'bg-zinc-900/50' : 'bg-zinc-800/50'
          } hover:bg-zinc-800`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
            {(item.actors as { avatar_url?: string | null } | undefined)?.avatar_url ? (
              <img src={(item.actors as { avatar_url: string }).avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">👤</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">{getLabel(item)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {new Date(item.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
          {!item.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
        </Link>
      ))}
    </div>
  )
}
