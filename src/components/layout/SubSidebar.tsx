'use client'

import { ReactNode } from 'react'

interface SubSidebarProps {
  children: ReactNode
}

export function SubSidebar({ children }: SubSidebarProps) {
  return (
    <aside className="flex-[10] min-w-[240px] max-w-[400px] h-screen overflow-y-auto border-r border-zinc-800 bg-zinc-950/50">
      <div className="p-4">
        {children}
      </div>
    </aside>
  )
}
