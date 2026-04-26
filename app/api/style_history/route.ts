import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('API: Starting style_history fetch')
    
    // Log which Supabase URL we're using
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('API: Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('API: User found:', user.id)
    
    const { data, error } = await supabase
      .from('style_dna')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('API: Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`API: Found ${data?.length || 0} records`)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}