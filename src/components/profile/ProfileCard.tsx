'use client'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { Profile as ProfileType } from '@/types/database'
import { FriendButton } from './FriendButton'

interface ProfileCardProps {
  profile: ProfileType
  isOwnProfile: boolean
  currentUserId?: string
  onEdit?: () => void
}

export function ProfileCard({ profile, isOwnProfile, currentUserId, onEdit }: ProfileCardProps) {
  return (
    <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-800 shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-zinc-500">
              👤
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white truncate">
            {profile.username || 'Chưa đặt tên'}
          </h2>
          {profile.bio && (
            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{profile.bio}</p>
          )}
          {profile.dob && (
            <p className="text-xs text-zinc-500 mt-1">
              Sinh nhật: {new Date(profile.dob).toLocaleDateString('vi-VN')}
            </p>
          )}
          {isOwnProfile && onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Chỉnh sửa
            </button>
          )}
          {!isOwnProfile && currentUserId && (
            <FriendButton
              currentUserId={currentUserId}
              targetUserId={profile.id}
              targetUsername={profile.username || ''}
            />
          )}
        </div>
      </div>
    </div>
  )
}
