'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createNotification } from '@/lib/notifications'
import { validateComment } from '@/lib/validation'

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
}

export function useComments(
  postId: string,
  authorId: string,
  currentUserId: string,
  initialComments: Comment[]
) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addComment = useCallback(async () => {
    const validationError = validateComment(newComment)
    if (validationError) {
      setError(validationError)
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim()
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (data) {
        setComments(prev => [...prev, data])
        setNewComment('')
        
        // Send notification if not own post
        if (authorId !== currentUserId) {
          await createNotification(supabase, authorId, 'comment', currentUserId, postId)
        }
      }

      return true
    } catch (err) {
      setError('Không thể thêm bình luận')
      console.error('Error adding comment:', err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [postId, authorId, currentUserId, newComment])

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const supabase = createClient()
      
      // Soft delete
      const { error } = await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('user_id', currentUserId)

      if (error) throw error

      setComments(prev => prev.filter(c => c.id !== commentId))
      return true
    } catch (err) {
      console.error('Error deleting comment:', err)
      return false
    }
  }, [currentUserId])

  return {
    comments,
    newComment,
    setNewComment,
    addComment,
    deleteComment,
    isSubmitting,
    error
  }
}
