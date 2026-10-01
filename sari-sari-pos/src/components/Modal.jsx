import { Dialog, DialogContent, IconButton } from '@mui/material'
import CloseOutlined from '@mui/icons-material/CloseOutlined'

export default function Modal({ children, onClose, maxWidth = 'xs' }) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={maxWidth}>
      <IconButton onClick={onClose} aria-label="Close" size="small" sx={{ position: 'absolute', top: 12, right: 12 }}>
        <CloseOutlined fontSize="small" />
      </IconButton>
      <DialogContent sx={{ pt: 3 }}>{children}</DialogContent>
    </Dialog>
  )
}