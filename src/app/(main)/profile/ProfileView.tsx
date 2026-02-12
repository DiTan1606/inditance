'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { Profile } from '@/types/database'

interface ProfileViewProps {
  profile: Profile
  currentUserId: string
}

export function ProfileView({ profile, currentUserId }: ProfileViewProps) {
  const [editing, setEditing] = useState(false)
  const [currentProfile, setCurrentProfile] = useState(profile)

  const isOwnProfile = currentProfile.id === currentUserId

  async function handleSave(data: { username: string | null; bio: string | null; dob: string | null; avatar_url?: string | null }) {
    const supabase = createClient()
    const update: Record<string, unknown> = {
      username: data.username,
      bio: data.bio,
      dob: data.dob,
      updated_at: new Date().toISOString(),
    }
    if (data.avatar_url !== undefined) update.avatar_url = data.avatar_url
    await supabase
      .from('profiles')
      .update(update)
      .eq('id', currentProfile.id)
    setCurrentProfile({ ...currentProfile, ...data })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
        <h2 className="font-semibold text-white mb-4">Chỉnh sửa hồ sơ</h2>
        <ProfileEditForm
          profile={currentProfile}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <ProfileCard
      profile={currentProfile}
      isOwnProfile={isOwnProfile}
      currentUserId={currentUserId}
      onEdit={isOwnProfile ? () => setEditing(true) : undefined}
    />
  )
}
