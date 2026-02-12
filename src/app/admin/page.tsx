import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Quản lý người dùng</h2>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900">
            <tr>
              <th className="text-left p-3">Username</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Ngày tạo</th>
              <th className="text-left p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u) => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="p-3">{u.username || u.id.slice(0, 8)}</td>
                <td className="p-3">
                  <span className={u.role === 'admin' ? 'text-amber-400' : ''}>{u.role}</span>
                </td>
                <td className="p-3 text-zinc-400">
                  {new Date(u.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-zinc-400 hover:text-white"
                  >
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-4">Quản lý nội dung</h2>
      <div className="flex gap-4">
        <Link
          href="/admin/posts"
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
        >
          Bài viết
        </Link>
      </div>
    </div>
  )
}
