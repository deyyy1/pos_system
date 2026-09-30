import { useState } from 'react'

// Editable list of "up to ₱X → fee ₱Y" brackets for one flow (cash-in or
// cash-out). Shared by the GCash and E-Load fee-table modals.
function BracketList({ label, brackets, onChange }) {
  const update = (i, key, val) => {
    const next = brackets.map((b, idx) => (idx === i ? { ...b, [key]: Number(val) || 0 } : b))
    onChange(next)
  }
  const removeAt = (i) => onChange(brackets.filter((_, idx) => idx !== i))
  const add = () => {
    const last = brackets[brackets.length - 1]
    onChange([...brackets, { upTo: (last?.upTo || 0) + 100, fee: (last?.fee || 0) + 5 }])
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>{label}</div>
      {brackets.map((b, i) => (
        <div className="row" key={i} style={{ alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <span className="muted" style={{ whiteSpace: 'nowrap' }}>Up to ₱</span>
            <input type="number" value={b.upTo} onChange={(e) => update(i, 'upTo', e.target.value)} style={{ marginBottom: 0 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <span className="muted" style={{ whiteSpace: 'nowrap' }}>→ fee ₱</span>
            <input type="number" value={b.fee} onChange={(e) => update(i, 'fee', e.target.value)} style={{ marginBottom: 0 }} />
          </div>
          <button type="button" className="iconbtn" onClick={() => removeAt(i)} aria-label="Remove bracket">🗑️</button>
        </div>
      ))}
      <button type="button" className="linklike" onClick={add}>+ Add bracket</button>
    </div>
  )
}

export default function FeeTableEditor({ title, table, onSave }) {
  const [cashIn, setCashIn] = useState(table.cashIn)
  const [cashOut, setCashOut] = useState(table.cashOut)

  return (
    <div>
      <h3>{title}</h3>
      <p className="muted" style={{ marginTop: -4 }}>
        Set the fee you charge for each amount range. Matching transactions auto-fill the service fee — you can still type over it on any single transaction.
      </p>
      <BracketList label="Cash-in" brackets={cashIn} onChange={setCashIn} />
      <BracketList label="Cash-out" brackets={cashOut} onChange={setCashOut} />
      <button className="btn full" onClick={() => onSave({ cashIn, cashOut })}>Save fee table</button>
    </div>
  )
}
