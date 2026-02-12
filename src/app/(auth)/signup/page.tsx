'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || null },
      },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl border border-zinc-800">
      <h1 className="text-2xl font-bold text-white mb-2">Inditance</h1>
      <p className="text-zinc-400 text-sm mb-6">Tạo tài khoản mới</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1">
            Tên người dùng (tùy chọn)
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            placeholder="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            placeholder="••••••••"
          />
          <p className="text-zinc-500 text-xs mt-1">Tối thiểu 6 ký tự</p>
        </div>
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-white hover:underline">Đăng nhập</Link>
      </p>
    </div>
  )
}
