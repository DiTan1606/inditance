export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected'
export type NotificationType = 'like' | 'comment' | 'friend_request' | 'friend_accepted'

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  dob: string | null
  bio: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: FriendshipStatus
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  image_url: string
  caption: string | null
  created_at: string
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  user_a: string
  user_b: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  actor_id: string | null
  reference_id: string | null
  read: boolean
  created_at: string
}
