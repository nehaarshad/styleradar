
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { endSession } from '@/lib/userStorage';

export async function logout() {
  await createClient().auth.signOut
  await endSession();
  redirect('/login');
}
