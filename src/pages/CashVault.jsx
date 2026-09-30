import { useState, useMemo } from 'react'
import {
  Alert, Avatar, Box, Button, Card, Chip, InputAdornment, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import AddOutlined from '@mui/icons-material/AddOutlined'
import LockOutlined from '@mui/icons-material/LockOutlined'
import SearchOutlined from '@mui/icons-material/SearchOutlined'
import SouthWestOutlined from '@mui/icons-material/SouthWestOutlined'
import NorthEastOutlined from '@mui/icons-material/NorthEastOutlined'
import BalanceOutlined from '@mui/icons-material/BalanceOutlined'
import { useStore } from '../store/useStore'
import { money } from '../utils/format'
import Modal from '../components/Modal'

const isDeposit = (e) => e.type === 'Deposit'

function startOf(period) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (period === 'This week') d.setDate(d.getDate() - d.getDay())
  if (period === 'This month') d.setDate(1)
  return d
}

function PeriodCard({ title, entries }) {
  const cashIn = entries.filter(isDeposit).reduce((s, e) => s + e.amount, 0)
  const cashOut = entries.filter((e) => !isDeposit(e)).reduce((s, e) => s + e.amount, 0)
  const net = cashIn - cashOut

  const row = (icon, label, value, color) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
        {icon}
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Typography variant="body2" fontWeight={700} color={color}>{money(value)}</Typography>
    </Box>
  )

  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </Typography>
      </Box>
      {row(<SouthWestOutlined sx={{ fontSize: 18 }} />, 'Cash-in', cashIn, 'primary.dark')}
      {row(<NorthEastOutlined sx={{ fontSize: 18 }} />, 'Cash-out', cashOut, 'error.main')}
      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
        {row(<BalanceOutlined sx={{ fontSize: 18 }} />, 'Net movement', net, net < 0 ? 'error.main' : 'primary.dark')}
      </Box>
    </Card>
  )
}

function EntryForm({ cash, cashVault, onSubmit }) {
  const [mode, setMode] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const amt = Number(amount)
    if (!amt || amt <= 0) return setError('Enter an amount')
    if (mode === 'deposit' && amt > cash) return setError('Not enough cash on hand')
    if (mode === 'withdraw' && amt > cashVault) return setError('Not enough in the vault')
    setError('')
    setSaving(true)
    try {
      await onSubmit(mode, { amount: amt, note })
    } catch (e) {
      setError(e?.message || 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h6">New vault entry</Typography>
        <Typography variant="body2" color="text.secondary">
          Cash on hand: {money(cash)} - In vault: {money(cashVault)}
        </Typography>
      </Box>
      <ToggleButtonGroup fullWidth size="small" exclusive value={mode} onChange={(_, v) => v && setMode(v)}>
        <ToggleButton value="deposit">Cash-in to vault</ToggleButton>
        <ToggleButton value="withdraw">Cash-out from vault</ToggleButton>
      </ToggleButtonGroup>
      <TextField
        label="Amount" type="number" autoFocus value={amount} inputProps={{ min: 0 }}
        onChange={(e) => setAmount(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
      />
      <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Weekly savings" />
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" size="large" onClick={submit} disabled={saving}>
        {mode === 'deposit' ? 'Move to vault' : 'Withdraw to cash'}
      </Button>
    </Stack>
  )
}

export default function CashVault() {
  const { cash, cashVault, vaultHistory, moveToVault, withdrawFromVault } = useStore()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const periods = useMemo(
    () => ['Today', 'This week', 'This month'].map((title) => {
      const from = startOf(title)
      return { title: title === 'This week' ? 'This Week' : title === 'This month' ? 'This Month' : title, entries: vaultHistory.filter((e) => new Date(e.ts) >= from) }
    }),
    [vaultHistory]
  )

  const filtered = useMemo(
    () => vaultHistory.filter((e) => search === '' || (e.note || '').toLowerCase().includes(search.toLowerCase())),
    [vaultHistory, search]
  )

  const handleSubmit = async (mode, data) => {
    if (mode === 'deposit') await moveToVault(data)
    else await withdrawFromVault(data)
    setOpen(false)
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4">Cash Vault</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Money set aside, separate from your daily cash on hand.</Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddOutlined />} onClick={() => setOpen(true)}>New entry</Button>
      </Box>

      <Card sx={{ mt: 3, p: 2.5, display: 'inline-flex', alignItems: 'center', gap: 2, minWidth: { sm: 260 }, bgcolor: 'primary.light', borderColor: 'primary.main' }}>
        <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 44, height: 44, borderRadius: 2 }}>
          <LockOutlined />
        </Avatar>
        <Box>
          <Typography variant="overline" color="primary.dark">Vault balance</Typography>
          <Typography variant="h4" color="primary.dark" lineHeight={1.1}>{money(cashVault)}</Typography>
        </Box>
      </Card>

      <Box sx={{ mt: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' } }}>
        {periods.map((p) => <PeriodCard key={p.title} title={p.title} entries={p.entries} />)}
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 4, mb: 1 }}>Search entries</Typography>
      <TextField
        placeholder="Note..." value={search} onChange={(e) => setSearch(e.target.value)}
        sx={{ maxWidth: { sm: 360 }, bgcolor: 'background.paper', borderRadius: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
      />

      <Card sx={{ mt: 2, ...(filtered.length === 0 && { borderStyle: 'dashed', bgcolor: 'transparent' }) }}>
        {filtered.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 7, px: 2, textAlign: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'action.hover', color: 'text.secondary' }}><LockOutlined /></Avatar>
            <Typography variant="subtitle1" fontWeight={700}>
              {vaultHistory.length === 0 ? 'No vault entries yet' : 'No entries match your search'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vaultHistory.length === 0 ? 'Log a cash-in or cash-out to start the ledger.' : 'Try a different note.'}
            </Typography>
          </Stack>
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader sx={{ '& td, & th': { px: 2.5, py: 1.5 } }}>
              <TableHead>
                <TableRow>
                  {['Date', 'Type', 'Amount', 'Note'].map((h) => (
                    <TableCell key={h} sx={{ color: 'text.secondary', fontWeight: 600, bgcolor: 'background.paper' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(e.ts).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" color={isDeposit(e) ? 'primary' : 'error'} label={isDeposit(e) ? 'Cash-in' : 'Cash-out'} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: isDeposit(e) ? 'primary.dark' : 'error.main', whiteSpace: 'nowrap' }}>
                      {isDeposit(e) ? '+' : '-'}{money(e.amount)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{e.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <EntryForm cash={cash} cashVault={cashVault} onSubmit={handleSubmit} />
        </Modal>
      )}
    </Box>
  ) 
}