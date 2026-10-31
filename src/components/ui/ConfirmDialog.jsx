import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * ConfirmDialog
 * Accessible dialog with Esc to close, focus trap, and clean semantic action buttons.
 */
export default function ConfirmDialog({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  isDestructive = false,
  loading = false,
  icon: CustomIcon
}) {
  const Icon = CustomIcon || (isDestructive ? DeleteOutlineIcon : HelpOutlineIcon);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          p: 1,
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: isDestructive ? 'error.light' : 'warning.light',
              color: isDestructive ? 'error.main' : 'warning.dark',
              borderRadius: '8px'
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Avatar>
          <Typography variant="h3" sx={{ fontWeight: 600, color: 'slate.900', fontSize: '16px' }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <DialogContentText id="confirm-dialog-description" sx={{ color: 'slate.600', fontSize: '13px' }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderColor: 'slate.300',
            color: 'slate.700',
            borderRadius: '8px'
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            bgcolor: isDestructive ? 'error.main' : 'primary.main',
            '&:hover': {
              bgcolor: isDestructive ? 'error.dark' : 'primary.dark'
            },
            borderRadius: '8px',
            fontWeight: 600
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
