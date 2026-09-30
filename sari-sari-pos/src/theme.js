import { createTheme } from '@mui/material/styles'

const palettes = {
  light: {
    primary: { main: '#0E9F6E', dark: '#087A55', light: '#E8F8F1', contrastText: '#FFFFFF' },
    secondary: { main: '#2563EB', dark: '#1D4ED8', light: '#EFF6FF', contrastText: '#FFFFFF' },
    success: { main: '#12B76A', light: '#ECFDF3', dark: '#039855' },
    warning: { main: '#F79009', light: '#FFFAEB', dark: '#DC6803' },
    error: { main: '#D92D20', light: '#FEF3F2', dark: '#B42318' },
    info: { main: '#2E90FA', light: '#EFF8FF', dark: '#1570EF' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#101828', secondary: '#667085', disabled: '#98A2B3' },
    divider: '#EAECF0',
  },
  dark: {
    // In dark mode "primary.dark" is a lighter green so text using it stays readable
    primary: { main: '#12B981', dark: '#34D399', light: '#0E2620', contrastText: '#062016' },
    secondary: { main: '#60A5FA', dark: '#93C5FD', light: '#152238', contrastText: '#0B1220' },
    success: { main: '#32D583', light: '#0E2620', dark: '#6CE9A6' },
    warning: { main: '#FDB022', light: '#2C2210', dark: '#FEC84B' },
    error: { main: '#F97066', light: '#2B1414', dark: '#FDA29B' },
    info: { main: '#53B1FD', light: '#152238', dark: '#84CAFF' },
    background: { default: '#0D0F14', paper: '#171A22' },
    text: { primary: '#F1F3F6', secondary: '#9AA1AB', disabled: '#6B7280' },
    divider: '#262A34',
  },
}

export function getTheme(mode = 'light') {
  const dark = mode === 'dark'

  const base = createTheme({
    palette: { mode, ...palettes[mode] },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h5: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h6: { fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.3 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { lineHeight: 1.55 },
      body2: { lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
      overline: { fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.6 },
    },
    shadows: Array.from({ length: 25 }, (_, i) =>
      i === 0 ? 'none' : `0 ${i * 2}px ${i * 4}px rgba(${dark ? '0,0,0' : '16,24,40'},${Math.min(0.04 + i * 0.005, dark ? 0.5 : 0.19)})`
    ),
  })

  const p = base.palette
  const line = dark ? '#3A4050' : '#D0D5DD'
  const lineHover = dark ? '#5A6272' : '#98A2B3'

  return createTheme(base, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          'html, body': { overflowX: 'hidden', maxWidth: '100%' },
          '*': { scrollbarWidth: 'thin', scrollbarColor: `${line} transparent` },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { borderColor: p.divider, borderRadius: 14, backgroundColor: p.background.paper } },
      },
      MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { minHeight: 40, borderRadius: 10, padding: '8px 16px', '&:active': { transform: 'translateY(1px)' } },
          outlined: { borderColor: line, '&:hover': { borderColor: lineHover, backgroundColor: p.action.hover } },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: p.background.paper,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: line },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: lineHover },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1.5, borderColor: p.primary.main },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${dark ? 'rgba(18,185,129,0.18)' : 'rgba(14,159,110,0.10)'}` },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { color: p.text.secondary, '&.Mui-focused': { color: p.primary.main } } },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
      MuiTableContainer: {
        styleOverrides: { root: { border: `1px solid ${p.divider}`, borderRadius: 14, backgroundColor: p.background.paper } },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: dark ? '#12151C' : '#F9FAFB',
            '& .MuiTableCell-head': { color: p.text.secondary, fontWeight: 600, fontSize: '0.78rem', borderBottom: `1px solid ${p.divider}` },
          },
        },
      },
      MuiTableCell: { styleOverrides: { root: { borderColor: p.divider } } },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-selected': {
              backgroundColor: p.primary.light,
              color: p.primary.dark,
              '&:hover': { backgroundColor: p.primary.light },
              '& .MuiListItemIcon-root': { color: p.primary.main },
            },
          },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: p.divider } } },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 18, border: `1px solid ${p.divider}`, backgroundImage: 'none' },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: dark ? '#2A2F3A' : '#101828', borderRadius: 8, fontSize: '0.75rem', padding: '7px 10px' },
          arrow: { color: dark ? '#2A2F3A' : '#101828' },
        },
      },
      MuiAlert: { styleOverrides: { root: { borderRadius: 10, border: '1px solid' } } },
    },
  })
}

export const theme = getTheme('light')
export default theme