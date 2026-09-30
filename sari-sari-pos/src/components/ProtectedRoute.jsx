import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      try {
        console.log(
          'PROTECTED: Checking session...'
        )

        const {
          data,
          error,
        } =
          await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!mounted) {
          return
        }

        console.log(
          'PROTECTED: Session:',
          data?.session
        )

        setSession(data?.session || null)
        setLoading(false)
      } catch (error) {
        console.error(
          'PROTECTED: Failed to check authentication:',
          error
        )

        if (mounted) {
          setSession(null)
          setLoading(false)
        }
      }
    }

    checkSession()

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log(
            'PROTECTED AUTH EVENT:',
            event
          )

          console.log(
            'PROTECTED AUTH SESSION:',
            newSession
          )

          if (!mounted) {
            return
          }

          setSession(
            newSession || null
          )

          setLoading(false)
        }
      )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        Loading...
      </div>
    )
  }

  if (!session) {
    console.log(
      'PROTECTED: No session. Redirecting to login.'
    )

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet />
}