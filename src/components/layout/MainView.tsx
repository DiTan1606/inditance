'use client'

import { ReactNode } from 'react'

interface MainViewProps {
  children: ReactNode
}

export function MainView({ children }: MainViewProps) {
  return (
    <main className="flex-[6] min-w-0 overflow-y-auto border-r border-zinc-800">
      <div className="p-4 max-w-2xl mx-auto">
        {children}
      </div>
    </main>
  )
}
