import { useState, useMemo } from 'react'
import {
  Alert, Badge, Box, Button, Card, Chip, Divider, IconButton, InputAdornment, Stack, Tab, Table,
  TableBody, TableCell, TableHead, TableRow, Tabs, TextField, ToggleButton, ToggleButtonGroup,
  Typography,
} from '@mui/material'
import SearchOutlined from '@mui/icons-material/SearchOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import RemoveOutlined from '@mui/icons-material/RemoveOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import PrintOutlined from '@mui/icons-material/PrintOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined'
import { useStore } from '../store/useStore'
import { money } from '../utils/format'
import { CATEGORIES } from '../constants'
import Modal from '../components/Modal'
import OpeningBalanceForm from '../components/OpeningBalanceForm'

const head = { color: 'text.secondary', fontWeight: 600 }
const Empty = ({ children }) => (
  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>{children}</Typography>
)
const Line = ({ label, value, bold }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
    <Typography variant={bold ? 'subtitle1' : 'body2'} fontWeight={bold ? 700 : 400} color={bold ? 'text.primary' : 'text.secondary'}>{label}</Typography>
    <Typography variant={bold ? 'subtitle1' : 'body2'} fontWeight={bold ? 700 : 500}>{value}</Typography>
  </Box>
)

export default function POS() {
  const [tab, setTab] = useState('checkout')
  return (
    <Box sx={{ minWidth: 0 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="checkout" label="Checkout" />
        <Tab value="history" label="Sales history" />
        <Tab value="reports" label="Reports" />
      </Tabs>
      {tab === 'checkout' && <Checkout />}
      {tab === 'history' && <SalesHistory />}
      {tab === 'reports' && <SalesReports />}
    </Box>
  )
}

function Checkout() {
  const { products, checkout } = useStore()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const filtered = useMemo(
    () => products.filter((p) =>
      p.stock > 0 &&
      (cat === 'All' || p.cat === cat) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode || '').includes(search))
    ),
    [products, search, cat]
  )

  const addToCart = (p) => setCart((c) => {
    const ex = c.find((i) => i.id === p.id)
    if (ex) return ex.qty >= p.stock ? c : c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
    return [...c, { id: p.id, name: p.name, price: p.price, cost: p.cost, qty: 1 }]
  })

  const changeQty = (id, delta) => setCart((c) => {
    const p = products.find((x) => x.id === id)
    return c.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0 && (!p || i.qty <= p.stock))
  })

  const clearCart = () => { setCart([]); setDiscount(0) }
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const total = Math.max(0, subtotal - discount)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const doCheckout = async (method, amountReceived, customerName) => {
    try {
      const sale = await checkout({ cart, discount, method, amountReceived, customerName })
      setReceipt(sale); setCart([]); setDiscount(0); setCheckoutOpen(false)
    } catch (e) { alert(e.message) }
  }

  return (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 360px' }, alignItems: 'start' }}>
      <Box sx={{ minWidth: 0 }}>
        <TextField
          placeholder="Search by name or barcode" value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              onClick={() => setCat(c)}
              color={cat === c ? 'primary' : 'default'}
              variant={cat === c ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
          {filtered.map((p) => (
            <Card key={p.id} onClick={() => addToCart(p)} sx={{ p: 2, cursor: 'pointer', transition: 'border-color .15s', '&:hover': { borderColor: 'primary.main' } }}>
              <Typography variant="body2" fontWeight={600} sx={{ minHeight: 40 }}>{p.name}</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="primary.dark">{money(p.price)}</Typography>
              <Typography variant="caption" color="text.secondary">Stock: {p.stock}</Typography>
            </Card>
          ))}
        </Box>
        {filtered.length === 0 && <Empty>No products match your search.</Empty>}
      </Box>

      <Card sx={{ p: 2.5, minWidth: 0, position: { md: 'sticky' }, top: { md: 88 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Badge badgeContent={cartCount} color="primary"><ShoppingCartOutlined /></Badge>
            <Typography variant="h6">Cart</Typography>
          </Stack>
          {cart.length > 0 && <Button size="small" color="inherit" onClick={clearCart}>Clear</Button>}
        </Box>
        {cart.length === 0 && <Empty>Cart is empty. Tap a product to add it.</Empty>}
        {cart.map((c) => (
          <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.25, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{c.name}</Typography>
              <Typography variant="caption" color="text.secondary">{money(c.price)} each</Typography>
            </Box>
            <Stack direction="row" alignItems="center">
              <IconButton size="small" onClick={() => changeQty(c.id, -1)} aria-label="Decrease quantity"><RemoveOutlined fontSize="small" /></IconButton>
              <Typography variant="body2" fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>{c.qty}</Typography>
              <IconButton size="small" onClick={() => changeQty(c.id, 1)} aria-label="Increase quantity"><AddOutlined fontSize="small" /></IconButton>
            </Stack>
            <Typography variant="body2" fontWeight={700} sx={{ width: 72, textAlign: 'right' }}>{money(c.price * c.qty)}</Typography>
          </Box>
        ))}
        {cart.length > 0 && (
          <Box sx={{ mt: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField label="Discount" type="number" inputProps={{ min: 0 }} value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }} />
            <Box sx={{ mt: 1.5 }}>
              <Line label="Subtotal" value={money(subtotal)} />
              <Line label="Total" value={money(total)} bold />
            </Box>
            <Button fullWidth variant="contained" size="large" sx={{ mt: 1.5 }} onClick={() => setCheckoutOpen(true)}>
              Charge {money(total)}
            </Button>
          </Box>
        )}
      </Card>

      {checkoutOpen && <Modal onClose={() => setCheckoutOpen(false)}><CheckoutForm total={total} onPay={doCheckout} /></Modal>}
      {receipt && <Modal onClose={() => setReceipt(null)}><Receipt sale={receipt} /></Modal>}
    </Box>
  )
}

function CheckoutForm({ total, onPay }) {
  const [method, setMethod] = useState(null)
  const [cashRecv, setCashRecv] = useState('')
  const [customerName, setCustomerName] = useState('')
  const recv = Number(cashRecv) || 0

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h6">Payment</Typography>
        <Typography variant="h4" color="primary.dark">{money(total)}</Typography>
      </Box>
      <ToggleButtonGroup fullWidth exclusive value={method} onChange={(_, v) => v && setMethod(v)}>
        <ToggleButton value="Cash">Cash</ToggleButton>
        <ToggleButton value="GCash">GCash</ToggleButton>
        <ToggleButton value="Utang">Utang</ToggleButton>
      </ToggleButtonGroup>

      {method === 'Cash' && (
        <>
          <TextField label="Cash received" type="number" autoFocus inputProps={{ min: 0 }} value={cashRecv}
            onChange={(e) => setCashRecv(e.target.value)}
            helperText={recv >= total ? `Change: ${money(recv - total)}` : `Need ${money(total - recv)} more`} />
          <Button variant="contained" size="large" disabled={recv < total} onClick={() => onPay('Cash', recv, null)}>Complete sale</Button>
        </>
      )}
      {method === 'GCash' && (
        <Button variant="contained" size="large" onClick={() => onPay('GCash', total, null)}>Confirm GCash payment</Button>
      )}
      {method === 'Utang' && (
        <>
          <TextField label="Customer name" autoFocus value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <Alert severity="info" icon={false}>
            This amount is added to the customer's utang balance. Cash and GCash do not increase until the customer pays.
          </Alert>
          <Button variant="contained" size="large" disabled={!customerName.trim()} onClick={() => onPay('Utang', 0, customerName.trim())}>
            Record utang sale
          </Button>
        </>
      )}
    </Stack>
  )
}

function Receipt({ sale }) {
  const lines = sale.items.map((i) => `${i.name} x${i.qty}  ${money(i.price * i.qty)}`).join('\n')
  const text =
    `TINDAHAN SARI-SARI STORE\n${new Date(sale.ts).toLocaleString()}\nTxn #${sale.id}\n------------------------\n${lines}\n------------------------\n` +
    `Subtotal: ${money(sale.subtotal)}\nDiscount: ${money(sale.discount)}\nTOTAL: ${money(sale.total)}\nPayment: ${sale.method}\n` +
    (sale.method === 'Cash' ? `Received: ${money(sale.amountReceived)}\nChange: ${money(sale.change)}\n` : '') +
    `\nSalamat po!`
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <CheckCircleOutlined color="primary" />
        <Typography variant="h6">Sale complete</Typography>
      </Stack>
      <Box component="pre" sx={{ m: 0, p: 2, bgcolor: 'background.default', borderRadius: 2, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
        {text}
      </Box>
      <Button variant="outlined" startIcon={<PrintOutlined />} onClick={() => window.print()}>Print receipt</Button>
    </Stack>
  )
}

function SalesHistory() {
  const { sales, voidSale } = useStore()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(
    () => [...sales].reverse().filter((s) => search === '' || s.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))),
    [sales, search]
  )
  const itemsLabel = (items) => (!items.length ? '-' : items.length > 1 ? `${items[0].name} +${items.length - 1} more` : items[0].name)
  const qtyTotal = (items) => items.reduce((s, i) => s + i.qty, 0)
  const remove = (sale) => {
    if (sale.status === 'Voided') return
    if (confirm('Void this sale? Stock and cash will be restored.')) voidSale(sale.id)
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <TextField placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} />
      <Card sx={{ mt: 2, overflowX: 'auto' }}>
        {filtered.length === 0 ? <Empty>No sales found.</Empty> : (
          <Table size="small">
            <TableHead>
              <TableRow>{['Date', 'Payment', 'Items', 'Qty', 'Total', ''].map((h) => <TableCell key={h} sx={head}>{h}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>{new Date(s.ts).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</TableCell>
                  <TableCell><Chip size="small" variant="outlined" color={s.method === 'Cash' ? 'primary' : 'secondary'} label={s.method} /></TableCell>
                  <TableCell>{itemsLabel(s.items)}</TableCell>
                  <TableCell>{qtyTotal(s.items)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{money(s.total)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {s.status === 'Voided' && <Chip size="small" label="Voided" sx={{ mr: 1 }} />}
                    <IconButton size="small" onClick={() => setSelected(s)} aria-label="View sale"><VisibilityOutlined fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => remove(s)} disabled={s.status === 'Voided'} aria-label="Void sale"><DeleteOutlined fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <Typography variant="h6">Sale details</Typography>
          <Typography variant="caption" color="text.secondary">{new Date(selected.ts).toLocaleString()} - Txn #{selected.id}</Typography>
          <Divider sx={{ my: 2 }} />
          {selected.items.map((i) => <Line key={i.id} label={`${i.name} x${i.qty}`} value={money(i.price * i.qty)} />)}
          <Divider sx={{ my: 1.5 }} />
          <Line label="Subtotal" value={money(selected.subtotal)} />
          <Line label="Discount" value={money(selected.discount)} />
          <Line label="Total" value={money(selected.total)} bold />
          <Typography variant="caption" color="text.secondary">Payment: {selected.method} - Status: {selected.status}</Typography>
          <Stack spacing={1} sx={{ mt: 2 }}>
            {selected.status !== 'Voided' && (
              <Button color="error" variant="outlined" onClick={() => { voidSale(selected.id); setSelected(null) }}>Void transaction</Button>
            )}
            <Button variant="outlined" startIcon={<PrintOutlined />} onClick={() => window.print()}>Reprint</Button>
          </Stack>
        </Modal>
      )}
    </Box>
  )
}

function SalesReports() {
  const { sales, cash, setOpeningBalances } = useStore()
  const [range, setRange] = useState('Today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [showOpening, setShowOpening] = useState(false)

  const inRange = (ts) => {
    const d = new Date(ts), now = new Date()
    if (range === 'Today') return d.toDateString() === now.toDateString()
    if (range === 'This Week') { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w }
    if (range === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (range === 'Custom') {
      const from = customFrom ? new Date(customFrom) : null
      const to = customTo ? new Date(customTo + 'T23:59:59') : null
      if (from && d < from) return false
      if (to && d > to) return false
    }
    return true
  }

  const filtered = useMemo(
    () => sales.filter((s) => s.status !== 'Voided' && inRange(s.ts)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sales, range, customFrom, customTo]
  )
  const totalSales = filtered.reduce((s, t) => s + t.total, 0)
  const totalCost = filtered.reduce((s, t) => s + t.items.reduce((x, i) => x + i.cost * i.qty, 0), 0)

  const byDay = {}
  filtered.forEach((s) => {
    const k = s.ts.slice(0, 10)
    byDay[k] = byDay[k] || { count: 0, total: 0 }
    byDay[k].count += 1
    byDay[k].total += s.total
  })
  const days = Object.keys(byDay).sort().reverse()

  const itemAgg = {}
  filtered.forEach((s) => s.items.forEach((i) => {
    itemAgg[i.name] = itemAgg[i.name] || { units: 0, revenue: 0 }
    itemAgg[i.name].units += i.qty
    itemAgg[i.name].revenue += i.price * i.qty
  }))
  const topItems = Object.entries(itemAgg).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10)

  const stats = [
    { label: 'Total sales', value: money(totalSales) },
    { label: 'Total cost (puhunan)', value: money(totalCost) },
    { label: 'Profit', value: money(totalSales - totalCost), hero: true },
    { label: 'Transactions', value: filtered.length },
  ]

  const table = (title, cols, rows, empty) => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="overline" color="text.secondary">{title}</Typography>
      <Card sx={{ mt: 1, overflowX: 'auto' }}>
        {rows.length === 0 ? <Empty>{empty}</Empty> : (
          <Table size="small">
            <TableHead><TableRow>{cols.map((c) => <TableCell key={c} sx={head}>{c}</TableCell>)}</TableRow></TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
        )}
      </Card>
    </Box>
  )

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <ToggleButtonGroup size="small" exclusive value={range} onChange={(_, v) => v && setRange(v)}>
          {['Today', 'This Week', 'This Month', 'Custom'].map((r) => <ToggleButton key={r} value={r}>{r}</ToggleButton>)}
        </ToggleButtonGroup>
        <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => setShowOpening(true)}>Opening balance</Button>
      </Box>

      {range === 'Custom' && (
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <TextField label="From" type="date" InputLabelProps={{ shrink: true }} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
          <TextField label="To" type="date" InputLabelProps={{ shrink: true }} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
        </Stack>
      )}

      <Box sx={{ mt: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' } }}>
        {stats.map((s) => (
          <Card key={s.label} sx={{ p: 2.5, ...(s.hero && { bgcolor: 'primary.light', borderColor: 'primary.main' }) }}>
            <Typography variant="overline" color="text.secondary">{s.label}</Typography>
            <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
          </Card>
        ))}
      </Box>

      {table('Daily breakdown', ['Date', 'Transactions', 'Total sales'],
        days.map((d) => (
          <TableRow key={d} sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell>{d}</TableCell><TableCell>{byDay[d].count}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>{money(byDay[d].total)}</TableCell>
          </TableRow>
        )), 'No sales in this range.')}

      {table('Top items in range', ['Item', 'Units', 'Revenue'],
        topItems.map(([name, v]) => (
          <TableRow key={name} sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell>{name}</TableCell><TableCell>{v.units}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>{money(v.revenue)}</TableCell>
          </TableRow>
        )), 'No items sold in this range.')}

      {showOpening && (
        <Modal onClose={() => setShowOpening(false)}>
          <OpeningBalanceForm
            fields={[{ key: 'cash', label: 'Opening cash on hand (₱)', value: cash }]}
            onSave={(data) => { setOpeningBalances(data); setShowOpening(false) }}
          />
        </Modal>
      )}
    </Box>
  )
}