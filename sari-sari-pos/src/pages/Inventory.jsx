import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import AddBoxOutlined from '@mui/icons-material/AddBoxOutlined'
import SearchOutlined from '@mui/icons-material/SearchOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined'
import EventOutlined from '@mui/icons-material/EventOutlined'
import HistoryOutlined from '@mui/icons-material/HistoryOutlined'
import InventoryOutlined from '@mui/icons-material/InventoryOutlined'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined'
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined'
import SaveOutlined from '@mui/icons-material/SaveOutlined'
import AddShoppingCartOutlined from '@mui/icons-material/AddShoppingCartOutlined'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined'

import { useStore } from '../store/useStore'
import { money, todayStr } from '../utils/format'
import { CATEGORIES, UNITS } from '../constants'
import Modal from '../components/Modal'

const EXPIRY_WARN_DAYS = 30

const daysUntil = (dateStr) =>
  Math.ceil(
    (new Date(dateStr) - new Date(todayStr())) /
      86400000
  )

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
  color = 'text.primary',
  subtitle,
}) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ p: 2.5 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 44,
            height: 44,
            bgcolor: 'primary.light',
            color: 'primary.dark',
            borderRadius: 2,
            flexShrink: 0,
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
              sx={{ display: 'block', mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  )
}

function ProductAvatar({ product }) {
  const initial =
    product?.name?.trim()?.charAt(0)?.toUpperCase() ||
    '?'

  return (
    <Avatar
      variant="rounded"
      sx={{
        width: 40,
        height: 40,
        bgcolor: 'primary.light',
        color: 'primary.dark',
        fontWeight: 700,
        borderRadius: 2,
      }}
    >
      {initial}
    </Avatar>
  )
}

function getStockStatus(product) {
  const stock = Number(product.stock || 0)

  const minimumStock = Number(
    product.minimumStock ??
      product.minStock ??
      0
  )

  if (stock <= 0) {
    return {
      label: 'Out',
      color: 'error',
    }
  }

  if (stock <= minimumStock) {
    return {
      label: 'Low',
      color: 'warning',
    }
  }

  return {
    label: 'In Stock',
    color: 'success',
  }
}

function getExpiryStatus(expirationDate) {
  if (!expirationDate) {
    return null
  }

  const days = daysUntil(expirationDate)

  if (days <= 0) {
    return {
      label: 'Expired',
      color: 'error',
      days,
    }
  }

  if (days <= EXPIRY_WARN_DAYS) {
    return {
      label: `${days}d left`,
      color: 'warning',
      days,
    }
  }

  return null
}

export default function Inventory() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    stockIn,
    stockHistory,
    suppliers,
  } = useStore()

  const [tab, setTab] = useState('products')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [stockInFor, setStockInFor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [params] = useSearchParams()

  useEffect(() => {
    if (params.get('add')) {
      setEditing(null)
      setShowForm(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return products
    }

    return products.filter(
      (product) =>
        product.name
          ?.toLowerCase()
          .includes(query) ||
        (product.barcode || '')
          .toLowerCase()
          .includes(query) ||
        (product.sku || '')
          .toLowerCase()
          .includes(query)
    )
  }, [products, search])

  const costValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.cost || 0) *
        Number(product.stock || 0),
    0
  )

  const retailValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.price || 0) *
        Number(product.stock || 0),
    0
  )

  const potentialProfit = retailValue - costValue

  const outOfStock = products.filter(
    (product) =>
      Number(product.stock || 0) <= 0
  )

  const lowStock = products.filter(
    (product) => {
      const stock = Number(
        product.stock || 0
      )

      const minimumStock = Number(
        product.minimumStock ??
          product.minStock ??
          0
      )

      return (
        stock > 0 &&
        stock <= minimumStock
      )
    }
  )

  const expiringSoon = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.expirationDate &&
            daysUntil(
              product.expirationDate
            ) <= EXPIRY_WARN_DAYS
        )
        .sort(
          (a, b) =>
            new Date(a.expirationDate) -
            new Date(b.expirationDate)
        ),
    [products]
  )

  const openAdd = () => {
    setError('')
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (product) => {
    setError('')
    setEditing(product)
    setShowForm(true)
  }

  const closeProductForm = () => {
    if (saving) return

    setShowForm(false)
    setEditing(null)
    setError('')
  }

  const closeStockIn = () => {
    if (saving) return

    setStockInFor(null)
    setError('')
  }

  const save = async (data) => {
    setSaving(true)
    setError('')

    try {
      if (editing) {
        await updateProduct(
          editing.id,
          data
        )
      } else {
        await addProduct(data)
      }

      setShowForm(false)
      setEditing(null)
    } catch (err) {
      console.error(
        'Failed to save product:',
        err
      )

      setError(
        err.message ||
          'Failed to save product.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editing) return

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${editing.name}"?`
      )

    if (!confirmed) return

    setSaving(true)
    setError('')

    try {
      await deleteProduct(
        editing.id
      )

      setShowForm(false)
      setEditing(null)
    } catch (err) {
      console.error(
        'Failed to delete product:',
        err
      )

      setError(
        err.message ||
          'Failed to delete product.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleStockIn = async (data) => {
    setSaving(true)
    setError('')

    try {
      await stockIn({
        productId: stockInFor.id,
        ...data,
      })

      setStockInFor(null)
    } catch (err) {
      console.error(
        'Failed to add stock:',
        err
      )

      setError(
        err.message ||
          'Failed to add stock.'
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
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Inventory
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 0.5 }}
      >
        Manage products, stock levels,
        batches, and expiration dates.
      </Typography>

      {/* Summary */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
          mt: 3,
        }}
      >
        <StatCard
          icon={
            <AccountBalanceWalletOutlined
              fontSize="small"
            />
          }
          label="Total Cost Value"
          value={money(costValue)}
          subtitle="Current inventory at cost"
        />

        <StatCard
          icon={
            <Inventory2Outlined
              fontSize="small"
            />
          }
          label="Retail Value"
          value={money(retailValue)}
          subtitle="Potential sales value"
        />

        <StatCard
          icon={
            <TrendingUpOutlined
              fontSize="small"
            />
          }
          label="Potential Profit"
          value={money(
            potentialProfit
          )}
          color="success.main"
          subtitle="Retail value less cost"
        />

        <StatCard
          icon={
            <InventoryOutlined
              fontSize="small"
            />
          }
          label="Products"
          value={products.length}
          subtitle="Active inventory items"
        />
      </Box>

      {/* Inventory alerts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
          gap: 2,
          mt: 2,
        }}
      >
        <StatCard
          icon={
            <ErrorOutlineOutlined
              fontSize="small"
            />
          }
          label="Out of Stock"
          value={outOfStock.length}
          color={
            outOfStock.length > 0
              ? 'error.main'
              : 'success.main'
          }
          subtitle={
            outOfStock.length > 0
              ? 'Products need restocking'
              : 'No products are out'
          }
        />

        <StatCard
          icon={
            <WarningAmberOutlined
              fontSize="small"
            />
          }
          label="Low Stock"
          value={lowStock.length}
          color={
            lowStock.length > 0
              ? 'warning.dark'
              : 'success.main'
          }
          subtitle={
            lowStock.length > 0
              ? 'Below minimum level'
              : 'Stock levels are healthy'
          }
        />

        <StatCard
          icon={
            <EventOutlined
              fontSize="small"
            />
          }
          label="Expiring Soon"
          value={expiringSoon.length}
          color={
            expiringSoon.length > 0
              ? 'warning.dark'
              : 'success.main'
          }
          subtitle="Within the next 30 days"
        />
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          mt: 3,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) =>
            setTab(value)
          }
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="products"
            label="Products"
            icon={
              <InventoryOutlined />
            }
            iconPosition="start"
          />

          <Tab
            value="batches"
            label="Stock Batches"
            icon={
              <LocalShippingOutlined />
            }
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {tab === 'products' ? (
        <>
          {/* Search / Add */}
          <Box
            sx={{
              mt: 3,
              mb: 3,
              p: {
                xs: 1.5,
                sm: 2,
              },
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor:
                'background.paper',
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.5}
            >
              <TextField
                size="small"
                fullWidth
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search products, SKU, or barcode..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined
                        sx={{
                          color:
                            'text.secondary',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                startIcon={
                  <AddBoxOutlined />
                }
                onClick={openAdd}
                sx={{
                  width: {
                    xs: '100%',
                    sm: 'auto',
                  },
                  minWidth: {
                    sm: 150,
                  },
                  whiteSpace:
                    'nowrap',
                }}
              >
                Add product
              </Button>
            </Stack>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
              onClose={() =>
                setError('')
              }
            >
              {error}
            </Alert>
          )}

          {/* Products */}
          <Card
            sx={{
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: {
                  xs: 1.5,
                  sm: 2.5,
                },
                py: 1.5,
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 2,
                borderBottom: 1,
                borderColor:
                  'divider',
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                }}
              >
                Product inventory
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  whiteSpace:
                    'nowrap',
                }}
              >
                {filtered.length}{' '}
                {filtered.length === 1
                  ? 'product'
                  : 'products'}
              </Typography>
            </Box>

            {filtered.length === 0 ? (
              <Stack
                alignItems="center"
                spacing={1}
                sx={{
                  py: 7,
                  px: 2,
                  color:
                    'text.secondary',
                }}
              >
                <Inventory2Outlined
                  sx={{
                    fontSize: 40,
                    opacity: 0.6,
                  }}
                />

                <Typography
                  variant="body2"
                >
                  {search
                    ? 'No products match your search.'
                    : 'No products yet.'}
                </Typography>

                {!search && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      <AddOutlined />
                    }
                    onClick={openAdd}
                  >
                    Add first product
                  </Button>
                )}
              </Stack>
            ) : (
              <TableContainer
                sx={{
                  maxHeight: 600,
                  width: '100%',
                  overflowX:
                    'auto',
                  overflowY:
                    'auto',
                }}
              >
                <Table
                  stickyHeader
                  sx={{
                    minWidth: 980,
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
                      <TableCell
                        sx={headCell}
                      >
                        Product
                      </TableCell>

                      <TableCell
                        sx={headCell}
                      >
                        Category
                      </TableCell>

                      <TableCell
                        sx={headCell}
                      >
                        Unit
                      </TableCell>

                      <TableCell
                        sx={headCell}
                      >
                        Price
                      </TableCell>

                      <TableCell
                        sx={headCell}
                      >
                        Stock
                      </TableCell>

                      <TableCell
                        sx={headCell}
                      >
                        Status
                      </TableCell>

                      <TableCell
                        sx={{
                          ...headCell,
                          textAlign:
                            'right',
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filtered.map(
                      (product) => {
                        const status =
                          getStockStatus(
                            product
                          )

                        const expiry =
                          getExpiryStatus(
                            product.expirationDate
                          )

                        return (
                          <TableRow
                            key={
                              product.id
                            }
                            hover
                          >
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={
                                  1.5
                                }
                                alignItems="center"
                              >
                                <ProductAvatar
                                  product={
                                    product
                                  }
                                />

                                <Box
                                  sx={{
                                    minWidth: 0,
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={
                                      0.75
                                    }
                                    alignItems="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={
                                        600
                                      }
                                      sx={{
                                        maxWidth: 240,
                                      }}
                                    >
                                      {
                                        product.name
                                      }
                                    </Typography>

                                    {product.isBulk && (
                                      <Chip
                                        size="small"
                                        label="Bulk"
                                        variant="outlined"
                                      />
                                    )}

                                    {expiry && (
                                      <Chip
                                        size="small"
                                        label={
                                          expiry.label
                                        }
                                        color={
                                          expiry.color
                                        }
                                        variant="outlined"
                                      />
                                    )}
                                  </Stack>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    {product.sku ||
                                      product.barcode ||
                                      'No SKU or barcode'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {product.cat ||
                                product.category ||
                                '—'}
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {product.unit ||
                                'pc'}
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={
                                  600
                                }
                              >
                                {money(
                                  product.price
                                )}
                              </Typography>

                              {product.wholesalePrice && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Wholesale{' '}
                                  {money(
                                    product.wholesalePrice
                                  )}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={
                                  700
                                }
                              >
                                {
                                  product.stock
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                min{' '}
                                {Number(
                                  product.minimumStock ??
                                    product.minStock ??
                                    0
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                variant="outlined"
                                color={
                                  status.color
                                }
                                label={
                                  status.label
                                }
                              />
                            </TableCell>

                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={
                                  0.5
                                }
                                justifyContent="flex-end"
                              >
                                <Tooltip title="Edit product">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={
                                      <EditOutlined />
                                    }
                                    onClick={() =>
                                      openEdit(
                                        product
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>
                                </Tooltip>

                                <Tooltip title="Add stock">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={
                                      <AddShoppingCartOutlined />
                                    }
                                    onClick={() =>
                                      setStockInFor(
                                        product
                                      )
                                    }
                                  >
                                    Stock
                                  </Button>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        )
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {/* Expiring Soon */}
          {expiringSoon.length >
            0 && (
            <Box sx={{ mt: 3 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <EventOutlined
                  fontSize="small"
                />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Expiring Soon
                </Typography>

                <Chip
                  size="small"
                  color="warning"
                  label={
                    expiringSoon.length
                  }
                />
              </Stack>

              <Card
                sx={{
                  overflow: 'hidden',
                }}
              >
                <Stack divider={<Divider />}>
                  {expiringSoon.map(
                    (product) => {
                      const days =
                        daysUntil(
                          product.expirationDate
                        )

                      return (
                        <Box
                          key={
                            product.id
                          }
                          sx={{
                            px: {
                              xs: 2,
                              sm: 2.5,
                            },
                            py: 1.5,
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'space-between',
                            gap: 2,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={
                              1.5
                            }
                            alignItems="center"
                            minWidth={0}
                          >
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor:
                                  'warning.light',
                                color:
                                  'warning.dark',
                              }}
                            >
                              <EventOutlined fontSize="small" />
                            </Avatar>

                            <Box
                              sx={{
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={
                                  600
                                }
                                noWrap
                              >
                                {
                                  product.name
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  product.stock
                                }{' '}
                                {
                                  product.unit ||
                                  'pc'
                                }{' '}
                                in stock
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip
                            size="small"
                            color={
                              days <= 0
                                ? 'error'
                                : 'warning'
                            }
                            label={
                              days <= 0
                                ? 'Expired'
                                : `${days}d left`
                            }
                          />
                        </Box>
                      )
                    }
                  )}
                </Stack>
              </Card>
            </Box>
          )}

          {/* Stock History */}
          <Box sx={{ mt: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <HistoryOutlined
                fontSize="small"
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Stock History
              </Typography>
            </Stack>

            <Card
              sx={{
                width: '100%',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              {stockHistory.length ===
              0 ? (
                <Stack
                  alignItems="center"
                  spacing={1}
                  sx={{
                    py: 7,
                    px: 2,
                    color:
                      'text.secondary',
                  }}
                >
                  <HistoryOutlined
                    sx={{
                      fontSize: 40,
                      opacity: 0.6,
                    }}
                  />

                  <Typography
                    variant="body2"
                  >
                    No stock history yet.
                  </Typography>
                </Stack>
              ) : (
                <TableContainer
                  sx={{
                    maxHeight: 500,
                    overflowX:
                      'auto',
                    overflowY:
                      'auto',
                  }}
                >
                  <Table
                    stickyHeader
                    sx={{
                      minWidth: 720,
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
                        <TableCell
                          sx={headCell}
                        >
                          Product
                        </TableCell>

                        <TableCell
                          sx={headCell}
                        >
                          Date
                        </TableCell>

                        <TableCell
                          sx={headCell}
                        >
                          Change
                        </TableCell>

                        <TableCell
                          sx={headCell}
                        >
                          Reason
                        </TableCell>

                        <TableCell
                          sx={headCell}
                        >
                          Remaining
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {[...stockHistory]
                        .reverse()
                        .map((history) => {
                          const added =
                            Number(
                              history.added ||
                                0
                            )

                          const removed =
                            Number(
                              history.removed ||
                                0
                            )

                          const isAdded =
                            added > 0

                          return (
                            <TableRow
                              key={
                                history.id
                              }
                              hover
                            >
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  fontWeight={
                                    600
                                  }
                                >
                                  {
                                    history.product
                                  }
                                </Typography>
                              </TableCell>

                              <TableCell
                                sx={{
                                  whiteSpace:
                                    'nowrap',
                                  color:
                                    'text.secondary',
                                }}
                              >
                                {new Date(
                                  history.ts
                                ).toLocaleDateString(
                                  'en-PH'
                                )}
                              </TableCell>

                              <TableCell
                                sx={{
                                  whiteSpace:
                                    'nowrap',
                                }}
                              >
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  color={
                                    isAdded
                                      ? 'success'
                                      : 'error'
                                  }
                                  label={
                                    isAdded
                                      ? `+${added}`
                                      : `-${removed}`
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                {
                                  history.reason
                                }
                              </TableCell>

                              <TableCell
                                sx={{
                                  fontWeight: 600,
                                }}
                              >
                                {
                                  history.remaining
                                }
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Box>
        </>
      ) : (
        <StockBatches
          stockHistory={
            stockHistory
          }
          products={products}
        />
      )}

      {/* Add / Edit Product */}
      {showForm && (
        <Modal
          onClose={
            closeProductForm
          }
        >
          <ProductForm
            product={editing}
            onSave={save}
            onDelete={
              editing
                ? handleDelete
                : null
            }
            saving={saving}
          />
        </Modal>
      )}

      {/* Stock In */}
      {stockInFor && (
        <Modal
          onClose={closeStockIn}
        >
          <StockInForm
            product={stockInFor}
            suppliers={suppliers}
            onSave={handleStockIn}
            saving={saving}
          />
        </Modal>
      )}
    </Box>
  )
}

function StockBatches({
  stockHistory,
  products,
}) {
  const batches = useMemo(
    () =>
      [...stockHistory]
        .filter(
          (history) =>
            Number(history.added || 0) >
            0
        )
        .reverse(),
    [stockHistory]
  )

  return (
    <Box sx={{ mt: 3 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <LocalShippingOutlined
          fontSize="small"
        />

        <Typography
          variant="h6"
          fontWeight={700}
        >
          Stock Batches
        </Typography>

        <Chip
          size="small"
          variant="outlined"
          label={`${batches.length} batches`}
        />
      </Stack>

      <Card
        sx={{
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {batches.length === 0 ? (
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              py: 7,
              px: 2,
              color:
                'text.secondary',
            }}
          >
            <LocalShippingOutlined
              sx={{
                fontSize: 40,
                opacity: 0.6,
              }}
            />

            <Typography
              variant="body2"
            >
              No stock-in batches yet.
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Restock a product to
              see stock batches here.
            </Typography>
          </Stack>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 600,
              overflowX: 'auto',
              overflowY: 'auto',
            }}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 800,
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
                  <TableCell
                    sx={headCell}
                  >
                    Date
                  </TableCell>

                  <TableCell
                    sx={headCell}
                  >
                    Product
                  </TableCell>

                  <TableCell
                    sx={headCell}
                  >
                    Quantity Added
                  </TableCell>

                  <TableCell
                    sx={headCell}
                  >
                    Supplier
                  </TableCell>

                  <TableCell
                    sx={headCell}
                  >
                    Reference
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {batches.map(
                  (history) => (
                    <TableRow
                      key={
                        history.id
                      }
                      hover
                    >
                      <TableCell
                        sx={{
                          whiteSpace:
                            'nowrap',
                          color:
                            'text.secondary',
                        }}
                      >
                        {new Date(
                          history.ts
                        ).toLocaleDateString(
                          'en-PH'
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {
                            history.product
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          color="success"
                          variant="outlined"
                          label={`+${history.added}`}
                        />
                      </TableCell>

                      <TableCell>
                        {history.supplier ||
                          '—'}
                      </TableCell>

                      <TableCell>
                        {history.ref ||
                          '—'}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  )
}

function ProductForm({
  product,
  onSave,
  onDelete,
  saving,
}) {
  const [f, setF] = useState(
    product || {
      name: '',
      sku: '',
      barcode: '',
      cat: CATEGORIES[1],
      unit: 'pc',
      price: '',
      cost: '',
      wholesalePrice: '',
      isBulk: false,
      stock: '',
      minStock: 5,
      expirationDate: '',
      dateAdded: todayStr(),
      status: 'active',
    }
  )

  const set = (
    key,
    value
  ) =>
    setF((state) => ({
      ...state,
      [key]: value,
    }))

  const submit = () => {
    if (!f.name.trim()) {
      alert('Name is required')
      return
    }

    onSave({
      ...f,
      price:
        Number(f.price) || 0,
      cost:
        Number(f.cost) || 0,
      wholesalePrice:
        f.wholesalePrice === ''
          ? null
          : Number(
              f.wholesalePrice
            ),
      stock:
        Number(f.stock) || 0,
      minStock:
        Number(f.minStock) || 0,
      expirationDate:
        f.expirationDate ||
        null,
    })
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 720,
      }}
    >
      {/* Form header */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ pr: 4 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor:
              'primary.light',
            color:
              'primary.dark',
            width: 44,
            height: 44,
          }}
        >
          <Inventory2Outlined />
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            {product
              ? 'Edit Product'
              : 'Add Product'}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {product
              ? 'Update product information and inventory settings.'
              : 'Add a new product to your inventory.'}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <Stack spacing={2}>
        {/* Basic information */}
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight={600}
        >
          Basic information
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="Product name"
          placeholder="e.g. Milo 3-in-1"
          value={f.name}
          onChange={(event) =>
            set(
              'name',
              event.target.value
            )
          }
          disabled={saving}
          required
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
            fullWidth
            size="small"
            label="Category"
            value={
              f.cat ||
              f.category ||
              ''
            }
            onChange={(event) =>
              set(
                'cat',
                event.target.value
              )
            }
            disabled={saving}
          >
            {CATEGORIES.slice(
              1
            ).map((category) => (
              <MenuItem
                key={category}
                value={category}
              >
                {category}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Unit"
            value={
              f.unit || 'pc'
            }
            onChange={(event) =>
              set(
                'unit',
                event.target.value
              )
            }
            disabled={saving}
          >
            {UNITS.map((unit) => (
              <MenuItem
                key={unit}
                value={unit}
              >
                {unit}
              </MenuItem>
            ))}
          </TextField>
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
          <TextField
            fullWidth
            size="small"
            label="SKU"
            placeholder="Optional SKU"
            value={f.sku || ''}
            onChange={(event) =>
              set(
                'sku',
                event.target.value
              )
            }
            disabled={saving}
          />

          <TextField
            fullWidth
            size="small"
            label="Barcode"
            placeholder="Scan or type barcode"
            value={
              f.barcode || ''
            }
            onChange={(event) =>
              set(
                'barcode',
                event.target.value
              )
            }
            disabled={saving}
          />
        </Box>

        <Divider />

        {/* Pricing */}
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight={600}
        >
          Pricing
        </Typography>

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
            fullWidth
            size="small"
            type="number"
            label="Cost price"
            value={f.cost}
            onChange={(event) =>
              set(
                'cost',
                event.target.value
              )
            }
            disabled={saving}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  ₱
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            size="small"
            type="number"
            label="Selling price"
            value={f.price}
            onChange={(event) =>
              set(
                'price',
                event.target.value
              )
            }
            disabled={saving}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  ₱
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TextField
          fullWidth
          size="small"
          type="number"
          label="Wholesale price"
          value={
            f.wholesalePrice ??
            ''
          }
          onChange={(event) =>
            set(
              'wholesalePrice',
              event.target.value
            )
          }
          disabled={saving}
          helperText="Optional lower price for resellers or bulk buyers."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                ₱
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!f.isBulk}
              onChange={(event) =>
                set(
                  'isBulk',
                  event.target.checked
                )
              }
              disabled={saving}
            />
          }
          label="This product also comes in bulk (e.g. a box)"
        />

        <Divider />

        {/* Inventory */}
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight={600}
        >
          Inventory settings
        </Typography>

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
            fullWidth
            size="small"
            type="number"
            label="Low stock reminder"
            value={
              f.minStock ??
              f.minimumStock ??
              0
            }
            onChange={(event) =>
              set(
                'minStock',
                event.target.value
              )
            }
            disabled={saving}
            helperText="Shows Low status when stock reaches this level."
          />

          <TextField
            fullWidth
            size="small"
            type="number"
            label="Initial quantity"
            value={f.stock}
            onChange={(event) =>
              set(
                'stock',
                event.target.value
              )
            }
            disabled={saving}
          />
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
          <TextField
            fullWidth
            size="small"
            type="date"
            label=""
            value={
              f.dateAdded || ''
            }
            onChange={(event) =>
              set(
                'dateAdded',
                event.target.value
              )
            }
            disabled={saving}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Date added"

          />

          <TextField
            fullWidth
            size="small"
            type="date"
            label=""
            value={
              f.expirationDate ||
              ''
            }
            onChange={(event) =>
              set(
                'expirationDate',
                event.target.value
              )
            }
            disabled={saving}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Expiration date (Optional)"
          />
        </Box>

        <Stack
          direction={{
            xs: 'column-reverse',
            sm: 'row',
          }}
          spacing={1}
          sx={{ pt: 1 }}
        >
          {onDelete && (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={
                <DeleteOutlineOutlined />
              }
              onClick={onDelete}
              disabled={saving}
            >
              Delete Product
            </Button>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={
              <SaveOutlined />
            }
            onClick={submit}
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : product
                ? 'Save changes'
                : 'Add product'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

function StockInForm({
  product,
  suppliers,
  onSave,
  saving,
}) {
  const [qty, setQty] =
    useState('')

  const [cost, setCost] =
    useState(product.cost)

  const [supplierId, setSupplierId] =
    useState('')

  const [ref, setRef] =
    useState('')

  const [notes, setNotes] =
    useState('')

  const submit = () => {
    const q = Number(qty)

    if (!q || q <= 0) {
      alert(
        'Enter a valid quantity'
      )
      return
    }

    onSave({
      qty: q,
      cost:
        Number(cost) ||
        product.cost,
      supplierId,
      ref,
      notes,
    })
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 600,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ pr: 4 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor:
              'success.light',
            color:
              'success.dark',
            width: 44,
            height: 44,
          }}
        >
          <AddShoppingCartOutlined />
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Stock In
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {product.name}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <Stack spacing={2}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'success.light',
          }}
        >
          <Typography
            variant="caption"
            color="success.dark"
          >
            Current stock
          </Typography>

          <Stack
            direction="row"
            alignItems="baseline"
            spacing={1}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              color="success.dark"
            >
              {product.stock}
            </Typography>

            <Typography
              variant="body2"
              color="success.dark"
            >
              {product.unit ||
                'pc'}
            </Typography>
          </Stack>
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
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Quantity to add"
            value={qty}
            onChange={(event) =>
              setQty(
                event.target.value
              )
            }
            disabled={saving}
            autoFocus
          />

          <TextField
            fullWidth
            size="small"
            type="number"
            label="Cost per unit"
            value={cost}
            onChange={(event) =>
              setCost(
                event.target.value
              )
            }
            disabled={saving}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  ₱
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TextField
          select
          fullWidth
          size="small"
          label="Supplier"
          value={supplierId}
          onChange={(event) =>
            setSupplierId(
              event.target.value
            )
          }
          disabled={saving}
        >
          <MenuItem value="">
            — None —
          </MenuItem>

          {suppliers.map(
            (supplier) => (
              <MenuItem
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </MenuItem>
            )
          )}
        </TextField>

        <TextField
          fullWidth
          size="small"
          label="Reference number"
          placeholder="Optional invoice or receipt number"
          value={ref}
          onChange={(event) =>
            setRef(
              event.target.value
            )
          }
          disabled={saving}
        />

        <TextField
          fullWidth
          size="small"
          multiline
          minRows={3}
          label="Notes"
          placeholder="Optional notes about this stock-in"
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
          disabled={saving}
        />

        <Button
          variant="contained"
          color="success"
          size="large"
          fullWidth
          startIcon={
            <AddShoppingCartOutlined />
          }
          onClick={submit}
          disabled={saving}
        >
          {saving
            ? 'Adding Stock...'
            : 'Add Stock'}
        </Button>
      </Stack>
    </Box>
  )
}