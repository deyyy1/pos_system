import { supabase } from '../lib/supabase'

export async function getCashVaultTransactions(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('cash_vault_transactions')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data || []
}

export async function createCashVaultTransaction({
  storeId,
  transactionType,
  amount,
  note,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  if (!transactionType) {
    throw new Error('Transaction type is required')
  }

  const numericAmount = Number(amount) || 0

  if (numericAmount <= 0) {
    throw new Error(
      'Amount must be greater than zero'
    )
  }

  const { data, error } = await supabase.rpc(
    'create_cash_vault_transaction',
    {
      p_store_id: storeId,
      p_transaction_type: transactionType,
      p_amount: numericAmount,
      p_note: note || null,
    }
  )

  if (error) {
    throw error
  }

  return data
}