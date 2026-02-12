import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPostsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      caption,
      created_at,
      profiles (username)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/admin" className="text-zinc-400 hover:text-white text-sm mb-4 inline-block">
        ← Quay lại
      </Link>
      <h2 className="text-lg font-semibold mb-4">Quản lý bài viết</h2>
      <div className="space-y-4">
        {(posts || []).map((p) => (
          <div
            key={p.id}
            className="p-4 bg-zinc-900 rounded-lg border border-zinc-800"
          >
            <p className="text-sm text-zinc-400">
              {(p.profiles as { username?: string })?.username || 'Ẩn danh'} •{' '}
              {new Date(p.created_at).toLocaleDateString('vi-VN')}
            </p>
            <p className="mt-2 text-zinc-300">{p.caption || '(Không có caption)'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
