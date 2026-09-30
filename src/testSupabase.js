import { supabase } from './lib/supabase';

export async function testSupabase() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Supabase error:', error);
    return;
  }

  console.log('Supabase connected:', data);
}