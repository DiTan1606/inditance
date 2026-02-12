'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostCard } from '@/components/post/PostCard'

export function ProfilePostsView() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [likeCountByPost, setLikeCountByPost] = useState<Record<string, number>>({})
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setCurrentUserId(user.id)

      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          image_url,
          caption,
          created_at,
          profiles (username, avatar_url)
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      setPosts(postsData || [])

      const postIds = (postsData || []).map((p: { id: string }) => p.id)
      if (postIds.length > 0) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)
        setLikedPostIds(new Set((likes || []).map((l) => l.post_id)))

        const { data: allLikes } = await supabase.from('likes').select('post_id').in('post_id', postIds)
        const counts: Record<string, number> = {}
        ;(allLikes || []).forEach((l: { post_id: string }) => {
          counts[l.post_id] = (counts[l.post_id] || 0) + 1
        })
        setLikeCountByPost(counts)

        const { data: comments } = await supabase
          .from('comments')
          .select('id, post_id, user_id, content, created_at')
          .in('post_id', postIds)
          .order('created_at', { ascending: true })
        const byPost: Record<string, any[]> = {}
        ;(comments || []).forEach((c: any) => {
          if (!byPost[c.post_id]) byPost[c.post_id] = []
          byPost[c.post_id].push(c)
        })
        setCommentsByPost(byPost)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="text-zinc-500 p-4">Đang tải...</div>
  if (!currentUserId) return null

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>Chưa có bài viết nào.</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          initialLiked={likedPostIds.has(post.id)}
          initialLikeCount={likeCountByPost[post.id] || 0}
          initialComments={commentsByPost[post.id] || []}
        />
      ))}
    </div>
  )
}
