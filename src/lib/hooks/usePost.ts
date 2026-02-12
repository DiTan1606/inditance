'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createNotification } from '@/lib/notifications'

export function usePost(
  postId: string,
  authorId: string,
  currentUserId: string,
  initialLiked: boolean,
  initialLikeCount: number
) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)

  const toggleLike = useCallback(async () => {
    if (isLoading) return

    // Optimistic update
    const wasLiked = liked
    const prevCount = likeCount
    setLiked(!wasLiked)
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1)
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      if (wasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: currentUserId })
        
        if (error) throw error
        
        // Send notification if not own post
        if (authorId !== currentUserId) {
          await createNotification(supabase, authorId, 'like', currentUserId, postId)
        }
      }
    } catch (error) {
      // Rollback on error
      setLiked(wasLiked)
      setLikeCount(prevCount)
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }, [postId, authorId, currentUserId, liked, likeCount, isLoading])

  return { liked, likeCount, toggleLike, isLoading }
}
