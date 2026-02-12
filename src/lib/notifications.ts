import type { SupabaseClient } from '@supabase/supabase-js'

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  type: 'like' | 'comment' | 'friend_request' | 'friend_accepted',
  actorId: string,
  referenceId?: string | null
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    actor_id: actorId,
    reference_id: referenceId || null,
    read: false,
  })
}
