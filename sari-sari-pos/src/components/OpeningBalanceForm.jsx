import { useState } from 'react'

// fields: [{ key, label, value }]. Calls onSave({ [key]: number, ... }).
export default function OpeningBalanceForm({ fields, onSave }) {
  const [vals, setVals] = useState(Object.fromEntries(fields.map((f) => [f.key, f.value])))
  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }))
  return (
    <div>
      <h3>Set opening balances</h3>
      <p className="muted" style={{ marginTop: -4 }}>
        The balance you were already holding before you started logging transactions here. This is used as the starting point for the running total.
      </p>
      {fields.map((f) => (
        <div key={f.key}>
          <label>{f.label}</label>
          <input type="number" value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} />
        </div>
      ))}
      <button className="btn full" onClick={() => onSave(vals)}>Save opening balances</button>
    </div>
  )
}
