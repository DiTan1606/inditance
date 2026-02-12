import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabaseServer = await createServerClient()
    const { data: { user: authUser } } = await supabaseServer.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if caller is admin
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { userId } = await request.json()
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
    }

    // Prevent admin from banning themselves
    if (userId === authUser.id) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 })
    }

    // Check target user role
    const { data: targetProfile } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent banning other admins
    if (targetProfile.role === 'admin') {
      return NextResponse.json({ error: 'Cannot ban admin users' }, { status: 403 })
    }

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
      return NextResponse.json({ error: 'User not found in auth system' }, { status: 404 })
    }

    const isBanned = (targetUser.user as { ban_duration?: string }).ban_duration !== 'none'
    const banDuration = isBanned ? 'none' : '876000h'

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { 
      ban_duration: banDuration 
    })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      banned: !isBanned,
      message: isBanned ? 'User unbanned successfully' : 'User banned successfully'
    })
  } catch (error) {
    console.error('Ban user error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
