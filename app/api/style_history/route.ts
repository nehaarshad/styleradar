import { createServerSupabase } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('API: Starting style_history fetch')
    
    // Log which Supabase URL we're using
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('API: Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const supabase = await createServerSupabase()
    
    // Test a simple query to see if we can access any data
    const { data: testData, error: testError } = await supabase
      .from('style_dna')
      .select('count')
      .limit(1)
    
    console.log('API: Test query result:', testData, testError)
    
    // Also check if we can list tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'style_dna')
    
    console.log('API: Tables check:', tables, tablesError)
    
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