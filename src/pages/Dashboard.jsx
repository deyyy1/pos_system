import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Box, Button, Card, Chip, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material'
import AddShoppingCartOutlined from '@mui/icons-material/AddShoppingCartOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined'
import PhoneAndroidOutlined from '@mui/icons-material/PhoneAndroidOutlined'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import PaidOutlined from '@mui/icons-material/PaidOutlined'
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined'
import SmartphoneOutlined from '@mui/icons-material/SmartphoneOutlined'
import LockOutlined from '@mui/icons-material/LockOutlined'
import RemoveShoppingCartOutlined from '@mui/icons-material/RemoveShoppingCartOutlined'
import { useStore } from '../store/useStore'
import { money, isToday, todayStr } from '../utils/format'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'

function greetingWord() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - new Date(todayStr())) / 86400000)

const gridSx = { display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }

function Section({ title, action, children }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        {action}
      </Box>
      {children}
    </Box>
  )
}

const Empty = ({ children }) => (
  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>{children}</Typography>
)

export default function Dashboard() {
  const {
    sales, loadTxns, gcashTxns, products, cash, gcashBalance, cashVault,
    ownerName, utangEntries, utangPayments, moveToVault, withdrawFromVault,
  } = useStore()
  const [range, setRange] = useState(7)
  const [showVault, setShowVault] = useState(false)

  const todaySales = sales.filter((s) => isToday(s.ts) && s.status !== 'Voided')
  const totalSales = todaySales.reduce((s, t) => s + t.total, 0)
  const cashSales = todaySales.filter((t) => t.method === 'Cash').reduce((s, t) => s + t.total, 0)
  const gcashSales = todaySales.filter((t) => t.method === 'GCash').reduce((s, t) => s + t.total, 0)
  const itemsSold = todaySales.reduce((s, t) => s + t.items.reduce((x, i) => x + i.qty, 0), 0)
  const todayLoad = loadTxns.filter((t) => isToday(t.ts) && t.status === 'Successful')
  const loadSales = todayLoad.reduce((s, t) => s + (t.price ?? t.amount), 0)
  const gcashFees = gcashTxns.filter((t) => isToday(t.ts)).reduce((s, t) => s + t.fee, 0)
  const profit = todaySales.reduce((s, t) => s + t.profit, 0) + todayLoad.reduce((s, t) => s + (t.profit || 0), 0) + gcashFees
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock)
  const outStock = products.filter((p) => p.stock <= 0)
  const expiringSoon = products.filter((p) => p.expirationDate && daysUntil(p.expirationDate) <= 30)

  const utangOutstanding = useMemo(() => {
    const owed = {}
    utangEntries.forEach((e) => { owed[e.customerId] = (owed[e.customerId] || 0) + e.amount })
    utangPayments.forEach((p) => { owed[p.customerId] = (owed[p.customerId] || 0) - p.amount })
    return Object.values(owed).reduce((s, v) => s + Math.max(0, v), 0)
  }, [utangEntries, utangPayments])

  const recentTxns = useMemo(() => {
    const all = [
      ...sales.map((s) => ({ id: 's' + s.id, ts: s.ts, item: s.items.map((i) => `${i.qty}x ${i.name}`).join(', '), method: s.method, amount: s.total })),
      ...gcashTxns.map((t) => ({ id: 'g' + t.id, ts: t.ts, item: `GCash ${t.type}`, method: t.feePaidVia || 'Cash', amount: t.amount })),
      ...loadTxns.map((t) => ({ id: 'l' + t.id, ts: t.ts, item: `${t.network || ''} Load`, method: 'Cash', amount: t.price ?? t.amount })),
    ].sort((a, b) => new Date(b.ts) - new Date(a.ts))
    return all.slice(0, 6)
  }, [sales, gcashTxns, loadTxns])

  const chart = useMemo(() => {
    const days = []
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const total = sales.filter((s) => s.ts.slice(0, 10) === key && s.status !== 'Voided').reduce((s, t) => s + t.total, 0)
      days.push({ key, label: d.toLocaleDateString('en-PH', { weekday: range === 7 ? 'short' : undefined, day: 'numeric' }), total })
    }
    const max = Math.max(1, ...days.map((d) => d.total))
    const sum = days.reduce((s, d) => s + d.total, 0)
    return { days, max, sum, avg: sum / range }
  }, [sales, range])

  const topSellers = useMemo(() => {
    const agg = {}
    sales.filter((s) => s.status !== 'Voided').forEach((s) => s.items.forEach((i) => { agg[i.name] = (agg[i.name] || 0) + i.qty }))
    return Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [sales])

  const hasAlerts = lowStock.length > 0 || outStock.length > 0 || expiringSoon.length > 0

  return (
    <Box>
      <Typography variant="h4">{greetingWord()}, {ownerName || 'Boss'}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>Here's how your store is doing today.</Typography>
        
        <Box
          sx={{
            mt: 3,
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(6, max-content)',
            },
            '& .MuiButton-root': {
              justifyContent: 'flex-start',
              whiteSpace: 'nowrap',
              px: 1.75,
              minHeight: 44,
            },
          }}
        >
          <Button component={Link} to="/pos" variant="contained" startIcon={<AddShoppingCartOutlined />}>New sale</Button>
          <Button component={Link} to="/inventory?add=1" variant="outlined" startIcon={<AddOutlined />}>Add product</Button>
          <Button component={Link} to="/load" variant="outlined" startIcon={<PhoneAndroidOutlined />}>Sell load</Button>
          <Button component={Link} to="/gcash" variant="outlined" startIcon={<AccountBalanceWalletOutlined />}>GCash</Button>
          <Button component={Link} to="/utang" variant="outlined" startIcon={<MenuBookOutlined />}>Add utang</Button>
          <Button component={Link} to="/more" variant="outlined" startIcon={<ReceiptLongOutlined />}>Add bill</Button>
        </Box>
      <Section title="Today">
        <Box sx={gridSx}>
          <StatCard hero label="Today's sales" value={money(totalSales)} icon={<PaidOutlined />} to="/transactions" toLabel="View sales" />
          <StatCard label="Transactions" value={todaySales.length} icon={<ReceiptLongOutlined />} to="/transactions" toLabel="View sales" />
          <StatCard label="Items sold" value={itemsSold} icon={<Inventory2Outlined />} to="/inventory" toLabel="View inventory" />
          <StatCard label="Est. profit" value={money(profit)} icon={<TrendingUpOutlined />} />
        </Box>
      </Section>

      <Section title="Balances">
        <Box sx={gridSx}>
          <StatCard label="Cash on hand" value={money(cash)} icon={<PaymentsOutlined />} />
          <StatCard label="GCash float" value={money(gcashBalance)} icon={<SmartphoneOutlined />} to="/gcash" toLabel="View GCash" />
          <StatCard label="Utang outstanding" value={money(utangOutstanding)} tone={utangOutstanding > 0 ? 'warn' : undefined} icon={<MenuBookOutlined />} to="/utang" toLabel="View utang" />
          <StatCard label="Cash vault" value={money(cashVault)} icon={<LockOutlined />} to="/vault" toLabel="Open vault" />        </Box>
      </Section>

      <Section title="Breakdown">
        <Box sx={gridSx}>
          <StatCard label="Cash sales" value={money(cashSales)} icon={<PaymentsOutlined />} />
          <StatCard label="GCash sales" value={money(gcashSales)} icon={<SmartphoneOutlined />} />
          <StatCard label="Load sales" value={money(loadSales)} icon={<PhoneAndroidOutlined />} />
          <StatCard label="Out of stock" value={outStock.length} tone={outStock.length ? 'danger' : undefined} icon={<RemoveShoppingCartOutlined />} to="/inventory" toLabel="View inventory" />
        </Box>
      </Section>

      {hasAlerts && (
        <Section title="Inventory alerts">
          <Card>
            {[
              ...outStock.map((p) => ({ k: 'o' + p.id, chip: 'Out', color: 'error', text: p.name })),
              ...lowStock.map((p) => ({ k: 'l' + p.id, chip: 'Low', color: 'warning', text: `${p.name} (${p.stock} left)` })),
              ...expiringSoon.map((p) => ({ k: 'e' + p.id, chip: 'Expiring', color: 'warning', text: `${p.name} - ${new Date(p.expirationDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}` })),
            ].map((a, i, arr) => (
              <Box key={a.k}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25 }}>
                  <Chip size="small" variant="outlined" color={a.color} label={a.chip} sx={{ minWidth: 68, fontWeight: 600 }} />
                  <Typography variant="body2">{a.text}</Typography>
                </Box>
                {i < arr.length - 1 && <Divider />}
              </Box>
            ))}
          </Card>
        </Section>
      )}

      <Section
        title="Sales overview"
        action={
          <ToggleButtonGroup size="small" exclusive value={range} onChange={(_, v) => v && setRange(v)}>
            <ToggleButton value={7}>7 days</ToggleButton>
            <ToggleButton value={30}>30 days</ToggleButton>
          </ToggleButtonGroup>
        }
      >
        <Card sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Sales</Typography>
              <Typography variant="h6">{money(chart.sum)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Average / day</Typography>
              <Typography variant="h6">{money(chart.avg)}</Typography>
            </Box>
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: range === 7 ? 1.5 : 0.5, height: 140 }}>
            {chart.days.map((d) => (
              <Tooltip key={d.key} title={`${d.label}: ${money(d.total)}`} arrow>
                <Box sx={{
                  flex: 1, height: `${Math.max(3, (d.total / chart.max) * 100)}%`,
                  bgcolor: d.total ? 'primary.main' : 'divider', borderRadius: '6px 6px 0 0',
                  transition: 'opacity .15s', '&:hover': { opacity: 0.75 },
                }} />
              </Tooltip>
            ))}
          </Box>
          {range === 7 && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              {chart.days.map((d) => (
                <Typography key={d.key} variant="caption" color="text.secondary" align="center" sx={{ flex: 1 }}>{d.label}</Typography>
              ))}
            </Box>
          )}
        </Card>
      </Section>

      <Section title="Top sellers">
        <Card>
          {topSellers.length === 0 && <Empty>No sales yet. Make your first sale.</Empty>}
          {topSellers.map(([name, qty], i) => (
            <Box key={name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={700} color={i === 0 ? 'primary.main' : 'text.secondary'} sx={{ width: 20 }}>{i + 1}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{name}</Typography>
                <Typography variant="body2" color="text.secondary">{qty} sold</Typography>
              </Box>
              {i < topSellers.length - 1 && <Divider />}
            </Box>
          ))}
        </Card>
      </Section>

      <Section
        title="Recent transactions"
        action={<Button component={Link} to="/transactions" size="small">See all</Button>}
      >
        <Card sx={{ overflowX: 'auto' }}>
          {recentTxns.length === 0 ? <Empty>No transactions yet.</Empty> : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Item', 'Method', 'Amount', 'Time'].map((h) => (
                    <TableCell key={h} sx={{ color: 'text.secondary', fontWeight: 600 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTxns.map((t) => (
                  <TableRow key={t.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>{t.item}</TableCell>
                    <TableCell>{t.method}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{money(t.amount)}</TableCell>
                    <TableCell>{new Date(t.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </Section>

      {showVault && (
        <Modal onClose={() => setShowVault(false)}>
          <VaultPanel cashVault={cashVault} cash={cash} moveToVault={moveToVault} withdrawFromVault={withdrawFromVault} />
        </Modal>
      )}
    </Box>
  )
}

function VaultPanel({ cashVault, cash, moveToVault, withdrawFromVault }) {
  const [mode, setMode] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const submit = () => {
    const amt = Number(amount)
    if (!amt) return alert('Enter an amount')
    if (mode === 'deposit') {
      if (amt > cash) return alert('Not enough cash on hand')
      moveToVault({ amount: amt, note })
    } else {
      if (amt > cashVault) return alert('Not enough in the vault')
      withdrawFromVault({ amount: amt, note })
    }
    setAmount(''); setNote('')
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h6">Cash vault</Typography>
        <Typography variant="body2" color="text.secondary">
          Money set aside from the cash drawer, kept separate from your daily cash on hand.
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <StatCard label="In vault" value={money(cashVault)} />
        <StatCard label="Cash on hand" value={money(cash)} />
      </Box>
      <ToggleButtonGroup fullWidth size="small" exclusive value={mode} onChange={(_, v) => v && setMode(v)}>
        <ToggleButton value="deposit">Move to vault</ToggleButton>
        <ToggleButton value="withdraw">Withdraw</ToggleButton>
      </ToggleButtonGroup>
      <TextField label="Amount" type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} InputProps={{ startAdornment: <Typography sx={{ mr: 0.5 }} color="text.secondary">₱</Typography> }} />
      <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Weekly savings" />
      <Button variant="contained" size="large" onClick={submit}>
        {mode === 'deposit' ? 'Move to vault' : 'Withdraw to cash'}
      </Button>
    </Stack>
  )
}