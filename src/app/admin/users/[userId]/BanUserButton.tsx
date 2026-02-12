'use client'

import { useState } from 'react'

interface BanUserButtonProps {
  userId: string
}

export function BanUserButton({ userId }: BanUserButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleBan() {
    setLoading(true)
    const res = await fetch('/api/admin/ban-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setLoading(false)
    if (res.ok) {
      window.location.reload()
    }
  }

  return (
    <button
      onClick={handleBan}
      disabled={loading}
      className="mt-4 px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg disabled:opacity-50"
    >
      {loading ? 'Đang xử lý...' : 'Khóa / Mở khóa tài khoản'}
    </button>
  )
}
