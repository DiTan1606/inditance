'use client'

import { useState, useRef } from 'react'
import { Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { validateBio, validateUsername } from '@/lib/validation'

interface ProfileEditFormProps {
  profile: Profile
  onSave: (data: { username: string | null; bio: string | null; dob: string | null; avatar_url?: string | null }) => Promise<void>
  onCancel: () => void
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB

export function ProfileEditForm({ profile, onSave, onCancel }: ProfileEditFormProps) {
  const [username, setUsername] = useState(profile.username || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [dob, setDob] = useState(profile.dob || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [saving, setSaving] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Ảnh không được quá 5MB')
      return
    }
    setAvatarError(null)
    const supabase = createClient()
    const path = `${profile.id}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) {
      setAvatarError(error.message)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const userErr = validateUsername(username)
    const bioErr = validateBio(bio)
    if (userErr || bioErr) {
      setError(userErr || bioErr || null)
      return
    }
    setError(null)
    setSaving(true)
    await onSave({
      username: username.trim() || null,
      bio: bio.trim() || null,
      dob: dob || null,
      avatar_url: avatarUrl || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Ảnh đại diện</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl text-zinc-500">👤</div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg"
            >
              Chọn ảnh
            </button>
            {avatarError && <p className="text-red-400 text-xs mt-1">{avatarError}</p>}
          </div>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Tên người dùng</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={50}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Ngày sinh</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}
