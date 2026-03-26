import { redirect } from 'next/navigation';
import { createServerSupabase } from './server';


export async function redirectIfAuthenticated(path = '/feed') {
   const supabase = await createServerSupabase()  
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect(path);
  }
}