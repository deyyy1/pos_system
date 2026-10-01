import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { money } from '../utils/format'
import { NETWORKS, PAY_VIA, lookupFee } from '../constants'
import Modal from '../components/Modal'
import FeeTableEditor from '../components/FeeTableEditor'
import OpeningBalanceForm from '../components/OpeningBalanceForm'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import PhoneAndroidOutlined from '@mui/icons-material/PhoneAndroidOutlined'
import SettingsOutlined from '@mui/icons-material/SettingsOutlined'
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined'
import HistoryOutlined from '@mui/icons-material/HistoryOutlined'
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined'
import ClearOutlined from '@mui/icons-material/ClearOutlined'
import SendOutlined from '@mui/icons-material/SendOutlined'
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined'
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined'
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined'
import TuneOutlined from '@mui/icons-material/TuneOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'

const headCell = {
  color: 'text.secondary',
  fontWeight: 600,
  bgcolor: 'background.paper',
  whiteSpace: 'nowrap',
}

function StatCard({
  icon,
  label,
  value,
  color = 'primary.main',
  subtitle,
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'action.hover',
            color,
          }}
        >
          {icon}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {label}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mt: 0.25,
              fontWeight: 700,
              color,
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  )
}

function StatusChip({ status }) {
  if (status === 'Successful') {
    return (
      <Chip
        size="small"
        icon={<CheckCircleOutlineOutlined />}
        label="Successful"
        color="success"
        variant="outlined"
      />
    )
  }

  if (status === 'Failed') {
    return (
      <Chip
        size="small"
        icon={<ErrorOutlineOutlined />}
        label="Failed"
        color="error"
        variant="outlined"
      />
    )
  }

  return (
    <Chip
      size="small"
      icon={<CancelOutlined />}
      label={status || 'Cancelled'}
      color="default"
      variant="outlined"
    />
  )
}

export default function LoadPage() {
  const {
    loadTxns,
    sellLoad,
    loadTransaction,
    cash,
    smartLoadBalance,
    globeLoadBalance,
    feeTables,
    updateFeeTable,
    setOpeningBalances,
  } = useStore()

  const [tab, setTab] = useState('quick')
  const [showFeeTable, setShowFeeTable] = useState(false)
  const [showOpening, setShowOpening] = useState(false)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filteredLoadTxns = useMemo(() => {
    let transactions = [...loadTxns]

    if (fromDate) {
      const start = new Date(`${fromDate}T00:00:00`)

      transactions = transactions.filter((t) => {
        return new Date(t.ts) >= start
      })
    }

    if (toDate) {
      const end = new Date(`${toDate}T23:59:59.999`)

      transactions = transactions.filter((t) => {
        return new Date(t.ts) <= end
      })
    }

    transactions.sort(
      (a, b) =>
        new Date(b.ts).getTime() -
        new Date(a.ts).getTime()
    )

    return transactions
  }, [loadTxns, fromDate, toDate])

  const clearDateFilter = () => {
    setFromDate('')
    setToDate('')
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Load
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Sell mobile load and manage your load transactions.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<TuneOutlined />}
            onClick={() => setShowFeeTable(true)}
            fullWidth
            sx={{
              minWidth: { sm: 145 },
              whiteSpace: 'nowrap',
            }}
          >
            Fee table
          </Button>

          <Button
            variant="contained"
            startIcon={<AccountBalanceOutlined />}
            onClick={() => setShowOpening(true)}
            fullWidth
            sx={{
              minWidth: { sm: 175 },
              whiteSpace: 'nowrap',
            }}
          >
            Opening balances
          </Button>
        </Stack>
      </Stack>

      {/* BALANCES */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2,
          mt: 3,
        }}
      >
        <StatCard
          icon={<PaymentsOutlined />}
          label="Cash on Hand"
          value={money(cash)}
          color="primary.main"
          subtitle="Available cash balance"
        />

        <StatCard
          icon={<PhoneAndroidOutlined />}
          label="Smart Load"
          value={money(smartLoadBalance)}
          color="success.main"
          subtitle="Current Smart load balance"
        />

        <StatCard
          icon={<PhoneAndroidOutlined />}
          label="Globe Load"
          value={money(globeLoadBalance)}
          color="warning.main"
          subtitle="Current Globe load balance"
        />
      </Box>

      {/* TRANSACTION TABS */}
      <Card
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tab}
          onChange={(event, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: { xs: 1, sm: 2 },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            value="quick"
            label="Quick Sell"
            icon={<SendOutlined />}
            iconPosition="start"
          />

          <Tab
            value="txn"
            label="Cash-In / Cash-Out"
            icon={<SwapHorizOutlined />}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {tab === 'quick' ? (
            <QuickSell sellLoad={sellLoad} />
          ) : (
            <FullTxnForm
              loadTransaction={loadTransaction}
              feeTables={feeTables}
            />
          )}
        </Box>
      </Card>

      {/* LOAD HISTORY */}
      <Card
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* CARD HEADER */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            pb: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                }}
              >
                <HistoryOutlined />
              </Avatar>

              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Transactions
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  Load History
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={`${filteredLoadTxns.length} ${
                filteredLoadTxns.length === 1
                  ? 'transaction'
                  : 'transactions'
              }`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Divider />

        {/* DATE FILTERS */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            bgcolor: 'action.hover',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'flex-end' }}
          >
            <TextField
              label="From"
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                maxWidth: { sm: 190 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="To"
              type="date"
              size="small"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                maxWidth: { sm: 190 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="outlined"
              startIcon={<ClearOutlined />}
              onClick={clearDateFilter}
              disabled={!fromDate && !toDate}
              sx={{
                minWidth: { sm: 110 },
                height: 40,
              }}
            >
              Clear
            </Button>
          </Stack>
        </Box>

        {/* TABLE */}
        <TableContainer
          sx={{
            maxHeight: 520,
            overflowX: 'auto',
            overflowY: 'auto',
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 900,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={headCell}>
                  Time
                </TableCell>

                <TableCell sx={headCell}>
                  Type
                </TableCell>

                <TableCell sx={headCell}>
                  Network
                </TableCell>

                <TableCell sx={headCell} align="right">
                  Amount
                </TableCell>

                <TableCell sx={headCell} align="right">
                  Fee
                </TableCell>

                <TableCell sx={headCell}>
                  Paid Via
                </TableCell>

                <TableCell sx={headCell}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredLoadTxns.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{
                    '&:last-child td': {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {new Date(t.ts).toLocaleDateString()}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {new Date(t.ts).toLocaleTimeString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {t.type === 'Cash-In' ? (
                      <Chip
                        size="small"
                        icon={<SendOutlined />}
                        label={t.phone ? 'Quick Sell' : 'Cash-In'}
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        size="small"
                        icon={<SwapHorizOutlined />}
                        label="Cash-Out"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {t.network || '—'}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {money(t.price ?? t.amount)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {money(t.fee || 0)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {t.feePaidVia || '—'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <StatusChip status={t.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* EMPTY STATE */}
        {filteredLoadTxns.length === 0 && (
          <Box
            sx={{
              px: 2,
              py: 7,
              textAlign: 'center',
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 52,
                height: 52,
                mx: 'auto',
                mb: 1.5,
                bgcolor: 'action.hover',
                color: 'text.secondary',
                borderRadius: 2,
              }}
            >
              <ReceiptLongOutlined />
            </Avatar>

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600 }}
            >
              No load transactions found
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Try changing the selected date range.
            </Typography>
          </Box>
        )}
      </Card>

      {/* FEE TABLE MODAL */}
      {showFeeTable && (
        <Modal
          onClose={() => setShowFeeTable(false)}
        >
          <FeeTableEditor
            title="E-Load service fee table"
            table={feeTables.eload}
            onSave={(t) => {
              updateFeeTable('eload', t)
              setShowFeeTable(false)
            }}
          />
        </Modal>
      )}

      {/* OPENING BALANCE MODAL */}
      {showOpening && (
        <Modal
          onClose={() => setShowOpening(false)}
        >
          <OpeningBalanceForm
            fields={[
              {
                key: 'cash',
                label: 'Opening cash on hand (₱)',
                value: cash,
              },
              {
                key: 'smartLoad',
                label: 'Opening Smart load balance (₱)',
                value: smartLoadBalance,
              },
              {
                key: 'globeLoad',
                label: 'Opening Globe load balance (₱)',
                value: globeLoadBalance,
              },
            ]}
            onSave={async (data) => {
              try {
                await setOpeningBalances(data)

                setShowOpening(false)

                alert(
                  'Opening balances saved successfully'
                )
              } catch (error) {
                console.error(
                  'Failed to save opening balances:',
                  error
                )

                alert(
                  error?.message ||
                    'Failed to save opening balances'
                )
              }
            }}
          />
        </Modal>
      )}
    </Box>
  )
}


/* =========================================================
   QUICK SELL
========================================================= */

function QuickSell({ sellLoad }) {
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState(NETWORKS[0])
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const amt = Number(amount) || 0

  const sellPrice = Math.round(amt * 1.1)

  const profit = sellPrice - amt

  const confirm = async (status) => {
    if (!phone.trim()) {
      return alert(
        'Enter customer mobile number'
      )
    }

    if (!amt) {
      return alert(
        'Enter an amount'
      )
    }

    setSaving(true)

    try {
      await sellLoad({
        phone,
        network,
        amount: amt,
        sellPrice,
        status,
      })

      setPhone('')
      setAmount('')

      alert(
        'Load transaction saved successfully'
      )
    } catch (error) {
      console.error(
        'Failed to save load transaction:',
        error
      )

      alert(
        error?.message ||
          'Failed to save load transaction'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      {/* FORM HEADER */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 42,
            height: 42,
            bgcolor: 'action.hover',
            color: 'primary.main',
            borderRadius: 2,
          }}
        >
          <SendOutlined />
        </Avatar>

        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Quick Sell
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Quickly sell mobile load to a customer.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      <Stack spacing={2}>
        <TextField
          label="Customer Mobile Number"
          placeholder="09XXXXXXXXX"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          fullWidth
          autoComplete="tel"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneAndroidOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          <TextField
            select
            label="Network"
            value={network}
            onChange={(e) =>
              setNetwork(e.target.value)
            }
            fullWidth
          >
            {NETWORKS.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            fullWidth
            inputProps={{
              min: 0,
              step: '0.01',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  ₱
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* SALE SUMMARY */}
        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2.5,
            bgcolor: 'action.hover',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Customer Pays
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                {money(sellPrice)}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Load Cost
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                {money(amt)}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Profit
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'success.main',
                }}
              >
                {money(profit)}
              </Typography>
            </Box>
          </Box>
        </Card>

        <Button
          variant="contained"
          size="large"
          startIcon={
            saving ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              <CheckCircleOutlineOutlined />
            )
          }
          onClick={() =>
            confirm('Successful')
          }
          disabled={saving}
          fullWidth
        >
          Confirm — Successful
        </Button>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<ErrorOutlineOutlined />}
            onClick={() =>
              confirm('Failed')
            }
            disabled={saving}
            fullWidth
          >
            Mark Failed
          </Button>

          <Button
            variant="outlined"
            startIcon={<CancelOutlined />}
            onClick={() =>
              confirm('Cancelled')
            }
            disabled={saving}
            fullWidth
          >
            Cancel
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}


/* =========================================================
   FULL CASH-IN / CASH-OUT TRANSACTION
========================================================= */

function FullTxnForm({
  loadTransaction,
  feeTables,
}) {
  const [type, setType] = useState('Cash-In')
  const [network, setNetwork] = useState(NETWORKS[0])
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState('')
  const [feePaidVia, setFeePaidVia] = useState('Cash')
  const [customerName, setCustomerName] = useState('')
  const [ref, setRef] = useState('')
  const [saving, setSaving] = useState(false)

  const brackets =
    type === 'Cash-In'
      ? feeTables.eload.cashIn
      : feeTables.eload.cashOut

  const autoFee = lookupFee(
    brackets,
    Number(amount)
  )

  const feeToUse =
    fee === ''
      ? autoFee ?? 0
      : Number(fee)

  const submit = async () => {
    const amt = Number(amount)

    if (!amt) {
      return alert(
        'Enter an amount'
      )
    }

    setSaving(true)

    try {
      await loadTransaction({
        type,
        network,
        amount: amt,
        fee: feeToUse,
        feePaidVia,
        customerName,
        ref,
      })

      setAmount('')
      setFee('')
      setCustomerName('')
      setRef('')

      alert(
        'Load transaction saved successfully'
      )
    } catch (error) {
      console.error(
        'Failed to save load transaction:',
        error
      )

      alert(
        error?.message ||
          'Failed to save load transaction'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      {/* FORM HEADER */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 42,
            height: 42,
            bgcolor: 'action.hover',
            color: 'primary.main',
            borderRadius: 2,
          }}
        >
          <SwapHorizOutlined />
        </Avatar>

        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Cash-In / Cash-Out
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Record load balance transactions and service fees.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      <Stack spacing={2}>
        {/* TRANSACTION TYPE */}
        <Tabs
          value={type}
          onChange={(event, value) => {
            setType(value)
            setFee('')
          }}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            value="Cash-In"
            label="Cash-In"
            icon={<SendOutlined />}
            iconPosition="start"
          />

          <Tab
            value="Cash-Out"
            label="Cash-Out"
            icon={<AccountBalanceWalletOutlined />}
            iconPosition="start"
          />
        </Tabs>

        <Alert
          severity="info"
          variant="outlined"
          icon={<ReceiptLongOutlined />}
        >
          {type === 'Cash-In'
            ? 'Customer pays cash, and load is sent from your balance.'
            : 'You restock your load balance using cash.'}
        </Alert>

        {/* NETWORK */}
        <TextField
          select
          label="Network"
          value={network}
          onChange={(e) =>
            setNetwork(e.target.value)
          }
          fullWidth
        >
          {NETWORKS.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </TextField>

        {/* AMOUNT + FEE */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            fullWidth
            inputProps={{
              min: 0,
              step: '0.01',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  ₱
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Service Fee"
            type="number"
            placeholder={String(
              autoFee ?? 0
            )}
            value={fee}
            onChange={(e) =>
              setFee(e.target.value)
            }
            fullWidth
            inputProps={{
              min: 0,
              step: '0.01',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  ₱
                </InputAdornment>
              ),
            }}
            helperText={
              autoFee !== null &&
              amount !== ''
                ? `Suggested fee: ${money(autoFee ?? 0)}`
                : undefined
            }
          />
        </Box>

        {/* NO FEE BRACKET */}
        {autoFee === null &&
          amount !== '' && (
            <Alert
              severity="warning"
              variant="outlined"
            >
              No fee-table bracket covers this amount yet. You can manually enter a service fee.
            </Alert>
          )}

        {/* FEE PAYMENT METHOD */}
        <TextField
          select
          label="Fee paid via"
          value={feePaidVia}
          onChange={(e) =>
            setFeePaidVia(e.target.value)
          }
          fullWidth
        >
          {PAY_VIA.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>

        {/* CUSTOMER + REFERENCE */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          <TextField
            label="Customer name"
            placeholder="Walk-in customer"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            fullWidth
            helperText="Optional"
          />

          <TextField
            label="Reference number"
            placeholder="1234567890123"
            value={ref}
            onChange={(e) =>
              setRef(e.target.value)
            }
            fullWidth
            helperText="Optional"
          />
        </Box>

        {/* SUBMIT */}
        <Button
          variant="contained"
          size="large"
          startIcon={
            saving ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              <ReceiptLongOutlined />
            )
          }
          onClick={submit}
          disabled={saving}
          fullWidth
        >
          Log Transaction
        </Button>
      </Stack>
    </Box>
  )
}