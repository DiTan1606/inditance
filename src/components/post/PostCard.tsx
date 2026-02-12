'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePost } from '@/lib/hooks/usePost'
import { useComments } from '@/lib/hooks/useComments'
import { useRouter } from 'next/navigation'

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
  onDelete?: () => void
}

export function PostCard({
  post,
  currentUserId,
  initialLiked,
  initialLikeCount,
  initialComments,
  onDelete,
}: PostCardProps) {
  const router = useRouter()
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { liked, likeCount, toggleLike, isLoading: isLikeLoading } = usePost(
    post.id,
    post.author_id,
    currentUserId,
    initialLiked,
    initialLikeCount
  )

  const {
    comments,
    newComment,
    setNewComment,
    addComment,
    deleteComment,
    isSubmitting,
    error: commentError
  } = useComments(post.id, post.author_id, currentUserId, initialComments)

  const isOwnPost = post.author_id === currentUserId
  const username = post.profiles?.username || 'Ẩn danh'

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    await addComment()
  }

  async function handleDeletePost() {
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', post.id)
        .eq('author_id', currentUserId)

      if (error) throw error

      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Không thể xóa bài viết')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <article className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-4">
      <div className="p-3 flex items-center justify-between">
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
        
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-zinc-400 hover:text-white"
            >
              ⋯
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowDeleteConfirm(true)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-700"
                >
                  Xóa bài
                </button>
              </div>
            )}
          </div>
        )}
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
            disabled={isLikeLoading}
            className={`flex items-center gap-1 transition ${
              liked ? 'text-red-400' : 'text-zinc-400 hover:text-white'
            } disabled:opacity-50`}
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
            <div className="space-y-2 mb-2">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-2">
                  <p className="text-sm text-zinc-400 flex-1">{c.content}</p>
                  {c.user_id === currentUserId && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-xs text-zinc-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Thêm bình luận..."
                maxLength={300}
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'Đăng'}
              </button>
            </form>
            {commentError && (
              <p className="text-xs text-red-400 mt-1">{commentError}</p>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-sm w-full border border-zinc-800">
            <h3 className="text-lg font-semibold mb-2">Xóa bài viết?</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
