'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Home,
  Bell,
  MessageCircle,
  Search,
  PlusSquare,
  User,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home', tab: 'home' },
  { href: '/?tab=notifications', icon: Bell, label: 'Thông báo', tab: 'notifications' },
  { href: '/?tab=messages', icon: MessageCircle, label: 'Tin nhắn', tab: 'messages' },
  { href: '/?tab=search', icon: Search, label: 'Tìm kiếm', tab: 'search' },
  { href: '/?tab=create', icon: PlusSquare, label: 'Tạo', tab: 'create' },
] as const

const bottomItems = [
  { href: '/?tab=profile', icon: User, label: 'Hồ sơ', tab: 'profile' },
  { href: '/?tab=settings', icon: Settings, label: 'Cài đặt', tab: 'settings' },
] as const

export function Sidebar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const tab = searchParams?.get('tab') ?? (pathname === '/profile' ? 'profile' : 'home')
  const [username, setUsername] = useState<string>('in')

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      if (data?.username) {
        setUsername(data.username.toLowerCase().replace(/\s/g, '').slice(0, 20) || 'in')
      }
    }
    fetch()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex-[5] min-w-[180px] max-w-[220px] h-screen flex flex-col py-4 border-l border-zinc-800 bg-zinc-950">
      <Link
        href="/"
        className="mb-8 px-4 text-2xl font-logo bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent hover:opacity-90 transition"
      >
        {username}
      </Link>
      <nav className="flex flex-col gap-1 flex-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = tab === item.tab
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-5 h-5 text-white shrink-0" />
              <span className="text-white text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <nav className="flex flex-col gap-1 px-2">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = tab === item.tab
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-5 h-5 text-white shrink-0" />
              <span className="text-white text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-zinc-800/50 hover:text-red-400 transition w-full text-left"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </nav>
    </aside>
  )
}
