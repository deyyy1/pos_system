import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  AppBar, Avatar, BottomNavigation, BottomNavigationAction, Box, Divider, Drawer, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Paper, Toolbar, Tooltip,
  Typography, useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import PointOfSaleOutlined from '@mui/icons-material/PointOfSaleOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import PhoneAndroidOutlined from '@mui/icons-material/PhoneAndroidOutlined'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import BarChartOutlined from '@mui/icons-material/BarChartOutlined'
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined'
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import MenuOutlined from '@mui/icons-material/MenuOutlined'
import LockOutlined from '@mui/icons-material/LockOutlined'
import { useStore } from '../store/useStore'
import { logout } from '../services/authService'

const W = 240
const GROUPS = [
  { label: 'Overview', items: [{ to: '/', icon: <DashboardOutlined />, label: 'Dashboard', end: true }] },
  { label: 'Sales', items: [
    { to: '/pos', icon: <PointOfSaleOutlined />, label: 'POS' },
    { to: '/transactions', icon: <ReceiptLongOutlined />, label: 'Transactions' },
    { to: '/utang', icon: <MenuBookOutlined />, label: 'Utang' },
  ] },
  { label: 'Store', items: [
    { to: '/inventory', icon: <Inventory2Outlined />, label: 'Inventory' },
    { to: '/load', icon: <PhoneAndroidOutlined />, label: 'Load' },
    { to: '/gcash', icon: <AccountBalanceWalletOutlined />, label: 'GCash' },
    { to: '/vault', icon: <LockOutlined />, label: 'Cash Vault' },
  ] },
  { label: 'Insights', items: [
    { to: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
    { to: '/more', icon: <MoreHorizOutlined />, label: 'More' },
  ] },
]
const BOTTOM = [
  { to: '/', icon: <DashboardOutlined />, label: 'Home' },
  { to: '/pos', icon: <PointOfSaleOutlined />, label: 'POS' },
  { to: '/inventory', icon: <Inventory2Outlined />, label: 'Stock' },
  { to: '/utang', icon: <MenuBookOutlined />, label: 'Utang' },
  { to: '/more', icon: <MoreHorizOutlined />, label: 'More' },
]

export default function Layout() {
  const { storeName, ownerName } = useStore()
  const { pathname } = useLocation()
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('md'))
  const [open, setOpen] = useState(false)

  const initial = (ownerName || storeName || 'T').trim().charAt(0).toUpperCase()
  const dateStr = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to))

  async function handleLogout() {
    try { await logout() } catch (error) { console.error('Logout failed:', error) }
  }

  const nav = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
          <StorefrontOutlined fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={700} noWrap>{storeName || 'Tindahan'}</Typography>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5 }}>
        {GROUPS.map((g) => (
          <List key={g.label} dense subheader={
            <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '28px', typography: 'overline' }}>
              {g.label}
            </ListSubheader>
          }>
            {g.items.map((n) => (
              <ListItemButton
                key={n.to} component={Link} to={n.to} selected={isActive(n.to)}
                onClick={() => setOpen(false)}
                sx={{
                  borderRadius: 2, mb: 0.25,
                  '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.dark' },
                  '&.Mui-selected .MuiListItemIcon-root': { color: 'primary.dark' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{n.icon}</ListItemIcon>
                <ListItemText primary={n.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
              </ListItemButton>
            ))}
          </List>
        ))}
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', color: 'primary.dark', fontSize: 15 }}>{initial}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>{ownerName || 'Store Owner'}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{storeName || 'Tindahan'}</Typography>
        </Box>
        <Tooltip title="Log out">
          <IconButton size="small" onClick={handleLogout} aria-label="Log out"><LogoutOutlined fontSize="small" /></IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant={desktop ? 'permanent' : 'temporary'}
        open={desktop || open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ width: desktop ? W : 0, '& .MuiDrawer-paper': { width: W, borderRight: '1px solid', borderColor: 'divider' } }}
      >
        {nav}
      </Drawer>

      <Box component="main" sx={{ flex: 1, minWidth: 0, pb: { xs: 9, md: 0 } }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Toolbar sx={{ gap: 1 }}>
            {!desktop && (
              <IconButton edge="start" onClick={() => setOpen(true)} aria-label="Open menu"><MenuOutlined /></IconButton>
            )}
            <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }} noWrap>{storeName || 'Tindahan'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>{dateStr}</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      {!desktop && (
        <Paper square sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid', borderColor: 'divider', pb: 'env(safe-area-inset-bottom)' }}>
          <BottomNavigation showLabels value={BOTTOM.find((b) => isActive(b.to))?.to ?? false}>
            {BOTTOM.map((b) => (
              <BottomNavigationAction key={b.to} value={b.to} label={b.label} icon={b.icon} component={Link} to={b.to} />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  )
}