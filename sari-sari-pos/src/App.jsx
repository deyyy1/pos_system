import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import Layout from './components/Layout'
import Login from './pages/Login'
import StoreSetup from './pages/StoreSetup'
import ProtectedRoute from './components/ProtectedRoute'

import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Inventory from './pages/Inventory'
import Load from './pages/Load'
import GCash from './pages/GCash'
import Utang from './pages/Utang'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import More from './pages/More'

import { supabase } from './lib/supabase'
import { getCurrentStore } from './services/storeService'
import { useStore } from './store/useStore'

function AppInitializer() {
  const navigate = useNavigate()
  const location = useLocation()

  const setStore = useStore((state) => state.setStore)
  const loadAllStoreData = useStore(
    (state) => state.loadAllStoreData
  )

  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadAuthenticatedStore() {
      try {
        console.log(
          'APP: Starting application initialization...'
        )

        console.log(
          'APP: Checking current Supabase session...'
        )

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!mounted) {
          return
        }

        console.log(
          'APP: Current session:',
          session
        )

        /*
         * ==========================================================
         * NO AUTHENTICATED USER
         * ==========================================================
         */

        if (!session?.user) {
          console.log(
            'APP: No authenticated user.'
          )

          setStore(null)

          if (location.pathname !== '/login') {
            navigate('/login', {
              replace: true,
            })
          }

          return
        }

        const user = session.user

        console.log(
          'APP: Authenticated user:',
          user
        )

        console.log(
          'APP: Authenticated user ID:',
          user.id
        )

        console.log(
          'APP: Authenticated email:',
          user.email
        )

        /*
         * ==========================================================
         * GET STORE BELONGING TO THIS USER
         * ==========================================================
         */

        console.log(
          'APP: Looking for current store...'
        )

        const currentStore =
          await getCurrentStore()

        if (!mounted) {
          return
        }

        console.log(
          'APP: CURRENT STORE RESULT:',
          currentStore
        )

        /*
         * ==========================================================
         * USER HAS NO STORE
         * ==========================================================
         */

        if (!currentStore) {
          console.log(
            'APP: No store found for this user.'
          )

          setStore(null)

          if (
            location.pathname !==
            '/setup-store'
          ) {
            navigate('/setup-store', {
              replace: true,
            })
          }

          return
        }

        /*
         * ==========================================================
         * STORE FOUND
         * ==========================================================
         */

        const storeId =
          currentStore.storeId

        console.log(
          'APP: Store found successfully.'
        )

        console.log(
          'APP: Store ID:',
          storeId
        )

        console.log(
          'APP: Store name:',
          currentStore.store_name
        )

        console.log(
          'APP: Store role:',
          currentStore.role
        )

        /*
         * ==========================================================
         * SET ACTIVE STORE
         * ==========================================================
         *
         * This establishes:
         *
         * authenticated user
         *        ↓
         * current store
         *        ↓
         * Zustand storeId
         */

        setStore(currentStore)

        console.log(
          'APP: Store loaded into Zustand.'
        )

        /*
         * ==========================================================
         * LOAD ALL DATA FOR THIS STORE
         * ==========================================================
         */

        console.log(
          'APP: Loading all store data for:',
          storeId
        )

        await loadAllStoreData(storeId)

        if (!mounted) {
          return
        }

        console.log(
          'APP: All store data loaded successfully.'
        )

        /*
         * ==========================================================
         * REDIRECT TO MAIN APP
         * ==========================================================
         */

        if (
          location.pathname === '/login' ||
          location.pathname === '/setup-store'
        ) {
          navigate('/', {
            replace: true,
          })
        }

        console.log(
          'APP: Application initialization complete.'
        )
      } catch (error) {
        console.error(
          'APP: Application initialization failed:',
          error
        )

        if (!mounted) {
          return
        }

        setStore(null)

        /*
         * Do not treat database/RLS/network errors as
         * "no store". Send the user to login so the
         * application does not display stale data.
         */

        if (location.pathname !== '/login') {
          navigate('/login', {
            replace: true,
          })
        }
      } finally {
        if (mounted) {
          setInitializing(false)
        }
      }
    }

    loadAuthenticatedStore()

    /*
     * ==========================================================
     * AUTH STATE LISTENER
     * ==========================================================
     */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(
            'APP AUTH EVENT:',
            event
          )

          console.log(
            'APP AUTH SESSION:',
            session
          )

          if (!mounted) {
            return
          }

          /*
           * ======================================================
           * SIGNED OUT
           * ======================================================
           */

          if (
            event === 'SIGNED_OUT' ||
            !session
          ) {
            console.log(
              'APP: User signed out.'
            )

            setStore(null)

            if (
              location.pathname !==
              '/login'
            ) {
              navigate('/login', {
                replace: true,
              })
            }

            return
          }

          /*
           * ======================================================
           * SIGNED IN / TOKEN REFRESH / USER UPDATE
           * ======================================================
           */

          if (
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'USER_UPDATED'
          ) {
            try {
              console.log(
                'APP: Reloading store for authenticated user...'
              )

              const currentStore =
                await getCurrentStore()

              if (!mounted) {
                return
              }

              console.log(
                'APP: CURRENT STORE AFTER AUTH EVENT:',
                currentStore
              )

              /*
               * User has no store.
               */

              if (!currentStore) {
                setStore(null)

                if (
                  location.pathname !==
                  '/setup-store'
                ) {
                  navigate(
                    '/setup-store',
                    {
                      replace: true,
                    }
                  )
                }

                return
              }

              const storeId =
                currentStore.storeId

              /*
               * IMPORTANT:
               *
               * Replace the active store before loading
               * any application data.
               */

              setStore(currentStore)

              console.log(
                'APP: Active store updated:',
                storeId
              )

              /*
               * Reload all data belonging ONLY to this store.
               */

              await loadAllStoreData(
                storeId
              )

              if (!mounted) {
                return
              }

              console.log(
                'APP: Store data refreshed:',
                storeId
              )

              if (
                location.pathname ===
                  '/login' ||
                location.pathname ===
                  '/setup-store'
              ) {
                navigate('/', {
                  replace: true,
                })
              }
            } catch (error) {
              console.error(
                'APP: Failed to reload current store:',
                error
              )
            }
          }
        }
      )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [
    navigate,
    location.pathname,
    setStore,
    loadAllStoreData,
  ])

  /*
   * ============================================================
   * INITIALIZATION SCREEN
   * ============================================================
   */

  if (initializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
        }}
      >
        Loading...
      </div>
    )
  }

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer />

      <Routes>
        {/* ======================================================
            PUBLIC
            ====================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ======================================================
            PROTECTED
            ====================================================== */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/setup-store"
            element={<StoreSetup />}
          />

          {/* ====================================================
              MAIN APPLICATION
              ==================================================== */}

          <Route element={<Layout />}>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/pos"
              element={<POS />}
            />

            <Route
              path="/inventory"
              element={<Inventory />}
            />

            <Route
              path="/load"
              element={<Load />}
            />

            <Route
              path="/gcash"
              element={<GCash />}
            />

            <Route
              path="/utang"
              element={<Utang />}
            />

            <Route
              path="/transactions"
              element={<Transactions />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/more"
              element={<More />}
            />
          </Route>
        </Route>

        {/* ======================================================
            FALLBACK
            ====================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}