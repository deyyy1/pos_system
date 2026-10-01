import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined'
import GoogleIcon from '@mui/icons-material/Google'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (loginError) {
        throw loginError
      }

      console.log(
        'Email login successful:',
        data.user
      )

      navigate('/', { replace: true })
    } catch (error) {
      console.error('Login failed:', error)

      setError(
        error?.message ||
          'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
  console.log('GOOGLE: Button clicked')

  setError('')
  setGoogleLoading(true)

  try {
    console.log(
      'GOOGLE: Starting OAuth...'
    )

    const {
      data,
      error: googleError,
    } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            `${window.location.origin}/`,
        },
      })

    console.log(
      'GOOGLE: OAuth response:',
      data
    )

    console.log(
      'GOOGLE: OAuth error:',
      googleError
    )

    if (googleError) {
      throw googleError
    }

    console.log(
      'GOOGLE: Browser should now redirect to Google.'
    )
  } catch (error) {
    console.error(
      'GOOGLE: Authentication failed:',
      error
    )

    setError(
      error?.message ||
        'Unable to continue with Google'
    )

    setGoogleLoading(false)
  }
}

  const isLoading =
    loading || googleLoading

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 400,
          p: {
            xs: 3,
            sm: 4,
          },
          borderRadius: 4,
        }}
      >
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ mb: 3 }}
        >
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
            }}
          >
            <StorefrontOutlined />
          </Avatar>

          <Typography
            variant="h5"
            fontWeight={700}
          >
            Tindahan POS
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            Sign in to manage your store
          </Typography>
        </Stack>

        <Box
          component="form"
          onSubmit={handleLogin}
        >
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              disabled={isLoading}
              autoComplete="email"
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              disabled={isLoading}
              autoComplete="current-password"
              fullWidth
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              fullWidth
            >
              {loading ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                'Sign in'
              )}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            OR
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={
            googleLoading ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              <GoogleIcon />
            )
          }
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {googleLoading
            ? 'Connecting to Google...'
            : 'Continue with Google'}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
          display="block"
          sx={{ mt: 2 }}
        >
          Use your Google account to register
          or sign in.
        </Typography>
      </Paper>
    </Box>
  )
}

