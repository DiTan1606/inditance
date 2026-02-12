'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMessagesOrNull } from './MessagesProvider'
import { ChatBox } from './ChatBox'

export function MessagesView() {
  const searchParams = useSearchParams()
  const withUserId = searchParams?.get('with')
  const ctx = useMessagesOrNull()
  const setSelected = ctx?.setSelected ?? (() => {})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
    }
    init()
  }, [])

  useEffect(() => {
    if (withUserId && currentUserId) {
      const uid = currentUserId
      const targetId = withUserId
      async function openOrCreate() {
        const supabase = createClient()
        const [ua, ub] = uid < targetId ? [uid, targetId] : [targetId, uid]
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_a', ua)
          .eq('user_b', ub)
          .maybeSingle()

        if (existing) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', targetId)
            .single()
          setSelected(existing.id, targetId, profile?.username || 'Ẩn danh')
        } else {
          const { data: created } = await supabase
            .from('conversations')
            .insert({ user_a: ua, user_b: ub })
            .select('id')
            .single()
          if (created) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', targetId)
              .single()
            setSelected(created.id, targetId, profile?.username || 'Ẩn danh')
          }
        }
      }
      openOrCreate()
    }
  }, [withUserId, currentUserId, setSelected])

  return <ChatBox />
}
