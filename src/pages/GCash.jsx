import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { money } from '../utils/format'
import { PAY_VIA, lookupFee } from '../constants'
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
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined'
import PhoneAndroidOutlined from '@mui/icons-material/PhoneAndroidOutlined'
import SettingsOutlined from '@mui/icons-material/SettingsOutlined'
import HistoryOutlined from '@mui/icons-material/HistoryOutlined'
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined'
import ClearOutlined from '@mui/icons-material/ClearOutlined'
import SendOutlined from '@mui/icons-material/SendOutlined'
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined'
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined'
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined'
import TagOutlined from '@mui/icons-material/TagOutlined'

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
        transition:
          'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
      >
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

function TransactionTypeChip({ type }) {
  const isCashIn = type === 'Cash-In'

  return (
    <Chip
      size="small"
      icon={
        isCashIn ? (
          <SendOutlined />
        ) : (
          <SwapHorizOutlined />
        )
      }
      label={type}
      color={isCashIn ? 'success' : 'info'}
      variant="outlined"
    />
  )
}

export default function GCash() {
  const {
    gcashTxns,
    gcashService,
    cash,
    gcashBalance,
    feeTables,
    updateFeeTable,
    setOpeningBalances,
    storeId,
  } = useStore()

  const [mode, setMode] = useState('Cash-In')
  const [customerName, setCustomerName] =
    useState('')
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState('')
  const [feePaidVia, setFeePaidVia] =
    useState('Cash')
  const [ref, setRef] = useState('')

  const [showFeeTable, setShowFeeTable] =
    useState(false)
  const [showOpening, setShowOpening] =
    useState(false)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const [saving, setSaving] = useState(false)

  const brackets =
    mode === 'Cash-In'
      ? feeTables.gcash.cashIn
      : feeTables.gcash.cashOut

  const autoFee = lookupFee(
    brackets,
    Number(amount)
  )

  const feeToUse =
    fee === ''
      ? autoFee ?? 0
      : Number(fee)

  const filteredGcashTxns = useMemo(() => {
    return [...gcashTxns]
      .filter((t) => {
        const date = new Date(t.ts)

        if (fromDate) {
          const from = new Date(
            `${fromDate}T00:00:00`
          )

          if (date < from) {
            return false
          }
        }

        if (toDate) {
          const to = new Date(
            `${toDate}T23:59:59.999`
          )

          if (date > to) {
            return false
          }
        }

        return true
      })
      .sort(
        (a, b) =>
          new Date(b.ts) -
          new Date(a.ts)
      )
  }, [
    gcashTxns,
    fromDate,
    toDate,
  ])

  const clearDateFilter = () => {
    setFromDate('')
    setToDate('')
  }

  const submit = async () => {
    const amt = Number(amount)

    if (!amt) {
      return alert('Enter an amount')
    }

    if (amt < 0) {
      return alert(
        'Amount cannot be negative'
      )
    }

    if (!storeId) {
      return alert('Store ID is missing')
    }

    setSaving(true)

    try {
      await gcashService({
        storeId,
        type: mode,
        customerName,
        amount: amt,
        fee: feeToUse,
        feePaidVia,
        ref,
      })

      setCustomerName('')
      setAmount('')
      setFee('')
      setRef('')

      alert(
        'GCash transaction saved successfully'
      )
    } catch (error) {
      console.error(
        'Failed to save GCash transaction:',
        error
      )

      alert(
        error?.message ||
          'Failed to save GCash transaction'
      )
    } finally {
      setSaving(false)
    }
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
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={2}
        alignItems={{
          xs: 'stretch',
          sm: 'center',
        }}
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
            GCash
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage GCash cash-in and cash-out transactions.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<SettingsOutlined />}
            onClick={() =>
              setShowFeeTable(true)
            }
            fullWidth
            sx={{
              minWidth: {
                sm: 135,
              },
              whiteSpace: 'nowrap',
            }}
          >
            Fee table
          </Button>

          <Button
            variant="contained"
            startIcon={
              <AccountBalanceOutlined />
            }
            onClick={() =>
              setShowOpening(true)
            }
            fullWidth
            sx={{
              minWidth: {
                sm: 175,
              },
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
          icon={
            <AccountBalanceWalletOutlined />
          }
          label="GCash Wallet Balance"
          value={money(gcashBalance)}
          color="success.main"
          subtitle="Current GCash balance"
        />
      </Box>

      {/* NEW TRANSACTION */}
      <Card
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
          }}
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
              <ReceiptLongOutlined />
            </Avatar>

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                }}
              >
                GCash
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                New Transaction
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                Record a GCash cash-in or cash-out transaction.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* TRANSACTION TYPE */}
        <Tabs
          value={mode}
          onChange={(event, value) => {
            setMode(value)
            setFee('')
          }}
          variant="fullWidth"
          sx={{
            px: {
              xs: 1,
              sm: 2,
            },
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
            icon={<SwapHorizOutlined />}
            iconPosition="start"
          />
        </Tabs>

        <Box
          sx={{
            p: {
              xs: 1.5,
              sm: 2.5,
            },
          }}
        >
          <Stack spacing={2}>
            <Alert
              severity="info"
              variant="outlined"
              icon={
                mode === 'Cash-In' ? (
                  <SendOutlined />
                ) : (
                  <SwapHorizOutlined />
                )
              }
            >
              {mode === 'Cash-In'
                ? 'Customer sends cash, and you send GCash.'
                : 'Customer sends GCash, and you hand over cash.'}
            </Alert>

            {/* AMOUNT */}
            <TextField
              label="Amount"
              type="number"
              autoFocus
              min="0"
              step="0.01"
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

            {/* FEE + PAYMENT METHOD */}
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
                label="Service Fee"
                type="number"
                min="0"
                step="0.01"
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
                    ? `Suggested fee: ${money(
                        autoFee ?? 0
                      )}`
                    : undefined
                }
              />

              <TextField
                select
                label="Fee paid via"
                value={feePaidVia}
                onChange={(e) =>
                  setFeePaidVia(
                    e.target.value
                  )
                }
                fullWidth
              >
                {PAY_VIA.filter(
                  (v) =>
                    v !== 'Load balance'
                ).map((v) => (
                  <MenuItem
                    key={v}
                    value={v}
                  >
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* NO FEE BRACKET */}
            {autoFee === null &&
              amount !== '' && (
                <Alert
                  severity="warning"
                  variant="outlined"
                  icon={
                    <ErrorOutlineOutlined />
                  }
                >
                  No fee-table bracket covers this amount yet. You can manually enter a service fee.
                </Alert>
              )}

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
                  setCustomerName(
                    e.target.value
                  )
                }
                fullWidth
                helperText="Optional"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TagOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* TRANSACTION SUMMARY */}
            <Card
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'action.hover',
              }}
            >
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={{
                  xs: 1.5,
                  sm: 4,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Transaction Type
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <TransactionTypeChip
                      type={mode}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Amount
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {money(
                      Number(amount) || 0
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Service Fee
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color:
                        feeToUse > 0
                          ? 'success.main'
                          : 'text.primary',
                    }}
                  >
                    {money(feeToUse)}
                  </Typography>
                </Box>
              </Stack>
            </Card>

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
                  <CheckCircleOutlineOutlined />
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
      </Card>

      {/* GCASH HISTORY */}
      <Card
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
            pb: 2,
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.5}
            alignItems={{
              xs: 'flex-start',
              sm: 'center',
            }}
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
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Transactions
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  GCash History
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={`${filteredGcashTxns.length} ${
                filteredGcashTxns.length === 1
                  ? 'transaction'
                  : 'transactions'
              }`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Divider />

        {/* DATE FILTER */}
        <Box
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
            },
            bgcolor: 'action.hover',
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.5}
            alignItems={{
              xs: 'stretch',
              sm: 'flex-end',
            }}
          >
            <TextField
              label="From"
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              sx={{
                maxWidth: {
                  sm: 190,
                },
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
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              sx={{
                maxWidth: {
                  sm: 190,
                },
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
              disabled={
                !fromDate && !toDate
              }
              sx={{
                minWidth: {
                  sm: 110,
                },
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
              minWidth: 1050,
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
                  Customer
                </TableCell>

                <TableCell
                  sx={headCell}
                  align="right"
                >
                  Amount
                </TableCell>

                <TableCell
                  sx={headCell}
                  align="right"
                >
                  Fee
                </TableCell>

                <TableCell sx={headCell}>
                  Paid Via
                </TableCell>

                <TableCell sx={headCell}>
                  Reference
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredGcashTxns.map((t) => (
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
                      sx={{
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {new Date(
                        t.ts
                      ).toLocaleDateString()}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {new Date(
                        t.ts
                      ).toLocaleTimeString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <TransactionTypeChip
                      type={t.type}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow:
                          'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {t.customerName ||
                        '—'}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {money(t.amount)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {money(t.fee)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {t.feePaidVia ||
                        '—'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      color={
                        t.ref
                          ? 'text.primary'
                          : 'text.secondary'
                      }
                      sx={{
                        maxWidth: 220,
                        overflow:
                          'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap',
                        fontFamily:
                          t.ref
                            ? 'monospace'
                            : 'inherit',
                      }}
                    >
                      {t.ref || '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* EMPTY STATE */}
        {filteredGcashTxns.length === 0 && (
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
              <HistoryOutlined />
            </Avatar>

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
              }}
            >
              {gcashTxns.length === 0
                ? 'No GCash transactions yet.'
                : 'No GCash transactions found'}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {gcashTxns.length === 0
                ? 'Completed GCash cash-in and cash-out transactions will appear here.'
                : 'Try changing the selected date range.'}
            </Typography>
          </Box>
        )}
      </Card>

      {/* INFORMATION */}
      <Alert
        severity="info"
        variant="outlined"
        icon={<AccountBalanceWalletOutlined />}
        sx={{
          mt: 2,
          borderRadius: 2.5,
        }}
      >
        GCash payments for store purchases are recorded through POS checkout
        using Payment: GCash and appear in Transactions. They are kept separate
        from Cash-In and Cash-Out transactions recorded here.
      </Alert>

      {/* FEE TABLE MODAL */}
      {showFeeTable && (
        <Modal
          onClose={() =>
            setShowFeeTable(false)
          }
        >
          <FeeTableEditor
            title="GCash service fee table"
            table={feeTables.gcash}
            onSave={(t) => {
              updateFeeTable(
                'gcash',
                t
              )

              setShowFeeTable(false)
            }}
          />
        </Modal>
      )}

      {/* OPENING BALANCE MODAL */}
      {showOpening && (
        <Modal
          onClose={() =>
            setShowOpening(false)
          }
        >
          <OpeningBalanceForm
            fields={[
              {
                key: 'cash',
                label:
                  'Opening cash on hand (₱)',
                value: cash,
              },
              {
                key: 'gcash',
                label:
                  'Opening GCash wallet balance (₱)',
                value: gcashBalance,
              },
            ]}
            onSave={async (data) => {
              try {
                await setOpeningBalances(
                  data
                )

                setShowOpening(false)
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