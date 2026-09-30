import { supabase } from '../lib/supabase'

export async function createGcashTransaction({
  storeId,
  type,
  customerName,
  amount,
  fee,
  feePaidVia,
  ref,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const transactionType =
    type === 'Cash-In'
      ? 'CASH_IN'
      : 'CASH_OUT'

  const { data, error } = await supabase.rpc(
    'create_gcash_transaction',
    {
      p_store_id: storeId,
      p_transaction_type: transactionType,
      p_customer_name: customerName || null,
      p_customer_number: null,
      p_amount: Number(amount) || 0,
      p_service_fee: Number(fee) || 0,
      p_fee_paid_via:
        feePaidVia === 'Cash'
          ? 'Cash'
          : 'GCash balance',
      p_reference_number: ref || null,
      p_notes: null,
    }
  )

  if (error) {
    throw error
  }

  return data
}

export async function getGcashTransactions(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('gcash_transactions')
    .select(`
      id,
      store_id,
      transaction_type,
      customer_name,
      customer_number,
      amount,
      service_fee,
      fee_paid_via,
      reference_number,
      status,
      notes,
      created_at
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