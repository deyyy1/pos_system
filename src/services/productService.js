import { supabase } from '../lib/supabase'

export async function getProducts(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function createProduct(product) {
  if (!product?.store_id) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateProduct(productId, updates) {
  if (!productId) {
    throw new Error('Product ID is required')
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deactivateProduct(productId) {
  if (!productId) {
    throw new Error('Product ID is required')
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      is_active: false,
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}