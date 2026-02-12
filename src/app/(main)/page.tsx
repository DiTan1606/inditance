import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Newsfeed } from '@/components/post/Newsfeed'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: friendships } = await supabase
    .from('friendships')
    .select('user_id, friend_id')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'accepted')

  const friendIds = new Set<string>()
  ;(friendships || []).forEach((f) => {
    friendIds.add(f.user_id)
    friendIds.add(f.friend_id)
  })
  friendIds.delete(user.id)

  type PostRow = {
    id: string
    author_id: string
    image_url: string
    caption: string | null
    created_at: string
    profiles?: { username: string | null; avatar_url: string | null } | null
  }
  let posts: PostRow[] = []
  if (friendIds.size > 0) {
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, author_id, image_url, caption, created_at')
      .in('author_id', Array.from(friendIds))
      .order('created_at', { ascending: false })
      .limit(50)

    const rows = (postsData || []) as PostRow[]
    const authorIds = [...new Set(rows.map((p) => p.author_id))]
    const profilesMap: Record<string, { username: string | null; avatar_url: string | null }> = {}
    if (authorIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', authorIds)
      ;(profilesData || []).forEach((p: { id: string; username: string | null; avatar_url: string | null }) => {
        profilesMap[p.id] = { username: p.username, avatar_url: p.avatar_url }
      })
    }
    posts = rows.map((p) => ({ ...p, profiles: profilesMap[p.author_id] || null }))
  }

  const postIds = (posts as { id: string }[]).map((p) => p.id)

  const { data: likes } = postIds.length > 0
    ? await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
    : { data: [] }

  const likedPostIds = new Set((likes || []).map((l) => l.post_id))

  const { data: allLikes } = postIds.length > 0
    ? await supabase.from('likes').select('post_id').in('post_id', postIds)
    : { data: [] }

  const likeCountByPost: Record<string, number> = {}
  ;(allLikes || []).forEach((l) => {
    likeCountByPost[l.post_id] = (likeCountByPost[l.post_id] || 0) + 1
  })

  const { data: comments } = postIds.length > 0
    ? await supabase
        .from('comments')
        .select('id, post_id, user_id, content, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  const commentsByPost: Record<string, { id: string; user_id: string; content: string; created_at: string }[]> = {}
  ;(comments || []).forEach((c) => {
    if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = []
    commentsByPost[c.post_id].push(c)
  })

  return (
    <Newsfeed
      posts={posts || []}
      currentUserId={user.id}
      likedPostIds={likedPostIds}
      likeCountByPost={likeCountByPost}
      commentsByPost={commentsByPost}
    />
  )
}
