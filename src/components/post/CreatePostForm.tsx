'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { validateCaption, validateImageSize, validateImageType } from '@/lib/validation'

export function CreatePostForm() {
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    const typeErr = validateImageType(file.type)
    if (typeErr) {
      setError(typeErr)
      return
    }
    
    const sizeErr = validateImageSize(file.size)
    if (sizeErr) {
      setError(sizeErr)
      return
    }
    
    setError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageFile) {
      setError('Vui lòng chọn ảnh')
      return
    }
    const captionErr = validateCaption(caption)
    if (captionErr) {
      setError(captionErr)
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Vui lòng đăng nhập')
      setLoading(false)
      return
    }

    const path = `${user.id}/${Date.now()}_${imageFile.name}`
    const { error: uploadError } = await supabase.storage.from('posts').upload(path, imageFile, {
      upsert: true,
    })

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(path)

    const { error: insertError } = await supabase.from('posts').insert({
      author_id: user.id,
      image_url: publicUrl,
      caption: caption.trim() || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setCaption('')
    clearImage()
    setLoading(false)
    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-white">Đăng bài</h3>
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-64 object-contain rounded-lg bg-zinc-800"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-zinc-800/80 rounded-full hover:bg-zinc-700"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 transition"
          >
            Chọn ảnh
          </button>
        )}
      </div>
      <div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Viết caption..."
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 resize-none"
        />
        <p className="text-xs text-zinc-500 mt-1">{caption.length}/500</p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !imageFile}
        className="w-full py-2.5 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-50"
      >
        {loading ? 'Đang đăng...' : 'Đăng bài'}
      </button>
    </form>
  )
}
