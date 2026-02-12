'use client'

import { PostCard } from './PostCard'

interface NewsfeedProps {
  posts: {
    id: string
    author_id: string
    image_url: string
    caption: string | null
    created_at: string
    profiles?: { username: string | null; avatar_url: string | null } | null
  }[]
  currentUserId: string
  likedPostIds: Set<string>
  likeCountByPost: Record<string, number>
  commentsByPost: Record<string, { id: string; user_id: string; content: string; created_at: string }[]>
}

export function Newsfeed({
  posts,
  currentUserId,
  likedPostIds,
  likeCountByPost,
  commentsByPost,
}: NewsfeedProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>Chưa có bài viết nào từ bạn bè.</p>
        <p className="text-sm mt-2">Kết bạn để xem bảng tin.</p>
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
