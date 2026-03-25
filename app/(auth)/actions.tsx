'use server';

import { createActionClient } from '@/lib/utils/supabase/actions';
import { redirect } from 'next/navigation';

export async function login(email: string, password: string) {
  const supabase = await createActionClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  
  if (error) {
    
  }

  redirect('/feed');
}

export async function signup(email: string, password: string, username: string) {
  const supabase = await createActionClient();
  
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
   
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: email,
        username: username,
        password: password,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }

  redirect('/upload');
}

export async function logout() {
  const supabase = await createActionClient(); 
  await supabase.auth.signOut();
  redirect('/login');
}
