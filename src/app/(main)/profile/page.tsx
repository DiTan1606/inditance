import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileView } from './ProfileView'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return <div className="p-4 text-zinc-400">Không tìm thấy hồ sơ.</div>
  }

  return <ProfileView profile={profile} currentUserId={user.id} />
}
