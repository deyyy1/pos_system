import { useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

import SearchOutlined from '@mui/icons-material/SearchOutlined'
import PersonOutlined from '@mui/icons-material/PersonOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined'
import HistoryOutlined from '@mui/icons-material/HistoryOutlined'
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'

import { useStore } from '../store/useStore'
import { money } from '../utils/format'
import Modal from '../components/Modal'

const todayISO = () =>
  new Date().toISOString().slice(0, 10)

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
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
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
            bgcolor: 'primary.light',
            color: 'primary.dark',
            borderRadius: 2,
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

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  fullWidth = true,
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      size="small"
      label={label}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  )
}

function CustomerAvatar({ name }) {
  const initial =
    name?.trim()?.charAt(0)?.toUpperCase() || '?'

  return (
    <Avatar
      sx={{
        width: 38,
        height: 38,
        bgcolor: 'primary.light',
        color: 'primary.dark',
        fontWeight: 700,
      }}
    >
      {initial}
    </Avatar>
  )
}

export default function Utang() {
  const {
    customers,
    utangEntries,
    utangPayments,
    addUtang,
    logUtangPayment,
    deleteCustomer,
  } = useStore()

  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [preselect, setPreselect] = useState(null)
  const [payFor, setPayFor] = useState(null)
  const [ledgerFor, setLedgerFor] = useState(null)
  const [deleteFor, setDeleteFor] = useState(null)

  const balanceOf = (customerId) => {
    const owed = utangEntries
      .filter(
        (entry) =>
          entry.customerId === customerId
      )
      .reduce(
        (sum, entry) =>
          sum + Number(entry.amount || 0),
        0
      )

    const paid = utangPayments
      .filter(
        (payment) =>
          payment.customerId === customerId
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      )

    return owed - paid
  }

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return customers
      .map((customer) => ({
        ...customer,
        balance: balanceOf(customer.id),
      }))
      .filter((customer) =>
        customer.name
          .toLowerCase()
          .includes(query)
      )
  }, [
    customers,
    utangEntries,
    utangPayments,
    search,
  ])

  const totalOutstanding = rows.reduce(
    (sum, customer) =>
      sum + Math.max(0, customer.balance),
    0
  )

  const today = new Date()

  const overdueCount = customers.filter(
    (customer) => {
      if (balanceOf(customer.id) <= 0) {
        return false
      }

      return utangEntries.some(
        (entry) =>
          entry.customerId === customer.id &&
          entry.dueDate &&
          new Date(entry.dueDate) < today
      )
    }
  ).length

  const openAddFor = (customerId) => {
    setPreselect(customerId)
    setShowAdd(true)
  }

  const closeAdd = () => {
    setShowAdd(false)
    setPreselect(null)
  }

  const confirmDelete = async () => {
    if (!deleteFor) return

    try {
      await deleteCustomer(deleteFor.id)
      setDeleteFor(null)
    } catch (error) {
      console.error(
        'Failed to delete customer:',
        error
      )

      alert(
        error?.message ||
          'Failed to delete customer'
      )
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
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Utang
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 0.5 }}
      >
        Manage customer credit, balances, payments,
        and account history.
      </Typography>

      {/* Summary */}
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
          icon={
            <AccountBalanceWalletOutlined fontSize="small" />
          }
          label="Total Outstanding Utang"
          value={money(totalOutstanding)}
          color="warning.dark"
          subtitle={`${rows.filter((c) => c.balance > 0).length} customers with outstanding balance`}
        />

        <StatCard
          icon={
            <WarningAmberOutlined fontSize="small" />
          }
          label="Overdue Customers"
          value={overdueCount}
          color={
            overdueCount > 0
              ? 'error.main'
              : 'success.main'
          }
          subtitle={
            overdueCount > 0
              ? 'Accounts past their due date'
              : 'No overdue customers'
          }
        />
      </Box>

      {/* Search + Add */}
      <Box
        sx={{
          mt: 3,
          mb: 3,
          p: { xs: 1.5, sm: 2 },
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
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
            sm: 'center',
          }}
        >
          <TextField
            size="small"
            fullWidth
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search customers..."
            InputProps={{
              startAdornment: (
                <SearchOutlined
                  sx={{
                    mr: 1,
                    color: 'text.secondary',
                  }}
                />
              ),
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => openAddFor(null)}
            sx={{
              minWidth: {
                xs: '100%',
                sm: 150,
              },
              whiteSpace: 'nowrap',
            }}
          >
            Add utang
          </Button>
        </Stack>
      </Box>

      {/* Customer table */}
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
            Customer accounts
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            {rows.length}{' '}
            {rows.length === 1
              ? 'customer'
              : 'customers'}
          </Typography>
        </Box>

        {rows.length === 0 ? (
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              py: 7,
              px: 2,
              color: 'text.secondary',
            }}
          >
            <PersonOutlined
              sx={{
                fontSize: 38,
                opacity: 0.6,
              }}
            />

            <Typography variant="body2">
              {search
                ? 'No customers match your search.'
                : 'No customers yet.'}
            </Typography>

            {!search && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddOutlined />}
                onClick={() =>
                  openAddFor(null)
                }
              >
                Add first customer
              </Button>
            )}
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
                minWidth: 850,
                '& td, & th': {
                  px: {
                    xs: 1.5,
                    sm: 2.5,
                  },
                  py: 1.5,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={headCell}>
                    Customer
                  </TableCell>

                  <TableCell sx={headCell}>
                    Credit Limit
                  </TableCell>

                  <TableCell sx={headCell}>
                    Balance
                  </TableCell>

                  <TableCell sx={headCell}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((customer) => {
                  const hasBalance =
                    customer.balance > 0

                  return (
                    <TableRow
                      key={customer.id}
                      hover
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <CustomerAvatar
                            name={customer.name}
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
                              {customer.name}
                            </Typography>

                            {hasBalance && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Outstanding balance
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          color: 'text.secondary',
                        }}
                      >
                        {customer.creditLimit
                          ? money(
                              customer.creditLimit
                            )
                          : 'No limit'}
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Chip
                          size="small"
                          variant="outlined"
                          color={
                            hasBalance
                              ? 'error'
                              : 'success'
                          }
                          label={money(
                            customer.balance
                          )}
                        />
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                              <HistoryOutlined />
                            }
                            onClick={() =>
                              setLedgerFor(
                                customer
                              )
                            }
                          >
                            Ledger
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                              <ReceiptLongOutlined />
                            }
                            onClick={() =>
                              openAddFor(
                                customer.id
                              )
                            }
                          >
                            Add utang
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={
                              <PaymentsOutlined />
                            }
                            onClick={() =>
                              setPayFor(customer)
                            }
                          >
                            Payment
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={
                              <DeleteOutlineOutlined />
                            }
                            onClick={() =>
                              setDeleteFor(
                                customer
                              )
                            }
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Add Utang */}
      {showAdd && (
        <Modal onClose={closeAdd}>
          <AddUtangForm
            customers={customers}
            preselect={preselect}
            onSave={async (data) => {
              try {
                await addUtang(data)
                closeAdd()
              } catch (error) {
                console.error(
                  'Failed to add utang:',
                  error
                )

                alert(
                  error?.message ||
                    'Failed to add utang'
                )
              }
            }}
          />
        </Modal>
      )}

      {/* Payment */}
      {payFor && (
        <Modal
          onClose={() => setPayFor(null)}
        >
          <LogPaymentForm
            customer={payFor}
            onSave={async (data) => {
              try {
                await logUtangPayment({
                  customerId: payFor.id,
                  ...data,
                })

                setPayFor(null)
              } catch (error) {
                console.error(
                  'Failed to log payment:',
                  error
                )

                alert(
                  error?.message ||
                    'Failed to log payment'
                )
              }
            }}
          />
        </Modal>
      )}

      {/* Ledger */}
      {ledgerFor && (
        <Modal
          onClose={() => setLedgerFor(null)}
        >
          <Ledger
            customer={ledgerFor}
            utangEntries={utangEntries}
            utangPayments={utangPayments}
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(deleteFor)}
        onClose={() => setDeleteFor(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete customer?
        </DialogTitle>

        <DialogContent>
          <Alert
            severity="warning"
            sx={{ mt: 1 }}
          >
            This will delete{' '}
            <strong>
              {deleteFor?.name}
            </strong>{' '}
            and their utang records.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteFor(null)}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
          >
            Delete customer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function AddUtangForm({
  customers,
  preselect,
  onSave,
}) {
  const [customerId, setCustomerId] =
    useState(preselect || 'new')
  const [customerName, setCustomerName] =
    useState('')
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] =
    useState(todayISO())
  const [dueDate, setDueDate] = useState('')

  const isNew = customerId === 'new'

  const submit = () => {
    const amt = Number(amount)

    if (!amt || amt <= 0) {
      return alert('Enter a valid amount')
    }

    if (
      isNew &&
      !customerName.trim()
    ) {
      return alert(
        'Enter a customer name'
      )
    }

    onSave({
      customerId: isNew
        ? null
        : customerId,
      customerName: isNew
        ? customerName.trim()
        : undefined,
      item: item.trim(),
      amount: amt,
      date,
      dueDate: dueDate || null,
    })
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ pr: 4 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: 'primary.light',
            color: 'primary.dark',
          }}
        >
          <ReceiptLongOutlined />
        </Avatar>

        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Add utang
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Record a customer's credit
            transaction.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <Stack spacing={2}>
        <TextField
          select
          fullWidth
          size="small"
          label="Customer"
          value={customerId}
          onChange={(event) =>
            setCustomerId(
              event.target.value
            )
          }
        >
          <MenuItem value="new">
            + Add new customer
          </MenuItem>

          {customers.map((customer) => (
            <MenuItem
              key={customer.id}
              value={customer.id}
            >
              {customer.name}
            </MenuItem>
          ))}
        </TextField>

        {isNew && (
          <Field
            label="Customer name"
            value={customerName}
            onChange={(event) =>
              setCustomerName(
                event.target.value
              )
            }
            placeholder="Enter customer name"
          />
        )}

        <Field
          label="Item / description"
          value={item}
          onChange={(event) =>
            setItem(event.target.value)
          }
          placeholder="e.g. 1 Coke"
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
          <Field
            label="Amount"
            type="number"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />

          <Field
            label="Date added"
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <Field
          label=""
          type="date"
          value={dueDate}
          onChange={(event) =>
            setDueDate(event.target.value)
          }
          InputLabelProps={{
            shrink: true,
          }}
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={submit}
          startIcon={<AddOutlined />}
        >
          Add utang
        </Button>
      </Stack>
    </Box>
  )
}

function LogPaymentForm({
  customer,
  onSave,
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate] =
    useState(todayISO())
  const [paymentMethod, setPaymentMethod] =
    useState('Cash')
  const [note, setNote] = useState('')

  const submit = () => {
    const amt = Number(amount)

    if (!amt || amt <= 0) {
      return alert('Enter a valid amount')
    }

    onSave({
      amount: amt,
      date,
      paymentMethod,
      note: note.trim(),
    })
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ pr: 4 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: 'success.light',
            color: 'success.dark',
          }}
        >
          <PaymentsOutlined />
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            noWrap
          >
            Log payment
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {customer.name}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <Stack spacing={2}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'success.light',
          }}
        >
          <Typography
            variant="caption"
            color="success.dark"
          >
            Customer
          </Typography>

          <Typography
            variant="body1"
            fontWeight={700}
            color="success.dark"
          >
            {customer.name}
          </Typography>
        </Box>

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
          <Field
            label="Amount received"
            type="number"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />

          <Field
            label="Date"
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <TextField
          select
          fullWidth
          size="small"
          label="Payment method"
          value={paymentMethod}
          onChange={(event) =>
            setPaymentMethod(
              event.target.value
            )
          }
        >
          <MenuItem value="Cash">
            Cash
          </MenuItem>

          <MenuItem value="GCash">
            GCash
          </MenuItem>
        </TextField>

        <Field
          label="Note (optional)"
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="e.g. Paid in full"
        />

        <Button
          variant="contained"
          color="success"
          size="large"
          fullWidth
          onClick={submit}
          startIcon={
            <PaymentsOutlined />
          }
        >
          Log payment
        </Button>
      </Stack>
    </Box>
  )
}

function Ledger({
  customer,
  utangEntries,
  utangPayments,
}) {
  const entries = [
    ...utangEntries
      .filter(
        (entry) =>
          entry.customerId ===
          customer.id
      )
      .map((entry) => ({
        ...entry,
        kind: 'Utang',
        signed: Number(entry.amount) || 0,
      })),

    ...utangPayments
      .filter(
        (payment) =>
          payment.customerId ===
          customer.id
      )
      .map((payment) => ({
        ...payment,
        kind: 'Payment',
        signed:
          -(Number(payment.amount) || 0),
      })),
  ].sort(
    (a, b) =>
      new Date(a.ts).getTime() -
      new Date(b.ts).getTime()
  )

  let running = 0

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ pr: 4 }}
      >
        <CustomerAvatar
          name={customer.name}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            noWrap
          >
            Ledger
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {customer.name}
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
          Current balance
        </Typography>

        <Typography
          variant="h4"
          color="primary.dark"
          fontWeight={700}
        >
          {money(
            entries.reduce(
              (sum, entry) =>
                sum + entry.signed,
              0
            )
          )}
        </Typography>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        {entries.length === 0 ? (
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              py: 5,
              color: 'text.secondary',
            }}
          >
            <HistoryOutlined
              sx={{
                fontSize: 36,
                opacity: 0.6,
              }}
            />

            <Typography variant="body2">
              No ledger entries yet.
            </Typography>
          </Stack>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 420,
              overflowX: 'auto',
              overflowY: 'auto',
            }}
          >
            <Table
              stickyHeader
              size="small"
              sx={{
                minWidth: 650,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={headCell}>
                    Date
                  </TableCell>

                  <TableCell sx={headCell}>
                    Type
                  </TableCell>

                  <TableCell sx={headCell}>
                    Detail
                  </TableCell>

                  <TableCell sx={headCell}>
                    Amount
                  </TableCell>

                  <TableCell sx={headCell}>
                    Balance
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {entries.map((entry) => {
                  running += entry.signed

                  const isDebt =
                    entry.signed > 0

                  return (
                    <TableRow
                      key={
                        entry.kind +
                        entry.id
                      }
                      hover
                    >
                      <TableCell
                        sx={{
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {new Date(
                          entry.ts
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={
                            isDebt
                              ? 'error'
                              : 'success'
                          }
                          label={entry.kind}
                        />
                      </TableCell>

                      <TableCell>
                        {entry.kind ===
                        'Utang'
                          ? entry.item ||
                            '—'
                          : entry.note ||
                            'Payment'}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          whiteSpace:
                            'nowrap',
                          color: isDebt
                            ? 'error.main'
                            : 'success.main',
                        }}
                      >
                        {isDebt
                          ? '+'
                          : ''}
                        {money(
                          entry.signed
                        )}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 600,
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {money(running)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  )
}