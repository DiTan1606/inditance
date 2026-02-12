'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFriendship } from '@/lib/hooks/useFriendship'

interface FriendButtonProps {
  currentUserId: string
  targetUserId: string
  targetUsername: string
}

export function FriendButton({ currentUserId, targetUserId, targetUsername }: FriendButtonProps) {
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false)
  const { state, sendRequest, acceptRequest, rejectRequest, unfriend } = useFriendship(
    currentUserId,
    targetUserId
  )

  if (currentUserId === targetUserId) return null

  if (state === 'loading') {
    return <span className="text-zinc-500 text-sm">Đang tải...</span>
  }

  async function handleUnfriend() {
    await unfriend()
    setShowUnfriendConfirm(false)
  }

  if (state === 'accepted') {
    return (
      <>
        <div className="flex gap-2 mt-2">
          <Link
            href={`/?tab=messages&with=${targetUserId}`}
            className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg"
          >
            Nhắn tin
          </Link>
          <button
            onClick={() => setShowUnfriendConfirm(true)}
            className="px-3 py-1.5 text-sm bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg"
          >
            Huỷ kết bạn
          </button>
        </div>

        {showUnfriendConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-sm w-full border border-zinc-800">
              <h3 className="text-lg font-semibold mb-2">Huỷ kết bạn?</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Bạn có chắc muốn huỷ kết bạn với {targetUsername}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnfriendConfirm(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUnfriend}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (state === 'pending_sent') {
    return (
      <div className="flex gap-2 mt-2">
        <span className="px-3 py-1.5 text-sm bg-zinc-700 rounded-lg text-zinc-400">Đã gửi lời mời</span>
        <button
          onClick={() => unfriend()}
          className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
        >
          Thu hồi
        </button>
      </div>
    )
  }

  if (state === 'pending_received') {
    return (
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => acceptRequest()}
          className="px-3 py-1.5 text-sm bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200"
        >
          Chấp nhận
        </button>
        <button
          onClick={() => rejectRequest()}
          className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg"
        >
          Từ chối
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => sendRequest()}
      className="mt-2 px-3 py-1.5 text-sm bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200"
    >
      Kết bạn
    </button>
  )
}
