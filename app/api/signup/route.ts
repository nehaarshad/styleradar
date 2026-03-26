import { createServerSupabase } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
      const supabase = await createServerSupabase();
  const { email, password, username } = await req.json();

  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password, 
    options: { 
      data: { 
        username,
      } 
    } 
  });
  
    if (error) {
     console.error('Signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log('Signup data:',data);

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user?.id ,
        email: data.user?.email,
        username: data.user?.user_metadata?.username,
        password: password,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

     return NextResponse.json(data);

}