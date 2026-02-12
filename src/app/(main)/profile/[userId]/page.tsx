import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProfileView } from '../ProfileView'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function OtherProfilePage({ params }: PageProps) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) notFound()

  return <ProfileView profile={profile} currentUserId={user.id} />
}
