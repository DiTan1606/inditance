'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProfileEditForm } from './ProfileEditForm'
import { Profile } from '@/types/database'

export function ProfileSidebarContent() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="text-zinc-500 text-sm">Đang tải...</div>
  if (!profile) return <div className="text-zinc-500 text-sm">Không tìm thấy hồ sơ</div>

  async function handleSave(data: { username: string | null; bio: string | null; dob: string | null; avatar_url?: string | null }) {
    const supabase = createClient()
    const update: Record<string, unknown> = {
      username: data.username,
      bio: data.bio,
      dob: data.dob,
      updated_at: new Date().toISOString(),
    }
    if (data.avatar_url !== undefined) update.avatar_url = data.avatar_url
    await supabase.from('profiles').update(update).eq('id', profile!.id)
    setProfile({ ...profile!, ...data })
  }

  return (
    <div>
      <h3 className="font-semibold text-white text-sm mb-3">Chỉnh sửa hồ sơ</h3>
      <ProfileEditForm
        profile={profile}
        onSave={handleSave}
        onCancel={() => {}}
      />
    </div>
  )
}
