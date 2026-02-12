'use client'

import { FriendsList } from './FriendsList'
import { FriendSuggestions } from './FriendSuggestions'

export function FriendsAndSuggestions() {
  return (
    <div className="space-y-6">
      <FriendsList />
      <FriendSuggestions />
    </div>
  )
}
