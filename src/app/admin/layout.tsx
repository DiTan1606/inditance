import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <a href="/" className="text-sm text-zinc-400 hover:text-white mt-1 inline-block">
          ← Về trang chủ
        </a>
      </header>
      {children}
    </div>
  )
}
