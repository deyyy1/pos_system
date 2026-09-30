import { supabase } from '../lib/supabase'

export async function getSuppliers(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('store_id', storeId)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function createSupplier(supplier) {
  if (!supplier?.store_id) {
    throw new Error('Store ID is required')
  }

  const contactNumber =
    supplier.contact_number ??
    supplier.contact ??
    supplier.contactNumber ??
    null

  console.log('Creating supplier:', {
    store_id: supplier.store_id,
    name: supplier.name,
    contact_number: contactNumber,
    address: supplier.address,
  })

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      store_id: supplier.store_id,
      name: supplier.name,
      contact_number: contactNumber,
      address: supplier.address || null,
    })
    .select()
    .single()

  if (error) {
    console.error(
      'Supabase supplier insert error:',
      error
    )

    throw error
  }

  console.log(
    'Supplier created in Supabase:',
    data
  )

  return data
}

export async function updateSupplier(
  supplierId,
  updates
) {
  if (!supplierId) {
    throw new Error('Supplier ID is required')
  }

  const contactNumber =
    updates.contact ??
    updates.contact_number ??
    updates.contactNumber ??
    null

  const { data, error } = await supabase
    .from('suppliers')
    .update({
      name: updates.name,
      contact_number: contactNumber,
      address: updates.address || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', supplierId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteSupplier(supplierId) {
  if (!supplierId) {
    throw new Error('Supplier ID is required')
  }

  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', supplierId)

  if (error) {
    throw error
  }

  return true
}