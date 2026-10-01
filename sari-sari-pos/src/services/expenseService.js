import { supabase } from '../lib/supabase'

export async function getExpenses(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('expenses')
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

export async function createExpense(expense) {
  if (!expense?.store_id) {
    throw new Error('Store ID is required')
  }

  const { data, error } =
    await supabase.rpc(
      'create_expense',
      {
        p_store_id: expense.store_id,
        p_category: expense.category,
        p_description:
          expense.description || null,
        p_amount:
          Number(expense.amount) || 0,
        p_payment_method:
          expense.payment_method || 'Cash',
      }
    )

  if (error) {
    throw error
  }

  return data
}