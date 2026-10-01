export const CATEGORIES = ['All','Beverages','Snacks','Canned Goods','Instant Noodles','Cigarettes','Personal Care','Household','School Supplies','Other']
export const NETWORKS = ['Globe','Smart']
export const DENOMS = [10,15,20,30,50,100,300,500]
export const EXPENSE_CATEGORIES = ['Electricity','Store Supplies','Transportation','Restocking','Rent','Other']
export const UNITS = ['pc','sachet','pack','bottle','can','box','kg','g','L','mL']
export const PAY_VIA = ['Cash','GCash balance','Load balance']

// Default fee-table brackets, same shape used by GCash and E-Load.
// Each bracket means "up to this amount, charge this fee". The first
// bracket whose `upTo` is >= the transaction amount wins.
export const DEFAULT_FEE_TABLE = {
  cashIn: [
    { upTo: 100, fee: 5 }, { upTo: 199, fee: 8 }, { upTo: 200, fee: 10 },
    { upTo: 299, fee: 13 }, { upTo: 300, fee: 15 }, { upTo: 399, fee: 18 },
    { upTo: 400, fee: 20 }, { upTo: 499, fee: 23 }, { upTo: 500, fee: 25 },
  ],
  cashOut: [
    { upTo: 100, fee: 5 }, { upTo: 200, fee: 10 }, { upTo: 300, fee: 15 },
    { upTo: 400, fee: 20 }, { upTo: 500, fee: 25 },
  ],
}

// Finds the fee for `amount` from a bracket list (sorted by upTo ascending
// not required — we sort defensively). Returns null when nothing covers it.
export function lookupFee(brackets, amount) {
  if (!amount || !brackets || brackets.length === 0) return null
  const sorted = [...brackets].sort((a, b) => a.upTo - b.upTo)
  const hit = sorted.find((b) => amount <= b.upTo)
  return hit ? hit.fee : null
}
