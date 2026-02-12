'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMessagesOrNull } from './MessagesProvider'

/* eslint-disable @next/next/no-img-element */

interface Conversation {
  id: string
  user_a: string
  user_b: string
  updated_at: string
  otherUserId: string
  otherProfile?: { id: string; username: string | null; avatar_url: string | null }
}

interface ConversationListProps {
  currentUserId: string
}

export function ConversationList({ currentUserId }: ConversationListProps) {
  const ctx = useMessagesOrNull()
  const selectedConversationId = ctx?.selectedConversationId ?? null
  const setSelected = ctx?.setSelected ?? (() => {})
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase
        .from('conversations')
        .select('id, user_a, user_b, updated_at')
        .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
        .order('updated_at', { ascending: false })

      const convos = (data || []).map((c) => {
        const otherId = c.user_a === currentUserId ? c.user_b : c.user_a
        return { ...c, otherUserId: otherId }
      })

      const otherIds = convos.map((c) => c.otherUserId)
      let profilesMap: Record<string, { username: string | null; avatar_url: string | null }> = {}
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', otherIds)
        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = { username: p.username, avatar_url: p.avatar_url }
          return acc
        }, {} as Record<string, { username: string | null; avatar_url: string | null }>)
      }

      setConversations(
        convos.map((c) => ({
          ...c,
          otherProfile: profilesMap[c.otherUserId]
            ? { id: c.otherUserId, ...profilesMap[c.otherUserId] }
            : undefined,
        }))
      )
      setLoading(false)
    }
    fetch()
  }, [currentUserId])

  if (loading) {
    return <div className="text-zinc-500 text-sm">Đang tải...</div>
  }

  if (conversations.length === 0) {
    return <div className="text-zinc-500 text-sm">Chưa có cuộc hội thoại</div>
  }

  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-white text-sm mb-3">Tin nhắn</h3>
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => setSelected(c.id, c.otherUserId, c.otherProfile?.username || 'Ẩn danh')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
            selectedConversationId === c.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
          }`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
            {c.otherProfile?.avatar_url ? (
              <img src={c.otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">👤</div>
            )}
          </div>
          <span className="text-sm text-white truncate flex-1">
            {c.otherProfile?.username || 'Ẩn danh'}
          </span>
        </button>
      ))}
    </div>
  )
}
