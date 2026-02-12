import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabaseServer = await createServerClient()
  const { data: { user: authUser } } = await supabaseServer.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseServer.from('profiles').select('role').eq('id', authUser.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (!targetUser?.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const isBanned = (targetUser.user as { ban_duration?: string }).ban_duration !== 'none'
  const banDuration = isBanned ? 'none' : '876000h'

  await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: banDuration })

  return NextResponse.json({ success: true, banned: !isBanned })
}
