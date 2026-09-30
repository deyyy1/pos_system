import { Link } from 'react-router-dom'
import { Box, Card, CardContent, Typography } from '@mui/material'
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined'

const TONES = { warn: 'warning.main', danger: 'error.main' }

export default function StatCard({ label, value, tone, icon, to, toLabel, hero, onClick, sx }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .15s',
        '&:hover': onClick ? { borderColor: 'primary.main' } : undefined,
        ...(hero && { bgcolor: 'primary.light', borderColor: 'primary.main' }),
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="overline" color="text.secondary">{label}</Typography>
          {icon && <Box sx={{ color: hero ? 'primary.dark' : 'text.secondary', display: 'flex' }}>{icon}</Box>}
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ color: TONES[tone] || 'text.primary', letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
        {to && (
          <Typography
            component={Link} to={to} variant="caption"
            sx={{ mt: 1.5, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'primary.dark', fontWeight: 600, textDecoration: 'none' }}
          >
            {toLabel || 'View more'} <ArrowForwardOutlined sx={{ fontSize: 14 }} />
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}