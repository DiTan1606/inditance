import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BanUserButton } from './BanUserButton'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function AdminUserPage({ params }: PageProps) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, role, bio, created_at')
    .eq('id', userId)
    .single()

  if (!profile) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin" className="text-zinc-400 hover:text-white text-sm mb-4 inline-block">
        ← Quay lại
      </Link>
      <h2 className="text-lg font-semibold mb-4">Chi tiết người dùng</h2>
      <div className="space-y-2 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <p><strong>ID:</strong> {profile.id}</p>
        <p><strong>Username:</strong> {profile.username || '-'}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Bio:</strong> {profile.bio || '-'}</p>
        <p><strong>Ngày tạo:</strong> {new Date(profile.created_at).toLocaleDateString('vi-VN')}</p>
      </div>
      <BanUserButton userId={userId} />
    </div>
  )
}
