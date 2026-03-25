import { redirect } from 'next/navigation';
import { createActionClient } from '@/lib/utils/supabase/actions';


export async function getStyleHistory(path = '/profile') {
  const supabase = await createActionClient();
 const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await supabase
  .from('style_dna')
  .select('*')
  .eq('user_id', user?.id);

if (error) {
  console.error('Error fetching data:', error);
} else {
  console.log('Fetched data:', data);
  return data;
}


}