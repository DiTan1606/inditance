'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createNotification } from '@/lib/notifications'
import { validateComment } from '@/lib/validation'

/* eslint-disable @next/next/no-img-element */

interface PostCardProps {
  post: {
    id: string
    author_id: string
    image_url: string
    caption: string | null
    created_at: string
    profiles?: { username: string | null; avatar_url: string | null } | null
  }
  currentUserId: string
  initialLiked: boolean
  initialLikeCount: number
  initialComments: { id: string; user_id: string; content: string; created_at: string }[]
}

export function PostCard({
  post,
  currentUserId,
  initialLiked,
  initialLikeCount,
  initialComments,
}: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)

  async function toggleLike() {
    const supabase = createClient()
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', currentUserId)
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: currentUserId })
      setLiked(true)
      setLikeCount((c) => c + 1)
      if (post.author_id !== currentUserId) {
        createNotification(supabase, post.author_id, 'like', currentUserId, post.id)
      }
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault()
    const err = validateComment(newComment)
    if (err) return
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: currentUserId, content: newComment.trim() })
      .select()
      .single()
    if (data) {
      setComments((c) => [...c, data])
      setNewComment('')
      if (post.author_id !== currentUserId) {
        createNotification(supabase, post.author_id, 'comment', currentUserId, post.id)
      }
    }
  }

  const username = post.profiles?.username || 'Ẩn danh'

  return (
    <article className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-4">
      <div className="p-3 flex items-center gap-3">
        <Link href={`/profile/${post.author_id}`} className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">👤</div>
            )}
          </div>
          <span className="text-sm font-medium text-white">{username}</span>
        </Link>
      </div>
      <div className="aspect-square max-h-96 bg-zinc-800">
        <img
          src={post.image_url}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-3">
        <div className="flex gap-4 mb-2">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 ${liked ? 'text-red-400' : 'text-zinc-400 hover:text-white'}`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-zinc-400 hover:text-white flex items-center gap-1"
          >
            💬 {comments.length > 0 && <span className="text-sm">{comments.length}</span>}
          </button>
        </div>
        {post.caption && (
          <p className="text-sm text-zinc-300 mb-2">
            <Link href={`/profile/${post.author_id}`} className="font-medium text-white hover:underline">
              {username}
            </Link>{' '}
            {post.caption}
          </p>
        )}
        {showComments && (
          <div className="border-t border-zinc-800 pt-2 mt-2">
            {comments.map((c) => (
              <p key={c.id} className="text-sm text-zinc-400 mb-1">
                {c.content}
              </p>
            ))}
            <form onSubmit={addComment} className="flex gap-2 mt-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Thêm bình luận..."
                maxLength={300}
                className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
              >
                Đăng
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  )
}
