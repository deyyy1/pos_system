import { useState, useMemo } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import PrintOutlined from '@mui/icons-material/PrintOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import PhoneAndroidOutlined from '@mui/icons-material/PhoneAndroidOutlined'
import SouthWestOutlined from '@mui/icons-material/SouthWestOutlined'
import NorthEastOutlined from '@mui/icons-material/NorthEastOutlined'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined'
import { useStore } from '../store/useStore'
import { money } from '../utils/format'
import Modal from '../components/Modal'

const DATE_OPTIONS = ['All', 'Today', 'Yesterday', 'This week', 'This month']
const TYPE_OPTIONS = ['All', 'Product Sale', 'Load', 'Cash-In', 'Cash-Out']
const METHOD_OPTIONS = ['All', 'Cash', 'GCash', 'Utang', 'Load']

const statusColor = (status) => {
  const st = status || 'Completed'

  if (st === 'Voided') return 'default'
  if (st === 'Failed') return 'error'

  return 'primary'
}

const methodColor = (method) => {
  if (method === 'GCash') return 'secondary'
  if (method === 'Utang') return 'warning'
  if (method === 'Cash') return 'primary'

  return 'default'
}

const kindIcon = (kind) => {
  if (kind === 'Product Sale') {
    return <ReceiptLongOutlined fontSize="small" />
  }

  if (kind === 'Load') {
    return <PhoneAndroidOutlined fontSize="small" />
  }

  if (kind === 'Cash-In') {
    return <SouthWestOutlined fontSize="small" />
  }

  if (kind === 'Cash-Out') {
    return <NorthEastOutlined fontSize="small" />
  }

  return <AccountBalanceWalletOutlined fontSize="small" />
}

const KindAvatar = ({ kind, size = 34 }) => (
  <Avatar
    variant="rounded"
    sx={{
      width: size,
      height: size,
      bgcolor: 'primary.light',
      color: 'primary.dark',
      borderRadius: 2,
      flexShrink: 0,
    }}
  >
    {kindIcon(kind)}
  </Avatar>
)

const Row = ({ label, children }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 2,
      py: 0.75,
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ flexShrink: 0 }}
    >
      {label}
    </Typography>

    <Box sx={{ minWidth: 0 }}>
      {children}
    </Box>
  </Box>
)

const headCell = {
  color: 'text.secondary',
  fontWeight: 600,
  bgcolor: 'background.paper',
  whiteSpace: 'nowrap',
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      sx={{
        minWidth: 0,
        flex: {
          xs: '1 1 100%',
          sm: '1 1 0',
        },
        '& .MuiInputBase-root': {
          width: '100%',
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  )
}

export default function Transactions() {
  const {
    sales,
    loadTxns,
    gcashTxns,
    voidSale,
  } = useStore()

  const [typeFilter, setTypeFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const all = useMemo(
    () =>
      [
        ...sales.map((sale) => ({
          ...sale,
          kind: 'Product Sale',
          total: Number(sale.total) || 0,
          method: sale.method,
        })),

        ...loadTxns.map((transaction) => ({
          ...transaction,
          kind: 'Load',
          total:
            transaction.price !== undefined &&
            transaction.price !== null
              ? Number(transaction.price) || 0
              : Number(transaction.amount) || 0,
          method: 'Load',
        })),

        ...gcashTxns.map((transaction) => ({
          ...transaction,
          kind: transaction.type,
          total: Number(transaction.amount) || 0,
          method: 'GCash',
        })),
      ].sort(
        (a, b) =>
          new Date(b.ts).getTime() -
          new Date(a.ts).getTime()
      ),
    [sales, loadTxns, gcashTxns]
  )

  const inRange = (ts) => {
    const date = new Date(ts)
    const now = new Date()

    if (dateFilter === 'Today') {
      return date.toDateString() === now.toDateString()
    }

    if (dateFilter === 'Yesterday') {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)

      return (
        date.toDateString() ===
        yesterday.toDateString()
      )
    }

    if (dateFilter === 'This week') {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - 7)

      return date >= weekStart
    }

    if (dateFilter === 'This month') {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      )
    }

    return true
  }

  const filtered = all.filter(
    (transaction) =>
      (typeFilter === 'All' ||
        transaction.kind === typeFilter) &&
      (methodFilter === 'All' ||
        transaction.method === methodFilter) &&
      inRange(transaction.ts)
  )

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Transactions
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 0.5 }}
      >
        {filtered.length}{' '}
        {filtered.length === 1 ? 'record' : 'records'}
      </Typography>

      {/* Filters */}
      <Box
        sx={{
          mt: 3,
          mb: 3,
          p: { xs: 1.5, sm: 2 },
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 1.5,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Filter transactions
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            width: '100%',
          }}
        >
          <FilterSelect
            label="Date"
            value={dateFilter}
            onChange={setDateFilter}
            options={DATE_OPTIONS}
          />

          <FilterSelect
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_OPTIONS}
          />

          <FilterSelect
            label="Method"
            value={methodFilter}
            onChange={setMethodFilter}
            options={METHOD_OPTIONS}
          />
        </Box>
      </Box>

      {/* Transaction table */}
      <Card
        sx={{
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Transaction history
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            {filtered.length}{' '}
            {filtered.length === 1
              ? 'transaction'
              : 'transactions'}
          </Typography>
        </Box>

        {filtered.length === 0 ? (
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              py: 7,
              px: 2,
              color: 'text.secondary',
            }}
          >
            <SearchOffOutlined
              sx={{
                fontSize: 36,
                opacity: 0.6,
              }}
            />

            <Typography variant="body2">
              No transactions match these filters.
            </Typography>
          </Stack>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 560,
              width: '100%',
              overflowX: 'auto',
              overflowY: 'auto',
            }}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 720,
                '& td, & th': {
                  px: { xs: 1.5, sm: 2.5 },
                  py: 1.5,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={headCell}>
                    Type
                  </TableCell>

                  <TableCell sx={headCell}>
                    Time
                  </TableCell>

                  <TableCell sx={headCell}>
                    Amount
                  </TableCell>

                  <TableCell
                    sx={{
                      ...headCell,
                      display: {
                        xs: 'none',
                        sm: 'table-cell',
                      },
                    }}
                  >
                    Method
                  </TableCell>

                  <TableCell sx={headCell}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((transaction) => (
                  <TableRow
                    key={
                      transaction.kind +
                      transaction.id
                    }
                    hover
                    onClick={() =>
                      setSelected(transaction)
                    }
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td': {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <KindAvatar
                          kind={transaction.kind}
                        />

                        <Box
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                          >
                            {transaction.kind}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: {
                                xs: 'block',
                                sm: 'none',
                              },
                            }}
                          >
                            {transaction.method}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        color: 'text.secondary',
                      }}
                    >
                      <Typography variant="body2">
                        {new Date(
                          transaction.ts
                        ).toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {money(transaction.total)}
                    </TableCell>

                    <TableCell
                      sx={{
                        display: {
                          xs: 'none',
                          sm: 'table-cell',
                        },
                      }}
                    >
                      <Chip
                        size="small"
                        variant="outlined"
                        color={methodColor(
                          transaction.method
                        )}
                        label={transaction.method}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={statusColor(
                          transaction.status
                        )}
                        label={
                          transaction.status ||
                          'Completed'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Transaction details */}
      {selected && (
        <Modal
          onClose={() => setSelected(null)}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ pr: 4 }}
          >
            <KindAvatar
              kind={selected.kind}
              size={42}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                lineHeight={1.25}
                noWrap
              >
                {selected.kind}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {new Date(
                  selected.ts
                ).toLocaleString()}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 3,
              bgcolor: 'primary.light',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="overline"
              color="primary.dark"
            >
              Amount
            </Typography>

            <Typography
              variant="h4"
              color="primary.dark"
            >
              {money(selected.total)}
            </Typography>
          </Box>

          <Box sx={{ my: 2 }}>
            <Row label="Method">
              <Chip
                size="small"
                variant="outlined"
                color={methodColor(
                  selected.method
                )}
                label={selected.method}
              />
            </Row>

            <Row label="Status">
              <Chip
                size="small"
                variant="outlined"
                color={statusColor(
                  selected.status
                )}
                label={
                  selected.status ||
                  'Completed'
                }
              />
            </Row>

            {selected.items &&
              selected.items.length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />

                  <Typography
                    variant="overline"
                    color="text.secondary"
                  >
                    Items
                  </Typography>

                  {selected.items.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        gap: 2,
                        py: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {item.name} x{item.qty}
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {money(
                          Number(item.price) *
                            Number(item.qty)
                        )}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}
          </Box>

          <Stack spacing={1}>
            {selected.kind ===
              'Product Sale' &&
              selected.status !== 'Voided' && (
                <Button
                  color="error"
                  variant="outlined"
                  onClick={async () => {
                    try {
                      await voidSale(
                        selected.id
                      )
                      setSelected(null)
                    } catch (error) {
                      alert(
                        error.message ||
                          'Failed to void transaction.'
                      )
                    }
                  }}
                >
                  Void transaction
                </Button>
              )}

            <Button
              variant="outlined"
              startIcon={
                <PrintOutlined />
              }
              onClick={() =>
                window.print()
              }
            >
              Reprint
            </Button>
          </Stack>
        </Modal>
      )}
    </Box>
  )
}