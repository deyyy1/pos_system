import { supabase } from '../lib/supabase'

export async function getCategories(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, store_id, name, created_at')
    .eq('store_id', storeId)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function createCategory(storeId, name) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const categoryName = String(name || '').trim()

  if (!categoryName) {
    throw new Error('Category name is required')
  }

  const { data: existing, error: existingError } =
    await supabase
      .from('categories')
      .select('id, name')
      .eq('store_id', storeId)
      .ilike('name', categoryName)
      .limit(1)
      .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (existing) {
    throw new Error(
      `Category "${existing.name}" already exists.`
    )
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      store_id: storeId,
      name: categoryName,
    })
    .select('id, store_id, name, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateCategory(
  categoryId,
  storeId,
  name
) {
  if (!categoryId) {
    throw new Error('Category ID is required')
  }

  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const categoryName = String(name || '').trim()

  if (!categoryName) {
    throw new Error('Category name is required')
  }

  const { data: existing, error: existingError } =
    await supabase
      .from('categories')
      .select('id, name')
      .eq('store_id', storeId)
      .ilike('name', categoryName)
      .neq('id', categoryId)
      .limit(1)
      .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (existing) {
    throw new Error(
      `Category "${existing.name}" already exists.`
    )
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: categoryName,
    })
    .eq('id', categoryId)
    .eq('store_id', storeId)
    .select('id, store_id, name, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteCategory(
  categoryId,
  storeId
) {
  if (!categoryId) {
    throw new Error('Category ID is required')
  }

  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('store_id', storeId)

  if (error) {
    throw error
  }

  return true
}