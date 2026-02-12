'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface MessagesContextType {
  selectedConversationId: string | null
  selectedOtherUserId: string | null
  selectedOtherUsername: string
  setSelected: (convId: string, otherUserId: string, otherUsername: string) => void
}

const MessagesContext = createContext<MessagesContextType | null>(null)

export function useMessagesOrNull() {
  return useContext(MessagesContext)
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider')
  return ctx
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null)
  const [selectedOtherUsername, setSelectedOtherUsername] = useState('')

  const setSelected = useCallback((convId: string, otherUserId: string, otherUsername: string) => {
    setSelectedConversationId(convId)
    setSelectedOtherUserId(otherUserId)
    setSelectedOtherUsername(otherUsername)
  }, [])

  return (
    <MessagesContext.Provider
      value={{
        selectedConversationId,
        selectedOtherUserId,
        selectedOtherUsername,
        setSelected,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}
