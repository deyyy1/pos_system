import { supabase } from '../lib/supabase'

/*
 * =========================================================
 * GET CURRENT STORE
 * =========================================================
 */

export async function getCurrentStore() {
  // Get currently authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw authError
  }

  if (!user) {
    throw new Error('User is not authenticated')
  }

  // Find the user's active store membership
  const { data, error } = await supabase
    .from('store_members')
    .select(`
      store_id,
      role,
      is_active,
      stores (
        id,
        owner_id,
        store_name,
        address,
        contact_number,
        currency,
        opening_cash,
        opening_gcash,
        opening_load_balance,
        opening_cash_vault,
        setup_completed
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  // User is authenticated but does not have a store yet
  if (!data) {
    return null
  }

  // Store relation should exist
  if (!data.stores) {
    throw new Error(
      'Store membership exists, but the store could not be found'
    )
  }

  /*
   * Get profile information separately.
   *
   * Owner/cashier name belongs to the authenticated
   * user's profile, not the store table.
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      avatar_url
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    throw profileError
  }

  return {
    storeId: data.store_id,
    role: data.role,

    ...data.stores,

    ownerName:
      profile?.full_name || 'Boss',

    ownerEmail:
      profile?.email || user.email || '',

    avatarUrl:
      profile?.avatar_url || null,
  }
}


/*
 * =========================================================
 * UPDATE STORE PROFILE
 * =========================================================
 *
 * Updates information that belongs to the store itself.
 */

export async function updateStoreProfile({
  storeId,
  storeName,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const cleanStoreName =
    String(storeName || '').trim()

  if (!cleanStoreName) {
    throw new Error('Store name is required')
  }

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw authError
  }

  if (!user) {
    throw new Error('User is not authenticated')
  }
  console.log('AUTH USER:', user)
  console.log('AUTH USER ID:', user?.id)
  console.log('STORE ID:', storeId)

  /*
   * Only the store owner should be allowed to
   * change the store profile.
   */
  const {
    data,
    error,
  } = await supabase
    .from('stores')
    .update({
      store_name: cleanStoreName,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .select(`
      id,
      store_name,
      address,
      contact_number,
      currency,
      setup_completed
    `)
    .single()

  if (error) {
    throw error
  }

  return data
}


/*
|--------------------------------------------------------------------------
| Update owner profile
|--------------------------------------------------------------------------
*/

export async function updateOwnerProfile({
  ownerName,
}) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw authError
  }

  if (!user) {
    throw new Error('User is not authenticated')
  }

  console.log('PROFILE AUTH USER ID:', user.id)

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name:
        ownerName?.trim() || 'Boss',
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error(
      'Failed to update owner profile:',
      error
    )

    throw error
  }

  console.log(
    'Owner profile updated successfully:',
    data
  )

  return data
}

/*
 * =========================================================
 * UPDATE STORE + OWNER PROFILE
 * =========================================================
 *
 * Convenience function for the Settings page.
 *
 * Store Name  → stores.store_name
 * Owner Name  → profiles.full_name
 */

export async function updateStoreSettings({
  storeId,
  storeName,
  ownerName,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const cleanStoreName =
    String(storeName || '').trim()

  const cleanOwnerName =
    String(ownerName || '').trim()

  if (!cleanStoreName) {
    throw new Error('Store name is required')
  }

  if (!cleanOwnerName) {
    throw new Error('Owner name is required')
  }

  /*
   * Update both records.
   *
   * These are intentionally separate operations because
   * store information and user profile information live
   * in different tables.
   */

  const store =
    await updateStoreProfile({
      storeId,
      storeName: cleanStoreName,
    })

  const profile =
    await updateOwnerProfile({
      ownerName: cleanOwnerName,
    })

  return {
    storeId: store.id,

    storeName:
      store.store_name,

    ownerName:
      profile.full_name,

    address:
      store.address || '',

    contactNumber:
      store.contact_number || '',

    currency:
      store.currency || 'PHP',

    setupCompleted:
      store.setup_completed,

    email:
      profile.email || '',

    avatarUrl:
      profile.avatar_url || null,
  }
}


/*
 * =========================================================
 * CREATE STORE
 * =========================================================
 */

export async function createStore({
  storeName,
  address,
  contactNumber,
  openingCash = 0,
  openingGcash = 0,
  openingLoad = 0,
  openingCashVault = 0,
}) {
  // Make sure a user is authenticated before creating a store
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw authError
  }

  if (!user) {
    throw new Error('User is not authenticated')
  }

  const {
    data,
    error,
  } = await supabase.rpc('create_store', {
    p_store_name: storeName,
    p_address: address,
    p_contact_number: contactNumber,

    p_opening_cash:
      Number(openingCash) || 0,

    p_opening_gcash:
      Number(openingGcash) || 0,

    p_opening_load:
      Number(openingLoad) || 0,

    p_opening_cash_vault:
      Number(openingCashVault) || 0,
  })

  if (error) {
    throw error
  }

  return data
}

