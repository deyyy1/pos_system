import { supabase } from '../lib/supabase'

export async function getFinancialBalances(storeId) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase
    .from('financial_ledger')
    .select('account_type, direction, amount')
    .eq('store_id', storeId)

  if (error) {
    throw error
  }

  const balances = {
    cash: 0,
    gcash: 0,
    smartLoad: 0,
    globeLoad: 0,
    cashVault: 0,
  }

  for (const row of data || []) {
    const amount = Number(row.amount) || 0

    let key = null

    switch (row.account_type) {
      case 'CASH':
        key = 'cash'
        break

      case 'GCASH':
        key = 'gcash'
        break

      case 'LOAD_SMART':
        key = 'smartLoad'
        break

      case 'LOAD_GLOBE':
        key = 'globeLoad'
        break

      case 'CASH_VAULT':
        key = 'cashVault'
        break

      // Old shared LOAD records are intentionally ignored
      // for the new separate Smart/Globe balances.
      case 'LOAD':
        break

      default:
        break
    }

    if (!key) {
      continue
    }

    if (row.direction === 'IN') {
      balances[key] += amount
    } else if (row.direction === 'OUT') {
      balances[key] -= amount
    }
  }

  return balances
}

export async function setOpeningBalances({
  storeId,
  cash,
  gcash,
  smartLoad,
  globeLoad,
}) {
  if (!storeId) {
    throw new Error('Store ID is required')
  }

  const { data, error } = await supabase.rpc(
    'set_opening_balances',
    {
      p_store_id: storeId,
      p_cash: cash === null || cash === undefined ? null : Number(cash),
      p_gcash: gcash === null || gcash === undefined ? null : Number(gcash),
      p_smart_load:
        smartLoad === null || smartLoad === undefined
          ? null
          : Number(smartLoad),
      p_globe_load:
        globeLoad === null || globeLoad === undefined
          ? null
          : Number(globeLoad),
    }
  )

  if (error) {
    throw error
  }

  return data
}