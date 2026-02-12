'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useDebounce } from '@/lib/hooks/useDebounce'

/* eslint-disable @next/next/no-img-element */

interface ProfileResult {
  id: string
  username: string | null
  avatar_url: string | null
}

export function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProfileResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([])
        setSearched(false)
        return
      }

      setLoading(true)
      setSearched(true)

      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .ilike('username', `%${debouncedQuery.trim()}%`)
          .limit(20)
        
        setResults(data || [])
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    // Search is handled by useEffect with debounce
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white text-sm">Tìm kiếm</h3>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên người dùng..."
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
        />
      </form>
      {loading && <p className="text-zinc-500 text-sm">Đang tìm...</p>}
      {searched && !loading && (
        <div className="space-y-1">
          {results.length === 0 ? (
            <p className="text-zinc-500 text-sm">Không tìm thấy kết quả</p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                href={`/profile/${p.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">👤</div>
                  )}
                </div>
                <span className="text-sm text-white truncate">{p.username || 'Chưa đặt tên'}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
