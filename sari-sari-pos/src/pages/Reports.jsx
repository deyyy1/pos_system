import {
  Box,
  Card,
  CardContent,
  Avatar,
  Stack,
  Typography,
  Chip,
  Divider,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'

import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined'
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import SpeedOutlined from '@mui/icons-material/SpeedOutlined'
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined'
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined'
import HandshakeOutlined from '@mui/icons-material/HandshakeOutlined'
import LocalPhoneOutlined from '@mui/icons-material/LocalPhoneOutlined'
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined'
import SavingsOutlined from '@mui/icons-material/SavingsOutlined'

import { useStore } from '../store/useStore'
import { money } from '../utils/format'

export default function Reports() {
  const {
    sales,
    loadTxns,
    gcashTxns,
    expenses,
    products,
    cash,
    gcashBalance,
    smartLoadBalance,
    globeLoadBalance,
    cashVault,
  } = useStore()

  // --------------------------------------------------
  // SALES
  // --------------------------------------------------

  // Only completed sales are included in reports.
  const validSales = sales.filter(
    (sale) => sale.status !== 'Voided'
  )

  // --------------------------------------------------
  // SALES BY DAY
  // --------------------------------------------------

  const byDay = {}

  validSales.forEach((sale) => {
    const date = sale.ts?.slice(0, 10)

    if (!date) return

    byDay[date] =
      (byDay[date] || 0) +
      Number(sale.total || 0)
  })

  const days = Object.keys(byDay)
    .sort()
    .reverse()
    .slice(0, 7)

  // --------------------------------------------------
  // PRODUCT ANALYSIS
  // --------------------------------------------------

  const productAgg = {}

  validSales.forEach((sale) => {
    ;(sale.items || []).forEach((item) => {
      const name = item.name || 'Unknown Product'

      if (!productAgg[name]) {
        productAgg[name] = {
          qty: 0,
          revenue: 0,
          profit: 0,
        }
      }

      const qty = Number(item.qty || 0)
      const price = Number(item.price || 0)
      const cost = Number(item.cost || 0)

      productAgg[name].qty += qty

      productAgg[name].revenue +=
        price * qty

      productAgg[name].profit +=
        (price - cost) * qty
    })
  })

  const byQty = Object.entries(
    productAgg
  ).sort(
    (a, b) =>
      b[1].qty - a[1].qty
  )

  const best = byQty.slice(0, 5)

  const slow = byQty
    .slice(-5)
    .reverse()

  const mostProfitable = Object.entries(
    productAgg
  )
    .sort(
      (a, b) =>
        b[1].profit - a[1].profit
    )
    .slice(0, 5)

  // --------------------------------------------------
  // SALES / PROFIT
  // --------------------------------------------------

  const totalRevenue = validSales.reduce(
    (sum, sale) =>
      sum + Number(sale.total || 0),
    0
  )

  const cogs = validSales.reduce(
    (sum, sale) =>
      sum +
      (sale.items || []).reduce(
        (itemTotal, item) =>
          itemTotal +
          Number(item.cost || 0) *
            Number(item.qty || 0),
        0
      ),
    0
  )

  // --------------------------------------------------
  // LOAD
  // --------------------------------------------------

  const loadProfit = loadTxns
    .filter(
      (transaction) =>
        transaction.status ===
        'Successful'
    )
    .reduce(
      (sum, transaction) =>
        sum +
        Number(transaction.profit || 0),
      0
    )

  // --------------------------------------------------
  // GCASH FEES
  // --------------------------------------------------

  const gcashFees = gcashTxns.reduce(
    (sum, transaction) =>
      sum +
      Number(transaction.fee || 0),
    0
  )

  // --------------------------------------------------
  // EXPENSES
  // --------------------------------------------------

  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum +
      Number(expense.amount || 0),
    0
  )

  // --------------------------------------------------
  // NET PROFIT
  // --------------------------------------------------

  const netProfit =
    totalRevenue -
    cogs +
    loadProfit +
    gcashFees -
    totalExpenses

  // --------------------------------------------------
  // INVENTORY VALUE
  // --------------------------------------------------

  const invValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.cost || 0) *
        Number(product.stock || 0),
    0
  )

  // --------------------------------------------------
  // PAYMENT METHODS
  // --------------------------------------------------

  const cashMethod = validSales
    .filter(
      (sale) => sale.method === 'Cash'
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    )

  const gcashMethod = validSales
    .filter(
      (sale) => sale.method === 'GCash'
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    )

  const utangMethod = validSales
    .filter(
      (sale) => sale.method === 'Utang'
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    )

  // --------------------------------------------------
  // REUSABLE COMPONENTS
  // --------------------------------------------------

  const SectionHeader = ({
    icon,
    title,
    subtitle,
  }) => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
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
            sx={{ mt: 0.25 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  )

  const StatCard = ({
    icon,
    label,
    value,
    tone = 'primary',
  }) => (
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
      <CardContent sx={{ p: 2.25 }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor:
                tone === 'success'
                  ? 'success.main'
                  : tone === 'warning'
                    ? 'warning.main'
                    : tone === 'info'
                      ? 'info.main'
                      : 'primary.main',
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
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )

  const ReportTable = ({
    title,
    subtitle,
    icon,
    head,
    rows,
    empty,
  }) => (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        <SectionHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
        />

        <Divider sx={{ mb: 2 }} />

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: 420,
            overflowY: 'auto',
            overflowX: 'auto',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <MuiTable
            stickyHeader
            size="medium"
            sx={{
              minWidth: 520,
            }}
          >
            <TableHead>
              <TableRow>
                {head.map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      bgcolor: 'background.paper',
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows}
            </TableBody>
          </MuiTable>
        </TableContainer>

        {rows.length === 0 && (
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
            <AssessmentOutlined
              sx={{
                fontSize: 42,
                opacity: 0.45,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {empty}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        pb: 3,
      }}
    >
      {/* ---------------------------------------- */}
      {/* PAGE HEADER */}
      {/* ---------------------------------------- */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(25,118,210,0.10), rgba(25,118,210,0.03))',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={2}
            alignItems={{
              xs: 'flex-start',
              sm: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: 'primary.main',
              }}
            >
              <AssessmentOutlined />
            </Avatar>

            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
              >
                Reports
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Review sales, profitability,
                services, inventory, and
                current balances.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ---------------------------------------- */}
      {/* SUMMARY */}
      {/* ---------------------------------------- */}

      <SectionHeader
        icon={<TrendingUpOutlined />}
        title="Summary"
        subtitle="Overall sales and profitability"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          icon={<ReceiptLongOutlined />}
          label="Sales Revenue"
          value={money(totalRevenue)}
          tone="primary"
        />

        <StatCard
          icon={<ShoppingBagOutlined />}
          label="Cost of Goods Sold"
          value={money(cogs)}
          tone="info"
        />

        <StatCard
          icon={<PaymentsOutlined />}
          label="Total Expenses"
          value={money(totalExpenses)}
          tone="warning"
        />

        <StatCard
          icon={<TrendingUpOutlined />}
          label="Est. Net Profit"
          value={money(netProfit)}
          tone="success"
        />
      </Box>

      {/* ---------------------------------------- */}
      {/* SALES BY DAY */}
      {/* ---------------------------------------- */}

      <Box sx={{ mb: 4 }}>
        <ReportTable
          title="Sales by Day"
          subtitle="Sales revenue from the most recent seven recorded sales days"
          icon={<TrendingUpOutlined />}
          head={['Date', 'Sales']}
          empty="No sales yet."
          rows={days.map((date) => (
            <TableRow key={date}>
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                {date}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {money(byDay[date])}
              </TableCell>
            </TableRow>
          ))}
        />
      </Box>

      {/* ---------------------------------------- */}
      {/* PAYMENT METHODS */}
      {/* ---------------------------------------- */}

      <SectionHeader
        icon={<PaymentsOutlined />}
        title="Payment Methods"
        subtitle="Sales grouped by payment method"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          icon={<AttachMoneyOutlined />}
          label="Cash"
          value={money(cashMethod)}
          tone="success"
        />

        <StatCard
          icon={<CreditCardOutlined />}
          label="GCash"
          value={money(gcashMethod)}
          tone="info"
        />

        <StatCard
          icon={<HandshakeOutlined />}
          label="Utang"
          value={money(utangMethod)}
          tone="warning"
        />
      </Box>

      {/* ---------------------------------------- */}
      {/* BEST SELLING */}
      {/* ---------------------------------------- */}

      <Box sx={{ mb: 4 }}>
        <ReportTable
          title="Best-Selling Products"
          subtitle="Products with the highest quantities sold"
          icon={<SpeedOutlined />}
          head={[
            'Product',
            'Qty Sold',
          ]}
          empty="No sales yet."
          rows={best.map(
            ([name, value]) => (
              <TableRow key={name}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {name}
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {value.qty}
                </TableCell>
              </TableRow>
            )
          )}
        />
      </Box>

      {/* ---------------------------------------- */}
      {/* MOST PROFITABLE */}
      {/* ---------------------------------------- */}

      <Box sx={{ mb: 4 }}>
        <ReportTable
          title="Most Profitable Products"
          subtitle="Products generating the highest estimated profit"
          icon={<TrendingUpOutlined />}
          head={[
            'Product',
            'Profit',
          ]}
          empty="No sales yet."
          rows={mostProfitable.map(
            ([name, value]) => (
              <TableRow key={name}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {name}
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'success.main',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {money(value.profit)}
                </TableCell>
              </TableRow>
            )
          )}
        />
      </Box>

      {/* ---------------------------------------- */}
      {/* SLOW MOVING */}
      {/* ---------------------------------------- */}

      <Box sx={{ mb: 4 }}>
        <ReportTable
          title="Slow-Moving Products"
          subtitle="Products with the lowest recorded quantities sold"
          icon={<Inventory2Outlined />}
          head={[
            'Product',
            'Qty Sold',
          ]}
          empty="No sales yet."
          rows={slow.map(
            ([name, value]) => (
              <TableRow key={name}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {name}
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {value.qty}
                </TableCell>
              </TableRow>
            )
          )}
        />
      </Box>

      {/* ---------------------------------------- */}
      {/* SERVICES */}
      {/* ---------------------------------------- */}

      <SectionHeader
        icon={<LocalPhoneOutlined />}
        title="Services"
        subtitle="Profit generated by load and GCash services"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          icon={<LocalPhoneOutlined />}
          label="Load Profit"
          value={money(loadProfit)}
          tone="info"
        />

        <StatCard
          icon={<AccountBalanceWalletOutlined />}
          label="GCash Service Fees"
          value={money(gcashFees)}
          tone="success"
        />
      </Box>

      {/* ---------------------------------------- */}
      {/* INVENTORY VALUE */}
      {/* ---------------------------------------- */}

      <SectionHeader
        icon={<Inventory2Outlined />}
        title="Inventory Value"
        subtitle="Estimated value based on product cost and current stock"
      />

      <Card
        sx={{
          borderRadius: 3,
          mb: 4,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.25,
              sm: 3,
            },
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={2}
            alignItems={{
              xs: 'flex-start',
              sm: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
              }}
            >
              <Inventory2Outlined />
            </Avatar>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
              >
                Current Inventory Value
              </Typography>

              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  mt: 0.5,
                  wordBreak: 'break-word',
                }}
              >
                {money(invValue)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ---------------------------------------- */}
      {/* BALANCES */}
      {/* ---------------------------------------- */}

      <SectionHeader
        icon={<AccountBalanceOutlined />}
        title="Balances Snapshot"
        subtitle="Current operational balances"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          icon={<AttachMoneyOutlined />}
          label="Cash on Hand"
          value={money(cash)}
          tone="success"
        />

        <StatCard
          icon={<AccountBalanceWalletOutlined />}
          label="GCash Float"
          value={money(gcashBalance)}
          tone="info"
        />

        <StatCard
          icon={<LocalPhoneOutlined />}
          label="Smart Load"
          value={money(smartLoadBalance)}
          tone="primary"
        />

        <StatCard
          icon={<LocalPhoneOutlined />}
          label="Globe Load"
          value={money(globeLoadBalance)}
          tone="primary"
        />

        <StatCard
          icon={<SavingsOutlined />}
          label="Cash Vault"
          value={money(cashVault)}
          tone="warning"
        />
      </Box>

      {/* ---------------------------------------- */}
      {/* NOTE */}
      {/* ---------------------------------------- */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          bgcolor: 'action.hover',
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.75,
              sm: 2,
            },
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
          >
            <AssessmentOutlined
              color="action"
              sx={{
                flexShrink: 0,
              }}
            />

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Date-range filtering and
                PDF/Excel export aren't wired
                up yet — planned for a later
                pass.
              </Typography>
            </Box>

            <Chip
              label="Planned"
              size="small"
              variant="outlined"
              sx={{
                ml: {
                  sm: 'auto',
                },
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}