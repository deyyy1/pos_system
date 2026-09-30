import { supabase } from '../lib/supabase'

export async function getSales(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('sales')
    .select(`
      id,
      store_id,
      transaction_number,
      subtotal,
      discount,
      total_amount,
      cost_amount,
      profit_amount,
      payment_method,
      cash_received,
      change_amount,
      status,
      notes,
      created_by,
      created_at,
      sale_items (
        id,
        product_id,
        product_name,
        quantity,
        unit_price,
        unit_cost,
        subtotal,
        created_at
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return (data || []).map((sale) => ({
    id: sale.id,
    storeId: sale.store_id,
    transactionNumber: sale.transaction_number,

    ts: sale.created_at,

    type: 'Product Sale',

    subtotal: Number(sale.subtotal) || 0,
    discount: Number(sale.discount) || 0,
    total: Number(sale.total_amount) || 0,

    method: sale.payment_method,

    amountReceived:
      sale.cash_received === null
        ? null
        : Number(sale.cash_received),

    change:
      sale.change_amount === null
        ? null
        : Number(sale.change_amount),

    cost: Number(sale.cost_amount) || 0,
    profit: Number(sale.profit_amount) || 0,

    status: sale.status,

    notes: sale.notes,

    items: (sale.sale_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.product_name,
      qty: Number(item.quantity) || 0,
      price: Number(item.unit_price) || 0,
      cost: Number(item.unit_cost) || 0,
      subtotal: Number(item.subtotal) || 0,
    })),

    createdBy: sale.created_by,
  }))
}