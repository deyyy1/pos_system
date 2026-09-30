import { supabase } from '../lib/supabase'

function mapCustomer(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    contactNumber: row.contact_number,
    address: row.address,
    creditLimit:
      row.credit_limit === null
        ? null
        : Number(row.credit_limit),
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapUtangEntry(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    customerId: row.customer_id,
    item: row.item_description,
    amount: Number(row.amount) || 0,
    dueDate: row.due_date,
    referenceSaleId: row.reference_sale_id,
    createdBy: row.created_by,
    ts: row.created_at,
  }
}

function mapUtangPayment(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    customerId: row.customer_id,
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method,
    note: row.note,
    createdBy: row.created_by,
    ts: row.created_at,
  }
}

/* --------------------------------
   CUSTOMERS
-------------------------------- */

export async function getCustomers(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('customers')
    .select(`
      id,
      store_id,
      name,
      contact_number,
      address,
      credit_limit,
      notes,
      is_active,
      created_at,
      updated_at
    `)
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('name', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return (data || []).map(mapCustomer)
}

export async function createCustomer({
  storeId,
  name,
  contactNumber,
  address,
  creditLimit,
  notes,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  if (!name?.trim()) {
    throw new Error('Customer name is required')
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      store_id: storeId,
      name: name.trim(),
      contact_number:
        contactNumber || null,
      address: address || null,
      credit_limit:
        creditLimit === null ||
        creditLimit === undefined ||
        creditLimit === ''
          ? null
          : Number(creditLimit),
      notes: notes || null,
      is_active: true,
    })
    .select(`
      id,
      store_id,
      name,
      contact_number,
      address,
      credit_limit,
      notes,
      is_active,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    throw error
  }

  return mapCustomer(data)
}

export async function deleteCustomer(
  storeId,
  customerId
) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  if (!customerId) {
    throw new Error('Customer ID is required')
  }

  const { data, error } = await supabase.rpc(
    'delete_customer',
    {
      p_store_id: storeId,
      p_customer_id: customerId,
    }
  )

  if (error) {
    throw error
  }

  return data
}

/* --------------------------------
   UTANG ENTRIES
-------------------------------- */

export async function getUtangEntries(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('utang_entries')
    .select(`
      id,
      store_id,
      customer_id,
      item_description,
      amount,
      due_date,
      reference_sale_id,
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

  return (data || []).map(mapUtangEntry)
}

export async function createUtangEntry({
  storeId,
  customerId,
  customerName,
  item,
  amount,
  date,
  dueDate,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  let finalCustomerId = customerId

  if (!finalCustomerId) {
    if (!customerName?.trim()) {
      throw new Error('Customer name is required')
    }

    const customer = await createCustomer({
      storeId,
      name: customerName.trim(),
      contactNumber: null,
      address: null,
      creditLimit: null,
      notes: null,
    })

    finalCustomerId = customer.id
  }

  const { data, error } = await supabase
    .from('utang_entries')
    .insert({
      store_id: storeId,
      customer_id: finalCustomerId,
      item_description: item || '',
      amount: Number(amount),
      due_date: dueDate || null,
    })
    .select(`
      id,
      store_id,
      customer_id,
      item_description,
      amount,
      due_date,
      reference_sale_id,
      created_by,
      created_at
    `)
    .single()

  if (error) {
    throw error
  }

  return mapUtangEntry(data)
}

/* --------------------------------
   UTANG PAYMENTS
-------------------------------- */

export async function getUtangPayments(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('utang_payments')
    .select(`
      id,
      store_id,
      customer_id,
      amount,
      payment_method,
      note,
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

  return (data || []).map(mapUtangPayment)
}

export async function createUtangPayment({
  storeId,
  customerId,
  amount,
  paymentMethod = 'Cash',
  date,
  note,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  if (!customerId) {
    throw new Error('Customer ID is required')
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error(
      'Payment amount must be greater than zero'
    )
  }

  if (
    !['Cash', 'GCash'].includes(
      paymentMethod
    )
  ) {
    throw new Error(
      'Invalid payment method'
    )
  }

  const { data, error } = await supabase.rpc(
    'create_utang_payment',
    {
      p_store_id: storeId,
      p_customer_id: customerId,
      p_amount: Number(amount),
      p_payment_method: paymentMethod,
      p_note: note || null,
    }
  )

  if (error) {
    throw error
  }

  return data
}

/* --------------------------------
   BALANCES
-------------------------------- */

export async function getCustomerBalances(
  storeId
) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('customer_balances')
    .select('*')
    .eq('store_id', storeId)

  if (error) {
    throw error
  }

  return data || []
}