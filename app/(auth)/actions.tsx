
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/utils/supabase/client';
import { endSession } from '@/lib/userStorage';

export async function logout() {
  await supabase.auth.signOut();
  await endSession();
  redirect('/login');
}
