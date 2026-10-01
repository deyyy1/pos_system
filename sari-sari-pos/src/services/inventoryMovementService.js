import { supabase } from '../lib/supabase'

export async function getInventoryMovements(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('inventory_movements')
    .select(`
      *,
      products (
        name
      ),
      suppliers (
        name
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data || []
}