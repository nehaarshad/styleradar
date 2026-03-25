import { redirect } from 'next/navigation';
import { createActionClient } from './actions';


export async function redirectIfAuthenticated(path = '/feed') {
  const supabase = await createActionClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect(path);
  }
}