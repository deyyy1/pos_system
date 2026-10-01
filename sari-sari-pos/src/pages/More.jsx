import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material'

import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import SettingsOutlined from '@mui/icons-material/SettingsOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined'
import SaveOutlined from '@mui/icons-material/SaveOutlined'
import CloseOutlined from '@mui/icons-material/CloseOutlined'
import StoreOutlined from '@mui/icons-material/StoreOutlined'
import PaletteOutlined from '@mui/icons-material/PaletteOutlined'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import PhoneOutlined from '@mui/icons-material/PhoneOutlined'
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined'
import ComputerOutlined from '@mui/icons-material/ComputerOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined'

import { useThemeMode } from '../context/ThemeModeContext'

import { useStore } from '../store/useStore'
import { money } from '../utils/format'
import { EXPENSE_CATEGORIES } from '../constants'

export default function More() {
  const [tab, setTab] = useState('exp')

  const tabs = [
    {
      value: 'exp',
      label: 'Expenses',
      icon: <PaymentsOutlined />,
    },
    {
      value: 'sup',
      label: 'Suppliers',
      icon: <LocalShippingOutlined />,
    },
    {
      value: 'set',
      label: 'Settings',
      icon: <SettingsOutlined />,
    },
  ]

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        pb: 3,
      }}
    >
      {/* PAGE HEADER */}
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(25,118,210,0.10), rgba(25,118,210,0.03))',
        }}
      >
        <CardContent
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
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
              }}
            >
              {tab === 'exp' ? (
                <PaymentsOutlined />
              ) : tab === 'sup' ? (
                <LocalShippingOutlined />
              ) : (
                <SettingsOutlined />
              )}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                fontWeight={800}
              >
                More
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                Manage expenses, suppliers,
                and store settings.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* TABS */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="fullWidth"
          scrollButtons={false}
          sx={{
            minHeight: {
              xs: 56,
              sm: 64,
            },
            '& .MuiTab-root': {
              minHeight: {
                xs: 56,
                sm: 64,
              },
              textTransform: 'none',
              fontWeight: 700,
              fontSize: {
                xs: '0.78rem',
                sm: '0.9rem',
              },
              minWidth: 0,
            },
          }}
        >
          {tabs.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
            />
          ))}
        </Tabs>
      </Card>

      {tab === 'exp' && <Expenses />}
      {tab === 'sup' && <Suppliers />}
      {tab === 'set' && <Settings />}
    </Box>
  )
}

/* ================================================== */
/* EXPENSES */
/* ================================================== */

function Expenses() {
  const {
    expenses,
    addExpense,
    sales,
  } = useStore()

  const [cat, setCat] = useState(
    EXPENSE_CATEGORIES[0]
  )

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] =
    useState('Cash')

  const [saving, setSaving] =
    useState(false)

  const totalExp = expenses.reduce(
    (sum, expense) =>
      sum +
      (Number(expense.amount) || 0),
    0
  )

  const totalSales = sales
    .filter(
      (sale) => sale.status !== 'Voided'
    )
    .reduce(
      (sum, sale) =>
        sum + (Number(sale.total) || 0),
      0
    )

  const submit = async () => {
    const amt = Number(amount)

    if (!amt || amt <= 0) {
      return alert(
        'Enter a valid amount'
      )
    }

    try {
      setSaving(true)

      await addExpense({
        cat,
        amount: amt,
        note,
        paymentMethod,
      })

      setAmount('')
      setNote('')
      setPaymentMethod('Cash')
    } catch (error) {
      console.error(
        'Failed to add expense:',
        error
      )

      alert(
        error.message ||
          'Failed to add expense'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      {/* SECTION HEADER */}
      <SectionHeader
        icon={<PaymentsOutlined />}
        title="Expenses"
        subtitle="Record and monitor store expenses"
      />

      {/* EXPENSE FORM */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent
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
            sx={{ mb: 2 }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              <ReceiptLongOutlined />
            </Avatar>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Add Expense
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Record an expense against the
                store's finances.
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <TextField
              select
              fullWidth
              label="Category"
              value={cat}
              onChange={(e) =>
                setCat(e.target.value)
              }
            >
              {EXPENSE_CATEGORIES.map(
                (category) => (
                  <MenuItem
                    key={category}
                    value={category}
                  >
                    {category}
                  </MenuItem>
                )
              )}
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="0.00"
              inputProps={{
                min: 0,
                step: 0.01,
              }}
              InputProps={{
                startAdornment: (
                  <Box
                    component="span"
                    sx={{
                      mr: 1,
                      color: 'text.secondary',
                      fontWeight: 700,
                    }}
                  >
                    ₱
                  </Box>
                ),
              }}
            />

            <TextField
              select
              fullWidth
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
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

            <TextField
              fullWidth
              label="Note"
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              placeholder="Optional note"
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<AddOutlined />}
            onClick={submit}
            disabled={saving}
            sx={{
              mt: 2.5,
              minHeight: 48,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {saving
              ? 'Adding Expense...'
              : 'Add Expense'}
          </Button>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          icon={<PaymentsOutlined />}
          label="Total Expenses"
          value={money(totalExp)}
          tone="warning"
        />

        <StatCard
          icon={<AccountBalanceWalletOutlined />}
          label="Est. Net Profit"
          value={money(
            totalSales - totalExp
          )}
          tone="success"
        />
      </Box>

      {/* RECENT EXPENSES */}
      <ReportSectionHeader
        icon={<ReceiptLongOutlined />}
        title="Recent Expenses"
        count={expenses.length}
      />

      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: 500,
            overflowX: 'auto',
            overflowY: 'auto',
            border: 0,
            borderRadius: 0,
          }}
        >
          <Table
            stickyHeader
            size="medium"
            sx={{
              minWidth: 760,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Date
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Category
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Payment
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Amount
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Note
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {[...expenses]
                .reverse()
                .slice(0, 15)
                .map((expense) => (
                  <TableRow
                    key={expense.id}
                    hover
                  >
                    <TableCell
                      sx={{
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {new Date(
                        expense.ts
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={expense.cat}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          expense.paymentMethod ||
                          'Cash'
                        }
                        size="small"
                        color={
                          expense.paymentMethod ===
                          'GCash'
                            ? 'info'
                            : 'success'
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {money(
                        Number(
                          expense.amount
                        ) || 0
                      )}
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth: 180,
                        maxWidth: 320,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color={
                          expense.note
                            ? 'text.primary'
                            : 'text.secondary'
                        }
                        sx={{
                          overflow:
                            'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {expense.note ||
                          '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {expenses.length === 0 && (
          <EmptyState
            icon={<PaymentsOutlined />}
            text="No expenses yet."
          />
        )}
      </Card>
    </Box>
  )
}

/* ================================================== */
/* SUPPLIERS */
/* ================================================== */

function Suppliers() {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  } = useStore()

  const [name, setName] = useState('')
  const [contact, setContact] =
    useState('')
  const [address, setAddress] =
    useState('')

  const [
    editingSupplier,
    setEditingSupplier,
  ] = useState(null)

  const resetForm = () => {
    setName('')
    setContact('')
    setAddress('')
    setEditingSupplier(null)
  }

  const submit = async () => {
    if (!name.trim()) {
      return alert(
        'Enter supplier name'
      )
    }

    try {
      if (editingSupplier) {
        await updateSupplier(
          editingSupplier.id,
          {
            name: name.trim(),
            contact: contact.trim(),
            address: address.trim(),
          }
        )
      } else {
        await addSupplier({
          name: name.trim(),
          contact: contact.trim(),
          address: address.trim(),
        })
      }

      resetForm()
    } catch (error) {
      console.error(
        'Failed to save supplier:',
        error
      )

      alert(
        error.message ||
          'Failed to save supplier'
      )
    }
  }

  const startEdit = (supplier) => {
    setEditingSupplier(supplier)

    setName(
      supplier.name || ''
    )

    setContact(
      supplier.contactNumber || ''
    )

    setAddress(
      supplier.address || ''
    )
  }

  const handleDelete = async (
    supplier
  ) => {
    const confirmed =
      window.confirm(
        `Delete supplier "${supplier.name}"?`
      )

    if (!confirmed) return

    try {
      await deleteSupplier(
        supplier.id
      )

      if (
        editingSupplier?.id ===
        supplier.id
      ) {
        resetForm()
      }
    } catch (error) {
      console.error(
        'Failed to delete supplier:',
        error
      )

      alert(
        error.message ||
          'Failed to delete supplier'
      )
    }
  }

  return (
    <Box>
      {/* SECTION HEADER */}
      <SectionHeader
        icon={<LocalShippingOutlined />}
        title="Suppliers"
        subtitle="Manage your product suppliers"
      />

      {/* SUPPLIER FORM */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent
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
            sx={{ mb: 2 }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: editingSupplier
                  ? 'warning.main'
                  : 'primary.main',
              }}
            >
              {editingSupplier ? (
                <EditOutlined />
              ) : (
                <AddOutlined />
              )}
            </Avatar>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                {editingSupplier
                  ? 'Edit Supplier'
                  : 'Add Supplier'}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {editingSupplier
                  ? 'Update supplier information.'
                  : 'Add a new supplier to your store.'}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Supplier Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter supplier name"
            />

            <TextField
              fullWidth
              label="Contact Number"
              value={contact}
              onChange={(e) =>
                setContact(e.target.value)
              }
              placeholder="Enter contact number"
              InputProps={{
                startAdornment: (
                  <PhoneOutlined
                    fontSize="small"
                    sx={{
                      mr: 1,
                      color:
                        'text.secondary',
                    }}
                  />
                ),
              }}
            />

            <Box
              sx={{
                gridColumn: {
                  xs: 'auto',
                  md: '1 / -1',
                },
              }}
            >
              <TextField
                fullWidth
                label="Address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                placeholder="Enter supplier address"
                InputProps={{
                  startAdornment: (
                    <LocationOnOutlined
                      fontSize="small"
                      sx={{
                        mr: 1,
                        color:
                          'text.secondary',
                      }}
                    />
                  ),
                }}
              />
            </Box>
          </Box>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.5}
            sx={{ mt: 2.5 }}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={
                editingSupplier ? (
                  <SaveOutlined />
                ) : (
                  <AddOutlined />
                )
              }
              onClick={submit}
              sx={{
                minHeight: 48,
                borderRadius: 2,
                fontWeight: 700,
                textTransform:
                  'none',
              }}
            >
              {editingSupplier
                ? 'Update Supplier'
                : 'Add Supplier'}
            </Button>

            {editingSupplier && (
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={
                  <CloseOutlined />
                }
                onClick={resetForm}
                sx={{
                  minHeight: 48,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform:
                    'none',
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* SUPPLIER LIST */}
      <ReportSectionHeader
        icon={<LocalShippingOutlined />}
        title="Supplier List"
        count={suppliers.length}
      />

      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: 500,
            overflowX: 'auto',
            overflowY: 'auto',
            border: 0,
            borderRadius: 0,
          }}
        >
          <Table
            stickyHeader
            size="medium"
            sx={{
              minWidth: 850,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  Supplier
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  Contact
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  Address
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {suppliers.map(
                (supplier) => (
                  <TableRow
                    key={supplier.id}
                    hover
                  >
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor:
                              'primary.main',
                            fontSize:
                              '0.9rem',
                          }}
                        >
                          {(
                            supplier.name ||
                            'S'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>

                        <Typography
                          fontWeight={600}
                        >
                          {
                            supplier.name
                          }
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <PhoneOutlined
                          fontSize="small"
                          color="action"
                        />

                        <Typography
                          variant="body2"
                        >
                          {supplier.contactNumber ||
                            '—'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth: 240,
                        maxWidth: 400,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                      >
                        <LocationOnOutlined
                          fontSize="small"
                          color="action"
                          sx={{
                            mt: 0.2,
                          }}
                        />

                        <Typography
                          variant="body2"
                          color={
                            supplier.address
                              ? 'text.primary'
                              : 'text.secondary'
                          }
                          sx={{
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {supplier.address ||
                            '—'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell
                      align="right"
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Edit supplier">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              startEdit(
                                supplier
                              )
                            }
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete supplier">
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleDelete(
                                supplier
                              )
                            }
                          >
                            <DeleteOutlineOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {suppliers.length === 0 && (
          <EmptyState
            icon={
              <LocalShippingOutlined />
            }
            text="No suppliers yet."
          />
        )}
      </Card>
    </Box>
  )
}

/* ================================================== */
/* SETTINGS */
/* ================================================== */

function Settings() {
  const {
    storeName,
    ownerName,
    setStoreSettings,
  } = useStore()

  const [name, setName] =
    useState(storeName)

  const [owner, setOwner] =
    useState(ownerName)

  const { mode: theme, setMode: applyTheme } = useThemeMode()

    useEffect(() => {
      setName(storeName || 'Tindahan')
      setOwner(ownerName || 'Boss')
    }, [storeName, ownerName])

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    try {
      setSaving(true)
      setSaved(false)

      await setStoreSettings({
        storeName:
          name.trim() || 'Tindahan',

        ownerName:
          owner.trim() || 'Boss',
      })

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (error) {
      console.error(
        'Failed to save store profile:',
        error
      )

      alert(
        error.message ||
          'Failed to save store profile'
      )
    } finally {
      setSaving(false)
    }
  }

  

  return (
    <Box>
      {/* STORE PROFILE */}
      <SectionHeader
        icon={<StoreOutlined />}
        title="Store Profile"
        subtitle="Manage the basic information displayed for your store"
      />

      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent
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
            sx={{ mb: 2 }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              <StoreOutlined />
            </Avatar>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Store Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Update your store and
                owner details.
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Store Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <TextField
              fullWidth
              label="Owner / Cashier Name"
              value={owner}
              onChange={(e) =>
                setOwner(e.target.value)
              }
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SaveOutlined />}
            onClick={save}
            disabled={saving}
            sx={{
              mt: 2.5,
              minHeight: 48,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {saving
              ? 'Saving...'
              : 'Save Store Profile'}
          </Button>

          {saved && (
            <Alert
              severity="success"
              sx={{
                mt: 2,
                borderRadius: 2,
              }}
            >
              Store profile saved successfully.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* APPEARANCE */}
      <SectionHeader
        icon={<PaletteOutlined />}
        title="Appearance"
        subtitle="Choose how the application should look"
      />

      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent
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
            sx={{ mb: 2 }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              <PaletteOutlined />
            </Avatar>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Theme
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Select system, light, or
                dark appearance.
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 1.5,
            }}
          >
            <ThemeButton
              active={theme === 'system'}
              icon={
                <ComputerOutlined />
              }
              label="System"
              onClick={() =>
                applyTheme('system')
              }
            />

            <ThemeButton
              active={theme === 'light'}
              icon={
                <LightModeOutlined />
              }
              label="Light"
              onClick={() =>
                applyTheme('light')
              }
            />

            <ThemeButton
              active={theme === 'dark'}
              icon={
                <DarkModeOutlined />
              }
              label="Dark"
              onClick={() =>
                applyTheme('dark')
              }
            />
          </Box>
        </CardContent>
      </Card>

      {/* ABOUT */}
      <SectionHeader
        icon={<InfoOutlined />}
        title="About"
        subtitle="Current application scope"
      />

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
        }}
      >
        <CardContent
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
            alignItems="flex-start"
          >
            <InfoOutlined
              color="primary"
              sx={{
                mt: 0.25,
                flexShrink: 0,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
              }}
            >
              PIN login, Owner/Cashier
              roles, offline sync, camera
              barcode scanning, and thermal
              printer integration are planned
              for a later pass (Priority 5 in
              the brief). This build focuses
              on Priority 1–4: core POS,
              inventory, load, GCash,
              transactions, reports,
              expenses, and suppliers.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

/* ================================================== */
/* SHARED UI COMPONENTS */
/* ================================================== */

function SectionHeader({
  icon,
  title,
  subtitle,
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Avatar
        sx={{
          width: 42,
          height: 42,
          bgcolor: 'primary.main',
        }}
      >
        {icon}
      </Avatar>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

function ReportSectionHeader({
  icon,
  title,
  count,
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Avatar
        sx={{
          width: 42,
          height: 42,
          bgcolor: 'primary.main',
        }}
      >
        {icon}
      </Avatar>

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          flex: 1,
        }}
      >
        {title}
      </Typography>

      <Chip
        label={`${count}`}
        size="small"
        variant="outlined"
      />
    </Stack>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone = 'primary',
}) {
  const color =
    tone === 'success'
      ? 'success.main'
      : tone === 'warning'
        ? 'warning.main'
        : tone === 'info'
          ? 'info.main'
          : 'primary.main'

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        transition:
          'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.25,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: color,
              color: 'white',
            }}
          >
            {icon}
          </Avatar>

          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{
                mb: 0.5,
              }}
            >
              {label}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                lineHeight: 1.2,
                wordBreak:
                  'break-word',
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  icon,
  text,
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{
        py: 6,
        px: 2,
        color: 'text.secondary',
        textAlign: 'center',
      }}
    >
      <Avatar
        sx={{
          width: 52,
          height: 52,
          bgcolor: 'action.hover',
          color: 'text.secondary',
        }}
      >
        {icon}
      </Avatar>

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {text}
      </Typography>
    </Stack>
  )
}

function ThemeButton({
  active,
  icon,
  label,
  onClick,
}) {
  return (
    <Button
      fullWidth
      variant={
        active
          ? 'contained'
          : 'outlined'
      }
      startIcon={icon}
      onClick={onClick}
      sx={{
        minHeight: 52,
        borderRadius: 2,
        fontWeight: 700,
        textTransform: 'none',
      }}
    >
      {label}
    </Button>
  )
}