import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
  maxWidth = 'xs'
}) {
  return (
    <Dialog
      open={Boolean(open)}
      onClose={isLoading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: { xs: 1, sm: 1.5 }
        }
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ pb: 1, pt: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: isDestructive ? 'error.light' : 'action.hover',
              color: isDestructive ? 'error.main' : 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isDestructive ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
          </Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1 }}>
        <Typography id="confirm-dialog-description" variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5, pt: 1, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isLoading}
          sx={{
            minWidth: 80,
            borderRadius: 1
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
          color={isDestructive ? 'error' : 'primary'}
          sx={{
            minWidth: 100,
            borderRadius: 1,
            fontWeight: 700
          }}
        >
          {isLoading ? <CircularProgress size={16} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
