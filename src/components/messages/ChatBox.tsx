'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMessagesOrNull } from './MessagesProvider'

/* eslint-disable @next/next/no-img-element */

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export function ChatBox() {
  const ctx = useMessagesOrNull()
  const selectedConversationId = ctx?.selectedConversationId ?? null
  const selectedOtherUserId = ctx?.selectedOtherUserId ?? null
  const selectedOtherUsername = ctx?.selectedOtherUsername ?? ''
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const conversationId = selectedConversationId
  const otherUserId = selectedOtherUserId || ''
  const otherUsername = selectedOtherUsername

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
    }
    init()
  }, [])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }

    async function fetch() {
      setLoading(true)
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      setLoading(false)
    }
    fetch()

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId) return
    const content = newMessage.trim()
    setNewMessage('')
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
    })
  }

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <p>Chọn một cuộc hội thoại để xem tin nhắn</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-3 border-b border-zinc-800">
        <p className="font-medium text-white">{otherUsername}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-zinc-500 text-sm">Đang tải...</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                  m.sender_id === currentUserId
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800 text-zinc-200'
                }`}
              >
                <p className="text-sm">{m.content}</p>
                <p className="text-xs opacity-70 mt-0.5">
                  {new Date(m.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t border-zinc-800 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          maxLength={500}
          className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-200 disabled:opacity-50"
        >
          Gửi
        </button>
      </form>
    </div>
  )
}
