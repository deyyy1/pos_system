import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert, Avatar, Box, Button, CircularProgress, Divider, InputAdornment, Paper, Stack, TextField, Typography,
} from '@mui/material'
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined'
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlined from '@mui/icons-material/PhoneOutlined'
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined'

import {
  createStore,
  getCurrentStore,
} from '../services/storeService'
import { logout } from '../services/authService'

import { useStore } from '../store/useStore'

const peso = { startAdornment: <InputAdornment position="start">₱</InputAdornment> }
const money = { min: 0, step: '0.01' }

function SectionTitle({ title, subtitle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
    </Box>
  )
}

export default function StoreSetup() {
  const navigate = useNavigate()

  const setStore = useStore((state) => state.setStore)

  const [storeName, setStoreName] = useState('')
  const [address, setAddress] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [openingCash, setOpeningCash] = useState('0')
  const [openingGcash, setOpeningGcash] = useState('0')
  const [openingLoad, setOpeningLoad] = useState('0')
  const [openingCashVault, setOpeningCashVault] = useState('0')

  const [loading, setLoading] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState('')

  async function handleBack() {
    if (loading || leaving) return

    setLeaving(true)

    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (loading || leaving) {
      return
    }

    setError('')
    setLoading(true)

    try {
      // Create the store through the Supabase RPC
      const createdStore = await createStore({
        storeName: storeName.trim(),
        address: address.trim(),
        contactNumber: contactNumber.trim(),

        openingCash: Number(openingCash) || 0,
        openingGcash: Number(openingGcash) || 0,
        openingLoad: Number(openingLoad) || 0,
        openingCashVault: Number(openingCashVault) || 0,
      })

      console.log('Store created:', createdStore)

      // Retrieve the complete store together with
      // the authenticated user's membership.
      const currentStore = await getCurrentStore()

      if (!currentStore) {
        throw new Error(
          'Store was created, but could not be loaded for the current user.'
        )
      }

      console.log('Current store after setup:', currentStore)

      // Save the store in Zustand
      setStore(currentStore)

      // Go to dashboard
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Store creation failed:', error)

      setError(
        error?.message ||
        'Failed to create the store. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const busy = loading || leaving

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: { xs: 2, sm: 4 }, bgcolor: 'background.default' }}>
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 620, p: { xs: 3, sm: 4.5 }, borderRadius: 4 }}>
        <Button
          color="inherit"
          startIcon={<ArrowBackOutlined />}
          onClick={handleBack}
          disabled={busy}
          sx={{ mb: 2, ml: -1, color: 'text.secondary' }}
        >
          {leaving ? 'Signing out...' : 'Back to login'}
        </Button>

        <Stack alignItems="center" spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 52, height: 52, borderRadius: 3 }}>
            <StorefrontOutlined />
          </Avatar>
          <Typography variant="h5">Set up your store</Typography>
          <Typography color="text.secondary">Enter your store information to get started.</Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit}>
          <SectionTitle title="Store information" subtitle="This appears across the app and on receipts." />
          <Stack spacing={2}>
            <TextField
              label="Store name" value={storeName} onChange={(e) => setStoreName(e.target.value)}
              placeholder="Enter store name" required disabled={busy} autoFocus
              InputProps={{ startAdornment: <InputAdornment position="start"><StorefrontOutlined fontSize="small" /></InputAdornment> }}
            />
            <TextField
              label="Address" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter store address" required disabled={busy}
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnOutlined fontSize="small" /></InputAdornment> }}
            />
            <TextField
              label="Contact number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter contact number" disabled={busy}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined fontSize="small" /></InputAdornment> }}
            />
          </Stack>

          <Divider sx={{ my: 4 }} />

          <SectionTitle title="Opening balances" subtitle="Enter the starting balances of your store. You can leave any of them at zero." />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' } }}>
            <TextField label="Opening cash" type="number" inputProps={money} InputProps={peso}
              value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} disabled={busy} />
            <TextField label="Opening GCash" type="number" inputProps={money} InputProps={peso}
              value={openingGcash} onChange={(e) => setOpeningGcash(e.target.value)} disabled={busy} />
            <TextField label="Opening load" type="number" inputProps={money} InputProps={peso}
              value={openingLoad} onChange={(e) => setOpeningLoad(e.target.value)} disabled={busy} />
            <TextField label="Opening cash vault" type="number" inputProps={money} InputProps={peso}
              value={openingCashVault} onChange={(e) => setOpeningCashVault(e.target.value)} disabled={busy} />
          </Box>

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

          <Button type="submit" variant="contained" size="large" fullWidth disabled={busy} sx={{ mt: 3.5, minHeight: 50 }}>
            {loading ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CircularProgress size={20} color="inherit" />
                <span>Creating store...</span>
              </Stack>
            ) : 'Create store'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}