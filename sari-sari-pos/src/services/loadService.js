import { supabase } from '../lib/supabase'

export async function createLoadTransaction({
  storeId,
  type,
  network,
  amount,
  fee,
  feePaidVia,
  phone,
  customerName,
  ref,
  sellPrice,
  status,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase.rpc(
    'create_load_transaction',
    {
      p_store_id: storeId,
      p_transaction_type: type,
      p_network: network,
      p_amount: Number(amount) || 0,
      p_service_fee: Number(fee) || 0,
      p_fee_paid_via: feePaidVia || 'Cash',
      p_phone: phone || null,
      p_customer_name: customerName || null,
      p_reference_number: ref || null,
      p_sell_price:
        sellPrice === undefined || sellPrice === null
          ? null
          : Number(sellPrice),
      p_status: status || 'Successful',
    }
  )

  if (error) {
    throw error
  }

  return data
}

export async function getLoadTransactions(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('load_transactions')
    .select(`
      id,
      store_id,
      transaction_type,
      network,
      phone,
      customer_name,
      amount,
      service_fee,
      fee_paid_via,
      reference_number,
      sell_price,
      profit,
      status,
      created_by,
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