import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getTheme } from '../theme'

const STORAGE_KEY = 'rms_theme_mode'
const ThemeModeContext = createContext({ mode: 'system', resolved: 'light', setMode: () => {} })

const readMode = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return ['light', 'dark', 'system'].includes(v) ? v : 'system'
  } catch {
    return 'system'
  }
}
const query = () => window.matchMedia('(prefers-color-scheme: dark)')

export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(readMode)
  const [systemDark, setSystemDark] = useState(() => query().matches)

  useEffect(() => {
    const mq = query()
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode
  const theme = useMemo(() => getTheme(resolved), [resolved])

  // Keeps the old CSS (legacy.css) in sync until every page is on MUI
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
  }, [resolved])

  const setMode = (next) => {
    setModeState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* storage unavailable */ }
  }

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export const useThemeMode = () => useContext(ThemeModeContext)