'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { SubSidebar } from './SubSidebar'
import { MainView } from './MainView'
import { FriendSuggestions } from '@/components/friends/FriendSuggestions'
import { CreatePostForm } from '@/components/post/CreatePostForm'
import { NotificationsList } from '@/components/notifications/NotificationsList'
import { MessagesView } from '@/components/messages/MessagesView'
import { ConversationList } from '@/components/messages/ConversationList'
import { MessagesProvider } from '@/components/messages/MessagesProvider'
import { SearchBox } from '@/components/search/SearchBox'
import { FriendsAndSuggestions } from '@/components/friends/FriendsAndSuggestions'
import { ProfileSidebarContent } from '@/components/profile/ProfileSidebarContent'
import { ProfilePostsView } from '@/components/profile/ProfilePostsView'

function MainAppContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const tab = searchParams?.get('tab') ?? (pathname === '/profile' ? 'profile' : 'home')
  const isProfileView = tab === 'profile' || (pathname === '/profile' && !searchParams?.get('tab'))

  const content = (
    <div className="flex h-screen overflow-hidden">
      <MainView>
        {tab === 'messages' ? <MessagesView /> : isProfileView ? <ProfilePostsView /> : children}
      </MainView>
      <SubSidebar>
        {tab === 'home' && <FriendsAndSuggestions />}
        {tab === 'notifications' && <NotificationsList />}
        {tab === 'messages' && <ConversationListWithUser />}
        {tab === 'search' && <SearchBox />}
        {tab === 'create' && <CreatePostForm />}
        {isProfileView && <ProfileSidebarContent />}
        {tab === 'settings' && <div className="text-zinc-400 text-sm">Cài đặt</div>}
      </SubSidebar>
      <Sidebar />
    </div>
  )

  return tab === 'messages' ? (
    <MessagesProvider>{content}</MessagesProvider>
  ) : (
    content
  )
}

function ConversationListWithUser() {
  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data: { user } }) => {
        if (user) setUserId(user.id)
      })
    })
  }, [])
  if (!userId) return <div className="text-zinc-500 text-sm">Đang tải...</div>
  return <ConversationList currentUserId={userId} />
}

export function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950"><div className="animate-pulse text-zinc-500">Đang tải...</div></div>}>
      <MainAppContent>{children}</MainAppContent>
    </Suspense>
  )
}
